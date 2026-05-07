#!/usr/bin/env bash
set -euo pipefail

service_name="$(printf '%s' "${1:-${CAPTIONLINT_RAILWAY_SERVICE:-${RAILWAY_SERVICE_NAME:-}}}" | tr '[:upper:]' '[:lower:]')"

case "$service_name" in
  *api* | *backend*)
    pnpm --filter @captionlint/api build
    ;;
  *worker*)
    pnpm --filter @captionlint/worker build
    ;;
  *web* | *frontend*)
    pnpm --filter web build
    ;;
  *)
    echo "Usage: bash scripts/railway-build.sh api|worker|web" >&2
    echo "Alternatively set CAPTIONLINT_RAILWAY_SERVICE to api, worker, or web." >&2
    exit 1
    ;;
esac
