---
description: Pass strings through a pointer-length host import, reject invalid ranges, and read and write guest memory from Go.
---

# Exchange bytes with a guest

WebAssembly pointers are offsets into linear memory. A pointer-length pair needs a bounds check before Go can use it, even when the guest normally sends a valid string.

This example gives the guest one 64 KiB memory page. The guest calls `env.write`, and the host copies the requested bytes before printing them. You will also try an invalid range and see how checked host reads behave after a write.

Continue in the Go project from [Run WebAssembly from Go](./runtime-and-modules). This example needs WABT's `wat2wasm`, regardless of your earlier guest language. Create `guest/message.wat`:

```wat
(module
  (import "env" "write" (func $write (param i32 i32) (result i32)))
  (memory (export "memory") 1 1)
  (data (i32.const 0) "hello from wasm")
  (func (export "say") (result i32)
    i32.const 0
    i32.const 15
    call $write)
  (func (export "write_range") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    call $write))
```

```sh
wat2wasm guest/message.wat -o message.wasm
```

Replace `main.go` with:

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
	wasm, err := os.ReadFile("message.wasm")
	if err != nil {
		return err
	}

	imports := wago.NewImports()
	imports.HostFunc("env", "write", func(caller wago.Caller, call wago.HostCall) {
		ptr := uint32(call.I32(0))
		length := uint32(call.I32(1))
		memory := caller.Memory()
		end := uint64(ptr) + uint64(length)
		if end > uint64(len(memory)) {
			call.SetI32(0, -1)
			return
		}

		data := append([]byte(nil), memory[uint64(ptr):end]...)
		fmt.Printf("guest says %q\n", data)
		call.SetI32(0, int32(length))
	}).Params(wago.ValI32, wago.ValI32).Results(wago.ValI32)

	runtime := wago.NewRuntime()
	defer runtime.Close()
	module, err := runtime.Compile(wasm)
	if err != nil {
		return err
	}
	defer module.Close()
	instance, err := runtime.Instantiate(ctx, module, wago.WithImports(imports))
	if err != nil {
		return err
	}
	defer instance.Close()

	out, err := instance.InvokeContext(ctx, "say")
	if err != nil {
		return err
	}
	fmt.Println("bytes written:", wago.AsI32(out[0]))

	// -1 encodes the unsigned pointer 0xffffffff. Adding 2 in a uint32
	// would wrap to 1 and could make an unsafe range appear valid.
	out, err = instance.InvokeContext(ctx, "write_range", wago.I32(-1), wago.I32(2))
	if err != nil {
		return err
	}
	fmt.Println("invalid range:", wago.AsI32(out[0]))

	saved, ok := instance.Read(0, 15)
	if !ok {
		return fmt.Errorf("could not read guest message")
	}
	if !instance.Write(0, []byte("Hello")) {
		return fmt.Errorf("could not update guest message")
	}
	current, ok := instance.Read(0, 15)
	if !ok {
		return fmt.Errorf("could not read updated message")
	}
	fmt.Printf("saved copy: %q\n", saved)
	fmt.Printf("current memory: %q\n", current)

	// The last byte exists, but a two-byte write would cross the boundary.
	fmt.Println("out-of-bounds write accepted:", instance.Write(65535, []byte{1, 2}))
	last, ok := instance.ReadUint8(65535)
	if !ok {
		return fmt.Errorf("could not read last byte")
	}
	fmt.Println("last byte:", last)
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

```text
guest says "hello from wasm"
bytes written: 15
invalid range: -1
saved copy: "hello from wasm"
current memory: "Hello from wasm"
out-of-bounds write accepted: false
last byte: 0
```

## Keep borrowed memory inside the callback

`Caller`, `HostCall`, its parameter and result slot slices, and `Caller.Memory()` are borrowed for the synchronous callback. They must not escape into a goroutine or be used after the callback returns. Copy bytes into Go-owned storage if you need to retain them. Check the range before making that copy.

The guest and host agree here that `-1` means an invalid range. Wago does not assign that status meaning; your ABI does. A real host writer may also need a smaller application-level length limit and rules for encoding, partial writes, or errors.

## Use checked copies outside callbacks

`Instance.Read` returns a copy. `Instance.Write` checks the entire range before changing memory. The example's failed write therefore leaves the last byte untouched. Typed helpers such as `ReadUint32Le` and `WriteUint32Le` use little-endian scalar values.

`Instance.Memory().UnsafeBytes()` is a mutable, zero-copy view. Its lifetime is your responsibility: it does not keep the instance open or make concurrent guest and host access safe. Do not retain it across calls that may grow memory, shutdown, or operations you do not control. Prefer the checked copy helpers for ordinary application code.

These convenience helpers address memory 0 with 32-bit offsets. For indexed memory or Memory64, design that ABI explicitly and use the plugin guest-storage interfaces described in [plugin host imports](../plugins/authoring/host-imports).
