---
description: Use Wago watch mode, parallel function work, and compiler switches during module development.
---

# Watch, parallelize, and tune

Shorten the edit-run loop with watch mode, spread compilation work across functions, and opt into compiler overrides when you have measured a reason.

## Watch a module

`--watch` reruns the module when its file changes:

```sh
wago run --watch --invoke fib fib.wasm 20
```

The watcher polls every `200ms` by default. Slow build pipelines and network filesystems may need a longer interval:

```sh
wago run --watch --watch-interval 750ms --invoke fib fib.wasm 20
```

Each run gets a fresh compilation and instance. Globals, tables, and memory from the previous run do not carry over.

## Parallel function work

Large modules can validate and compile their functions in parallel:

```sh
wago run --parallel --invoke fib fib.wasm 20
```

With no count, Wago uses its adaptive policy. Set a maximum when the surrounding system already has a concurrency budget:

```sh
wago run --parallel=4 --invoke fib fib.wasm 20
```

Serial work remains the default because workers cost memory and scheduling time. Parallelism helps sufficiently large modules; it is overhead on tiny ones.

## Compiler switches

The current runtime lists its optimization controls in help:

```sh
wago run --help
```

Stable optimizations already use their intended defaults. A `--no-…` form is useful for diagnosis and controlled benchmarks:

```sh
wago run --no-inline --invoke fib fib.wasm 20
```

Change one variable at a time and measure your workload. Do not ship an experimental switch because its name sounds fast.

<Accordion title="Where should a lasting override live?">

Put project-wide overrides under `settings` in `wago.json`. Keep a one-off diagnosis on the command line. See [Configuration](/reference/configuration).

</Accordion>
