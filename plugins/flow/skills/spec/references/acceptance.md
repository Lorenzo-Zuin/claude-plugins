# Acceptance criteria in the contract

The contract (`acceptance.json` in the reference flow) is the list of acceptance criteria of the work item and the evidence each one needs. The project's `Contract schema:` declaration is the authority on keys, statuses, evidence types and the evidence each risk requires; this file is the fallback and the rules of writing.

## What P1 writes, and what it never writes

- P1 writes `criteria`: one entry per scenario, plus one per relevant matrix row that has no scenario of its own.
- **Never** write `status`, `evidence`, `verification`, `waived` or `signature` by hand: only the project's scripts do (a contract command, a receipt command). New criteria start as `"status": "todo"` and `"evidence": []`.
- After writing, run `Contract check:` if declared. A criterion it refuses is fixed, not removed.

## Fields of a criterion (fallback schema)

| Key | Content |
|---|---|
| `id` | `S<n>` for scenario n, `M<row>` for a matrix row; unique |
| `role` | one role, as the project names it |
| `given`, `when`, `then` | the scenario, in the project's language |
| `platforms` | where it holds: for example `android`, `ios`, `web`, `site`, `server`, `repo` (repository scripts and tools) |
| `risk` | any of `destructive`, `account`, `money`, `security`, `ai`, `multi_role`; empty when none |
| `evidence_required` | at least one evidence type (below) |
| `status` | `todo` at creation |
| `evidence` | `[]` at creation |

## Evidence types (fallback)

`unit`, `component`, `pgtap` (database tests), `deno` (server function tests), `e2e`, `maestro` (device flows), `simulated_user`, `screen:<variant>`, `web_screen`, `web_e2e`, `ux_review`, `eval_result`, `old_app`, `user_device`.

Choose the cheapest evidence that proves the "then": a pure rule → `unit`; a database rule → the database test type; what a person sees → a screen capture or a device flow; a promise about an installed old app → `old_app`.

## Evidence the risk requires (fallback)

- `destructive`, `account`, `multi_role` → `e2e`.
- `multi_role` → also `simulated_user` or the database test type.
- `ai` → `eval_result`.

## Example

```json
{
  "id": "S2",
  "role": "member",
  "given": "development data just reset",
  "when": "the user opens the month screen",
  "then": "the current month shows at least one expense per seed user",
  "platforms": ["server"],
  "risk": [],
  "evidence_required": ["pgtap"],
  "status": "todo",
  "evidence": []
}
```
