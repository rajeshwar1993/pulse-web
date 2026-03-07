#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------
# deploy.sh — Build locally and deploy to Vercel
#
# Usage:
#   ./scripts/deploy.sh production   (from main branch)
#   ./scripts/deploy.sh preview      (from preview branch)
# ------------------------------------------------------------------

ENV="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# --- Helpers ---
red()   { printf '\033[1;31m%s\033[0m\n' "$*"; }
green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }

# --- Validate argument ---
if [[ "$ENV" != "production" && "$ENV" != "preview" ]]; then
  red "Usage: $0 <production|preview>"
  exit 1
fi

cd "$PROJECT_DIR"

# --- Branch validation ---
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$ENV" == "production" ]]; then
  EXPECTED_BRANCH="main"
  ENV_FILE=".env.production"
  BUILD_CMD="vercel build --prod"
  DEPLOY_CMD="vercel deploy --prebuilt --prod"
else
  EXPECTED_BRANCH="preview"
  ENV_FILE=".env.preview"
  BUILD_CMD="vercel build"
  DEPLOY_CMD="vercel deploy --prebuilt"
fi

if [[ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  red "Error: $ENV deploys must be run from the '$EXPECTED_BRANCH' branch."
  red "Current branch: $CURRENT_BRANCH"
  exit 1
fi

# --- Clean working tree ---
if [[ -n "$(git status --porcelain)" ]]; then
  red "Error: Working tree has uncommitted changes. Commit or stash them first."
  exit 1
fi

# --- Env file check ---
if [[ ! -f "$ENV_FILE" ]]; then
  red "Error: $ENV_FILE not found."
  red "Copy $ENV_FILE.example to $ENV_FILE and fill in your secrets."
  exit 1
fi

# --- Cleanup trap (always restores .env.local) ---
ENV_LOCAL_BACKED_UP=false

cleanup() {
  if [[ "$ENV_LOCAL_BACKED_UP" == true ]]; then
    if [[ -f ".env.local.bak" ]]; then
      mv .env.local.bak .env.local
      bold "Restored .env.local from backup."
    fi
  else
    # We replaced .env.local but there was no original — remove the copy
    if [[ -f ".env.local" ]]; then
      rm .env.local
    fi
  fi
}
trap cleanup EXIT

# --- Swap env files ---
if [[ -f ".env.local" ]]; then
  cp .env.local .env.local.bak
  ENV_LOCAL_BACKED_UP=true
  bold "Backed up .env.local → .env.local.bak"
fi

cp "$ENV_FILE" .env.local
bold "Copied $ENV_FILE → .env.local"

# --- Pre-deploy quality gates ---
bold "Running lint..."
npm run lint

bold "Running type check..."
npx tsc --noEmit

# --- Build ---
bold "Building for $ENV..."
$BUILD_CMD

# --- Deploy ---
bold "Deploying to Vercel ($ENV)..."
DEPLOY_OUTPUT=$($DEPLOY_CMD)

green "Deploy complete!"
bold "URL: $DEPLOY_OUTPUT"
