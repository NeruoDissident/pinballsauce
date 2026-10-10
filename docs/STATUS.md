# Status

Written 9 October 2026, at the end of the second stage: the engine opened up so that tables can differ in shape, not
only in dress. Three lists: what exists, what was checked and how, and what was not checked. Nothing in the second
list is a guess; anything that is a guess is in the third.

## What changed in this stage

After the first build the owner's verdict was that the engine made "the same table with some variation". He was
right: the arch, the orbits, the slingshots, the lanes, one pair of flippers and a top-to-bottom stack were welded
into every field. This stage took the welds out. The agreed constraint: a field keeps its size (640 by 1040).

- **Fields stand on a grid** (`at: [column, row]`), not only in a stack. A diamond, a row of rooms and a tower with
  a side room are all layouts now. Height, camera, lights, floor, inspect mode and the foes follow a field wherever
  it stands.
- **A field with nothing below it drains into a guided ramp** (a "chute") to a field the layout names. Only the home
  field loses the ball.
- **The standard parts are optional per field**: `standard:{arch, orbits, slings, lanes, flippers}`. A field can be
  a bare room shaped by its own walls.
- **New pieces**: `flipper` (anywhere, any number, on either button), `sling`, `gate` (one-way), `post`, `lane` (a
  single rollover), `lamp` (a status lamp). A scoop can kick the ball where it is told (`eject:[vx, vy]`); a wall can
  be given its own bounce.
- **Three flipper sizes**: mini, standard, long (or a length in units).
- **Ramp speed** is the layout's: `k` (grade), `drag`, `exitV` (the old fixed cap of 520 is now only the default).
- **Rule hooks for plain events**: `rules.on.<event>` for 22 events (a ramp made, a slingshot, a chute ridden, a
  kill, a ball served...), where there were only `onComplete` and `onScoop`. `rules.status` for a table's own lamps.
- **Status lamps**: the multiplier, ball save, kickback, lock, full meter and open Grave can be lights in the floor.
- **The way between fields is worked out** from the ramps and tunnels when a table does not list it.
- **Content names fields by id**, so reordering fields breaks nothing.
- **The code is formatted** (Prettier, 120 columns) and no longer has long lines.
- **A test table, `tables/test-bench`**, that uses all of the above, and **a new test, `tests/reach.mjs`**, that
  says which shots each flipper can make.
- The docs were rewritten round priorities and physics instead of copying skeletons: `NEW_TABLE_CHECKLIST.md`.

Neon Descent itself was **not** changed: it is still the four-district stack, as the owner asked to keep it. The
diamond version is the next stage, as a new table beside it.

## What exists

- **The engine** (`engine/`, 53 modules): physics, flippers, nudge and tilt, camera, the four classes, levelling,
  the spellbook, boons and relics, the party, recruits and the Rally, cards, the Grave, wings, quests, foes, waves,
  bosses, lamps, saves, HUD and menus, audio, the 3D renderer. No table is named anywhere in it.
- **The table format**: layout (data), content (data), rules (hooks), theme (art). Documented in `TABLE_FORMAT.md`.
- **Gravebound** (`tables/gravebound`), rebuilt on the engine from Gravebound 3D 0.21 (commit `aeadf66` of the
  original repo, which was only read, never changed).
- **Neon Descent** (`tables/neon-descent`): its layout and look on Gravebound's physics and rules. A stack.
- **Test Bench** (`tables/test-bench`): five fields on a grid (a diamond with a field joined on top), drawn in the
  engine's default look. Long flippers on one field, mini on another, a second pair half way up a third, a third
  flipper fed by a one-way gate, a room with no arch, a sideways freeway, three chutes, eleven status lamps.
- **Inspect mode** (`engine/app/inspect.js`): pan, zoom, top-down or tilted, layers, a label on every piece with the
  layout line that made it, a coordinate grid in the field's own numbers, a screenshot with a caption.
- **Docs**: `LLM_GUIDE.md` (one page, load first), `TABLE_FORMAT.md`, `RULESET.md`, `NEW_TABLE_CHECKLIST.md`.
- **Tests**: `check` (static), `table` (layout), `replay` (simulation), `soak` (bot), `reach` (flippers).
  **Bundler**: one-file builds.
- Not built, as agreed: a table editor.

## Verified

| What | How | Result |
|---|---|---|
| Gravebound's layout is still the original's | every wall, flipper, sensor, scoop, bank, ramp and tunnel dumped and compared with the recording taken from the original game | identical: 25 sections, 497 wall segments |
| Gravebound still plays as the original | 20 scripted scenarios, seeded random numbers, 25 minutes of game time each; a digest of the whole simulation every 0.1 s compared with the same run of the original | identical in all 20, to the last step and the final score (500 minutes of play) |
| Gravebound still looks as the original | 23 fixed game states screenshotted and compared pixel by pixel with the original's | 22 identical. The title screen differs from the original's (it has an "Inspect table" button and a new version line) and is identical to the title before this stage |
| Neon Descent did not change | its layout dump; 20 scenarios of 10 minutes against its recording; 23 screenshots against the ones taken before this stage | layout identical (570 wall segments); all 20 scenarios identical; all 23 screenshots identical |
| The test bench has no ball traps | a bot played every field: 80 minutes over 4 seeded runs | 0 balls stuck, no errors. Every shot made at least once except the home field's right orbit, which the reach test shows the left flipper can make (2 of 156 flips) and the bot never did |
| Its chutes carry the ball | counted in the same soak | East Chute 14 rides, West Drop 44, East Drop 39 |
| Its ramps can be climbed | made and failed counted per ramp in the same soak | every ramp made far more often than failed: the Whip 8 of 8 entries, the Climb 8 of 10, the Stair 7 of 8, the Bridge 14 of 15, West Way 28 of 28, East Way 56 of 60 |
| Its flippers have shots | `tests/reach.mjs`: 156 timed flips per flipper, 13 flippers | every flipper reaches at least one shot; the third flipper reaches its bank on 19 of 156; the two mini flippers at the foot of the West Wing reach only the Stair and the Pit, a few flips each (a hard room, on purpose) |
| The test bench is repeatable | 20 scenarios, 10 minutes each, recorded, then replayed | identical; this is now its regression recording |
| Status lamps follow the game | the run was forced to 4x, lock lit, full meter, Grave open, 2 s of ball save, and each lamp's state read back and looked at in a screenshot | each lamp showed what it should (2x 3x 4x lit, 5x 6x dark, and so on) |
| The worked-out way between fields is right | the road for all 20 pairs of fields on the test bench printed and read | each is the first shot of a shortest road; "down the drain" where falling is shorter |
| A scoop's own kick goes where aimed | the West Wing's Pit, five times | the ball landed on the left mini flipper each time |
| A home field can lose its arch | a one-field table built at run time with `arch:false` and its own slingshots, 10 minutes of bot play | no errors, 0 stuck, 2 bosses beaten. Not shipped as a table |
| One-file builds are the same game | the replay test (20 scenarios, 5 minutes each) run against all three tables inside `dist/pinballsauce.html` | identical for all three |
| Every module is sound | `npm run check` | passes, 77 modules |
| The grid is drawn right | every field of the test bench looked at in inspect mode, top-down and tilted, and in play on three camera modes | two faults found and fixed on the way (a field's floor ran on under its neighbour; two ramps crossed the flippers) |

The whole suite is `npm run test:full` (about 17 minutes). It passed on the commit this file ships in. The Gravebound
and Neon Descent soaks in it (80 minutes each) also ended with 0 balls stuck.

## Not verified

- **Feel.** Every test ran in headless Chromium with software rendering. Nobody has played the test bench, or
  either other table since this stage, with their own thumbs. The numbers say Gravebound and Neon Descent are
  unchanged; whether the test bench's new parts *feel* right (a mini flipper, a long one, a freeway arriving at 900)
  is yours to judge.
- **Fun.** The test bench is a test. It has one boss, three foes and three errands. It was not designed to be good.
- **Wings on a grid.** Only Gravebound has wings and it is a stack. A wing's court is drawn beside column 0; on a
  table with fields in other columns it may land on top of one. Untried.
- **`rise`, `line`** (where foes rise and line up on a field with no open middle): written, used by no table.
- **Big tables.** The collision search is by bands of y, so a wide table tests more walls per step than a stack
  does; a 20-field table was not tried and nothing was measured. Floor textures grow with every column.
- **Frame rate** on a phone, for any table.
- **Sound.** Nothing was listened to.
- **Fonts.** The test browser had no web fonts.
- **Things the test bench does not do**: a field with no flippers at all; a field with only its own flippers
  (`flippers:false`); negative rows; a `height` lower than the field below; two chutes into one inlane at once.
- **One code path never ran:** a class with its whole spellbook maxed (`bookDone`).
- **Hosting.** GitHub Pages and Vercel should serve the repo as it is; neither was set up or tried.
- **Old saves.** Saves from the original Gravebound do not carry over.

## Left out of this stage, on purpose

Said before starting, and still true:

- Magnets, captive balls, moving targets, a second plunger: new physics. Each is a general engine feature to add
  when a table needs it.
- The plunger stays where it is: the lane up the right side of the home field.
- Performance work for very large tables.
- Walls that move during play. "Movable interior walls" was taken to mean the built-in walls become optional and a
  layout places its own anywhere, which is done.

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
- **A loop ramp calls foes.** Any ramp that starts and ends on the same field calls two foes when made
  ("SOMETHING FOLLOWED YOU ROUND"). That is Gravebound's rule living in the engine; a table that wants a quiet
  loop cannot have one yet.

## How Neon Descent differs from the version made with Astra

It keeps the layout idea and the look; the rules are Gravebound's, as agreed. In particular:

- **The districts are a stack, not a diamond.** That was the engine's limit at the time, and it should have been
  raised with the owner before building, not reported after. The engine can place a diamond now (the test bench
  is one). This table has been left as it is at the owner's request; the diamond is to be a new table.
- **Eight ramps, not ten**, and the buildings are not driven over: the Theatre has a door and a tunnel behind it,
  the Vault is solid with targets on it.
- **A ball riding a freeway past a district counts as being in it for a second or two.** (On a grid table this no
  longer happens: a ball on a ramp belongs to the field it left, then the one it is going to.)
- **The crew** is the engine's: a companion and hired class-and-ability recruits, not six named recruits.
- **Its geometry is Gravebound's**, re-dressed. That is why the two tables shoot alike.

## Known limits of the engine

- A field is 640 by 1040. Its flipper shelf and its way out are fixed. One plunger, on the home field.
- One door per table. The Grave's shape is fixed. Three wing rules.
- One table per page load (changing tables reloads the page).
- Engine banners keep the shared vocabulary ("party", "hero", "relic", "boon", "Level Up", "Main Quest Complete").
  A table can change the words listed under `text` and `names` in `TABLE_FORMAT.md`. Not yet every banner.
- The bot only flips; it does not aim. A soak finds traps and dead ramps, not whether a shot is satisfying. The
  reach test finds shots a flipper can make, not whether a player can make them twice.
- The rune ring (twelve dots round the middle of every field) and the party's guard post between the home field's
  flippers are drawn at fixed places. A layout has to leave them room.

## Suggested next steps, in order

1. Play the test bench. It is the quickest way to feel every new part: a mini flipper, a long one, the third
   flipper in the West Wing, the Whip on the Crown, the Bridge. Say what feels wrong.
2. The diamond Neon Descent, as a new table beside the current one: four districts on `[0,0]`, `[-.5,1]`,
   `[.5,1]`, `[0,2]`, freeways with `drag:.02` and a high `exitV`. Settle its brief first (the checklist, step 0).
3. A single-playfield table, to prove the other end of the range.
4. Then, if a table wants them: magnets, captive balls, moving targets.
