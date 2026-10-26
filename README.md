# Plugin di Claude Code

Marketplace di plugin di Claude Code: un repository GitHub che Claude Code legge per installare plugin. Contiene `audit-fix`, `flow`, `orchestra`, `plancia`, `recap` e `scrittura-testi`.

| Plugin | Che cosa fa | Comando |
|---|---|---|
| [audit-fix](plugins/audit-fix/README.md) | lavora un rapporto di audit automatico (versioni, sicurezza, fornitori): verifica alla fonte, corregge nel repository, consegna i passi a mano e le migliorie per chi ha scritto il rapporto | `/audit-fix:audit-fix <issue>` |
| [flow](plugins/flow/README.md) | il development flow una phase alla volta: la phase dopo o la prossima issue autorizzata, triage (P0), spec con completeness matrix (P1), technical plan con premise controllate (P2), mockup giudicati dall'agente `ux-critic` (P3), QA automatico (P5), prove sul dispositivo con l'agente `device-tester` e il bench lock (P5), handoff con la PR (P6) | `/flow:next`, `/flow:work`, `/flow:spec`, `/flow:plan`, `/flow:mockup`, `/flow:qa`, `/flow:bench`, `/flow:handoff` |
| [orchestra](plugins/orchestra/README.md) | la sessione principale pianifica, delega ai subagent e rivede; registro delle deleghe per progetto | `/orchestra:orchestra <compito>` |
| [plancia](plugins/plancia/README.md) | pannello e banda: consumo e limiti, sessioni attive con il loro stato, diario tra sessioni, todo e prompt riusabili, conferme sui comandi rischiosi | `/plancia`, `/todo`, `/oggi`, `/riprendi` |
| [recap](plugins/recap/README.md) | dà una forma fissa al messaggio finale di ogni lavoro: stato, ciò che non è fatto, avvertenze, i tuoi passi con i comandi, le domande con le risposte pronte, il fatto in una riga, il prompt per continuare | da sola, oppure `/recap:recap` |
| [scrittura-testi](plugins/scrittura-testi/README.md) | le regole per scrivere e rivedere testi in italiano destinati a una persona: chi legge, forma, parole da evitare, revisione, documenti versionati, rendiconti | da sola, oppure `/scrittura-testi:scrittura-testi` |

## Struttura

```
.claude-plugin/marketplace.json     l'elenco dei plugin del marketplace
plugins/
  audit-fix/
    .claude-plugin/plugin.json      nome, versione, descrizione
    skills/audit-fix/SKILL.md       la procedura, con references/ e scripts/
    agents/claim-verifier.md        il subagent che verifica le voci in parallelo
    README.md
  flow/
    .claude-plugin/plugin.json
    skills/                         next, work, spec, plan, mockup, qa, handoff, ognuna con references/
    agents/ux-critic.md             il critic in sola lettura di mockup e catture
    references/                     regole, lane, sezioni del progetto e rubric UX comuni alle skill
    README.md
  orchestra/
    .claude-plugin/plugin.json
    skills/orchestra/SKILL.md       le regole della sessione principale
    agents/                         explore, implementer (tre livelli), verifier, reviewer
    README.md
  plancia/
    .claude-plugin/plugin.json
    hooks/                          il modulo di hook della mod (register.tsx), con i test
    types/index.d.ts                il contratto dello stato della mod
    README.md
  recap/
    .claude-plugin/plugin.json
    skills/recap/SKILL.md           la forma del messaggio finale, con references/examples.md
    hooks/hooks.json                la ricorda a ogni avvio della sessione
    README.md
  scrittura-testi/
    .claude-plugin/plugin.json
    skills/scrittura-testi/SKILL.md le regole di scrittura
    README.md
```

## Installare

### Sul PC, da terminale

Il repository può essere privato: Claude Code usa le credenziali git già salvate (per HTTPS basta `gh auth login`).

```bash
claude plugin marketplace add <utente>/<repository>
claude plugin install audit-fix@lorenzo-plugins
claude plugin install flow@lorenzo-plugins
claude plugin install orchestra@lorenzo-plugins
claude plugin install plancia@lorenzo-plugins
claude plugin install recap@lorenzo-plugins
claude plugin install scrittura-testi@lorenzo-plugins
```

Poi si apre una sessione nuova. `lorenzo-plugins` è il `name` in `.claude-plugin/marketplace.json`.

### Proposto a chi apre un progetto

Nel `.claude/settings.json` del progetto:

```json
{
  "extraKnownMarketplaces": {
    "lorenzo-plugins": { "source": { "source": "github", "repo": "<utente>/<repository>" } }
  },
  "enabledPlugins": {
    "audit-fix@lorenzo-plugins": true,
    "flow@lorenzo-plugins": true,
    "orchestra@lorenzo-plugins": true,
    "plancia@lorenzo-plugins": true,
    "recap@lorenzo-plugins": true,
    "scrittura-testi@lorenzo-plugins": true
  }
}
```

Vale solo in una cartella segnata come fidata. Lo stesso risultato si ottiene con `claude plugin marketplace add <utente>/<repository> --scope project`, e poi il commit del `.claude/settings.json` che scrive.

### Nelle sessioni cloud (claude.ai/code)

Una sessione cloud **non** installa i plugin che il `.claude/settings.json` del repository accende, né quelli installati sul PC. Due strade:

- caricare il plugin fra i propri plugin di claude.ai («My Uploads»);
- per un'organizzazione, le impostazioni gestite dal server (Organization settings > Claude Code > Managed settings, ruolo Owner).

La copia di «My Uploads» non segue il marketplace: arriva nelle sessioni cloud come `<plugin>@synced` e resta alla versione caricata. A ogni versione nuova va caricata di nuovo (sezione «Modificare e pubblicare»). Sul PC, il plugin installato dal marketplace ha la precedenza sulla copia con lo stesso nome: `claude plugin list` lo segnala con un avviso, ed è normale.

## Aggiungere un plugin

Una skill entra in un marketplace solo dentro un plugin:

1. Crea `plugins/<nome>/.claude-plugin/plugin.json` con `name`, `description`, `version`, `author`.
2. Metti ogni skill in `plugins/<nome>/skills/<skill>/SKILL.md`, con i suoi file accanto.
3. Aggiungi la voce in `.claude-plugin/marketplace.json`.
4. Una skill scritta da altri si copia solo se la sua licenza lo permette, e con la licenza accanto.

## Modificare e pubblicare

- Ogni modifica a un plugin porta un aumento di `version` **sia** in `plugins/<nome>/.claude-plugin/plugin.json` **sia** nella sua voce di `marketplace.json`: devono coincidere, e senza aumento chi ha già il plugin non riceve la modifica.
- Prima del commit:
  ```bash
  claude plugin validate --strict .
  claude plugin validate --strict plugins/audit-fix
  ```
- Per provare un plugin senza pubblicarlo: `claude --plugin-dir plugins/audit-fix`.
- Per segnare una versione: `claude plugin tag plugins/audit-fix --push` crea il tag `audit-fix--v1.0.0` (vuole l'albero pulito e le due versioni uguali).
- Chi lo usa prende gli aggiornamenti con `claude plugin marketplace update lorenzo-plugins` e `claude plugin update audit-fix@lorenzo-plugins`.
- Dopo il merge, per le sessioni cloud: si carica di nuovo il plugin in «My Uploads» di claude.ai, e ne resta una copia sola.
  1. Lo zip si fa dal PC, in PowerShell, con `tar`. Non con `Compress-Archive`: Windows PowerShell 5.1 scrive i percorsi con `\`, e claude.ai rifiuta lo zip («Zip file contains path with invalid characters»).
     ```powershell
     git pull ; Remove-Item $env:TEMP\<nome>.zip -ErrorAction SilentlyContinue ; tar.exe -a -cf $env:TEMP\<nome>.zip -C plugins\<nome> .claude-plugin agents skills README.md
     ```
     Le voci dopo `-C plugins\<nome>` sono le cartelle e i file al primo livello del plugin: `.claude-plugin/plugin.json` deve stare alla radice dello zip. Un plugin con altre voci al primo livello le aggiunge all'elenco, e uno senza `agents` la toglie: per `recap` sono `.claude-plugin hooks skills README.md`, per `flow` `.claude-plugin agents references skills README.md`.
  2. Prima di caricarlo, `tar.exe -tf $env:TEMP\<nome>.zip`: ogni riga usa `/` (per esempio `agents/implementer.md`).
  3. Controllo in una sessione cloud **nuova** (una sessione aperta tiene la copia presa all'avvio): `claude plugin list` dice `<nome>@synced` con la versione nuova.
