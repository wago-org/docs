import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

async function record(source) {
  const directory = await mkdtemp(join(tmpdir(), 'wago-record-test-'))
  try {
    const tape = join(directory, 'test.tape')
    const output = join(directory, 'test.cast')
    await writeFile(tape, source)
    const result = spawnSync('python3', ['scripts/record-tape.py', tape, output, '--cwd', directory], { encoding: 'utf8' })
    const cast = result.status === 0 ? (await readFile(output, 'utf8')).trim().split('\n').map(JSON.parse) : []
    return { ...result, cast }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('browser-free recorder executes visible commands and preserves real output', async () => {
  const result = await record('Hide\nType "exit 99"\nEnter\nShow\nType "printf real-output"\nEnter\n')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.cast[0].version, 2)
  assert.ok(result.cast.slice(1).some(event => event[2] === 'real-output'))
  const times = result.cast.slice(1).map(event => event[0])
  assert.deepEqual(times, [...times].sort((a, b) => a - b))
})

test('browser-free recorder does not publish a failed command', async () => {
  const result = await record('Type "printf failure; exit 7"\nEnter\n')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /exited 7/)
})

test('browser-free recorder rejects unsupported interactive controls', async () => {
  const result = await record('Type "echo hello"\nBackspace\nEnter\n')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Unsupported visible tape command/)
})
