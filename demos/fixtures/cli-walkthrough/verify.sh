#!/usr/bin/env sh
set -eu

fixtures=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
wago=${WAGO:-wago}
manager=${WAGO_MANAGER:-$wago}
output=$(mktemp -d "${TMPDIR:-/tmp}/wago-cli-walkthrough.XXXXXX")
cp "$fixtures/fib.wasm" "$fixtures/trap.wasm" "$output/"
cd "$output"

"$wago" validate fib.wasm
"$wago" validate --json fib.wasm > validate.json
"$wago" module exports --json fib.wasm > exports.json
"$wago" module imports --json fib.wasm > imports.json
"$wago" module capabilities --json fib.wasm > capabilities.json
[ "$("$wago" run --invoke fib fib.wasm 30)" = 832040 ]
[ "$("$wago" run --invoke fib fib.wasm 20:i32)" = 6765 ]
[ "$("$wago" run --invoke fib --invoke fib fib.wasm 20 30)" = "$(printf '6765\n832040')" ]
[ "$("$wago" run --native-stack 8MiB --parallel=4 fib.wasm 20)" = 6765 ]
"$wago" build fib.wasm -o fib.wago
if "$wago" run fib.wago 20 > untrusted.log 2>&1; then
  echo 'ERROR: native artifact ran without explicit trust' >&2
  exit 1
fi
grep -q 'allow-native-artifact' untrusted.log
[ "$("$wago" run --allow-native-artifact fib.wago 20)" = 6765 ]
"$wago" validate trap.wasm
if "$wago" run --invoke trap trap.wasm > trap.log 2>&1; then
  echo 'ERROR: trap unexpectedly returned successfully' >&2
  exit 1
fi
grep -q 'unreachable instruction executed' trap.log

if [ "${CHECK_STANDALONE:-1}" = 1 ]; then
  suffix=''
  case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) suffix='.exe' ;; esac
  "$manager" compile --bare --invoke fib fib.wasm -o "fib-go$suffix"
  [ "$("./fib-go$suffix" 30)" = 832040 ]
  if [ "${CHECK_TINYGO:-0}" = 1 ]; then
    "$manager" compile --bare --tinygo --invoke fib fib.wasm -o "fib-tiny$suffix"
    [ "$("./fib-tiny$suffix" 30)" = 832040 ]
  fi
fi
printf 'CLI walkthrough passed. Outputs: %s\n' "$output"
