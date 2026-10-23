# The bench lock and the bench check

Emulator, local server stack, development server of the app and phone are shared by every session on the bench machine. The lock says who uses them; the check says whether they are ready. The project's `Bench:` line names the command of each action, and `Acceptance:` its expiry and rules. The names below are roles, not commands.

## The lock

| Action | When |
|---|---|
| status | before taking it, to say who holds it and what runs |
| take (for a session) | at step 1, before the check; it puts the device back in its normal state (theme, font size, screen) |
| wait | the lock is held by someone else: run it in the background (the session's background command, not a loop in the session); it queues, polls inside the command and ends with the lock taken, in order of arrival |
| renew | only if the project has one and `Acceptance:` asks for it; where the lock lives while a bench command runs and frees itself after an idle time, never renew it by hand |
| release | at the end of the run, also after a stop or an error |
| force release | only when the user asks in this session; it asks for confirmation and logs who forced it |
| take for the user | never from a session: it is the user's lock for manual tests |

- The holder is the session. A subagent started by this session runs in the same session, so the bench commands it runs renew this session's lock instead of taking a new one. If a command says the lock belongs to someone else, stop: never take it back by force.
- Held by the user (a manual test) or by another session: say who and since when. With a wait action, run it in the background and go on with work that does not need the device; the session resumes when the command ends with the lock. Without one, stop. Never wait in a loop in the session, and never hold the lock while waiting for a person: free it, or let the idle time free it.
- Run the bench commands one after the other without long pauses: where the lock frees itself after an idle time, a pause longer than that loses it. A lock lost in the middle (forced, expired) stops the run: what ran after the loss is not evidence; wait for it again.

## The check

Run the `Bench:` check with the variant the criteria need (the development build by default). It runs its steps in order and stops at the first problem, printing the problem and the remedy. The usual order, from the reference project: lock, device (reachable, on for less than the limit, enough free memory), app in the foreground, installed build matching the checkout, development server, local server stack with its functions, seed matching the branch and the local mail catcher, device state (airplane mode off, nothing covering the app), old app for the old-app check.

- A step marked skipped with an option is for diagnosis only: never record evidence from a run whose check skipped a step.
- A step the project reports as not verifiable yet (the old app before it exists) is not a problem: the criteria that need it become `not_verifiable_here` with the place and time `Acceptance:` gives.

## Remedies

Yours to apply, then run the check again:
- the device's normal state (airplane mode off, close another app on the **emulator**, reopen the app from the development server);
- a cold boot of the **emulator** when it has been on past the limit;
- the reset of the local database with the bench command, when `Acceptance:` allows it; then the sign-in on the device is redone, and you say so in the report;
- recording a build you just installed, with the command the remedy names.

Not yours: stop, free the lock, and give the user the remedy word for word:
- anything `Acceptance:` or the project's rules reserve to the user (starting the local server stack, installing dependencies, container commands);
- anything on a personal phone beyond the project's app;
- a rebuild of native code when the project's rules say the user starts it;
- a remote environment, ever.

If the same step fails twice after its remedy, stop and report the two outputs.
