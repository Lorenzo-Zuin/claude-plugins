---
name: recap
description: Shape of the closing message of any turn that did work. Use it every time you end a task or a session, stop mid-task to ask the user for a decision, an approval or an action, hand over unfinished work, or the user asks for a recap, for where things stand, or for a prompt to continue in a new session. Questions with ready answers, the user's steps with exact commands, what is missing and who does it, what the user only needs to know, and one line on what was done; each item in one section only. After an analysis or an explanation that leaves something to decide, do or check, the answer comes first and the sections follow. Not for an answer that leaves nothing open.
argument-hint: [prompt] [optional focus]
---

The user reads the recap once, often on a phone, hours later. One read must tell **what to decide, what to do, what is missing, what only to know**. What was done matters least: the diff and the PR already hold it.

Project rules (CLAUDE.md, the user's preferences) win on language, terms and command conventions. Long detail goes in the files other skills ask for (session log, hand-off, PR body): link them, never paste them. Read `${CLAUDE_SKILL_DIR}/references/examples.md` the first time you use this skill in a session.

## Before writing
1. **Finish what you can.** Run the command, do the fix, push. Hand over only what needs the user: their PC, a web console, a secret, money, a device, a decision, a merge.
2. **Compare with the request.** List what the user asked, in the first message and later. Each item is done, not done, done differently, or not verified. Every item not plainly done gets a place below.
3. **Real commands only.** From the project files or from what you ran here. Never a command, flag, path or menu label you have not seen.

## Sections
Put each item in the **first** section of this list that fits it, and nowhere else. An item that fits none is deleted. Drop empty sections. Headings in the user's language (Italian below).

| Section | Holds | Test |
|---|---|---|
| `## ❓ Decidi` | closed questions only the user can answer: a choice, the approval of a cost, an offer («seguo io la PR?»), a request done differently that needs their yes | they answer here, in the chat |
| `## 👉 Tocca a te` | actions outside the chat: PC, browser, phone, a talk with someone. Checks only they can run | they do something elsewhere |
| `## ⏳ Manca` | what is not done or not verified and is not theirs: what, why in a few words, who does it and when. Defects found and not fixed. Doubts | someone else must still act |
| `## ℹ️ Da sapere` | what changes for them with nothing to do: a change they will see, a cost already spent; a choice you made in their place, or a request done differently, with how to undo it; a real risk nobody can check now | they only take note |
| `✅ Fatto: …` | one line, no heading, with the PR, commit or file link | — |

Delete, never move elsewhere: how things work now, lists of changes, test counts, findings of an analysis (they belong in the answer, below), what you tried, praise, and pointers from one item to another («vedi domanda 1», «passo 2»). A step that depends on an answer is not written yet: it comes after the answer.

````markdown
# ❓ Aspetto una tua risposta

## ❓ Decidi
1. <Closed question>? <cost or consequence, when it decides>
   `1A` <choice> ← consigliata · `1B` <choice>

## 👉 Tocca a te
- [ ] **<Verb and object>** · <where: PC, PowerShell, cartella `<path>` | GitHub nel browser | telefono>
  ```powershell
  <command>
  ```
  ✔ <what you see when it worked>

## ⏳ Manca
- **<what>** · <why, a few words> → <who and when: sessione nuova | io, dopo la tua risposta | la CI, dopo il merge>

## ℹ️ Da sapere
- <what changes for the user> → <how to undo it, for a choice of yours>

✅ Fatto: <one line, with the PR or commit link>
````

## Status
The title follows the sections. When more than one fits, the first of this list wins.
- `❓ Aspetto una tua risposta`: this session waits for a message from the user: a question in **Decidi**, or a last step in **Tocca a te** that ends with «poi scrivimi "fatto"».
- `⛔ Bloccato`: the work waits for something outside that a message cannot change: an admin's approval, a service that is down, a missing permission. **Manca** or **Tocca a te** says what.
- `⏸️ Da continuare`: **Manca** is not empty: work or a check is still open, for another session, for you after something else, or for the CI.
- `✅ Finito`: **Decidi** and **Manca** are empty. **Tocca a te** may hold steps, such as the merge. Never `✅` with a red check, a skipped check, or an unverified item that decides the goal: those are in **Manca**.

## The end-of-turn card
In the desktop app a tool such as `mcp__ccd_turn__wrap_up` draws a card under the message. The card repeats nothing and agrees with the title:
- `recap`: the Fatto line, as plain text. The message then has no Fatto line. After an answer (below): its conclusion in one sentence.
- `ask`: only with `❓`, and always with `❓`. A pointer, never the question: «Rispondi alla 1: consiglio 1A», «Scrivimi "fatto" dopo i passi». Every question stays in **Decidi**.
- `actions`: with one question, one button per choice, label `1A Sì`, message `1A`. With more questions, one button with all the recommended codes when each question has one (message `1A 2A`), otherwise none. For «fatto», one button «Fatto, prosegui».
- `blocked`: true with `❓` and `⛔`, otherwise false.

## After an analysis or an explanation
When what the turn produced is an answer (an analysis, an explanation, a review, a comparison), this skill applies too: write the answer first, in the shape it needs, with no status title. Then, only if **Decidi**, **Tocca a te** or **Manca** have items: a `---` line, the status title and those sections. No Fatto line: the answer is what was done. **Da sapere** only for a change you made, never for a finding. An offer to fix what the answer found is a question in **Decidi**; a point the answer could not verify is in **Manca**. With nothing left, the message is the answer alone. The sections never repeat the answer.

## Limits
- The recap, without an answer before it: 30 lines at most. A section: 5 items at most. An item: 15 words at most, then a `→`.
- No paragraph of prose under the title or in the sections.
- **Decidi**: closed questions, 3 at most, answer codes, recommended first. A decision the user takes alone and tells you lives here, never as a step «decidi tu» or «leggi e scegli». A decision to take with someone else is a step in **Tocca a te**: «Decidi con il cliente se …».
- **Tocca a te**: one action per checkbox, in the order the user does them. Where it runs, the command ready to paste in its shell, the `✔` line. A step that waits for an event starts with it: «Dopo il merge della PR #3, …». A website step gives the exact labels: «Settings → Rules → Rulesets». Money, paid minutes, data loss or production in the same line. A long text to paste (a commit message, a SQL script) goes in a file: link it. The reason for a step, in a few words, only when the user would skip the step without it.
- **Manca**: never the user's own steps, and never work that a question in **Decidi** already decides. A doubt reads «Non sicuro: <what> → <who checks it, when>»; when the user checks it, it is a step in **Tocca a te**.
- **Fatto**: one line, two if two PRs. Never a list, a second paragraph, test counts or file names.

## Words
- The user's language, the user's conventions (for example `;` between commands, never `&&`). Existing words only: an English technical term stays whole, never a hybrid.
- Understood at the first read or deleted. Sentences of 15 words at most, one idea each, imperative for the steps.
- Each thing has one name, the one the user knows, in full the first time with its link: «la PR #160 (controlli sulle PR)». Never a bare internal label (`S5`, a job name).
- No story of what you tried. Numbers only when they decide something (minutes, money).
- A doubt is open, never a hidden «probabilmente».
- Bold only for the actions in **Tocca a te** and the items in **Manca**. No tables except to compare options with three or more values each.

## The prompt for a new session
Only when the user asks for it: `/recap:recap prompt`, «dammi il prompt», «prompt per una sessione nuova». Then read `${CLAUDE_SKILL_DIR}/references/prompt.md` and follow it. Never write or offer one unasked: an item in **Manca** for a new session is enough.

## Check before sending
Read only the title, the headings and the bold: can the user act from those alone? Is every item in one section only? Do the title and the card say the same thing? Then count the lines. Then read each sentence once: if it needs a second read, cut it or split it.

## Arguments
If the first word is `prompt`, add the prompt for a new session after the recap. The rest is the focus of the recap.

$ARGUMENTS
