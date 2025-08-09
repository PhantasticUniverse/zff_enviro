#include "common.h"
#include <stdbool.h>
#include "region.h"
#include "region_grid.h"
#include <stddef.h> // This defines NULL
#include "stdio.h" // local shim for any external deps

enum {
    SOUP_WIDTH = 200,
    SOUP_HEIGHT = 200,
    TAPE_N = SOUP_WIDTH*SOUP_HEIGHT,
    SOUP_SIZE = TAPE_N*TAPE_LENGTH,
};

// Add this near the other BUFFER declarations
BUFFER(cell_to_region_map, int, SOUP_WIDTH * SOUP_HEIGHT)

// Make sure MAX_REGION_GRID_SIZE is defined, if not already
#ifndef MAX_REGION_GRID_SIZE
#define MAX_REGION_GRID_SIZE 16
#endif

BUFFER(soup, uint8_t, SOUP_SIZE)
BUFFER(counts, int, 256)
BUFFER(write_count, int, TAPE_N)
BUFFER(batch_pair_n, int, 1)
BUFFER(batch_idx, int, MAX_BATCH_PAIR_N*2)
BUFFER(batch, uint8_t, MAX_BATCH_PAIR_N*2*TAPE_LENGTH)
BUFFER(batch_write_count, int, MAX_BATCH_PAIR_N*2)
BUFFER(rng_state, uint64_t, 1)

// Region grid plane for bulk JS sync: [obstacle, dirN, dirE, dirS, dirW, randomness, temperature, energy]
BUFFER(region_grid_plane, float, MAX_REGION_GRID_SIZE*MAX_REGION_GRID_SIZE*8)

static bool use_global_effects = true;

// Add these global variables
static float global_temperature = 1.0f;
static float global_energy = 1.0f;
static float global_randomness = 0.0f;

WASM_EXPORT("get_tape_len") int get_tape_len() {return TAPE_LENGTH;}
WASM_EXPORT("get_soup_width") int get_soup_width() {return SOUP_WIDTH;}
WASM_EXPORT("get_soup_height") int get_soup_height() {return SOUP_HEIGHT;}

uint64_t rand64(/*uint64_t seed*/) {
  uint64_t z = (rng_state[0] += 0x9e3779b97f4a7c15);
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

// Add this function declaration
void update_mapping();

WASM_EXPORT("init")
void init(int seed) {
    rng_state[0] = seed;
    for (int i=0; i<TAPE_N*TAPE_LENGTH; ++i) {
        soup[i] = rand64();
    }
    // Ensure region grid is initialized with a sane default if needed
    int size = get_region_grid_size();
    if (size < MIN_REGION_GRID_SIZE || size > MAX_REGION_GRID_SIZE) {
        size = MIN_REGION_GRID_SIZE;
    }
    init_region_grid(size);
    
    // Initialize cell_to_region_map
    update_mapping();
}

// Update this function for more precise mapping
void update_mapping() {
    int region_grid_size = get_region_grid_size();
    if (region_grid_size <= 0) {
        // Handle invalid region grid size
        return;
    }
    
    float cells_per_region_x = (float)SOUP_WIDTH / region_grid_size;
    float cells_per_region_y = (float)SOUP_HEIGHT / region_grid_size;
    
    for (int y = 0; y < SOUP_HEIGHT; y++) {
        for (int x = 0; x < SOUP_WIDTH; x++) {
            int region_x = (int)(x / cells_per_region_x);
            int region_y = (int)(y / cells_per_region_y);
            int region_index = region_y * region_grid_size + region_x;
            cell_to_region_map[y * SOUP_WIDTH + x] = region_index;
        }
    }
}

// Update this function to use the new mapping
static inline Region* get_cell_region(int x, int y) {
    if (x < 0 || x >= SOUP_WIDTH || y < 0 || y >= SOUP_HEIGHT) {
        return NULL;
    }
    
    int region_idx = cell_to_region_map[y * SOUP_WIDTH + x];
    int region_grid_size = get_region_grid_size();
    int region_x = region_idx % region_grid_size;
    int region_y = region_idx / region_grid_size;
    
    return get_region(region_x, region_y);
}

// Remove the entire debug_print_mapping function
WASM_EXPORT("debug_print_mapping")
void debug_print_mapping() {
    // ... (remove entire function)
}

WASM_EXPORT("mutate")
void mutate(int n) {
    for (int i=0; i<n; ++i) {
        uint64_t rnd = rand64();
        uint8_t v = rnd&0xff; rnd >>= 8;
        int index = rnd % SOUP_SIZE;
        int x = (index / TAPE_LENGTH) % SOUP_WIDTH;
        int y = (index / TAPE_LENGTH) / SOUP_WIDTH;
        
        // Get the region for this cell
        Region* region = get_cell_region(x, y);
        
        // Only mutate if the cell is not in an obstacle region
        if (region && !region->is_obstacle) {
            soup[index] = v;
        }
    }
}

// Removed custom_powf; we will use simple averaging for global effects to avoid libm dependencies.

WASM_EXPORT("prepare_batch") int prepare_batch() {
    int pair_n = 0, collision_count=0, pos=0;
    uint8_t mask[TAPE_N] = {0};
    float sum_temperature = 0.0f;
    float sum_energy = 0.0f;
    float sum_randomness = 0.0f;

    while (pair_n<MAX_BATCH_PAIR_N && collision_count<16) {
        uint64_t rnd = rand64();
        int dir = (rnd&1)*2-1; rnd>>=1;
        int horizontal = rnd&1; rnd>>=1;
        int i = rnd % TAPE_N, j=i;
        if (mask[i]) { ++collision_count; continue;}

        // Get the region for cell i
        Region* region = get_cell_region(i % SOUP_WIDTH, i / SOUP_WIDTH);

        // Check if the cell is in an obstacle region
        if (region->is_obstacle) { ++collision_count; continue; }

        // Apply directional influence if non-neutral
        float dir_influence = horizontal ? 
            (region->directional_influence[EAST] - region->directional_influence[WEST]) :
            (region->directional_influence[SOUTH] - region->directional_influence[NORTH]);
        // local fabs for freestanding builds
        const float abs_dir_influence = dir_influence < 0.0f ? -dir_influence : dir_influence;
        if (dir_influence != 0.0f && (rand64() % 1000) < (uint64_t)(abs_dir_influence * 1000.0f)) {
            dir = dir_influence > 0 ? 1 : -1;
        }

        // Compute partner j (single attempt, original behavior)
        if (horizontal) {
            if (i % SOUP_WIDTH == 0)     { dir =  1; }
            if ((i+1) % SOUP_WIDTH == 0) { dir = -1; }
            j = i + dir;
        } else {
            if (i < SOUP_WIDTH)          { dir =  1; }
            if (TAPE_N-i-1 < SOUP_WIDTH) { dir = -1; }
            j = i + dir*SOUP_WIDTH;
        }

        // Bounds and mask check
        if (j < 0 || j >= TAPE_N || mask[j]) { ++collision_count; continue; }

        // Get the region for cell j and skip if obstacle (neutral by default)
        Region* region_j_ptr = get_cell_region(j % SOUP_WIDTH, j / SOUP_WIDTH);
        if (region_j_ptr->is_obstacle) { ++collision_count; continue; }

        mask[i] = mask[j] = 1;
        batch_idx[2*pair_n] = i;
        batch_idx[2*pair_n+1] = j;
        for (int k=0; k<TAPE_LENGTH; ++k) {
            batch[pos+k] = soup[i*TAPE_LENGTH+k];
            batch[pos+k+TAPE_LENGTH] = soup[j*TAPE_LENGTH+k];
        }
        pos += TAPE_LENGTH*2;
        pair_n++;
        collision_count = 0;

        // No random perturbation in default/original behavior
    }

    if (use_global_effects) {
        sum_temperature = 0.0f;
        sum_energy = 0.0f;
        sum_randomness = 0.0f;
        for (int i = 0; i < pair_n; i++) {
            int cell_idx = batch_idx[i*2];
            Region* region = get_cell_region(cell_idx % SOUP_WIDTH, cell_idx / SOUP_WIDTH);
            sum_temperature += region->temperature;
            sum_energy += region->energy_level;
            sum_randomness += region->randomness_factor;
        }
        if (pair_n > 0) {
            global_temperature = sum_temperature / (float)pair_n;
            global_energy = sum_energy / (float)pair_n;
            global_randomness = sum_randomness / (float)pair_n;
        } else {
            global_temperature = 1.0f;
            global_energy = 1.0f;
            global_randomness = 0.0f;
        }
    }

    batch_pair_n[0] = pair_n;
    return pair_n;
}

WASM_EXPORT("absorb_batch") int absorb_batch() {
    const uint8_t * src = batch;
    const int pair_n = batch_pair_n[0];

    // Restore original deterministic absorb semantics: always copy results back
    for (int i=0; i<pair_n*2; ++i) {
        const int tape_idx = batch_idx[i];
        uint8_t * dst = soup + tape_idx*TAPE_LENGTH;
        for (int k=0; k<TAPE_LENGTH; ++k, ++src, ++dst) {
            *dst = *src;
        }
        write_count[tape_idx] = batch_write_count[i];
    }
    return pair_n;
}

WASM_EXPORT("updateCounts")
void updateCounts() {
    for (int i=0; i<256; ++i) counts[i] = 0;
    for (int i=0; i<SOUP_SIZE; ++i) {
        counts[soup[i]]++;
    }
}

// Update this function to use the region_grid module
WASM_EXPORT("get_region_grid_size")
int get_exported_region_grid_size() {
    return get_region_grid_size();
}

// Update this function to use the region_grid module
WASM_EXPORT("get_region")
Region* get_exported_region(int x, int y) {
    return get_region(x, y);
}

// Update this function to use the region_grid module
WASM_EXPORT("set_region")
void set_exported_region(int x, int y, Region* region) {
    Region* target_region = get_region(x, y);
    if (target_region != NULL) {
        *target_region = *region;
    }
}

// Bulk region-grid plane synchronization
WASM_EXPORT("sync_regions_to_plane")
void sync_regions_to_plane(void) {
    serialize_regions_to_plane();
}

WASM_EXPORT("sync_plane_to_regions")
void sync_plane_to_regions(void) {
    deserialize_plane_to_regions();
}

WASM_EXPORT("set_region_obstacle")
void set_exported_region_obstacle(int x, int y, bool is_obstacle) {
    Region* region = get_region(x, y);
    if (region != NULL) {
        set_region_obstacle(region, is_obstacle);
    }
}

WASM_EXPORT("set_region_temperature")
void set_exported_region_temperature(int x, int y, float value) {
    Region* region = get_region(x, y);
    if (region) {
        set_region_temperature(region, value);
    }
}

WASM_EXPORT("set_region_energy")
void set_exported_region_energy(int x, int y, float value) {
    Region* region = get_region(x, y);
    if (region) {
        set_region_energy(region, value);
    }
}

WASM_EXPORT("set_region_directional_influence")
void set_exported_region_directional_influence(int x, int y, int direction, float value) {
    Region* region = get_region(x, y);
    if (region && direction >= 0 && direction < NUM_DIRECTIONS) {
        set_region_directional_influence(region, (Direction)direction, value);
    }
}

WASM_EXPORT("set_region_randomness")
void set_exported_region_randomness(int x, int y, float value) {
    Region* region = get_region(x, y);
    if (region) {
        set_region_randomness(region, value);
    }
}

WASM_EXPORT("get_region_obstacle")
bool get_exported_region_obstacle(int x, int y) {
    Region* region = get_region(x, y);
    return (region != NULL) ? get_region_obstacle(region) : false;
}

WASM_EXPORT("get_region_temperature")
float get_exported_region_temperature(int x, int y) {
    Region* region = get_region(x, y);
    return (region != NULL) ? get_region_temperature(region) : 0.0f;
}

WASM_EXPORT("get_region_energy")
float get_exported_region_energy(int x, int y) {
    Region* region = get_region(x, y);
    return (region != NULL) ? get_region_energy(region) : 0.0f;
}

WASM_EXPORT("get_region_directional_influence")
float get_exported_region_directional_influence(int x, int y, int direction) {
    Region* region = get_region(x, y);
    return (region != NULL) ? get_region_directional_influence(region, (Direction)direction) : 0.0f;
}

WASM_EXPORT("get_region_randomness")
float get_exported_region_randomness(int x, int y) {
    Region* region = get_region(x, y);
    return (region != NULL) ? get_region_randomness(region) : 0.0f;
}

// Add this new function to get the region for a cell
WASM_EXPORT("get_region_for_cell")
int get_region_for_cell(int x, int y) {
    if (x >= 0 && x < SOUP_WIDTH && y >= 0 && y < SOUP_HEIGHT) {
        return cell_to_region_map[y * SOUP_WIDTH + x];
    }
    return -1; // Invalid cell coordinates
}

// Update this function to prevent division by zero
WASM_EXPORT("init_region_grid")
void init_exported_region_grid(int size) {
    if (size < MIN_REGION_GRID_SIZE || size > MAX_REGION_GRID_SIZE) {
        // Handle invalid size, set to a default value
        size = MIN_REGION_GRID_SIZE;
    }
    init_region_grid(size);
    update_mapping();
}

WASM_EXPORT("toggle_global_effects")
void toggle_global_effects(bool enable) {
    use_global_effects = enable;
}

// Add these exported functions to get global effects
WASM_EXPORT("get_global_temperature") float get_global_temperature() { return global_temperature; }
WASM_EXPORT("get_global_energy") float get_global_energy() { return global_energy; }
WASM_EXPORT("get_global_randomness") float get_global_randomness() { return global_randomness; }

// Add these functions near the other global effect functions
WASM_EXPORT("set_global_temperature")
void set_global_temperature(float value) {
    global_temperature = value;
}

WASM_EXPORT("set_global_energy")
void set_global_energy(float value) {
    global_energy = value;
}

WASM_EXPORT("set_global_randomness")
void set_global_randomness(float value) {
    global_randomness = value;
}