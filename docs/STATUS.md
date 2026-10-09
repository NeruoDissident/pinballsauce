# Status

Written 9 October 2026, at the end of the first build. Three lists: what exists, what was checked and how, and what
was not checked. Nothing in the second list is a guess; anything that is a guess is in the third.

## What exists

- **The engine** (`engine/`, 53 modules): physics, flippers, nudge and tilt, camera, the four classes, levelling,
  the spellbook, boons and relics, the party, recruits and the Rally, cards, the Grave, wings, quests, foes, waves,
  bosses, lamps, saves, HUD and menus, audio, the 3D renderer. No table is named anywhere in it.
- **The table format**: layout (data), content (data), rules (hooks), theme (art). Documented in `TABLE_FORMAT.md`.
- **Gravebound** (`tables/gravebound`), rebuilt on the engine from Gravebound 3D 0.21 (commit `aeadf66` of the
  original repo, which was only read, never changed). Everything on its main branch came across, including the
  parts still under test (the guard between the flippers).
- **Neon Descent** (`tables/neon-descent`): its layout and look on Gravebound's physics and rules.
- **Inspect mode** (`engine/app/inspect.js`): pan, zoom, top-down or tilted, layers, a label on every piece with the
  layout line that made it, a coordinate grid, a screenshot with a caption giving field, centre and zoom.
- **Docs**: `LLM_GUIDE.md` (one page, load first), `TABLE_FORMAT.md`, `RULESET.md`, `NEW_TABLE_CHECKLIST.md`.
- **Tests**: `check` (static), `table` (layout), `replay` (simulation), `soak` (bot). **Bundler**: one-file builds.
- Not built, as agreed: a table editor. Tables being data is what a later editor, and player-made tables, would stand on.

## Verified

| What | How | Result |
|---|---|---|
| Gravebound's layout is the original's | every wall, flipper, sensor, scoop, bank, ramp and tunnel dumped from the original build and from the engine build, and compared | identical: 25 sections, 497 wall segments |
| Gravebound plays as the original | 20 scripted scenarios (all four classes, every companion, bot play, hand-scripted flips, dev keys, menu picks, save and continue, tilts, boss fights and interrupts), seeded random numbers, 25 minutes of game time each; a digest of the whole simulation every 0.1 s compared with the same run of the original | identical in all 20, to the last step and the final score (500 minutes of play) |
| Gravebound looks as the original | 23 fixed game states screenshotted in both builds, compared pixel by pixel | 22 identical. The title screen differs: it has an "Inspect table" button and a new version line |
| One-file builds are the same game | the replay test run against `dist/gravebound.html` and against both tables inside `dist/pinballsauce.html` | identical in all 20 scenarios each |
| Neon Descent has no ball traps | a bot played every field: 320 minutes over 8 seeded runs (and 80 more in the final suite) | 0 balls stuck, no errors, every shot on the table made at least once in the long run |
| Neon Descent's ramps can be climbed | made and failed counted per ramp in the same soak | every ramp made more often than failed (the two freeways: 107 of 162 entries and 77 of 84); a freeway ride takes roughly 1 to 5 s depending on entry speed, and needs the same entry speed as a one-field ramp |
| Neon Descent is repeatable | 20 scenarios, 10 minutes each, recorded, then replayed | identical; this is now its regression recording |
| Every module is sound | `npm run check`: parses, every import resolves, no undefined name, tables import only the api | passes, 72 modules |
| Inspect mode works | driven in headless Chromium at desktop and phone sizes: open, pan, zoom, tier select, top-down and tilted, layers, screenshot | works; screenshots read back and looked at |

The whole suite is `npm run test:full` (about 12 minutes). It passed on the commit this file ships in.

## Not verified

- **Feel on real hardware.** Every test ran in headless Chromium with software rendering. The numbers say Gravebound
  is the same game; whether it *feels* the same under your thumbs is yours to judge. Nobody has played either table
  on a phone or with a real GPU in this build.
- **Frame rate.** Neon Descent draws more than Gravebound (a city of towers, eight ramps). Unmeasured on a phone.
  If it is heavy, Options has three quality levels; the towers are four draw calls and easy to thin.
- **Sound.** The audio code is the original's, unchanged, but nothing was listened to. Neon Descent's per-district
  lead voices (`theme.music`) are chosen on paper.
- **Neon Descent as a game.** Only a bot has played it. Its numbers are Gravebound's, so it should balance like
  Gravebound, but nobody has judged whether it is fun, whether the campaign reads well, or how a full run to the
  God-Machine goes without dev keys. Bosses were reached and beaten in the replay scenarios, with dev keys skipping
  steps.
- **Fonts.** The test browser had no web fonts, so lettering was checked in fallback faces only.
- **One code path never ran:** a class with its whole spellbook maxed (`bookDone`). No scenario gets that far.
- **Hosting.** GitHub Pages and Vercel should serve the repo as it is (relative paths, no build), but neither was
  set up or tried.
- **Screenshot saving inside embedded viewers.** Some block downloads silently, so the screenshot is also shown on
  screen to be saved by hand, and the published artifact saves through the viewer's own download prompt. Neither
  path was tried on a phone or inside the artifact viewer; only the plain browser download was exercised.
- **Old saves.** Saves from the original Gravebound do not carry over (the engine uses its own storage names).

## Deliberate differences from the original Gravebound

- The title menu has an "Inspect table" button; the version line says "on the engine".
- Saves live under `pinballsauce.gravebound.`.
- Three pieces of dead code were dropped (`ability()`, `buildSprites()`, a shadowed first copy of `runeTex()`).
- Nothing else. Where the original had a quirk, the quirk is kept (see below).

## Found on the way, and left alone

- **Wave banners never show their campaign's name.** The original looks the name up with a key that is never set,
  so every wave says "They Come". The engine keeps that; the three written banners are preserved in Gravebound's
  `content.waveNames` if you want them back (one line in `engine/rules/waves.js`).
- **A full meter announces an ability that no longer exists.** At 100 power the game floats "AEGIS READY" (or the
  class's equivalent), but what a full meter does is the Rally. Kept as the original has it.

## How Neon Descent differs from the version made with Astra

It keeps the layout idea and the look; the rules are Gravebound's, as agreed. In particular:

- **The districts are a stack, not a diamond.** The engine stacks fields top to bottom: Helix Citadel, the Data
  Cathedral, Kabuki Aftermarket, the Undercity. The road network keeps the diamond's routes (the Undercity reaches
  both Kabuki and the Cathedral; both reach the Citadel) by letting two freeways run along the cabinet rim and skip a
  district. Falling is linear: the Citadel drops to the Cathedral, then Kabuki, then the Undercity.
- **Eight ramps, not ten**, and the buildings are not driven over: the Theatre has a door and a tunnel behind it,
  the Vault is solid with targets on it.
- **A ball riding a freeway past a district counts as being in it for a second or two** (the lamps and the wave
  clock follow the ball's position). Harmless, but visible.
- **The crew** is the engine's: a companion (BRICK, PATCH or RAZOR) and hired class-and-ability recruits, not the
  six named recruits with their own perks.
- **Its geometry is Gravebound's**, re-dressed: every field is assembled from parts of Gravebound's fields. That is
  why it could be trusted without a human playing it, and it is also why the two tables shoot alike. Giving it
  shots of its own is the obvious next step for that table.

## Known limits of the engine, this pass

- Fields are 640 by 1040 and stack top to bottom; every field has the standard arch, orbits, slingshots, flippers
  and lanes; the bottom field carries the plunger. One door per table. The Grave's shape is fixed. Three wing rules.
- One table per page load (changing tables reloads the page).
- Engine banners keep the shared vocabulary ("party", "hero", "relic", "boon", "Level Up", "Main Quest Complete").
  A table can change the words listed under `text` and `names` in `TABLE_FORMAT.md`: its title, the classes,
  abilities, companions, boons and relics, the Grave's words, the coin's name. Not yet every banner.
- The bot only flips; it does not aim. A soak finds traps and dead ramps, not whether a shot is satisfying.

## Suggested next steps, in order

1. Play both tables on your phone and your desktop. Tell the next session what feels off, with inspect screenshots.
2. Decide whether Neon Descent should get shots of its own, now that the parts bin has proved the format.
3. Turn on GitHub Pages for the repo (it serves as it is).
4. A third table from the checklist, with a different LLM, as the real test of the docs.
