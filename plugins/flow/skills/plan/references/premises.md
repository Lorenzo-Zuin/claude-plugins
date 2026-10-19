# Premises

A premise is a claim on **today's** code that the plan relies on. Wrong premises are the most declared cause of rework: they are checked by a script, not by trust.

## Row shape

```markdown
| Today the code… | file:line | Excerpt |
|---|---|---|
| sets the expense date to a fixed day | `db/seed/data.sql:42` | `'2026-09-15'::date,` |
| reads the month from the device clock | `src/month.ts:18-19` | `const now = new Date();<br>const month = now.getMonth();` |
```

- **Claim**: one fact, in present tense, that someone could prove false by reading the line.
- **file:line**: path from the repository root, between backticks; a range `a-b` when the excerpt spans lines.
- **Excerpt**: at most three lines, copied from a fresh read, between backticks; join lines with `<br>`. Escape a `|` inside the excerpt as `\|`. Keep the leading text that makes it unique; leading spaces may be dropped.
- One claim per row. A claim that needs two places is two rows.

## Which premises to write

- Every line of code the design changes or depends on: the function you extend, the constant you replace, the test that pins today's behaviour.
- Every "there is no X" claim the design rests on: write the search you ran and its empty result in `Decisions`, since a script cannot find an absence.
- Every closed list the work adds a value to (`explore` lists them).

## Checking

1. Run the `Premise check:` command of `## Orchestration` on the plan file (lane L) or the worklog (lane M).
2. A premise it does not find is false or old: read the file again, fix the row or the claim, run it again. A row it cannot read counts as false too.
3. Never drop a premise to make the check green. If the claim is no longer needed, say why in `Decisions`.
4. Without a declared command, re-read each line yourself after writing the plan and write "premises checked by reading, no script" in the gate record.
