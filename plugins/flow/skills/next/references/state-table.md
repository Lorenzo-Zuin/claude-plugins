# State table for `next`

Read top to bottom; the first row whose condition holds decides. "Approved" means the label `spec-ok` or `autonomous` (spec), `mockup-ok` (mockup). Lanes and phase order: `../../../references/lanes.md`.

| # | Condition | Action |
|---|---|---|
| 1 | issue closed | stop: nothing to do; say how it was closed |
| 2 | `on-hold` | stop: «waits for you: remove `on-hold` when it may go on» |
| 3 | neither `ready` nor `requested` | stop: «waits for you: add `ready`, `on-hold`, or close the issue» |
| 4 | an open question `Q…` without a ticked answer in the issue, or an unanswered question in the last comments, and the next phase is P4 or later | stop: repeat the questions with the recommended answers. Before P4, phases P1-P3 may go on on the recommended answers, written as assumed in the spec or plan |
| 5 | an acceptance criterion with status `fail`, or a gate that is red | stop or fix: name the cause; fix it if it is in this work item's scope |
| 6 | `needs-bench` | on the bench machine, with `Bench:` declared and a device item in `## Needs bench`: start `flow:bench`. Elsewhere, or when only the user's evaluation run is missing: stop; the work item waits for a session on the bench machine, or for the user's run |
| 7 | no `lane:` label | start `flow:work` to finish P0 |
| 8 | `phase:P0` or no `phase:` label | start `flow:work` to finish P0 |
| 9 | `phase:P1`, lane M or L, the spec section or file is missing or incomplete | start `flow:spec` |
| 10 | `phase:P1`, lane S or H, the issue lacks current, expected and unchanged behaviour | start `flow:spec` (it writes them in the issue) |
| 11 | `phase:P1`, lane S | move to `phase:P4` with a comment, then start `orchestra:orchestra` |
| 12 | `phase:P1`, lane R | start `flow:spec` (question and what to weigh) |
| 13 | `phase:P2`, lane M, L or H, plan missing or premises not checked | start `flow:plan` |
| 14 | `phase:P2`, plan done, the review has an open finding of severity blocker or high | start `flow:plan` at its review step |
| 15 | `phase:P2` done, lane L, or lane M whose layout changes | move to `phase:P3` with a comment, then start `flow:mockup` |
| 16 | `phase:P2` done (G2 green), lane M or L, spec not approved | stop: «waits for you: approve the spec with the label `spec-ok`»; P3 may go on meanwhile |
| 17 | `phase:P2` done, approved, lane M without layout change, or lane H | move to `phase:P4` with a comment, then start `orchestra:orchestra` |
| 18 | `phase:P3`, mockup approved where required, spec approved where required | move to `phase:P4`, start `orchestra:orchestra` |
| 19 | `phase:P3`, mockups not drawn or the critic's last verdict FAIL | start `flow:mockup` |
| 20 | `phase:P3`, mockups shown, `mockup-ok` missing | stop: «waits for you: approve the mockups with the label `mockup-ok`» |
| 21 | `phase:P3`, mockups approved, lane M or L, spec not approved | stop: «waits for you: approve the spec with the label `spec-ok`» |
| 22 | `phase:P4`, every task of the progress log done, receipt valid | move to `phase:P5` with a comment, then start `flow:qa` |
| 23 | `phase:P4` | start `orchestra:orchestra`; it resumes from the progress log |
| 24 | `phase:P5`, a criterion `todo` | start `flow:qa` (it proves what a machine can prove here and writes `## Needs bench` for the rest) |
| 25 | `phase:P5`, every criterion proven or placed, no `needs-bench` | start `flow:handoff` |
| 26 | `phase:P6`, no open PR for the branch, or the PR checks red | start `flow:handoff`; it resumes from the worklog |
| 27 | `phase:P6`, PR open and green | if the project's `Merge:` rule lets the session merge and its conditions hold, start `flow:handoff` at its merge step; otherwise stop: «waits for the merge» (the user) |
| 28 | `phase:P7` or later | no skill yet (SKILL.md, section 5); P7 is the user's test in preview |

"Plan done" means: the plan section or file has every template heading filled or marked not applicable, the `Premise check:` command passes on it, and the worklog records the review with no open blocker or high finding. That is gate G2.
