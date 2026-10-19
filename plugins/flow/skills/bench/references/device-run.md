# What to run on the device

## From criterion to command

| Evidence required | Produced by | Recorded as |
|---|---|---|
| `maestro` | the `Bench:` flows command with the flows that cover the criterion; a new flow first, written by the tester | the run report; the project's flows command may record green flows in the contract itself |
| `screen:<variant>` | the `Bench:` variants command on each screen the scenario crosses, or the capture command for one state | the image files, one per screen and variant |
| `ux_review` (device) | `ux-critic` on the captures, with the approved mockups and the touch-target report | the verdict file in `Evidence:` |
| `simulated_user` | a flow that calls the simulated-user script `Acceptance:` names, against the local database | the run report |
| `old_app` | the old-app check of `Acceptance:` | the run report; `not_verifiable_here` with where and when while the old build does not exist |
| `user_device` | a real phone: the tester on the user's phone only when the user asks in this session, the phone is connected and unlocked and the project's app is in the foreground; otherwise the user, in preview | the run report or captures; else a point of the manual test script |

A criterion whose required evidence the bench cannot produce stays `todo`, with the reason, or goes to the place the contract schema allows.

## Flows

- During a work item: the smoke set plus the flows of the areas the branch touches, read from the project's map of paths to areas. When the branch touches a shared path, the full run.
- A red flow is rerun only after a timeout or an environment failure, once, and the project's script usually does it. A failed assertion is a result, not a flake.
- A new flow is written by the tester from the live screen hierarchy, step by step, and saved only after a full green run. Never invent selectors, never tap coordinates more than a few times.
- Flows from `## Needs bench` «new flow to write» belong to this run; a flow change asked by a reviewer in P6 comes back here too.

## Variants

Always the variants `Acceptance:` marks as always (in the reference project: light, dark, large font on a small screen). The others only when the work item touches what they can break:

| The work item changes | Variant |
|---|---|
| texts | the other language |
| how data loads | offline |
| animations | reduced motion |
| lists, amounts, names | extreme data (simulated user or seed), not a setting |
| text or amount fields | input: other separators, pasted text; a manual test point when the device cannot do it |

Capture every screen the scenario crosses, not only the new ones, plus the neighbours the critic needs for consistency. The variants command puts the device back in its normal state after each variant; check it did before the next job.

## Touch targets

Run the `Bench:` targets command on every new or changed screen, in the default variant. Pass its list to the critic as the measured sizes (rubric: touch targets are judged from bounds, never from pixels). Elements still animating in are missing from the dump: say so instead of reporting them as absent.

## Recording

- Evidence files go in `Evidence:` with names `<criterion>-<screen>-<variant>.<ext>`, as the project's image format says.
- Each outcome with `Record evidence:`: outcome, evidence type and file, and where it ran (the bench machine and device). The command stores each file's fingerprint; never edit the contract by hand when the command exists.
- In the worklog, `## Verified`: one line per criterion that passed (id, command, device, evidence file). `## Needs bench`: tick or strike each item done; leave the section only when every item is done or placed.
- The manual test script (`## To verify by the user`): only what a machine cannot prove here (real phone, camera, remote notifications, feel), at most ten points, each with the user and the data to use.
