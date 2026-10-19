# Issue body (fallback, when `Templates:` has no `issue.md`)

Headings in the project's language; the Italian ones below match the reference flow. The status-block markers stay empty: only the project's `Status:` command fills them.

```markdown
<!-- flow:status -->
<!-- /flow:status -->

## Richiesta
<the user's words; with `requested`, their sentence word for word, in quotes>

## Comportamento
<lanes S and H only: current, expected, unchanged>

## Percorsi toccati
<one path pattern per line, between backticks>

## Azioni per te
<per lane: S «Ho provato in preview, va bene»; M «Approvo la spec» (and the mockup if any) and the preview; L «Approvo la spec», «Approvo i mockup», the preview; R the decision>

## Avanzamento
- [x] P0 Triage
- [ ] P1 Spec
- [ ] P2 Technical plan
- [ ] P3 Mockup
- [ ] P4 Implementation
- [ ] P5 QA
- [ ] P6 Handoff
- [ ] P7 Preview
- [ ] P8 Release
- [ ] P9 Monitoring and learning

## Note dell'utente
<free text: every session reads it before starting>

## Collegamenti
Branch `<…>` · cartella `<Work items: folder>`
```

The approval boxes are reminders: ticking one does not approve. The labels do.
