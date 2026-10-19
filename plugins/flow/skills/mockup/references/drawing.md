# Drawing the mockups

## Files and names

- Mockups live in the folder of `Mockups:`. Follow the naming rule that line gives; without one, name a new file `M<issue>-<Name>.html` and a second screen of the same work item `M<issue>b-<Name>.html`.
- One self-contained HTML file per screen or per small group of states of the same screen. Both themes in the same file, side by side, each frame at the reference device width and height of `Mockups:`. Copy the structure, the variables and the components of the newest mockups in the folder, never older ones: the newest show the current visual system.
- Changing an existing mockup: edit it in place and write in the worklog what changed and why. If other work items rely on the old version, say so in the issue comment.
- Only the visual system's tokens and components; no colour, size, duration or curve that the system does not define. Texts follow the project's text rules and are the real texts, in the main language, never lorem ipsum.

## States to draw

Every row that applies, each one as its own frame, both themes:

| State | What it shows |
|---|---|
| content | the normal case with realistic data from the development data of the plan |
| loading | the skeleton with the same geometry as the content, never a zero or an empty list |
| empty | known to be empty, with the action that fills it |
| error | what failed in the user's words, with retry; the data already read stays visible |
| long content | longest names and largest amounts the plan allows; lists with at least three items |
| plan limit | what the user sees at the limit of their subscription plan, if the feature has one |
| first use | the first time, with any explanation the spec asks for |
| permission denied | the way forward without the permission, if the feature needs one |
| other roles | what each other role of the spec sees on the same screen |

The worklog lists every state as drawn (file and frame) or "not applicable: why".

## Paths

For each main scenario of the spec, write the path as a list of frames with the action between them, and the tap count:

```text
S1 (3 taps): Home → [tap «Share with»] → M142 people → [tap Anna, tap «Confirm»] → M142b confirmation
```

The count must equal the spec's. Every screen of a path has an exit and a back that returns to the previous screen of the path.
