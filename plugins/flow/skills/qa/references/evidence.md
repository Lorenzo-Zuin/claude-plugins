# Evidence: how each type is produced and recorded

The contract schema of the project (`Contract schema:`) defines the types, the outcomes and the evidence each risk requires; where it differs from this table, the project wins.

| Type | Produced by | Where | Ref recorded |
|---|---|---|---|
| `unit` | the project's logic tests on the test the plan names | here | test file and test name |
| `component` | component tests | here | test file and test name |
| `pgtap` | database tests on a freshly reset local database | here, if the local database starts | test file |
| `deno` | server function tests | here | test file and test name |
| `e2e` | the whole local system: stack, server functions on, final state read from the database | here, if the local stack starts | the report file in `Evidence:` |
| `web_e2e` | end-to-end tests of the web console (`QA commands:`) | here | the report file |
| `web_screen` | captures of the console or the website at the declared widths and themes | here | the image files |
| `ux_review` | the `ux-critic` verdict on mockups or captures | here (web, mockups) or bench (device) | the verdict file in `Evidence:` |
| `maestro`, `simulated_user`, `screen:<variant>` | the device bench | bench machine | — (write `## Needs bench`) |
| `eval_result` | the AI evaluation set, run by the user | the user's machine | — (write it in the worklog: "evaluation needed") |
| `old_app` | the previous release's app against the new server | bench, at release | — |
| `user_device` | a real phone, in preview | the user | — |

## Rules for a result

- Run the test on the current commit. A run on an older commit is not evidence: the project's receipt or fingerprint says which commit a run belongs to.
- A verdict or a report is a file in `Evidence:`, committed; the record command stores its fingerprint. Logs too long to commit are summarised in the file, with the command that reproduces them.
- An outcome of `pass` needs **every** type in `evidence_required`. One type missing: the criterion stays `todo` and the missing type goes to the right place (bench, user, evaluation).
- `not_verifiable_here` is not a way out of a hard test: only the cases the schema allows (in the reference flow: a real phone, iOS, the old app while its build is missing), always with where and when.

## Outcome lines in the worklog

One line per criterion under `## Verified` once it passes: id, command, place (cloud, PC, browser), evidence file. Under `## To verify by the user`: what only the user can see, at most ten points for the manual test script.
