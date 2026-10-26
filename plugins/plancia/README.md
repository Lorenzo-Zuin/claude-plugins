# plancia

Pannello laterale e banda sopra il prompt per Claude Code. Mostra consumo e limiti, lo stato delle sessioni aperte sul PC, il diario del lavoro tra sessioni, i todo per progetto e i prompt riusabili. Vale per qualunque progetto.

È una mod: un modulo di hook TypeScript (`hooks/register.tsx`) che il motore di Claude Code carica. L'API delle mod è in early access e può cambiare tra una versione e l'altra. La mod è scritta e provata con Claude Code 2.1.308.

## Che cosa mostra

| Dove | Contenuto |
|---|---|
| Banda sopra il prompt | progetto e ramo, contesto, finestra di 5 ore con l'ora prevista di esaurimento, tempo di lavoro della sessione, costo, sessioni che aspettano una risposta o hanno finito, todo aperti |
| Scheda Cruscotto | anelli di contesto, 5 ore e 7 giorni; costo, chiamate ai tool e turni; durata dei turni; file modificati |
| Scheda Sessioni | le sessioni del PC con la Plancia attiva: stato (al lavoro, serve te, forse serve te, finito, in attesa, non risponde), ultima richiesta o ultimo riassunto, tempo di lavoro, costo, contesto; ogni card ha il titolo che l'app dà alla sessione, il bottone «Apri» per portarla in primo piano e «✕» per toglierla (ricompare quando cambia stato); le sessioni inattive da 30 minuti o ferme da 2 ore spariscono da sole |
| Scheda Attività | todo del progetto, idee per dopo, prompt riusabili; il pulsante «Riprendi con Claude» scrive nel prompt todo e ultime attività |
| Scheda Diario | una riga per turno riassunta da Haiku, tempo dei turni per progetto oggi e negli ultimi 7 giorni, copia del riepilogo di oggi |
| Scheda Regole | le regole attive e gli interventi della sessione |

«Serve te» indica una domanda di Claude, un piano da approvare o una richiesta di permesso segnalata dal motore. «Forse serve te» indica un tool fermo da più di 20 secondi: di solito è una richiesta di permesso, a volte solo un comando lento. Dove un plugin di policy intercetta le richieste di permesso resta solo questo secondo segnale.

Sul desktop le schede usano card colorate e grafici SVG; nel terminale gli stessi dati sono testo colorato e barre di caratteri.

## Comandi

| Comando | Effetto |
|---|---|
| `/plancia [scheda]` | apre il pannello, eventualmente su una scheda |
| `/todo [testo]` | aggiunge un todo al progetto, o elenca quelli aperti |
| `/idea <testo>` | salva un'idea valida per tutti i progetti |
| `/oggi`, `/settimana` | riepilogo del lavoro per progetto |
| `/snippet [nome testo]` | salva un prompt riusabile, o li elenca; nel prompt `;nome` lo propone |
| `/riprendi` | scrive nel prompt todo aperti e ultime attività del progetto |
| `/banda` | mostra o nasconde la banda |

Claude può leggere e aggiornare i todo con il tool `mcp__plancia__todo`.

## Regole

- Un prompt che contiene una chiave privata, un token o una stringa di connessione con password non viene inviato.
- Un `@file` di credenziali (`.env`, `.pem`, `.key`, `id_rsa` e simili) non viene letto.
- I comandi rischiosi (`rm -rf`, `git push --force`, `git reset --hard`, `DROP`, `az`, Active Directory, `terraform`, `kubectl`, firewall, pubblicazione di pacchetti) chiedono conferma in ogni modalità dei permessi.

Un plugin di policy installato dall'organizzazione ha la precedenza e può intercettare questi eventi prima della Plancia. La scheda Regole indica quali regole non arrivano alla Plancia nella sessione corrente.

## Dati

Tutto resta sul PC:

- todo, idee, prompt riusabili e diario nello store del plugin di Claude Code (il diario tiene 45 giorni);
- lo stato di ogni sessione in `~/.claude/plancia/sessions/<id>.json`, letto dalle altre sessioni ogni 20 secondi;
- il titolo della sessione si legge dalla sua trascrizione in `~/.claude/projects/`;
- le sessioni tolte a mano in `~/.claude/plancia/dismissed.json`, comune a tutte le sessioni.

Il diario contiene i riassunti dei turni: può contenere nomi di progetti e di clienti. I riassunti si generano con Haiku attraverso il client della sessione; il testo inviato è ripulito dai formati di segreti noti.

## Installare

```bash
claude plugin marketplace add Lorenzo-Zuin/claude-plugins
claude plugin install plancia@lorenzo-plugins
```

Poi si apre una sessione nuova. La banda compare sopra il prompt. Il pannello si apre da solo quando il terminale è largo almeno 144 colonne; più stretto, si apre al primo prompt della sessione. Si riapre con `/plancia` o con il pulsante «Plancia» della banda.

## Sviluppo

```bash
claude plugin validate plugins/plancia
claude plugin test plugins/plancia
```

I tipi dell'API li scrive il motore in `.claude-plugin/types/` quando carica la mod da una cartella in sviluppo (`claude --plugin-dir plugins/plancia`); dopo il primo caricamento `npx tsc -p plugins/plancia` controlla i tipi.
