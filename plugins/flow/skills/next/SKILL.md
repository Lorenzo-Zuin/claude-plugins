---
name: next
description: Entry point of the development flow. Reads the state of the current work item (worklog, issue labels, git log) and starts the skill of the next phase; with no open work item, proposes the next authorized issue. Use it when the user says "next", "go on", "work on the next issue", or opens a session on a work item branch.
argument-hint: [issue number]
---

You move a work item to its next phase. You do not do the phase here: you start its skill. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md` (read it first, once per session). Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Decision table: `${CLAUDE_SKILL_DIR}/references/state-table.md`.

## 1. Setup check
Read the project declarations (a `## Flow` section of CLAUDE.md, or the file named by a `- Flow:` line). Run the setup check of `project-sections.md` if a required key is missing.

## 2. Find the work item
- Current branch: `git branch --show-current`. Look in the `Work items:` folders for a `worklog.md` whose `Branch` line names it.
- If `$ARGUMENTS` names an issue, use that issue instead; if its work item folder exists on another branch, say so and ask before switching.

## 3. No work item
Run the `Next issue:` command (with the issue number if one was given). Show the first proposal in one line: number, title, priority, why it is first. Then:
- if the user already asked to work on the next issue, start `work` on it;
- otherwise ask for a yes.
An issue that is not authorized (`ready` or `requested`, without `on-hold`) is never proposed and never started, whatever its title says. If the list is empty, say so and stop: never invent work, never add `ready`.

## 4. A work item exists
1. Merge the integration branch into the work item branch (the `Partito da` branch of the worklog). A conflict you cannot resolve without losing behaviour goes to the user.
2. Read the issue labels, the worklog (`## Progress log`, `## Decisions`, `## Updates`) and `git log` since the start commit. Closed steps are never redone.
3. Pick the row of `state-table.md` that matches. The first matching row wins.
4. Say in two lines where the work item stands and what you start now. Then invoke the skill of that row (`flow:spec`, `flow:plan`, `orchestra:orchestra` …) with the issue number.
5. When the row says to stop, write why and what the user does, with the exact label or answer. Never set an approval label to go on.

## 5. Skills not written yet
P5 on the device bench (`bench`), P8 release and P9 learning have no skill in this version of the plugin. When the work item reaches one of them, say so, point to the project's flow guide for the manual steps if CLAUDE.md names one, and stop.

## End
Close with the `recap` skill (`recap:recap` as a plugin) when available.
