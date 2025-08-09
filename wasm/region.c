#include "region.h"
// Local helpers to avoid lib deps
static inline float clampf(float v, float lo, float hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

void init_region(Region* region) {
    region->is_obstacle = false;
    region->temperature = 1.0f;  // Default temperature (neutral)
    region->energy_level = 1.0f; // Default energy level (neutral)
    region->randomness_factor = 0.0f; // No randomness by default
    for (int i = 0; i < NUM_DIRECTIONS; ++i) {
        region->directional_influence[i] = 0.0f; // No directional influence by default
    }
}

void set_region_obstacle(Region* region, bool is_obstacle) {
    region->is_obstacle = is_obstacle;
}

void set_region_directional_influence(Region* region, Direction dir, float value) {
    if (dir >= 0 && dir < NUM_DIRECTIONS) {
        // Clamp to [-1, 1]
        region->directional_influence[dir] = clampf(value, -1.0f, 1.0f);
    }
}

void set_region_randomness(Region* region, float value) {
    // Clamp to [0, 1]
    region->randomness_factor = clampf(value, 0.0f, 1.0f);
}

void set_region_temperature(Region* region, float value) {
    // Clamp to [0, 2]
    region->temperature = clampf(value, 0.0f, 2.0f);
}

void set_region_energy(Region* region, float value) {
    // Clamp to [0, 2]
    region->energy_level = clampf(value, 0.0f, 2.0f);
}

// Implement getter functions if needed
bool get_region_obstacle(const Region* region) {
    return region->is_obstacle;
}

float get_region_directional_influence(const Region* region, Direction dir) {
    if (dir >= 0 && dir < NUM_DIRECTIONS) {
        return region->directional_influence[dir];
    }
    return 0.0f;
}

float get_region_randomness(const Region* region) {
    return region->randomness_factor;
}

float get_region_temperature(const Region* region) {
    return region->temperature;
}

float get_region_energy(const Region* region) {
    return region->energy_level;
}