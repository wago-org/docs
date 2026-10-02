#!/usr/bin/env python3
"""Compile and exercise the real authoring-guide Go snippets in a fresh module."""

import argparse
import os
from pathlib import Path
import re
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
GUIDES = REPO / "guides/plugins/authoring"


def go_blocks(name):
    return re.findall(r"```go\n(.*?)```", (GUIDES / name).read_text(), re.S)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--race", action="store_true", help="also enable the Go race detector")
args = parser.parse_args()
contract = go_blocks("contracts.md")
config = go_blocks("configuration.md")
if len(contract) != 6 or len(config) != 4:
    raise SystemExit("Guide block layout changed; update the extraction map explicitly")
version = re.search(
    r"require github.com/wago-org/wago (\S+)",
    (HERE.parent / "answer/go.mod").read_text(),
).group(1)

source = r'''package authoring

import (
    "context"
    "encoding/json"
    "fmt"
    "strings"
    "testing"
    "unicode/utf8"

    wago "github.com/wago-org/wago"
)

__CONTRACT_IMPORT__

__CONTRACT_DECLARATION__

__CONFIG_TYPE__

type pluginFunc func(*wago.Registrar) error
func (p pluginFunc) Register(reg *wago.Registrar) error { return p(reg) }

type clockImpl struct{}
func (clockImpl) UnixMillis() int64 { return 42 }

func documentedProvision(reg *wago.Registrar) error {
    // Use a concrete implementation to exercise the guide's generic type argument.
    clock := clockImpl{}
    __PROVIDE__
}

func documentedConsumption(reg *wago.Registrar) error {
    __REQUIRE__
    __CALL__
}

func documentedConfig(reg *wago.Registrar) error {
    __DECODE__
    __VALIDATE__
    return nil
}

func definition(id string) wago.PluginDefinition {
    return wago.PluginDefinition{
        ID: id, Name: id, Version: "1.0.0", Stability: wago.Experimental,
        Provenance: wago.PluginProvenance{Repository: "https://"+id, License: "Apache-2.0"},
    }
}

func reviewed(t *testing.T, providers ...wago.PluginProvider) wago.PluginSet {
    t.Helper()
    set := wago.PluginSet{Providers: providers}
    for _, provider := range providers {
        digest, err := wago.DefinitionDigest(provider.Definition)
        if err != nil { t.Fatal(err) }
        selection := wago.PluginSelection{
            ID: provider.Definition.ID, DefinitionDigest: digest,
            Direct: true, Dependencies: map[string]string{},
        }
        for _, requirement := range provider.Definition.Requires {
            selection.Dependencies[requirement.ID] = requirement.Version
        }
        for _, requirement := range provider.Definition.Consumes {
            binding := wago.ContractBinding{ID: requirement.ID, Major: requirement.Major}
            for _, candidate := range providers {
                for _, provided := range candidate.Definition.Provides {
                    if provided.ID == requirement.ID && provided.Major == requirement.Major {
                        binding.Providers = append(binding.Providers, candidate.Definition.ID)
                    }
                }
            }
            selection.Contracts = append(selection.Contracts, binding)
        }
        set.Selections = append(set.Selections, selection)
    }
    return set
}

func contractSet(t *testing.T, consume pluginFunc) wago.PluginSet {
    providerDefinition := definition("github.com/acme/wago-clock")
    providerDefinition.Provides = []wago.ContractSpec{Contract.Spec()}
    documentedRequirements := wago.PluginDefinition{
        __REQUIREMENTS__
    }
    consumerDefinition := definition("example.com/clock-consumer")
    consumerDefinition.Requires = documentedRequirements.Requires
    consumerDefinition.Consumes = documentedRequirements.Consumes
    return reviewed(t,
        wago.PluginProvider{Definition: providerDefinition, New: func() wago.Plugin { return pluginFunc(documentedProvision) }},
        wago.PluginProvider{Definition: consumerDefinition, New: func() wago.Plugin { return consume }},
    )
}

func TestDocumentedContractLifecycle(t *testing.T) {
    rt := wago.NewRuntime()
    defer rt.Close()
    if err := rt.LoadPlugins(context.Background(), contractSet(t, documentedConsumption)); err != nil {
        t.Fatal(err)
    }
}

func TestContractRejectsUseDuringRegistration(t *testing.T) {
    // This deliberately reproduces the old guide's invalid timing.
    rt := wago.NewRuntime()
    defer rt.Close()
    err := rt.LoadPlugins(context.Background(), contractSet(t, func(reg *wago.Registrar) error {
        __REQUIRE__
        return clock.With(func(service Clock) error { return nil })
    }))
    if err == nil || !strings.Contains(err.Error(), "not active") {
        t.Fatalf("LoadPlugins() = %v, want inactive-contract failure", err)
    }
}

func TestDocumentedConfiguration(t *testing.T) {
    for _, tc := range []struct{name, value string; wantError bool}{
        {"omitted keeps default", `{}`, false},
        {"valid", `{"prefix":"demo","sampleRate":10}`, false},
        {"explicit zero", `{"sampleRate":0}`, true},
        {"negative", `{"sampleRate":-1}`, true},
        {"above maximum", `{"sampleRate":1001}`, true},
        {"long prefix", `{"prefix":"123456789012345678901234567890123"}`, true},
        {"unknown field", `{"extra":1}`, true},
        {"trailing JSON", `{} {}`, true},
    } {
        t.Run(tc.name, func(t *testing.T) {
            d := definition("example.com/config")
            schema := wago.PluginDefinition{
                __SCHEMA__
            }
            d.ConfigSchema = schema.ConfigSchema
            provider := wago.PluginProvider{Definition: d, New: func() wago.Plugin { return pluginFunc(documentedConfig) }}
            set := reviewed(t, provider)
            set.Selections[0].Config = json.RawMessage(tc.value)
            rt := wago.NewRuntime()
            defer rt.Close()
            err := rt.LoadPlugins(context.Background(), set)
            if (err != nil) != tc.wantError {
                t.Fatalf("LoadPlugins(%s) = %v, wantError=%v", tc.value, err, tc.wantError)
            }
        })
    }
}
'''
replacements = {
    "__CONTRACT_IMPORT__": contract[0],
    "__CONTRACT_DECLARATION__": contract[1],
    "__PROVIDE__": contract[2],
    "__REQUIREMENTS__": contract[3],
    "__REQUIRE__": contract[4],
    "__CALL__": contract[5],
    "__CONFIG_TYPE__": config[0],
    "__SCHEMA__": config[1],
    "__DECODE__": config[2],
    "__VALIDATE__": config[3],
}
for marker, snippet in replacements.items():
    source = source.replace(marker, snippet)

env = dict(os.environ, GOWORK="off")
with tempfile.TemporaryDirectory(prefix="wago-authoring-regressions-") as tmp:
    project = Path(tmp)
    (project / "go.mod").write_text(
        "module example.com/wago-authoring-regressions\n\ngo 1.22\n\n"
        f"require github.com/wago-org/wago {version}\n"
    )
    (project / "authoring_test.go").write_text(source)
    print(f"Testing Markdown snippets against github.com/wago-org/wago {version}", flush=True)
    for command in (
        ["gofmt", "-w", "authoring_test.go"],
        ["go", "mod", "tidy"],
        ["go", "test", *(["-race"] if args.race else []), "-count=1", "-v", "./..."],
    ):
        subprocess.run(command, cwd=project, env=env, check=True)
