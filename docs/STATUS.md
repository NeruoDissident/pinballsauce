# Status

Written 10 October 2026, at the end of the fourth stage (the third and fourth were the same day). Three lists
for each: what exists, what was checked and how, and what was not checked. Nothing in a "verified" list is a guess;
anything that is a guess is in a "not verified" list.

## Stage 4: the flipper's stroke, point values, the Cathedral Freeway

Three changes the owner asked for, and nothing else.

**1. The flipper has a power stroke.** Before, a bat moved at one speed from the instant the button went down to
the stop: a hit in the last degree of travel was as hard as one in the first, and a tap was nearly a full shot.
Now the coil punches the bat to 70% of its top speed at once, the rest builds over the next hundredths of a second,
and the power is cut for the last twentieth of the swing (`stroke` in a table's `feel`; TABLE_FORMAT). It is the
default on all four tables. No table was retuned for it, as agreed.

What it does, measured on Starfall's left flipper with a ball rolling down the bat (the right is its mirror):

| | Old (flat) | New |
|---|---|---|
| Hardest strike | about 1975 | about 1980: the same, by design |
| Middling strike | 1850 | 1700 |
| A 12 ms tap / 20 ms / 30 ms | 1470 / 1720 / 1820 | 1350 / 1430 / 1620 |
| Wide shots, 32 to 42 degrees across the table | 1690 to 1890 | 1450 to 1780 |
| The whole stroke | 44 ms | 46 ms |

So: the sweet spot (the middle of the bat, mid-swing) hits as hard as ever; everything else is softer, taps and
the tip most of all.

**This is a milder stroke than first built, and that is a finding.** A ball on the bat is not struck once: it is
carried up by the bat and let go where the bat slows. So anything that weakens the end of the swing, or slows its
start, moves every shot that begins near the pivot. The first version (a bat starting from a standstill, power cut
for the last 15% of the swing) took the centre scoop and the centre ramp off every table: found on 15 to 20 of
156 timings before, on none after. The numbers that shipped are the ones that keep those shots where they were.
Three other strokes are kept as presets to try by hand: `flat` (the old flipper, exactly), `heavy` (a bat that
starts from a standstill; softer taps and tips, and it loses a few wide shots) and `real` (that first version: the
nearest to a real coil, and the one that misses the centre shots on today's layouts). **Options > Flippers** in
the game steps through all four on any table.

**Where this is going.** The owner wants the real feel: a ball rolling up the bat has to feel different from one
met by a bat at full speed, and he is content to change the tables for it. So the mild default is a holding
position. He picks a stroke by playing the four; then the tables are fitted to that stroke (centre scoops and
ramp mouths moved to where its shots land, the wide shots opened up), and it becomes the default.

**2. Point values are per-table defaults.** All 40 values the shared code pays have names (`POINTS0`); a table
changes any with `points: {ramp: 6000}`. No table does yet.

**3. Neon Descent's Cathedral Freeway** (the ramp up the right of the bottom district) is graded more gently:
`k` 0.05 to 0.03 and `drag` 0.1 to 0.04, so it needs about 420 at its mouth where it needed about 610. In bot play
it was made 27 times and failed 16; it is now made 41 and fails 6.

### Verified in stage 4

| What | How | Result |
|---|---|---|
| Naming the point values changed nothing | the replay alarm on all four tables before the flipper was touched | all 80 scenarios identical to the recordings |
| A table's own points load, and a misspelt one is refused | Starfall loaded with `points:{ramp:9000, jackpot:60000}`, then with `points:{ramps:1}` | the two values changed and the rest kept their defaults; the second stopped the table with a message naming the valid names |
| The `flat` preset is the old flipper exactly | all four tables replayed on `--feel flat` against the recordings made before this stage (before the Cathedral Freeway was changed) | all 80 scenarios identical. Gravebound's is the recording made from the original game; it is kept as `gravebound.flat.replay.json` and the suite still runs it |
| No shot went from makeable to not | `reach` on all four tables before and after (156 timed flips for each of 29 flippers), and an 80-minute bot soak of each table before and after | see "What the new flipper changed", below. One shot did: Gravebound's home right orbit |
| No new ball traps | the same four soaks | 0 balls stuck on all four |
| Launches are as fair | `standards` on all four | 96%, 100%, 98%, 100% of launches reach a flipper: the same as before |
| The Cathedral Freeway | the speed it needs worked out from its path and the ramp rule, then the Neon Descent soak | needs 417 at the mouth (was 608); made 41, failed 6 (was 27 and 16) |
| The `heavy` preset does not break a table | Starfall and Gravebound on `--feel heavy`: `reach` and an 80-minute soak each | 0 stuck, the bot made every shot on both; `reach` no longer finds the Crypt Stair or the home right orbit on Gravebound from a rolling ball |
| The Flippers switch | stepped through its settings on Starfall, reading back the stroke the table loaded each time; and once inside the one-page build | table's own, flat, heavy, real, and back; the choice survives the reload, the same table comes back, and the corner of the screen names the flipper in use |
| The checks, on the commit this file ships in | recordings renewed on purpose, then the static check, all four layouts, and every replay: Gravebound 25 minutes, the original game's recording on `--feel flat` 25 minutes, the other three 10 minutes each | all passed: 100 scenarios identical. The soaks, `reach` and `standards` were run on the same stroke just before (above) and not again after the recordings were renewed |

### What the new flipper changed (nothing was retuned; these are for the owner to judge)

- **Gravebound's home right orbit is gone from the left flipper.** `reach` found it on 2 timings of 156 and the bot
  made it 4 times in 80 minutes; now 0 and 0. It was already the narrowest shot on the table (the plunger lane
  takes its room), and the same shot on Neon Descent and the Test Bench was already never made. Opening it up is a
  layout change.
- **Wide shots from a rolling ball are harder.** The low right scoop of each home playfield (Gravebound's Crypt
  Stair, Neon Descent's Sewer Grate, the Test Bench's Hatch) is found on 2 timings of 156 where it was 4;
  Starfall's Airlock on 2 where it was 6. In bot play the Crypt Stair fell from 20 to 9 in 80 minutes and the Sewer
  Grate from 15 to 5; Starfall's Airlock rose from 16 to 41.
- **Side ramps are easier to find**: the ones that were found on 1 timing in 156 are found on 4, on every table;
  the centre ramps on 18 where it was 15.
- **Ramps are still made far more often than they fail**, with a few failing a little more because the middling
  strike is softer. Made / failed in 80 minutes, before and after: Gravebound's Forest Road 20/6 and 31/11, Chapel
  Loop 89/20 and 59/14, Ruined Road 18/11 and 23/10, Wolf Run 26/0 and 32/7, Tower 48/8 and 34/6. Starfall's
  Slingshot 109/8 and 144/19. Neon Descent's Helix Spiral 48/5 and 49/11; its other ramps within a few either way.
- Ten flipper-and-shot pairs that `reach` found on 1 or 2 timings before are not found now: the home right orbit
  and the Town Gate from Gravebound's left home flipper; their twins on Neon Descent; and on the Test Bench the
  Bridge and the Rails from the East Works' flippers and the Guard from the home left flipper. The bot still made
  every one of those in play except the two home right orbits (Neon Descent's it never made before either). (As many pairs that were not found before are found now.)

### Not verified in stage 4

- **How it feels.** Every number above is a bot or a timed flip. Whether the new stroke feels right, too mild, or
  wrong is for thumbs. The Flippers switch in Options is there for exactly that comparison.
- **Whether "mild" is what was wanted.** The owner asked for force that varies through the swing, more at the first
  punch than at the end. What shipped has that, but only as much of it as the existing tables' shots allow. A
  stronger version (`heavy`, or a longer weak end to the swing) needs tables laid out for it, or these retuned.
- **The stroke on mini and long flippers** was measured only through `reach` and the Test Bench soak, not on its own.
- **`points` in a real table.** No table sets any; the override was checked by loading one, not by playing.
- **The `fast`, `slow` and `lively` presets with the new stroke.** Not re-run.

---

## Stage 3, the same morning

### What changed in stage 3: from "an engine that makes Gravebound" to "a ruleset and optional parts"

The owner's verdict on stages 1 and 2: far off track. What he asked for was a ruleset, so that he never has to say
"make sure the table has lights, make sure the lights show state, make sure there are multipliers, make sure a
plunge does not drain" again, plus modular pieces. What he got was an engine with Gravebound's whole game welded
in as "the rules". His correction: **nothing is core, everything is optional**; rules become guidelines except
where code is needed for physics; the audience is him and his LLM, not outside developers; Gravebound has to work
and feel the same, not match to the pixel. This stage does that.

- **`docs/PINBALL.md`: the ruleset.** What makes a pinball table a pinball table, and how his work by default:
  the ball always comes back, shots, lights (every goal has one; dark, dim, lit, flashing; the state of the game on
  the playfield), how goals build, scoring, the life of a ball, feel, the optional systems, what makes a table good,
  how to ask for one. Written as defaults ("a table has this unless I say otherwise"), with no counts and no
  positions. It is in his voice, as a draft for him to mark up.
- **Every game system is a switch** (`uses` in a table's `table.js`, or simply whether the table gives the data):
  classes, levels, health, party and Rally, cards, coin, enemies, bosses, quests, side quests, the Grave. Switched
  off, a system leaves nothing behind: no bar in the HUD, no page in the menus, no ring in the floor, no room under
  the table. The three older tables keep everything on and play as they did.
- **Feel presets** (`feel` in `table.js`): `standard`, `fast`, `slow`, `lively`, or a preset with single numbers
  changed (speed, gravity, top speed, bounce, flipper strength, slingshot and bumper kick, plunger, ramp defaults).
  The house rule "never change an engine number for one table" is gone; a table's feel is its own. `?feel=fast` on
  a table's address tries a preset without editing anything.
- **Starfall** (`tables/starfall`): the proof that the other end of the range works. One playfield, three balls, no
  health bar, no classes, no enemies, no Grave. A loop ramp, a spinner, two orbits, a drop bank, two standup banks,
  three bumpers, a centre scoop, a lock scoop, three top lanes. A light at every shot; the multiplier, ball save,
  kickback, lock, multiball and its own "cargo" feature as lamps in the floor; a six-stage mission written as data;
  what each bank gives written as rules. Built from `PINBALL.md`, not copied from Gravebound.
- **Two new checks.** `npm run standards -- <table>` measures a table against `PINBALL.md` (how many launches reach
  a flipper, a light on every goal and every shot, state lamps, the flipper gap, every playfield reachable) and
  prints notes, never failures. `npm run switches -- <table>` loads a table with each of its systems off in turn,
  and with all of them off, and bot-plays it.
- **Hard rules became guidelines.** `LLM_GUIDE.md`, `CLAUDE.md`, `AGENTS.md`, `RULESET.md`,
  `NEW_TABLE_CHECKLIST.md`, `TABLE_FORMAT.md` and the README were rewritten to say so: five hard rules that code
  depends on, and the rest is how the work is done. Each optional section of `RULESET.md` is marked optional.
  The replay recordings are described as what they now are: an alarm, not a law.
- **Smaller things.** A loop ramp no longer calls foes by itself: a ramp says `calls:2` if it should (Gravebound's
  and Neon Descent's loops do). `rules.objective` (the HUD's goal line for a table without quests) and
  `rules.bonus` (extra end-of-ball bonus lines). The words a plain table needs to change are `text` keys now
  (headings, the end-of-run lines, the names of the timed bonuses). The reach test follows a ball through a
  spinner or a rollover instead of stopping there. Tests take `--feel`.

**What was re-recorded, on purpose:** the three layout recordings, because every ramp now carries a `calls` value
(nothing else in them changed). **No replay recording was touched** in stage 3: Gravebound, Neon Descent and the test bench
played exactly as they did before it. (Stage 4 renewed all four on purpose, for the new flipper.)

## What exists

- **The ruleset**: `docs/PINBALL.md`.
- **The shared code** (`engine/`, 53 modules): physics, flippers, nudge and tilt, lamps, scoring, lock and
  multiball, camera, saves, HUD and menus, audio, the 3D renderer; and the optional systems: the four classes,
  levelling and the spellbook, boons and relics, the party, recruits and the Rally, the Grave, wings, quests, foes,
  waves, bosses. No table is named anywhere in it.
- **The table format**: definition (`uses`, `balls`, `feel`), layout (data), content (data), rules (hooks), theme
  (art). Documented in `TABLE_FORMAT.md`.
- **Four tables.** **Starfall**: plain pinball, one playfield, every optional system off. **Gravebound**: rebuilt
  from Gravebound 3D 0.21 (commit `aeadf66` of the original repo, which was only read, never changed); three
  levels, every system on. **Neon Descent**: four districts in a stack, every system on. **Test Bench**: five
  fields on a grid, no art, every layout feature.
- **Inspect mode** (`engine/app/inspect.js`): pan, zoom, top-down or tilted, layers, a label on every piece with the
  layout line that made it, a coordinate grid in the field's own numbers, a screenshot with a caption. It is the
  first half of an editor: it shows and names everything; it does not yet move anything.
- **Docs**: `LLM_GUIDE.md` (one page, load first), `PINBALL.md`, `TABLE_FORMAT.md`, `RULESET.md`,
  `NEW_TABLE_CHECKLIST.md`.
- **Checks**: `check` (static), `table` (layout), `replay` (simulation), `soak` (bot), `reach` (flippers),
  `standards` (against the ruleset), `switches` (each system off). **Bundler**: one-file builds.
- Not built: a table editor; table size as a setting. Both are later, on the owner's say-so.

## Verified in stage 3

| What | How | Result |
|---|---|---|
| The three older tables play as they did | the replay alarm: 20 scripted scenarios with seeded random numbers, a digest of the whole simulation every 0.1 s compared with the recording made before this stage (Gravebound 25 minutes each, the others 10) | identical in all 60: Gravebound to the same final scores as the original game's recording; nothing was re-recorded |
| Their layouts are the same tables | the layout dump compared with the recording | identical once every ramp carries a `calls` value; that key is the only difference, and the recordings were renewed for it on purpose |
| No game system is holding a table up | `switches`: the table loaded with one system off, every menu opened, 3 minutes of bot play with frames and the HUD drawn, the pause screen, then the last ball left to drain and the end-of-run screen drawn. Then the same with every system off at once | Gravebound: all 11 single switches and "everything off" ran clean. Neon Descent: the same 12. Test Bench: the same 12. Starfall (which only has quests on): clean with quests off |
| Gravebound with everything off is a plain table | played by the bot for 40 seconds and looked at | score, ball count and chips in the HUD and nothing else; no journal, no hero sheet, no class picker; the playfield, ramps and wings as they are |
| Starfall launches fairly | `standards`: 48 plunger strengths from a tap to a full pull, nobody on the flippers | 46 of 48 reach a flipper (96%; the standard in `PINBALL.md` is 90%). It was 75% as first built: a full pull rode the left orbit round and flew over the flipper. A one-way gate at the head of that orbit made it 83%, a post under the flipper gap 96% |
| Starfall has a light on every goal and shot, and shows its state | `standards` | 8 of 8 goals, 9 of 9 shots; multiplier, ball save, kickback and lock all have lamps; the flipper gap is 56 units (2.5 balls) |
| Starfall has no ball traps | soak: a bot played it for 80 minutes over 4 seeded runs | 0 balls stuck, no errors. Every shot made: the Slingshot 109 times (8 failed climbs), the Dock 229, the Airlock 16, the left orbit 9, the right orbit 4 |
| Its flippers have shots | `reach`: 156 timed flips per flipper | left flipper: the Dock on 17, the Asteroids 12, the Sensors 7, the Airlock 6, the Gyro 2, the right orbit 2, the Thrusters 1. Right flipper: the Dock 17, the Thrusters 14, the Gyro 9, the Hull Plates 4, the Slingshot 3, the left orbit 2. The Beacons are fed by the plunger and the orbits, not by a flipper |
| Starfall is repeatable | 20 scenarios, 10 minutes each, recorded, then replayed | identical; this is now its recording |
| Starfall shows nothing from a system it does not use | title, play, pause and end-of-run screens looked at on a wide screen; the title at phone width | score, ball, the goal line and chips; a "Mission" journal on wide screens; no health or power bar, no level, no coin, no class or companion picker, no hero sheet, no rune ring, no Grave (the cabinet ends below the flippers) |
| No screen talks about a system the table lacks | the words on every screen (title, options, controls, how to play, high scores, play, pause) printed and read, for Starfall and for Gravebound with everything off | three leftovers found that way and fixed: a "Class power" line in Controls, a high-scores line about "the stone", and a plain ball being given the cleric's nudge power (a small heal and a gold ring on every nudge). None left on those screens |
| The other feel presets do not break a table | Starfall on `fast`, `slow` and `lively`: `standards`, a 60-minute soak (4 seeds), and `reach`, each | launches reaching a flipper: 98%, 96%, 94%. Balls stuck: 0, 0, 0. Every shot made in each soak. The loop ramp made / failed: 128 / 9, 186 / 2, 94 / 4 |
| Every module is sound | `npm run check` | passes |
| The whole suite | `npm run test:full`, then `npm test` again on the commit this file ships in (after the last edits: the picker's wording and Starfall's page skin) | both passed: every layout matches, all 80 replays identical (Gravebound 20 of 25 minutes, the other three 20 of 10 minutes each), four soaks of 80 minutes with 0 balls stuck, reach on the Test Bench and Starfall, standards on Starfall. About 27 minutes on a two-core machine |
| One-file build | all four tables bundled into one page; the replay alarm (20 scenarios, 5 minutes each) run against each table inside it; the picker and Starfall's title looked at at phone width | identical for all four (80 scenarios). No sideways scroll at 400 or 1200 wide; Starfall boots from the picker |

## What the standards check says about the older tables

These are findings, not changes. Nothing was altered on these tables; whether to act is the owner's call.

| | Launches that reach a flipper | Goals with a light | Shots with a light | State on the playfield |
|---|---|---|---|---|
| Gravebound | 47 of 48 (98%) | 30 of 30 | 28 of 28 | **none**: no lamp for the multiplier, the ball save, the kickback or the lock. They are shown only in the HUD |
| Neon Descent | 48 of 48 | 30 of 30 | 36 of 36 | **none**, the same four |
| Test Bench | 48 of 48 | 12 of 12 | 27 of 27 | all four |
| Starfall | 46 of 48 (96%) | 8 of 8 | 9 of 9 | all four |

- By `PINBALL.md` section 4, Gravebound and Neon Descent are missing their state lamps. Adding them is layout data
  only (`lamp` pieces), a small job per table, and would not change how either plays.
- The Test Bench's West Wing has a flipper gap of 98 units (4.5 balls): mini flippers at the foot of a room, built
  that way on purpose to show what it does.

## Not verified in stage 3

- **Nobody has played Starfall.** Every check ran in headless Chromium with a bot that flips but does not aim. The
  checks say it is not broken. Whether it is any good (`PINBALL.md` section 10: flow, rhythm, risk you choose) is
  for a person with their thumbs on it.
- **Feel presets by hand.** `fast`, `slow` and `lively` were soaked on Starfall only, and nobody has felt them.
  The numbers in them are first guesses. Changing a single number on its own (`gravity`, `flipper`, `bounce`...)
  was not tried on any table; `gravity` alone will change what each flipper can reach.
- **Feel presets on the other three tables.** Not run. A faster ball on Gravebound may find a pocket the standard
  ball does not.
- **Leftovers in a half-switched table.** The three leftovers above were found by reading screens and code, not by
  a test, on the two extremes (everything on, everything off). A table with some systems on and some off may still
  show a word or run a small effect that belongs to a system it switched off. Nothing will throw; something may
  look out of place. The screens of such a table were not read.
- **Switches in pairs.** Each system was switched off alone, and all together. The combinations in between
  (enemies but no classes; quests and health but no party) were not each tried. They share the same guards, so
  they should hold, and `npm run switches` on the new table is the check to run when one is built.
- **What a half-switched Gravebound is like to play.** The switches check proves it runs, not that it is a good
  table: Gravebound without quests has little to do.
- **A wing on a table without a Grave.** Gravebound with the Grave off ran clean for 3 minutes, but whether the
  bot went into a wing in that time was not checked.
- **A saved run carried across a switch change** (saved with classes on, continued with classes off). Untried.
- **`PINBALL.md` itself.** It is my reading of how his tables work and what he has said. He has not read it yet.
- **Still true from stage 2:** frame rate on a phone; sound (nothing was listened to); web fonts; hosting on GitHub
  Pages or Vercel; wings on a grid; very large tables; `rise` and `line`.
- **Not re-run this stage, by the owner's instruction:** the pixel comparisons of Gravebound and Neon Descent
  against the originals. They were identical at the end of stage 2. Since then the HUD, menus, floor and scene code
  were edited to hide what a table does not use; with everything on those edits should draw the same picture, and
  what was looked at (Gravebound in play on a wide screen: HUD, journal, hero sheet; and the words on its menus)
  showed no difference by eye.

## Table size as a setting: what it would cost

Asked for, not done in this stage; this is the estimate that was promised. It is an estimate: nothing here was tried.

A playfield is 640 by 1040 everywhere. That is not one number in one place.

- **The standard parts are drawn in those numbers**: the arch (radius 300 round (320, 300)), the orbit guides (x 66
  and 574), the slingshots, the lanes, the flipper pivots (cx ± 100, y 900), the shelf, the way out. They would
  have to be restated relative to the field's width and length: the top parts hang from the top, the bottom parts
  stand on the bottom, the arch takes its radius from the width.
- **Roughly 240 places in 28 shared files write a size as a plain number** (the scene builder 42, the table builder
  28, wings 24, the level model 20, the standard parts 17, the actors 14, the frame loop 12, the rest in ones and
  twos): the cabinet frame, floor textures, lights, the camera's framing, the inspect grid, where foes rise. That
  is a raw count of the numbers 640, 1040, 690, 900, 620, 320, 303 and 586 in the shared code: a few will be
  something else, and sizes derived from them (the arch's 300) are not in it.
- **The checks and the docs assume it** (the flipper line at 900, the drain at 1040, every coordinate table and
  tested assembly in the checklist).

Two versions:

1. **One size per table** (every playfield of a table is, say, 760 by 1200). About one more pass the size of this
   one. The existing tables keep 640 by 1040 and their recordings stay as the alarm. Risk: moderate, mostly in the
   drawing, which has no automatic check; it would need looking at.
2. **A size per playfield** (a wide lower field under a narrow upper one). A good deal more: the grid, joined
   fields, chutes and the camera all assume equal cells. Better done together with the editor than before it.

What already works without it: a bigger table is more fields on the grid; a smaller or oddly shaped play area is a
field with its standard parts switched off and its own walls; a faster or slower table is `feel`.

## Left out, on purpose

Said before starting: table size as a setting (above); the front-end editor; the diamond Neon Descent.

Still left out from stage 2: magnets, captive balls, moving targets, a second plunger (new physics: each is a
general feature to add when a table needs it); the plunger stays up the right side of the home field; walls that
move during play; performance work for very large tables.

## Found on the way

- **Gravebound and Neon Descent show the multiplier, ball save, kickback and lock only in the HUD** (above).
- **The right orbit of a home field is a narrow shot.** The plunger lane takes its room. On Starfall the bot made
  it 4 times in 80 minutes and the reach test finds it on 2 timings of 156; on Neon Descent's and the Test Bench's
  home fields the bot never made it in 80 minutes. It is lit and it pays, so it reads as a hard shot rather than a
  dead one, but it is harder than it looks.
- **Starfall's main shot may be too narrow.** From a ball rolling down the right flipper, the Slingshot's mouth
  is found on 3 timings of 156. The bot still made it 109 times in 80 minutes (off bounces and held balls), so it
  is makeable. Whether it is comfortable enough for the shot the table is built round is the first thing to judge
  by playing; widening it is a matter of moving the mouth.
- **Wave banners never show their campaign's name** and **a full meter announces an ability that is now the
  Rally**: two quirks of the original Gravebound, kept as they were. Gravebound's three written wave banners are in
  its `content.waveNames` if wanted (one line in `engine/rules/waves.js`).
- **The engine's default words are Gravebound's** ("The hero falls", "Carve your name"). A new table gives its own
  in `content.text`; Starfall does. Some banners still use the shared vocabulary ("Level Up", "boon", "relic"),
  which only shows on a table that has those systems.

## Known limits

- A playfield is 640 by 1040. Its flipper shelf and its way out are fixed. One plunger, up the right side of the
  home field, which is the last field listed and stands in column 0 on the lowest row.
- The shared code refuses a table in about two dozen places. Every one is either a slip it can name (an unknown
  piece type, a ramp from a mouth that is not there, a quest on a field that does not exist) or something the build
  cannot do (two fields overlapping, a field with no way out, a field joined under another without its arch). None
  is a rule about what a table should contain.
- One door per table. The Grave's shape is fixed. Three wing rules. Four classes.
- One table per page load (changing tables reloads the page).
- The bot only flips; it does not aim. A soak finds traps and dead ramps, not whether a shot is satisfying. The
  reach test finds shots a flipper can make from a rolling ball, not whether a player can make them twice. The
  standards check counts lights; it cannot tell whether they read well.

## Suggested next steps, in order

1. **Read `docs/PINBALL.md` and mark it up.** It is the part of this stage that matters most and the part most
   likely to be wrong in places, because it is a guess at what is in his head.
2. **Play Starfall.** Ten minutes. Say what is wrong with it; each thing is probably also a line for `PINBALL.md`.
3. Decide whether Gravebound and Neon Descent get state lamps on the playfield (a small data change each).
4. Ask for a table in two sentences and see whether the result needs anything said twice. That is the real test of
   this stage.
5. Later, on his say-so: the editor (inspect mode is the first half); table size as a setting; the diamond Neon
   Descent.

---

## Before that: stage 2 (9 October), the playfield opened up

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
diamond version, as a new table beside it, is still waiting for his say-so.

## Verified in stage 2 (not run again in stage 3, except where the list above says so)

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



## Deliberate differences from the original Gravebound

- The title menu has an "Inspect table" button; the version line says "on the engine".
- Saves live under `pinballsauce.gravebound.`.
- Three pieces of dead code were dropped (`ability()`, `buildSprites()`, a shadowed first copy of `runeTex()`).
- Every optional system can now be switched off; with all of them on, as shipped, it plays as the original.
- Nothing else. Where the original had a quirk, the quirk is kept (see "Found on the way").

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

