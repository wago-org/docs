package main

import (
	"context"
	"errors"
	"os"
	"reflect"
	"testing"
	"time"

	"github.com/wago-org/wago"
)

func fixture(t *testing.T, fn any) (*wago.Runtime, *wago.Module, *wago.Instance) {
	t.Helper()
	wasm, err := os.ReadFile("boundaries.wasm")
	if err != nil {
		t.Fatal(err)
	}
	runtime := wago.NewRuntime()
	t.Cleanup(func() {
		if err := runtime.CloseContext(context.Background()); err != nil {
			t.Error(err)
		}
	})
	module, err := runtime.Compile(wasm)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := module.Close(); err != nil {
			t.Error(err)
		}
	})
	imports := wago.NewImports()
	if fn == nil {
		fn = func(x int32) int32 { return x + 1 }
	}
	binding := imports.HostFunc("host", "step", fn)
	switch fn.(type) {
	case func(wago.Caller, wago.HostCall), func(wago.HostCall):
		binding.Params(wago.ValI32).Results(wago.ValI32)
	}
	instance, err := runtime.Instantiate(context.Background(), module, wago.WithImports(imports))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := instance.Close(); err != nil {
			t.Error(err)
		}
	})
	return runtime, module, instance
}

func TestNumericSlotsAndTypedValues(t *testing.T) {
	_, _, instance := fixture(t, nil)
	cases := []struct {
		name  string
		raw   uint64
		typed wago.Value
	}{
		{"i32", wago.I32(-7), wago.ValueI32(-7)},
		{"i64", wago.I64(-1 << 42), wago.ValueI64(-1 << 42)},
		{"f32", wago.F32(1.25), wago.ValueF32(1.25)},
		{"f64", wago.F64(-2.5), wago.ValueF64(-2.5)},
	}
	for _, item := range cases {
		raw, err := instance.InvokeContext(context.Background(), item.name, item.raw)
		if err != nil || len(raw) != 1 || raw[0] != item.raw {
			t.Fatalf("%s raw = %v, %v", item.name, raw, err)
		}
		typed, err := instance.InvokeValues(context.Background(), item.name, item.typed)
		if err != nil || len(typed) != 1 || !reflect.DeepEqual(typed[0], item.typed) {
			t.Fatalf("%s typed = %v, %v", item.name, typed, err)
		}
	}
	if _, err := instance.InvokeValues(context.Background(), "i32", wago.ValueF64(7)); err == nil {
		t.Fatal("typed mismatch accepted")
	}
	if _, err := instance.Invoke("i32"); err == nil {
		t.Fatal("wrong arity accepted")
	}
	if _, err := instance.Invoke("missing"); err == nil {
		t.Fatal("missing export accepted")
	}
	vector := []uint64{0x0123456789abcdef, 0xfedcba9876543210}
	vectorOut, err := instance.Invoke("v128", vector...)
	if err != nil || !reflect.DeepEqual(vectorOut, vector) {
		t.Fatalf("v128 = %v, %v", vectorOut, err)
	}
	if _, err := instance.InvokeValues(context.Background(), "v128", wago.ValueI64(1)); err == nil {
		t.Fatal("typed v128 call accepted")
	}
	pair, err := instance.Invoke("pair", wago.I32(2), wago.I64(1<<40))
	if err != nil || !reflect.DeepEqual(pair, []uint64{wago.I32(2), wago.I64(1 << 40)}) {
		t.Fatalf("pair = %v, %v", pair, err)
	}
	resolved, err := instance.WasmFunc("sum5")
	if err != nil {
		t.Fatal(err)
	}
	out, err := resolved.Invoke(wago.I32(1), wago.I32(2), wago.I32(3), wago.I32(4), wago.I32(5))
	if err != nil || wago.AsI32(out[0]) != 15 {
		t.Fatalf("sum5 = %v, %v", out, err)
	}
}

func TestCopiedResultsSurviveAndCloseRejectsCalls(t *testing.T) {
	_, _, instance := fixture(t, nil)
	out, err := instance.Invoke("i32", wago.I32(42))
	if err != nil {
		t.Fatal(err)
	}
	saved := append([]uint64(nil), out...)
	typed, err := instance.InvokeValues(context.Background(), "i32", wago.ValueI32(43))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := instance.Invoke("i32", wago.I32(99)); err != nil {
		t.Fatal(err)
	}
	if wago.AsI32(saved[0]) != 42 || typed[0].I32() != 43 {
		t.Fatal("owned results changed")
	}
	fn, err := instance.WasmFunc("i32")
	if err != nil {
		t.Fatal(err)
	}
	if err := instance.Close(); err != nil {
		t.Fatal(err)
	}
	if err := instance.WaitClosed(context.Background()); err != nil {
		t.Fatal(err)
	}
	if _, err := instance.Invoke("i32", wago.I32(1)); err == nil {
		t.Fatal("closed named call accepted")
	}
	if _, err := fn.Invoke(wago.I32(1)); err == nil {
		t.Fatal("closed resolved call accepted")
	}
	if _, ok := instance.Read(0, 1); ok {
		t.Fatal("closed read accepted")
	}
}

func TestHostTrapAndGuestTrap(t *testing.T) {
	original := errors.New("host dependency failed")
	_, _, instance := fixture(t, func(int32) int32 { panic(wago.HostTrap{Err: original}) })
	if _, err := instance.Invoke("host", wago.I32(7)); !errors.Is(err, original) {
		t.Fatalf("host trap = %v", err)
	}
	_, err := instance.Invoke("unreachable")
	var trap *wago.TrapError
	if !errors.As(err, &trap) {
		t.Fatalf("guest trap = %v", err)
	}
}

func TestHostReentryRequiresActiveCaller(t *testing.T) {
	var instance *wago.Instance
	var retained wago.Caller
	_, _, instance = fixture(t, func(caller wago.Caller, call wago.HostCall) {
		retained = caller
		out, err := instance.InvokeFromHost(context.Background(), caller, "i32", wago.I32(call.I32(0)+1))
		if err != nil {
			panic(wago.HostTrap{Err: err})
		}
		call.SetI32(0, wago.AsI32(out[0]))
	})
	out, err := instance.Invoke("host", wago.I32(41))
	if err != nil || wago.AsI32(out[0]) != 42 {
		t.Fatalf("reentry = %v, %v", out, err)
	}
	if _, err := instance.InvokeFromHost(context.Background(), retained, "i32", wago.I32(1)); !errors.Is(err, wago.ErrPermissionDenied) {
		t.Fatalf("retained caller = %v", err)
	}
}

func TestCallsSerializeAcrossHostCallbacks(t *testing.T) {
	entered := make(chan struct{}, 2)
	release := make(chan struct{})
	_, _, instance := fixture(t, func(x int32) int32 {
		entered <- struct{}{}
		<-release
		return x + 1
	})
	finished := make(chan error, 2)
	invoke := func(x int32) {
		out, err := instance.InvokeValues(context.Background(), "host", wago.ValueI32(x))
		if err == nil && out[0].I32() != x+1 {
			err = errors.New("wrong result")
		}
		finished <- err
	}
	go invoke(1)
	<-entered
	go invoke(2)
	select {
	case <-entered:
		close(release)
		t.Fatal("second callback entered before first returned")
	case <-time.After(20 * time.Millisecond):
	}
	close(release)
	for range 2 {
		select {
		case err := <-finished:
			if err != nil {
				t.Fatal(err)
			}
		case <-time.After(time.Second):
			t.Fatal("calls did not finish")
		}
	}
}

func TestAdmissionBudgetIsReused(t *testing.T) {
	wasm, err := os.ReadFile("counter.wasm")
	if err != nil {
		t.Fatal(err)
	}
	config := wago.NewRuntimeConfig().WithInstanceLimits(1, 0)
	runtime := wago.NewRuntime(wago.WithRuntimeConfig(config))
	defer runtime.Close()
	module, err := runtime.Compile(wasm)
	if err != nil {
		t.Fatal(err)
	}
	defer module.Close()
	first, err := runtime.Instantiate(context.Background(), module)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := runtime.Instantiate(context.Background(), module); !errors.Is(err, wago.ErrPermissionDenied) {
		t.Fatalf("limit = %v", err)
	}
	if err := first.Close(); err != nil {
		t.Fatal(err)
	}
	second, err := runtime.Instantiate(context.Background(), module)
	if err != nil {
		t.Fatal(err)
	}
	defer second.Close()
}

func TestTrustedArtifactBoundary(t *testing.T) {
	wasm, err := os.ReadFile("module.wasm")
	if err != nil {
		t.Fatal(err)
	}
	compiled, err := wago.Compile(nil, wasm)
	if err != nil {
		t.Fatal(err)
	}
	defer compiled.Close()
	artifact, err := compiled.MarshalBinary()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := wago.Load(artifact); err == nil {
		t.Fatal("untrusted loader accepted native artifact")
	}
	if _, err := wago.LoadTrustedArtifact(wasm); err == nil {
		t.Fatal("trusted artifact loader accepted raw wasm")
	}
}
