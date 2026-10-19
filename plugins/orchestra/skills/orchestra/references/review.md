# Review and rounds

## Implementer status

The `implementer` replies with one status, the report path, its commits and one line on tests. Read the report only when the status or the diff asks for it.

| Status | Meaning | What you do |
|---|---|---|
| `DONE` | every acceptance criterion done and checked | verify and review |
| `DONE_WITH_CONCERNS` | done, with doubts or unverified points listed in the report | verify and review, starting from the concerns |
| `NEEDS_CONTEXT` | a premise is refuted or something is missing; little or nothing changed | answer via `SendMessage`, fixing the brief file too; it is not a round |
| `BLOCKED` | it cannot go on (environment, rule conflict, scope) | remove the block or take it to the user; it is not a round |

## Steps

1. `verifier`. By default it runs the project's targeted check (`Targeted check` in `## Verification commands`) or, without one, the full round. Before the final summary, if only targeted checks ran, ask it for the full round. A FAILED is a round. A NOT RUNNABLE is not a code defect and goes to nobody: it ends up in the final summary as "not verified in this environment".
2. Your review, on `git diff` and the report. Open a file only if the diff is not enough. A result reported by a subagent is not a fact until the `verifier` has rerun it. Two verdicts, each yes or no with its reasons:
   - **plan adherence**: every acceptance criterion of the brief (and of the plan, if there is one) is covered and checked; nothing outside the allowed paths; settled decisions respected.
   - **quality**: no open finding of severity critical or high; no shortcut that silences a check.
   A no on either is a round.
3. `reviewer` when several agents wrote code, when SQL, security or data isolation was touched, or when code was born without being run. Not for a single small change. Give it the diff range, the brief or plan path, a small scope, a list of attacks to try, and ask for both verdicts. Repeat it after each fix round until it finds only low-severity issues.
4. What an agent declares "not verified" gets verified or goes to the user as is: never promote it to fact.

## Rounds

A round is one return of the same task to an implementer for a fix. At most five per task:

- Rounds 1-3: the same `implementer`, resumed with `SendMessage`, naming the failure or the findings and what is still right.
- Rounds 4-5: a new implementer one effort step up (`implementer` → `implementer-high` → `implementer-xhigh`; from `implementer-xhigh`, a new `implementer-xhigh`), with a new brief file that names what came back and why, premises re-read.
- After the fifth: you decide (fix it yourself, cut the scope, drop the task). If the choice is a product choice, ask the user.

At any round, a fix within the size you may write yourself (Who does what) you write yourself, and it counts as a round. Count the rounds in the log.
