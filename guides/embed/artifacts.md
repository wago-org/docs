---
description: Serialize compiled WebAssembly, load trusted native code, and adopt it into a Wago runtime.
---

# Cache compiled code

A `.wago` artifact stores host-native compiled code. It removes compilation from startup, but it is specific to Wago's artifact format, the target operating system, and the target architecture.

Use the `fib.wasm` from [Run WebAssembly from Go](./runtime-and-modules). Replace `main.go` with:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/wago-org/wago"
)

func run(ctx context.Context) error {
	wasm, err := os.ReadFile("fib.wasm")
	if err != nil {
		return err
	}

	compiled, err := wago.Compile(nil, wasm)
	if err != nil {
		return err
	}
	artifact, err := compiled.MarshalBinary()
	closeErr := compiled.Close()
	if err != nil {
		return err
	}
	if closeErr != nil {
		return closeErr
	}
	if err := os.WriteFile("fib.wago", artifact, 0o600); err != nil {
		return err
	}

	trustedBytes, err := os.ReadFile("fib.wago")
	if err != nil {
		return err
	}
	trusted, err := wago.LoadTrustedArtifact(trustedBytes)
	if err != nil {
		return err
	}

	runtime := wago.NewRuntime()
	defer runtime.Close()
	module, err := runtime.AdoptModule(trusted)
	if err != nil {
		return err
	}
	defer module.Close()

	instance, err := runtime.Instantiate(ctx, module)
	if err != nil {
		return err
	}
	defer instance.Close()
	results, err := instance.InvokeValues(ctx, "fib", wago.ValueI32(20))
	if err != nil {
		return err
	}
	fmt.Printf("artifact: %d bytes\n", len(artifact))
	fmt.Println(results[0].I32())
	return nil
}

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatal(err)
	}
}
```

```sh
go run .
```

The artifact size varies by Wago version and architecture. The final line remains:

```text
6765
```

## Treat artifacts as executable code

`LoadTrustedArtifact` is intentionally explicit: a `.wago` file contains native machine code. Load only bytes produced locally or authenticated by your application. Use normal `Runtime.Compile` for untrusted `.wasm` input.

Keep the original Wasm. Rebuild artifacts after an incompatible Wago update and for every operating-system and architecture target you ship. If plugins or custom compiler extensions affect compilation, build and load the artifact through the same runtime configuration and plugin generation.
