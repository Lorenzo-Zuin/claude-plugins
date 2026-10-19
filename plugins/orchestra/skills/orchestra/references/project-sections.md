# What the project declares

No file of this skill names a project's commands or paths: the project declares them in its CLAUDE.md, in sections with fixed titles. Keys stay in English because agents look for them; the text after them may be in any language.

## Required (the setup check reports what is missing)

- `## Verification commands`: the full round, in order: lint, type check, build, test, each with its command or an explicit "none"; targeted commands for one part; commands forbidden to the `verifier`.
- `## Generated folders`: generated or vendored folders the agents must not read.
- `## Orchestration`: log path; how to run the app; shared resources and their rules; destructive commands never to run; extra rules for briefs.

## Optional (not reported as missing; without them the skill works as described)

| Section | Line | Effect | Without it |
|---|---|---|---|
| `## Verification commands` | `Targeted check: <command>` | one command that checks only what the change needs; the `verifier` runs it by default after each task | every check is the full round |
| `## Orchestration` | `Work folder: <path>` | where briefs and reports go; placeholders such as `<issue>` are explained on the same line | the session scratchpad, else the prompt and the reply |
| `## Orchestration` | `Brief template: <path>` | the project's brief, with the same premise table | the template in `brief.md` |
| `## Orchestration` | `Premise check: <command>` | run on each brief file before it is sent | you copy excerpts from a fresh read, no script |
| `## Orchestration` | `Decisions: <file and section>` | where `decision: …` lines are recorded | the final summary |

The `reviewer` also reads `.claude/rules/` (a Claude Code convention, not a project path) for the areas of the diff.
