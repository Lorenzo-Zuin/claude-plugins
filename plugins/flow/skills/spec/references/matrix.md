# Completeness matrix

The dimensions a spec must cover. Every row gets an answer in the spec: «yes, scenario Sn» (one or more) or «not applicable: why». "Not applicable" needs a real reason a reader can check ("no write path: the feature only reads"), never "not needed". The questions are examples to adapt. The project adds its own rows with the `Matrix:` declaration; its rows count like these.

| # | Dimension | Cases and questions |
|---|---|---|
| M1 | **Roles** | Every role of the product, **read from the schema** (`Roles:`), plus non-member, person without an account, and administrator of any console, for every write path. Who sees? Who can write? What does the other one see? |
| M2 | **Entry points** | Screen, notification with actions, deep link, assistant, share from another app, email forwarding, web console, widget. From where does one reach this feature? |
| M3 | **States** | Loading, empty, error with retry, offline, partial, plan limit reached, permission denied, long content, first use, stale data in memory. |
| M4 | **Data lifecycle** | Create, read, update, delete, archive, restore from archive, export, account deletion, sync across devices, double tap, redelivery. |
| M5 | **Input** | Keyboards with only a dot, the other language's decimal separator, pasted text, dictation, length limits, empty fields. |
| M6 | **New values** | Every new value of a closed list, mode or column: who reads it, which screen shows it, what a user with the old app sees. |
| M7 | **Platforms and variants** | Each platform of the product; light and dark theme; each language; large font; small screen; reduced motion; screen reader. What does not work on a platform by choice? |
| M8 | **Side effects** | Notifications, usage or billing records, plan checks, release notes, development data, end-to-end flows, infrastructure map, documentation. |
| M9 | **Compatibility** | Installed apps against the new server; deploy order; minimum version; versioned constants and contracts. |
| M10 | **Twin predicates** | Does a function recompute another one's condition? An equivalence test is needed. |
| M11 | **Security and privacy** | Row-level rules, foreign keys checked by hand, personal data in logs, notifications and prompts. |
| M12 | **Money** | Integer amounts in the smallest unit, currencies, rounding, derived balances, the direction of a movement and who decides it. |
| M13 | **AI** | Prompt or model contract changed? Does every new field have a point in the evaluation? What happens when the model gets that field wrong? |

## How to use it

- Ids: a scenario is `S1`, `S2`…; a criterion that comes from a matrix row without its own scenario is `M<row>` (for example `M3` for an offline state), unique in the contract.
- Lane M: the same rows, one line each. Group the rows that do not apply in one line with a reason each, to keep it short.
- A row that the project rules or docs already answer (for example a platform the product does not ship) is "not applicable" with the source: `file` or section.
- The `reviewer` audits the spec against this file and the project rows (`spec-review.md`).
