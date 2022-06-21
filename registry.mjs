import { createServer } from 'http'
import { createReadStream } from 'fs'
import { rm } from 'fs/promises'
import { once } from 'events'
import { join } from 'path'
import { spawn } from 'child_process'

const files = new Set([
  '/blue/pivot',
  '/blue/pivot.tgz',
  '/blue/common',
  '/blue/common.tgz',
  '/green/pivot',
  '/green/pivot.tgz',
  '/green/common',
  '/green/common.tgz',
])

const server = createServer((req, res) => {
  if (req.method !== 'GET') res.writeHead(405).end();

  if (files.has(req.url)) {
    return createReadStream(join('data', req.url)).pipe(res)
  } else {
    res.writeHead(404).end();
  }
})
server.listen(2020, 'localhost')
await once(server, 'listening')

console.log(`
Started two registries, /green and /blue.
Both host a different revision of 'pivot' and the same copy of 'common'
pivot in /green has no dependencies
pivot in /blue depends on common
─────────────────────`)

await Promise.all([rm('package-lock.json', {force: true}), rm('node_modules', {force: true, recursive: true})])
await npm('--registry', 'http://localhost:2020/green', 'install')
await npm('ls')
await npm('start')
console.log(`
Installed this module with the /green registry
─────────────────────`)

await rm('node_modules', {force: true, recursive: true})
await npm('--registry', 'http://localhost:2020/blue', 'update', 'pivot')
await npm('ls')
await npm('start').catch(err => console.error(err.message))
console.log(`
Removed node_modules (but not package-lock) and update-installed with /blue

node_modules/pivot/index.js is updated to the blue version and printed 'im blue'
but it could not find it's dependency 'common'.
─────────────────────`)

server.close()

async function npm(...args) {
  const proc = spawn('npm', args, {stdio: 'inherit'})
  const [code] = await once(proc, 'exit')
  if (code !== 0) throw Error(`npm ${args.join(' ')} exited ${code}`)
}
