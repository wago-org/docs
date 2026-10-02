package register

import (
	"context"
	"os"
	"testing"

	wago "github.com/wago-org/wago"
)

func TestAnswerFromGuest(t *testing.T) {
	provider := Providers()[0]
	digest, err := wago.DefinitionDigest(provider.Definition)
	if err != nil {
		t.Fatal(err)
	}
	set := wago.PluginSet{
		Providers: []wago.PluginProvider{provider},
		Selections: []wago.PluginSelection{{
			ID:               provider.Definition.ID,
			Direct:           true,
			DefinitionDigest: digest,
			Grants: []wago.AuthorityGrant{{
				Name:  wago.AuthorityHostImportDefine,
				Scope: wago.AuthorityScope{Modules: []string{"tutorial"}},
			}},
		}},
	}
	ctx := context.Background()
	rt := wago.NewRuntime()
	defer rt.Close()
	if err := rt.LoadPlugins(ctx, set); err != nil {
		t.Fatal(err)
	}
	wasm, err := os.ReadFile("../testdata/answer.wasm")
	if err != nil {
		t.Fatal(err)
	}
	mod, err := rt.Compile(wasm)
	if err != nil {
		t.Fatal(err)
	}
	defer mod.Close()
	in, err := rt.Instantiate(ctx, mod)
	if err != nil {
		t.Fatal(err)
	}
	defer in.Close()
	results, err := in.Invoke("run")
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 || wago.AsI32(results[0]) != 42 {
		t.Fatalf("run() = %v, want 42", results)
	}
}
