#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
renderer="${WAGO_DEMO_RENDERER:-vhs}"
case "$renderer" in vhs|agg) ;; *) echo "Use WAGO_DEMO_RENDERER=vhs or agg" >&2; exit 1 ;; esac
for command_name in "$renderer" gifsicle wago curl python3; do
  command -v "$command_name" >/dev/null 2>&1 || {
    echo "Missing required command: $command_name" >&2
    exit 1
  }
done

# The older tapes are kept with their original release recordings. New tapes use
# an isolated directory and the caller's selected runtime, not a machine's paths.
if (( $# == 0 )); then set -- run-module standalone; fi
for demo_name in "$@"; do
  case "$demo_name" in
    run-module|standalone|wasi-command) ;;
    *) echo "Unknown walkthrough demo: $demo_name (use run-module, standalone, or wasi-command)" >&2; exit 1 ;;
  esac
done

temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/wago-docs-demos.XXXXXX")"
trap 'rm -rf "$temporary_dir"' EXIT
export WAGO_DEMO_WORK="$temporary_dir/work"
export GOWORK=off NO_COLOR=1
mkdir -p "$WAGO_DEMO_WORK" "$repo_dir/public/demos"
if [[ " $* " == *' wasi-command '* ]]; then
  : "${WAGO_DEMO_PROJECT:?Set WAGO_DEMO_PROJECT to a prepared Preview 1 project}"
  cp "$WAGO_DEMO_PROJECT/wago.json" "$WAGO_DEMO_PROJECT/wago-lock.json" "$WAGO_DEMO_WORK/"
fi
cd "$repo_dir"

# Fail before recording if a required workflow is broken. No command is mocked.
wago --version
curl -fsSL https://wago.sh/corpora/fib.wasm -o "$WAGO_DEMO_WORK/fib.wasm"
[[ "$(wago run --invoke fib "$WAGO_DEMO_WORK/fib.wasm" 30)" == 832040 ]]
if [[ " $* " == *' standalone '* ]]; then
  wago compile "$WAGO_DEMO_WORK/fib.wasm" -o "$WAGO_DEMO_WORK/fib"
  [[ "$("$WAGO_DEMO_WORK/fib" 30)" == 832040 ]]
fi

for demo_name in "$@"; do
  rendered_tape="$temporary_dir/$demo_name.tape"
  optimized_gif="$temporary_dir/$demo_name.gif"
  python3 scripts/humanize-tape.py "demos/$demo_name.tape" "$rendered_tape" --seed 23
  if [[ "$renderer" == vhs ]]; then
    vhs --quiet "$rendered_tape"
  else
    # Useful on machines where Chromium cannot start. Never substitute output.
    python3 scripts/record-tape.py "demos/$demo_name.tape" "$temporary_dir/$demo_name.cast" --cwd "$WAGO_DEMO_WORK"
    agg --font-family 'DejaVu Sans Mono' --font-size 18  "$temporary_dir/$demo_name.cast" "public/demos/$demo_name.gif"
  fi
  gifsicle -O3 "public/demos/$demo_name.gif" > "$optimized_gif"
  mv "$optimized_gif" "public/demos/$demo_name.gif"
  echo "Recorded public/demos/$demo_name.gif"
done
