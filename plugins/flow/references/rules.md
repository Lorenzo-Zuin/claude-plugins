# Rules shared by every skill of the flow

## Terms

- **Work item**: one unit of development with one goal. It has an issue (its number), a lane, a branch and a folder (`Work items:`).
- **Lane**: S tweak, M change, L feature, H hotfix, R research (`lanes.md`). A lane goes up when a higher condition appears, never down.
- **Phase**: P0 Triage, P1 Spec, P2 Technical plan, P3 Mockup, P4 Implementation, P5 QA, P6 Handoff, P7 Preview, P8 Release, P9 Monitoring and learning.
- **Gate**: a check run by a program (hook, script, CI job) that blocks the work item until it passes. G0 after P0, G1 spec approved, G2 premises checked and plan reviewed, G3 mockup approved, G4 implementation done with a valid receipt, G5 every criterion proven or placed, G6 gate and PR checks green.
- **Premise**: a claim on today's code, with `file:line` and an excerpt of at most three lines that a script can find.

## Labels

| Label | Who sets it | Meaning |
|---|---|---|
| `ready` | **the user only** | authorized for development |
| `on-hold` | **the user only** | stopped: nobody works on it, even with `ready` |
| `requested` | the session, only when the user asked for the work in the session | authorized: the user's sentence is in the issue body |
| `needs-triage` | whoever creates an unauthorized issue | to look at; nobody works on it |
| `in-progress` | the `Open work item:` command | a session works on it |
| `lane:S`, `lane:M`, `lane:L`, `lane:R` | the session in P0 | the lane |
| `lane:H` | **the user only**; the session may only propose it, and only for damage in progress | hotfix |
| `phase:P0` … `phase:P9` | the session at each transition | the phase; it lives only in the label |
| `spec-ok`, `mockup-ok`, `preview-ok`, `autonomous` | **the user only** | approvals; `autonomous` lets the session decide in place of the user and stands in for `spec-ok` |
| `priority:high`, `priority:low` | the user | order of work |
| `needs-bench` | the session in P5 or P6 (evaluation missing) | waits for the device bench (`flow:bench`) or for the user's evaluation run; removed by the session that does it |

- Work only on issues with `ready` or `requested`, without `on-hold` and without `in-progress` set by another session.
- **Never add `ready`, `on-hold`, `lane:H`, `spec-ok`, `mockup-ok`, `preview-ok` or `autonomous`, and never remove `on-hold`.** Cloud sessions act with the user's own GitHub identity: GitHub cannot tell the session from the user, so this rule is yours to keep, not GitHub's. A ticked approval box in the issue body is a reminder, not an approval: only the label counts.
- A direct request from the user in the session counts as authorization: create the issue with `requested` and copy the user's sentence into the body, word for word.

## The issue

- It is the shared record: every session sees it, also from a phone.
- The body is written once, in P0. Afterwards only scripts rewrite it, and only between the status-block markers. Never edit the status block by hand, and never touch the user's sections (notes, answers, ticked boxes).
- Every transition is a comment plus the new `phase:Pn` label, then the `Status:` command if declared.
- Open questions for the user go in the transition comment as `Q1`, `Q2`… each with the recommended answer and why. When the project's issue template has an actions section for the user (`Azioni per te` in the reference flow), add each question there too, as `- [ ] Q1: <question> (<recommended>: <answer>)`: the status script reads those boxes to show that the issue waits for the user. That line is the only edit a session makes to the body outside the status block; never untick or reword a box the user touched.

## The folder

- `worklog.md` headings stay in English: scripts read them. The text under them is in the user's language. Never change the shape of the `Branch` and `Lane` lines.
- After every closed step: one line in `## Progress log` or `## Updates`, a commit, a push. A new session restarts from the worklog and `git log` and never redoes closed steps.
- At the start of a session on an existing branch, merge the integration branch (the `Partito da` branch of the worklog) into the work item branch. Never rebase a branch already pushed.
- Decisions you take alone: `decision: what, why, cost if wrong`, in the `Decisions:` place from `## Orchestration` (else `## Decisions` of the worklog). Product choices go to the user.

## Language

Follow the project's language rules for issue, worklog, spec and plan. Keys, headings read by scripts, identifiers and file names stay as the project has them.
