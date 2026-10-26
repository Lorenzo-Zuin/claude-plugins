---
name: handoff
description: Phase P6 of the development flow. Brings a complete, verified work item into the integration branch - merge of the integration branch, reviewer check of code against spec, release fragment, notes, docs and development data checked, the project's handoff command, full check, worklog closed, gate, and the pull request from the project's template. Gate G6 is the gate at PR time plus the PR checks.
argument-hint: [issue number]
---

You hand the work item over to the integration branch. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Details in `${CLAUDE_SKILL_DIR}/references/`: `spec-diff-review.md` (instructions for the reviewer), `checklist.md` (what the work item may have to update), `pr.md` (filling the pull request).

## Before
1. Read the issue, the worklog, the spec, the plan and the contract. P5 must be done: no criterion `todo` or `fail` except those waiting for a place the contract allows (`not_verifiable_here` with where), and no `needs-bench` label. Otherwise hand back to `flow:next`.
2. An open pull request for this branch already exists: go to step 8 and update it instead of opening a second one.

## Steps
1. **Merge** the integration branch (the `Partito da` branch of the worklog) into the work item branch. Resolve conflicts keeping both behaviours; a conflict where one side's behaviour would be lost goes to the user. Rerun the `Targeted check` after a merge that changed code.
2. **Code against spec.** Call the `reviewer` (`orchestra:reviewer`; without it a read-only agent on the strongest model) with the full text of `spec-diff-review.md`, the diff range and the paths of spec, plan and contract. Every blocker or high finding goes back to P4 (`orchestra:orchestra`) with a failing test first; then P5 only on what the fix touches.
3. **Updates** (`checklist.md`): release fragment and release notes, infrastructure map, docs, decision records, development data, device flows. For each item: done (file), or "not applicable: why" in the worklog. Development data is only checked here, never written: it changes in P4. Device flows change only on the bench.
   Then the **docs sweep**, never from memory: run `Docs check:` if declared, fix every problem it names, reread every text file it lists (docs, guides, rules, READMEs, commands, infrastructure) and fix what is no longer true, then write in the worklog the line it asks for. Without the key, search every tracked text file for each path and command the branch removed, renamed or changed, reread the hits, and list them in the worklog.
4. **Handoff command.** Run `Handoff:` if declared (in the reference flow: migration timestamps newer than the integration branch, numbers for decision records and docs, the `phase:P6` label). It must run on a clean tree: commit first. If it renamed files (migrations, decision records, docs), run the docs sweep again and write its new line.
5. **AI criteria.** A criterion requiring `eval_result` without one: add the label `needs-bench`, write "evaluation needed" in the worklog with the command the project names, and stop before the PR. The user runs the evaluation.
6. **Full check.** Run `Full check:` (else the full round of `## Verification commands`). It must be green on the commit you will push. Commit what it writes (the receipt), so the receipt matches the tree of the PR.
7. **Close the worklog**: `## Verified` (only what was run, with command and place), `## To verify by the user` (at most ten points, the manual test script), `## Discoveries` (what the next session in this area must know), one line in `## Updates`. Commit and push.
8. **Gate and PR.** Run `Gate:` if declared; red: fix what it names and repeat from the step it points to. Then open the pull request toward the integration branch from `PR template:` (`pr.md`). Keep the issue at `phase:P6`: the project's automation or the next session moves it after the merge.
9. **Drive it green.** Watch the PR checks; a red check is work now: fix, rerun the checks the fix needs, push. Answer review comments.
10. **Merge.** Only when `Merge:` lets the session merge, and only toward the integration branch: confirm the PR is clean (checks green on the current head, no conflict, base up to date), write the review the rule asks for where it asks for it (for example a comment on the PR with the reviewer's verdicts and no open blocker or high finding), then merge with the tool the rule names. If the tool asks for confirmation, wait for the user. Without `Merge:`, the merge is the user's: say the PR waits for it.

## Gate G6
The project's gate at PR time (hook or `Gate:`) and its checks on the PR (in the reference flow, jobs `gate` and `integration`). Both green, no open blocker or high finding, no merge conflict: then the PR waits only for the merge.

## Never
- Open the PR with a red gate, a receipt on another tree, or a failing check you have not explained in the PR.
- Merge without the project's `Merge:` rule allowing it, or merge toward a release or production branch.
- Rewrite history on a branch someone else uses: merge, never rebase.

## End
Close with the `recap` skill: the PR link, what waits for the user (merge, preview test), what was not verified and where it will be.
