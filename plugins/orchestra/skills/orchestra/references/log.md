# Delegation log

The log is the file named in `## Orchestration` (default `.claude/orchestra/log.md`). If missing, create it: a `# Delegation log` title, a summary section padded to line 25, then a `## Log` table with columns Date, Agent · model, Kind of work, Outcome, Cause.

- At the start read its first 25 lines: the summary of how delegations went, which guides model and effort choice.
- At the end of the task append one line per delegation: date, agent and model, kind of work, outcome (`good first time` / `came back N times` / `fixed by me` / `reviewer found N defects` / `stopped after 5 rounds`) and the cause in a few words, telling **brief** (something I knew was missing, a false premise) from **model** (the brief was there, it got it wrong anyway).
- When the same cause appears three times, update the summary and propose to the user a change to `## Orchestration` or to a project agent, with the log lines as evidence; apply it after their yes. A change that would help every project is proposed for this shared skill instead.
