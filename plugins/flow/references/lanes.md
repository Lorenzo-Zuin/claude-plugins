# Lanes

The lane decides how much preparation a work item needs. Choose it in P0 from written conditions; the project's `Lanes:` declaration, when present, replaces the conditions below. If a condition of a higher lane appears later, the lane goes up and the missing phases are done. A lane never goes down.

| Lane | Conditions | Examples |
|---|---|---|
| **S** tweak | **All** true: no new table, column or database function; no new server function; no new screen; one role involved; no effect on notifications, subscription plans, payments or AI | a text, a colour, a defect inside one component |
| **M** change | **All** true: an existing behaviour changes; at most one additive migration; existing screens only; no new role | one more filter, a new field in a form, development data or tests that change behaviour |
| **L** feature | **At least one** true: new screen, new table, several roles, notifications, AI, two front ends at once, subscription plans or payments | a sharing feature, reminders |
| **H** hotfix | a production defect the user wants fixed now. Propose H only if the defect **is** damaging data, money or access; the `lane:H` label is the user's | sign-up blocked |
| **R** research | a question or a decision, no product code | choice of a supplier, an architecture decision record |

When in doubt between two lanes, take the higher one and write `decision:` with the reason.

## What each lane does

| Phase or item | S | M | L | H | R |
|---|---|---|---|---|---|
| P0 Triage | yes | yes | yes | yes | yes |
| P1 Spec | in the issue: current, expected, unchanged behaviour | short spec in the worklog | full `spec.md` | in the issue: current, expected, unchanged, data of the defect | question and what to weigh |
| P2 Technical plan | no | short, in the worklog; compatibility mandatory with a migration | full `plan.md` | cause proven with data | no |
| P3 Mockup | no; capture before and after | only if the layout changes | yes | no | no |
| P4 Implementation | yes, the main session writes the code | yes | yes | yes, the main session writes the code | no |
| User approvals | an «ok» on preview | spec (and mockup, if any) together; preview | spec; mockup; preview | `lane:H`; merge; release | the decision |
| Files | issue, worklog, contract | issue, worklog, contract | issue, worklog, contract, spec, plan | issue, worklog, contract | issue, worklog, document |

## Phase after phase

| After | S | M | L | H | R |
|---|---|---|---|---|---|
| P0 | P1 (in the issue) | P1 | P1 | P1 (in the issue) | P1 (question) |
| P1 | P4 | P2 | P2 | P2 | P6 (document) |
| P2 | — | P3 if the layout changes, else P4 | P3 | P4 | — |

P4 never starts on lanes M and L without `spec-ok` or `autonomous`; on L also without `mockup-ok`, and on M without it when there is a mockup. P2 and P3 may go on while the approval waits.
