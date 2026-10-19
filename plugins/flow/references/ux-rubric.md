# UX rubric (generic part)

The `ux-critic` judges mockup images (P3) and device or browser captures (P5) against this rubric. The project adds its own part in the file named by `Rubric:` (project-sections.md): the same ids with the project's references, and extra rows with a letter of its own (`B1`, `B2`… in the reference project; never `P1`…, which reads as a phase). Where the project's part and this file differ, the project wins. Where a design skill and the project's visual system differ, the visual system wins.

## Items

| Id | Item | Passes when |
|---|---|---|
| R1 | Purpose | the main action is recognisable in 3 seconds; there is one primary button |
| R2 | Hierarchy | the most important information is the largest; at most three type levels |
| R3 | Path | the action ends in the taps the spec planned; no screen without an exit; "back" returns to the previous screen of the path; the keyboard covers neither the active field nor the primary button; two paths to the same action behave the same way |
| R4 | States | skeleton with the same geometry as the content; empty state with an action; error with "retry"; no fake data; a placeholder never shows a plausible value |
| R5 | Texts | the project's text rules; no truncation on a small screen, in the second language, at font scale 1.3; no internal value shown as text |
| R6 | Consistency | same components, spacing and icons as the neighbouring screens |
| R7 | Touch | targets of at least 48 dp (44 pt on iOS), measured from the hierarchy, never from pixels; frequent actions in the thumb zone; feedback on touch |
| R8 | Accessibility | WCAG AA contrast; labels for the screen reader; font scale 1.3 without overlaps |
| R9 | Motion | only the durations and curves of the visual system; no layout jump; reduced motion respected |
| R10 | Money and trust | amounts from the formatting functions; sign, colour and direction (expense or income) consistent; confirmation or "undo" for destructive actions |
| R11 | Prevented errors | validation on the field; a disabled control says why; no technical text |
| R12 | Platform | system back gesture, status bar in the app's theme, safe areas, platform conventions |
| R13 | Several roles | it is clear what the other person sees and who may do what; notifications respect the preferences |
| R14 | Mockup fidelity | structure, measures, spacing, type scale, colours, icons as in the approved mockup (P5 only) |
| R15 | Lists | an item reads at a glance, at most two lines; amount on the right; small actions; never full-width buttons inside an item |
| R16 | Input | decimal and thousands separators right with every keyboard; pasted and dictated text accepted |

## Severity

| Severity | Meaning | What happens |
|---|---|---|
| blocker | stops the user from finishing the action, shows wrong or fake data, has cut or unreadable text, breaks a project invariant | fixed before the gate |
| high | slows down or confuses, is inconsistent with the neighbouring screens, breaks the visual system or the text rules | fixed before the gate |
| medium | makes use worse without blocking it | fixed in the same work item; only the user may postpone it |
| low | polish | goes to `## Polish` of the worklog, one per line; fixed if cheap, else in one polish issue per release |

## Confidence and rounds

- Each finding carries a confidence from 0 to 100. Under 80 it is dropped, **except** on risk paths (deletion, account, money, security, AI): there a doubt becomes an acceptance criterion "to prove" in the contract, never a silent drop.
- At most four screens per call to the critic: with more, half of the judgements get lost.
- At most three rounds of critique on the same point; then the user chooses.
- When the critic says FAIL, the main session looks at the images itself and confirms or discards each blocker and high finding, with one line of why. A discarded finding is written in `## Decisions`.
