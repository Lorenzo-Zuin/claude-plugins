---
name: spec
description: Phase P1 of the development flow. Interviews the user and writes the product spec of a work item and its acceptance criteria, then has them reviewed for gaps against the completeness matrix. Lane L writes spec.md; lane M a short spec in worklog.md; lanes S and H the behaviour in the issue; lane R the question.
argument-hint: [issue number]
---

You write what must happen, for whom and in which cases, before anyone decides how. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Details in `${CLAUDE_SKILL_DIR}/references/`, read when the step comes: `matrix.md`, `questions.md`, `spec-template.md`, `acceptance.md`, `spec-review.md`.

## Before
Read the issue (comments and user's notes included) and `worklog.md`. Read the project docs of the area and the `Solutions:` notes about it. Check today's behaviour on the code, never on docs alone: a doc may be old.

## By lane
- **S, H**: write in the issue current, expected and unchanged behaviour (H also the data of the defect: rows, logs, captures). One acceptance criterion per expected behaviour (step 4). Then the transition (step 6) to `phase:P4` (S) or `phase:P2` (H).
- **R**: write the question and what to weigh in the worklog. No contract. Transition to the document.
- **M**: the short spec in `## Spec` of the worklog. **L**: `spec.md` in the work item folder. Both follow the steps below.

## Steps (M and L)
1. **Classify** what you already know against the matrix (`matrix.md` plus the project's `Matrix:` rows): covered, partial, missing. Roles come from the schema (`Roles:`), never from memory.
2. **Interview** only on what is partial or missing (`questions.md`): at most five multiple-choice questions per round, each with your recommended answer and why. Never ask what code or docs answer. In autonomous mode (label `autonomous`) do not ask: decide, and write each decision with its cost if wrong.
3. **Write the spec** from the `Templates:` spec template, else `spec-template.md`: problem, expected result, roles, scenarios `S1…Sn` as Given/When/Then, matrix with every row answered ("yes, Sn" or "not applicable: why"), out of scope, decisions taken. Lane M keeps the same parts, short.
4. **Write the acceptance criteria** in the contract (`acceptance.md`): one per scenario and per relevant matrix row, with role, platforms, risk and the evidence required. Then run `Contract check:` if declared.
5. **Gap review.** Call the `reviewer` (`orchestra:reviewer` as a plugin; without it a read-only agent on the strongest model) with the full text of `spec-review.md`, the path of `matrix.md`, the project's `Matrix:` and `Roles:` declarations, and the spec location. Fix what it finds that the matrix implies. Bring its questions for the user to the user, with the recommended answers. If a finding was blocker or high, send the same reviewer (by message) the list of fixes and ask it to re-check only its findings and any gap the fixes opened.
6. **Close P1.** Commit and push. Comment on the issue with a summary of at most ten lines (`spec-template.md`, «Summary»), then move the label to `phase:P2` and run `Status:` if declared.

## Approval
- The user approves with the label `spec-ok`, whenever they want. `autonomous` stands in for it. Never set either label, and never treat a ticked box as approval.
- While the approval waits you may go on with P2 and P3. **Never start P4 on lanes M and L without `spec-ok` or `autonomous`.**
- After the approval the criteria change only with a new approval: say what changed and ask again.

## End
If the user asked to stop at a gate, stop there. Otherwise hand over to `flow:plan` (lanes M, L, H). Close with the `recap` skill when this is the last skill of the turn.
