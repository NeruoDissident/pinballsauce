# pinballsauce

A pinball engine and the tables that run on it. The engine holds the physics and the whole rule set (classes,
levelling, abilities, party multiball, cards, the Grave, quests, foes, bosses, saves), so every table feels like the
same manufacturer built it. A table is a folder of data, a few hook functions and art.

| | |
|---|---|
| `engine/` | the engine. Tables never edit it; they import from `engine/api.js` only |
| `tables/gravebound/` | Gravebound Pinball, rebuilt on the engine. The reference for every game feature |
| `tables/neon-descent/` | Neon Descent: the same rules in a cyberpunk city |
| `tables/test-bench/` | A plain table that uses every layout feature: fields on a grid, three flipper sizes, a room of its own shape, drains that are ramps, status lamps. The first layout to read |
| `docs/` | start with [`docs/LLM_GUIDE.md`](docs/LLM_GUIDE.md); status in [`docs/STATUS.md`](docs/STATUS.md) |
| `tests/` | the checks that prove a change did not alter how tables play |
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

## Check it

```
npm test               # static check, every layout, a 5-minute replay of 20 scenarios on every table    (about 7 minutes)
npm run test:full      # the same with longer replays, a bot soak of every table and the reach test       (about 20 minutes)
npm run soak -- <id>   # bot-play one table: stuck balls, shots never made, ramp failures
npm run reach -- <id>  # which shots each flipper of a table can make
npm run bundle -- all  # dist/pinballsauce.html: every table in one file, behind a picker
```

Gravebound's replay recording was made from the original Gravebound 0.21 before the engine existed. While
`npm test` passes, the ball, the flippers, the foes and every score are still exactly what the original produced.

## Make a table

"Today I want a space pinball game": hand any LLM `docs/LLM_GUIDE.md` and say so. It points to
`docs/NEW_TABLE_CHECKLIST.md`, which walks from the brief to a soaked, recorded table.
