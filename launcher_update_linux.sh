#!/bin/bash

echo "NeonLauncher Updating..."

cd "$(dirname "$0")"


pkill -x NeonLauncher 2>/dev/null || true

sleep 2

if [ -f "Library/Config/configuration_setup.json" ]; then
    rm -f "Library/Config/configuration_setup.json"
fi

if ! unzip -o "update.zip" -d "."; then
    echo "Update failed!"
    exit 1
fi

if command -v zenity >/dev/null 2>&1; then
    zenity --info \
        --title="NeonLauncher Updated" \
        --text="Update complete! Please open NeonLauncher to continue."
elif command -v notify-send >/dev/null 2>&1; then
    notify-send "NeonLauncher Updated" \
        "Update complete! Please open NeonLauncher to continue."
else
    echo "Update complete! Please open NeonLauncher to continue."
fi

exit 0
