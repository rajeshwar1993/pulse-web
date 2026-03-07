#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------
# deploy.sh — Build locally and deploy to Vercel
#
# Usage:
#   ./scripts/deploy.sh production [--patch|--minor|--major]
#   ./scripts/deploy.sh preview
#
# Production deploys auto-bump the version (minor by default).
# Preview deploys do not change the version.
#
# Examples:
#   ./scripts/deploy.sh production              # 0.1.0 → 0.2.0
#   ./scripts/deploy.sh production --patch      # 0.2.0 → 0.2.1
#   ./scripts/deploy.sh production --major      # 0.2.1 → 1.0.0
#   ./scripts/deploy.sh preview                 # no version change
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
  red "Usage: $0 <production|preview> [--patch|--minor|--major]"
  exit 1
fi

# --- Parse optional semver flags ---
shift
BUMP_LEVEL="minor"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --patch) BUMP_LEVEL="patch" ;;
    --minor) BUMP_LEVEL="minor" ;;
    --major) BUMP_LEVEL="major" ;;
    *)       red "Unknown flag: $1"; exit 1 ;;
  esac
  shift
done

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

# --- Version bump (production only) ---
bump_version() {
  local current
  current=$(node -p "require('./package.json').version")

  local major minor patch
  IFS='.' read -r major minor patch <<< "$current"

  case "$BUMP_LEVEL" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
  esac

  local new_version="${major}.${minor}.${patch}"
  # Use node to update package.json (preserves formatting)
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.version = '${new_version}';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "

  green "Version bumped: $current → $new_version ($BUMP_LEVEL)"
  VERSION_STRING="$new_version"
}

if [[ "$ENV" == "production" ]]; then
  bump_version
else
  VERSION_STRING=$(node -p "require('./package.json').version")
  bold "Preview deploy — skipping version bump (current: $VERSION_STRING)"
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
bold "Building for $ENV (v$VERSION_STRING)..."
$BUILD_CMD

# --- Deploy ---
bold "Deploying to Vercel ($ENV)..."
DEPLOY_OUTPUT=$($DEPLOY_CMD)

green "Deploy complete! (v$VERSION_STRING)"
bold "URL: $DEPLOY_OUTPUT"
