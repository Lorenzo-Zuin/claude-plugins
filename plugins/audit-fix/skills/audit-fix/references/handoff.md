# Hand-off template

Write it in the user's language. Keep each step to one action. Commands follow the user's own conventions from CLAUDE.md or their preferences (for example, some users want `;` instead of `&&` between commands).

```markdown
# <report title>: esito

Rapporto: <link>. Richiesta di unione: <link> (base `<branch>`).

## Fatto nel repository

| Voce | Esito | Prova |
|---|---|---|
| <id> <component> | <what changed, in which file> | <source URL> |

## Da fare a mano

### 1. <short title> (<id>, <where: PC / console / decision>)

Perché: <one sentence, with the source>.

1. <action>
   ```
   <exact command>
   ```
2. <how to check it worked: command and expected output>

### 2. …

## Sbagliato nel rapporto

- **<id>**: the report says <claim>. <What the proof shows>. <Proof: file or URL>. What was done instead.

## Migliorie per il generatore del rapporto

| # | File | Modifica | Perché (voce) | Costo |
|---|---|---|---|---|
| 1 | <agent instructions / rubric / inventory script> | <change> | <id> | <more tokens, a new host…> |

Come applicarle: <the command from `## Audit fix`, e.g. `ant apply …`>, then <what to commit>.

## Non verificato

- <item>: <why> (no access, needs a device, verified only by CI…).
```

## Closing comment on the report

Posted on the report by step 7 (mode `aggiorna`, or `proponi` after a yes). Short: the PR holds the detail.

```markdown
## Esito

**Fatto** con la PR #<n>:
- [x] <id> <component>: <what changed>

**A mano**, da spuntare quando è fatto:
- [ ] <id> <step, where (PC / console)>

**Sbagliato nel rapporto**: <id>. <What the proof shows, in one or two sentences>. <Where the reason is written in the repository>.

**Rinviato**: <the Rinvii place, as a path and section>. <When the report closes: on the merge of PR #<n>, or who closes it>.
```

