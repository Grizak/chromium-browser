#!/usr/bin/env bash

set -euo pipefail

mkdir -p png

for svg in *.svg; do
	base=$(basename "$svg" .svg)

	for size in 16 32 64 128 256 512; do
		rsvg-convert "$svg" \
			-w "$size" \
			-h "$size" \
			> "png/${base}_${size}.png"
	done
done
