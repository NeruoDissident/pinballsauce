# Status

Updated 11 October 2026 with Judgment. The earlier stages below retain their original verification notes.

## Stage 8.2: player flipper power

At the owner's explicit request, the shared standard flipper strength is now 1.15, matching Judgment's approved
trial. Every shipped table uses it. Pause and Options expose a marked +0% to +100% slider in 10% steps; +100%
doubles that baseline to 2.3. The preference persists across tables and reloads. Only the powered stroke's speed
targets scale: stroke acceleration/cutoff/holding settings, return speed, gravity, bounce, ramps and the ball-speed
cap are unchanged. No objects were moved. Pilgrimage's entrance remains a separate playtest issue.

Verification:

- Static checks, all six layout snapshots, all 120 five-minute replay scenarios, 25 Judgment progression checks
  and 23 mechanism checks pass. `npm test` completed the five other tables before a browser-startup timeout on
  Judgment; its complete replay and the two remaining suites passed when rerun in a fresh browser.
- `npm run test:power`: all eleven settings, pause safety, keyboard control, persistence across all six tables,
  bounded input, touch input, and desktop/phone render inspection.
- Two five-minute soak seeds at baseline and maximum on each of six tables: 120 simulated minutes, zero stuck
  balls, zero errors or recurring pockets. This is evidence of stability, not a claim about aiming or balance.
- Reach finds shots for every flipper except Test Bench's lower-right mini on West. A comparison at its original
  strength reproduces the same warning. The owner requested preserving layouts; no geometry was changed.
- Standards retain existing lamp notes on Gravebound/Neon Descent and Test Bench's wide West drain gap. Every
  table passes the launch criterion (46–48 of 48 launches). Judgment still has 29/29 shot inserts.
- The full six-table bundle preserves the preference while switching tables and measures exactly double the
  powered stroke velocity at +100% in an early-stroke comparison on each table.
- Five standard replay baselines are intentionally updated for the newly approved shared strength, keeping their
  previous durations. Judgment's already-matching baseline and the historical flat baseline are untouched. Two
  archival flat replays still match. All layout snapshots remain unchanged.

The earlier statements that other tables' feel is unchanged describe Stage 8.1. The owner explicitly authorized
this shared strength change and requested pushing and merging the experimental branch to main after validation.

## Stage 8.1: Judgment mechanical redesign

The same experimental branch now includes seven flippers and eight visible track sections. Earth has a right-orbit
feed to its upper-right flipper, a cross-field Ascension combo, a separate Pilgrimage return to the left inlane, and
a restrained cathedral bell ball. Heaven has physical opening Gates, a raised halo, a timed magnetic catch, and a
diverter that selects a long visible descent during Armageddon. Hell has a moving Beast jaw, 25-second attack
windows, visible wounds, and a rising Redemption return. Redemption remains available before the finale so a
player can recover from Hell; the final return awards Salvation when the ball actually arrives on Earth.

The engine additions are optional layout data, with named defaults. Tables without mechanisms create no moving
collision objects and retain their existing paths and defaults. See [MECHANISMS.md](MECHANISMS.md). The Grave
exit and all five existing tables' files/recordings are unchanged. New mechanisms do not alter the user's flipper feel.

Verified on 11 October 2026:

- Static check: 103 modules. Full npm test: six layout snapshots, 120 five-minute replay matches, 25 progression
  checks and 23 physical mechanism checks. Only Judgment's layout and ten-minute replay baselines were re-recorded.
- Physical mechanism checks include closed-barrier rebound, open-barrier capture, safe late ejection when the jaw
  timer expires, captive-ball movement/return, magnetic hold/release, both diverter routes, upper-flipper feed and reset.
- Final soak: eight seeds, 160 simulated minutes, no errors or recurring pockets. One auto-cleared rest at Earth
  (526,301). Ascension 17 successes / 4 failed climbs; Pilgrimage 158 / 5; the feed, halo and return tracks had no
  failed climbs. The captive bell was hit 46 times. The bot did not qualify the Armageddon/Beast phase; focused
  physical and progression tests cover those phases explicitly.
- Reach: all seven flippers reach shots. Upper flipper reaches Ascension and the captive bell; both Heaven
  flippers reach qualified Gates; Hell's left flipper reaches the open Beast. The fixed probe missed some lanes,
  orbits and the Abyss scoop that the soak reached. Continuation tracks have no independent mouth to aim at.
- Standards: 47/48 fair launches, 29/29 feature inserts, required status lamps and connected fields.
- Combined build: all six menu → game → Other tables round trips pass without page errors. Two Judgment
  five-minute scenarios in the bundled build match source. Standalone file opens with network requests blocked;
  New run, Space launch and both arrow flippers work.
- Visuals: all three fields, closed/open Gates and jaw, tilted/top views and phone-sized layout inspected.
  Lower flippers remain clear. A track that crossed the upper flipper's aiming view was rerouted.

Still for the owner to judge: human aim, the combo timing window, difficulty and whether the play is satisfying.
No claim of realistic free-space magnetic simulation: the current magnet is a timed catch mounted on a rail.
No video comparisons were made. Main remains untouched; the full six-table HTML is the primary playtest build.

## Stage 8: Judgment, initial version (historical verification)


### What exists

- A new three-field table: Heaven above Earth above Hell. Earth launches; only Hell loses a ball. One Ascension
  ramp, physical falls between fields, an Abyss transfer down and a Redemption return to Earth.
- A complete custom goal sequence: three distinct souls, Pearly Gates / Armageddon multiball, Chains, three Beast
  strikes, final Redemption / Salvation. Supporting Choir locks, Grace, kickback, multiplier and double scoring.
  Three balls, standard feel, no RPG systems. Progress lamps repeat beside every pair of flippers.
- Procedural floor art and scenery, custom bell and demon bumpers, sounds, realm palettes, help and menus.
  Picker registration, layout/replay recordings, a dedicated behavior check, and a screenshot utility.
- A generic engine addition: `ST` is the field with the shooter; `BT` remains the final drain. Start/continue and
  the title camera use the launch field. An interior shooter gets its own bounded lane and a flared transfer
  into the next field's right orbit. No existing table changes its chosen launch field or geometry.
- Work is isolated on `codex/judgment`. The shared-engine change is a separate commit for review.

### Verified for Judgment

| What | How | Result |
|---|---|---|
| Existing behavior and new baseline | `npm run check`, `npm test` | All 100 modules pass the static check; all six layout snapshots and 120 five-minute scenarios match; the 25 Judgment behavior checks pass. Only Judgment received new recordings; existing recordings are unchanged |
| Ball traps and circulation | `node tests/soak.mjs 20 --table judgment --seeds 8` | 160 simulated minutes, zero stuck balls; every tracked shot made. Ascension: 134 made, six failed climbs. Early layout pockets were corrected before this run |
| Flipper coverage | `npm run reach -- judgment` | All six flippers reach multiple shots. The fixed roll-down probe did not hit Heaven's Virtues/right orbit or Earth's Candles/right orbit; all four were reached by the longer soak. This does not prove every shot is equally easy to aim |
| Launch and shot lamps | `npm run standards -- judgment` | 48/48 fair launches; 21/21 feature shots with inserts; required state lamps; 56-unit flipper gaps; all fields connected. Goals are custom rules, so the data-goal count is zero; goal lighting is tested separately below |
| Complete rules and custom goal lights | `node tests/judgment.mjs` | 25 checks: physical falls, Earth serve, lower field cannot activate its plunger, Redemption return, distinct souls, every goal phase lit, three-ball Armageddon, Chains protection, Beast defeat, Salvation, Grace, endless reset, save/continue and both Choir locks |
| Disabled systems | `npm run switches -- judgment` | Loads, plays and ends with every optional system off, as shipped |
| Phone browser and offline play | `npm run mobile -- judgment` | Final run: 20/20. Includes offline reload, touch controls, rotation and fog. The check now expects side panels only for enabled systems. One earlier run missed the timed double-tap check under concurrent test load; rerun passed without changing input code |
| Standalone build | `npm run bundle -- judgment`, then ten-minute replay with `--url dist/judgment.html`; final file opened directly with network requests blocked | All 20 scenarios match the new source recording. After the final title CSS adjustment, the delivered HTML opens without any network request and New run, Space launch, and both arrow flippers work |
| Visual inspection | `tools/judgment-preview.mjs` | All three fields examined in play, top-down and tilted with flippers/outlanes visible; title, phone title/play and staged Salvation screen checked. Title overflow and a Redemption insert obscured by a block were corrected |

### Not verified for Judgment

- Human aim, difficulty, scoring balance and whether the table is fun. A bot reaches the shots; it does not
  establish that a player can reliably make the intended combinations.
- Real phone hardware, iOS Safari, installation prompts, and audible balance through speakers/headphones.
- Long-term saves across future schema changes. Current save/continue is covered by the behavior test.

Written 10 October 2026, at the end of the seventh stage (the third to the seventh were the same day). Three lists
for each: what exists, what was checked and how, and what was not checked. Nothing in a "verified" list is a guess;
anything that is a guess is in a "not verified" list.

## Stage 7: phones, and the site as an installable app

The owner's list, for every table (this is shared code: the page, the stylesheet, the camera):

| Asked | Done |
|---|---|
| No stretch on a phone; everything to scale | The size of the stage is checked every frame, not only when the browser says it changed: phones fire `resize` before a rotation has settled, or not at all, and the picture was left at the old shape. A rotation is also asked about again 60 and 400 ms later |
| The block at the bottom that says Nudge: gone | The nudge zone is still there (bottom middle, 120 by 72) but nothing is drawn. Nudge on touch is also **a double-tap on either half** (two taps on one side inside 230 ms). Launch is the right half, held and let go |
| The strip with the camera and quality: gone | Not shown on a touch screen. (A mouse-and-keyboard screen keeps it in the corner: it is the reminder for the C and Q keys.) |
| Camera in Options, or a button at the top on a phone | Both. Options already had View and Detail. On touch there is now a 44 px eye button under the pause button, which is 44 px too |
| Side panels: not upright, yes on its side | Never shown in an upright window. Shown in a wide one from 960 px, and on a phone held sideways (short and wide) in a narrower, smaller set. The HUD now keeps to the column between the panels, and the buttons stand at its edge, so nothing lies under a panel |
| A true app icon | `manifest.webmanifest`, five icons in `assets/icons` (192, 512, a maskable 512, an Apple touch icon, a favicon) and `sw.js`. The table list is the app; every table page links the same manifest and worker. A table's title menu has "Other tables", because an installed app has no Back button |
| The picture goes dark on a phone, more so upright | Found and fixed: the same cause as in the stand-alone Gravebound, and the same fix (below) |

**The darkening.** An upright window is narrow, so the camera backs off to fit the table's width: 3,322 units from
what it looks at instead of 1,639. The fog is set for the wide view, so upright the table sat in 83% fog where it
should sit in 35%, and in a dark fog that is a dark picture. It came and went with the view and with where the
ball was, which is why it looked like "sometimes". Now the fog thins as the camera backs off, so the table sits in
the same amount of it at any shape of window. The corner darkening of the picture is also lighter upright, where
the table reaches into the corners.

**Offline.** The worker asks the network first for every file and keeps what it gets; with no network it serves
the kept copy. So a phone that is online always runs the newest files, and a table that has been opened once plays
offline. It does not run under an automated browser, so the checks are not served from a cache.

### Verified in stage 7

| What | How | Result |
|---|---|---|
| All of the list above | `npm run mobile -- <table>` (new: `tests/mobile.mjs`): the table list and a table opened as a 390 by 844 touch screen | 20 of 20 lines on Crush Hour and 20 of 20 on Gravebound. Among them: the manifest and its three icons load; the worker takes the page; the table and the table list both open with no network; no strip, no nudge block; 44 px view and pause buttons; a double-tap nudges once, two taps 0.4 s apart do not; after a rotation whose resize event was removed the picture matched the screen (2.164 to 2.164) |
| The darkening | the camera's distance and the fog at the point it looks at, measured before and after in four window shapes | before: 35% wide, 83% upright (84% on a 360 by 800 screen). After: 35% in every shape |
| It looks right | frames looked at: a phone upright, a phone on its side, a tablet on its side | upright: the table bright, two buttons top right, nothing at the bottom but the faint Flip rings. On its side: a panel each edge, the HUD between them |
| Nothing else moved | `npm test` | 100 of 100 scenarios identical to their recordings, all five tables |

### Not verified in stage 7

- **A real phone.** Everything above is Chromium pretending to be one. iOS Safari is the browser these fixes are
  mostly for (it is the one that drops the resize event) and it has not been tried. The owner's phone is the test.
- **Installing it.** The manifest, icons and worker are what a browser asks for; the install prompt itself and the
  icon on a home screen were not seen. It installs from wherever the repo is served over https (GitHub Pages,
  Vercel), not from a file and not from the one-file build, which has no manifest.
- **The double-tap in play.** It nudges; whether 230 ms is the right window, or whether fast flipping sets it off
  by accident, is for the owner's thumbs.
- **The side panels on a phone on its side** are small (about 164 px wide). They fit; whether they are worth the
  room is his call.

---

## Stage 6: Crush Hour, a fifth table

The owner asked for one more table as the proof that the same ruleset can carry a table nothing like the others:
cute, pinks, a school-and-suburb setting, a dating-sim theme. It was built as a table only: **no engine file was
changed for it**. What it could not do within the engine as it stands is listed below, not worked round.

**What it is.** `tables/crush-hour`: three playfields standing as a heart (`at` `[-.5,0]`, `[.5,0]`, `[0,1]`).
Sakura High and Starlight Plaza are the two lobes; Maple Street is the point, with the plunger and the only real
drain. The School Run and the Plaza Line climb from Maple Street to the lobes, the Sky Bridge and the Promenade
cross between the lobes over the top of the heart, and a ball lost on a lobe slides back down to Maple Street.

| The shared system | On this table |
|---|---|
| A campaign | one crush's route. Three (Momo, Hana, Riku); a run plays one. They share the steps for each playfield and differ in the date, the last playfield and the rivals in their waves |
| Bosses | three people in the way (Dad at the Door, the Hall Monitor, the Queen Bee), then the crush, each a painted portrait |
| Enemies | eight rivals, one per job. Six are this table's own figures (a small body under a big head: `theme/figures.js`); the corgi and the butterflies are stock figures recoloured |
| Health, gold, the party, the Rally, the Grave | confidence, bucks, your friends, Squad Up, the Friend Zone |
| The feature roles of Gravebound and Neon Descent | kept, one for one, under new names (listed at the top of its `rules.js`) |
| One feature of its own | the Perfect Day: three stops, one on each playfield (the Boba Cafe, the Rooftop, the Photo Booth). All three on one ball pays 50,000, relights the kickback and gives 30 seconds of double scoring; lose the ball first and the stops go out. Three lamps on Maple Street show it |
| Words | every banner and floating word the shared code produces, through `text.words` (46 of them), plus the named keys of `text` |
| Effects | `theme.fx`: hearts when a rival is won over or a portrait is hit, stars off the bumpers and the big moments, softer flashes and shake, pink where the engine's colour is fire or lightning |
| Lamp colours | the engine's, on purpose, so gold, blue and green mean here what they mean on the other tables. Only the "feature open" lamp changed (white) |
| State on the playfield | multiplier, ball save, kickback, Rally and Friend Zone lamps on Maple Street; the lock's two lamps beside the Lockers; a wish lamp beside the Fountain; the three Perfect Day lamps |

Where the geometry comes from: each lobe is the checklist's shot-tested symmetric field, Maple Street is its home
field, and the two roads up and the two drain ramps are the test bench's. The two bridges over the cleft are new.

Also in this stage: `npm run check` now enforces the import rule that until now was only written down (a table
imports from its own folder and `engine/api.js`, never from another table or from inside the engine; `main.js` may
import the shell). It was tried by pointing one of this table's files at an engine internal: the check failed and
named the line.

### Verified in stage 6

| What | How | Result |
|---|---|---|
| Nothing sticks; every ramp can be climbed; the bridges work | `node tests/soak.mjs 20 --table crush-hour --seeds 8`: 160 minutes of bot play | 0 stuck. Every ramp made far more than failed (Sky Bridge 58 to 2, Promenade 81 to 9, School Run 68 to 8, Plaza Line 127 to 10). Both drain ramps ridden (84 and 93). One shot never made: Maple Street's right orbit (below) |
| A fair launch, a light on every goal and shot, state on the playfield | `npm run standards -- crush-hour` | 48 of 48 launches reached a flipper; 25 of 25 goals and 28 of 28 shots have a light; multiplier, ball save, kickback and lock are on the floor. It printed no notes |
| Every flipper has shots | `npm run reach -- crush-hour` | five or six shots per flipper on every playfield. Not found from a rolling ball: the Rooftop (behind its door), the lane sets and statues, and on Maple Street the two orbits, the Bus Stop and the Porch Lights. The soak made all of those but the right orbit |
| No optional system is holding it up | `npm run switches -- crush-hour` | each of its eleven systems off in turn, and all off: every one loaded, played and ended a run |
| All three routes can be finished | each route walked to its end with the dev key that completes a step, a bot on the flippers | eleven stages each, all four of its bosses woke and went down in order, and the run ended on the won screen with that crush's last line |
| A rival won over; the Perfect Day | one rival removed and the three stops made by hand in a test page | sixteen heart particles and "WON OVER"; after the third stop the banner, 30 s of double scoring and one perfect day counted |
| It looks like what was asked for | frames looked at: the title, each playfield in play, all eight rivals with two different portraits up, the whole table tilted in inspect mode with its scenery | hearts for bumpers on a pink street, a ruled exercise book with petals for the school, stars and a big wheel for the plaza; trees, houses, the school and the wheel round the table |
| The other four tables are untouched | `npm test` with the new table added to it | 100 of 100 scenarios identical to their recordings: the 80 of the four older tables, and the 20 recorded for this one |

### Not verified in stage 6

- **Nobody has played it.** Everything above is a bot, a test page or a screenshot. Whether it is fun, and whether
  it reads as cute in motion, is for the owner.
- **Balance.** Every rival's and boss's numbers are copied from the Neon Descent rival or boss in the same place.
  Nothing was tuned for three playfields instead of four.
- **Maple Street's right orbit.** The bot never made it in 160 minutes. It is the same assembly as Neon Descent's
  Undercity and the test bench's Home, where the bot does not make it either (0 in 80 minutes each), and Gravebound's
  bot makes it rarely. No goal on this table depends on it. Whether a person can make it is a question for play.
- **The Rooftop.** Made once in 160 minutes by the bot: it is behind a door that stays open 22 seconds, like Neon
  Descent's Backstage. Hana's date and one favour need it, and the Perfect Day needs it on the same ball as two
  other scoops. That may be too hard; it has not been judged.
- **Each boss fought properly.** They were woken and finished by the dev key. Their phases and spells are the
  shared code's and were not played through here.
- **The one-file build** has the table in it and loads it (below), but was not soaked.
- **Sound.** The table uses the engine's own sounds unchanged. Voice lines are the owner's to make.

### What this table could not do without an engine change (noted, not done)

- **The words in the side panels and menus.** The hero sheet beside the playfield still says "Hero", "Slain",
  "Threat", "Rally", "the party comes out", "Spellbook", "Boons", and the pause and options screens are the
  engine's. `text.words` covers banners, floating words and the HUD, not these. On a wide screen the hero sheet is
  on show all the time, so this is the first thing a playtest is likely to ask for.
- **The health bar has no name on it**, so it cannot be called confidence anywhere but the help pages.
- **Portraits are flat.** Bosses are painted billboards; only the rivals are 3D.
- **Scenery does not move.** The big wheel would turn if a theme had a per-frame hook; it has none.

---

## Stage 5: nothing the shared code does is forced on a table

The owner's point: shared code is useful, but a table should never have an effect, a sound or a word pushed into
it. Before this stage a table could add things of its own but could not take the shared ones away: every table had
the same explosion on a kill, the same sounds, the same banner words, the same ball-save and tilt timings. Now each
of those is a named default. A table that says nothing gets exactly what it got before; the four tables say
nothing, so none of them changed. Engine work only: no sound, voice or effect was made.

| What a table can now change | Where | How |
|---|---|---|
| Any of the 51 built-in sounds | `theme.sounds` | `false` is silence; a file path (or a list, played in turn) plays a recording, which is how a table gets its own voice lines; a function plays whatever it likes |
| The music | `theme.music: false` | off (the tone settings it already had still work) |
| Any of the 29 particle sprays (a kill, a bumper, a slingshot, a boss going down...) | `theme.fx.bursts` | `false` removes it; `{n, col, speed, life, shape}` changes how many, what colour, how fast, how long, and what each particle is drawn as |
| The shape of a particle | `theme.fx.particle` for the table, `shape` on any one spray | `'dot'` (default), `'heart'`, `'star'`, `'spark'`, or the table's own drawings by name (`fx.shapes`). Hearts on a kill and sparks off a bumper is two lines |
| Any of the 15 screen flashes, 15 camera shakes, 11 shock rings and 11 kinds of lightning, each by name | `theme.fx.flashes`, `shakes`, `rings`, `bolts` | `false` removes that one; or its strength and colour (a flash), its amount (a shake), its colour and size (a ring), its colour (lightning) |
| Flash, shake, rings and lightning for the whole table | `theme.fx.flash`, `shake`, `rings`, `bolts` | a strength (0 is off) for the first two, `false` for the others |
| The colours of the playfield lights | `theme.lampCols` | by lamp kind |
| Any word the shared code puts on screen: banners, floating text, HUD lines and chips, end-of-ball bonus lines | `text.words` in `content.js` | `{'KICKBACK': 'SECOND CHANCE'}` replaces it; `''` drops that banner or float altogether |
| 24 rule numbers: ball-save time, combo time and steps, tilt (nudges and time), multiball save and ball count, wave timing and size, level-up curve, cradle timings, Rally time, Grave hits and time, health scaling | `tune` in `table.js` | `tune: {ballSave: 15}` |

This was done in two passes the same evening. The first gave flash, shake, rings and lightning one setting each for
the whole table, and one particle shape for the whole table; the owner asked why, and the answer was only that it
was the smaller job. The second pass named all 58 places the shared code fires one of them and let each spray
choose its shape. A table's own rules fire the same effects through the same functions (`flash`, `shake`, `ring`,
`bolt`, `burst`), unnamed, and nothing overrides those.

A misspelt name in `tune`, any of the five `fx` maps or a particle shape stops the table with a message listing the valid names,
the same as `points` and `uses`. The lists of names are in `docs/TABLE_FORMAT.md`.

### Verified in stage 5

| What | How | Result |
|---|---|---|
| The four tables play exactly as before | the replay alarm (`npm test`) on all four, after the code changes | all 80 scenarios identical to the recordings. (The HUD labels were routed through the word table after that run; Gravebound was replayed again afterwards, 20 of 20 identical) |
| `tune` reaches the rules | Gravebound loaded with `tune:{ballSave:20, tiltNudges:3, comboTime:9}` and stepped | the ball save and combo time were the new ones plus the class's own; the table tilted on the third nudge |
| `text.words` | Gravebound given its own words for the tilt banner, two floating words and four HUD labels, then read back | replaced where given ("3x COMBO" became "3x CHAIN", "Lv 1" became "Year 1"), the float gone where given `''`, everything else as before |
| `fx.bursts` | slingshot spray set to `false`, kill spray to three pink particles | none on a slingshot, three pink on a kill, every other spray unchanged |
| `theme.sounds` | one sound set to `false`, one to a function, one to a file, one to a file that is not there, in a page with real audio | silent; the function ran; the file played; the missing file gave one warning in the console and silence |
| `theme.lampCols`, `fx.particle` | set in a test page and a frame drawn | the lamp colour changed; the particles were hearts |
| One flash, shake, ring or bolt changed by name | Gravebound loaded with some of each switched off or changed, then each fired and read back, and the real nudge pressed | the ones switched off did not happen (no shake on the nudge), the changed ones had the new strength or colour, everything not named was as built, and a table's own unnamed effects were untouched |
| The defaults of all 58 are what they were | the same read-back on Gravebound and Starfall with nothing set; and each rewritten line compared with the line it replaced | same strengths, colours and sizes |
| A shape per spray | kill set to hearts, bumper to stars, slingshot left alone, a table's own spray as sparks and another as a shape the table drew itself; one frame drawn and looked at | all five shapes in the same frame, each where it was fired |
| The effect names in the docs are the ones in the code, and every name is used | compared by script | 15, 15, 11 and 11 names; none missing, none unused |
| The four tables still play exactly as before, after the second pass | the replay alarm again on all four; Starfall and Gravebound once more after a last drawing-only fix | 80 of 80 identical; then 40 of 40 |
| Misspelt or unknown names are refused | `tune:{ballsave:5}`, `fx:{bursts:{explosion:false}}`, `fx:{particle:'cube'}`, a wrong name in each of `flashes`, `shakes`, `rings`, `bolts`, a spray given `shape:'cube'` | each stopped the table with the list of valid names |
| The sound names in the docs are the ones in the code | the two lists compared by script | 51 and 51, none missing either way |

### Not verified in stage 5

- **No table uses any of it.** Each override was tried by handing a table a patch in a test page. The first table
  that sets them for real is the real test.
- **A changed lightning colour was read back, not looked at.** The bolt carries the colour and the drawing uses it
  (one line); no frame was checked.
- **Every one of the 58 in play.** Each kind was fired by hand and the nudge was pressed for real. The other 57 were
  checked by reading the rewritten lines, not by playing to a boss kill or a Rally with an override set.
- **Many shapes at once.** Each shape in use is its own batch of up to 320 particles. Five were drawn together; the
  cost of, say, fifteen on a slow machine was not measured.
- **Recorded sound was tried with one generated clip**, not with real voice files, and not for timing (two lines
  called at once will talk over each other; there is no queue yet).
- **Recorded sound files do not travel in the one-file build** (`tools/bundle.mjs`): it does not pack audio. A
  table with voice files plays them when the repo is served, not from the single page.
- **The line under a boss's name** goes through the word table like the other HUD labels, but was not on screen in
  the check, so its replacement was not seen.
- **`tune` values far from the defaults** (a combo of 40 steps, a wave every second). The names are checked; the
  values are not.
- **Soak, reach and standards were not run.** No layout, physics or rule default changed, and the alarm says so.

### Found on the way in stage 5

- A table with no bosses (Starfall) made the 3D library print a harmless warning at load: the boss's sprite was
  given a picture that did not exist. Fixed in `engine/render/actors.js`.
- Switching off a lightning line does not change how a table plays (it still draws its random kinks). Switching
  off or resizing a particle spray does, because particles draw random numbers that are then not drawn. That is in
  TABLE_FORMAT. It only matters to a table's own replay recording.

### Still the same on every table after stage 5

These are not sounds, effects, words or numbers, and this stage did not touch them:

- **Models the shared code builds:** flippers, drop targets, standups, spinners, slingshots, scoops, the ball,
  pickups, companion figures. A table colours them; it cannot bring its own. (Enemies and bosses it can.)
- **Particle size** is one number for the whole table (`particleSize`), and a particle is a flat sprite that
  rises and fades: a spray cannot have its own size, spin or gravity.
- **What a flash, a shake, a ring and a bolt are.** A table changes how strong, what colour and whether; it cannot
  swap the full-screen flash for, say, a border glow without drawing that itself.
- **Structure:** where the HUD and menus are and the words inside the menus; the camera; how the music is
  generated; playfield size; the fixed sets of 4 classes, 16 abilities, 35 cards, 8 enemy behaviours and the boss
  phase types.

---

## Stage 4: the flipper's stroke, point values, the Cathedral Freeway

Three changes the owner asked for.

**1. The flipper has a real stroke.** Before, a bat moved at one speed from the instant the button went down to
the stop: a hit in the last degree of travel was as hard as one in the first, and a tap was nearly a full shot.
Now it is modelled on a real coil: the bat starts from a standstill, is driven up to speed within a few
thousandths of a second, and loses its power over the last 15% of the swing (`stroke` in a feel; TABLE_FORMAT). It
is the flipper on all four tables, and the only one. No table was changed for it.

Measured on Starfall's left flipper with a ball rolling down the bat (the right is its mirror):

| | Old (one speed) | Now |
|---|---|---|
| Hardest strike | about 1975 | about 2010 |
| Middling strike | 1850 | 1610 |
| A 12 ms tap / a 30 ms tap | 1470 / 1820 | 1135 / 1570 |
| The whole stroke | 44 ms | 50 ms |

**How it was chosen, and what went wrong on the way.** This stroke was the first one built. `tests/reach.mjs` then
said it had taken the centre scoop and the centre ramp off every table (found on 15 to 20 of 156 timings before, on
none or two after), so it was set aside and a much milder stroke was tuned to keep `reach` happy; an hour and a
half went on that. The owner then played four strokes side by side and chose this one at once: he can make every
shot with intent, the low side scoops are easier, and the centre scoops, which had been too easy to fall into, are
now right. **The test was wrong, not the flipper.** `reach` rolls a ball down the bat with the button held, which
was most of what the old flipper could do. With a real stroke the length of the press and the way the ball arrives
matter as much, and `reach` tries neither. The bot soak had already disagreed with `reach` (it still made every
shot) and should have been believed. Two lessons kept in the docs: do not read a shot `reach` does not find as a
shot that cannot be made; and for feel, put the thing in front of the owner early instead of testing round him.

**2. Point values are per-table defaults.** All 40 values the shared code pays have names (`POINTS0`); a table
changes any with `points: {ramp: 6000}`. No table does yet.

**3. Neon Descent's Cathedral Freeway** (the ramp up the right of the bottom district) is graded more gently:
`k` 0.05 to 0.03 and `drag` 0.1 to 0.04, so it needs about 420 at its mouth where it needed about 610.

### Verified in stage 4

| What | How | Result |
|---|---|---|
| Naming the point values changed nothing | the replay alarm on all four tables before the flipper was touched | all 80 scenarios identical to the recordings |
| A table's own points load, and a misspelt one is refused | Starfall loaded with `points:{ramp:9000, jackpot:60000}`, then with `points:{ramps:1}` | the two values changed and the rest kept their defaults; the second stopped the table with a message naming the valid names |
| The engine can still play the original Gravebound | all four tables replayed on `--feel flat` (the old flipper) against the recordings made before this stage | all 80 scenarios identical. Gravebound's is the recording made from the original game; it is kept as `gravebound.flat.replay.json` and `test:full` still runs it |
| Every shot can be made with the new flipper | the owner, playing | every shot made with intent, on the playable build |
| The new flipper traps no balls | 80-minute bot soaks of Starfall and Neon Descent on this stroke | 0 stuck, and the bot made every shot on both |
| The Cathedral Freeway | the speed it needs worked out from its path and the ramp rule; an 80-minute Neon Descent soak (on the milder stroke) | needs 417 at the mouth (was 608); made 41 and failed 6 (was 27 and 16) |
| The recordings | renewed on purpose for the new flipper (all four) and the ramp (Neon Descent's layout); `npm run check` | renewed; the check passes |

### Not verified in stage 4

- **Bot soaks of Gravebound and the Test Bench on this stroke.** Not run. The owner has played them; a bot has not
  been through them looking for stuck balls.
- **The Cathedral Freeway on this stroke.** Its made-and-failed count above was taken on the milder stroke.
- **The full suite after the recordings were renewed.** The recordings were made and the static check run; the
  long suite was not run again. A recording replays itself unless something is not repeatable, and nothing in this
  change is.
- **The stroke on mini and long flippers**, on its own.
- **`points` in a real table.** No table sets any.
- **The `fast`, `slow` and `lively` presets with the new stroke.**
- **`tests/reach.mjs` is now a weak test** (above). It was not widened in this stage.

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

