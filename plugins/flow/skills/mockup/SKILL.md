---
name: mockup
description: Phase P3 of the development flow. Draws or updates the HTML mockups of every screen a work item adds or changes, in both themes and in every state of the matrix, renders them to images, has the ux-critic judge them with the rubric, fixes blocker and high findings, and shows the images to the user. Gate G3 passes when the user sets mockup-ok. Lane L always; lane M only when the layout changes.
argument-hint: [issue number]
---

You show the screens before anyone builds them, and have them judged against a written rubric. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Rubric: `${CLAUDE_SKILL_DIR}/../../references/ux-rubric.md` plus the project's `Rubric:`. Details in `${CLAUDE_SKILL_DIR}/references/`: `drawing.md` (what to draw, names, states, paths), `render.md` (HTML to images), `critique.md` (calling the critic, contested findings, rounds).

## Before
1. Read the issue, the worklog, the spec (`spec.md` or `## Spec`) and the plan. Without a spec, start `flow:spec` instead. Lane S and lane M without a layout change have no P3: say so and hand back to `flow:next`.
2. Read the project's visual system and text rules (named in `Rubric:` or the project's interface rules), and load the design skill the project's rules name before the first file. Where a skill and the visual system differ, the visual system wins.
3. List the screens the scenarios cross: new, changed, and the unchanged neighbours a user passes through. Open the existing mockups of the changed screens in `Mockups:`.

## Steps
1. **Draw** (`drawing.md`). For each new or changed screen, write or update its HTML in `Mockups:`, both themes, same style as the existing mockups. A new file takes the issue number in its name as `Mockups:` says. Delegate the HTML to an implementer when it is long; the judgement stays here.
2. **States.** Every state of the matrix that applies: loading, empty, error with retry, long content, plan limit, first use, permission denied. A state that does not apply is written as "not applicable: why" in the worklog.
3. **Paths.** For each main scenario, the sequence of screens with the tap count; it must match the spec. A different count is a spec question for the user.
4. **Render** (`render.md`): the `Mockup render:` command, else Playwright at the device width of `Mockups:`. Images in `Evidence:` as WebP 540 px wide, named `<mockup>-<state>-<theme>.webp`. Look at every image yourself before calling the critic: a broken render is fixed, not judged.
5. **Critique** (`critique.md`): call `ux-critic` with at most four screens per call, the rubrics, the scenarios and captures or renders of the neighbouring screens. When the work touches a screen whose approved mockup is old, the critic judges that mockup too.
6. **Fix** every blocker and high finding you confirm, render again, and ask the critic to re-check only those screens. Three rounds on the same point at most; then the user chooses between the options, each with its consequence.
7. **Record.** In the worklog: one line per round (screens, verdict, findings by severity), medium findings fixed or postponed only by the user, low ones in `## Polish`, discarded findings in `## Decisions` with why. Save the critic's verdict as a file in `Evidence:`. If declared, record it with `Record evidence:` on the scenario's criterion that requires `ux_review`, with outcome `todo`: nothing is built yet, so the criterion stays open until P5.
8. **Show.** Commit and push. Comment on the issue with the images linked from the branch (one line per screen: name, states, themes), the tap count of each path, the open medium findings and what the user decides. Add the question to the issue's actions section if the project has one (`rules.md`, «The issue»). Keep `phase:P3`; run `Status:` if declared.

## Gate G3
The user approves with the label `mockup-ok`. Never set it, and never take a ticked box or a chat "ok" for it: ask them to set the label. Until then no screen code is written; P4 on lane L, and on lane M when it has a mockup, waits for both `spec-ok` (or `autonomous`) and `mockup-ok`. When the label is there, hand over to `flow:next`, which moves the issue to `phase:P4`.

## Never
- Copy mockup HTML into app code: mockups are a reference of measures and structure.
- Show the user a render you did not look at, or judge one in place of the critic.
- Change a scenario or a criterion to make a mockup pass: that is a spec change for the user.

## End
Close with the `recap` skill when this is the last skill of the turn.
