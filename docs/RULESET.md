# The rule set

What the shared code does: the machine, the scoring, and each optional game system in detail. `PINBALL.md` says
what a table should have and why; this page is the reference for how each part behaves and what its numbers are.

**Nothing below section 3 is compulsory.** Sections 1 to 3 and 6 (the machine, a ball's life, scoring, lock and
multiball) are on every table. Every other section describes an optional system: it applies only to a table that
has switched that system on (`uses` in `table.js`, or the data that brings it; see TABLE_FORMAT). Each heading says
which.

These are defaults, not law. A table changes how the ball moves with its `feel`, and what its own features do in
its `rules.js`. Changing a number on this page changes it for every table: do that when the owner wants every table
changed, and say so. Each section names the file that holds it. Numbers are read from the code; if this page and
the code disagree, the code is right and this page needs fixing.

Units: table units (a playfield is 640 wide), seconds. Words in `code` are engine ids.

## 1. The machine (`engine/physics/physics.js`, `engine/table/parts.js`)

The numbers in this section are the `standard` feel. A table on another feel has its own (TABLE_FORMAT, "`feel`").

- Physics runs at 480 steps a second, 1920 while a flipper is swinging. The game logic steps at 120.
- Gravity 1150 down the table. Top ball speed 2300. Planar: height is drawn only.
- Flippers are 82 long. **Every left flipper on the table moves together, and every right one.** A flipper has a
  power stroke: it is punched to 70% of its top speed at once, the rest builds over the next hundredths of a
  second, and the power is cut for the last twentieth of the swing. The stroke takes about 46 ms. How hard the
  ball is hit depends on where along the bat it is and when in the swing it is met.
- Plunger: hold to charge (0.85 s to full), release to launch at 1330 to 1950.
- Nudge: kicks every live ball up 230 and 90 toward the centre, and on a table with classes fires the class nudge
  power (2.5 s cooldown).
  A fifth nudge inside 4 seconds is a **tilt**: flippers dead, ball save gone, bonus forfeit. The fourth is a warning.
- A ball that sits still for 2 seconds (or stays within 46 units for 6) is shaken loose by the engine.
- Ramps: a ball enters a mouth if it is moving more than 90 into it. On a ramp, gravity pulls along the path at
  `k` (0.2) of its normal strength and the ball leaves at 200 to 520.
- Scoops hold the ball for a moment, then eject it to the tip of a flipper on their own field, or send it down a tunnel.

## 2. A ball's life (`engine/rules/ball.js`, `score.js`)

- Three balls a run (`balls` in `table.js`). Multiplier, kickback, ball-reset lane sets, curses and buffs reset each
  ball. On a table with health, it is topped up to 60% at the start of a ball.
- **Ball save** runs from the plunger launch: 10 seconds, plus the class's bonus if there are classes. A saved ball
  is re-served.
- **Kickback** (where the layout puts it: the left outlane of the home field on the shipped tables) fires once, then
  must be relit.
- **Drain**: on the home field, with no save (and, where the table has them, no ward and no open Grave), the ball
  is lost. A field joined above another
  drops the ball into it; any other field hands it to a chute that carries it to a field the layout names.
- **Health** (tables with enemies or bosses, unless switched off): foes and boss casts wound the hero (at 30% of
  their listed damage). At zero the hero is *fallen*: flippers dead until the ball drains.
- **End-of-ball bonus**: ramps x 300, plus one line for each system the table has (foes slain x 400, side quests
  x 8000, level x 2500), plus any lines the table's `rules.bonus` adds; times the multiplier. Nothing on a tilt.

## 3. Scoring (`engine/rules/events.js`, `score.js`; the values are `POINTS0` in `engine/table/content.js`)

These are the defaults. A table changes any of them with `points` in its `table.js` (TABLE_FORMAT, "`points`").

| Hit | Points |
|---|---|
| Slingshot | 110 |
| Bumper (bell bumper) | 250 (800) |
| Standup target / drop target | 500 / 750 |
| Top lane / inlane, outlane | 400 / 300 |
| Skill shot (the blinking lane off the plunger) | 15,000 |
| Spinner, per turn | 150 |
| Scoop | 2,500 x combo |
| Orbit / full orbit (up one side, down the other inside 4 s) | 3,000 x combo / 6,000 |
| Ramp | 4,000 x combo |
| Bank or lane set completed | 8,000 x combo |
| Boss hit / boss slain | 1,500 / 150,000 |
| Wave cleared | 4,000 x foes x level |
| Main-quest step / side quest / main quest | 20,000 / 25,000 / 250,000 |
| Out of the Grave / a wing won | 50,000 / 100,000 |
| Jackpot (ramps and orbits during multiball) | 40,000, +8,000 each, to 200,000 |

Everything is multiplied by the **multiplier** (1x to 6x; resets each ball), doubled by the `moon` buff, halved by
the `hex` curse. **Combo**: ramps, orbits, scoops and completed banks made within 5 seconds of each other count up;
the combo factor is 1 + 0.25 per step, to 3x.

## 4. The four classes (`engine/rules/classes.js`, `powers.js`) — optional: `classes`

A table without classes plays one plain ball: radius 11, no passive, no nudge power, no cradle shot.

| id | Health | Power | Crit | Takes | Ball | Passive |
|---|---|---|---|---|---|---|
| `knight` | 150 | 11 | 5% | 30% less | heavy, radius 12.5, bumpers barely move it; +5 s ball save | none beyond the ball itself |
| `rogue` | 95 | 10 | 18% | | small and fast, radius 10 | combo shots always crit; opens a door bank in one hit |
| `mage` | 85 | 10 | 8% | | radius 11 | lightning arcs to foes it passes; `conduit` bumpers strike for it |
| `cleric` | 120 | 10 | 6% | 10% less | radius 11; +2 s ball save | burns `undead` foes near the ball; opens the Grave twice as fast |

- **Power meter** (0 to 100) fills from hits, kills, shots, spins and lanes, at rates set per class.
- **Class nudge** (every nudge, 2.5 s cooldown): knight staggers foes near the ball, rogue cloaks the ball briefly,
  mage bolts the nearest foe, cleric heals a little and lifts a curse.
- **Class shot**: cradle the ball on a raised flipper for 0.8 s with at least one bar (33) of meter. The next flip
  fires it and spends the bar. Knight: a ram (2.5x, breaks armor, flattens drop banks). Rogue: a sure crit, triple on a boss.
  Mage: explodes on impact. Cleric: hallows the ground it hits.
- **Rally**: cradle a full meter for 1.5 s (section 7).

A table may rename classes and re-colour them (`content.names`). The ids and the numbers stay.

## 5. Levelling, the spellbook, boons, relics (`score.js`, `spells.js`, `choices.js`, `perks.js`) — optional: `levels`, `cards`

Levelling and the spellbook come with `levels` (which needs classes). Boons and relics come with `cards`.

- XP for the next level: 45 x 1.32^(level-1). A level gives +8 max health, +2 power, 20 health, and a **spellbook
  card**, taken at the next scoop: unlock one of the class's four abilities or raise one of an unlocked ability's
  three rows (three ranks each).
- An ability is **cast on the table** by meeting its slot's goal on the field the ball is on:

| Slot | Goal | Lamps |
|---|---|---|
| `breaker` | complete a bank | every bank on the field |
| `guard` | three lanes, then a scoop | the scoops, once the lanes are done |
| `striker` | two ramps | every ramp from the field |
| `pressure` | two orbits, or twenty spinner turns | orbits and spinners |

  It runs for its duration (8 to 12 s, +3 a rank); meeting the goal again extends it, to twice the base. Abilities
  stack. Casting on a quiet field draws three foes out.

| Class | breaker | guard | striker | pressure |
|---|---|---|---|---|
| knight | `charge` every flip is a ram | `aegis` returns a lost ball, halves damage | `warcry` every hit staggers | `shieldWall` strikes are thrown back |
| rogue | `cloak` passes through foes, cutting | `smoke` foes lose the ball | `markedPrey` every hit crits and marks | `knives` blades fan out each second |
| mage | `frostNova` freezing pulses | `barrier` absorbs strikes, then bursts | `meteor` meteors fall round the ball | `blink` chain lightning, bumpers bolt |
| cleric | `consecration` hallowed ground along the path | `sanctuary` no curses, kickback lit, a ball returned | `judgement` holy fire on every bumper and target | `radiance` a burning, healing aura |

- **Boons** (perks): three cards after a boss falls, taken at the next scoop. Ids: `laneKeeper rampRunner bellRinger
  ironFlip chance bargain tollgate hallowed momentum tithe ward` (table boons), `edge will fortune guardian breaker
  harvest mark zeal second` (stats), `bloodPact twinSoul hourglass deathWish` (keystones, one a run). A table lists
  boons it cannot support in `content.noPerks`.
- **Relics**: from bosses (`relic` on the boss), wings and some side quests. Ids: `moonstone finger spade ember coin
  pelt handbell hymnal key scale whet`.

## 6. Lock and multiball (`events.js`)

- `lockBall(b)`: the first ball is held and a new one served; the second starts a two-extra-ball multiball from that
  scoop. Which scoop is the lock, and what lights it, is the table's (`r.lockLit`).
- `startMultiball(name, extra, fromScoop)`: ball save 8 s; ramps and orbits pay jackpots while more than one ball is
  in play. At most five balls on the table.

## 7. The party (`party.js`, `tavern.js`, `rally.js`) — optional: `party`

- **Companion** (picked with the class): `tank` (130 health), `healer` (80), `dps` (70). It stands on a post in the
  bottom drain. A ball that would go out bounces off it at a cost of 12 of its health, and fires its perk (tank takes
  a strike meant for you every 12 s; healer heals 10 and lifts a curse; dps marks the nearest foe for crits). Swarm
  foes attack it. At zero it falls and the drain stands open until any bank is completed.
- **Recruits**: a scoop the table chooses sells them, three offers a visit: a class with one of its abilities.
  Price 40 + 15 per recruit held; six at most.
- **Rally**: the companion and every recruit come out as balls, one every 0.55 s, for 20 s. Each pulses every 1.1 s
  (bolts, shockwaves, heals) and recruits run their ability. The camera stays on your ball; losing it ends the Rally.
  Party balls cannot enter scoops.

## 8. Foes and waves (`foes.js`, `waves.js`) — optional: on when the table lists foes

Every foe has a job, a visible wind-up before it strikes, and a shot that answers it. Hitting it during the wind-up
cancels the strike.

| `job` | What it does | Answer |
|---|---|---|
| `swarm` | rises at the top, walks to the slingshot line or to your guard, strikes | hit it on the way |
| `thief` | steals coin or loose pickups and runs for an outlane | kill it to get it back |
| `hunter` | prowls and lunges at the ball, batting it toward the drain | hit it between lunges |
| `possess` | sits on a bumper and deadens it | shoot through it |
| `ritual` | chants at a ramp mouth | shoot that ramp |
| `wall` | holds an orbit entrance; soft hits bounce off | a hard hit, or break its armor |
| `duel` | guards the statue (or the boss); parries weak hits | a hard hit |
| `gate` | holds a scoop and punts the ball | a hard hit staggers it |

- **Waves** come on a clock that runs on the ball's field (three times as fast while the field is empty), every 30 s
  less 1.5 a level, never under 14. A wave's budget is 3 + 0.6 a level (+2 per finished campaign); foes cost their
  `cost`. Clearing a wave pays 8 + 3 a foe in coin. At most 22 foes on the table, 10 on a field.
- Features **call** small waves (`callFoes`): a ramp whose layout line says `calls:n`, a spinner every 18 turns
  (`content.spinCalls`), a table's own banks.

## 9. Bosses (`bosses.js`) — optional: on when the table lists bosses

A boss stands on its field's circle. The circle's runes fill as the main quest closes in on its step; then it rises.
It loops through its `seq`:

| Phase | What | Ends |
|---|---|---|
| `shield` | warded: hits bounce off | strike every lit bumper on its field, or kill its warders (`wardBy`); 45 s at most |
| `open` | hit it | 30% of its health dealt, or 24 s |
| `summon` | `nSum` of `summon` rise; it takes half damage | they are dead, or 28 s |
| `cast` | a spell on a timer; its `shots` flash red | any of those shots **interrupts**: 9 s stagger, double damage, 30,000. Else it lands: damage and a curse |
| `frenzy` | open, and a two-ball multiball starts from `frenzyFrom` | as `open` |

Killing a boss pays 150,000, its `xp`, `gold` and `relic`, and a boon. Health scales +40% per finished campaign.

## 10. Quests and lamps (`quests.js`, `run.js`, `lamps.js`) — quests optional: on when the table lists campaigns

Lamps and status lamps (the last two points here) are on every table, quests or not: a table without quests lights
its own shots through `rules.lamps`.

- A run has one **main quest**, assembled from the campaign by the table's `plan`, and up to two **side quests**
  if the table lists any. A main quest needs no enemies: its steps can all be shots and banks (Starfall's are).
- Steps: `shot`, `done`, `kill`, `collect`, `boss` (see TABLE_FORMAT). Progress is called out where it was made.
- Winning the main quest pays 250,000 and ends the run, or in endless mode starts the next campaign one notch harder.
- **Lamps**: every insert has a state. Flashing: do this now. Steady: available. Dim: collected. Colours: gold
  `main` quest, blue `side` quest, green `lock`, pink-violet `spell` goal, white `soft` (a feature that is open),
  red `danger` (a boss cast to break), amber `gold` (a payout waiting). When a quest step is on another field, the
  way there is lit: the ramps and tunnel scoops that begin the shortest road (or the table's own `ways`, if it
  lists them).
- **Status lamps** are separate from inserts: lights a layout sets into the floor to show the multiplier, the ball
  save, the kickback, the lock, a full meter, an open Grave, or a state of the table's own (TABLE_FORMAT, "Status
  lamps"). They change nothing; they show.

## 11. The Grave (`grave.js`) — optional: on when the layout has a `grave`

- Bumpers flagged `opensGrave` count hits: 8 open it (12 the second time, 16 the third; the cleric counts double).
- An open Grave takes the next lost ball, tilted or not, instead of draining it: a room with its own flippers and a
  22-second clock that starts when the ball lands.
- Knock down both `nails` targets (+3 s each), then shoot `rise`: 50,000, ball save 6 s, and the ball comes back up
  through the table's `rise` tunnel. The two bumpers add a second each, four times.
- Out of time, the flippers die. A ball lost in the Grave is lost.

## 12. Wings (`wings.js`) — optional: on when the layout lists wings

A side room with its own flippers, reached through its `gate` scoop once the main quest opens it. A clock runs
(`time`, 80 s in Gravebound). Meet the room's `rule` to break the seal on its scoop: `targets` (light its bank; +6 s
a target), `kills` (slay `need` of `foe`), `coins` (roll over `need` coins). Shoot the scoop: 100,000, a relic.
Draining or running out of time carries the ball back to the `out` scoop; it is never a lost ball.

## 13. Saves (`run.js`, `core/util.js`)

Saved under `pinballsauce.<store>.` in local storage: the run (at each ball, each main-quest step, each finished
quest), options, high scores, and on a table with bosses and coin a legacy count (bosses slain: new runs start
with 10 coin each, to 100).
A run that used dev keys is marked.

## What a table decides

Which of the optional systems it has, and its feel. Where everything is; which scoop is the lock, which sells
recruits and side quests, which are tunnels; what each bank and lane set gives (`rules.onComplete`); its foes' and
bosses' names, numbers and looks; its goals; every word. For a table that uses the RPG systems, Gravebound's
choices are a good place to start from (NEW_TABLE_CHECKLIST, "Feature map"); for a plain one, Starfall's.
