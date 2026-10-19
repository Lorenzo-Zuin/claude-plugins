# Spec templates (fallback, when `Templates:` has no `spec.md`)

Headings below are in English for this file; write them in the project's language unless the project's template says otherwise. The worklog headings (`## Spec`, `## Plan`…) stay as the worklog template has them.

## Lane L: `spec.md` in the work item folder

```markdown
# <Title of the work item> (#<issue>)

## Problem
One or two sentences: what does not work today, for whom.

## Expected result
What the user can do afterwards that they cannot do today.

## Roles
| Role | What they can do | What they see |
|---|---|---|

## Scenarios
- **S1** Given … When … Then …
- **S2** …

## Completeness matrix
| Row | Answer |
|---|---|
| M1 Roles | yes, S1, S4 |
| M5 Input | not applicable: no input field changes |

## Out of scope

## Decisions taken
| Decision | Alternatives discarded | Who, when |
|---|---|---|
```

## Lane M: `## Spec` of the worklog

Same parts, short. Roles only when more than one is involved.

```markdown
## Spec
**Problem.** …
**Expected result.** …

**Scenarios**
- **S1** Given … When … Then …

**Completeness matrix.** M1 yes, S2 · M3 yes, S1 · M8 yes, S3 · not applicable: M2 (no entry point changes), M5 (no input), …

**Out of scope.** …

**Decisions taken.** <decision> — <alternatives> — <who, when>
```

## Scenarios

- One behaviour per scenario. "Then" is observable by a test or a person: a value, a screen state, a row, a message. Never "works correctly".
- Given names the role and the data; When names one action; Then names the result and, when it matters, what does **not** change.
- Number in reading order; never renumber after the contract exists: add `S7` instead.

## Summary (issue comment at the end of P1, at most ten lines)

```
P1 Spec fatto · <spec link or worklog link>
Problema: …
Risultato: …
Scenari: S1 …; S2 …; S3 … (one line)
Ruoli: … · Fuori portata: …
Decisioni: … (Q answered, with who)
Lacune: reviewer <n finding, all closed | open: …>
Contract: <n> acceptance criteria
Prossimo passo: approva la spec con la label `spec-ok` (tu) · P2 Technical plan (la sessione, intanto)
```
