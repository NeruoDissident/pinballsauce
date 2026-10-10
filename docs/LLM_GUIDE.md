# pinballsauce: the one-page guide

Read this first, every session. It tells you what the project is, where things live, the house rules, and which
other doc to open for the job in hand. Do not read the whole codebase: read this, then the one doc the job needs,
then only the files that doc names.

## What this is

A pinball **engine** and the **tables** that run on it. The engine holds everything that makes two tables feel like
the same manufacturer built them: the ball, the flippers, nudge and tilt, the camera, the four classes, levelling,
the spellbook, the party and the Rally (party multiball), cards, the Grave, wings, quests, foes, bosses, saves, the
HUD. A table is data plus a few small hook functions plus art.

The split to keep in your head: **the cabinet and the rules are the engine's; the playfield is the table's.** A
field is always 640 by 1040 with a flipper shelf and a way out. How many fields there are, where they stand, what
shape each is inside, how many flippers it has and how long, and where the ramps go, is all layout data.

- No build step. Plain ES modules, opened through any static server (`npm start`, GitHub Pages, Vercel).
- Three.js r128 is vendored in `vendor/three` and loaded as classic scripts, so `THREE` is a global.
- Three tables ship. `tables/test-bench`: plain, no art, uses every *layout* feature (a grid of fields, a field
  with no standard parts, three flipper sizes, drain ramps, status lamps); the first layout to read.
  `tables/gravebound`: the reference for every *game* feature (wings, doors, campaigns, a full theme).
  `tables/neon-descent`: a second themed table on the same rules.

## Map

```
index.html                 table picker
engine/api.js              the ONLY file a table imports from (re-exports the whole engine)
engine/table/              layout.js  the level model (fields on a grid, Grave, wings; sizes; tierOf)
                           build.js   layout data -> walls, flippers, sensors (piece types live here)
                           parts.js   standard parts a field gets unless it says not (arch, orbits, slings, flippers,
                                      lanes) and the cabinet parts it always gets (shelf, way out)
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
tests/                     check.mjs (static), table.mjs (layout), replay.mjs (simulation), soak.mjs (bot),
                           reach.mjs (which shots each flipper can make), golden/
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

- A **field** is one playfield: 640 wide, 1040 deep, flippers at its own y 900. That size never changes.
- Fields stand on a grid: `at: [column, row]` in the layout. Rows run down the table. A layout that gives no `at`
  is a plain stack, top first. On the whole table a field's corner is at x `690 * column`, y `40 + 1040 * row`.
- Same column, next row: the two fields are **joined** (the upper one's drain falls into the lower one's arch).
- The **home field** is the last one listed: the plunger (`shooter:true`), the real drain, the Grave under it.
- Any other field with nothing joined below it drains into a **drain ramp** (a "chute") to a field the layout names.
- A **tier** is an index: fields `0..NM-1` in the order listed, then the Grave (`NM`), then wings (`NM+1..`).
  Layout and content name fields by id; the engine and `rules.js` work in indices (`FIELD_INDEX.<id>`).
- Inside a field, points are local: `[x, y]` from the field's own corner. Points that cross fields (ramp paths,
  tunnel waypoints) are written `['#fieldId', x, y]`.
- Each field gets the **standard parts** (arch, orbits, slingshots, lanes, a pair of flippers) unless its layout
  switches them off with `standard:{...}` and places its own walls, gates, posts, slingshots and flippers.
- Physics is one plane. Height is drawn, never simulated. `tierOf(y, x)` and `elev(y, x)` take x as well as y.

## House rules

1. **A table imports only from `engine/api.js`.** The engine never imports from a table.
2. **Layout and content are data.** Behaviour a table needs goes in `rules.js` hooks (`onComplete`, `onScoop`,
   `on`, `lamps`, `status`, `tick`, `init`, `newRun`). If a hook cannot do it, the engine gains a general feature with a data flag;
   it never gains `if(table==='x')`.
3. **Never change an engine number for one table.** Physics constants, flipper strength, class stats, scores and
   timers are the manufacturer. Tables differ by layout, content and art.
4. **Base modules import nothing upward.** `core/util.js`, `core/state.js`, `table/layout.js`, `table/content.js` are
   read by everything; they must not import rules, render or ui (ES module evaluation order breaks otherwise).
5. **Nothing reads layout or content bindings while a module is being evaluated.** They are filled by `initGame()`.
6. **Art never calls `Math.random`.** Use `hash(n)` from the api. The simulation's random numbers are replayed in
   tests; art that consumes them shifts the game.
7. **A layout is judged by the priorities in the checklist**, in order: the ball never sticks, it always comes back
   to a flipper, every shot can be made, the table can be read. `tests/soak.mjs` and `tests/reach.mjs` check the
   first three. Build the shape the owner asked for; if you think another is better, ask, do not substitute.
8. **Tell the owner before a large change**, with what and why. He wants verified over guessed.

## Checking your work

```
npm run check          static: every module parses, every import resolves, no undefined names   (seconds)
node tests/table.mjs --table <id>      the layout still builds the recorded table
node tests/replay.mjs 5 --table <id>   the simulation still matches the recording, step for step
node tests/soak.mjs 20 --table <id>    a bot plays every field: stuck balls, shots never made, ramp failures
node tests/reach.mjs --table <id>      every flipper, every timing: which shots it can make, which nobody can
npm test               check + layout + 5-minute replay, every table
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

**field** one playfield with its own flippers. **home field** the last one listed: plunger, real drain. **joined**
two fields one above the other in a column. **tier** field, Grave or wing by index. **piece** one entry of a
field's `pieces`. **standard part** what a field has unless it says not. **mouth** a ramp entrance. **rail / ramp**
the path a ball rides from a mouth. **drain ramp / chute** the ramp a field with nothing below it drains into.
**scoop / hole** a
pocket that holds the ball, pays, and ejects or tunnels it. **bank** a row of drop or standup targets. **set** a
group of rollover lanes lit as one. **shot** anything addressable by id: a ramp, scoop, bank, bumper group, spinner,
lane set, statue or orbit; quests and lamps talk about shots. **insert** the arrow or dot painted for a shot.
**lamp** the lit state of an insert. **status lamp** a `lamp` piece: a light in the floor showing the game's state
(2x, ball save, lock). **the Grave** the room under the home field that catches a lost ball once it
is open. **wing** a side room with its own flippers. **Rally** party multiball.
