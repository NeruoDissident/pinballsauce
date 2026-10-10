# Table format

A table is a folder under `tables/`. The engine reads it; nothing in the engine knows any table by name.
Three tables ship, and each is a reference for something different:

- `tables/test-bench` — plain, no art. Uses every layout feature: fields on a grid, fields with no standard parts,
  three flipper sizes, extra flippers, gates, posts, status lamps, fast ramps, drain ramps. **Read its `layout.js`
  first**; it is short and commented.
- `tables/gravebound` — every *game* feature (wings, doors, three campaigns, a full theme). A plain stack.
- `tables/neon-descent` — a second themed table on the same rules. A plain stack.

```
tables/<id>/
  index.html     loads vendor/three (classic scripts), engine/ui/page.css, optional theme/theme.css, then main.js
  main.js        import {boot} from '../../engine/app/shell.js'; import table from './table.js'; boot(table);
  table.js       export default {id, name, store, layout, content, rules, theme}
  layout.js      DATA   where everything is
  content.js     DATA   foes, bosses, campaign, side quests, wings, words
  rules.js       HOOKS  what this table's own features do
  theme/         ART    palette, floor painters, models, scenery, page skin   (all optional)
```

`id` is the folder name. `store` namespaces saves (`pinballsauce.<store>.`); changing it orphans players' saves.
Optional on `table.js`: `blurb` (one line) and `accent` (a colour) for the picker of a combined build.
A table imports only from `engine/api.js`.

---

## 1. Layout (`layout.js`)

```js
export const layout={fields:[...], grave:{...}, wings:[...], ramps:[...], tunnels:[...], shots:[...]};
```

### What is fixed, and what is yours

The **cabinet** is fixed. A field is always 640 wide and 1040 deep, with side walls at x 20 and x 620, a shelf for
the flippers at y 900 and a way out below it. The plunger is always the lane up the right side of the home field.
Under the home field there is always the Grave.

Everything else is the layout's: where the fields stand, how many there are, what is inside each one, how many
flippers it has and how long they are, where the ramps go and how fast they are.

Two things the engine puts on a field at fixed places, which a layout has to leave room for:

- **The rune ring**, on every field: twelve dots (each about 21 across) on a circle of radius 96 round (cx, 650).
  They are the spellbook's lamps. Keep inserts, lamps and scoops off the dots; inside the ring is free.
- **The guard post**, on the home field only: a round post of radius 24 at (cx, 936), just below the gap between
  the flippers. It is there while the party has someone standing guard, and the ball bounces off it.

### Fields on a grid

Each field stands in a cell: `at: [column, row]`.

- Rows run down the table. Row 0 is the top. Rows are whole numbers.
- Columns run across. They may be halves and may be negative: a diamond is `[0,0]`, `[-0.5,1]`, `[0.5,1]`, `[0,2]`.
- On the whole table, a field's top-left corner is at x `690 * column`, y `40 + 1040 * row`. (Columns are 690
  apart, not 640: neighbours share one cabinet wall.)
- Two fields in the same row must be at least a whole column apart.
- Give every field an `at`, or give none. With none the fields are a **stack**: column 0, one row each, top first.

**Joined fields.** Two fields in the same column on consecutive rows are joined: a ball that falls between the
upper one's flippers drops through a chute into the lower one's arch, and the upper one's outlanes lead down too.
That is how Gravebound and Neon Descent are built.

**The home field** is the last one in the list. It has `shooter:true` (the plunger), the real drain, and the Grave
under it. It stands in column 0 on the lowest row.

**A field with nothing joined below it** (and which is not the home field) cannot lose the ball. It drains into a
**drain ramp** that carries the ball to a field you name (see Ramps). The engine refuses to load a layout that
leaves such a field without one.

### Coordinates

- Inside a field (`pieces`, `spawn`, `statue`, `boss`, `torches`, `rise`, `drop`, and `shots`), points are **local**:
  `[x, y]` from that field's own top-left corner. x 0 to 640, y 0 to 1040. Nothing changes if the field is moved.
- Ramp paths and tunnel waypoints cross fields, so they are points on the whole table. Write them as
  `['#fieldId', x, y]` (a point given in that field's own numbers; it may lie outside the field, e.g. y 1100 is
  60 below it) or as a plain `[x, y]` on the whole table. Prefer the first: it survives moving a field.
- A wing's own lists are local to the wing.

### The standard parts, and switching them off

Unless told otherwise every field is built with the standard parts (`engine/table/parts.js`), so that two tables
feel like one manufacturer made them:

| Part | What it is (local coordinates) | `standard:{...}` |
|---|---|---|
| Arch | A half circle of radius 300 centred (320, 300). Solid where nothing is joined above; where a field is joined above it has three one-way gates the ball drops in through | `arch:false`: a flat lid at y 20 and square corners instead. Not allowed on a field joined under another (the arch is how the ball arrives). Takes the orbits with it |
| Orbits | Guides at x 66 and x 574 from y 500 up round the arch; sensors at (43, 405) and (597, 405). Shot ids `orbitL<n>` and `orbitR<n>`, n the field's place in the list | `orbits:false` |
| Slingshots | A triangle each side, y 710 to about 830 | `slings:false` |
| Lanes | Each side: the guide between inlane and outlane (x 62, y 730 to 830), the one-way flap at the head of the outlane, an outlane sensor at (41, 782) and an inlane sensor at (81, 782); mirrored on the right | `lanes:false`: no guide, no flap, no sensors. The outlane is then simply open from above |
| Flippers | Pivots at (cx-100, 900) and (cx+100, 900), standard length | `flippers:'mini'` or `'long'`: the same pair, another size. `flippers:false`: none; place your own |

Always there, whatever you switch off: the two side walls, the **shelf** each side (from (62, 830) down to the
flipper at (cx-103, 891), mirrored), and the way out under it (the chute to the field joined below, the home
field's apron, or the throat of a drain ramp). `cx` is 320, and the right wall x 620. On the home field the plunger
lane takes x 586 to 620, so there `cx` is 303 and everything on the right sits 34 further left.

```js
standard:{arch:false, slings:false, lanes:false, flippers:'mini'}   // the West Wing of the test bench
```

A field with parts switched off is shaped by its own pieces: `wall`, `gate`, `post`, `sling`, `lane`, `flipper`.

### A field

```js
{id:'wilds', name:'The Wilds', short:'the Wilds',
 at:[0,1],                                  // where it stands (see above). Omit on every field for a plain stack
 height:110,                                // optional: how high it is drawn. Default: 75 for every row above the home field
 standard:{...},                            // optional: which standard parts it keeps (see above)
 shooter:true,                              // the home field only: it gets the plunger lane and the real drain
 statue:{id:'keystone', x:320, y:178, r:20},// optional: a target at the head of the field; hides while a boss is up
 boss:{x:320, y:650},                       // optional: where a boss stands (needed if a boss has this tier)
 spawn:[[150,585], ...],                    // where foes and pickups may appear: open floor, 6 to 8 points
 rise:[[200,400], ...], line:690,           // optional: where swarming foes rise, and the y they march down to.
                                            //   Default: five points round (cx, 390) and the slingshot line, y 690
 drop:[320,560],                            // optional: where a dev key (and the soak test) drops a ball in. Default (cx, 560)
 pieces:[ ... ],                            // see below. ORDER MATTERS: it is the collision order
 torches:[[x, y, '#colour', radius], ...]}  // lights (drawn, and baked into the floor)
```

Give `rise`, `line` and `drop` when the middle of your field is not open floor.

### Pieces

Every piece is `{t:'type', ...}`. Any key the type does not use is copied onto the built object, which is how data
flags reach the rules (`opensGrave`, `conduit`, `bell`, `skill`, ...).

| `t` | Keys | Makes |
|---|---|---|
| `bumper` | `x, y, r, group` or `at` (a point spec) instead of x, y; `kick` (470) | A pop bumper. `group` is its shot id. Flags: `opensGrave:true` (hits open the Grave), `conduit:true` (the mage's bolts), `bell:true` (a bell: calls a wave, 800 a hit) |
| `mouth` | `id, x, y, side` (-1 leans left, 1 leans right, 0 straight up) | A ramp entrance, and named points for other pieces. A ramp with the same `id` starts here |
| `block` | `name, pts` | A solid polygon (drawn 38 high). `pts` may contain a `['notch', cx, y]` |
| `hole` | `id, name, x, y, r, eject` | A scoop. Its behaviour is `rules.onScoop[id]`. `eject:'L'` or `'R'` drops the ball at the tip of that side's flipper (the lowest one, if the field has several). `eject:[vx, vy]` kicks it out with that velocity instead |
| `bank` | `id, name, kind` (`'drop'` or `'target'`), `from, to, n, pad` | `n` targets along the line. Two pieces with one `id` are one bank. `door:{time, popup:[title, text]}` makes it a door that stands open for `time` seconds when completed |
| `wall` | `pts, w` (half thickness), `style` (`'scoop'`, `'post'`), `bounce` | A wall. `bounce` is how lively it is: 0.45 unless given (0 dead, 0.8 rubber) |
| `gate` | `pts, solid:[x, y]` | A **one-way gate** along `pts`. It is a wall to a ball on the side `solid` is on, and open from the other side |
| `post` | `x, y, r` (6) | A round post |
| `sling` | `a, b, c` | A slingshot of your own: the triangle `a` (top), `b` (back corner), `c` (tip). The face from `a` to `c` kicks, away from `b` |
| `flipper` | `x, y, side, size, rest, up, dir` | A flipper of your own (see below) |
| `lane` | `kind` (`'inlane'` or `'outlane'`), `x, y, r` (14), `side` | One rollover that scores as an inlane or an outlane does (thieving foes run for an outlane; some boons act on one) |
| `spinner` | `id, x, y, r, rot` | A spinner. `content.spinCalls[id]` makes it call foes every 18 turns |
| `lanes` | `id, name, y, r, xs, posts:{xs, y0, y1, w}` | Rollover lanes lit as a set. Flags: `skill:true` (plunger skill shot), `ballReset:true` (unlit each ball), `col` |
| `floorSet` | `id, name, col` | Makes this field's inlanes and outlanes (standard ones and `lane` pieces listed before it) one lit set |
| `lamp` | `x, y, r` (8), `show, label, col` | A **status lamp** set into the floor (see below) |
| `scoopBlock` | `mouth, side, xg, topY, name` | The stock block between a side ramp mouth and the orbit guide, with a scoop notch at x 112 (left) or 528 (right), y 470 |
| `centerScoop` | `x, w` | The stock centre scoop surround (its hole goes at y 444) |
| `shooter` | | The plunger lane. Exactly one, on the home field |
| `kickback` | `x, y, r` | The left-outlane kickback |

**Point specs** (anywhere a piece expects a point):

| Form | Meaning |
|---|---|
| `[x, y]` | local point |
| `'@id.lb'` | a corner of mouth `id`: `lb` `rb` (the lip), `lt` `rt` (the throat, 70 further in) |
| `['@id.lb', dx, dy]` | that corner plus an offset |
| `{along:'id', d:116}` | `d` units up the mouth's own direction |
| `['notch', cx, y]` | six points of a scoop notch cut into a block, 40 wide, 38 deep, opening downward (in `pts` only) |

A mouth must be listed before pieces that refer to it.

### Flippers

```js
{t:'flipper', x:150, y:306, side:-1}                    // a third flipper up the field, on the left button
{t:'flipper', x:236, y:570, side:-1, size:'mini'}, {t:'flipper', x:404, y:570, side:1, size:'mini'}   // a second pair
```

- `x, y` is the pivot. `side` is the **button**: -1 the left one, 1 the right one. Every flipper on the table with
  that side moves when the button is pressed.
- `size`: `'mini'` (58 long), `'standard'` (82, the default) or `'long'` (92). A number is taken as a length.
- The bat points right from the pivot for a left-button flipper and left for a right-button one. `dir:1` or `dir:-1`
  says otherwise.
- `rest` (0.5) and `up` (-0.44) are its two angles, in radians below the horizontal. Leave them unless you mean it.
- Every flipper swings at the same rate (that is the manufacturer), so a longer bat throws harder. The best strikes
  leave a mini at about 1400 units a second, a standard at about 1950, a long at about 2200: enough to climb roughly
  820, 1650 and 2050 units of table. `npm run reach -- <id>` tells you what each flipper of your table can hit.
- A flipper needs something to bring the ball to it: the standard shelf, a wall, a gate, the end of a ramp.

### Status lamps

A real table prints its state on the playfield: 2X 3X 4X up the middle, SHOOT AGAIN between the flippers, LOCK by
the lock. A `lamp` piece is one of those.

```js
{t:'lamp', x:303, y:784, show:'mult2', label:'2x'}
{t:'lamp', x:303, y:818, r:10, show:'save', label:'ball save', col:'#62d8ff'}
```

| `show` | Lit when |
|---|---|
| `mult2` `mult3` `mult4` `mult5` `mult6` | the multiplier is at least that |
| `save` | the ball save is running (it flashes for the last 3 seconds) |
| `kickback` | the kickback is lit |
| `lockLit`, `lock1` | the lock is lit; one ball is locked |
| `mb` | a multiball is running (flashes) |
| `levelup`, `boon` | a level-up, or a boon, is waiting at a scoop (flashes) |
| `rally` | the power meter is full (flashes) |
| `combo` | a combo is running |
| `grave` | the Grave is open |
| anything in `rules.status` | the table's own: `status:{name: run => state}`, where state is 0 (dark), 1 (lit) or 2 (flashing) |

`col` defaults to the field's glow colour. A lamp is not a shot: quests and `rules.lamps` do not address it.

### Grave

```js
grave:{name:'The Grave', short:'the Grave', light:'The Light', nails:'Coffin Nails', torches:['#c','#c','#c']}
```

The room itself is a standard part (a coffin with its own flippers, a two-target bank, a way out, two bumpers).
Reserved ids inside it: bank `nails`, hole `rise`, bumper group `bones`. A table names it and words it
(`content.text.grave*`); it cannot reshape it.

### Wings (optional)

A wing is a small room with its own flippers, reached through a scoop on the main table.

```js
{key:'crypt', name:'The Crypt', short:'the Crypt',
 outline:[[x,y], ...],                       // the room's wall, local; first and last points are the two sides of its drain
 goal:{id:'sarc', name:'Sarcophagus'},       // the sealed scoop at the head of the room
 entry:{id:'cryptIn', name:'Crypt Stair', x:180, y:120},   // where the ball arrives
 pieces:[...], coins:[[x,y], ...], spawn:[...], shots:[...], torch:{col, spots:[[x,y] x3]},
 court:{x:-800, z:1178, e:-95, side:-1, z0:1080, z1:1980}}  // where the room is drawn in the world, beside the table
```

Its rule (`targets`, `kills` or `coins`) is in `content.wings[key]`.

### Ramps

```js
{id:'rampForest', name:'Forest Road', from:'hollow', to:'wilds', up:true, path:[['#wilds',81,640], ...],
 mouth:'otherId',   // optional: start at a mouth with a different id
 k:.2,              // optional: how hard gravity pulls along it (0.2)
 exitV:520,         // optional: the fastest it lets a ball leave (520)
 drag:.1,           // optional: the share of its speed a ball loses each second (0.1)
 lift:30,           // optional: extra height, so two ramps can cross
 col:'#rrggbb'}     // optional: its own colour (else theme.rampCol of the field it leaves)
```

- `from` and `to` are fields, by id (or by place in the list). `up:true` marks a ramp that climbs to another field.
- `path` continues from the mouth and ends where the ball is released, heading the way the last two points run. End
  somewhere that feeds a flipper: at a standard inlane that is `(81, 712)` on the left and `(559, 716)` on the right
  (`(525, 716)` on the home field), arriving downward.
- A ramp with `from === to` is a loop (it calls foes when made).

**How fast.** A ball enters a ramp at the speed it was shot (it needs at least 90 along the mouth). On the ramp only
two things change its speed. Gravity pulls along the *up-and-down-the-table* part of the path: climbing `d` units of
y costs `v² = 2 × 1150 × k × d`, and coming down gives the same back. Drag takes `drag` of the speed each second.
Sideways costs only drag. The ball leaves at its speed, held between 200 and `exitV`.

| What you want | Settings |
|---|---|
| A ramp that climbs one field (about 1000 up) | the defaults: it needs about 700 at the mouth |
| A ramp that climbs two fields | `k:.05` to `.075`: about 500 at the mouth |
| A freeway: fast, flat, hands the ball on at speed | `k:.1, drag:.02 to .03, exitV:900 to 1100` |
| A ramp that always delivers gently | leave `exitV` at 520, or lower it |

A ball that runs out of speed rolls back out of the mouth (`rampFail`). `tests/soak.mjs` prints made and failed per
ramp. A ramp is drawn 46 above the ground it crosses (plus `lift`), bridging the heights of the two fields it joins.

**Drain ramps.** The way out of a field that has nothing joined below it:

```js
{id:'chuteW', name:'West Drop', drain:'west', to:'home',
 path:[['#west',320,1180], ['#home',-30,440], ['#home',20,620], ['#home',81,640], ['#home',81,712]]}
```

No mouth. It starts at the foot of the `drain` field (cx, 1010): every ball that passes y 1010 there, anywhere across
the field, is taken onto it. It never lets a ball roll back. It ends like any ramp: where it feeds a flipper. `k`,
`exitV`, `drag`, `lift` and `col` work as on any ramp. Riding one is not a shot: it scores nothing and calls
`rules.on.chute`, not `ramp`. It needs no insert.

### Tunnels

```js
{from:'crypt', to:'catacombs', via:[['#hollow',560,380], ...]}   // scoop to scoop; only what the camera follows
```

A tunnel is used when `rules.onScoop[from]` sets `hd.plan='tunnel'`. The Grave needs one from `rise` to a scoop on
the home field.

### Shot inserts

```js
{id:'smithy', name:'Smithy', tier:'hollow', x:138, y:648, ang:radians, kind:'dot'}   // an arrow by default; ang defaults to straight up
{alias:'door', of:'secret'}                                                            // one insert standing for two ids
```

`tier` is the field, by id (or by place in the list); `x, y` are local to it. A shot id is the id of the ramp,
scoop, bank, bumper group, spinner, lane set, statue or orbit it stands for. **A quest step or a lamp can only name
an id that has an insert.**

### Height

Height is drawn, never simulated: the ball runs on one plane. Each field is a terrace. By default a field is 75
higher for every row it is above the home field; `height` on a field sets its own. Where two fields are joined the
chute between them slopes. Ramps and drain ramps bridge whatever heights they join.

---

## 2. Content (`content.js`)

```js
export const content={foes, bosses, campaigns, plan, side, wings, help, names, noPerks,
                      graveStir, ways, spinCalls, text};
```

Wherever content gives a `tier` (a boss, a quest step) it may be the field's id (`tier:'west'`) or its place in the
layout's list (`tier:2`). Ids survive reordering the fields; use them.

### Foes

```js
skeleton:{name:'Skeleton', job:'swarm', cost:1, hp:18, r:14, xp:8, gold:3, dmg:7, wind:1.6, rate:[5,8],
          figure:'skeleton', tint:{bone:'#7f8fa3', eyeG:'#43e7ed'}, undead:1}
```

- `job` is what it does; the engine plays it: `swarm` `thief` `hunter` `possess` `ritual` `wall` `duel` `gate`
  (see RULESET, "Foes"). Take the numbers from Gravebound's foe with the same job unless you mean to rebalance.
- `figure` picks a stock jointed figure: `skeleton goblin cultist revenant knight troll wolf spirit` (defaults to
  the foe's own key). `tint` recolours its materials; the material names each figure uses are listed in
  `engine/render/figurekit.js`.
- Flags: `undead` (the cleric class burns it), `ghost`, `armor:n`, `cast:seconds` (a ritual), `hop`, `prowl`,
  `beast`, `kick`. `cost` is what it takes from a wave's budget.

### Bosses

```js
warden:{name:'The Warden of the Ruined Gate', short:'The Warden', tier:1, hp:270, r:36, color:'#9fc0dc',
  seq:['shield','open','summon','open','cast','open'],   // phases, looped
  summon:'revenant', nSum:2, wardBy:'cultist',           // wardBy: the shield is foes to kill, not bumpers to hit
  cast:{name:'Portcullis Slam', time:11, dmg:22, curse:'weak', shots:['rampRuin','catacombs','hut'],
        closes:'rampWolf', frenzy:'wolf', fire:{x:320,y:505,r:125}, note:'The Wolf Run is barred'},
  frenzyFrom:'hut', moving:true, undead:true, xp:120, gold:80, relic:'key'}
```

`tier` is the field it stands on, by id or by place in the list (that field needs a `boss` spot). `cast.shots` are the shot ids that break the
cast; `closes` bars a ramp for the cast; `frenzy` drives that foe type wild; `fire` burns a circle of floor.
`frenzyFrom` is the scoop the frenzy multiball's balls come out of. `curse` is `weak` (flippers 84%), `dark`
(darkness round the ball), `burn` (3 health a second) or `hex` (half score). `relic` is an engine relic id.

### Campaigns and the plan

A run is one campaign. A campaign is a set of pools of quest steps; the `plan` says how the main quest is assembled.

```js
campaigns:{necro:{name, threat, boss:'necro', foes:['skeleton','spirit','cultist'], intro, win,
                  wing:{key:'crypt', name:'The Crypt', text:'...'},     // optional
                  omens:[step, ...], trail:step, wilds:[...], reveal:[...],   // pools: any names you like
                  plan:[...]}}                                              // optional: overrides content.plan
plan:[{shuffle:'omens', n:2, stage:'Omens'},      // n different steps from a pool
      {use:'trail', stage:'The Trail'},           // a fixed step of the campaign
      {pick:'wilds', stage:'The Wilds'},          // one step from a pool
      {boss:'warden', text:'...', stage:'...'},   // a boss; '$boss' means the campaign's own
      {wing:true},                                // the campaign's wing, if it has one
      {step:{t:'shot', id:'rampRuin', n:1, text:'...'}, stage:'The Climb'}]   // a step written here
```

A step is one of

```js
{t:'shot', id, n, text}            // make that shot n times (spinner turns and bumper hits count one each)
{t:'done', id, n, text}            // complete that bank or lane set n times
{t:'kill', e:'foe', tier, n, text} // the engine spawns them there
{t:'collect', tier, item, n, text} // a pickup appears on that field
{t:'boss', boss}                   // written by the plan
```

A side-quest step may carry `time:seconds`. `foes` is what the campaign's waves are made of. The order the plan
draws from pools is the order random numbers are consumed, so changing a plan changes that table's replay recording.

### Side quests

```js
{id, name, giver, text, steps:[step, ...], rw:{gold, xp, heal, relic:1}}
```

At least one side quest must begin on the home field (its first step a kill there or a shot there): a run starts
with one.

### Wings

```js
crypt:{name, gate:'catacombs', out:'catacombs', time:80, rule:'targets', bank:'sigils', lamps:['sigils','sigilsR'],
       // or rule:'kills', foe:'wolf', need:3      or rule:'coins', need:6
       opensDoor:true, col, sealCol, light, label, backTitle,
       enter, note, sealed:n=>'...', open, broke:[title,text], clock, late:[title,text], back, won}
```

`gate` is the scoop on the main table that leads in, `out` the scoop the ball comes back to.

### The rest

| Key | What |
|---|---|
| `names` | This table's words for the shared rules: `{classes:{knight:{name,tag,pass,nudge,nudgeText,shot,shotText,abil,abilText,color,glow}}, spells:{charge:{name,text}}, companions:{tank:{name,desc}}, roles, perks:{id:{name,desc}}, relics:{id:{name,desc}}, goals}`. Only the fields given change. Class keys are `knight rogue mage cleric`; an unknown key throws. |
| `noPerks` | Perk ids this table must not offer (it lacks the part): e.g. `['bellRinger']` on a table with no bell. |
| `graveStir` | `{foe, every}`: every n-th hit on an `opensGrave` bumper raises that foe. |
| `ways` | Optional. Which shots to light when a quest step is on another field. **Leave it out** and the engine works it out: it lights the ramps and tunnel scoops that begin the shortest road from the field the ball is on to the field the step is on (and lights nothing when the shortest road is down the drain). Written by hand it is `{up:{n:[shot ids]}, down:{n:[shot ids]}}`, keyed by the field's place in the list, where up means toward the start of the list; that form only makes sense for a stack. |
| `spinCalls` | `{spinnerId:{foes:[...]} or {camp:n}, text}`: what a spinner calls every 18 turns. |
| `help` | `[[heading, paragraph], ...]`: the How to Play pages. Written per table. |
| `text` | Words. Every key has an engine default in `engine/table/content.js` (`TEXT0`): title, titleSmall, eyebrow, version, hintFresh, quiet, lost, noMain, noSide, alone, tavern, tavernWaits, lockMb, coin, coinMark, wave, bell, watch, followed, barred, the Grave's (graveOpen, graveIn, graveObjNails, graveObjLight, graveLost, graveLid, graveClosed, graveCount, graveChip, graveStir, risen), and `explain:{shotId:'...'}` for the pause screen. |

---

## 3. Rules (`rules.js`)

```js
import {G, T, popup, heal, gold, score, xp, ...} from '../../engine/api.js';
export const rules={
  init(){},                 // once, when the table loads
  newRun(r){},              // a new run: put this table's own flags on r (they are saved with the run)
  tick(dt, r){},            // every step: this table's own timers
  lamps(add, r){},          // add(shotId, colour, state)   colour main|side|lock|gold|soft|danger|spell   state flash|lit|done
  status:{name: r => 0},    // this table's own status-lamp states: 0 dark, 1 lit, 2 flashing (a `lamp` piece shows one)
  onComplete:{bankOrSetId(x, y, r){}},     // a bank knocked down or a lane set lit
  onScoop:{holeId(h, b, hd, r){}},         // a ball in a scoop. hd.plan = 'eject' | 'tunnel' | 'wait'; hd.delay seconds
  on:{event(what, ball, r, impact){}}      // plain events (below)
};
```

**`on`: the table's say on plain events.** The engine does its own part first (scores, sounds, quest progress), then
calls the hook if the table has one. `ball` is `null` where there is none. `impact` is how hard the ball struck
(given for `sling`, `bump`, `target`, `drop`, `wall` and `flipHit`).

| Event | `what` | When |
|---|---|---|
| `sling` | the slingshot's wall | a slingshot kicked (`what.tier` is its field) |
| `bump` | the bumper | a pop bumper was hit |
| `target`, `drop` | the target | a standup was hit; a drop target went down (`what.bank` is its bank) |
| `lane`, `inlane`, `outlane` | the rollover | a ball rolled over it (`what.set` is a top lane's set) |
| `orbit`, `spin`, `kick` | the sensor | an orbit was made; a spinner turned once (no ball is given); a ball reached the kickback (it fires only if lit) |
| `rampIn`, `ramp`, `rampFail` | the ramp | a ball went in at the mouth; came out the far end; rolled back out |
| `chute` | the drain ramp | a drain ramp set a ball down on another field |
| `hole` | the scoop | a ball dropped into a scoop (after `onScoop`) |
| `flipHit` | the flipper | a moving flipper struck the ball |
| `wall` | the wall | a ball struck a wall hard |
| `kill` | the foe | a foe died |
| `boss`, `bossDown` | the boss | a boss began a phase (`what.phase`); a boss died |
| `ball`, `ballEnd` | `null` | a ball was served; a ball was lost for good |

Use `on` for what a feature *adds*. What a completed bank, a lit lane set or a scoop *does* still belongs in
`onComplete` and `onScoop`. Fields are indices at run time: `FIELD_INDEX.west` (from the api) is the West Wing's.

`r` is the run (`G.run`); `G` is the live game state; `T` is the built table (`T.holes`, `T.banks`, `T.rails`...).
The engine handles its own cases first (the Grave's bank and exit, doors, wing banks and wing scoops), then calls
the table's hook.

What hooks usually call (all from `engine/api.js`):

| Call | Does |
|---|---|
| `popup(title, text, kind)` | the banner; kind `good` `bad` `main` `boss` `mb` `info` |
| `float(x, y, text, colour, size)` | words rising off a spot |
| `score(n, x, y)`, `gold(n, x, y)`, `xp(n)`, `heal(n)` | pay out |
| `G.buffs.sharp=30` / `.aegis` / `.moon` | +25% damage / half damage / double scoring, in seconds |
| `G.curse={}` | lift curses |
| `r.mult`, `r.kickback`, `r.lockLit`, `r.charge` | multiplier (1 to 6), kickback lit, lock lit, power meter (0 to 100) |
| `callFoes(tier, [types], text, x, y)`, `campFoes(n)` | a small wave on a field; n foe types from the campaign |
| `spawnEnemy(type, tier)`, `waveJoin(e, tier)`, `spawnPickup(tier, 'gold')` | one foe; add it to the wave; a pickup |
| `lockBall(b)`, `startMultiball(name, extraBalls, fromHoleId)` | the two-ball lock; a multiball |
| `newSide()` | hand out a side quest (both tables do so only while the run holds fewer than two) |
| `drawTavern(3)`, `tavernOpen()`, `recruitCost()`, `G.pending.push('tavern')` | recruits for hire: copy Gravebound's `tavern` hook |
| `wingReady(holeId)`, `enterWing(hd)` | send the ball into a wing from its gate scoop |
| `later(seconds, fn)`, `pick(list)`, `relight()` | a delayed call; a random choice; recompute the lamps |

Use `Math.random()`, `pick()` and `rand()` freely in rules: rule randomness is part of the game and is replayed in
tests. Never in art.

---

## 4. Theme (`theme/index.js`, all optional)

With no theme at all a table runs in the engine's default look. Add what you want to change.

| Key | What |
|---|---|
| `pal` | one per tier (fields, then the Grave, then wings): `{a, b, acc, acc2, glow, stone}`: floor gradient top and bottom, two accents, the glow colour, wall base |
| `stoneCol`, `tierLight`, `rampCol`, `fog`, `motes` | wall colour per tier; light pool per field then the Grave; ramp colour per field; fog per tier; `{col, style}` (style is `'rise'`, `'blink'` or `'drift'`) per field then the Grave. Each falls back to `pal` |
| `music` | per field: `{wave, low:true}` (wave is `'sine'`, `'square'`, `'sawtooth'` or `'triangle'`) |
| `fonts` | `{fontD, fontL}`: the display and label faces lettered on the table (CSS font-family strings) |
| `flagstones:false` | no paving pattern on the floor |
| `floorBase(c)` | paints what shows between and round the fields (default: brickwork). It is called once for each column of joined fields, with x 0 to 640 across that column and y whole-table |
| `floorArt` | one painter per field: `(c, y, palette)`; a 2D canvas context clipped to the field. x is the field's own (0 to 640); y is whole-table, and the `y` passed in is the field's top |
| `paintGrave(c)` | the Grave's floor. `defaultPaintGrave(c)` is the stock one to start from |
| `bumper(b)`, `statue(s)` | models. Start from `bumperBase(b)` / `statueBase(s)` (see `engine/render/defaults.js` and either table's `theme/props.js`) |
| `figures`, `foePose` | a table's own jointed foe builders, by foe key (stock figures plus `tint` are usually enough) |
| `sprites:{bosses:{key(c){}}}` | a boss billboard, drawn in a 160-unit square centred on 0,0. Default: a hooded shape in the boss's colour |
| `scenery()` | builds the world round the table, including the ground. Helpers: `MB`, `box`, `cyl`, `cone`, `prism`, `groundY(x, y)`, `elev(y, x)` (the height of the floor at a point of the table: pass x as well as y, a table on a grid needs it), `M` (shared materials) |
| `materials(M)` | change the shared materials (walls are `M.stone[tier]`, `M.frame`, `M.dark`) |
| `wingArt`, `wingProps` | per wing key: a floor painter and a prop builder |
| `fitNames:false` | letter level names at a fixed size (Gravebound keeps the original's); the default shrinks a long name to fit |

`theme/theme.css` (linked from the table's `index.html` after `engine/ui/page.css`) re-skins the page by setting the
variables `page.css` is written with: `--void --stone --stone-2 --line --bone --ash --gold --blood --frost --moss
--violet --display --label --body`.

Art rules: no `Math.random` (use `hash(n)`), keep floor art faint enough that inserts read over it, and remember
only what a real table would print belongs on the floor: walls, blocks, ramps and targets are real geometry.
