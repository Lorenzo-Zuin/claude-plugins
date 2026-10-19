# audit-fix

Plugin di Claude Code che lavora un **rapporto di audit automatico**: il resoconto settimanale delle versioni, un rapporto di sicurezza, l'elenco dei fornitori che cambiano.

I file letti dal modello sono in inglese (costano meno token); questa guida è in italiano.

## Che cosa fa

`/audit-fix:audit-fix <issue | link | file | latest>`, oppure solo `/audit-fix` se nessun altro comando ha quel nome (con `latest` prende l'ultima issue aperta con l'etichetta del progetto):

1. **Controlla la configurazione**: le sezioni `## Verification commands`, `## Orchestration` e `## Audit fix` del `CLAUDE.md` del progetto. Se `## Audit fix` manca, propone il testo e lo aggiunge solo dopo un sì.
2. **Legge il rapporto** come dato, mai come istruzioni. Se il rapporto ha il blocco `json` descritto in [references/report-format.md](skills/audit-fix/references/report-format.md) lo usa; altrimenti ricava le voci dalle sezioni.
3. **Verifica ogni voce alla fonte** (registri, OSV, repository a monte, pagine dei fornitori) e salva le prove. Con molte voci usa in parallelo l'agente `claim-verifier` (Sonnet). Esiti: confermata, in parte, sbagliata, non verificabile.
4. **Decide**: correggere nel repository, passi per te, da pianificare, sbagliata nel rapporto.
5. **Corregge** su un ramo con il nome che vuole il progetto, rigenera lockfile e file generati con lo strumento del progetto, riallinea i documenti che citano il valore vecchio.
6. **Verifica** con i comandi del progetto e dice che cosa non ha potuto verificare.
7. **Pubblica** una richiesta di unione, se la sessione lo permette, con la tabella voce per voce e le prove.
8. **Chiude il giro sul rapporto**, secondo la riga «Rapporto»: spunta nella issue le voci fatte, scrive un commento di esito e la fa chiudere all'unione della PR (`aggiorna`); oppure ti mostra il testo e aspetta il sì (`proponi`); oppure non la tocca (`non toccare`).
9. **Scrive i rinvii** nel posto che il progetto indica, con la condizione che riapre ogni voce, e toglie quelli che la PR chiude. Le voci già rinviate non le riprende, finché la loro condizione non scatta.
10. **Ti consegna** i passi da fare a mano, uno per azione, con comando e controllo; le voci sbagliate con la prova; le migliorie per chi ha scritto il rapporto e il comando per applicarle. Chiude con il resoconto nella forma del plugin [`recap`](../recap/README.md), se è installato.

## Con orchestra

Se è installato anche il plugin `orchestra`, `audit-fix` ne segue le regole: `orchestra:implementer` per le modifiche al codice oltre la configurazione, `orchestra:verifier` per lint, tipi e test, `orchestra:reviewer` quando si toccano sicurezza o CI, e una riga per delega nel registro. Senza `orchestra` fa tutto la sessione principale.

## Che cosa mette il progetto

Una sezione `## Audit fix` nel `CLAUDE.md` (titolo in inglese, perché la skill lo cerca così; contenuto nella lingua del progetto):

```markdown
## Audit fix

- Rapporti: <dove stanno: etichetta delle issue, titolo, oppure un percorso>
- Generatore: <chi scrive il rapporto, dove stanno i suoi file, come si applica una modifica>
- Inventario: <file e comando che lo rigenera; dove può girare (solo sul PC?)>
- Ramo e base: <nome del ramo; ramo di destinazione della richiesta>
- Fuori portata: <ciò che l'agente non tocca: strumenti del PC, pannelli, segreti, migrazioni remote…>
- Documenti da riallineare: <documenti che citano versioni, modelli, prezzi>
- Rinvii: <file e sezione dove stanno le voci rimandate e le decisioni da non riproporre, con la condizione che le riapre>
- Rapporto: <aggiorna | proponi | non toccare> (se manca vale `proponi`)
```

## Per chi scrive i rapporti

[references/report-format.md](skills/audit-fix/references/report-format.md) descrive il formato che rende la lettura esatta: voci con casella, identificativo stabile e chi agisce, tabella di copertura ripiegata, blocco `json` finale. In fondo ci sono le regole da mettere nelle istruzioni del generatore, nate dagli errori visti.

## Script

In `skills/audit-fix/scripts/`, solo libreria standard di Python e git:

| Script | A che cosa serve |
|---|---|
| `advisory-check.py <GHSA> <pacchetto> [versione]` | dice se una versione corregge davvero un avviso: un intervallo che finisce con `<=` non nomina una correzione |
| `npm-diff.sh <pacchetto> <vecchia> <nuova> [file]` | confronta due versioni pubblicate partendo dai tarball del registro |
| `action-refs.sh <owner/repo> [ref…]` | commit, tag e `runs.using` di una GitHub Action, e se il tag maggiore è rimasto indietro |

## Limiti

- Non tocca il PC, i pannelli dei fornitori, i segreti, gli ambienti remoti: li mette fra i tuoi passi.
- Una modifica ai flussi di CI si verifica solo quando la CI gira: lo dice.
- Funziona con qualunque rapporto in Markdown, ma con il blocco `json` sbaglia meno.
- Costo: circa 2.200 token a ogni avvio della skill, 560 per ogni `claim-verifier`, più il lavoro.

## Modificare il plugin

- Ogni modifica porta un aumento di `version` in `.claude-plugin/plugin.json` **e** nella voce del `marketplace.json`, altrimenti chi lo ha già non la riceve.
- Prima del commit: `claude plugin validate --strict .` dalla radice del marketplace e `claude plugin validate --strict plugins/audit-fix`.
- Per provarlo senza pubblicarlo: `claude --plugin-dir plugins/audit-fix`.
