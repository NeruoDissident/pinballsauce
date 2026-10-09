# pinballsauce

A pinball engine and the tables that run on it. The engine holds the physics and the rule set, so every table
feels like the same manufacturer built it. A table is a folder of data and art.

- `engine/` the engine. Tables never edit it.
- `tables/gravebound/` Gravebound Pinball, rebuilt on the engine. The reference table.
- `docs/` start with `docs/LLM_GUIDE.md`.
- `tests/` the replay test that proves a change did not alter how tables play.

No build step. Serve the folder with any static server and open it:

```
npm install
npm start          # http://127.0.0.1:4187
npm test           # static check, layout test, 5-minute replay of 20 scenarios
```
