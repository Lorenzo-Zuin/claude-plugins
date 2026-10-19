# The `## Needs bench` section

Written by the automatic part of P5 when a criterion needs the device bench. A session on the bench machine reads it and works from it alone, without the conversation that wrote it: it must be complete.

```markdown
## Needs bench
- Criteria: S2 (`maestro`, `screen:dark`), S4 (`simulated_user`)
- Screens: M142 people, M142b confirmation; neighbours Home and Movements for consistency
- Variants: always light, dark, font 1.3 on a small screen; plus English (texts changed), extreme data (lists)
- Flows: run the smoke set and the flows of areas `area:contacts`; new flow to write: «Share with» from the detail (S2), starting from data user B
- Users and data: users A and B from the development data; S4 needs B to add a shared item while A watches
- Mockups to compare: the approved images in `evidence/` (P3)
- Branch and commit: `<branch>` at `<sha>`
```

- One line per kind of item; nothing that the plan or the spec already says in full: link them.
- Add the label `needs-bench` at the same time. Only the bench session (`flow:bench`) removes it, when the section is done.
- If the project has no bench (no device part at all), the device criteria go to the user's manual test script instead, and the section says so in one line.
