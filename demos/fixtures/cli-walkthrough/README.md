# CLI walkthrough fixtures

Small checked inputs for the CLI, standalone, and profiling guides. No guest-language compiler is needed to run the included `.wasm` files.

- `fib.wasm`: downloaded from https://wago.sh/corpora/fib.wasm on 2026-10-02; exports `fib(i32) -> i32` and a memory. SHA-256: `4c32b0c407de0a348df1e55c7d308284770d3ad9cc121b0f297848ac742a5570`. `fib.wat` is its readable instruction-equivalent source
- `trap.wasm`: a valid Wasm module that executes `unreachable`; `trap.wat` is its source
- `verify.sh`: checks numeric calls, JSON metadata, validation, trusted-artifact loading, the intentional trap, and Go standalone output. Set `CHECK_TINYGO=1` to test the TinyGo path as well

Install Wago and select a runtime, then run:

```sh
./verify.sh
CHECK_TINYGO=1 ./verify.sh
```

Go is required for the default standalone check. The TinyGo check additionally needs a compatible TinyGo/Go pair and `strip`. The tested TinyGo baseline is 0.41.1 with Go 1.25.0. Set `CHECK_STANDALONE=0` to run only runtime checks.

To use explicit binaries without changing your installation:

```sh
WAGO=/path/to/wago-runtime WAGO_MANAGER=/path/to/wago ./verify.sh
```

`WAGO_MANAGER` defaults to `WAGO`. `WAGO` defaults to `wago`. The script writes to a new temporary directory and prints its path; it does not alter the fixtures or the selected runtime.

To verify profiling separately after building the opt-in CLI:

```sh
wago-profile profile record --module fib.wasm --export fib --args 20 --want 6765 \
  --iterations 1000 --warmup 5 --source-maps --timeline --out fib.wagoprof
wago-profile profile top fib.wagoprof
wago-profile profile annotate fib.wagoprof --function fib --json
wago-profile profile timeline fib.wagoprof
```

Use a fresh capture directory on every run. The default backend records elapsed timing and static metadata, not native CPU samples.

If you edit the WAT sources, compile them with WABT's `wat2wasm`; optional name/debug sections may change the binary hash without changing these test outcomes.
