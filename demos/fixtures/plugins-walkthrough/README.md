# Plugin walkthrough fixtures

These are complete programs behind the plugin, WASI, and Component Model guides.
They use real Wago providers and execute real WebAssembly guests. Go modules pin
the Wago canary revision used for the walkthrough; no local replace is required.

## Author a host import

From `answer/`:

```sh
go test ./... -v
wago plugin catalog --check
```

The package identity is an example. Do not try to install `github.com/acme/wago-answer`
from the registry. The test selects the local provider with one explicit Authority
and checks that a guest call returns 42. The second test checks catalog drift.

`testdata/answer.wat` and `answer.wasm` come from Wago's Apache-2.0-licensed
[language guest example](https://github.com/wago-org/wago/tree/b084a7c9343f81a9120ca80a13d133884e88d514/examples/22-language-guests/wat).
The text is included so the binary's behavior is readable. These files need no
AssemblyScript, TinyGo, Rust, or WAT compiler to run.

## Compile a Preview 1 command

From `wasi-command/` on macOS or Linux:

```sh
GOOS=wasip1 GOARCH=wasm go build -o command.wasm main.go
wago init --run
wago add wago-org/wasi/p1
wago run command.wasm alpha beta
```

Review the install interactively. The guest prints arguments and the explicit
`GREETING` environment value. With default configuration, the greeting is empty.
See the WASI guide for configuration and PowerShell commands. The binary and
local runtime are generated files; keep them outside a documentation commit.

## Call components

From `components/`:

```sh
go mod download
curl -fsSL https://raw.githubusercontent.com/wago-org/component-model/d96ac8770288d303ebdfc8b84732ba553236aea4/testdata/adder.wasm -o adder.wasm
go run . add adder.wasm
```

Expected: `add(2, 3) = 5`.

Run the real Rust Preview 2 command:

```sh
curl -fsSL https://raw.githubusercontent.com/wago-org/wasi/397f6e142b4d2d3fca0a59b9f3f56c9326478041/p2/testdata/rust_smoke.component.wasm -o command.component.wasm
printf 'from-component-stdin\n' | go run . wasi command.component.wasm alpha beta
```

Expected stdout:

```text
args=alpha,beta;env=docs;stdin=from-component-stdin;map=2;clock=true
```

The command also writes `rust-wasip2-stderr` to stderr. It needs no guest compiler.
The host explicitly selects the Component Model provider, three Authorities,
a bounded 64-instance/16-GiB aggregate memory grant, the consumer dependency,
and the typed Contract binding. This is a reviewed example policy, not a helper
that automatically grants arbitrary provider requests.

The host's `wasi` mode uses `p2.Run` with an already leased component service.
It supplies stdin/stdout/stderr and a single explicit environment value. It
mounts no host directories. `go run . add` checks both the typed value and output.

Downloaded component fixtures are Apache-2.0-licensed upstream test artifacts.
Their exact source commits are pinned in the URLs. They are not generated or
adapted by the docs host.
