# recap

Plugin di Claude Code che dà una forma fissa al messaggio con cui Claude chiude un lavoro: il resoconto di fine sessione, la richiesta di una risposta a metà lavoro, il passaggio di consegne. I file letti dal modello sono in inglese (richiedono meno token); questa guida è in italiano.

## Perché

Il resoconto si legge una volta, spesso dal telefono, ore dopo. Una lettura deve dire subito quattro cose: **che cosa devo decidere, che cosa devo fare, che cosa manca, di che cosa devo solo prendere atto**. Ciò che è stato fatto conta meno di tutto: lo dicono già il diff e la PR.

Senza regole precise i resoconti hanno sempre gli stessi difetti. La stessa informazione compare in più sezioni. Azioni, decisioni, cose non fatte, spiegazioni e risultati di analisi finiscono in un contenitore unico, e non si capisce che cosa è da fare e che cosa è solo da sapere. La domanda sta solo nel riquadro dell'app desktop, oppure il titolo dice «Finito» e il riquadro fa una domanda. Per questo ogni voce sta in una sola sezione, scelta con un criterio. Il prompt per una sessione nuova si scrive solo su richiesta: in 255 resoconti di 12 progetti compare 10 volte, e nessuno lo usa. Gli esempi sono in [references/examples.md](skills/recap/references/examples.md).

## Che cosa fa

Il messaggio finale ha sempre le stesse sezioni, in quest'ordine. Ogni voce va nella prima sezione adatta e in nessun'altra. Una voce che non si adatta a nessuna sezione non si scrive. Le sezioni vuote non si scrivono.

| Sezione | Che cosa contiene | Criterio |
|---|---|---|
| Titolo | lo stato: ❓ Aspetto una tua risposta, ⛔ Bloccato, ⏸️ Da continuare, ✅ Finito | — |
| **❓ Decidi** | al massimo 3 domande chiuse, con codici di risposta (`1A`, `1B`) e la scelta consigliata per prima: scelte, approvazioni di una spesa, offerte («seguo io la PR?») | rispondi nella chat |
| **👉 Tocca a te** | caselle, una per azione, nell'ordine in cui le fai: dove (PC e shell, browser, telefono), il comando pronto da incollare, la riga ✔ con ciò che vedi se è andata bene. Denaro, minuti a pagamento e produzione sono scritti nella stessa riga | fai qualcosa fuori dalla chat |
| **⏳ Manca** | ciò che non è fatto o non è verificato e non tocca a te: il perché in poche parole, chi lo fa e quando (una sessione nuova, Claude dopo la tua risposta, la CI dopo il merge). Anche i difetti trovati e non corretti e i dubbi («Non sicuro: …») | qualcun altro deve ancora agire |
| **ℹ️ Da sapere** | ciò che cambia per te senza che tu faccia niente: un cambio che vedrai, una scelta di Claude o una richiesta fatta in un altro modo con il modo di annullarla, un rischio che oggi nessuno può verificare | prendi solo atto |
| `✅ Fatto: …` | una riga, senza titolo di sezione, con il link alla PR o al commit | — |

Claude non scrive come funziona il sistema oggi, gli elenchi di modifiche, i conteggi dei test, i tentativi, né rimandi da una voce all'altra («vedi domanda 1»). Un passo che dipende da una risposta arriva dopo la risposta.

Lo stato dipende dalle sezioni. Se valgono più stati, vale il primo dell'elenco:
- **❓ Aspetto una tua risposta**: la sessione aspetta un tuo messaggio, cioè una risposta a Decidi oppure «fatto» dopo i tuoi passi;
- **⛔ Bloccato**: il lavoro aspetta un cambio esterno che un messaggio non risolve, per esempio l'approvazione di un amministratore;
- **⏸️ Da continuare**: in Manca c'è ancora qualcosa;
- **✅ Finito**: Decidi e Manca sono vuote. In Tocca a te possono restare passi, per esempio il merge.

Limiti: il resoconto sta in 30 righe; una sezione ha al massimo 5 voci; una voce al massimo 15 parole, poi una freccia `→`. Niente paragrafi.

Prima di scrivere, Claude fa da sé ciò che può ancora fare e confronta il risultato con la richiesta, voce per voce. Ti passa solo ciò che non può fare da sé: il PC, un pannello web, un segreto, denaro, un dispositivo, una decisione, un merge. I comandi vengono dai file del progetto o da ciò che Claude ha lanciato nella sessione, mai a memoria. Le tue regole valgono sempre: lingua, termini, `;` al posto di `&&`.

### Dopo un'analisi o una spiegazione

Se il lavoro del turno è una risposta (un'analisi, una spiegazione, una revisione, un confronto), il messaggio comincia con la risposta, nella forma che le serve e senza titolo di stato. Dopo una riga `---` vengono il titolo di stato e le sezioni Decidi, Tocca a te e Manca, solo se contengono qualcosa. La riga Fatto non c'è, perché il lavoro fatto è la risposta. Se non resta niente, il messaggio è solo la risposta.

### Il riquadro finale dell'app desktop

Nell'app desktop, sotto il messaggio, compare un riquadro (lo strumento `mcp__ccd_turn__wrap_up`) con quattro campi. Il riquadro non ripete il messaggio e dice lo stesso stato del titolo:
- `recap` contiene la riga Fatto, che quindi nel messaggio non c'è; dopo un'analisi, la conclusione in una frase;
- `ask` c'è solo con ❓ e rimanda alla domanda, con la scelta consigliata: «Rispondi alla 1: consiglio 1A». Le domande restano nel messaggio, in Decidi, così le leggi anche dove il riquadro non compare;
- `actions` contiene i pulsanti: uno per scelta con una domanda sola, uno con tutte le scelte consigliate con più domande, «Fatto, prosegui» quando Claude aspetta i tuoi passi;
- `blocked` vale `true` con ❓ e ⛔.

### Il prompt per una sessione nuova

Claude lo scrive solo se lo chiedi: `/recap:recap prompt` oppure «dammi il prompt». Il prompt è pensato per una sessione che non sa nulla di quella attuale, in un blocco da copiare con un tocco. Le regole sono in [references/prompt.md](skills/recap/references/prompt.md).

## Quando si usa

- **Da sola.** La descrizione della skill è sempre nel contesto, e un hook `SessionStart` la ricorda a ogni avvio, dopo `/clear` e dopo la compattazione del contesto.
- **A mano.** `/recap:recap` chiede subito il resoconto; `/recap:recap <tema>` lo concentra su una parte; `/recap:recap prompt` aggiunge il prompt per una sessione nuova.

Le skill `orchestra`, `audit-fix` e `flow` usano questa forma per il messaggio finale, se il plugin è installato.

## Installazione

Dal marketplace `lorenzo-plugins`. Per proporlo nei progetti e per le sessioni cloud, vedi il [README del marketplace](../../README.md#installare).

```bash
claude plugin marketplace add <utente>/<repository>
claude plugin install recap@lorenzo-plugins
```

Poi si apre una sessione nuova. Per controllare che funzioni: `/recap:recap` compare fra i comandi, e `claude plugin list` elenca `recap@lorenzo-plugins`.

Senza plugin, come copia: si copia `skills/recap/` in `~/.claude/skills/`. Il nome diventa `/recap` e manca l'hook; per averlo lo stesso, si aggiunge una riga al `CLAUDE.md`: «Il messaggio finale di ogni lavoro segue la skill `recap`».

## Limiti

- Claude Code ha un comando suo che si chiama `/recap` («Generate a one-line session recap now»): nel menu dei comandi compare per primo e non c'entra con questo plugin. Il comando del plugin è `/recap:recap`, con il prefisso. L'hook e le altre skill usano il nome intero, quindi il modello non li confonde.
- Una skill non è un obbligo: Claude la carica quando la riconosce. L'hook rende la cosa molto più probabile, non certa. Se un resoconto esce senza questa forma, basta scrivere `/recap:recap`.
- L'hook stampa una riga di testo con `echo`. Sotto Linux è provato. Su Windows, con Git Bash e con PowerShell, `echo` dovrebbe funzionare, ma non è provato.
- I campi del riquadro dell'app desktop sono ricavati da 40 riquadri veri, non da una documentazione. Il significato esatto di `blocked` non è documentato.
- Nelle sessioni cloud il plugin arriva dalla copia caricata in claude.ai. L'hook lì gira: una sessione cloud riavviata ha mostrato il suo promemoria. A ogni versione nuova la copia va caricata di nuovo (README del marketplace, «Modificare e pubblicare»).

## Modificare il plugin

- Ogni modifica porta un aumento di `version` sia in `.claude-plugin/plugin.json` sia nella voce `recap` del `marketplace.json` alla radice: devono coincidere.
- Prima del commit, dalla radice del marketplace: `claude plugin validate --strict .` e `claude plugin validate --strict plugins/recap`.
- Per provarlo senza pubblicarlo: `claude --plugin-dir plugins/recap`.
- Gli esempi di `references/examples.md` e la tabella di questo README seguono le regole di `SKILL.md`: chi cambia una regola aggiorna anche esempi e tabella.
