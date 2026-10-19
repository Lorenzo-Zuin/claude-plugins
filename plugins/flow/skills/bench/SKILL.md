---
name: bench
description: Phase P5 of the development flow, device part. On the bench machine, takes the bench lock, runs the project's bench check and stops at the first problem with its remedy, then proves the device criteria of the oldest work item in the bench queue through the device-tester - flows, variants, touch targets, captures judged by the ux-critic - records outcomes and evidence, and frees the lock. Use it when an issue has needs-bench and the session runs on the bench machine.
argument-hint: [issue number]
---

You prove on a real device what the automatic part of P5 left in `## Needs bench`. You do not fix the app here: a failure goes back to P4. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Details in `${CLAUDE_SKILL_DIR}/references/`: `lock-and-check.md` (the lock, the check, what stops the run), `device-run.md` (what to run for each criterion, variants, flows, recording), `tester-request.md` (the request to `device-tester`).

## Before
1. Read `Bench:`, `Acceptance:` and `App id:`. Without `Bench:` the project has no bench script: say so, point to the manual steps of the project's flow guide, and stop. Read the whole `Acceptance:` file once: devices, users, capture method, allowed resets and safety rules come from there, never from memory.
2. A session that cannot reach the bench (a cloud container, no `adb`, no device) stops here: the work item keeps `needs-bench` and waits for a session on the bench machine. Say so in one line.
3. Pick the work item: the issue in `$ARGUMENTS`, else the oldest open issue with `needs-bench` that is authorized (`rules.md`, «Labels»). One work item per run. Switch to its branch (`git fetch`, `git switch`), merge the integration branch if it moved, and read the issue, the worklog (`## Needs bench`), the spec, the plan and the contract.
4. A criterion that waits only for the user's evaluation run, with no device part, is not yours: leave it and say so.

## Steps
1. **Lock** (`lock-and-check.md`). Take it with the `Bench:` lock command for this session. Held by someone else: say who and since when, and stop; never force it unless the user asks in this session.
2. **Check.** Run the `Bench:` check for the variant the criteria need. It stops at the first problem and prints the remedy. Apply the remedy only when it is yours to apply (`lock-and-check.md`, «Remedies»); otherwise free the lock and stop with the remedy for the user. Run the check again after each remedy. Never skip a step to go on.
3. **Plan the run** (`device-run.md`): for each criterion in `## Needs bench`, the evidence it requires and the command that produces it; the flows to run (smoke set plus the areas the branch touches, or the full run when shared parts change); the variants by risk; the screens for touch targets; the flows to write. Write the list in the worklog before running anything.
4. **Run** through `device-tester` (`flow:device-tester` as a plugin) with `tester-request.md`: one request per group of criteria that share users and data. It holds no lock of its own: it works under this session's lock and renews it. One device job at a time.
5. **Judge.** Check every file it returns exists and opens; look at each capture yourself. Then call `ux-critic` with captures, mockups and the touch-target report (at most four screens per call; `../mockup/references/critique.md` for its findings).
6. **Record** each result with `Record evidence:` (`device-run.md`, «Recording»). `pass` only with every required evidence type; `fail` with what happened and the evidence paths; `not_verifiable_here` only where the contract schema allows, with where and when.
7. **Failures.** A red flow or a confirmed blocker or high finding goes back to P4 with a failing test or flow first; the bench part is rerun only for what the fix touches. Three rounds on the same criterion: bring it to the user.
8. **Close.** Commit and push evidence, flows and contract. Write the manual test script in the worklog (`## To verify by the user`, at most ten points a machine cannot prove). Remove `needs-bench` only when `## Needs bench` is fully done. Free the lock. Run `Gate:` if declared, comment on the issue (criteria by outcome, evidence links, what is left), run `Status:` if declared, and hand over to `flow:next`.

## Never
- Work without the lock, after losing it, or on a device the request did not name.
- Capture, tap or type when anything other than the project's app is in the foreground, or open the notification shade, the recent apps or another app on a personal phone. A locked phone stops the run.
- Reset a shared resource other than the ones `Acceptance:` allows, or any remote environment.
- Record `pass` from the tester's report without opening the files, or from a run on another commit.

## End
Free the lock even when the run stops early. Close with the `recap` skill when this is the last skill of the turn.
