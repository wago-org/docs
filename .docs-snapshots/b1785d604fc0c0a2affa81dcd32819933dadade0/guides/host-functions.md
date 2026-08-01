---
description: Run Wago's host-function examples, implement a WebAssembly import in Go, and exchange data through guest memory safely.
---

# Host functions and guest memory

A host function is a Go function that a WebAssembly module calls synchronously. Start with Wago's small examples, then wire an imported function to Go and read a string from guest memory without trusting its pointer.

## 1. Run the finished examples

Clone Wago into a disposable directory:

```sh
git clone --depth 1 https://github.com/wago-org/wago.git wago-examples
cd wago-examples
```

Run the numeric host-import example:

```sh
go run ./examples/03-host-import
```

You should see:

```text
square(9) = 81
```

Now run the memory example:

```sh
go run ./examples/04-memory
```

Its output is:

```text
guest wrote: "hello from wasm"
run() wrote 15 bytes
memory[0] is now 'H'
```

Keep those examples open while reading the next steps. They are short enough to change and rerun.

## 2. Read the guest's import

The numeric example contains the equivalent of this WebAssembly declaration:

```wat
(import "host" "square" (func $square (param i32) (result i32)))
```

The full import key is `host.square`. The guest promises to pass one `i32`; the host must return one `i32`.

## 3. Implement the function in Go

```go
square := wago.HostFunc(func(_ wago.HostModule, params, results []uint64) {
	n := wago.AsI32(params[0])
	results[0] = wago.I32(n * n)
})
```

Every host function uses the same reflection-free stack form. Decode parameters with `AsI32`, `AsI64`, `AsF32`, or `AsF64`. Encode results with the matching `I32`, `I64`, `F32`, or `F64` helper.

Wago checks the import signature during instantiation. A mismatched function fails before the guest gets a chance to call it.

## 4. Supply the import

Pass the function when you instantiate the compiled module:

```go
inst, err := wago.Instantiate(compiled, wago.InstantiateOptions{
	Imports: wago.Imports{
		"host.square": square,
	},
})
if err != nil {
	panic(err)
}
defer inst.Close()
```

The string key must match both parts of the guest declaration. `square`, `env.square`, and `host.square` are three different imports.

## 5. Read a guest string

WebAssembly often passes a string as two `i32` values: a pointer into linear memory and a byte length.

```go
write := wago.HostFunc(func(m wago.HostModule, params, results []uint64) {
	ptr := uint32(wago.AsI32(params[0]))
	n := uint32(wago.AsI32(params[1]))
	mem := m.Memory()

	end := uint64(ptr) + uint64(n)
	if end > uint64(len(mem)) {
		results[0] = wago.I32(-1)
		return
	}

	message := string(mem[ptr:uint32(end)])
	fmt.Println(message)
	results[0] = wago.I32(int32(n))
})
```

Convert the pointer and length before adding them. Adding as `uint32` could wrap around before the bounds check.

The memory slice is mutable, so host writes become visible to the guest during the call.

::: warning Do not keep the memory slice
`HostModule.Memory()` is valid only while the host function is running. Copy bytes you need later. Do not save the slice or `HostModule` for another goroutine.
:::

## 6. Access memory from the host side

Outside a host callback, use the instance's bounds-checked helpers:

```go
value, ok := inst.ReadUint32Le(offset)
if !ok {
	return errors.New("guest pointer is out of bounds")
}

if !inst.WriteFloat64Le(offset+8, float64(value)) {
	return errors.New("guest write is out of bounds")
}
```

Use `Read` and `Write` for byte slices. Out-of-bounds reads return `ok == false`; out-of-bounds writes return `false` and leave memory unchanged.

## 7. Decide whether this should become a plugin

Keep a host function inside the application when one codebase owns both sides of the interface. Build a plugin when the capability needs a name, version, configuration, lifecycle hooks, or reuse across projects.

Continue with [Use plugins in a project](/guides/plugins) when the host integration is becoming a package other applications should install.
