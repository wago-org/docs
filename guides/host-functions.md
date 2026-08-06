---
description: Implement WebAssembly imports in Go with typed slots, checked memory access, and explicit host authority.
---

# Host functions

WebAssembly reaches the outside world through imports supplied by its host. Wago uses one reflection-free function shape under standard Go and TinyGo:

```go
type HostFunc func(m wago.HostModule, params, results []uint64)
```

Run the complete example:

```sh
go run github.com/wago-org/wago/examples/03-host-import@latest
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
