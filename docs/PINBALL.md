# How a pinball table works, and how mine work

Read this before making or changing any table. It is the list of things I should never have to say twice.

**How to read it.** Everything here is a default: *a table has this unless I say otherwise.* Nothing is compulsory,
and none of it says how many of a thing there should be or where it goes. That is the table's call. Where behaviour
has to be identical on every table (how the ball bounces, what a flashing light means) it lives in code and this page
only points at it. Where it is a matter of design (what a table needs, how goals build) it lives here, as a guideline.

If a request contradicts this page, the request wins. If a request is silent, this page decides.

---

## 1. What makes it pinball

- **One ball, gravity, two flippers.** The ball is always falling toward the player. Everything the player does is
  an attempt to send it back up at something.
- **Three inputs: left flipper, right flipper, nudge.** The plunger starts a ball. That is all. Nothing on the table
  is done by pressing a different button, picking from a menu in the middle of play, or aiming a cursor. Every goal
  is completed by hitting something with the ball.
- **Skill decides.** A good player keeps the ball alive and chooses shots. Luck exists (bumpers, slingshots) but a
  drain should almost always trace back to a shot the player took or failed to take.
- **The table tells you what to do.** You can walk up to it cold and work out what is worth shooting by looking at
  the lights. See section 4.
- **It is a physical place.** Walls, ramps, targets and lamps look like things that could be built. The theme is
  dressing on a machine, not a replacement for one.

## 2. The ball always comes back

- **Every shot returns the ball to a flipper.** A ramp ends in an inlane or somewhere the ball then rolls to a
  flipper. A scoop kicks the ball out at a flipper. An orbit comes round and back down. If a shot dumps the ball
  somewhere it drains from, the shot is broken.
- **A fair launch.** A plunged ball reaches a flipper, or scores a skill shot and then reaches a flipper. It does
  not drain untouched. Standard: at least 9 launches in 10 reach a flipper with nobody pressing anything, at any
  plunger strength. (`npm run standards -- <table>` measures it.)
- **Nothing traps the ball.** No ledge it can rest on, no gap it wedges in. If it does stop, the engine shakes it
  loose after 2 seconds, but a table that relies on that is broken.
- **Drains are earned.** There is a centre drain and there are outlanes, and both are real. But the centre gap is
  about two and a half balls wide, not five, and the outlanes are reached by a bad bounce, not by a normal shot.
- **Mercy at the start.** A ball save runs for the first seconds of every ball, so a ball lost immediately comes
  back. Past that, losing the ball is the player's problem.
- **Upstairs is safe.** On a table with more than one playfield, only the home playfield (the one with the plunger)
  loses the ball. Draining from any other playfield costs position: the ball falls or rides to another playfield.

## 3. Shots

A shot is anything the player aims at: a ramp, an orbit, a scoop, a bank of targets, a spinner lane, a nest of
bumpers, a row of rollover lanes.

- **Each flipper has several shots**, at different angles and distances: some easy, some hard. Three to five is
  normal. A flipper with nothing to shoot at should not exist.
- **Easy shots are safe and pay little. Hard shots are risky and pay a lot.** A table needs both. The risk in a
  hard shot is what happens when you miss it.
- **Shots feed shots.** The best tables hand the ball from one shot to the flipper that has the next one: a ramp
  that returns to the left flipper, which has the orbit, which comes round to the right flipper. Making several in
  a row (a combo) pays more each time.
- **Something to hit by accident.** Bumpers and slingshots keep the ball moving and score a little without being
  aimed at. They are the table's noise, not its goals.
- **Variety over quantity.** Two ramps that do different things beat four that do the same thing.

The pieces, and exactly how each behaves, are in `TABLE_FORMAT.md`. What each one scores is in `RULESET.md`.

## 4. Lights

This is the part that most often gets left out, so it is the longest.

- **Every goal has a light.** If the game wants the player to shoot something, a lamp at that thing says so. A goal
  with no light does not exist as far as the player can tell.
- **A light has states, and the states always mean the same thing:**

  | State | Means |
  |---|---|
  | dark | nothing here right now |
  | dim | done, collected, still counting for you |
  | lit, steady | available: shooting this does something |
  | flashing | do this now: the current goal, a jackpot, a timer running out |

- **Colour says what kind of goal.** One colour for the main goal, another for side goals, another for the lock,
  another for danger. The player learns it once per table. (The engine's defaults: gold main, blue side, green
  lock, red danger, white for a feature that is open, amber for a payout waiting.)
- **The state of the game is on the playfield**, not only in a corner of the screen. At the least: the
  multiplier, whether the ball save is running, whether the kickback is lit, whether the lock is lit, and progress
  toward whatever the table's big goal is. A real machine prints these as inserts in the floor (2X 3X 4X up the
  middle, SHOOT AGAIN by the flippers). So do mine.
- **Lights are how progress shows.** A bank with three targets shows three lamps and lights them one at a time. A
  goal that needs five of something shows how far along it is.
- **Lights react.** A hit flashes what was hit. Starting a ball sweeps the table. A big moment (multiball, a goal
  completed) is visible from across the room.
- **How many lights and where is the table's business.** A table with forty lamps and a table with twelve can both
  follow every line above.

In code: a shot's light is an *insert* (`shots` in the layout), lit by the goal system or by the table's `lamps`
rule, with states `flash`, `lit`, `done`. A state light is a `lamp` piece showing one of the engine's states or one
of the table's own. The behaviour of both (the dimming, the flashing, the colours) is shared code.

## 5. Goals

- **There is always something to do.** At any moment at least one light is asking for a shot.
- **Goals build.** The usual ladder, bottom to top:
  1. **Small things** you do without trying: finish a bank of targets, light a row of lanes, spin a spinner.
  2. **Each small thing gives something**: a multiplier step, a lit kickback, a lit lock, a timed bonus.
  3. **Small things add up to a feature**: lock two balls for multiball, light every lane for double scoring, open a
     door to a new shot.
  4. **Features lead to the big goal**: the thing the table is about. Reaching it should need most of the table.
  5. **Finishing the big goal ends the run with a summary**, unless endless mode is on, in which case it starts
     again harder.
- **The player can always see where they are on the ladder** (section 4).
- **Progress is kept between balls** unless there is a reason not to. By default the multiplier and anything marked
  "resets each ball" start over; goal progress does not.
- **No decisions the player cannot judge.** Do not stop the game to ask a new player to choose between things they
  have not seen yet. If a choice is offered, it waits for a safe moment (the ball held in a scoop, or between
  balls), and there is an option to have choices made automatically.
- **A table of plain goals is a complete table.** Quests with givers, enemies and bosses are one way to dress the
  ladder (section 9). Lanes, banks, locks and a final shot are another. Both are the same ladder.

In code: the ladder can be written as data (`content.campaigns`: a list of steps such as "make this shot twice",
"complete that bank"; the engine tracks it, lights it and shows it) or in the table's own `rules.js`, or both.

## 6. Scoring

- **Every kind of thing has a default worth** (`RULESET.md`, section 3): a ramp, a target, a spinner turn, a
  jackpot. A table keeps the defaults unless it has a reason not to: its hardest shot can pay more, a table of
  quick laps can pay less for each (`points` in `table.js`). Scores are kept per table, so they need not compare.
- **A multiplier**, 1x to 6x, raised by doing something on the table and lost with the ball. It multiplies
  everything. It is shown on the playfield.
- **Combos.** Shots made quickly one after another pay more each time.
- **Jackpots.** During multiball the big shots pay a jackpot that grows.
- **An end-of-ball bonus**, counted from what was done during the ball, times the multiplier, lost on a tilt.
- **A big number for the big goal.**
- **High scores are kept**, per table, on the device.

## 7. The life of a ball

| Thing | Default |
|---|---|
| Balls in a run | 3 (`balls` in `table.js`) |
| Ball save | 10 seconds from the launch |
| Kickback | one, lit at the start of each ball, relit by a goal |
| Skill shot | a lane that flashes while the ball is on the plunger |
| Lock and multiball | lock two balls to start one, if the table has a lock |
| Tilt | the fifth nudge inside 4 seconds kills the flippers and the bonus; the fourth warns |
| A ball that stops moving | shaken loose after 2 seconds |

## 8. Feel

How the ball moves is shared code, so every table of mine feels related. The numbers are a preset, and a table
may pick another preset or change single numbers (`feel` in `table.js`; see `TABLE_FORMAT.md`).

| | `standard` |
|---|---|
| The table | a playfield is 640 wide and 1040 long; the ball is 22 across |
| Gravity | 1150 units/s² down the table |
| Top speed | 2300 units/s |
| A good flipper shot | about 1950 units/s: top of the playfield in half a second |
| Flippers | 82 long, pivots 200 apart, so the gap between the tips is about 56: two and a half balls |
| A wall | gives back 0.45 of the speed across it |
| A slingshot / a bumper | kicks at about 500 / 470 |
| A ramp | climbs one playfield from a normal shot; lets the ball out at up to 520 |
| The plunger | launches at 1330 to 1950 depending on how long it is held |

Other presets (`fast`, `slow`, `lively`) are listed in `TABLE_FORMAT.md`. They are starting points; judge them by
playing: add `?feel=fast` to a table's address to try one.

## 9. Optional systems

None of these is part of what makes a table a table. Each is a system the engine already has, built for
Gravebound, that a table may switch on. A table that uses none of them is a plain pinball table and is complete.

| System | What it adds | On when |
|---|---|---|
| Classes | A ball picked before the run, each with its own weight, a nudge power and a "cradle" shot | default; `uses:{classes:false}` for one plain ball |
| Levels | Experience, level-ups, an ability book | default with classes; `uses:{levels:false}` |
| Health | A health bar: enemies wound you, and at zero the flippers die | the table has enemies or bosses, unless `uses:{health:false}` |
| Enemies | Figures on the playfield that the ball fights, in waves | `content.foes` is given |
| Bosses | A big enemy with phases, as a goal | `content.bosses` is given |
| Quests | The goal ladder written as data: a main line of steps, shown in a journal | `content.campaigns` is given |
| Side quests | Extra errands handed out by a scoop | `content.side` is given |
| Party and Rally | Companions that guard the drain and come out as a multiball when the meter is full | default; `uses:{party:false}` |
| Cards | Boons and relics picked from cards after big moments | default; `uses:{cards:false}` |
| Coin | A currency, spent on recruits | default; `uses:{gold:false}` |
| The Grave | A room under the home playfield that catches a lost ball for one more chance | `layout.grave` is given |
| Wings | Side rooms with their own flippers, entered through a scoop | `layout.wings` is given |

What each one does in detail is in `RULESET.md`.

## 10. What makes a table good, past "it works"

Sections 1 to 7 describe a table that is not broken. These are what separate a good one. They are judgement, and
no test checks them.

- **Flow.** The ball moves in long lines and comes back to you with speed. You can string shots together without
  stopping to trap the ball. A table that makes you stop and aim every time is tiring.
- **A reason for every shot.** Each shot leads somewhere on the ladder. Nothing is on the table just to fill space.
- **One idea.** The best tables are about one thing (a chase, a heist, a climb) and every feature serves it.
- **Risk you choose.** The safest thing and the most valuable thing are different shots, and the player decides.
- **Rhythm.** Quiet stretches and loud ones. Multiball is loud; the minute before it should build.
- **You always know why you lost the ball.**
- **It reads at a glance.** Squint at a screenshot: can you tell where the flippers are, what is lit, and where
  the ball is? Ramps and scenery must never hide a flipper or an outlane.

## 11. Asking for a table

Say what you want in a sentence or two. Everything unsaid comes from this page.

> "A two-level table, dark fantasy, 6 kinds of enemy, 10 quests and 4 bosses."

Two playfields joined one above the other; classes, levels, health, enemies, bosses, quests and side quests on;
party, cards and Grave as Gravebound has them unless told not to.

> "One table, no health bar, no RPG stuff, only table goals. Space theme."

One playfield. `uses:{classes:false, party:false, cards:false, gold:false}`, no enemies, no bosses, no Grave. A
ladder of plain goals with a final shot. And still, without being asked: a light on every goal, the multiplier and
ball save shown on the playfield, a fair launch, several shots per flipper, a kickback, a skill shot, combos, an
end-of-ball bonus, three balls.

If a request is ambiguous about **shape** (how many playfields, how they connect) or about **which optional
systems** it wants, ask before building. Do not ask about anything this page already answers.

## 12. What gets checked

| What | Command | Checks |
|---|---|---|
| The ball never sticks; ramps can be climbed | `npm run soak -- <table>` | section 2 |
| Every flipper has shots; every shot can be reached | `npm run reach -- <table>` | section 3 |
| A fair launch; a light on every goal; game state on the playfield | `npm run standards -- <table>` | sections 2 and 4 |
| No optional system is holding the table up | `npm run switches -- <table>` | section 9 |
| Nothing else changed by accident | `npm test` | the other tables still play as recorded |

The first three report against this page; they are how I avoid repeating it. A table is not finished until it has
been played by a person.
