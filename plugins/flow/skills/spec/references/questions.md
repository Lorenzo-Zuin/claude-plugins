# Interviewing the user

## Rules

- At most **five** questions per round. Ask the ones that change the most scenarios first.
- **Multiple choice**, two to four options, the recommended one first, marked, with the reason in one line. The user may always answer in their own words.
- **Never ask what code or docs answer.** Read first; a question the code answers costs the user's time and trust. If code and docs disagree, say so and ask which one is right.
- **Never ask permission for what the flow already decides** (lane conditions, gates, label rules).
- One question, one decision. No compound questions.
- Product choices go to the user; technical choices with low cost if wrong you decide and write as `decision: what, why, cost if wrong`.
- With the `AskUserQuestion` tool, use it; otherwise write the questions as `Q1`, `Q2`… in the chat and in the issue comment, each with `(consigliata: <answer>)` in the project's language.
- In autonomous mode (`autonomous` label) ask nothing: take the recommended answer, write it in `Decisions`, with the cost if wrong.

## Question bank by matrix row

Adapt; ask only when the row is partial or missing.

| Row | Typical question | Usual recommended answer |
|---|---|---|
| M1 Roles | "Can a read-only member do X, or only see the result?" | the narrowest right that serves the request |
| M1 Roles | "When A changes it, what does B see, and when?" | B sees it on the next open; no push unless asked |
| M2 Entry points | "Must X also be reachable from the notification / the console / the assistant?" | only the entry point the request names; the others out of scope, written |
| M3 States | "With no network, does the action wait and retry, or fail with a message?" | the behaviour the app already has for similar actions (cite it) |
| M4 Lifecycle | "When the item is deleted, what happens to what depends on it?" | the same as the closest existing feature (cite it) |
| M5 Input | "Is an empty value allowed, or required?" | required when the rest of the form requires it |
| M6 New values | "What does a user with the previous app version see for the new value?" | a neutral fallback that never crashes |
| M7 Platforms | "Must it work on every platform in this work item?" | the platforms the request names; the others out of scope |
| M8 Side effects | "Does this need a release note?" | yes when the user of the app can see the change |
| M9 Compatibility | "Can old apps keep working until they update?" | yes: additive change only |
| M12 Money | "Who decides the direction or the rounding?" | the rule the domain code already applies (cite it) |
| M13 AI | "What if the model gets this field wrong?" | the user can correct it before it counts |

## After the answers

- Write each answer in the spec's `Decisions taken` with who and when.
- An answer that opens a new dimension (a new role, a new screen) may raise the lane: check the lane conditions again.
