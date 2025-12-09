#!/usr/bin/env bash
# normalize-filenames.sh
# Diagnose filename mismatches between HTML asset references and git-tracked files.
# Optionally perform safe git mv renames for case-insensitive mismatches.
#
# Usage:
#   ./normalize-filenames.sh        # dry-run (default)
#   ./normalize-filenames.sh --apply   # actually perform git mv operations
#   ./normalize-filenames.sh --help    # show help
#
# Safety: Only operates on files tracked by git. It will NOT create commits or push.
# After --apply, run: git status, git add -A, git commit -m "Normalize filenames", git push

set -euo pipefail

DRY_RUN=true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) DRY_RUN=false; shift ;;
    --help|-h) 
      sed -n '1,160p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT_DIR=$(pwd)
TMP_PREFIX=".tmp-git-rename-"
COUNTER=0

echo "Running in $( $DRY_RUN && echo "DRY-RUN" || echo "APPLY" ) mode from: $ROOT_DIR"
echo

# 1) Extract referenced asset paths from HTML (src/href)
# Using a simpler grep pattern that works across different grep versions
grep -roh 'src="[^"]*"' --include='*.html' . | sed 's/src="//;s/"$//' > /tmp/referenced-files.$$.tmp || true
grep -roh "src='[^']*'" --include='*.html' . | sed "s/src='//;s/'$//" >> /tmp/referenced-files.$$.tmp || true
grep -roh 'href="[^"]*"' --include='*.html' . | sed 's/href="//;s/"$//' >> /tmp/referenced-files.$$.tmp || true
grep -roh "href='[^']*'" --include='*.html' . | sed "s/href='//;s/'$//" >> /tmp/referenced-files.$$.tmp || true

cat /tmp/referenced-files.$$.tmp \
  | sed 's#^\./##' \
  | grep -vE '^(https?:|mailto:|#)' \
  | sort -u > /tmp/referenced-files.$$ || true

rm -f /tmp/referenced-files.$$.tmp 2>/dev/null || true

# 2) List tracked files
git ls-files > /tmp/tracked-files.$$ 

echo "Found referenced files (from HTML):"
cat /tmp/referenced-files.$$ | sed 's/^/  - /' || true
echo
echo "Checking referenced files against tracked files..."
echo

# Prepare arrays to collect actions
declare -a ACTIONS
declare -a SKIPPED

while IFS= read -r ref; do
  # Skip blank lines
  [[ -z "${ref// /}" ]] && continue

  # If ref contains a query string or hash, strip them for file matching (keep original for reporting)
  ref_path="${ref%%[\?#]*}"

  # Normalize './' prefix
  if [[ "$ref_path" == ./* ]]; then
    ref_path="${ref_path#./}"
  fi

  # If exact match exists in tracked files, nothing to do
  if grep -Fxq "$ref_path" /tmp/tracked-files.$$; then
    continue
  fi

  # Try exact match inside subpaths (sometimes href="images/foo.jpg" but file in ./images/foo.jpg)
  # (git ls-files already lists path including directories)
  # If no exact match, try case-insensitive exact match among tracked files
  lower_ref=$(echo "$ref_path" | tr '[:upper:]' '[:lower:]')

  # Find case-insensitive exact matches
  matches=$(awk -v r="$lower_ref" 'BEGIN{IGNORECASE=1} { if(tolower($0)==r) print $0 }' /tmp/tracked-files.$$)

  # If none, try contains (substring) case-insensitive matches (to catch path differences)
  if [[ -z "$matches" ]]; then
    matches=$(awk -v r="$lower_ref" 'BEGIN{IGNORECASE=1} { if(index(tolower($0), r)) print $0 }' /tmp/tracked-files.$$)
  fi

  if [[ -z "$matches" ]]; then
    SKIPPED+=("NO_MATCH: $ref -> (no case-insensitive match found)")
    echo "NO MATCH: '$ref' (no tracked file found that matches case-insensitively)"
    continue
  fi

  # If multiple matches, report and skip
  match_count=$(echo "$matches" | sed '/^$/d' | wc -l | tr -d ' ')
  if [[ "$match_count" -gt 1 ]]; then
    SKIPPED+=("MULTIPLE_MATCHES: $ref -> $(echo "$matches" | sed ':a;N;$!ba;s/\n/, /g')")
    echo "MULTIPLE MATCHES for '$ref':"
    echo "$matches" | sed 's/^/    - /'
    echo "  Skipping — manual review required."
    continue
  fi

  # Single match found -> create action to rename tracked file -> ref_path
  tracked_file="$matches"
  # If tracked_file equals ref_path (shouldn't happen here), skip
  if [[ "$tracked_file" == "$ref_path" ]]; then
    continue
  fi

  # Add action (safe two-step rename using temp in repo root)
  COUNTER=$((COUNTER+1))
  tmp_name="${TMP_PREFIX}${COUNTER}"
  ACTIONS+=("$tracked_file|$tmp_name|$ref_path")

done < /tmp/referenced-files.$$

# Check if ACTIONS array has any elements
# Use a workaround for bash strict mode with arrays
set +u
actions_count=${#ACTIONS[@]}
set -u
if [[ $actions_count -eq 0 ]]; then
  echo "No renames proposed. Either all references match tracked files exactly, or no case-insensitive single matches were found."
  echo
  echo "Skipped items summary:"
  printf '%s\n' "${SKIPPED[@]}" || true
  # cleanup
  rm -f /tmp/referenced-files.$$ /tmp/tracked-files.$$ 2>/dev/null || true
  exit 0
fi

echo
echo "Proposed rename operations (in order):"
for act in "${ACTIONS[@]}"; do
  IFS='|' read -r src tmp dst <<< "$act"
  echo "  - git mv '$src' '$tmp'  # temp rename to avoid case-conflicts"
  echo "  - git mv '$tmp' '$dst'  # final rename to requested path"
done

echo
if $DRY_RUN; then
  echo "DRY-RUN: No changes made. To perform these renames, re-run with --apply."
  echo "After running with --apply, review with 'git status', then git add -A; git commit -m \"Normalize filenames\"; git push"
  # cleanup
  rm -f /tmp/referenced-files.$$ /tmp/tracked-files.$$ 2>/dev/null || true
  exit 0
fi

# APPLY mode: execute actions
echo "APPLYING renames now..."
for act in "${ACTIONS[@]}"; do
  IFS='|' read -r src tmp dst <<< "$act"

  # Ensure destination directory exists
  dst_dir=$(dirname "$dst")
  if [[ "$dst_dir" != "." && ! -d "$dst_dir" ]]; then
    echo "  Creating directory: $dst_dir"
    mkdir -p "$dst_dir"
    git add "$dst_dir" 2>/dev/null || true
  fi

  # Perform two-step git mv to avoid case-insensitive FS collisions
  echo "  Renaming '$src' -> '$tmp' -> '$dst'"
  git mv -- "$src" "$tmp"
  git mv -- "$tmp" "$dst"
done

echo
echo "Renames complete. Review changes with 'git status'."
echo "To commit: git add -A && git commit -m \"Normalize filenames (case fix)\" && git push"
# cleanup
rm -f /tmp/referenced-files.$$ /tmp/tracked-files.$$ 2>/dev/null || true
exit 0
