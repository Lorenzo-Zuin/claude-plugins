---
name: plan
description: Phase P2 of the development flow. Writes the technical plan of a work item - premises checked on today's code, design, development data, readers of new values, twin predicates, compatibility and release fragment, test plan, critical points, tasks - and has it reviewed. Gate G2 passes when the premise check is green and the review has no open blocker or high finding. Lane L writes plan.md; lane M a short plan in worklog.md; lane H the cause proven with data.
argument-hint: [issue number]
---

You decide how the work item is built, on true premises and with complete consequences. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Details in `${CLAUDE_SKILL_DIR}/references/`: `plan-template.md` (sections and what goes in each), `premises.md`, `plan-review.md`.

## Before
Read the issue, the worklog, the spec (`spec.md` or `## Spec`) and the contract. Without a spec on lanes M and L, start `flow:spec` instead. Lane H: the plan is the cause proven with data (rows, logs, a reproduction), never a hypothesis; write it in `## Plan` of the worklog with the premises.

## Steps
1. **Map.** Ask `explore` (`orchestra:explore` as a plugin; else a search agent on a small model) for the map of the touched parts: files, symbols, existing tests, closed lists of the area. Recount any number it gives before using it.
2. **Premises.** Write the premise table (`premises.md`): claim, `file:line`, excerpt of at most three lines copied from a fresh read. Run the `Premise check:` command of `## Orchestration` on the file. A premise it does not find is fixed before going on; never delete it to make the check pass.
3. **Design**: data model, row-level rules, functions, contracts in full, translation keys, notifications, usage records, plan checks; only what applies.
4. **Development data**: the rows the work needs (`Dev data:`), for which data user, for which state of each touched screen (empty, one, many, error, pending). QA uses them.
5. **Readers of new values**: for each new value of a closed list, mode or column, who reads it (code search, `file:line`) and where it shows.
6. **Twin predicates**: every function that recomputes another one's condition gets an equivalence test.
7. **Compatibility and release**: what installed apps do when the server changes. Write the release fragment if the project declares `Release fragment:`; in it, functions are safe to deploy first only if every migration of the work item is additive.
8. **Test plan**: for each acceptance criterion, the test or the evidence that covers it. A criterion without one is a gap: add the test, or go back to P1.
9. **Critical points**: the five likeliest ways to get it wrong that no test covers yet. Each one becomes a test or an acceptance criterion (a new criterion is a spec change: tell the user).
10. **Tasks** by folder, with dependencies and the criteria each covers. Two tasks on the same files never run in parallel. Lanes S and H: the main session writes the code itself.
11. **Review.** Call the `reviewer` (`orchestra:reviewer`; without it a read-only agent on the strongest model) with the full text of `plan-review.md` and the paths of plan, spec and contract. Fix every blocker and high finding, run the premise check again, then send the reviewer (same agent, by message) the list of fixes and ask it to re-check only its findings and any gap the fixes opened. Repeat until no blocker or high is open; after three rounds, bring what is left to the user. Medium and low go to `Decisions` (accepted, with why) or to the tasks.
12. **Gate G2.** Write in the worklog `## Updates`: premise check command and result, review verdicts, open findings by severity. G2 passes only with the premise check green and no open blocker or high finding.
13. **Close P2.** Commit and push. Comment on the issue: plan link, G2 result, tasks count, next phase and who acts. Move the label to `phase:P3` (lane L, or lane M whose layout changes) or keep `phase:P2` until the approval, as the state table of `flow:next` says; run `Status:` if declared.

## Never
- Start P4 here. P4 on lanes M and L waits for `spec-ok` or `autonomous`.
- Write a premise from memory, from a doc, or from an agent's report without reading the line yourself.
- Change acceptance criteria silently: a new criterion goes back to the user.

## End
If the user asked to stop at G2, stop there. Close with the `recap` skill when this is the last skill of the turn.
