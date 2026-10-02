# Embedding walkthrough checks

This runner extracts the complete Go programs and WAT guests directly from the
root embedding guides, so the examples tested are the ones readers copy.
It runs every program and checks its output, runs the service with Go's race
detector, then runs a small set of API-boundary tests with the race detector.
No generated Wasm, binaries, artifacts, or Go module files are written into the
documentation tree.

Prerequisites: Python 3, Go 1.22 or newer, WABT's `wat2wasm`, and a checkout of the
Wago revision being documented. From the documentation repository root:

```sh
python3 demos/fixtures/embed-walkthrough/check.py --runtime /path/to/wago
```

For explicit tool paths and a retained verification directory:

```sh
python3 demos/fixtures/embed-walkthrough/check.py \
  --runtime /path/to/wago \
  --go /path/to/go \
  --wat2wasm /path/to/wat2wasm \
  --work-dir /tmp/wago-embed-check
```

The runner uses a local Go module replacement for that checkout and inherits
`GOPATH`, `GOCACHE`, and `GOMODCACHE`. Set those to writable directories in a
restricted environment. It limits Go parallelism to two CPUs (unless
`GOMAXPROCS` is already set) and one package build at a time.

Coverage includes scalar raw/typed values, mismatched types and arities,
raw two-slot v128 values, multiple results, a five-argument resolved function, copied result ownership,
close rejection, host and guest traps, authorized callback re-entry and a
retained-caller rejection, same-instance serialization during a host callback,
instance-admission budget reuse, and the raw-Wasm/trusted-artifact boundary.
The documentation programs also cover memory copies and rejected writes,
globals, fresh state, deadlines and a subsequent call, concurrent separate
instances, and trusted artifact round-tripping.

This runs the WAT branches of the embedding tutorials. It does not install or
qualify the AssemblyScript and TinyGo guest toolchains, test other operating
systems or architectures, establish performance numbers, or claim that Go's
race detector instruments generated native guest code.
