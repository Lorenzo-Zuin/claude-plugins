# Examples

Three recaps in the shape of `SKILL.md`. A and B rewrite real recaps the user could not act on: the facts are those of the originals, to show the shape, not to reuse. C is invented.

## A. Stopped for an approval (`❓`)

# ❓ Aspetto una tua risposta
> La PR #160 è pronta. Manca solo la build Android di prova: costa 30 minuti di Actions, mi serve il tuo sì.

## ❌ Non fatto
- **Build Android di prova** · aspetta il tuo sì (domanda 1) → tu
- **Regole di protezione dei branch** · GitHub le accetta solo dopo il merge → tu, dopo il merge

## ⚠️ Attenzione
- Non sicuro: togliere la label `ready` blocca il merge? → lo vedi dopo il merge, passo 2
- Il test `new-recurrence.test.tsx` fallisce a mezzanotte. Non è di questa PR → prompt in fondo
- Ho tolto `[skip ci]` dalle PR: con le nuove regole bloccherebbe il merge → se non va, dimmelo

## 👉 Tocca a te
- [ ] **Dopo il merge della PR #160, crea le regole per `preview` e `main`** · GitHub nel browser, Settings → Rules → Rulesets → New branch ruleset
  - `preview`, controlli obbligatori: `gate`, `integration`, `android-build-check`
  - `main`, controlli obbligatori: `gate`, `Lint, tipi e test`, `Migrazioni da zero, isolamento e funzioni server`, `Scansione dei segreti`
  - Bypass list vuota · Require branches up to date: acceso · Required approvals: 0
  ✔ una PR con `gate` rosso ha il merge bloccato
- [ ] **Togli la label `ready` da una PR verde** · GitHub nel browser
  ✔ dopo un minuto il merge è bloccato. Se resta possibile, scrivimelo

## ❓ Rispondi
1. Lancio la build Android di prova? 25-40 minuti di Actions, un secondo tentativo costa uguale.
   `1A` Sì ← consigliata · `1B` No, la segno come saltata
2. Seguo io la PR #160 (CI e commenti)?
   `2A` Sì · `2B` No

## ✅ Fatto
[PR #160](https://github.com/OWNER/REPO/pull/160) verso `preview`, controlli verdi tranne `gate`, che aspetta la build.

## 📋 Prompt per la prossima sessione
Per il test di mezzanotte, in una sessione nuova sullo stesso repository, quando vuoi.
```text
Repository OWNER/REPO. Branch nuovo `fix/test-ricorrenza-a-mezzanotte` da `preview`.

Obiettivo: `packages/mobile/tests/new-recurrence.test.tsx` deve passare a qualunque ora, anche a mezzanotte di Roma.

Si sa: è fallito una volta a mezzanotte; in un altro giro contava 41 giorni invece di 40. Dipende dalla data in cui gira.

Da fare:
1. Riproduci il difetto fissando data e ora a mezzanotte di Roma.
2. Correggi test o codice secondo `.claude/rules/domain.md`.
3. Verifica: `pnpm --filter mobile exec jest tests/new-recurrence.test.tsx`, poi `pnpm lint`, `pnpm typecheck`, `pnpm test`.
4. Apri la PR verso `preview`.

Alla fine scrivi il resoconto con la skill `recap`.
```

## B. Hand-over with steps (`⏸️`)

# ⏸️ Da continuare
> La PR #162 è aperta e verificata. Due patch mancano sul tuo PC: senza, una build Android esce rotta.

## ❌ Non fatto
- **2 test di `scripts/work.test.ts`** · lenti solo dentro `pnpm test`, non di questa PR → nuova sessione

## ⚠️ Attenzione
- Ho riportato il database locale ai dati di prova → rifai l'accesso nell'app (passo 2)
- Non verificato: lo script di pubblicazione contro Supabase remoto → si vede alla prima pubblicazione dopo il merge

## 👉 Tocca a te
- [ ] **Rimetti le patch di `expo-secure-store` e `expo-share-intent`** · PC, Git Bash
  ```bash
  cd /c/Progetti/app ; pnpm install --force
  ```
  ✔ `pnpm exec vitest run packages/mobile/src/lock/secureStorePatch.test.ts` è verde
- [ ] **Rifai l'accesso nell'app** · emulatore e telefono, utente di prova, link da Mailpit <http://127.0.0.1:54324>
  ✔ l'app si apre senza chiedere l'accesso
- [ ] **Dopo il merge, al primo APK di anteprima: disinstalla l'app di anteprima, poi installa l'APK** · telefono, una volta sola
  ✔ l'app di anteprima si apre e chiede l'accesso

## ✅ Fatto
[PR #162](https://github.com/OWNER/REPO/pull/162) verso `preview`; lint, tipi, test e pgTAP verdi.

## 📋 Prompt per la prossima sessione
Per i 2 test lenti, in una sessione nuova sullo stesso repository. Non dipende dai tuoi passi.
```text
Repository OWNER/REPO. Branch nuovo `fix/timeout-test-handoff` da `preview`.

Obiettivo: i 2 test di handoff in `scripts/work.test.ts` passano anche dentro `pnpm test` completo.

Si sa: da soli passano (`pnpm exec vitest run --project scripts scripts/work.test.ts`, 17 su 17). Dentro `pnpm test` superano i 5 secondi per test.

Da fare:
1. Riproduci con `pnpm test` e misura i 2 test.
2. Trova che cosa li rallenta e correggilo. Alzare il tempo massimo solo con il motivo scritto nel test.
3. Verifica: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
4. Apri la PR verso `preview`.

Alla fine scrivi il resoconto con la skill `recap`.
```

## C. Nothing left (`✅`)

# ✅ Finito
> Note di rilascio 0.9.0 pronte in italiano e inglese. Ti resta il merge.

## 👉 Tocca a te
- [ ] **Fai il merge della PR #170** · GitHub nel browser, Merge pull request → Confirm merge
  ✔ la PR mostra «Merged»

## ✅ Fatto
[PR #170](https://github.com/OWNER/REPO/pull/170) verso `preview`, controlli verdi.
