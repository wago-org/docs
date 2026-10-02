import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { verifyNavigation } from './verify-navigation.mjs'

async function fixture(t, html) {
  const dir = await mkdtemp(join(tmpdir(), 'wago-navigation-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  await mkdir(join(dir, 'canary'))
  await writeFile(join(dir, 'canary', 'index.html'), html)
  await writeFile(join(dir, 'canary', 'next.html'), '<h2 id="ready">Ready</h2>')
  return pathToFileURL(`${dir}/`)
}

test('checks rendered cards, relative links, fragments, and HTML-encoded queries', async (t) => {
  const output = await fixture(t, '<a href="./next?one=1&amp;two=2#ready">Card</a><a href="https://example.com/missing">External</a>')
  assert.equal(await verifyNavigation(output, ['https://docs.wago.sh/canary/']), 1)
})

test('rejects a version selector destination absent from the snapshot', async (t) => {
  const output = await fixture(t, '<a href="/beta/guides/wasi">beta</a>')
  await assert.rejects(verifyNavigation(output, ['https://docs.wago.sh/canary/']), /missing route \/beta\/guides\/wasi/)
})

test('rejects missing anchors on otherwise valid routes', async (t) => {
  const output = await fixture(t, '<a href="./next#missing">Next</a>')
  await assert.rejects(verifyNavigation(output, ['https://docs.wago.sh/canary/']), /missing anchor .\/next#missing/)
})
