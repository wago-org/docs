---
description: Add strict JSON configuration to a Wago plugin and read it during registration.
---

# Configure a plugin

Configuration lives in the reviewed lock entry. The definition describes its shape; the plugin reads the selected value.

## Define the Go shape

```go
type Config struct {
	Prefix     string `json:"prefix"`
	SampleRate int    `json:"sampleRate"`
}
```

## Publish a schema

Set `PluginDefinition.ConfigSchema` to a JSON Schema. Reject unknown fields and bound numbers and strings where you can.

```go
ConfigSchema: json.RawMessage(`{
  "type":"object",
  "additionalProperties":false,
  "properties":{
    "prefix":{"type":"string","maxLength":32},
    "sampleRate":{"type":"integer","minimum":1,"maximum":1000}
  }
}`),
```

The schema describes the public configuration, but the current runtime does not automatically enforce every JSON Schema constraint on the selected value. Implement the actual bounds and semantic checks in `PluginProvider.ValidateConfig` or during registration. Do not rely on `minimum`, `maximum`, or string-length metadata alone to reject a value.

## Read the value

```go
var cfg Config
if err := reg.Config(&cfg); err != nil {
	return err
}
```

`Config` rejects unknown struct fields and trailing JSON. Apply defaults after decoding so they stay visible in code, then enforce bounds:

```go
if cfg.SampleRate == 0 {
    cfg.SampleRate = 10
}
if cfg.SampleRate < 1 || cfg.SampleRate > 1000 {
    return fmt.Errorf("sampleRate must be between 1 and 1000")
}
if utf8.RuneCountInString(cfg.Prefix) > 32 {
    return fmt.Errorf("prefix must be at most 32 characters")
}
```

This uses `fmt` and `unicode/utf8`. Put the same checks in a shared decoding helper if both `ValidateConfig` and `Register` need them.

The complete flow is in [examples/09-plugin-config-lifecycle](https://github.com/wago-org/wago/tree/main/examples/09-plugin-config-lifecycle).

## Change configuration

Pass the complete configuration as JSON:

```sh
wago plugin config github.com/acme/wago-metrics \
  '{"prefix":"demo","sampleRate":10}'
```

For a larger value, save the JSON in `metrics-config.json`:

```sh
wago plugin config github.com/acme/wago-metrics --file metrics-config.json
```

This replaces the selected configuration; it does not merge fields. Omitting both JSON and `--file` sets `{}`. It does not open an editor.

Review the resulting `wago-lock.json` change, then run a representative guest. The CLI checks JSON syntax and rebuilds the runtime, but plugin-specific validation runs when the plugin is loaded. A successful configuration command alone does not prove that startup will succeed. Keep the previous JSON so you can restore it with the same command.

For a real provider with environment, I/O, and filesystem settings, follow [Configure WASI](../../wasi).
