#!/usr/bin/env bash
set -euo pipefail

service_name="$(printf '%s' "${RAILWAY_SERVICE_NAME:-}" | tr '[:upper:]' '[:lower:]')"

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
    echo "Set RAILWAY_SERVICE_NAME to api, worker, or web, or set a service-specific config path." >&2
    exit 1
    ;;
esac
