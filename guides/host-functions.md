---
description: Implement WebAssembly imports in Go with typed slots, checked memory access, and explicit host authority.
---

# Host functions

WebAssembly reaches the outside world through imports supplied by its host. Wago uses one reflection-free function shape under standard Go and TinyGo:

```go
type HostFunc func(m wago.HostModule, params, results []uint64)
```

## Pick a topic

<CardGroup>
  <Card title="Signatures and slots" href="/guides/host-functions/signatures" icon="fa-code">
    Bind imports and encode scalar, vector, and reference values correctly.
  </Card>
  <Card title="Memory and errors" href="/guides/host-functions/memory-and-errors" icon="fa-right-left">
    Validate pointer-length pairs and design a deliberate guest error contract.
  </Card>
  <Card title="Authority and references" href="/guides/host-functions/authority-and-references" icon="fa-plug">
    Keep host power narrow and work safely with caller identity and references.
  </Card>
</CardGroup>

## Quick answers

<Accordion title="How do I bind host.mul?" open>

```go
inst, err := rt.Instantiate(ctx, mod, wago.WithImports(wago.Imports{
	"host.mul": mul,
}))
```

The key joins the Wasm import module and field with a dot. See [Signatures and slots](/guides/host-functions/signatures).

</Accordion>

<Accordion title="Can I keep HostModule after the callback?">

No. Its memory view and caller authority are valid only during the synchronous host call. Copy any bytes you need to retain. See [Authority and references](/guides/host-functions/authority-and-references).

</Accordion>

<Accordion title="How should a host function return an error?">

Design it into the Wasm interface: use a status value, an error buffer, or a command-style `HostExit`. Do not use unexpected Go panics as a normal error channel. See [Memory and errors](/guides/host-functions/memory-and-errors).

</Accordion>
