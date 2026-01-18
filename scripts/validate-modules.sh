#!/bin/bash

set -e

echo "🔍 Validating modules..."

MODULES_DIR="modules"
BASE_DIR="${MODULES_DIR}"

REQUIRED_FILES=("config.json" "tests.json" "nginx.conf" "ui.html")

FAILED=0

if [ ! -d "$MODULES_DIR" ]; then
    echo "❌ Modules directory not found: $MODULES_DIR"
    exit 1
fi

for module_dir in "${MODULES_DIR}"/*/; do
    if [ -d "$module_dir" ]; then
        module_name=$(basename "$module_dir")

        # Skip template and hidden directories
        if [[ "$module_name" == _* ]] || [[ "$module_name" == .* ]]; then
            continue
        fi

        echo "Checking module: $module_name"

        # Check for required files
        for file in "${REQUIRED_FILES[@]}"; do
            if [ ! -f "${module_dir}${file}" ]; then
                echo "  ❌ Missing required file: ${file}"
                FAILED=1
            fi
        done

        # Validate config.json
        if [ -f "${module_dir}config.json" ]; then
            if ! command -v python3 &> /dev/null; then
                echo "  ⚠️  Python3 not found, skipping JSON validation"
            else
                if ! python3 -m json.tool "${module_dir}config.json" > /dev/null 2>&1; then
                    echo "  ❌ Invalid JSON in config.json"
                    FAILED=1
                fi
            fi
        fi

        # Validate tests.json
        if [ -f "${module_dir}tests.json" ]; then
            if ! command -v python3 &> /dev/null; then
                echo "  ⚠️  Python3 not found, skipping JSON validation"
            else
                if ! python3 -m json.tool "${module_dir}tests.json" > /dev/null 2>&1; then
                    echo "  ❌ Invalid JSON in tests.json"
                    FAILED=1
                fi
            fi
        fi

        # Check config.json for required fields
        if [ -f "${module_dir}config.json" ]; then
            if command -v python3 &> /dev/null; then
                NAME=$(python3 -c "import json; print(json.load(open('${module_dir}config.json')).get('name', ''))" 2>/dev/null || echo "")
                if [ -z "$NAME" ]; then
                    echo "  ❌ config.json missing 'name' field"
                    FAILED=1
                fi
            fi
        fi
    fi
done

if [ $FAILED -eq 1 ]; then
    echo ""
    echo "❌ Validation failed"
    exit 1
else
    echo ""
    echo "✅ All modules validated successfully"
    exit 0
fi
