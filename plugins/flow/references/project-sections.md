# What the project declares

No file of this plugin names a project's commands or paths: the project declares them, with fixed keys, in one of two places:

1. a `## Flow` section of CLAUDE.md;
2. a line `- Flow: <file>` anywhere in CLAUDE.md, naming a file that holds the same keys. Use it when CLAUDE.md must stay short.

If both exist, the file wins. Keys stay in English because the skills look for them; the text after them may be in any language. Placeholders such as `<issue>` and `<slug>` are explained on the same line. The lines `Premise check:` and `Decisions:` are read from the `## Orchestration` section, where the `orchestra` plugin already reads them, and `Targeted check:` from `## Verification commands`: never repeat them here.

## Required (the setup check reports what is missing)

| Key | Example of meaning | Used by |
|---|---|---|
| `Work items:` | the folder of a work item, with `<issue>` and `<slug>`; it holds `worklog.md` | all |
| `Templates:` | the folder of the project's templates: `issue.md`, `worklog.md`, `spec.md`, `plan.md`; a missing file falls back to this plugin's template | work, spec, plan |
| `Next issue:` | the command that lists the authorized issues in order of work | next |
| `Open work item:` | the command that checks the authorization labels, creates the branch, the folder with worklog and empty contract, and the first commit; with its options (current branch, branch type) | work |

## Optional (not reported as missing)

| Key | Effect | Without it |
|---|---|---|
| `Status:` | the command that rewrites the status block of the issue; run after every phase change | transitions only as issue comments; the issue body is never edited |
| `Contract check:` | the command that validates the contract after P1 writes its criteria | the contract is checked against `Contract schema:` by reading |
| `Contract schema:` | file and section that define the contract keys, statuses, evidence types and the evidence each risk requires | `skills/spec/references/acceptance.md` |
| `Lanes:` | file and section with the project's lane conditions | `references/lanes.md` |
| `Roles:` | where the product roles are read (schema files, a type, a table) | spec and reviewer search the schema themselves and say where they looked |
| `Matrix:` | file and section with the project's rows of the completeness matrix, added to the generic ones | the generic matrix only |
| `Solutions:` | folder of notes on solved defects, read in P1 and P2 for the area | none read |
| `Dev data:` | where the development data (seed) lives and who its users are | the plan names the data in words |
| `Release fragment:` | path of the release fragment, with `<issue>`, and the file or section that defines its format | the plan writes compatibility in prose only |
| `Mockups:` | folder of the HTML mockups, the naming rule of a new file, the reference device width and height | mockup asks where mockups go before drawing; drawn files go in the work item folder |
| `Mockup render:` | the command that turns one mockup file into one image per frame and theme | mockup renders with Playwright (`skills/mockup/references/render.md`) |
| `Rubric:` | the project's part of the UX rubric, and the visual system and text rules it points to | the generic rubric only (`references/ux-rubric.md`) |
| `Evidence:` | folder of a work item's evidence, with `<issue>` and `<slug>`, and the image format | `evidence/` inside the work item folder, WebP 540 px wide |
| `Record evidence:` | the command that sets a criterion's outcome and evidence in the contract | outcomes in the worklog `## Verified` only, and "contract not updated: no command" in the reply |
| `QA commands:` | the automatic QA commands beyond the tests: web end-to-end, builds, captures of console and website with widths and themes, design checks | qa runs only the tests the plan names |
| `Bench:` | the bench command and its actions by role: lock status, take, renew, release, check (with the build variant), reset of the local database, flows, capture, variants, touch targets | no device part: `bench` points to the project's manual steps and the device criteria go to the user's manual test script |
| `Acceptance:` | the file with the bench rules: lock expiry, devices, foreground check, capture method, variants, users and simulated user, flows policy, allowed resets, safety on a personal phone | `bench` and `device-tester` stop with "setup missing" |
| `App id:` | the identifier of the project's app for each build variant, used by the foreground check before every capture or tap | `device-tester` stops with "setup missing" |
| `Gate:` | the command that says what is missing before the PR and fails if anything is | qa and handoff check gates G5 and G6 by reading, and say so |
| `Handoff:` | the command that prepares a work item for its PR (migration timestamps, numbers of decision records and docs, the `phase:P6` label) | handoff does those steps by hand where they apply |
| `Docs check:` | the command that checks the text files against the branch (paths and commands removed, broken links, infrastructure not named) and lists the documents to reread, with the line to write in the worklog | handoff searches every text file for the paths and commands the branch removed or changed |
| `Full check:` | the full verification run that also writes the receipt | the full round of `## Verification commands` |
| `PR template:` | the pull request template | the repository's template, else `skills/handoff/references/pr.md` |
| `Merge:` | who may merge a work item's PR into the integration branch, and on which conditions | the merge is the user's |

## Setup check

At the start of `next` and `work`, and of any other skill of the flow when called directly, read the declarations. For each missing required key tell the user in one short list, before the task: what is missing, what goes wrong without it (for example, without `Open work item:` the work item has no branch, folder or contract), and a proposed line built from the project's own files (package scripts, docs of the flow, existing folders). Add it only after their yes; if they decline, do the step by hand and write "not checked: no command" where it applies. Optional keys are not reported. Do not repeat the check once the keys are complete.
