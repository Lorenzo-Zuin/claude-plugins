---
name: work
description: Phase P0 (triage) of the development flow. Gives a request a work item - issue, lane, touched paths, branch, folder, empty contract - without colliding with work items in progress, and only when the work is authorized. Use it when the user asks for new work in the session, or names an issue to start.
argument-hint: [request or issue number]
---

You open a work item. Shared rules: `${CLAUDE_SKILL_DIR}/../../references/rules.md`. Project declarations: `${CLAUDE_SKILL_DIR}/../../references/project-sections.md`. Lanes: the `Lanes:` declaration, else `${CLAUDE_SKILL_DIR}/../../references/lanes.md`. Details: `${CLAUDE_SKILL_DIR}/references/triage.md`. Issue body without a project template: `${CLAUDE_SKILL_DIR}/references/issue-template.md`.

## Steps
1. **Setup check** (`project-sections.md`).
2. **Read the request.** `$ARGUMENTS` is a request or an issue number. If an issue exists for this work, read it all, comments and the user's notes included. With no request, start `flow:next` instead.
3. **Authorization.**
   - The user asked for this work in the session: it is authorized. The issue gets `requested` and the user's sentence word for word.
   - An existing issue: it needs `ready` or `requested`, and no `on-hold`. Otherwise stop and say what the user can do. Never add `ready`, never remove `on-hold`.
4. **Paths.** Write the paths the work item will touch as path patterns (`triage.md`). Read the code enough to be right: a wrong path breaks the collision check of everyone else.
5. **Collisions.** List open issues with `in-progress` and open pull requests, and compare their paths with yours (`triage.md`). If one overlaps, stop and ask the user: merge the two work items, queue this one, or split the paths.
6. **Lane.** Apply the conditions. Write the lane and, in one line, the condition that decided it. Propose `lane:H` only for damage in progress; the label is the user's.
7. **Issue.**
   - New: create it from the `Templates:` issue template (else `issue-template.md`), with labels `lane:<X>`, `phase:P1` and `requested` when step 3 says so.
   - Existing: add `lane:<X>` and `phase:P1`; add the paths in a comment if the body has none. Never rewrite the user's sections.
   - Lanes S and H: write current, expected and unchanged behaviour in the body (new issue) or in a comment.
8. **Open the work item.** Run the `Open work item:` command with the issue number and a slug (`triage.md`). If this session was given a branch (for example `claude/…`), use the command's current-branch option. If the command refuses, report its message as it is and stop: do not work around it, do not create the branch or folder by hand.
9. **Push** the branch (`git push -u origin <branch>`). Run the `Status:` command if declared.
10. **Hand over.** Lane S and H: P1 is in the issue, so go on with `flow:spec` only to complete the behaviour if it is missing. Other lanes: start `flow:spec`, unless the user asked to stop after P0.

## Never
- Create the branch, the folder or the contract by hand when the project declares `Open work item:`.
- Start on an issue another session has `in-progress`.
- Close, relabel or edit someone else's issue to make room for this one.

## End
Close with the `recap` skill when this is the last skill of the turn.
