// Run an adder component or a WASI Preview 2 command through a typed lease.
package main

import (
	"context"
	"fmt"
	"os"

	component "github.com/wago-org/component-model"
	wago "github.com/wago-org/wago"
	"github.com/wago-org/wago/plugin"
	"github.com/wago-org/wasi/p2"
)

type consumer struct {
	components *plugin.Ref[component.Service]
}

func (p *consumer) Register(reg *wago.Registrar) error {
	var err error
	p.components, err = plugin.Require(reg, component.Contract)
	return err
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run() error {
	if len(os.Args) < 3 || (os.Args[1] != "add" && os.Args[1] != "wasi") {
		return fmt.Errorf("usage: go run . add|wasi component.wasm [guest args...]")
	}
	wasm, err := os.ReadFile(os.Args[2])
	if err != nil {
		return err
	}
	ctx := context.Background()
	host := &consumer{}
	provider := component.Provider()
	app := wago.PluginProvider{
		Definition: wago.PluginDefinition{
			ID:         "example.com/wago-component-walkthrough",
			Version:    "1.0.0",
			Provenance: wago.PluginProvenance{Repository: "https://example.com/wago-component-walkthrough", License: "Apache-2.0"},
			Requires:   []wago.PluginRequirement{{ID: component.PluginID, Version: "^0.1.0"}},
			Consumes:   []wago.ContractRequirement{{ID: component.Contract.ID(), Major: component.Contract.Major(), Mode: wago.ContractRequired}},
		},
		New: func() wago.Plugin { return host },
	}
	providerDigest, err := wago.DefinitionDigest(provider.Definition)
	if err != nil {
		return err
	}
	appDigest, err := wago.DefinitionDigest(app.Definition)
	if err != nil {
		return err
	}
	// These explicit grants are the walkthrough's reviewed policy. A production
	// host should load reviewed selections, not grant arbitrary provider requests.
	set := wago.PluginSet{
		Providers: []wago.PluginProvider{provider, app},
		Selections: []wago.PluginSelection{
			{
				ID:               component.PluginID,
				DefinitionDigest: providerDigest,
				Grants: []wago.AuthorityGrant{
					{Name: wago.AuthorityCoreModuleCompile},
					{Name: wago.AuthorityCoreInstanceInstantiate, Scope: wago.AuthorityScope{MaxInstances: 64, MaxMemoryBytes: 16 << 30}},
					{Name: wago.AuthorityCoreFuncRefCreate},
				},
			},
			{
				ID:               app.Definition.ID,
				DefinitionDigest: appDigest,
				Direct:           true,
				Dependencies:     map[string]string{component.PluginID: "^0.1.0"},
				Contracts:        []wago.ContractBinding{{ID: component.Contract.ID(), Major: component.Contract.Major(), Providers: []string{component.PluginID}}},
			},
		},
	}
	rt := wago.NewRuntime()
	defer rt.Close()
	if err := rt.LoadPlugins(ctx, set); err != nil {
		return err
	}
	return host.components.With(func(service component.Service) error {
		if os.Args[1] == "wasi" {
			return p2.Run(ctx, service, wasm, p2.Config{
				Stdin:  p2.NewInputStream(os.Stdin),
				Stdout: p2.NewOutputStream(os.Stdout),
				Stderr: p2.NewOutputStream(os.Stderr),
				Args:   append([]string{os.Args[2]}, os.Args[3:]...),
				Env:    []string{"WAGO_FLAVOR=docs"},
			})
		}
		return service.WithInstance(ctx, wasm, func(in *component.Instance) error {
			values, err := in.CallExport(ctx, "component:adder/calc", "add", uint32(2), uint32(3))
			if err != nil {
				return err
			}
			if len(values) != 1 || values[0] != uint32(5) {
				return fmt.Errorf("add(2, 3) = %v, want [5]", values)
			}
			fmt.Printf("add(2, 3) = %v\n", values[0])
			return nil
		})
	})
}
