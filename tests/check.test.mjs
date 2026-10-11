import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))
const check = join(repoRoot, "skills/task-decisions/scripts/check.mjs")
const example = join(repoRoot, "examples/shop-web")

/** A throwaway copy of the example project. */
function copy() {
  const dir = mkdtempSync(join(tmpdir(), "task-decisions-"))
  cpSync(example, dir, { recursive: true })
  return dir
}
const run = (dir) => spawnSync(process.execPath, [check, dir], { encoding: "utf8" })
const edit = (file, from, to) => writeFileSync(file, readFileSync(file, "utf8").replace(from, to))

test("the example has no shape problems", () => {
  const result = run(example)
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test("a folder without notes exits with 2", () => {
  const dir = mkdtempSync(join(tmpdir(), "task-decisions-"))
  assert.equal(run(dir).status, 2)
  rmSync(dir, { recursive: true })
})

test("broken entries are reported", () => {
  const dir = copy()
  const task = join(dir, ".task-decisions/tasks/ABC-123")
  edit(join(task, "backlog.md"), "- outcome: fixed in `a1b2c3d`", "- outcome: fixed")
  edit(join(task, "backlog.md"), "- created: 2026-01-11\n- reason: accepted", "- created: 2026-02-30\n- reason: accepted")
  edit(join(task, "decisions.md"), "Coupons are validated in the browser before the order is confirmed", "Coupon validation for now")
  const result = run(dir)
  assert.equal(result.status, 1)
  assert.match(result.stdout, /#2: Done needs evidence/)
  assert.match(result.stdout, /#3: `created` is not a date/)
  assert.match(result.stdout, /D2: title is not timeless/)
  rmSync(dir, { recursive: true })
})

test("Windows line endings parse the same", () => {
  const dir = copy()
  for (const file of [".task-decisions/README.md", ".task-decisions/tasks/ABC-123/backlog.md", ".task-decisions/tasks/ABC-123/decisions.md"])
    writeFileSync(join(dir, file), readFileSync(join(dir, file), "utf8").replace(/\n/g, "\r\n"))
  const result = run(dir)
  assert.equal(result.status, 0, result.stdout)
  rmSync(dir, { recursive: true })
})

test("links that point outside .task-decisions/ are left out and reported", () => {
  const dir = copy()
  const outside = mkdtempSync(join(tmpdir(), "outside-"))
  writeFileSync(join(outside, "secret.md"), "secret")
  symlinkSync(join(outside, "secret.md"), join(dir, ".task-decisions/tasks/ABC-123/reports/leak.md"))
  const result = run(dir)
  assert.equal(result.status, 1)
  assert.match(result.stdout, /reports\/leak\.md: points outside/)
  rmSync(dir, { recursive: true })
  rmSync(outside, { recursive: true })
})

test("the project name comes from the remote only at the repository root", () => {
  const dir = copy()
  execFileSync("git", ["init", "-q", dir])
  execFileSync("git", ["-C", dir, "remote", "add", "origin", "https://example.com/team/shop-web.git"])
  // A reference with the repository's own name resolves.
  edit(join(dir, ".task-decisions/tasks/ABC-123/decisions.md"), "- origin: #1", "- origin: shop-web/ABC-123#1")
  assert.equal(run(dir).status, 0)
  rmSync(dir, { recursive: true })
})

test("lifecycle mistakes are reported", () => {
  const dir = copy()
  const task = join(dir, ".task-decisions/tasks/ABC-123")
  // A move within the same task, a revoked decision with no explanation, a decision superseded by an older one.
  edit(join(task, "backlog.md"), "### #2 · Done · Fix the total with free shipping", "### #2 · Moved · Fix the total with free shipping")
  edit(join(task, "backlog.md"), "- outcome: fixed in `a1b2c3d`", "- outcome: → ABC-123#1")
  edit(join(task, "decisions.md"), "### D2 · Provisional ·", "### D2 · Revoked ·")
  edit(join(task, "decisions.md"), "### D1 · Active ·", "### D1 · Superseded by D2 ·")
  const result = run(dir)
  assert.equal(result.status, 1)
  assert.match(result.stdout, /#2: Moved points to this same task/)
  assert.match(result.stdout, /D2: Revoked needs a later decision/)
  assert.match(result.stdout, /D1: superseded by D2, whose `origin` should be D1/)
  rmSync(dir, { recursive: true })
})
