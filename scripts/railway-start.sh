#!/usr/bin/env bash
set -euo pipefail

service_name="$(printf '%s' "${1:-${CAPTIONLINT_RAILWAY_SERVICE:-${RAILWAY_SERVICE_NAME:-}}}" | tr '[:upper:]' '[:lower:]')"

case "$service_name" in
  *api* | *backend*)
    pnpm --filter @captionlint/api start
    ;;
  *worker*)
    pnpm --filter @captionlint/worker start
    ;;
  *web* | *frontend*)
    pnpm --filter web start -- -p "${PORT:-3000}" -H 0.0.0.0
    ;;
  *)
    echo "Usage: bash scripts/railway-start.sh api|worker|web" >&2
    echo "Alternatively set CAPTIONLINT_RAILWAY_SERVICE to api, worker, or web." >&2
    exit 1
    ;;
esac
