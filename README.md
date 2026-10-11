# pinballsauce

My kit for making pinball tables without saying the basics twice. Three parts:

- **A ruleset**, [`docs/PINBALL.md`](docs/PINBALL.md): what makes a pinball table a pinball table, and how mine
  work by default. Lights on every goal, the state of the game on the playfield, goals that build, a fair launch.
  Guidelines, not law.
- **Shared code** for what has to behave the same on every table: the ball, the flippers, the plunger, what a lit
  or flashing light means, scoring, the camera, saves. How the ball feels is a preset each table picks.
- **Optional game systems**, each a switch: classes, levels, health, enemies, bosses, quests, a party, cards, the
  Grave, wings. Nothing is core. A table with none of them is a plain pinball table.

A table is a folder of data, a few hook functions and art.

| | |
|---|---|
| `tables/starfall/` | Plain pinball: one playfield, three balls, no health bar, no RPG. Shots, lights, a multiplier, a lock, a mission. The reference for a table with every optional system off |
| `tables/gravebound/` | Gravebound Pinball. Dark fantasy, three levels, every optional system on |
| `tables/neon-descent/` | Neon Descent: cyberpunk, four districts, every optional system on |
| `tables/crush-hour/` | Crush Hour: cute. Three playfields standing as a heart, every optional system on and re-dressed (a route per crush, the Friend Zone for a Grave), its own rivals and effects |
| `tables/test-bench/` | No art. Uses every layout feature: fields on a grid, three flipper sizes, a room of its own shape, drains that are ramps |
| `engine/` | the shared code. Tables import from `engine/api.js` only |
| `docs/` | start with [`docs/LLM_GUIDE.md`](docs/LLM_GUIDE.md); status in [`docs/STATUS.md`](docs/STATUS.md) |
| `tests/` | the checks |
| `tools/bundle.mjs` | one-file builds |

## Run it

No build step. Serve the folder with any static server and open it (GitHub Pages and Vercel work as they are).

```
npm install            # only needed for the tests and the bundler
npm start              # http://127.0.0.1:4187   the table picker
```

- Play: `tables/<id>/`
- Inspect mode: `tables/<id>/?inspect`, or press `I` in a table, or "Inspect table" in its menu. Pan, zoom, top-down
  or tilted, a label on every piece with the layout line that made it, a coordinate grid, a screenshot button.
  A screenshot carries its field, centre and zoom in a caption, so it can be handed to an LLM with "move this".

## Make a table

Say what you want in a sentence or two and hand the LLM `docs/LLM_GUIDE.md`:

> "One table, no health bar, no RPG stuff, only table goals. Space theme."
>
> "A two-level table, dark fantasy, 6 kinds of enemy, 10 quests and 4 bosses."

Everything the request does not say comes from `docs/PINBALL.md`. `docs/NEW_TABLE_CHECKLIST.md` is the order the
work is done in.

## Check it

```
npm run soak -- <id>       # a bot plays the table: stuck balls, shots never made, ramps that cannot be climbed
npm run reach -- <id>      # which shots each flipper can make
npm run standards -- <id>  # the table against PINBALL.md: fair launch, a light on every goal and shot, state lamps
npm run switches -- <id>   # the table with each of its game systems off in turn: does anything throw?
npm test                   # static check, every layout, a 5-minute replay of 20 scenarios on every table
npm run test:full          # the same with longer replays, plus soak, reach and standards
npm run bundle -- all      # dist/pinballsauce.html: every table in one file, behind a picker
```

The replay recordings are an alarm: they say when a change altered how a table plays. Whether that was meant is
for a person to decide. Passing every check means a table is not broken; whether it is good is decided by playing.
