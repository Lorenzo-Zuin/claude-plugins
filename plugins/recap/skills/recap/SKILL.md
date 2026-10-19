---
name: recap
description: Shape of the closing message of any turn that did work. Use it every time you end a task or a session, stop mid-task to ask the user for a decision, an approval or an action, hand over unfinished work, or the user asks for a recap or where things stand. First what is not done or wrong, then the user's steps with exact commands, questions with ready answers, one line on what was done, and a prompt to paste into a new session. Not for a plain answer to a question.
argument-hint: [optional focus]
---

The user reads the recap once, often on a phone, hours later. One read must answer: **is it done, what is wrong, what do I do**. What was done is the least important part: the diff and the PR already hold it.

Project rules (CLAUDE.md, the user's preferences) win on language, terms and command conventions. Long detail goes in the files other skills ask for (session log, hand-off, PR body): link them, never paste them. Read `${CLAUDE_SKILL_DIR}/references/examples.md` the first time you use this skill in a session.

## Before writing
1. **Finish what you can.** Run the command, do the fix, push. Hand over only what needs the user: their PC, a web console, a secret, money, a device, a decision, a merge.
2. **Compare with the request.** List what the user asked, in the first message and later. Each item is done, not done, or done differently. Not done and differently go first in the recap.
3. **Real commands only.** From the project files or from what you ran here. Never a command, flag, path or menu label you have not seen.
4. **Status.** `✅ Finito` (nothing left for any session), `⏸️ Da continuare` (a session must go on: prompt required), `❓ Aspetto una tua risposta` (this session goes on after your answer), `⛔ Bloccato` (something outside must change: say what; prompt required). Never `✅` with a red check, a skipped check, or an unverified item that decides the goal.

## Shape
Sections in this order. Drop a section with nothing in it. Headings in the user's language (Italian below).

````markdown
# ⏸️ Da continuare
> <The one line the user must know. Nothing else goes here.>

## ❌ Non fatto
- **<what you asked>** · <why not, a few words> → <who does it: tu / nuova sessione / dopo il merge>

## ⚠️ Attenzione
- <a problem, a risk, a doubt, a choice you made> → <what it changes for the user>

## 👉 Tocca a te
- [ ] **<Verb and object>** · <where: PC, PowerShell, cartella `<path>` | GitHub nel browser | telefono>
  ```powershell
  <command>
  ```
  ✔ <what you see when it worked>

## ❓ Rispondi
1. <Closed question>?
   `1A` <choice> ← consigliata · `1B` <choice>

## ✅ Fatto
<One line, with the PR or commit link.>

## 📋 Prompt per la prossima sessione
<Where to paste it, after which step.>
```text
<prompt>
```
````

## Limits
- The whole message without the prompt: 30 lines at most. A section: 5 items at most. An item: 15 words at most, then a `→`.
- No paragraph of prose. The only free sentence is the quote under the title.
- **❌ Non fatto** lists the user's requests that are not done or done differently, each with its owner. An unverified item that decides the goal is here, not in Fatto.
- **⚠️ Attenzione** holds only what changes what the user does: a defect found, a doubt («Non sicuro: …»), a cost, a reversible choice you made and how to undo it. No praise, no process.
- **👉 Tocca a te**: every `→ tu` of **Non fatto** has its checkbox here. One action per checkbox, in the order the user does them. Where it runs, the command ready to paste in its shell, the `✔` line. A step that waits for an event starts with it: «Dopo il merge della PR #3, …». A website step gives the exact labels: «Settings → Rules → Rulesets». Say money, paid minutes, data loss or production in the same line.
- **❓ Rispondi**: closed questions only, 3 at most, answer codes, recommended first. Every question, offer or decision left to the user lives here, nowhere else: never a step «decidi tu» or «leggi e scegli».
- **✅ Fatto**: one line, two if two PRs. Never a list of changes, test counts or files.
- **📋 Prompt**: required with `⏸️` and `⛔`, and for a side task found but not done. See below.

## Words
- The user's language, the user's conventions (for example `;` between commands, never `&&`). Existing words only: an English technical term stays whole, never a hybrid.
- Understood at the first read or deleted. Sentences of 15 words at most, one idea each, imperative for the steps.
- Each thing has one name, the one the user knows, in full the first time with its link: «la PR #160 (controlli sulle PR)». Never a bare internal label (`S5`, «il passo 7», a job name).
- No story of what you tried. No «perché» unless the user would skip the step without it. Numbers only when they decide something (minutes, money).
- A doubt is open: «Non sicuro: <what> → <how it is checked>». Never a hidden «probabilmente».
- Bold only for the actions in **Tocca a te** and the requests in **Non fatto**. No tables except to compare options with three or more values each.

## The prompt for a new session
Written for a session that knows nothing of this one. In a `text` block, in the user's language, no fenced block inside it (commands in single backticks), so one tap copies it whole. Content, short lines:
- where: repository, base branch, branch to continue or create, PR and issue, PC folder or worktree when it matters;
- goal in one sentence, in the user's words;
- done so far, with the PR or commits;
- to do, numbered, each with how to check it is done;
- what this session learned that the next one must not rediscover: traps, wrong hypotheses, decisions taken with the user;
- what not to do;
- last line: «Alla fine scrivi il resoconto con la skill `recap`.»

## Check before sending
Read only the headings and the bold. Can the user act from those alone? Then count the lines. Then read each sentence once: if it needs a second read, cut it or split it.

## Focus
$ARGUMENTS
