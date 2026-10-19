# Calling the critic

## The request

Call `ux-critic` (`flow:ux-critic` as a plugin) with paths, never pasted text:

```text
Phase: P3 (mockup). Work item #<issue>.
Rubrics: <plugin>/references/ux-rubric.md; <project Rubric: file>
Scenarios: <spec.md or worklog.md#spec>, S1 (3 taps), S2 (2 taps)
Screens (at most four):
- M142 people: <evidence>/M142-content-light.webp, …-dark.webp, …-empty-light.webp, …-loading-light.webp
- …
Neighbours for consistency: <images of the screens before and after in the paths>
Old approved mockups to judge too: <paths, or none>
Annotations: <what in the images is a design note, not UI (dashed outlines, captions), or none>
```

More than four screens: split into several calls, each with the neighbours it needs. The same agent may receive later rounds by message, so it keeps what it already saw.

## Its answer

- PASS: record it and go on.
- FAIL: open the images of each blocker and high finding yourself. Confirm it (it goes to the fixes) or discard it with one line of why (it goes to `## Decisions`). A finding on a risk path (deletion, account, money, security, AI) is never discarded for low confidence: it becomes an acceptance criterion "to prove" in the contract, and the user is told.
- Medium: fixed in this work item unless the user postpones it. Low: `## Polish`.
- "Not judgeable here" (motion, gestures): write them in the worklog as points for P5 on the device.

## Rounds

After the fixes, render again only the changed screens and ask the critic to re-check its open findings and any problem the fix introduced. A round is one call plus its fixes. On the third round about the same point, stop and put the options to the user, each with its consequence and your recommendation.
