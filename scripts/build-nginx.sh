#!/bin/bash

set -e

MODULES_DIR="modules"
NGINX_MODULES_DIR="nginx/conf.d/modules"

echo "🔨 Building nginx configuration..."

# Ensure nginx modules directory exists
mkdir -p "$NGINX_MODULES_DIR"

# Clear existing configs
rm -f "$NGINX_MODULES_DIR"/*.conf

# Find and copy all nginx.conf files from modules
FOUND=0

for module_dir in "${MODULES_DIR}"/*/; do
    if [ -d "$module_dir" ]; then
        module_name=$(basename "$module_dir")

        # Skip template and hidden directories
        if [[ "$module_name" == _* ]] || [[ "$module_name" == .* ]]; then
            continue
        fi

        nginx_conf="${module_dir}nginx.conf"

        if [ -f "$nginx_conf" ]; then
            echo "  Adding: $module_name"
            cp "$nginx_conf" "${NGINX_MODULES_DIR}/${module_name}.conf"
            FOUND=$((FOUND + 1))
        else
            echo "  ⚠️  No nginx.conf for: $module_name"
        fi
    fi
done

if [ $FOUND -eq 0 ]; then
    echo "⚠️  No module nginx configs found"
else
    echo "✅ Built $FOUND nginx config(s)"
fi
