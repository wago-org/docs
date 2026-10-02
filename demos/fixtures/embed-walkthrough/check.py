#!/usr/bin/env python3
"""Run the complete Go programs in the embedding guides against a runtime checkout."""
import argparse
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--runtime', required=True, type=Path)
parser.add_argument('--go', default='go')
parser.add_argument('--wat2wasm', default='wat2wasm')
parser.add_argument('--work-dir', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[3]
work = (args.work_dir or Path(tempfile.mkdtemp(prefix='wago-embed-check-'))).resolve()
work.mkdir(parents=True, exist_ok=True)
env = dict(os.environ, GOWORK='off', GOMAXPROCS=os.environ.get('GOMAXPROCS', '2'))
env['GOFLAGS'] = '-p=1'

def command(cmd, cwd):
    result = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=180)
    if result.returncode:
        print(result.stdout + result.stderr, file=sys.stderr)
        result.check_returncode()
    return result.stdout

def blocks(page, language):
    return re.findall(r'^```' + language + r'\n(.*?)^```', page, flags=re.M | re.S)

pages = {name: (root / 'guides' / 'embed' / (name + '.md')).read_text() for name in [
    'runtime-and-modules', 'calls-and-state', 'host-functions', 'guest-memory',
    'limits-and-policy', 'services-and-concurrency', 'artifacts'
]}
fixtures = work / 'guests'
fixtures.mkdir(exist_ok=True)
for name, page, index in [
    ('module', 'runtime-and-modules', 0), ('counter', 'calls-and-state', 0),
    ('square', 'host-functions', 0), ('message', 'guest-memory', 0),
    ('loop', 'limits-and-policy', 0),
]:
    (fixtures / (name + '.wat')).write_text(blocks(pages[page], 'wat')[index])
    command([args.wat2wasm, str(fixtures / (name + '.wat')), '-o', str(fixtures / (name + '.wasm'))], work)
command([args.wat2wasm, str(Path(__file__).with_name('boundaries.wat')), '-o', str(fixtures / 'boundaries.wasm')], work)

expected = {
    'runtime-and-modules-1': '42\n',
    'calls-and-state-1': '1\n2\n3\ncount: 3\nafter set: 41\nfresh instance: 1\n',
    'host-functions-1': '81\n',
    'guest-memory-1': 'guest says "hello from wasm"\nbytes written: 15\ninvalid range: -1\nsaved copy: "hello from wasm"\ncurrent memory: "Hello from wasm"\nout-of-bounds write accepted: false\nlast byte: 0\n',
    'limits-and-policy-1': '42\n',
    'limits-and-policy-2': 'spin stopped at its deadline\nnext call: 42\n',
    'services-and-concurrency-1': 'add(1, 2) = 3\nadd(20, 22) = 42\nadd(3, 4) = 7\n',
}

def project(name):
    folder = work / name
    folder.mkdir(exist_ok=True)
    (folder / 'go.mod').write_text('module example.com/wago-embed-check\n\ngo 1.22\n\nrequire github.com/wago-org/wago v0.0.0\n\nreplace github.com/wago-org/wago => ' + str(args.runtime.resolve()) + '\n')
    for wasm in fixtures.glob('*.wasm'):
        shutil.copy(wasm, folder)
    return folder

print(command([args.go, 'version'], work).strip(), flush=True)
print('wat2wasm ' + command([args.wat2wasm, '--version'], work).strip(), flush=True)
for name, page in pages.items():
    mains = [block for block in blocks(page, 'go') if block.startswith('package main\n')]
    for index, main in enumerate(mains, 1):
        key = f'{name}-{index}'
        folder = project(key)
        (folder / 'main.go').write_text(main)
        command([args.go, 'mod', 'tidy'], folder)
        output = command([args.go, 'run', '.'], folder)
        if key.startswith('artifacts-'):
            assert re.fullmatch(r'artifact: \d+ bytes\n42\n', output), output
        else:
            assert output == expected[key], (key, output)
        print(f'PASS {key}\n{output}', end='', flush=True)
        if name == 'services-and-concurrency':
            raced = command([args.go, 'run', '-race', '.'], folder)
            assert raced == output
            print('PASS services-and-concurrency race-enabled run', flush=True)
folder = project('api-boundaries')
shutil.copy(Path(__file__).with_name('api_test.go'), folder)
command([args.go, 'mod', 'tidy'], folder)
print(command([args.go, 'test', '-race', '-v', '-count=1', '.'], folder), end='', flush=True)
print(f'All embedding walkthrough checks passed; work directory: {work}', flush=True)
