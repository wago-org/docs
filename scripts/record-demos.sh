#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"

for command_name in vhs gifsicle wago; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

temporary_dir="$(mktemp -d /tmp/wago-docs-demos.XXXXXX)"
trap 'find "$temporary_dir" -type f -delete; rmdir "$temporary_dir"' EXIT

mkdir -p "$repo_dir/public/demos"
cd "$repo_dir"

for demo_name in getting-started version-switcher; do
  rendered_tape="$temporary_dir/$demo_name.tape"
  optimized_gif="$temporary_dir/$demo_name.gif"

  python3 "$repo_dir/scripts/humanize-tape.py" \
    "demos/$demo_name.tape" "$rendered_tape" --seed 23
  vhs --quiet "$rendered_tape"
  gifsicle -O3 "public/demos/$demo_name.gif" > "$optimized_gif"
  mv "$optimized_gif" "public/demos/$demo_name.gif"

  echo "Recorded public/demos/$demo_name.gif"
done
