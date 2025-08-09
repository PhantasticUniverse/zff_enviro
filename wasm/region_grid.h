#ifndef REGION_GRID_H
#define REGION_GRID_H

#include "region.h"

void init_region_grid(int size);
int get_region_grid_size();
Region* get_region(int x, int y);

// Plane serialization (8 floats per region: [obstacle, dirN, dirE, dirS, dirW, randomness, temperature, energy])
#define REGION_PARAM_COUNT 8
void serialize_regions_to_plane(void);
void deserialize_plane_to_regions(void);

#endif // REGION_GRID_H