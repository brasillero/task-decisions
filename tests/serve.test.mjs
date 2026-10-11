import { test, before, after } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { request } from "node:http"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))
const port = 4900 + Math.floor(Math.random() * 90)
let server

/** A GET (or other method) to the viewer with a chosen Host header. */
function get(path, { host = `localhost:${port}`, method = "GET" } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path, method, headers: { host } }, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => resolve({ status: res.statusCode, body }))
    })
    req.on("error", reject)
    req.end()
  })
}

before(async () => {
  server = spawn(process.execPath, [join(repoRoot, "skills/task-decisions/scripts/serve.mjs"), join(repoRoot, "examples/shop-web")], { env: { ...process.env, PORT: String(port) } })
  await new Promise((resolve) => server.stdout.once("data", resolve))
})
after(() => server.kill())

test("serves the notes and the page", async () => {
  const data = await get("/api/data")
  assert.equal(data.status, 200)
  assert.equal(JSON.parse(data.body).projects[0].tasks[0].slug, "ABC-123")
  assert.equal((await get("/shop-web/ABC-123")).status, 200)
  assert.equal((await get("/icons/bug.svg")).status, 200)
})

test("serves reports, but nothing outside .task-decisions/", async () => {
  assert.equal((await get("/api/file?path=tasks/ABC-123/reports/2026-01-11-checkout-review.md")).status, 200)
  assert.equal((await get("/api/file?path=../README.md")).status, 404)
  assert.equal((await get("/api/file?path=tasks/ABC-123/README")).status, 404)
  // Not an icon name: the request gets the page, never the script's source.
  assert.doesNotMatch((await get("/icons/..%2F..%2Fscripts%2Fserve.mjs")).body, /createServer/)
})

test("refuses other hosts and writes", async () => {
  assert.equal((await get("/api/data", { host: "attacker.example" })).status, 403)
  assert.equal((await get("/api/data", { method: "POST" })).status, 405)
})
