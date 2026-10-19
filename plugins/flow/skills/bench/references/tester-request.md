# The request to `device-tester`

Call `device-tester` (`flow:device-tester` as a plugin) with paths and ids, never pasted spec text. One request per group of criteria that share users and data; one device job at a time.

```text
Work item #<issue>, branch <branch> at <sha>. Phase P5, device part.
Project keys: <file with the flow keys>; read `Bench:`, `Acceptance:`, `App id:`, `Evidence:`.
Lock: held by this session since <time>; renew it if the job runs past <time>. Do not take or release it.
Device: <serial> (emulator by default). Personal phone: <not allowed | allowed for C3 only, asked by the user at <time>>.
Variant of the app: <dev | preview>.
Criteria:
- S2 (`maestro`, `screen:light`, `screen:dark`, `screen:font-large`): run flows <flows or tags>; capture <screens> in the variants <list>.
- S4 (`simulated_user`): new flow to write: <what it does>, users <A and B from the development data>, data prefix <prefix>.
Touch targets: <screens>.
Evidence folder: <path>. Names: <criterion>-<screen>-<variant>.<ext>.
Allowed resets: <none | the local database with the bench command, before S4>.
Return: per criterion PASS / FAIL / NOT RUN with file paths and SHA-256; environment problems; what could not run and why.
```

- Name the device. Without a named device the tester uses the emulator and refuses the phone.
- Name the allowed resets one by one; a reset not in the request is not allowed, even when `Acceptance:` allows it.
- When a criterion needs a flow that does not exist yet, say what the flow proves and from which data; the tester writes it from the live screen.
- After the answer, open every file it lists before you record anything.
