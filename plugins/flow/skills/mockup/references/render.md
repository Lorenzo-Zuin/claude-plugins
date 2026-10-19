# From HTML to images

## With the project's command

If `Mockup render:` is declared, run it on each changed file and use what it writes. It must give one image per frame and theme at the reference width, named after the frame's caption; if it does not, fall back to the script below for that file and say why in the worklog. When it prints a SHA-256 next to each image, pass that file to `Record evidence:` as it is: re-encoding it changes the fingerprint the contract keeps. A file with no captions comes out as one image of the whole page: split it with the script below if the critic needs the frames one by one.

## Without it

Chromium and Playwright: use the copy the project already has (a `playwright` folder named by the project's docs) or a global one (`npm ls -g playwright`), never a download in the middle of the work. If neither exists, say so, and ask the user before installing anything.

Write the script in a folder of the session scratchpad, not in the repository. A global Playwright is not found by `import` from there: link it first (`ln -s <global node_modules> node_modules` in that folder).

```js
// render.mjs <html> <outDir> <frameSelector> <width>
import { chromium } from 'playwright';
const [html, outDir, selector = 'body > div', width = '390'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2 * Number(width) + 200, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(`file://${html}`);
await page.evaluate(() => document.fonts.ready);
const frames = await page.$$(selector);
for (const [i, frame] of frames.entries()) await frame.screenshot({ path: `${outDir}/frame-${i}.png` });
await browser.close();
```

- Wait for the fonts: a render with a fallback font is not a render of the mockup. If the fonts come from the network and the network is closed, say so next to every image.
- The frame selector is the outer element of each phone frame; read it from the file (a class such as `.frame`, or the element with the device width in its style). Name each image after the frame's state and theme, not its index: the frame's caption in the file says which is which.
- Reduce to WebP 540 px wide: `cwebp -resize 540 0`, `sharp` if the project has it, or Python Pillow (`Image.resize((540, h * 540 // w)).save(path, 'WEBP', quality=80)`). The images are for judging; measures come from the HTML, never from the pixels.
- Mockups may carry design annotations (dashed outlines, arrows, notes): tell the critic they are not part of the screen.
- Look at every image before the critic does. A cut frame, a missing font or a blank area is a render problem: fix it first.

## Where they go

The `Evidence:` folder of the work item, committed on the branch. Link them in the issue from the branch (raw file URL of the hosting service). In a private repository only people with access see them: say so if the user may read from another account.
