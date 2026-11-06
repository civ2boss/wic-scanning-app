# Issue tracker: beads

Issues and specs for this repo live in beads. Use the `bd` CLI for all operations and pass `--json` when parsing output. Issue IDs look like `wic-scanning-app-1zx`.

## Conventions

- **Create an issue**: `bd create "Title" -d "..." -t bug|feature|task|epic|chore -p 0-4 --json`. Use `--body-file <path>` for multi-line descriptions.
- **Read an issue**: `bd show <id> --json`, plus `bd comments <id> --json` for the conversation.
- **List issues**: `bd list --status open --json`, filtered with `--label <name>` (all must match) or `--label-any`. Add `--all` to include closed issues.
- **Make an issue a child of a parent**: `bd create ... --parent <parent-id>`. List children with `bd list --parent <parent-id>`.
- **Comment on an issue**: `bd comments add <id> "..."`
- **Apply / remove labels**: `bd label add <id> <label>` / `bd label remove <id> <label>`
- **Close**: `bd close <id> --reason "..."`
- **Discovered work**: link it back with `--deps discovered-from:<id>`.

Writes auto-commit to Dolt. Sync with `bd dolt push` / `bd dolt pull`.

## When a skill says "publish to the issue tracker"

Create a beads issue with `bd create`.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is an epic with **child** issues as tickets.

- **Map**: `bd create "..." -t epic -l wayfinder:map`, holding the Notes / Decisions-so-far / Fog in its description.
- **Child ticket**: `bd create "..." --parent <map-id> -l wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
- **Blocking**: native dependencies, `bd dep add <child> --blocked-by <blocker>`. A ticket is unblocked when every blocker is closed.
- **Frontier query**: `bd ready --parent <map-id> --unassigned --json`; first in order wins.
- **Claim**: `bd update <id> --claim --json`, the session's first write.
- **Resolve**: `bd comments add <id> "<answer>"`, then `bd close <id> --reason "..."`, then append a context pointer (gist + id) to the map's Decisions-so-far.
