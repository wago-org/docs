---
description: Add strict JSON configuration to a Wago plugin and read it during registration.
---

# Configure a plugin

Configuration lives in the reviewed lock entry. The definition describes its shape; the plugin reads the selected value.

## 1. Define the Go shape

```go
type Config struct {
	Prefix     string `json:"prefix"`
	SampleRate int    `json:"sampleRate"`
}
```

## 2. Publish a schema

Set `PluginDefinition.ConfigSchema` to a JSON Schema. Reject unknown fields and bound numbers and strings where you can.

```go
ConfigSchema: json.RawMessage(`{
  "type":"object",
  "additionalProperties":false,
  "properties":{"prefix":{"type":"string","maxLength":32}}
}`),
```

Use `PluginProvider.ValidateConfig` only for rules the schema cannot express, such as a relationship between two fields.

## 3. Read the value

```go
var cfg Config
if err := reg.Config(&cfg); err != nil {
	return err
}
```

`Config` rejects unknown struct fields and trailing JSON. Apply defaults after decoding so they stay visible in code.

The complete flow is in [examples/09-plugin-config-lifecycle](https://github.com/wago-org/wago/tree/main/examples/09-plugin-config-lifecycle).

## Change configuration

Let Wago prompt for the new value:

```sh
wago plugin config github.com/acme/wago-metrics
```

Wago validates and rebuilds before replacing project state. Review the resulting `wago-lock.json` change.
