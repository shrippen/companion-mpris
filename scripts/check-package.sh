#!/usr/bin/env bash
# Runs after "npm run package": the demo (demo/, screenshots only) must not be in the module.
set -euo pipefail
cd "$(dirname "$0")/.."
pkg="$(ls -t ./*.tgz | head -1)"
if tar -xzOf "${pkg}" | grep -aqiE 'fakeMpris|Studio Weber|world\.cjs|MPRIS_DEMO'; then
    echo "error: ${pkg} contains the internal demo" >&2
    exit 1
fi
echo "${pkg}: no demo inside"
