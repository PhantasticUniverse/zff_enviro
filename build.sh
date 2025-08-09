clear
FLAGS="-target wasm32-freestanding-musl -DWASM -lc -fno-entry -O ReleaseSmall -I. -I../external -Iwasm"
cd wasm
zig build-exe main.c region.c region_grid.c $FLAGS
zig build-exe z80worker.c region.c ../external/z80.c $FLAGS
ls -lh *.wasm