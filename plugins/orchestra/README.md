# orchestra

Skill e agenti di Claude Code per lavorare con una sessione principale che pianifica, delega e revisiona, mentre la lettura, la scrittura e l'esecuzione le fanno i subagent. I file letti dal modello sono in inglese (costano meno token); questa guida è in italiano.

| File | Ruolo | Modello |
|---|---|---|
| `skills/orchestra/SKILL.md` | regole della sessione principale, si avvia con `/orchestra:orchestra <task>`; i dettagli sono in `references/` (brief e premise, revisione e giri, registro, sezioni del progetto) | quello della sessione |
| `agents/explore.md` | trova e descrive il codice, non giudica; nella mappa di un'area elenca anche le closed list e i test | Haiku |
| `agents/implementer.md` | prima conferma o smentisce le premise del brief, poi scrive il codice; rapporto in file con lo stato in testa (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, `BLOCKED`); ha lo strumento `Skill` | Opus, effort medio |
| `agents/implementer-high.md` | copia di `implementer` con effort alto, primo gradino quando l'effort medio si blocca | Opus, effort alto |
| `agents/implementer-xhigh.md` | copia di `implementer` con effort xhigh, secondo gradino se si blocca anche l'effort alto | Opus, effort xhigh |
| `agents/verifier.md` | il controllo mirato del progetto, se lo dichiara, altrimenti lint, tipi, test; tre esiti: OK, FALLITO, NON ESEGUIBILE | Haiku |
| `agents/reviewer.md` | revisione in sola lettura in cerca di difetti veri; prima legge le regole di `.claude/rules/` delle aree del diff; grado di certezza per finding; due verdetti, aderenza al plan e qualità | Fable (Opus senza Fable) |

`implementer-high` e `implementer-xhigh` esistono perché l'effort non si può cambiare all'invocazione. Criteri, dalle indicazioni di Anthropic: effort medio per il lavoro quotidiano ben delimitato; ogni brief dà all'agente il modo di controllare il proprio lavoro; quando l'effort medio si blocca si sale ad alto, e la sessione principale lo cambia fra un compito e l'altro, perché il cambio può costare una scrittura della cache; ricerche e lettura dei log su Sonnet o Haiku, modifiche al codice su Opus.

Il messaggio finale segue la forma del plugin [`recap`](../recap/README.md), se è installato; senza, è un riassunto di tre righe: che cosa devi fare o decidere, che cosa resta non verificato, che cosa è stato fatto.

## Installazione

Dal marketplace `lorenzo-plugins`; per proporlo nei progetti e per le sessioni cloud vedi il [README del marketplace](../../README.md#installare).

```bash
claude plugin marketplace add <utente>/<repository>
claude plugin install orchestra@lorenzo-plugins
```

Poi si apre una sessione nuova. Per controllare che funzioni: `/orchestra:orchestra` compare fra i comandi, e `/agents` elenca `orchestra:explore`, `orchestra:implementer`, `orchestra:implementer-high`, `orchestra:implementer-xhigh`, `orchestra:verifier`, `orchestra:reviewer`.

### Aggiornare e disinstallare

Gli aggiornamenti arrivano da soli all'avvio quando cambia `version` in `.claude-plugin/plugin.json`. Per prenderli subito:

```bash
claude plugin marketplace update lorenzo-plugins
claude plugin update orchestra@lorenzo-plugins
```

Per disinstallare:

```bash
claude plugin uninstall orchestra@lorenzo-plugins
```

### Come copia, senza plugin

Copiare `skills/orchestra/` in `~/.claude/skills/` e i file di `agents/` in `~/.claude/agents/`, oppure collegarli file per file. I nomi restano senza prefisso (`/orchestra`, `implementer`…), ma gli aggiornamenti si prendono a mano. Non installare insieme copia e plugin: ci sarebbero due skill e due serie di agenti.

## Che cosa mette il progetto

Nessun file del pacchetto nomina comandi o percorsi di un progetto. Il progetto li dichiara nel suo `CLAUDE.md`, in tre sezioni dal nome fisso (i titoli restano in inglese perché gli agenti li cercano così; il contenuto può essere in italiano):

```markdown
## Verification commands

Giro completo, in quest'ordine (un passo che il progetto non ha si scrive «nessuno»):
    Lint:              <comando> | nessuno
    Controllo dei tipi: <comando> | nessuno
    Build:             <comando> | nessuno
    Test:              <comando> | nessuno

Comandi mirati: <un test, un pacchetto…>
Vietati al verifier: <reset del database, deploy…>
Targeted check: <un comando che controlla solo ciò che il cambio richiede> (facoltativo)

## Generated folders

<cartelle generate o di terze parti da non leggere>

## Orchestration

- Registro: `.claude/orchestra/log.md`
- Avvio dell'app: <comando per avviarla in locale, se serve provarla a schermo>
- Risorse condivise e regole: <database locale, emulatori, ambienti remoti…>
- Comandi distruttivi da non lanciare mai: <reset, drop, deploy…>
- Regole in più per il brief: <per esempio il confronto con i mockup>
- Work folder: <cartella di brief e rapporti> (facoltativo)
- Brief template: <modello del brief del progetto> (facoltativo)
- Premise check: <comando che controlla le premise di un brief> (facoltativo)
- Decisions: <file e sezione dove si scrivono le decisioni> (facoltativo)
```

Le righe facoltative hanno la chiave in inglese, perché gli agenti la cercano così. Senza di esse il plugin funziona come prima: il `verifier` fa il giro completo, brief e rapporti vanno nello scratchpad della sessione, il brief segue il modello di `references/brief.md`, le decisioni finiscono nel riassunto finale. Il significato di ogni riga è in `skills/orchestra/references/project-sections.md`.

`verifier` ed `explore` non caricano `CLAUDE.md` (per risparmiare token) e leggono solo la loro sezione. Gli altri agenti lo hanno per intero.

**Se manca qualcosa, l'utente viene avvisato.** All'avvio `/orchestra:orchestra` controlla le tre sezioni. Per ogni sezione o passo mancante dice che cosa manca e che cosa non funziona senza (per esempio, senza comandi di verifica il `verifier` si ferma e niente viene verificato). Propone anche il testo, ricavato dai file del progetto (`package.json`, `.sln`, pipeline di CI, README), e lo aggiunge solo dopo un sì. Se l'utente rifiuta, il lavoro va avanti e il riassunto finale dice «non verificato: manca il comando». Allo stesso modo il `verifier` risponde `SETUP MISSING` quando non trova la sua sezione, ed `explore` segnala le cartelle che sembrano generate e non sono elencate.

Il registro delle deleghe è del progetto, non del pacchetto: la skill lo crea al primo uso. Quando una causa si ripete tre volte, la skill propone di correggere la sezione `## Orchestration`; una correzione utile a tutti i progetti si propone invece qui, nel marketplace, con una pull request.

Un progetto che vuole un agente diverso lo scrive in `.claude/agents/` con un nome suo e dice in `## Orchestration` quando usarlo al posto di quello del plugin: gli agenti del plugin hanno il prefisso `orchestra:`, quindi un agente di progetto con lo stesso nome non li sostituisce.

## Modificare il plugin

- Ogni modifica ai file va accompagnata da un aumento di `version` in `.claude-plugin/plugin.json`, altrimenti chi ha già il plugin non la riceve.
- `implementer.md`, `implementer-high.md` e `implementer-xhigh.md` hanno lo stesso corpo: quando se ne cambia uno si cambiano anche gli altri.
- La `version` di `.claude-plugin/plugin.json` e quella della voce `orchestra` nel `marketplace.json` alla radice devono coincidere.
- Prima del commit, dalla radice del marketplace: `claude plugin validate --strict .` e `claude plugin validate --strict plugins/orchestra`.
- Per provare le modifiche senza pubblicarle: `claude --plugin-dir plugins/orchestra`.
