// Package register exposes this module's explicit Wago provider catalog.
package register

import wago "github.com/wago-org/wago"

type plugin struct{}

const capAnswer = wago.Capability("answer.read")

func (plugin) Register(reg *wago.Registrar) error {
	if err := reg.GuestCapability(
		capAnswer,
		wago.CapabilityDocs("read the tutorial answer"),
	); err != nil {
		return err
	}

	imports, err := reg.HostImports()
	if err != nil {
		return err
	}
	module, err := imports.Module("tutorial")
	if err != nil {
		return err
	}

	module.Func("answer", func(_ wago.HostModule, _, results []uint64) {
		results[0] = 42
	}).Results(wago.ValI32).
		Capability(capAnswer).
		Docs("return the tutorial answer")
	return nil
}

var definition = wago.PluginDefinition{
	ID:          "github.com/acme/wago-answer",
	Name:        "Wago Answer",
	Version:     "0.1.0",
	Description: "A small host import for the Wago plugin tutorial.",
	Stability:   wago.Experimental,
	Compatibility: wago.Compatibility{
		Engines: map[string]string{"wago": "*"},
	},
	Provenance: wago.PluginProvenance{
		Repository: "https://github.com/acme/wago-answer",
		License:    "Apache-2.0",
		Authors:    []string{"Example Maintainer"},
	},
	Authorities: []wago.AuthorityRequest{{
		Name:   wago.AuthorityHostImportDefine,
		Mode:   wago.AuthorityRequired,
		Reason: "define the tutorial guest API",
		Scope: wago.AuthorityScope{
			Modules: []string{"tutorial"},
		},
	}},
}

// Providers returns ordinary values. It does not mutate global Wago state.
func Providers() []wago.PluginProvider {
	return []wago.PluginProvider{{
		Definition: definition,
		New:        func() wago.Plugin { return plugin{} },
	}}
}
