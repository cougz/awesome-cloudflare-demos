#!/bin/bash

set -e

echo "📥 Downloading images from Hugging Face..."

DEST_DIR="test-files/modules/caching"
HF_DATASET_URL="https://huggingface.co/datasets/ppbrown/pexels-photos-janpf/resolve/main"

# Ensure destination directory exists
mkdir -p "$DEST_DIR"

# Download images with different names
declare -A IMAGES=(
    ["image-1.jpg"]="public.jpg"
    ["image-2.jpg"]="test1.jpg"
    ["image-3.jpg"]="test2.jpg"
    ["image-4.jpg"]="test3.jpg"
    ["image-5.jpg"]="test4.jpg"
    ["image-6.jpg"]="test5.jpg"
    ["image-7.jpg"]="secret.jpg"
    ["image-8.jpg"]="test-public.jpg"
    ["image-9.jpg"]="test-private.jpg"
    ["image-10.jpg"]="test-set-cookie.jpg"
    ["image-11.jpg"]="test-revalidate.jpg"
    ["image-12.jpg"]="resize-me.jpg"
    ["image-13.jpg"]="test-no-store.jpg"
    ["image-14.jpg"]="test-s-maxage.jpg"
    ["image-15.jpg"]="test-dynamic.jpg"
)

DOWNLOADED=0
FAILED=0

for hf_name in "${!IMAGES[@]}"; do
    local_name="${IMAGES[$hf_name]}"
    dest_path="$DEST_DIR/$local_name"

    if [ -f "$dest_path" ]; then
        echo "  ✓ Already exists: $local_name"
        DOWNLOADED=$((DOWNLOADED + 1))
        continue
    fi

    echo "  Downloading: $local_name..."

    if curl -s -L -f -o "$dest_path" "${HF_DATASET_URL}/${hf_name}"; then
        echo "    ✓ Downloaded"
        DOWNLOADED=$((DOWNLOADED + 1))
    else
        echo "    ❌ Failed to download $hf_name"
        rm -f "$dest_path"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "✅ Downloaded: $DOWNLOADED images"
if [ $FAILED -gt 0 ]; then
    echo "⚠️  Failed: $FAILED images"
fi
