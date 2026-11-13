# Examples

Four messages in the shape of `SKILL.md`. A and B rewrite real recaps the user could not act on: the facts are those of the originals, to show the shape, not to reuse. C and D are invented. Then a list of typical items and the section each one goes to.

## A. Stopped for an answer (`❓`), with the desktop card

# ❓ Aspetto una tua risposta

## ❓ Decidi
1. Lancio la build Android di prova? 25-40 minuti di Actions; un secondo tentativo richiede lo stesso tempo.
   `1A` Sì ← consigliata · `1B` No, la segno come saltata
2. Seguo io la PR #160 (CI e commenti)?
   `2A` Sì ← consigliata · `2B` No

## 👉 Tocca a te
- [ ] **Dopo il merge della PR #160, crea le regole per `preview` e `main`** · GitHub nel browser, Settings → Rules → Rulesets → New branch ruleset
  - `preview`, controlli obbligatori: `gate`, `integration`, `android-build-check`
  - `main`, controlli obbligatori: `gate`, `Lint, tipi e test`, `Migrazioni da zero, isolamento e funzioni server`, `Scansione dei segreti`
  - Bypass list vuota · Require branches up to date: acceso · Required approvals: 0
  ✔ una PR con `gate` rosso ha il merge bloccato
- [ ] **Poi togli la label `ready` da una PR verde** · GitHub nel browser
  ✔ dopo un minuto il merge è bloccato. Se resta possibile, scrivimelo

## ⏳ Manca
- **Test `new-recurrence.test.tsx`** · fallisce a mezzanotte, non è di questa PR → sessione nuova, quando vuoi

## ℹ️ Da sapere
- Ho tolto `[skip ci]` dalle PR: con le regole nuove bloccherebbe il merge → per rimetterlo, dimmelo

✅ Fatto: [PR #160](https://github.com/OWNER/REPO/pull/160) verso `preview`; controlli verdi tranne `gate`, che aspetta la build.

In the desktop app the message ends before the Fatto line, and the card holds:

```json
{
  "recap": "PR #160 verso preview; controlli verdi tranne gate, che aspetta la build.",
  "ask": "Rispondi alle domande 1 e 2: consiglio 1A e 2A.",
  "actions": [{ "label": "1A 2A, le consigliate", "message": "1A 2A" }],
  "blocked": true
}
```

Where the items of the original went: the build was in «Non fatto» and in the questions, now only in **Decidi**. The branch rules were in «Non fatto» and in the steps, now only in **Tocca a te**. The doubt «togliere la label blocca il merge?» is now the `✔` line of the second step. The original prompt for the midnight test is gone: the user asks for it when they want it.

## B. Hand-over with steps (`⏸️`)

# ⏸️ Da continuare

## 👉 Tocca a te
- [ ] **Rimetti le patch di `expo-secure-store` e `expo-share-intent`** · PC, Git Bash. Senza, la build Android esce rotta
  ```bash
  cd /c/Progetti/app ; pnpm install --force
  ```
  ✔ `pnpm exec vitest run packages/mobile/src/lock/secureStorePatch.test.ts` è verde
- [ ] **Rifai l'accesso nell'app** · emulatore e telefono, utente di prova, link da Mailpit <http://127.0.0.1:54324>. Ho riportato il database locale ai dati di prova
  ✔ l'app si apre senza chiedere l'accesso
- [ ] **Dopo il merge, al primo APK di anteprima: disinstalla l'app di anteprima, poi installa l'APK** · telefono, una volta sola
  ✔ l'app di anteprima si apre e chiede l'accesso

## ⏳ Manca
- **2 test di `scripts/work.test.ts`** · lenti solo dentro `pnpm test`, non di questa PR → sessione nuova
- **Non sicuro: script di pubblicazione contro Supabase remoto** · non provato → la CI, alla prima pubblicazione dopo il merge

✅ Fatto: [PR #162](https://github.com/OWNER/REPO/pull/162) verso `preview`; lint, tipi, test e pgTAP verdi.

The database reset was a warning of its own in the original. It is the reason for the second step, so it lives in that step.

## C. Nothing left (`✅`)

# ✅ Finito

## 👉 Tocca a te
- [ ] **Fai il merge della PR #170** · GitHub nel browser, Merge pull request → Confirm merge
  ✔ la PR mostra «Merged»

✅ Fatto: note di rilascio 0.9.0 in italiano e inglese nella [PR #170](https://github.com/OWNER/REPO/pull/170) verso `preview`, controlli verdi.

## D. The answer first, then the recap

The user asked why last night's import took three hours.

L'import è lento perché manca l'indice su `orders.customer_id`: ogni riga importata legge tutta la tabella.

- La migrazione `0042_split_orders.sql` ricrea la tabella `orders` e non ricrea l'indice.
- Prima della migrazione l'import durava 12 minuti; dopo, fra 2 e 3 ore ogni notte.
- Su una copia locale, con l'indice di nuovo presente, l'import dura 11 minuti.

---

# ❓ Aspetto una tua risposta

## ❓ Decidi
1. Aggiungo una migrazione che ricrea l'indice? In produzione blocca le scritture su `orders` per circa 2 minuti.
   `1A` Sì, in una PR verso `main` ← consigliata · `1B` No, lo creo io a mano

## ⏳ Manca
- **Le altre tabelle ricreate dalla `0042`** · non controllate → io, dopo la tua risposta

Card: `recap` «L'import è lento perché la migrazione 0042 ha tolto l'indice su orders.customer_id.», `ask` «Rispondi alla 1: consiglio 1A.», one button per choice (`1A Sì, PR verso main` → `1A`, `1B Lo creo io` → `1B`), `blocked` true.

## Where typical items go

| Item | Section |
|---|---|
| «Le sessioni ferme da 2 ore spariscono da sole dall'elenco» | **Da sapere**: a change the user will see |
| «Il titolo compare dopo il primo turno, perché l'app lo assegna lì» | deleted: how things work |
| «Il validatore segnala solo l'icona mancante, come sempre → nessuna azione» | deleted: nothing to do, nothing changes |
| «Ho portato il timeout a 30 s in quattro test che non avevo scritto» | **Da sapere**, with how to undo it |
| «Non sicuro: l'altra sessione forse non ha ricevuto il messaggio» | **Tocca a te**: «Se l'altra sessione non riparte, mandale …» |
| «La pagina è privata, ma chi ha il link legge anche i dati allegati» | **Da sapere**: a real risk |
| «Faccio commit e push?» in the card of a finished task | **Decidi**, and the title becomes `❓` |
| A defect found outside the task | **Decidi** if you can fix it now («Lo correggo?»), else **Manca** with who and when |
| The proofs of an analysis, a comparison of options, the cause in four steps | the answer, before the `---` line |
| «Scrivimi "fatto" quando hai finito» as a step of its own | the end of the last step's `✔` line, and the title becomes `❓` |
| «Il push non è fatto, come mi avevi chiesto» | deleted; a step in **Tocca a te** if the user must push |
| «Rilancio la validazione?» in **Decidi** and «Validazione non eseguita → io, dopo la tua risposta» in **Manca** | **Decidi** only: the question already covers it |
| A list of what was changed, test counts | deleted: the PR holds them |
