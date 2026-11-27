#!/bin/bash
set -e

# Force English output from git
export LANG=C LC_ALL=C

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Always resolve the MAIN checkout, even when this script is run from a worktree:
# the gitignored files to copy live there.
GIT_COMMON_DIR=$(git rev-parse --path-format=absolute --git-common-dir)
MAIN_REPO="${GIT_COMMON_DIR%/.git}"
PARENT_DIR=$(dirname "$MAIN_REPO")
PROJECT_PREFIX="tempo-sticky-notes"
BASE_BRANCH="main"

# Gitignored files that do not travel with `git worktree add`; copied, not linked,
# so each worktree owns its copy (conflicts are resolved on GitHub, by the User).
LOCAL_FILES=(
  ".claude/settings.local.json"
  "roadmap.md"
  ".claude/memory/memory-decisions.md"
  ".claude/memory/memory-sessions.md"
  "docs/assessment-brief.md"
)

# Gitignored directories, copied recursively for the same reason.
LOCAL_DIRS=(
  ".claude/skills"
)

# ── Mode detection ─────────────────────────────────────────────────────────────

if [ "$1" = "--from-remote" ]; then
  REMOTE_BRANCH="${2:-}"

  if [ -z "$REMOTE_BRANCH" ]; then
    echo -e "${RED}Error: --from-remote requires a branch name.${NC}"
    echo "Usage: bash .claude/scripts/new-worktree.sh --from-remote <branch>"
    exit 1
  fi

  SLUG=$(echo "$REMOTE_BRANCH" | sed 's|.*/||')
  BRANCH_NAME="$REMOTE_BRANCH"
  WORKTREE_NAME="${PROJECT_PREFIX}-${SLUG}"
  WORKTREE_PATH="${PARENT_DIR}/${WORKTREE_NAME}"

  echo ""
  echo -e "${BLUE}──────────────────────────────────────────${NC}"
  echo -e "  Worktree:  ${YELLOW}${WORKTREE_NAME}${NC}"
  echo -e "  Branch:    ${YELLOW}${BRANCH_NAME}${NC} (existing remote)"
  echo -e "  Path:      ${WORKTREE_PATH}"
  echo -e "${BLUE}──────────────────────────────────────────${NC}"
  echo ""

  if [ -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}Error: directory already exists at ${WORKTREE_PATH}${NC}"
    echo "Remove it with: git worktree remove \"$WORKTREE_PATH\""
    exit 1
  fi

  echo -e "${YELLOW}[1/3] Fetching and creating worktree...${NC}"
  git fetch origin "$BRANCH_NAME"
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
  else
    git worktree add "$WORKTREE_PATH" --track -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
  fi
  echo -e "${GREEN}✓ Worktree created${NC}"

else
  DESCRIPTION="${1:-}"
  TYPE_ARG="${2:-}"

  if [ -z "$DESCRIPTION" ]; then
    echo -e "${RED}Error: a slug or description is required.${NC}"
    echo "Usage: bash .claude/scripts/new-worktree.sh <slug> [feature|fix|impr|techDebt]"
    echo "       bash .claude/scripts/new-worktree.sh --from-remote <branch>"
    exit 1
  fi

  if [ -n "$TYPE_ARG" ]; then
    TYPE="$TYPE_ARG"
  else
    echo -e "${BLUE}Branch type:${NC}"
    echo "  1) feature/"
    echo "  2) fix/"
    echo "  3) impr/"
    echo "  4) techDebt/"
    echo ""
    read -rp "Choose (1-4): " TYPE_CHOICE
    case "$TYPE_CHOICE" in
      1) TYPE="feature" ;;
      2) TYPE="fix" ;;
      3) TYPE="impr" ;;
      4) TYPE="techDebt" ;;
      *) echo -e "${RED}Invalid option: $TYPE_CHOICE${NC}"; exit 1 ;;
    esac
  fi

  SLUG=$(echo "$DESCRIPTION" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/-/g' \
    | sed 's/-\{2,\}/-/g' \
    | sed 's/^-//' \
    | sed 's/-$//')

  if [ -z "$SLUG" ]; then
    echo -e "${RED}Error: the description does not produce a valid slug.${NC}"
    exit 1
  fi

  BRANCH_NAME="${TYPE}/${SLUG}"
  WORKTREE_NAME="${PROJECT_PREFIX}-${SLUG}"
  WORKTREE_PATH="${PARENT_DIR}/${WORKTREE_NAME}"

  echo ""
  echo -e "${BLUE}──────────────────────────────────────────${NC}"
  echo -e "  Worktree:  ${YELLOW}${WORKTREE_NAME}${NC}"
  echo -e "  Branch:    ${YELLOW}${BRANCH_NAME}${NC} (new, from ${BASE_BRANCH})"
  echo -e "  Path:      ${WORKTREE_PATH}"
  echo -e "${BLUE}──────────────────────────────────────────${NC}"
  echo ""

  if [ -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}Error: directory already exists at ${WORKTREE_PATH}${NC}"
    echo "Remove it with: git worktree remove \"$WORKTREE_PATH\""
    exit 1
  fi

  echo -e "${YELLOW}[1/3] Creating worktree...${NC}"
  git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" "$BASE_BRANCH"
  echo -e "${GREEN}✓ Worktree created${NC}"
fi

# ── Step 2: Install dependencies ───────────────────────────────────────────────

echo ""
echo -e "${YELLOW}[2/3] Installing dependencies...${NC}"
(
  cd "$WORKTREE_PATH"
  npm ci
)
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ── Step 3: Copy local, gitignored files ───────────────────────────────────────

echo ""
echo -e "${YELLOW}[3/3] Copying local files...${NC}"
for LOCAL_FILE in "${LOCAL_FILES[@]}"; do
  SRC="$MAIN_REPO/$LOCAL_FILE"
  DEST="$WORKTREE_PATH/$LOCAL_FILE"
  if [ -f "$SRC" ]; then
    mkdir -p "$(dirname "$DEST")"
    cp "$SRC" "$DEST"
    echo -e "  ${GREEN}✓${NC} $LOCAL_FILE"
  else
    echo -e "  ${YELLOW}(missing in main checkout: $LOCAL_FILE)${NC}"
  fi
done
for LOCAL_DIR in "${LOCAL_DIRS[@]}"; do
  SRC="$MAIN_REPO/$LOCAL_DIR"
  DEST="$WORKTREE_PATH/$LOCAL_DIR"
  if [ -d "$SRC" ]; then
    mkdir -p "$DEST"
    cp -R "$SRC/." "$DEST/"
    echo -e "  ${GREEN}✓${NC} $LOCAL_DIR/"
  else
    echo -e "  ${YELLOW}(missing in main checkout: $LOCAL_DIR/)${NC}"
  fi
done

# ── Open VSCode ────────────────────────────────────────────────────────────────

if command -v code &> /dev/null; then
  echo ""
  # Unset CLAUDECODE so the new window can start its own Claude Code session.
  env -u CLAUDECODE code "$WORKTREE_PATH"
fi

# ── Summary ────────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Worktree ready${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo "  Path:    $WORKTREE_PATH"
echo "  Branch:  $BRANCH_NAME"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Open a terminal in the new VSCode window"
echo "  2. npm run dev"
echo ""
