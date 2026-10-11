# task-decisions

An agent skill that keeps a **backlog** and a **decision log** per task, inside the repository, in plain Markdown.

```
<repository>/
└── .task-decisions/
    ├── README.md            the project: language, tracker, areas, vocabulary
    └── tasks/
        └── ABC-123/
            ├── README.md    the task: state, ticket, branch, merge request, summary
            ├── backlog.md   #1, #2…  what is left to do (Active / Deferred / Closed)
            ├── decisions.md D1, D2…  what was decided, why, and what was rejected
            └── reports/     reviews, investigations, plans
```

Why:

- **Decisions outlive the conversation.** Each one records why it was made, what was rejected and when to revisit it, so "why did we do X?" has an answer months later.
- **Nothing left for later gets lost.** Deferred work keeps its reason and a checkable trigger; closed items keep their full text.
- **Lives with the code.** Notes are committed on the task's branch and reach the main branch through the same merge request, so the team sees them. (Local-only notes are an option.)
- **Strict shapes, plain files.** Fixed headings and fields keep people, agents and tools in agreement; a bundled check flags anything out of shape.

## Install

With the [skills](https://skills.sh) CLI:

```sh
# Pick agents and scope interactively
npx skills add brasillero/task-decisions

# For you, in every project, for specific agents
npx skills add brasillero/task-decisions --global --skill task-decisions --agent claude-code codex cursor

# A fixed version
npx skills add 'brasillero/task-decisions#v1.0.0' --skill task-decisions
```

Update with `npx skills update task-decisions` and remove with `npx skills remove task-decisions` (add `--global` to both for a global install).

Without the CLI, copy or link `skills/task-decisions/` into your agent's skills folder, e.g. `~/.claude/skills/` (Claude Code) or `~/.agents/skills/` (Codex and others).

The helper scripts need Node.js 20+ and git; nothing else.

## Use

Ask your agent in plain words, from inside a repository:

- "Start notes for ABC-123."
- "Add an item: the coupon is not validated before closing the order."
- "Record a decision: address validation stays in the browser; revisit if the postcode service gets faster."
- "Close #2, done in `a1b2c3d`."
- "What is open?" / "Why did we keep the two address forms?"
- "Show the notes."

The first time, the agent creates `.task-decisions/README.md` and asks whether the notes are committed or local only, and for the project's language, tracker, key prefix and areas.

The rules the agent follows are in [`references/rules.md`](skills/task-decisions/references/rules.md) and the file shapes in [`references/shapes.md`](skills/task-decisions/references/shapes.md).

## Viewer and check

Run them from the repository root (or pass its path):

```sh
node <skill folder>/scripts/serve.mjs   # read-only viewer on http://localhost:4400 (PORT to change it); Ctrl+C stops it
node <skill folder>/scripts/check.mjs   # lists entries out of shape; exits 1 if any
```

The viewer reads the files on every refresh, listens on `127.0.0.1` only, answers only requests addressed to `localhost`, serves nothing outside `.task-decisions/`, and makes no network requests. To reach it through a proxy of your own, list the extra host names in `TASK_DECISIONS_HOSTS` (comma-separated).

## Privacy

Committed notes are as visible as your code: anyone who can read the repository can read them. Keep secrets, credentials and personal data out of them; choose local-only notes when they should stay on your machine.

## Example

[`examples/shop-web/`](examples/shop-web/.task-decisions) is a small made-up project with one task: open, deferred and closed items, an active and a provisional decision, and a report.

```sh
node skills/task-decisions/scripts/serve.mjs examples/shop-web
```

## Development

```sh
node --test tests/*.test.mjs   # the scripts: check and viewer
```

Releases are automated with [release-please](https://github.com/googleapis/release-please): commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`fix:` → patch, `feat:` → minor, `feat!:` or `BREAKING CHANGE:` → major; `docs:`, `test:`, `chore:` release nothing). On every push to `main` a release PR collects the changes, with the next version and changelog; merging it tags the release and publishes it. See [`CHANGELOG.md`](CHANGELOG.md) and the [releases](https://github.com/brasillero/task-decisions/releases).

[`evals/`](evals/README.md) holds behaviour cases for agents using the skill: prompts, starting state and what a correct run does.

## Licence

MIT (see `LICENSE`). The viewer's icons come from [Lucide](https://lucide.dev): ISC, and MIT for icons derived from Feather (see `skills/task-decisions/THIRD_PARTY_NOTICES.md`).
