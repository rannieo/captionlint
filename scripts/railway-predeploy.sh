#!/usr/bin/env bash
set -euo pipefail

service_name="$(printf '%s' "${RAILWAY_SERVICE_NAME:-}" | tr '[:upper:]' '[:lower:]')"

case "$service_name" in
  *api* | *backend*)
    node packages/database/dist/setup.js
    ;;
  *)
    echo "No Railway pre-deploy step for ${RAILWAY_SERVICE_NAME:-unnamed service}."
    ;;
esac
