// Minimal stdio shim for freestanding WASM builds
#ifndef MIN_STDIO_SHIM_H
#define MIN_STDIO_SHIM_H

typedef struct FILE FILE;

#ifndef NULL
#define NULL ((void*)0)
#endif

extern FILE * stderr;

int printf(const char * fmt, ...);
int fprintf(FILE * stream, const char * fmt, ...);

#endif // MIN_STDIO_SHIM_H


