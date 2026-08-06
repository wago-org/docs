---
description: Validate guest pointer-length pairs, copy memory safely, and define host function error behavior.
---

# Read guest memory and return errors

Guest addresses are untrusted offsets into linear memory. Check every range, copy only what you need, and make the error contract part of the import design.

## Validate pointer and length

```go
write := wago.HostFunc(func(
	m wago.HostModule,
	params []uint64,
	results []uint64,
) {
	ptr := uint32(params[0])
	length := uint32(params[1])
	memory := m.Memory()

	end := uint64(ptr) + uint64(length)
	if end > uint64(len(memory)) {
		results[0] = wago.I32(-1)
		return
	}

	data := memory[uint64(ptr):end]
	fmt.Printf("guest says %q\n", data)
	results[0] = wago.I32(int32(length))
})
```

Use a wider integer for `ptr + length`; adding two `uint32` values can wrap before the bounds check.

`HostModule.Memory()` returns the default linear memory or an empty slice if the module has none. The mutable view is valid only during this host call. Copy bytes that must outlive the callback.

::: warning Guest memory is untrusted input
Bounds are the first check. Validate encodings, indexes, structured data, and application size limits before passing bytes to a real host resource.
:::

## Design the error contract

Wasm has no built-in Go-style `error` result. Common interfaces:

- return a numeric status and place data in guest memory;
- reserve a sentinel such as `-1`;
- expose another import for structured error details;
- terminate a command-style invocation with a host exit.

For command-style termination:

```go
panic(wago.HostExit{Code: 2})
```

Wago recovers that value as `*wago.ExitError`. Code `0` represents a normal exit. Unexpected Go panics remain programming failures and are not a normal guest error channel.

## Boundary tests

Test an empty input, a pointer at the end of memory, addition overflow, malformed data, the largest allowed request, missing memory, repeated calls, and every status path.
