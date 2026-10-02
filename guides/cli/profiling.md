---
description: Reproduce a Wasm trap, build the opt-in profiler, validate a workload, and distinguish elapsed timings from native CPU samples.
---

# Profile and debug a workload

Start with a reproducible call and an expected result. A profile of the wrong computation is not useful, even if it looks faster.

## Reproduce a trap

First check the input and the export signature:

```sh
wago validate module.wasm
wago module imports module.wasm
wago module exports module.wasm
wago run --invoke process module.wasm 42
```

Replace the filename, export, and arguments with the failing call. Run outside watch mode so one invocation produces one error.

For a small example, save this as `trap.wat`:

```wat
(module
  (func (export "trap")
    unreachable))
```

With [WABT's `wat2wasm`](https://github.com/WebAssembly/wabt) installed:

```sh
wat2wasm trap.wat -o trap.wasm
wago validate trap.wasm
wago run --invoke trap trap.wasm
```

Validation succeeds, but the call fails:

```text
wago: trap: unreachable instruction executed
    at trap (func[0], wasm pc 0x1)
```

Keep the original module, arguments, Wago version, and compiler settings when reporting a trap. A Wasm frame identifies an export/function and Wasm instruction position; it is not automatically a guest-language source line. In an embedded application, `context.Canceled` and `context.DeadlineExceeded` indicate host cancellation, so handle them separately from guest traps.

## Build the optional profiler

Ordinary Wago builds do not include `wago profile`. From a [Wago source checkout](https://github.com/wago-org/wago), with Go installed, build the profiling CLI:

```sh
git clone https://github.com/wago-org/wago.git
cd wago
./scripts/build-profiler.sh ./wago-profile --cli
./wago-profile profile --help
```

The examples below use this separate `wago-profile` binary. It profiles the engine built into that binary. Switching your installed Wago runtime does not change it, and it does not resolve your project's plugins. Keep the checkout revision with your results; the build script records it in each capture.

The profiler is experimental. Check the [profiling qualification record](https://github.com/wago-org/wago/blob/main/docs/profiling-qualification.md) before relying on a particular collector or target.

## Record a checked workload

This first capture needs no external sampler:

```sh
curl -fsSL https://wago.sh/corpora/fib.wasm -o fib.wasm
./wago-profile profile record \
  --module fib.wasm --export fib --args 20 --want 6765 \
  --iterations 1000 --warmup 5 --source-maps --timeline \
  --out fib.wagoprof
./wago-profile profile top fib.wagoprof
```

Each iteration must return `6765`. A wrong result fails the capture rather than becoming a successful timing. `fib.wagoprof` is a directory; choose a new output path for every run. Existing captures are never replaced.

The default backend is `none`. It records elapsed phase timings, completed work, and static compiler data. `top` explicitly reports that no native samples are available. Compiler code size, frame size, or emitted checks are not measured hotspots.

Unlike `wago run`, profiler arguments and expected results are comma-separated unsigned 64-bit ABI slots. Floating-point values use their bit representation; vectors take two slots. Use `--want '[]'` for a void result, and `--init NAME` for an initialization export. The built-in import environment only supplies a trapping `env.abort`; arbitrary imports and WASI commands need a custom host using the [profiling library](https://github.com/wago-org/wago/blob/main/docs/profiling.md).

## Read the capture

```sh
./wago-profile profile annotate fib.wagoprof --function fib --json
./wago-profile profile timeline fib.wagoprof
./wago-profile profile top fib.wagoprof --json
```

- `top` summarizes measured samples when present, plus compiler statistics
- `annotate` joins captured function metadata and available instruction samples; `--source-maps` retains Wasm lowering origins and static inline ancestry
- `timeline` shows recorded invocation and host-boundary spans when the capture used `--timeline`. These are elapsed boundaries, not CPU time

Start with `manifest.json` when a capture looks incomplete. It records the module and workload hashes, revision, target, backend, invocation mode, effective settings, requested and completed work, diagnostics, and completion status. Keep the whole directory together when sharing or moving it.

## Collect native CPU samples on Linux

Install a working Linux `perf` tool and use an environment whose existing permissions allow performance events. This path also needs permission to write the capture directory:

```sh
./wago-profile profile record \
  --backend perf --include-code --source-maps \
  --module fib.wasm --export fib --args 20 --want 6765 \
  --phase execute --duration 15s --rate 99 \
  --out fib-perf.wagoprof
./wago-profile profile top fib-perf.wagoprof
./wago-profile profile annotate fib-perf.wagoprof --function fib --assembly
perf report -i fib-perf.wagoprof/perf.jit.data
go tool pprof -top fib-perf.wagoprof/native.pprof
```

`--include-code` retains native machine-code bytes and is required for this backend. Native collection was not available in the isolated walkthrough environment because `perf` was absent; the commands above follow the implementation and the linked qualification record. A missing collector or permission error is a failed capture, not evidence of zero CPU cost. Do not change host security settings just to make a capture succeed; use an appropriately configured development machine.

For a Go process CPU profile without an external collector:

```sh
./wago-profile profile record \
  --backend pprof --module fib.wasm --export fib --args 20 --want 6765 \
  --phase execute --duration 1s --out fib-go-cpu.wagoprof
go tool pprof -top fib-go-cpu.wagoprof/cpu.pprof
```

This reports Go process activity, including the invocation harness. It does not promise native guest attribution. For host-heavy work, select `--phase compile` or `--phase reload`; very short phases may produce no samples. On macOS, `--backend samply` requires an installed Samply collector and observes all process phases; do not interpret it as isolated execute-only CPU time.

## Compare equivalent work

Record a second capture using the same module, expected result, phase, backend, invocation mode, and collection settings. Then compare the directories:

```sh
./wago-profile profile diff baseline.wagoprof candidate.wagoprof
```

Use actual capture paths. The report normalizes by completed work and rejects incompatible measurement contracts. With the `none` backend, the comparison is elapsed time per iteration. A single pair does not establish a repeatable improvement; collect multiple runs under comparable conditions.

`--mode public` includes named `Instance.Invoke` lookup. `--mode prepared` uses a resolved function. Both include result validation, and changing the mode changes what you measure.

## Bound the recording and protect its contents

Choose `--iterations N` or `--duration D`. Duration is checked between complete iterations, so a long guest call can overshoot it. A separate `--collection-timeout` supervises the whole process, including a guest call that never returns; it defaults to five minutes. `--conversion-timeout` bounds native conversion and defaults to two minutes. Expiry leaves an incomplete capture and diagnostics.

Raw stack capture is a separate experimental opt-in, not enabled by `--source-maps` or `--timeline`. On supported Linux/amd64 perf setups, `--stack-bytes` requires `--unwind-maps` and `--include-code`. Raw stack memory may contain sensitive data. Leave it off unless you need it, and review capture contents before sharing. See the [full profiling reference](https://github.com/wago-org/wago/blob/main/docs/profiling.md) for collection limits and qualified stack recovery.
