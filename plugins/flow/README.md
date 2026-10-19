# flow

Skill di Claude Code per il development flow, dalla richiesta alla release, una phase alla volta. La versione 0.3 copre le phase da P0 a P6: le skill `next`, `work`, `spec`, `plan`, `mockup`, `qa`, `bench` e `handoff`, e gli agenti `ux-critic` e `device-tester`. Le skill `release` e `learn` arriveranno dopo. I file letti dal modello sono in inglese, come in `orchestra`; questa guida è in italiano.

| Skill | Phase | Che cosa fa | Scrive |
|---|---|---|---|
| `/flow:next` | tutte | legge worklog, label della issue e `git log` e avvia la skill della phase dopo; senza un work item aperto propone la prossima issue autorizzata | — |
| `/flow:work` | P0 Triage | controlla l'autorizzazione, i percorsi e le collisioni con i work item aperti; sceglie la lane; crea o completa la issue; apre il work item con il comando del progetto | issue, branch, cartella, contract vuoto |
| `/flow:spec` | P1 Spec | intervista l'utente (al massimo cinque domande per giro, con la risposta consigliata), scrive la spec con la completeness matrix e gli acceptance criteria, chiede al `reviewer` le lacune | `spec.md` (lane L) o spec breve nel worklog (lane M), criteri del contract |
| `/flow:plan` | P2 Technical plan | mappa con `explore`, premise controllate dallo script del progetto, disegno, dati di sviluppo, compatibilità, piano dei test, punti critici, task; revisione del `reviewer`; gate G2 | `plan.md` (lane L) o plan breve nel worklog (lane M) |
| `/flow:mockup` | P3 Mockup | mockup HTML nei due temi e in tutti gli stati della matrix, percorsi con il numero di tocchi, immagini WebP, giudizio dell'agente `ux-critic` con la rubric, correzioni fino a tre giri; gate G3 con la label `mockup-ok` dell'utente | HTML, immagini e verdetti in `evidence/` |
| `/flow:qa` | P5 QA, parte automatica | prova ogni acceptance criterion che una macchina può provare senza il bench: test, pgTAP, Deno, end-to-end sul sistema locale, console e sito con catture giudicate dal critic; esiti nel contract; sezione «Needs bench» e label `needs-bench` per il dispositivo | evidence, esiti del contract |
| `/flow:bench` | P5 QA, parte sul dispositivo | sulla macchina del bench: prende il bench lock, esegue il bench check e si ferma al primo problema con il rimedio, poi prova con l'agente `device-tester` i criteri della sezione «Needs bench» del work item più vecchio della bench queue: flow, variant, bersagli di tocco, catture giudicate dal critic; libera il lock alla fine | evidence, esiti del contract, flow nuovi, manual test script |
| `/flow:handoff` | P6 Handoff | merge dell'integration branch, confronto del codice con la spec da parte del `reviewer`, fragment, note, documenti e dati di sviluppo controllati, comando di handoff del progetto, full check, worklog chiuso, gate, PR dal modello del progetto; la segue fino al verde | PR |

Ogni skill ha un `SKILL.md` sotto le 100 righe; i dettagli sono in `references/`, letti solo quando servono:

| File | Contenuto |
|---|---|
| `references/project-sections.md` | le chiavi che il progetto dichiara e il controllo all'avvio |
| `references/rules.md` | termini, label e chi le mette, issue, cartella del work item, lingua |
| `references/lanes.md` | condizioni delle lane e phase di ogni lane |
| `references/ux-rubric.md` | rubric UX generica (R1-R16), severity, grado di certezza e giri; il progetto aggiunge la sua parte con `Rubric:` |
| `agents/ux-critic.md` | l'agente che giudica immagini di mockup e catture, al massimo quattro schermate per chiamata (Sonnet, in sola lettura) |
| `agents/device-tester.md` | l'agente che guida il bench sotto il lock della sessione: bench check, flow, variant, catture, bersagli di tocco, simulated user; riporta le evidence, non diagnostica e non corregge l'app (Sonnet) |
| `skills/next/references/state-table.md` | da stato a phase dopo, riga per riga |
| `skills/work/references/` | percorsi, collisioni, slug, commenti; corpo della issue di riserva |
| `skills/spec/references/` | completeness matrix generica, domande, modelli della spec, acceptance criteria, istruzioni del `reviewer` per le lacune |
| `skills/plan/references/` | modelli del plan, premise, istruzioni del `reviewer` per il plan |
| `skills/mockup/references/` | che cosa disegnare (nomi, stati, percorsi), da HTML a immagini, come chiamare il critic e decidere sui finding contestati |
| `skills/qa/references/` | come si produce e si registra ogni tipo di evidence; la sezione «Needs bench» |
| `skills/bench/references/` | lock e bench check con i rimedi permessi, da criterio a comando (flow, variant, bersagli di tocco, registrazione), richiesta al `device-tester` |
| `skills/handoff/references/` | istruzioni del `reviewer` per il confronto codice-spec, voci da aggiornare, compilazione della PR |

## Dipendenze

- **`orchestra`**: `spec`, `plan` e `handoff` chiedono le revisioni a `orchestra:reviewer` e `plan` la mappa a `orchestra:explore`; la phase P4 è `/orchestra:orchestra`, e `qa` e `handoff` ci rimandano i difetti. Senza `orchestra` le skill usano un agente generico in sola lettura e lo dicono.
- **`recap`**: il messaggio finale, se è installato.

## Regole che le skill rispettano

- Si lavora solo su issue con `ready` o `requested`, senza `on-hold`. Una sessione non mette mai `ready`, `on-hold`, `lane:H`, `spec-ok`, `mockup-ok`, `preview-ok` o `autonomous`, e non toglie mai `on-hold`. Le sessioni cloud agiscono con l'identità GitHub dell'utente: GitHub non le distingue, quindi la regola la tiene la skill (e gli hook del progetto, se ci sono).
- Una richiesta dell'utente nella sessione vale come autorizzazione: la issue nasce con `requested` e con la sua frase nel corpo.
- Lo status block della issue lo scrivono solo gli script del progetto; le sezioni dell'utente non si toccano. Le transizioni sono commenti più la label `phase:Pn`.
- Senza `spec-ok` o `autonomous` le lane M e L non entrano in P4; P2 e P3 possono andare avanti intanto. Senza `mockup-ok` non entrano in P4 la lane L e la lane M che ha un mockup.
- Il merge della PR nell'integration branch segue la regola `Merge:` del progetto; senza, lo fa l'utente. Mai un merge verso un branch di release o di produzione.

## Che cosa mette il progetto

Nessun file del plugin nomina comandi o percorsi di un progetto. Il progetto li dichiara con chiavi fisse in inglese, in uno di due posti:

- una sezione `## Flow` di `CLAUDE.md`;
- una riga `- Flow: <file>` in `CLAUDE.md`, che nomina un file con le stesse chiavi. Serve quando `CLAUDE.md` deve restare corto; se ci sono tutte e due, vale il file.

```markdown
## Flow

- Work items: <cartella del work item, con <issue> e <slug>>
- Templates: <cartella con issue.md, worklog.md, spec.md, plan.md>
- Next issue: <comando che elenca le issue autorizzate>
- Open work item: <comando che apre il work item: label, branch, cartella, primo commit>
- Status: <comando che riscrive lo status block> (facoltativo)
- Contract check: <comando che valida il contract> (facoltativo)
- Contract schema: <file e sezione dello schema del contract> (facoltativo)
- Lanes: <file e sezione con le condizioni delle lane> (facoltativo)
- Roles: <dove si leggono i ruoli: schema, tipo, tabella> (facoltativo)
- Matrix: <file e sezione con le righe di progetto della matrix> (facoltativo)
- Solutions: <cartella delle note sui difetti risolti> (facoltativo)
- Dev data: <dove stanno i dati di sviluppo e chi sono i loro utenti> (facoltativo)
- Release fragment: <percorso del fragment, con <issue>, e dove è descritto il formato> (facoltativo)
- Mockups: <cartella dei mockup HTML, regola per il nome di un file nuovo, larghezza e altezza del dispositivo di riferimento> (facoltativo)
- Mockup render: <comando che converte un mockup in un'immagine per riquadro e tema, chiamata dalla didascalia del riquadro; se scrive lo SHA-256 di ogni immagine, la skill lo passa a `Record evidence:`> (facoltativo)
- Rubric: <parte del progetto della rubric UX, con sistema visivo e regole dei testi> (facoltativo)
- Evidence: <cartella delle evidence del work item, con <issue> e <slug>, e formato delle immagini> (facoltativo)
- Record evidence: <comando che scrive esito ed evidence di un acceptance criterion> (facoltativo)
- QA commands: <comandi di QA automatico oltre ai test: end-to-end della console, build, catture con larghezze e temi, controlli di disegno> (facoltativo)
- Bench: <comando del bench e le sue azioni: stato, presa, rinnovo e rilascio del lock, check, reset del database locale, flow, cattura, variant, bersagli di tocco> (facoltativo)
- Acceptance: <file con le regole del bench: scadenza del lock, dispositivi, controllo dell'app in primo piano, cattura, variant, utenti, flow, reset permessi, sicurezza sul telefono personale> (facoltativo)
- App id: <identificativo dell'app del progetto per ogni variant di build> (facoltativo)
- Gate: <comando che dice che cosa manca prima della PR> (facoltativo)
- Handoff: <comando che prepara il work item per la PR> (facoltativo)
- Full check: <full run che scrive anche la receipt> (facoltativo)
- PR template: <modello della PR> (facoltativo)
- Merge: <chi può fare il merge della PR nell'integration branch, e a quali condizioni> (facoltativo)
```

`Premise check:` e `Decisions:` si leggono dalla sezione `## Orchestration`, e `Targeted check:` da `## Verification commands`, dove li legge già `orchestra`: non si ripetono. Il significato di ogni chiave, e che cosa succede senza, è in `references/project-sections.md`. Se manca una chiave obbligatoria, `next` e `work` lo dicono all'avvio, propongono il testo ricavato dai file del progetto e lo aggiungono solo dopo un sì.

## Installazione

Dal marketplace `lorenzo-plugins`; per proporlo nei progetti e per le sessioni cloud vedi il [README del marketplace](../../README.md#installare).

```bash
claude plugin marketplace add <utente>/<repository>
claude plugin install flow@lorenzo-plugins
```

Poi si apre una sessione nuova. Per controllare che funzioni: `/flow:next`, `/flow:work`, `/flow:spec`, `/flow:plan`, `/flow:mockup`, `/flow:qa`, `/flow:bench` e `/flow:handoff` compaiono fra i comandi, e `flow:ux-critic` e `flow:device-tester` fra gli agenti (`/agents`).

## Modificare il plugin

- Ogni modifica porta un aumento di `version` in `.claude-plugin/plugin.json` e nella voce `flow` di `marketplace.json`: devono coincidere.
- Ogni `SKILL.md` resta sotto le 100 righe: il resto va in `references/`.
- Prima del commit, dalla radice del marketplace: `claude plugin validate --strict .` e `claude plugin validate --strict plugins/flow`.
- Per provare le modifiche senza pubblicarle: `claude --plugin-dir plugins/flow`.
