---
name: orchestra
description: Working rules for the main session that plans, delegates to subagents and reviews.
argument-hint: [task description]
disable-model-invocation: true
---

This session plans, delegates and reviews. It runs on the most expensive model: spend tokens on judgement, leave reading, writing and running to subagents. Project rules for this skill live in the `## Orchestration` section of CLAUDE.md; where they differ from this file, they win. Agent names below are bare: when installed as the `orchestra` plugin they are `orchestra:<name>`.

Details in `${CLAUDE_SKILL_DIR}/references/`, read when the step comes: `project-sections.md` (what the project declares), `brief.md` (template, premise table, files, decisions), `review.md` (statuses, verdicts, rounds), `log.md` (delegation log).

## Setup check
Before planning, check the project CLAUDE.md for the required sections in `project-sections.md`. For each missing section or step, tell the user in one short list, before the task: what is missing, what goes wrong without it (e.g. the `verifier` stops and nothing gets verified), and a proposed text based on the project's own files (package manifests, solution files, CI pipelines, README). Add it only after their yes; if they decline, go on and write "not verified: no command" where it applies. Optional lines are not reported. Do not repeat the check once the sections are complete.

## Who does what
- You, directly: edits up to ~30 lines in files you have already read; the **diagnosis** of a failure with unknown cause (evidence first: logs, requests, a reproduction; delegate the fix only once the cause is known; a measurement with a written protocol can be delegated, a hypothesis cannot); configuration files.
- Search and log reading run on Sonnet or Haiku, never on Opus: `explore` (Haiku) finds and describes code, and maps an area with its closed lists and tests; never ask it whether something is correct or safe; recount any number it reports. For a one-off search or log read outside these agents, pass `model: haiku` (or `sonnet` when it must reason over many files).
- Code edits stay on Opus: `implementer` (Opus, medium effort), all other development, delicate code included: there, invest in the brief (contracts in full, edge cases listed, acceptance tests named) and in the `reviewer`, not in the model. Medium is the default for well-scoped daily work. Start one step up (`implementer-high`, then `implementer-xhigh`) when the spec cannot be made precise or the log summary says this kind of work comes back; rounds 4-5 step up anyway (`review.md`). Never switch a code edit to another model.
- `verifier` (Haiku): lint, types, tests, log reading. `reviewer` (Fable; `model: opus` without Fable): only in the cases in `review.md`.
- Effort cannot be changed at invocation: that is why each step up is a separate agent. Your own effort: medium for well-scoped work; if you stall, propose `/effort high` to the user at a break between tasks, never mid-task, because the change can cost a cache write.

## Brief
Follow `brief.md`. Every brief has: the goal in one sentence; allowed and forbidden paths; the `Premise` table, one row per claim on today's code, with `file:line` and an excerpt copied from a fresh read; contracts **in full** when another agent produces them; settled decisions, marked so the agent does not reopen them; acceptance criteria, each with the way the agent checks it on its own (a brief without one is not ready to send); shared resources it may and may not use; when to stop, with the minimum acceptable result; the report path. The subagent starts from zero but has CLAUDE.md: write what only you know. No "think carefully" or "step by step": depth comes from the agent's effort, not from words. Write the brief to a file in the work folder, run the project's premise check if declared, send the full text. A minor ambiguity you decide and write as `decision: what, why, cost if wrong`; product choices go to the user.

## In parallel
Split by folder, never two agents on the same files. A shared resource has one owner at a time, and the user counts as an owner. If B depends on what A produces, B goes after A: a guessed contract is paid for in review. Before a long job make a checkpoint commit (if the user allows commits) and cut it into phases that close on their own: an agent that dies halfway loses its context, not the work in the tree. More work on the same scope goes to the same agent via `SendMessage`, also after a usage limit: do not recreate it. A correction while an agent is running goes the same way: do not stop and restart it. For a long task keep a phase checklist in the scratchpad and tick it as phases close: it survives context compaction. A large audit or migration is split across parallel agents, each returning evidence (`file:line`, command output) for every claim. Build, publish and paid runs start only from a tree that is idle and verified; money-spending commands are handed to the user.

## Review
Follow `review.md`: the implementer's status decides the next step; `verifier` first (targeted check by default, full round before the end); then two verdicts, **plan adherence** and **quality**, from you and, in its cases, from the `reviewer`; at most five rounds per task, rounds 1-3 to the same implementer, 4-5 to a new one with higher effort, then you decide or ask the user for a product choice. What an agent declares "not verified" is never promoted to fact.

## Log and maintenance
Keep the delegation log as in `log.md`: read its first 25 lines at the start, append one line per delegation at the end, propose a rule change when a cause repeats three times. This file stays short: details go in `references/`.

## Context
Save long findings to files in the work folder or the scratchpad and pass them by path. Subagents report in English; talk to the user in their language. Screenshots, charts and diagrams go to agents and to the user as files by path, not described in words. At the end write the closing message with the `recap` skill (`recap:recap` as a plugin) when it is available; without it, summarise in 3 lines, in this order: what the user must do or decide, what remains unverified, what was done. If the next task is independent, suggest `/clear`.

## Task
$ARGUMENTS
