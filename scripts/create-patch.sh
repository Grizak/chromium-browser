#!/usr/bin/env bash

set -e

PATCH_NAME="$1"
CHROMIUM_DIR="./src"
PATCHES_DIR="./patches"

# Set working directory
cd /cr/chromium

# Create patches directory if it doesn't exist
mkdir -p "$PATCHES_DIR"

# Find the next patch number
EXISTING_PATCHES=$(ls -1 "$PATCHES_DIR"/*.patch 2>/dev/null | wc -l)
NEXT_NUMBER=$((EXISTING_PATCHES + 1))
PADDED_NUMBER=$(printf "%03d" $NEXT_NUMBER)

PATCH_FILE=$PATCHES_DIR/${PADDED_NUMBER}-${PATCH_NAME}.patch

# Check if chromium dir exists
if [ ! -d "$CHROMIUM_DIR" ]; then
	echo "Error: chromium directory not found. Run 'pnpm setup' first."
	exit 1
fi

# Generate the patch
echo "Creating patch: $PATCH_FILE"
cd "$CHROMIUM_DIR"
git diff HEAD~1 HEAD > "../$PATCH_FILE"
cd ..

if [ -s "$PATCH_FILE" ]; then
	echo "Patch created successfully: $PATCH_FILE"
	echo ""
	echo "Next steps:"
	echo "	1. Review the patch: cat $PATCH_FILE"
	echo "	2. Commit it: git add $PATCH_FILE && git commit -m \"Add $PATCH_NAME patch\""
	echo "	3. Push: git push"
else
	echo "No changes detected. Make sure you have modified files in the chromium directory."
	rm "$PATCH_FILE"
	exit 1
fi
