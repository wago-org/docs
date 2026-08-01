import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import test from 'node:test'

const execFileAsync = promisify(execFile)
const script = new URL('./humanize-tape.py', import.meta.url)

test('humanizes visible typing and preserves hidden setup', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'wago-humanize-tape-'))
  const input = join(directory, 'source.tape')
  const output = join(directory, 'rendered.tape')

  await writeFile(input, `Hide
Type "hidden setup"
Show
Type "go run" Sleep 500ms Enter
`)

  await execFileAsync('python3', [script.pathname, input, output, '--seed', '11'])
  const rendered = await readFile(output, 'utf8')

  assert.match(rendered, /Hide\nType "hidden setup"\nShow/)
  assert.doesNotMatch(rendered, /Type "go run"/)
  assert.match(rendered, /Type "g"\nSleep \d+ms/)
  assert.match(rendered, /Space\nSleep \d+ms/)
  assert.match(rendered, /Sleep 500ms Enter/)
})
