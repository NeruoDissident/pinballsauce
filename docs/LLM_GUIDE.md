# pinballsauce: the one-page guide

Read this first, every session. It tells you what the project is, where things live, the house rules, and which
other doc to open for the job in hand. Do not read the whole codebase: read this, then the one doc the job needs,
then only the files that doc names.

## What this is

The owner's kit for making pinball tables without saying the basics twice. It has three parts:

1. **`docs/PINBALL.md`: what a pinball table is, and how his work by default.** Lights on every goal, state shown
   on the playfield, goals that build, a fair launch, several shots per flipper. Guidelines, not law: how many of a
   thing and where it goes is each table's call. **Any job that makes or changes a table starts there.**
2. **Shared code for the things that must behave the same everywhere**: how the ball, the flippers and the plunger
   feel, what a lit, dim or flashing light means, what a shot scores, the camera, saves, the HUD.
3. **Optional game systems, each a switch**: classes, levels, health, enemies, bosses, quests, side quests, a party
   and its Rally, cards, coin, the Grave, wings. They were built for Gravebound. **None of them is core.** A table
   switches on the ones it wants (`uses` in its `table.js`, or simply by giving the data); a table with none of
   them is a plain pinball table and is complete.

A table is data plus a few small hook functions plus art. The code that reads it is called "the engine" below, for
want of a shorter word; read that as "the shared parts", not as a rule book.

- No build step. Plain ES modules, opened through any static server (`npm start`, GitHub Pages, Vercel).
- Three.js r128 is vendored in `vendor/three` and loaded as classic scripts, so `THREE` is a global.
- Six tables ship. `tables/starfall`: one playfield, every optional system off: the reference for plain pinball.
  `tables/gravebound`: three levels, every optional system on: the reference for the RPG kind.
  `tables/neon-descent`: a second themed table with everything on. `tables/test-bench`: no art, uses every
  *layout* feature (a grid of fields, a field with no standard parts, three flipper sizes, drain ramps).
  `tables/crush-hour`: a themed table on a grid (three fields as a heart), every system on, and the reference
  for re-dressing the shared code's words and effects (`text.words`, `theme.fx`, its own enemy figures).
  `tables/judgment`: Heaven, Earth and Hell, every optional system off, custom goals in rules. Launches on the
  middle field (`ST`); only the bottom field (`BT`) loses a ball. One ascent ramp and two transfer scoops.
- Still ahead, not started: a front-end editor (inspect mode is its first half), and table size as a setting.

## Map

```
index.html                 table picker
engine/api.js              the ONLY file a table imports from (re-exports the whole engine)
engine/table/              layout.js  the level model (fields on a grid, Grave, wings; sizes; tierOf) and the feel
                                      presets (FEELS: gravity, bounce, kicks, the flipper's stroke, plunger, ramps)
                           build.js   layout data -> walls, flippers, sensors (piece types live here)
                           parts.js   standard parts a field gets unless it says not (arch, orbits, slings, flippers,
                                      lanes) and the cabinet parts it always gets (shelf, way out)
                           geometry.js primitives (seg, bank, bumper, hole, mouth, rail)
                           content.js a table's content as live bindings; the defaults a table may override: text
                                      (TEXT0), point values (POINTS0), rule numbers (TUNE0), effects (FX0); the
                                      word table (tr); and USE: which game systems this table has switched on
engine/physics/physics.js  how the ball moves. Its numbers come from the table's feel preset.
engine/rules/              one file per subject: classes, spells, perks, party, rally, tavern (recruits), foes, waves,
                           bosses, quests, lamps, score, powers, grave, wings, events (what a hit is worth), ball,
                           choices (cards), run (start, save, campaign plan), step (the per-frame order), names
engine/render/             3D: scene, floor, frame, camera, figures + figurekit (stock foes), actors, wings,
                           defaults (what is drawn when a theme says nothing), world (heights)
engine/ui/                 page.js + page.css (markup, HUD), ui.js (menus), audio.js, help.js
engine/app/                shell.js (boot, loop, input, dev keys), inspect.js (inspect mode)
tables/<id>/               index.html, main.js, table.js, layout.js, content.js, rules.js, theme/
tests/                     check.mjs (static), table.mjs (layout), replay.mjs (simulation), soak.mjs (bot),
                           reach.mjs (which shots each flipper can make), standards.mjs (a table against
                           PINBALL.md), switches.mjs (each game system off in turn), mobile.mjs (a phone), golden/
tools/bundle.mjs           one-file builds: a table, or all of them behind a picker (engine/app/picker.js)
manifest.webmanifest, sw.js, assets/icons/   what makes the hosted site an installable app that plays offline
docs/                      this guide, PINBALL, TABLE_FORMAT, RULESET, NEW_TABLE_CHECKLIST, STATUS
```

## Which doc for which job

| Job | Open |
|---|---|
| Make a new table ("today I want a space pinball game") | `PINBALL.md`, then `NEW_TABLE_CHECKLIST.md`, then `TABLE_FORMAT.md` |
| Change a table's layout, words, goals, art | `PINBALL.md` (what it should still have), `TABLE_FORMAT.md` and that table's files |
| Make a table faster, bouncier, easier; change how its flippers hit | `TABLE_FORMAT.md`, "`feel`" |
| Change what a ramp, a target or a jackpot is worth on a table | `TABLE_FORMAT.md`, "`points`" |
| Change a rule number on a table (ball save, tilt, combo, wave pacing) | `TABLE_FORMAT.md`, "`tune`" |
| Change or silence the engine's sounds, effects, light colours or words on a table; give it voice lines | `TABLE_FORMAT.md`, "Nothing the shared code does is forced on a table" |
| Add or drop a game system on a table (health, enemies, classes...) | `TABLE_FORMAT.md`, "`uses`" |
| What does an optional system do? What is a Rally, a ward, a lamp colour? | `RULESET.md` |
| Change how every table plays | `RULESET.md`, then the one file in `engine/rules/` it names |
| What is finished, what is verified, known limits | `STATUS.md` |

## The level model (you need this for everything)

- A **field** is one playfield: 640 wide, 1040 deep, flippers at its own y 900. That size is fixed for now.
- Fields stand on a grid: `at: [column, row]` in the layout. Rows run down the table. A layout that gives no `at`
  is a plain stack, top first. On the whole table a field's corner is at x `690 * column`, y `40 + 1040 * row`.
- Same column, next row: the two fields are **joined** (the upper one's drain falls into the lower one's arch).
- The **home field** is the last one listed: the real drain and the Grave under it
  if the table has one. Exactly one field has `shooter:true` and a shooter piece; its index is `ST`. It may be above the bottom field (`BT`), so the launch and final drain can be on different fields.
- Any other field with nothing joined below it drains into a **drain ramp** (a "chute") to a field the layout names.
- A **tier** is an index: fields `0..NM-1` in the order listed, then the Grave (`NM`; the slot is kept even on a
  table without one), then wings (`NM+1..`).
  Layout and content name fields by id; the engine and `rules.js` work in indices (`FIELD_INDEX.<id>`).
- Inside a field, points are local: `[x, y]` from the field's own corner. Points that cross fields (ramp paths,
  tunnel waypoints) are written `['#fieldId', x, y]`.
- Each field gets the **standard parts** (arch, orbits, slingshots, lanes, a pair of flippers) unless its layout
  switches them off with `standard:{...}` and places its own walls, gates, posts, slingshots and flippers.
- Physics is one plane. Height is drawn, never simulated. `tierOf(y, x)` and `elev(y, x)` take x as well as y.

## House rules

Two kinds. The first kind is hard because code or the tests break otherwise. The second kind is how the owner
wants the work done.

**Hard (things break):**

1. **A table imports only from `engine/api.js`** (its `main.js` also imports the shell to boot), and never from
   another table. The engine never imports from a table. `npm run check` fails on any of these.
2. **Base modules import nothing upward.** `core/util.js`, `core/state.js`, `table/layout.js`, `table/content.js` are
   read by everything; they must not import rules, render or ui (ES module evaluation order breaks otherwise).
3. **Nothing reads layout or content bindings while a module is being evaluated.** They are filled by `initGame()`.
4. **Art never calls `Math.random`.** Use `hash(n)` from the api. The simulation's random numbers are replayed in
   tests; art that consumes them shifts the game.
5. **The engine never names a table.** No `if(table==='x')`. If a table needs something the shared code cannot do,
   the shared code gains a general feature that any table can switch on with data.

**How the work is done:**

6. **`PINBALL.md` is the default for everything a request does not say.** Do not make the owner repeat it. Do not
   treat it as law either: if he asks for something that contradicts it, build what he asked for.
7. **Nothing is core, and nothing is forced.** Never tell the owner a table must have a system (a Grave, bosses, a
   health bar, classes). If a table cannot run without one, that is a bug in the shared code: fix it there, behind
   the switch. The same goes for anything the shared code does on its own: a sound, an effect, a word, a colour, a
   number. Each is a default with a name, and a table changes it or switches it off (`theme.sounds`, `theme.fx`,
   `theme.lampCols`, `text.words`, `tune`, `points`, `feel`). If you find something a table cannot change, do not
   work round it in the table: give it a named default in the shared code, leaving every existing table as it is.
8. **Layout and content are data; a table's own behaviour goes in its `rules.js` hooks** (`onComplete`, `onScoop`,
   `on`, `lamps`, `status`, `objective`, `bonus`, `tick`, `init`, `newRun`).
9. **One table's feel is that table's.** To make a table faster or bouncier, set its `feel` (a preset, or a preset
   with single numbers changed). Do not edit a shared number to suit one table: that changes every table.
10. **Changing a shared default changes every table**, and the recordings will say so. That is allowed when it is
    what the owner wants; say it plainly and re-record on purpose.
11. **A layout is judged by the priorities in the checklist**, in order: the ball never sticks, it always comes back
    to a flipper, every shot can be made, the table can be read. `soak`, `reach` and `standards` report on them.
12. **Build the shape the owner asked for.** If you think another would play better, ask; do not substitute. Ask
    too when a request leaves the shape or the optional systems unclear. Ask nothing `PINBALL.md` already answers.
13. **Tell the owner before a large change**, with what and why. He wants verified over guessed.

## Checking your work

```
npm run check          static: every module parses, every import resolves, no undefined names   (seconds)
node tests/table.mjs --table <id>      the layout still builds the recorded table
node tests/replay.mjs 5 --table <id>   the simulation still matches the recording, step for step
npm run soak -- <id>       a bot plays every field: stuck balls, shots never made, ramp failures
npm run reach -- <id>      every flipper, every timing: which shots it can make, which nobody can
npm run standards -- <id>  the table against PINBALL.md: fair launch, a light on every goal and shot, state lamps
npm run switches -- <id>   the table with each of its game systems off in turn: does anything throw?
npm run mobile -- <id>     the site as a phone sees it: installable, touch controls, no stretch, no dark picture
npm test               check + layout + 5-minute replay, every table
npm run bundle -- all  dist/pinballsauce.html (one file); check it with  node tests/replay.mjs 5 --url dist/pinballsauce.html#gravebound
```

- The recordings are an alarm, not a law. A replay failure means you changed how that table plays. If you meant
  to, re-record with `--record` and say so in the commit. If you did not, find it: the failure names the scenario
  and the second it first differs.
- One recording is kept for good: `gravebound.flat.replay.json` was made from the original Gravebound, which had
  the flat flipper. `node tests/replay.mjs 25 --feel flat` still has to match it; `test:full` runs it.
- The flipper's stroke was chosen by the owner, by playing. `reach` rolls a ball down the bat with the button
  held; a player also taps, holds and passes, so `reach` understates what the flipper can do. A shot `reach` does
  not find is a question for a person, not a verdict. For anything about feel, give the owner something to play
  early; do not spend an hour testing round him.
- `standards` prints notes, and notes never fail: they are guidelines the table does not follow, for someone to
  decide whether that is on purpose.
- Passing every check means the table is not broken. Whether it is good is judged by a person playing it.
- Look at the table: `tables/<id>/index.html?inspect` opens inspect mode (pan, zoom, top-down, piece labels with the
  layout line that made each piece, a coordinate grid, a screenshot button). In the game, press `I`.
- Dev keys in play (toggle with the backtick key): digits drop the ball on a field (then the Grave, then wings),
  `G` opens the Grave (if there is one), `B` adds a ball, `N` finishes the current main-quest step.

## Vocabulary

**field** one playfield with its own flippers. **home field** the last one listed: real drain. **launch field**
the one marked `shooter:true`, with the plunger. **joined**
two fields one above the other in a column. **tier** field, Grave or wing by index. **piece** one entry of a
field's `pieces`. **standard part** what a field has unless it says not. **mouth** a ramp entrance. **rail / ramp**
the path a ball rides from a mouth. **drain ramp / chute** the ramp a field with nothing below it drains into.
**scoop / hole** a
pocket that holds the ball, pays, and ejects or tunnels it. **bank** a row of drop or standup targets. **set** a
group of rollover lanes lit as one. **shot** anything addressable by id: a ramp, scoop, bank, bumper group, spinner,
lane set, statue or orbit; quests and lamps talk about shots. **insert** the arrow or dot painted for a shot.
**lamp** the lit state of an insert. **status lamp** a `lamp` piece: a light in the floor showing the game's state
(2x, ball save, lock). **the Grave** an optional room under the home field that catches a lost ball once it
is open. **wing** an optional side room with its own flippers. **Rally** party multiball. **switch** one entry of
a table's `uses`: a game system the table has or has not. **feel** a table's ball-movement preset.
