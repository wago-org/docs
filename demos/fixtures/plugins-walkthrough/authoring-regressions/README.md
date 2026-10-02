# Authoring snippet regressions

Run from the docs checkout with Python 3 and Go 1.22 or newer on `PATH`:

```sh
python3 demos/fixtures/plugins-walkthrough/authoring-regressions/check.py
python3 demos/fixtures/plugins-walkthrough/authoring-regressions/check.py --race
```

The script extracts the real Go blocks from `contracts.md` and `configuration.md`,
puts them into a temporary module, and resolves the same public Wago version as
`../answer/go.mod`. It does not import a local Wago checkout, add `replace`
directives, use a Go workspace, publish a package, or change the selected runtime.
The first run needs network access to the public Go modules. Set `GOMODCACHE` and
`GOCACHE` to empty directories if you also want to verify uncached resolution.

Checks cover:

- the documented concrete provider value compiles with the typed Contract
- the documented consumer calls its Contract after registration commits
- calling the same Contract during registration is rejected
- omitted configuration keeps its default, while explicit zero, negative values,
  values above the maximum, long prefixes, unknown fields, and trailing JSON fail

The extraction map deliberately checks the number of Go blocks. Update it when
restructuring a guide rather than silently running a stale copied example.
