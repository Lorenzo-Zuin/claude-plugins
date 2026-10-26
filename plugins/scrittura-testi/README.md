# scrittura-testi

Plugin di Claude Code con le regole per scrivere e rivedere testi in italiano destinati a una persona: documenti di analisi, documenti per il cliente, ADR, note, commit, messaggi dell'interfaccia, rendiconti, email. La skill è in italiano perché riguarda testi in italiano.

## Che cosa contiene

| Sezione | Che cosa stabilisce |
|---|---|
| Prima di scrivere | chi legge (interno o esterno), che cosa deve decidere o fare, che cosa è misurato e che cosa no |
| Forma | frasi corte, forma impersonale, niente forma riflessiva con il sistema come soggetto sottinteso, numeri e nomi veri al posto degli aggettivi, un'informazione in un posto solo |
| Parole | niente parole inventate né termini inglesi italianizzati; l'elenco delle parole da evitare con l'alternativa |
| Rivedere un testo | riscrivere invece di aggiungere, cambiare solo ciò che è stato criticato, sostituire ovunque una parola rifiutata |
| Documenti versionati | una versione nuova è un file nuovo; la precedente va nella cartella delle versioni vecchie |
| Rendiconto di un lavoro | prima ciò che non è fatto, poi ciò che tocca all'utente, poi in una riga ciò che è fatto |

## Quando si usa

- **Da sola.** Claude la carica quando il lavoro produce o modifica un testo per una persona, e prima di riscrivere un testo criticato.
- **A mano.** `/scrittura-testi:scrittura-testi`.

## Installazione

Dal marketplace `lorenzo-plugins`; per proporlo nei progetti e per le sessioni cloud vedi il [README del marketplace](../../README.md#installare).

```bash
claude plugin marketplace add <utente>/<repository>
claude plugin install scrittura-testi@lorenzo-plugins
```

Poi si apre una sessione nuova. Per controllare che funzioni: `claude plugin list` elenca `scrittura-testi@lorenzo-plugins`.

Chi ha già la skill come copia in `~/.claude/skills/scrittura-testi/` la toglie dopo l'installazione: con due copie, Claude vede due skill con la stessa descrizione.

## Modificare il plugin

- Ogni modifica richiede un aumento di `version` sia in `.claude-plugin/plugin.json` sia nella voce `scrittura-testi` del `marketplace.json` alla radice: devono coincidere.
- Prima del commit, dalla radice del marketplace: `claude plugin validate --strict .` e `claude plugin validate --strict plugins/scrittura-testi`.
- Per provarlo senza pubblicarlo: `claude --plugin-dir plugins/scrittura-testi`.
- Questo README e `SKILL.md` seguono le stesse regole: quando cambia una regola, la tabella si riallinea.
