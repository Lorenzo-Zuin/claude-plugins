# Triage details

## Path patterns

- One pattern per line, between backticks, relative to the repository root: `src/billing/**`, `tests/billing/**`.
- As narrow as the work allows: a folder with `**`, a single file when only one changes. Never `**` alone.
- Include the tests, migrations, development data and docs the work will change, not only the source.
- The work item folder itself is not a touched path: every work item has its own.

## Collision check

1. Open issues with `in-progress`: read the `Percorsi toccati` (or the project's equivalent heading) of each body.
2. Open pull requests: the list of changed files of each one.
3. Two patterns collide when one matches a path the other matches. Compare prefixes before the first `*`: `a/b/**` and `a/b/c.ts` collide; `a/b/**` and `a/c/**` do not.
4. Report each collision with the issue or PR number, its title and the shared paths. The user decides: merge, queue, or split.

GitHub access: the project's scripts may use the REST API; the skill may use the GitHub tools of the session. If GitHub does not answer, say "collision check not done: GitHub unreachable" and ask before going on.

## Slug and branch

- Slug: lower case, words joined by `-`, no accents, at most five words, in the project's language; it names the folder and, when the command creates the branch, the branch.
- Branch type, when the command takes one: the conventional commit type of the work (`feat` new behaviour, `fix` a defect, `chore` tooling or data, `docs` documents only).

## Comments on the issue

Each transition comment says, in at most five lines: the phase closed, what it produced (with links into the branch), the next phase, and who acts. Example of shape:

```
P0 Triage fatto · lane M (cambia un comportamento esistente, nessuna schermata nuova)
Branch `fix/…` · cartella `docs/work/<n>-<slug>/`
Prossimo passo: P1 Spec, la sessione
```
