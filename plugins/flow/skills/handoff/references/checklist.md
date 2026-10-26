# What a work item may have to update

For each row: done (with the file) or "not applicable: why", one line each in the worklog under `## Updates`. The project's own list (its contributing rules, the handoff command's checks) adds to this one and wins where it differs.

| Item | When it applies | Where |
|---|---|---|
| Release fragment | the project declares `Release fragment:` and the work item changes what ships | the fragment path; its format file. Check the deploy-order and compatibility fields against the migrations: functions safe to deploy first only if every migration is additive |
| Release notes | the change is visible to the user | in every language the project ships, in the place its fragment or notes folder says |
| Infrastructure map | a service, server function, scheduled job, storage bucket or secret is added or changed | the project's infrastructure document and diagram, in the same commit |
| Docs | the behaviour a doc describes changed, or a text file cites a path or command the branch removed, renamed or changed | the doc itself, found by the docs sweep (`Docs check:` or a search of every text file), not from memory; a decision record is updated in place, not contradicted by code |
| Decision record draft | the plan took an architecture decision | the project's decision records folder; the handoff command numbers it |
| Development data | a new table, column, screen or state needs rows | **checked only**: it was written in P4. Missing rows send the work item back to P4 |
| Device flows | a screen or an action changed | **checked only**: flows change on the bench, never in P6. A missing flow is a `## Needs bench` item |
| Translations | user-facing text changed | every language file the project requires, complete |
| Changeset or version file | the project's CI asks for it | as the project names it |

A row the project marks as checked by its gate (in the reference flow, `seed` and `release_notes` rules in the gate config) still gets its line: the gate checks presence, the line says why.
