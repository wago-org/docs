---
description: Short answers about Wago plugin trust, builds, scopes, lockfiles, configuration, Contracts, testing, and publishing.
---

# Plugin FAQ

<Accordion title="Do I need a plugin for every Wasm module?">

No. Modules that only use core WebAssembly can run with the bare runtime. Inspect a module first:

```sh
wago module imports module.wasm
```

Add a plugin when those imports or another runtime feature need one.

</Accordion>

<Accordion title="Why does WASI come from a plugin?">

WASI is a host interface, not a core WebAssembly instruction set. Keeping it in a plugin lets a project choose the WASI version and capabilities it needs without adding them to every Wago runtime.

</Accordion>

<Accordion title="Do plugins require Go?">

Yes. Wago compiles selected plugins into a project or global runtime. Install Go 1.22 or newer before adding or rebuilding plugins.

</Accordion>

<Accordion title="Why does adding a plugin take longer than running a module?">

`wago add` resolves packages, checks definitions and grants, downloads Go modules, generates a runtime, and builds it. Later runs reuse that built runtime until the selected graph changes.

</Accordion>

<Accordion title="Should I install a plugin locally or globally?">

Use local scope for a project you may share or deploy. Its manifest and lockfile travel with the repository. Use global scope for personal tools you want in unrelated directories.

</Accordion>

<Accordion title="Are plugins sandboxed?">

No. Plugins are native Go dependencies in the host process. Authorities limit their access to privileged Wago handles, but ordinary Go code can still use the operating system and process APIs available to the host.

</Accordion>

<Accordion title="What is an Authority?">

An Authority is one exact privileged Wago integration, such as defining imports in a named module or observing invocations. The publisher requests it with a reason and scope; the consumer reviews the grant during installation.

</Accordion>

<Accordion title="What happens if I deny a required Authority?">

Wago leaves the previous runtime and project state in place. You can narrow a required scope, but registration fails if the plugin cannot work within that grant. Optional Authorities may be omitted.

</Accordion>

<Accordion title="How are guest capabilities different from plugin Authorities?">

A plugin Authority controls what trusted Go plugin code may add to Wago. A guest capability controls what a Wasm module may use through the host. A filesystem plugin may need `host.import.define` while exposing `fs.read` and `fs.write` to guest policy.

</Accordion>

<Accordion title="Why are there two JSON files?">

`wago.json` records direct project intent and version ranges. `wago-lock.json` records exact sources, checksums, definitions, grants, configuration, dependencies, and Contract bindings. Commit both for local projects.

</Accordion>

<Accordion title="Can I edit wago-lock.json by hand?">

Do not edit digests, checksums, grants, or bindings to silence a failure. Use `wago add`, `wago plugin grant`, `wago plugin config`, `wago plugin update`, or `wago rm`, then review the generated diff.

</Accordion>

<Accordion title="Why does a plugin expose a register package?">

Generated runtimes import `/register` and call `Providers()` to collect explicit provider values. Wago does not use hidden process-global registration from `init`.

</Accordion>

<Accordion title="Can one repository publish several plugins?">

Yes. Give each provider a canonical package ID and immutable definition, then return the providers from the module's root catalog. The root package can also act as an aggregate that selects subpackages.

</Accordion>

<Accordion title="Can a plugin add custom Wasm instructions?">

Yes. The guest imports an ordinary function, and a plugin with `compiler.instruction.define` supplies its semantics and compiler lowering. Start with [Custom instructions](./authoring/custom-instructions).

</Accordion>

<Accordion title="What is a custom compiler type?">

It is a plugin-owned value that stays in native registers between custom instruction calls. The guest uses a standard carrier such as `externref`; no new Wasm binary type is required. See [Custom types](./authoring/custom-types).

</Accordion>

<Accordion title="Which guest languages can use a plugin?">

Any language that can emit the plugin's ordinary Wasm imports. The examples include [WAT, AssemblyScript, and TinyGo](./authoring/guest-languages).

</Accordion>

<Accordion title="Where does plugin configuration live?">

The selected JSON value lives in the plugin entry in `wago-lock.json`. Change it with `wago plugin config`; do not put plugin-owned settings under the core `settings` object in `wago.json`.

</Accordion>

<Accordion title="When should two plugins use a Contract?">

Use a Contract when one plugin needs a typed Go service from another. Keep the interface small, give it a stable ID and incompatible major version, and access values only through the leased `With` callback.

</Accordion>

<Accordion title="Does inspection run plugin code?">

`wago plugin inspect`, `wago plugin list --json`, and immutable plan inspection read definitions and reviewed selections without calling factories, `Register`, `Start`, or `Stop`.

</Accordion>

<Accordion title="How do I test an unpublished plugin?">

Run normal Go tests, validate a `PluginSet` with `wago.ValidatePluginSet`, and check the generated catalog. The public CLI install path needs a published module release, so test that path from a clean project after pushing a test version.

</Accordion>

<Accordion title="Can the public registry host a private plugin?">

No. Registry releases point to public source and are verified from the tagged Go module. An embedder can link its own provider catalog directly in Go, but that is a separate deployment path from registry installation.

</Accordion>

<Accordion title="Why did a locked rebuild fail after an update?">

The manifest, module cache, provider catalog, definition, grant, configuration, or Contract binding no longer matches the committed graph. Run a networked update, review and commit the result, then retry `wago plugin rebuild --locked`.

</Accordion>

<Accordion title="How do I remove a plugin?">

Run:

```sh
wago rm github.com/acme/plugin
```

Wago removes transitive plugins that no other direct requirement needs and asks you to review any changed Contract bindings.

</Accordion>
