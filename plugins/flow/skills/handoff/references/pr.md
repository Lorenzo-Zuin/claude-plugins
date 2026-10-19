# Filling the pull request

## Template

Use the file of `PR template:`; without it, the repository's own pull request template; without either, the sections below. Treat the template as a layout to fill: keep its headings and markers, and remove only the comment hints you have replaced.

## What goes where

- **First lines**: the work item number and lane, then the closing keyword the project's rule chooses (in the reference flow: `Closes #N` for a work item that touches only the repository, `Refs #N` for one that ships in the app, closed at release). Without a project rule, `Refs #N`.
- **Status markers** (`<!-- flow:status -->` … in the reference flow): leave them as the template has them. Only the project's scripts write between them.
- **What changes**: three lines a person reads first; what the user sees, not the files.
- **Before and after**: the images in `Evidence:`, linked from the branch at the pushed commit, both themes. Without screens: "no screen changes".
- **Verified**: one line per criterion with outcome and evidence link, from the contract, never from memory.
- **To verify**: the `## Needs bench` items left, and the manual test script for the preview.
- **Waived criteria**: none, or each one with who, why, the risk and when it is recovered.
- **Release**: the fragment path, what installed apps do, console and website effects.
- **Receipt**: fingerprint and steps from the receipt the full check wrote.
- **Not verified**: what, why, where it will be verified. Never leave it out to look complete.

## Title and language

Follow the repository's convention for the title (in the reference flow: conventional commit style, in the project's language). The body follows the project's language rules; identifiers, commands and paths stay as they are.

## After opening

Watch the checks and the reviews (SKILL.md step 9). Reply only when a round resolves, hits a blocker, or needs the user.
