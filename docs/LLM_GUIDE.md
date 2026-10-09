# pinballsauce: the one-page guide

Read this first, every session. It tells you what the project is, where things live, the house rules, and which
other doc to open for the job in hand. Do not read the whole codebase: read this, then the one doc the job needs,
then only the files that doc names.

## What this is

A pinball **engine** and the **tables** that run on it. The engine holds everything that makes two tables feel like
the same manufacturer built them: the ball, the flippers, nudge and tilt, the camera, the four classes, levelling,
the spellbook, the party and the Rally (party multiball), cards, the Grave, wings, quests, foes, bosses, saves, the
HUD. A table is data plus a few small hook functions plus art.

- No build step. Plain ES modules, opened through any static server (`npm start`, GitHub Pages, Vercel).
- Three.js r128 is vendored in `vendor/three` and loaded as classic scripts, so `THREE` is a global.
- Two tables ship: `tables/gravebound` (the reference: every feature of the format is used there) and
  `tables/neon-descent` (the same rules re-dressed: the shortest example of a second table).

## Map

```
index.html                 table picker
engine/api.js              the ONLY file a table imports from (re-exports the whole engine)
engine/table/              layout.js  the level model (fields, Grave, wings; sizes; tierOf)
                           build.js   layout data -> walls, flippers, sensors (piece types live here)
                           parts.js   standard parts every field gets (arch, orbits, slings, flippers, lanes)
                           geometry.js primitives (seg, bank, bumper, hole, mouth, rail)
                           content.js a table's content as live bindings + default text (TEXT0)
engine/physics/physics.js  the feel of the ball. Do not touch without re-recording on purpose.
engine/rules/              one file per subject: classes, spells, perks, party, rally, tavern (recruits), foes, waves,
                           bosses, quests, lamps, score, powers, grave, wings, events (what a hit is worth), ball,
                           choices (cards), run (start, save, campaign plan), step (the per-frame order), names
engine/render/             3D: scene, floor, frame, camera, figures + figurekit (stock foes), actors, wings,
                           defaults (what is drawn when a theme says nothing), world (heights)
engine/ui/                 page.js + page.css (markup, HUD), ui.js (menus), audio.js, help.js
engine/app/                shell.js (boot, loop, input, dev keys), inspect.js (inspect mode)
tables/<id>/               index.html, main.js, table.js, layout.js, content.js, rules.js, theme/
tests/                     check.mjs (static), table.mjs (layout), replay.mjs (simulation), soak.mjs (bot), golden/
tools/bundle.mjs           one-file builds: a table, or all of them behind a picker (engine/app/picker.js)
docs/                      this guide, TABLE_FORMAT, RULESET, NEW_TABLE_CHECKLIST, STATUS
```

## Which doc for which job

| Job | Open |
|---|---|
| Make a new table ("today I want a space pinball game") | `NEW_TABLE_CHECKLIST.md`, then `TABLE_FORMAT.md` |
| Change a table's layout, words, quests, art | `TABLE_FORMAT.md` and that table's files |
| What does the game do? What is a Rally, a ward, a lamp colour? | `RULESET.md` |
| Change how every table plays | `RULESET.md`, then the one file in `engine/rules/` it names |
| What is finished, what is verified, known limits | `STATUS.md` |

## The level model (you need this for everything)

- The table is 640 wide. **Fields** stack top to bottom, 1040 apart, the first at y 40. Field 0 is the top. The
  bottom field has the plunger (`shooter:true`) and the real drain.
- A **tier** is an index: fields `0..NM-1`, then the Grave (`NM`), then wings (`NM+1..`).
- Inside a field's `pieces`, points are local to that field: `[x, y]` with y 0 at the field's top. The flippers of a
  field are at local y 900; the playable area is roughly x 66..574, y 60..880.
- Ramp paths and tunnel waypoints cross fields, so they are in whole-table coordinates (field top = 40 + 1040 * index).
- Physics is one plane. Height is drawn, never simulated.

## House rules

1. **A table imports only from `engine/api.js`.** The engine never imports from a table.
2. **Layout and content are data.** Behaviour a table needs goes in `rules.js` hooks (`onComplete`, `onScoop`,
   `lamps`, `tick`, `init`, `newRun`). If a hook cannot do it, the engine gains a general feature with a data flag;
   it never gains `if(table==='x')`.
3. **Never change an engine number for one table.** Physics constants, flipper strength, class stats, scores and
   timers are the manufacturer. Tables differ by layout, content and art.
4. **Base modules import nothing upward.** `core/util.js`, `core/state.js`, `table/layout.js`, `table/content.js` are
   read by everything; they must not import rules, render or ui (ES module evaluation order breaks otherwise).
5. **Nothing reads layout or content bindings while a module is being evaluated.** They are filled by `initGame()`.
6. **Art never calls `Math.random`.** Use `hash(n)` from the api. The simulation's random numbers are replayed in
   tests; art that consumes them shifts the game.
7. **Build new layouts from shot-tested assemblies** (listed in the checklist). A new shape needs a soak run.
8. **Tell the owner before a large change**, with what and why. He wants verified over guessed.

## Checking your work

```
npm run check          static: every module parses, every import resolves, no undefined names   (seconds)
node tests/table.mjs --table <id>      the layout still builds the recorded table
node tests/replay.mjs 5 --table <id>   the simulation still matches the recording, step for step
node tests/soak.mjs 20 --table <id>    a bot plays every field: stuck balls, shots never made, ramp failures
npm test               check + layout + 5-minute replay, both tables
npm run bundle -- all  dist/pinballsauce.html (one file); check it with  node tests/replay.mjs 5 --url dist/pinballsauce.html#gravebound
```

- A replay failure means you changed how the game plays. If you meant to, re-record with `--record` and say so in
  the commit. If you did not, find it: the failure names the scenario and the second it first differs.
- Gravebound's recording was made from the original game before the engine existed. Keep it passing.
- Look at the table: `tables/<id>/index.html?inspect` opens inspect mode (pan, zoom, top-down, piece labels with the
  layout line that made each piece, a coordinate grid, a screenshot button). In the game, press `I`.
- Dev keys in play (toggle with the backtick key): digits drop the ball on a field (then the Grave, then wings),
  `G` opens the Grave, `B` adds a ball, `N` finishes the current main-quest step.

## Vocabulary

**field** one playfield with its own flippers. **tier** field, Grave or wing by index. **piece** one entry of a
field's `pieces`. **mouth** a ramp entrance. **rail / ramp** the path a ball rides from a mouth. **scoop / hole** a
pocket that holds the ball, pays, and ejects or tunnels it. **bank** a row of drop or standup targets. **set** a
group of rollover lanes lit as one. **shot** anything addressable by id: a ramp, scoop, bank, bumper group, spinner,
lane set, statue or orbit; quests and lamps talk about shots. **insert** the arrow or dot painted for a shot.
**lamp** the lit state of an insert. **the Grave** the room under the bottom field that catches a lost ball once it
is open. **wing** a side room with its own flippers. **Rally** party multiball.
