# Behaviour evals

Cases for checking that an agent with the skill installed does the right thing. Run each one in a fresh session, in a throwaway copy of the starting state, then compare the result with what a correct run does and run the shape check (`scripts/check.mjs`).

Record each run below the case table: date, agent and model version, pass or fail, and what went wrong.

## Triggering

The skill should load for the first group and stay out of the second.

| Prompt | Starting state | Loads? |
|---|---|---|
| "Start notes for ABC-7." | repository without `.task-decisions/` | yes |
| "What is open?" | `examples/shop-web` | yes |
| "Why did we keep the two address forms?" | `examples/shop-web` | yes |
| "Close #1, done in `b2c3d4e`." | `examples/shop-web` | yes |
| "Show the notes." | `examples/shop-web` | yes |
| "Review my Jira backlog and suggest priorities." | any repository | no |
| "Write an architecture decision record in docs/adr/." | repository with `docs/adr/` | no |
| "Close GitHub issue #12." | any repository | no |

## Workflows

| # | Prompt | Starting state | A correct run |
|---|---|---|---|
| 1 | "Start task notes here; keep them local, not committed." | a linked worktree (`git worktree add`) of a repository without `.task-decisions/` | asks for language, tracker, prefix and areas if not obvious; adds `/.task-decisions/` to the file printed by `git rev-parse --git-path info/exclude` (not `.git/info/exclude`, which is a file here); `git check-ignore` confirms it; project `README.md` says `Local only.`; nothing committed |
| 2 | "Record a decision: we accept the duplicated address forms as debt until the redesign." | `examples/shop-web` without #3 and D1 | asks who decided if unknown; adds a decision with a concrete `revisit if`; creates a `Tech debt` item in Deferred with `origin: D<n>`; no origin loop |
| 3 | "We now validate coupons on the server only; the browser check goes." | `examples/shop-web` | new decision with `origin: D2`; D2's heading becomes `Superseded by D<new>`, its body untouched; no open item has `origin: D2`, so there is nothing to ask about |
| 4 | "Drop D2, we are not doing coupon validation at all." | `examples/shop-web` | D2 becomes `Revoked`; a new decision with `origin: D2` says why; asks about open items that came from D2 |
| 5 | "The merge request is approved; finish the task." | `examples/shop-web`, on branch `ABC-123` | #1 closed (with evidence) or deferred with a reason, nothing left in Active; `state: Done`, `end` set, summary rewritten as the outcome; no commit unless asked (then on the branch, in a commit of its own, only notes files staged); no push |
| 6 | "Move #3 to ABC-200." | `examples/shop-web` with an `ABC-200` task | new item in ABC-200 with `origin: ABC-123#3`, same type, area, created and body, local references made full; #3 closed as `Moved` with `outcome: → ABC-200#<n>`, text unchanged |
| 7 | "Reopen #2, the shipping bug is back." | `examples/shop-web` | #2 untouched; a new item with `origin: #2` |
| 8 | "Bring our TODO.md into task-decisions." | repository with a `TODO.md` of five lines, two marked done (one with a commit hash), one marked "later", dates on some | proposes the mapping and waits; done lines become closed items whose `outcome` cites `TODO.md` or the commit; the "later" line is Deferred with a `reason`; real dates kept, unknown ones said so in the body; no guessed values; check passes; `TODO.md` untouched |

## Runs

| Date | Agent and model | Cases | Result | Notes |
|---|---|---|---|---|
