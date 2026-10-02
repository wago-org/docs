---
description: Serialize compiled WebAssembly, load trusted native code, and adopt it into a Wago runtime.
---

# Cache compiled code

A `.wago` artifact stores host-native compiled code. It removes compilation from startup, but it is specific to Wago's artifact format, the target operating system, architecture, and required CPU features.

Use the `module.wasm` from [Run WebAssembly from Go](./runtime-and-modules). Replace `main.go` with:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"slices"

	"github.com/wago-org/wago"
)

func run(ctx context.Context) error {
	wasm, err := os.ReadFile("module.wasm")
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
	if err := os.WriteFile("module.wago", artifact, 0o600); err != nil {
		return err
	}

	trustedBytes, err := os.ReadFile("module.wago")
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

	if slices.Contains(module.Exports(), "_initialize") {
		if _, err := instance.InvokeContext(ctx, "_initialize"); err != nil {
			return err
		}
	}

	results, err := instance.InvokeContext(ctx, "add", wago.I32(20), wago.I32(22))
	if err != nil {
		return err
	}
	fmt.Printf("artifact: %d bytes\n", len(artifact))
	fmt.Println(wago.AsI32(results[0]))
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
42
```

## Treat artifacts as executable code

`LoadTrustedArtifact` is intentionally explicit: a `.wago` file contains native machine code. Load only bytes produced locally or authenticated by your application. Use normal `Runtime.Compile` for untrusted `.wasm` input.

Keep the original Wasm. Rebuild artifacts after an incompatible Wago update and for every operating-system and architecture target you ship. If plugins or custom compiler extensions affect compilation, build and load the artifact through the same runtime configuration and plugin generation.

An artifact contains compiled module code and metadata, not a running instance's memory, globals, or tables. Loading it and instantiating it starts the guest from its initial state. Imports still need to be bound, and a reactor's `_initialize` export still needs to run once per new instance.

`Load` accepts raw Wasm and refuses native `.wago` artifacts; `LoadTrustedArtifact` accepts only artifacts. If an artifact is incompatible, recompile the original `.wasm` with the target runtime instead of bypassing its format or CPU checks. Keep trusted artifacts in an application-owned location and verify their provenance before loading them.

In this example, `AdoptModule` transfers the loaded artifact's ownership to the returned module, and closes it if adoption fails. Closing that module releases the compiled artifact when its users have finished. `Runtime.Module` is the non-owning alternative, so its caller must keep and close the original compiled object.
