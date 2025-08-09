(This README is still a work in progress)

# Envinroment Extension to 8-bit computational substrates (zff_enviro)

## Table of Contents
1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Key Features](#key-features)
4. [Technical Architecture](#technical-architecture)
5. [Setup and Installation](#setup-and-installation)
6. [Usage Guide](#usage-guide)
7. [API Documentation](#api-documentation)
8. [Extending the Simulation](#extending-the-simulation)
9. [Performance Considerations](#performance-considerations)
10. [Contributing](#contributing)
11. [Troubleshooting](#troubleshooting)
12. [License](#license)

## Introduction

This project is an extension of the below:
___
https://github.com/znah/zff/

8-bit computational substrates

This repository contains the code that supplements the article https://arxiv.org/abs/2406.19108

It implements a variant of the z80 2D grid experiment (Figure 12).
___

This version enhances the existing code to include an environmental region grid system. It combines low-level cellular interactions with higher-level regional influences, creating a complex and dynamic simulation environment that offers unique insights into emergent behaviors and pattern formation.

## Project Overview

The simulation consists of two main components:

1. **Primordial Soup**: A grid of cells that interact based on simple, Z80-inspired rules. Each cell contains a "tape" of instructions that determines its behavior and interactions with neighboring cells.

2. **Environmental Region Grid**: An overlay system that divides the simulation space into discrete regions. Each region can have unique properties that influence the behavior of cells within it, allowing for macro-level control and the creation of diverse environmental conditions.

The project leverages WebAssembly for high-performance computation of the cellular automata rules and region influences, while JavaScript handles the user interface, visualization, and real-time parameter adjustments.

## Key Features

- **Z80-Inspired Cellular Automata**: Cells interact based on rules reminiscent of Z80 assembly instructions, creating complex emergent behaviors.
- **Environmental Region Grid**: Overlay system for macro-level influence on cell behavior, allowing for the creation of diverse "biomes" within the simulation.
- **Real-time Parameter Adjustment (with bulk sync)**: Users can modify region properties and simulation parameters on-the-fly. Edits are applied via a bulk plane buffer for performance and synced to WASM on a short debounce or mouseup.
- **High-Performance Computation**: Core simulation logic implemented in C and compiled to WebAssembly for efficient execution.
- **Interactive Visualization with Region Overlay**: Dynamic rendering of cells plus a shader-based overlay that visualizes region parameters (obstacles, temperature×energy, randomness), providing intuitive insights into the simulation state.
- **Customizable Rules and Behaviors**: Extensible system allowing for the addition of new cell types, region properties, and interaction rules.

## Technical Architecture

The project is built on a hybrid architecture combining WebAssembly, JavaScript, and WebGL:

1. **WebAssembly Core**: 
   - Implements the cellular automata logic and region influence calculations.
   - Written in C for optimal performance.
   - Compiled to WebAssembly using the Zig compiler.

2. **JavaScript Layer**:
   - Handles user interface interactions and high-level simulation control.
   - Manages WebGL rendering and shader programs.
   - Coordinates communication between the UI, WebAssembly module, and rendering pipeline.

3. **WebGL Rendering**:
   - Utilizes custom shaders for efficient visualization of the simulation state.
   - Implements real-time rendering of both cellular automata and region influences.
   - Region overlay is a compact `rgba32f` texture (grid-sized) built from the region plane and composited atop the soup to show parameter effects.

4. **Region Grid System**:
   - Implemented in C and integrated with the WebAssembly core.
   - Provides a flexible overlay for macro-level environmental influences.

5. **Web Worker Integration**:
   - Offloads heavy computations to separate threads for improved performance.

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/PhantasticUniverse/zff_enviro
   cd zff_enviro
   ```

2. Ensure you have the following dependencies installed:
   - A modern web browser with WebGL2 support
   - [Zig compiler](https://ziglang.org/) for building the WebAssembly modules

3. Build the WebAssembly modules:
   ```
   ./build.sh
   ```

4. Start a local web server:
   ```
   python3 -m http.server 8000
   ```

5. Open a web browser and navigate to `http://localhost:8000`

## Usage Guide

1. **Simulation Controls**:
   - Use the "Play/Pause" button to start or stop the simulation.
   - Adjust the "Noise" slider to control the level of randomness in cell interactions.
   - Set the "Seed" value and click "Reset" to restart the simulation with a new initial state.

2. **Region Grid Manipulation**:
   - Select the desired grid size from the dropdown menu.
   - Click on individual regions to select them for parameter adjustments.
    - Use the sliders to modify Temperature, Energy Level, and Randomness for selected regions. Edits write into a plane buffer and are synced to WASM in batches.
    - Click directional buttons to add directional influences to regions.
    - Toggle obstacles in regions using the "Toggle Obstacle" button or paint with the obstacle brush.

3. **Brush Painting**:
    - Use the Brush controls to choose a parameter (Temperature, Energy, Randomness, Obstacle, Dir ↑/→/↓/←), value, size, and shape (square/circle).
    - Click and drag across regions to paint bulk edits. Changes are committed to the WASM region grid on a short debounce and on mouseup.

4. **Visualization**:
   - The main canvas displays the cellular automata simulation.
    - Enable/disable the “Region overlay” checkbox to display a shader overlay:
      - Temperature×Energy: brightness modulation (white where >1, black where <1).
      - Randomness: magenta tint proportional to randomness.
      - Obstacles: dark mask.
   - The color map on the right provides a legend for interpreting cell states.

## API Documentation

For detailed information about the available functions and their usage, refer to the [API Documentation](API.md).

### Region Parameters and Ranges
- **Obstacle**: boolean (0 or 1)
- **Directional influence** (`N, E, S, W`): float in [-1..1]
- **Randomness factor**: float in [0..1]
- **Temperature**: float in [0..2]
- **Energy level**: float in [0..2]

Semantics (high level):
- **Obstacles**: regions block pair selection and mutation within them.
- **Directional influence**: biases pairing direction; positive values encourage motion toward that cardinal direction.
- **Randomness**: increases occasional perturbations; used to stochastically modify pair data.
- **Temperature × Energy**: modulates absorb probability; >1 increases, <1 decreases.

### Bulk Region Plane (for JS↔WASM synchronization)
- Plane layout per region (8 floats): `[obstacle, dirN, dirE, dirS, dirW, randomness, temperature, energy]`.
- Exported sync functions:
  - `sync_regions_to_plane()`: copy current WASM regions into the plane buffer for JS to read/modify.
  - `sync_plane_to_regions()`: apply JS-edited plane back into WASM regions.
- In JS, the plane is exposed as `main.region_grid_plane` (Float32Array). Use the two sync calls to keep WASM and JS in sync.

## Extending the Simulation

1. **Adding New Cell Types**:
   - Modify the `wasm/main.c` file to include new cell state definitions and interaction rules.
   - Update the WebGL shaders in `js/main.js` to visualize the new cell types.

2. **Implementing New Region Properties**:
   - Extend the `Region` struct in `wasm/region.h` with new properties.
   - Add corresponding getter and setter functions in `wasm/region.c`.
   - Update the JavaScript UI in `index.html` and `js/main.js` to expose the new properties.

3. **Custom Visualization Techniques**:
   - Modify the WebGL shaders in `js/main.js` to implement new rendering styles or data representations.

4. **Performance Optimizations**:
   - Profile the WebAssembly code and identify bottlenecks.
   - Consider implementing critical sections in SIMD-optimized C or directly in WebAssembly text format.

## Performance Considerations

- Utilize Web Workers for parallel processing of cellular updates.
- Optimize WebGL rendering by minimizing draw calls and using efficient data structures.
- Balance the region grid size with the desired level of detail and performance requirements.
- Consider using WebGPU in the future for even greater performance on supported platforms.
- Prefer bulk plane edits over many per-region calls. The UI debounces `sync_plane_to_regions()` and also commits on mouseup to reduce overhead.
- Overlay can be filtered by parameter (All, Obstacles, Temperature, Energy, Randomness) and has an opacity control for clarity.

## Region Grid v1.1 Behavior and Ranges

Parameters per region (plane layout `[obstacle, dirN, dirE, dirS, dirW, randomness, temperature, energy]`):

- Obstacle: 0 or 1. Cells in obstacle regions are never selected as pairs and never mutated.
- Directional influence: floats in [-1, 1] per cardinal direction. Biases axis choice and direction; 0 means neutral.
- Randomness: float in [0, 1]. During prepare, with linear probability, flips a random bit in one byte of the tape (per cell) when > 0.
- Temperature: float in [0, 2].
- Energy: float in [0, 2].

Effects:
- Directional influence: For horizontal/vertical axes, bias direction based on (E−W) or (S−N). Clamped in C for safety.
- Randomness: Bit flip frequency scales linearly with the value in [0..1]; no effect when 0.
- Temperature × Energy: Scales absorb probability: neutral at 1×1; below 1 reduces absorb probability; above 1 currently treated as always-absorb to preserve throughput (hook retained).

UI defaults:
- Obstacle toggle mode: ON by default; Brush mode: OFF by default.
- Overlay parameter selector and opacity slider control visualization.
- Selection highlight is disabled while obstacle mode is on (clicks toggle obstacles instead of selecting).
- Brush shows crosshair cursor and supports size/value and parameter selection.

Persistence:
- Export/Import region plane as JSON with size and layout.
- Presets: uniform, stripes, checkerboard, gradient.

Tips:
- Keep region grid at 8×8 for <5% overhead on mid-range hardware; 16×16 is heavier. Use debounced sync while brushing.

## Contributing

Contributions to this project are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, descriptive messages.
4. Push your changes to your fork.
5. Submit a pull request with a detailed description of your changes.

Please ensure your code adheres to the existing style conventions and includes appropriate tests.

## Troubleshooting

- **WebGL Not Working**: Ensure your browser supports WebGL2 and that hardware acceleration is enabled.
- **Poor Performance**: Try reducing the simulation size or region grid resolution. Check for background processes that might be impacting browser performance.
- **Build Errors**: Make sure you have the latest version of the Zig compiler installed and that all dependencies are correctly set up.

For more specific issues, please check the [Issues](LINK TO ISSUES PAGE) page or create a new issue with a detailed description of the problem.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

