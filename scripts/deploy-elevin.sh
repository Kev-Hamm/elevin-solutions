#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$WEB_DIR"

echo "=========================================="
echo " Elevin deploy:elevin"
echo "=========================================="
echo ""
echo "Step 1/3: canonical Elevin build"
npm run build:elevin

echo ""
echo "Step 2/3: deploy gate review"
echo "Required before any production publish:"
echo "  - Jerry gates 1/4/5/6 reviewed"
echo "  - API deploys must still go through elevinsolutions-api/scripts/pre-deploy-check.sh"
echo "  - explicit user signoff for any production-visible change"
echo ""

if [ "${ELEVIN_DEPLOY_EXECUTE:-false}" != "true" ]; then
  echo "Dry run only. Built artifact is ready at: $WEB_DIR/dist/elevin"
  echo "No production deploy was performed."
  exit 0
fi

if [ "${JERRY_GATES_CONFIRMED:-}" != "1,4,5,6" ]; then
  echo "Refusing production deploy: set JERRY_GATES_CONFIRMED=1,4,5,6 after review."
  exit 1
fi

if [ "${USER_SIGNOFF_CONFIRMED:-}" != "true" ]; then
  echo "Refusing production deploy: explicit user signoff is required."
  exit 1
fi

if [ "${API_PREDEPLOY_CONFIRMED:-}" != "true" ]; then
  echo "Refusing production deploy: confirm hardened API path via elevinsolutions-api/scripts/pre-deploy-check.sh"
  exit 1
fi

echo "Execution was explicitly requested, but no automated production publish target is configured in-repo."
echo "Use dist/elevin as the only approved artifact, then perform the reviewed publish step manually."
exit 1
