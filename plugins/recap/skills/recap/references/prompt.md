# The prompt for a new session

Written only when the user asks for it. Never offered unasked.

- «dammi il prompt» or a similar request alone: the message is one line on where to paste it, then the block.
- `/recap:recap prompt`: the recap first, then that line and the block, at the end.

## Rules
Written for a session that knows nothing of this one. In a `text` block, in the user's language, no fenced block inside it (commands in single backticks), so one tap copies it whole. Content, short lines:
- where: repository, base branch, branch to continue or create, PR and issue, PC folder or worktree when it matters;
- goal in one sentence, in the user's words;
- done so far, with the PR or commits;
- to do, numbered, each with how to check it is done;
- what this session learned that the next one must not rediscover: traps, wrong hypotheses, decisions taken with the user;
- what not to do;
- last line: «Alla fine scrivi il resoconto con la skill `recap`.»

## Shape

<Where to paste it, after which step.>
```text
<prompt>
```

## Example

In una sessione nuova sullo stesso repository, quando vuoi. Non dipende dai tuoi passi.
```text
Repository OWNER/REPO. Branch nuovo `fix/timeout-test-handoff` da `preview`.

Obiettivo: i 2 test di handoff in `scripts/work.test.ts` passano anche dentro `pnpm test` completo.

Si sa: da soli passano (`pnpm exec vitest run --project scripts scripts/work.test.ts`, 17 su 17). Dentro `pnpm test` superano i 5 secondi per test.

Da fare:
1. Riproduci con `pnpm test` e misura i 2 test.
2. Trova che cosa li rallenta e correggilo. Alzare il tempo massimo solo con il motivo scritto nel test.
3. Verifica: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
4. Apri la PR verso `preview`.

Non fare: cambiare i test di altri file.

Alla fine scrivi il resoconto con la skill `recap`.
```
