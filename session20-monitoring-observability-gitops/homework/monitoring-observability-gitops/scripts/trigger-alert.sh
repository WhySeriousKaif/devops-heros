#!/usr/bin/env sh
set -eu

APP_URL="${APP_URL:-http://localhost:8080}"
ACTION="${1:-fire}"

case "$ACTION" in
  fire)
    curl --silent "${APP_URL}/admin/ready?value=0"
    echo
    echo "ApplicationNotReady will become Pending, then Firing after 10 seconds."
    echo "View it at http://localhost:9090/alerts"
    ;;
  recover)
    curl --silent "${APP_URL}/admin/ready?value=1"
    echo
    echo "Application restored; the alert will resolve after the next evaluation."
    ;;
  *)
    echo "Usage: $0 [fire|recover]" >&2
    exit 2
    ;;
esac
