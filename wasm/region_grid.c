#include "region_grid.h"
#include "common.h"

// Use limits from region.h via region_grid.h inclusion
static Region grid[MAX_REGION_GRID_SIZE][MAX_REGION_GRID_SIZE];
static int grid_size = MIN_REGION_GRID_SIZE;
static inline float clampf(float v, float lo, float hi) { return v < lo ? lo : (v > hi ? hi : v); }

void init_region_grid(int size) {
    if (size < MIN_REGION_GRID_SIZE || size > MAX_REGION_GRID_SIZE) {
        size = MIN_REGION_GRID_SIZE;
    }
    grid_size = size;
    for (int y = 0; y < grid_size; y++) {
        for (int x = 0; x < grid_size; x++) {
            init_region(&grid[y][x]);
        }
    }
}

int get_region_grid_size() {
    return grid_size;
}

Region* get_region(int x, int y) {
    if (x >= 0 && x < grid_size && y >= 0 && y < grid_size) {
        return &grid[y][x];
    }
    return 0;
}

// Add more functions as needed for manipulating the grid

// Serialize Region structs to the shared plane in main.c
void serialize_regions_to_plane(void) {
    extern float region_grid_plane[]; // from BUFFER in main.c
    const int stride = REGION_PARAM_COUNT;
    for (int y = 0; y < grid_size; ++y) {
        for (int x = 0; x < grid_size; ++x) {
            const int idx = (y * grid_size + x) * stride;
            Region *r = &grid[y][x];
            region_grid_plane[idx + 0] = r->is_obstacle ? 1.0f : 0.0f;
            region_grid_plane[idx + 1] = r->directional_influence[NORTH];
            region_grid_plane[idx + 2] = r->directional_influence[EAST];
            region_grid_plane[idx + 3] = r->directional_influence[SOUTH];
            region_grid_plane[idx + 4] = r->directional_influence[WEST];
            region_grid_plane[idx + 5] = r->randomness_factor;
            region_grid_plane[idx + 6] = r->temperature;
            region_grid_plane[idx + 7] = r->energy_level;
        }
    }
}

// Deserialize the plane back into Region structs
void deserialize_plane_to_regions(void) {
    extern float region_grid_plane[]; // from BUFFER in main.c
    const int stride = REGION_PARAM_COUNT;
    for (int y = 0; y < grid_size; ++y) {
        for (int x = 0; x < grid_size; ++x) {
            const int idx = (y * grid_size + x) * stride;
            Region *r = &grid[y][x];
            r->is_obstacle = region_grid_plane[idx + 0] > 0.5f;
            r->directional_influence[NORTH] = clampf(region_grid_plane[idx + 1], -1.0f, 1.0f);
            r->directional_influence[EAST]  = clampf(region_grid_plane[idx + 2], -1.0f, 1.0f);
            r->directional_influence[SOUTH] = clampf(region_grid_plane[idx + 3], -1.0f, 1.0f);
            r->directional_influence[WEST]  = clampf(region_grid_plane[idx + 4], -1.0f, 1.0f);
            r->randomness_factor = clampf(region_grid_plane[idx + 5], 0.0f, 1.0f);
            r->temperature = clampf(region_grid_plane[idx + 6], 0.0f, 2.0f);
            r->energy_level = clampf(region_grid_plane[idx + 7], 0.0f, 2.0f);
        }
    }
}