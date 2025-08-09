# Changelog

All notable changes to this project will be documented in this file. This project is in prototype stage; versions follow a simple v0.x scheme.

## v0.11.0 (Environmental Region Grid v1.1)
- Correctness:
  - Enforced ranges in WASM for region params: dir [-1,1], randomness [0,1], temperature [0,2], energy [0,2].
  - Obstacles: cells in obstacle regions are never paired or mutated.
  - Directional influence: axis/direction bias applied per-region; neutral at 0.
  - Randomness: linear-probability bit flip during prepare when >0.
  - Temperature×Energy: absorb probability neutral at 1×1; <1 reduces absorb chance.
- UI/UX:
  - Obstacle toggle mode ON by default; Brush OFF by default.
  - Overlay parameter selector (All, Obstacles, Temperature, Energy, Randomness) and opacity slider.
  - Active mode badges for Obstacle/Brush.
  - Brush cursor hint and debounced sync; hard-commit on mouseup.
  - Reset regions button.
- Visualization:
  - Per-parameter overlay mode and small legend hook.
- Persistence:
  - Export/import region plane JSON.
  - Presets: uniform, stripes, checkerboard, gradient.
- API/Data sync:
  - Typed plane layout kept as [obstacle, dirN, dirE, dirS, dirW, randomness, temperature, energy].
  - JS and WASM clamp invalid writes.
- Docs:
  - README2 updated with ranges, semantics, UI guide, perf tips.

## v0.10.x
- Initial Environmental Region Grid prototype with plane sync and basic UI.


