#!/bin/bash

echo "NeonLauncher Updating..."

cd "$(dirname "$0")"

pkill -x NeonLauncher 2>/dev/null || true

sleep 2

if [ -f "Library/Config/configuration_setup.json" ]; then
    rm -f "Library/Config/configuration_setup.json"
fi

if ! unzip -o "update.zip" -d "."; then
    osascript -e 'display dialog "Update failed!" buttons {"OK"} with icon stop'
    exit 1
fi

osascript -e 'display dialog "Update complete! Please open NeonLauncher to continue." with title "NeonLauncher Updated" buttons {"OK"} default button "OK" with icon note'

exit 0
