---
name: qa
description: Phase P5 of the development flow, automatic part. Proves each acceptance criterion that a machine can prove without the device bench - tests, database tests, server functions, end-to-end on the local stack, web console and website tests and captures judged by the ux-critic - records outcome and evidence in the contract, and writes the Needs bench section for what needs a device. Runs anywhere, also in the cloud. Gate G5 is the project's gate command.
argument-hint: [issue number]
---

You prove the work item as a person would use it, before the user sees it. You do not fix code here: a failure goes back to P4. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Rubric for captures: `${CLAUDE_SKILL_DIR}/../../references/ux-rubric.md` plus `Rubric:`. Details in `${CLAUDE_SKILL_DIR}/references/`: `evidence.md` (how each evidence type is produced and recorded, outcomes), `needs-bench.md` (the section the `bench` skill works from).

## Before
1. Read the issue, the worklog (`## Progress log`: P4 must have every task done), the spec and the contract. Every criterion with status `todo` is your list. If P4 is not finished, hand back to `flow:next`.
2. Merge the integration branch into the work item branch if it moved since the last merge (`rules.md`, «The folder»).
3. Run the project's `Targeted check` (`## Verification commands`). Red: stop, it is a P4 failure; write it in the worklog and hand over to `orchestra:orchestra`.

## Steps
1. **Sort the criteria** by the evidence they require (`evidence.md`): automatic here (`unit`, `component`, `pgtap`, `deno`, `e2e`, `web_e2e`, `web_screen`, `ux_review` of web captures), device (`maestro`, `simulated_user`, `screen:<variant>`), elsewhere (`user_device`, `eval_result`, `old_app`). Write the sorted list in the worklog before running anything.
2. **Automatic evidence.** For each criterion, run the test that the plan's test plan names. A test that does not exist yet is a P4 gap: write it in the worklog and go back to P4; never write the test here to pass.
3. **End to end.** Criteria with `e2e` run on the whole local system: the project's local stack with the server functions on, no fake in place of a real part, the final state read from the database without writing to it. If the local stack does not start here, the criterion stays `todo` with the reason; never record a pass from a partial run.
4. **Web console and website**, if touched: the `QA commands:` the project declares for them (end-to-end tests, build, captures at the widths and themes it names). Captures go to `Evidence:` and to `ux-critic` with the mockups (at most four screens per call; `../mockup/references/critique.md` for confirming its findings). A design-check command the project names runs too.
5. **Record** each result with `Record evidence:` (outcome, evidence type, file or test name). `pass` only with every required evidence type; `fail` with what happened; `not_verifiable_here` only in the cases the contract schema allows, always with where and when it will be verified. Never edit the contract by hand when the project has the command.
6. **Device part.** For criteria that need the device bench (`maestro`, `simulated_user`, `screen:<variant>`, `ux_review` of device captures, `old_app`, `user_device` on a connected phone), write `## Needs bench` (`needs-bench.md`) and add the label `needs-bench`. The device part is the `bench` skill, which runs them through the `device-tester` agent under the bench lock. If this session runs on the bench machine and the project declares `Bench:`, finish steps 7 and 8 for the automatic part, then hand over to `flow:bench`; otherwise the work item waits in the bench queue for a session there.
7. **Failures.** A `fail` goes back to P4 with a failing test first. After the fix, rerun only what the fix touches. Three rounds on the same criterion: bring it to the user.
8. **Close the automatic part.** Commit and push the evidence and the contract. Run `Gate:` if declared and write its result in `## Updates`. Comment on the issue: criteria by outcome, links to the evidence, what waits for the bench and on which machine. Move the label to `phase:P5`, or keep it there; run `Status:` if declared. With nothing left for the bench and the gate green except for the PR checks, hand over to `flow:handoff`.

## Gate G5
The project's `Gate:` command decides: no criterion `todo` or `fail`, the required evidence types present, low findings in `## Polish`, a medium one open only with the user's postponement. Without the command, check the same by reading and say "G5 checked by reading, no script".

## Never
- Record `pass` from memory, from an agent's report you did not check, or from a test run on another commit.
- Use `waived` without the user's explicit request in this session; then record who, why, the risk and when it will be recovered.
- Touch shared devices, the bench or remote environments from this skill: the device part is only `flow:bench`.

## End
Close with the `recap` skill when this is the last skill of the turn.
