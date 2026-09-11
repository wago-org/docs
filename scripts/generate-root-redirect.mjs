import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preferredDocsBase } from './version-routing.mjs'

export { preferredDocsBase } from './version-routing.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function renderRootRedirect(target) {
  const encodedTarget = JSON.stringify(target).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=${target}">
    <link rel="canonical" href="https://docs.wago.sh${target}">
    <title>Wago documentation</title>
    <script>
      const target = new URL(${encodedTarget}, window.location.origin)
      target.search = window.location.search
      target.hash = window.location.hash
      window.location.replace(target)
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${target}">Wago documentation</a>…</p>
  </body>
</html>
`
}

export async function generateRootRedirect(directory = root) {
  const manifest = JSON.parse(await readFile(join(directory, 'versions.json'), 'utf8'))
  const target = preferredDocsBase(manifest)
  await writeFile(join(directory, 'public', 'index.html'), renderRootRedirect(target))
  return target
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = await generateRootRedirect()
  console.log(`Generated root documentation redirect to ${target}`)
}
