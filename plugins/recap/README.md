# recap

Plugin di Claude Code che dà una forma fissa al messaggio con cui Claude chiude un lavoro: il resoconto di fine sessione, la richiesta di un sì a metà lavoro, il passaggio di consegne. I file letti dal modello sono in inglese (costano meno token); questa guida è in italiano.

## Perché

Il resoconto si legge una volta, spesso dal telefono, ore dopo. Una lettura deve rispondere a tre domande: **è finito, che cosa non va, che cosa devo fare**. Ciò che è stato fatto conta meno di tutto: lo dicono già il diff e la PR.

I resoconti senza regole hanno sempre gli stessi difetti: non si capisce se il lavoro è finito; ciò che manca è nascosto in fondo o dentro un paragrafo; le domande sono sparse nel testo; ci sono nomi interni senza spiegazione; mancano i comandi, oppure non dicono in quale cartella e con quale shell si lanciano; c'è una proposta di sessione nuova, ma manca il prompt per avviarla. Gli esempi, nella forma giusta, sono in [references/examples.md](skills/recap/references/examples.md).

## Che cosa fa

Il messaggio finale ha sempre la stessa forma, in quest'ordine: prima ciò che non va, poi i tuoi passi, il fatto in una riga. Le sezioni vuote non si scrivono.

| Sezione | Che cosa contiene |
|---|---|
| Titolo | lo stato: ✅ Finito, ⏸️ Da continuare, ❓ Aspetto una tua risposta, ⛔ Bloccato; sotto, l'unica frase che devi sapere |
| **❌ Non fatto** | ciò che hai chiesto e non è fatto, o è fatto in un altro modo: perché, e chi lo fa (tu, una sessione nuova, dopo il merge). Ciò che non è verificato e decide il risultato sta qui, non in Fatto |
| **⚠️ Attenzione** | solo ciò che cambia quello che fai: un difetto trovato, un dubbio («Non sicuro: …»), un costo, una scelta di Claude e come annullarla |
| **👉 Tocca a te** | caselle, una per azione, nell'ordine in cui le fai: dove (PC e shell, browser, telefono), il comando pronto da incollare, la riga ✔ con ciò che vedi se è andata bene. Denaro, minuti a pagamento e produzione sono scritti nella stessa riga |
| **❓ Rispondi** | al massimo 3 domande chiuse, con codici di risposta (`1A`, `1B`) e la scelta consigliata per prima. Ogni decisione lasciata a te sta qui e in nessun altro posto |
| **✅ Fatto** | una riga, con il link alla PR o al commit. Mai un elenco di modifiche, file o conteggi di test |
| **📋 Prompt per la prossima sessione** | obbligatorio con ⏸️ e ⛔, e per un lavoro a lato trovato e non fatto: il prompt per una sessione che non sa nulla di questa, in un blocco da copiare con un tocco |

Limiti: tutto il messaggio, senza il prompt, sta in 30 righe; una sezione ha al massimo 5 voci; una voce al massimo 15 parole, poi una freccia `→` con la conseguenza. Niente paragrafi: l'unica frase libera è quella sotto il titolo.

Prima di scrivere, Claude fa da sé ciò che può ancora fare e confronta il risultato con la richiesta, voce per voce. Ti passa solo ciò che vuole te: il PC, un pannello web, un segreto, denaro, un dispositivo, una decisione, un merge. I comandi vengono dai file del progetto o da ciò che Claude ha lanciato nella sessione, mai a memoria. Le tue regole valgono sempre: lingua, termini, `;` al posto di `&&`.

## Quando si usa

- **Da sola.** La descrizione della skill è sempre nel contesto, e un hook `SessionStart` la ricorda a ogni avvio, dopo `/clear` e dopo la compattazione del contesto.
- **A mano.** `/recap:recap` chiede subito il resoconto; `/recap:recap <tema>` lo concentra su una parte.

Le skill `orchestra` e `audit-fix` usano questa forma per il messaggio finale, se il plugin è installato.

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
- Nelle sessioni cloud il plugin arriva dalla copia caricata in claude.ai. L'hook lì gira: una sessione cloud riavviata ha mostrato il suo promemoria. A ogni versione nuova la copia va caricata di nuovo (README del marketplace, «Modificare e pubblicare»).

## Modificare il plugin

- Ogni modifica porta un aumento di `version` sia in `.claude-plugin/plugin.json` sia nella voce `recap` del `marketplace.json` alla radice: devono coincidere.
- Prima del commit, dalla radice del marketplace: `claude plugin validate --strict .` e `claude plugin validate --strict plugins/recap`.
- Per provarlo senza pubblicarlo: `claude --plugin-dir plugins/recap`.
- Gli esempi di `references/examples.md` e la tabella di questo README devono seguire le regole di `SKILL.md`: quando cambia una regola, si riallineano.
