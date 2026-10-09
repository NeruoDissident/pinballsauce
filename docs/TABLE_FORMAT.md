# Table format

A table is a folder under `tables/`. The engine reads it; nothing in the engine knows any table by name.
`tables/gravebound` uses every feature described here and is the reference. `tables/neon-descent` is the shortest
complete second example.

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

### Coordinates

- 640 wide. Fields are listed **top first**, 1040 apart: field `i` starts at table y `40 + 1040*i`.
- Inside `pieces`, `spawn`, `statue`, `boss`, `torches` and a wing's own lists, points are **local**: `[x, y]`
  measured from that field's (or wing's) top.
- `ramps[].path` and `tunnels[].via` are in **whole-table** coordinates.
- `shots[]` positions are local to the field named by `tier`.

### What every field gets without asking (standard parts)

Built by `engine/table/parts.js`; identical on every table:

| Part | Where (local) |
|---|---|
| Arch | a half circle of radius 300 centred (320, 300). Solid on field 0; on lower fields it has three one-way gates the ball drops in through |
| Orbit guides and orbit sensors | guides at x 66 and x 574 from y 500 up round the arch; sensors at (43, 405) and (597, 405) |
| Slingshots | either side, y 710 to 830 |
| Flippers | pivots at (cx-100, 900) and (cx+100, 900), 82 long |
| Inlanes, outlanes | sensors at y 782: x 41 and 81 on the left, mirrored on the right |
| Chute to the field below | the gap between the flippers and the two outlanes all lead down; on the bottom field they drain |

`cx` is 320 and the right wall is x 620, except on the bottom field, where the plunger lane takes x 586 to 620: there
`cx` is 303 and everything on the right sits 34 further left.

### A field

```js
{id:'wilds', name:'The Wilds', short:'the Wilds',
 shooter:true,                              // the bottom field only: it gets the plunger lane and the drain
 statue:{id:'keystone', x:320, y:178, r:20},// optional: a target at the head of the field; hides while a boss is up
 boss:{x:320, y:650},                       // optional: where a boss stands (needed if a boss has this tier)
 spawn:[[150,585], ...],                    // where foes and pickups may appear: open floor, 6 to 8 points
 pieces:[ ... ],                            // see below. ORDER MATTERS: it is the collision order
 torches:[[x, y, '#colour', radius], ...]}  // lights (drawn, and baked into the floor)
```

### Pieces

Every piece is `{t:'type', ...}`. Any key the type does not use is copied onto the built object, which is how data
flags reach the rules (`opensGrave`, `conduit`, `bell`, `skill`, ...).

| `t` | Keys | Makes |
|---|---|---|
| `bumper` | `x, y, r, group` or `at` (a point spec) instead of x, y; `kick` (470) | A pop bumper. `group` is its shot id. Flags: `opensGrave:true` (hits open the Grave), `conduit:true` (the mage's bolts), `bell:true` (a bell: calls a wave, 800 a hit) |
| `mouth` | `id, x, y, side` (-1 leans left, 1 leans right, 0 straight up) | A ramp entrance, and named points for other pieces. A ramp with the same `id` starts here |
| `block` | `name, pts` | A solid polygon (drawn 38 high). `pts` may contain a `['notch', cx, y]` |
| `hole` | `id, name, x, y, r, eject` (`'L'` or `'R'`: which flipper tip it feeds) | A scoop. Its behaviour is `rules.onScoop[id]` |
| `bank` | `id, name, kind` (`'drop'` or `'target'`), `from, to, n, pad` | `n` targets along the line. Two pieces with one `id` are one bank. `door:{time, popup:[title, text]}` makes it a door that stands open for `time` seconds when completed |
| `wall` | `pts, w` (half thickness), `style` (`'scoop'`, `'post'`) | A wall |
| `spinner` | `id, x, y, r, rot` | A spinner. `content.spinCalls[id]` makes it call foes every 18 turns |
| `lanes` | `id, name, y, r, xs, posts:{xs, y0, y1, w}` | Rollover lanes lit as a set. Flags: `skill:true` (plunger skill shot), `ballReset:true` (unlit each ball), `col` |
| `floorSet` | `id, name, col` | Makes this field's two inlanes and two outlanes one lit set |
| `scoopBlock` | `mouth, side, xg, topY, name` | The standard block between a side ramp mouth and the orbit guide, with a scoop notch at x 112 (left) or 528 (right), y 470 |
| `centerScoop` | `x, w` | The standard centre scoop surround (hole goes at y 444) |
| `shooter` | | The plunger lane. Exactly one, on the bottom field |
| `kickback` | `x, y, r` | The left-outlane kickback |

**Point specs** (anywhere a point is expected):

| Form | Meaning |
|---|---|
| `[x, y]` | local point |
| `'@id.lb'` | a corner of mouth `id`: `lb` `rb` (the lip), `lt` `rt` (the throat, 70 further in) |
| `['@id.lb', dx, dy]` | that corner plus an offset |
| `{along:'id', d:116}` | `d` units up the mouth's own direction |
| `['notch', cx, y]` | six points of a scoop notch cut into a block, 40 wide, 38 deep, opening downward (in `pts` only) |

A mouth must be listed before pieces that refer to it.

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
{id:'rampForest', name:'Forest Road', from:2, to:1, up:true, path:[[x,y], ...],
 mouth:'otherId',   // optional: start at a mouth with a different id
 k:.2,              // optional: how hard gravity pulls along it. Use about .05 to .075 for a ramp that climbs two fields
 lift:30,           // optional: extra height, so two ramps can cross
 col:'#rrggbb'}     // optional: its own colour (else theme.rampCol[from])
```

`path` continues from the mouth, in whole-table coordinates, and ends where the ball is released, heading the way
the last two points run. End at an inlane: `(81, top+712)` on the left, `(559, top+716)` on the right, arriving
downward, as every ramp in the two shipped tables does. A ball needs about 700 units/s to climb one field. A ramp
with `from === to` is a loop (it calls foes when made). Check a new ramp with `tests/soak.mjs`: it prints made and
failed per ramp.

### Tunnels

```js
{from:'crypt', to:'catacombs', via:[[x,y], ...]}   // scoop to scoop; whole-table coordinates; only what the camera follows
```

A tunnel is used when `rules.onScoop[from]` sets `hd.plan='tunnel'`. The Grave needs one from `rise`.

### Shot inserts

```js
{id:'smithy', name:'Smithy', tier:2, x:138, y:648, ang:radians, kind:'dot'}   // an arrow by default; ang defaults to straight up
{alias:'door', of:'secret'}                                                     // one insert standing for two ids
```

A shot id is the id of the ramp, scoop, bank, bumper group, spinner, lane set, statue or orbit it stands for. Orbits
are `orbitL<field>` and `orbitR<field>`. **A quest step or a lamp can only name an id that has an insert.**

---

## 2. Content (`content.js`)

```js
export const content={foes, bosses, campaigns, plan, side, wings, help, names, noPerks,
                      graveStir, ways, spinCalls, text};
```

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

`tier` is the field it stands on (that field needs a `boss` spot). `cast.shots` are the shot ids that break the
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

At least one side quest must begin on the bottom field (its first step a kill there or a shot there): a run starts
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
| `ways` | `{up:{field:[shot ids]}, down:{field:[shot ids]}}`: the shots to light when a quest step is on another field. |
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
  onComplete:{bankOrSetId(x, y, r){}},     // a bank knocked down or a lane set lit
  onScoop:{holeId(h, b, hd, r){}}          // a ball in a scoop. hd.plan = 'eject' | 'tunnel' | 'wait'; hd.delay seconds
};
```

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
| `stoneCol`, `tierLight`, `rampCol`, `fog`, `motes` | wall colour per tier; light pool per field then the Grave; ramp colour per field; fog per tier; `{col, style:'rise'|'blink'|'drift'}` per field then the Grave. Each falls back to `pal` |
| `music` | per field: `{wave:'sine'|'square'|'sawtooth'|'triangle', low:true}` |
| `fonts` | `{fontD, fontL}`: the display and label faces lettered on the table (CSS font-family strings) |
| `flagstones:false` | no paving pattern on the floor |
| `floorBase(c)` | paints what is between the fields (default: brickwork) |
| `floorArt` | one painter per field: `(c, y, palette)`; a 2D canvas context clipped to the field, in table coordinates; `y` is the field's top |
| `paintGrave(c)` | the Grave's floor. `defaultPaintGrave(c)` is the stock one to start from |
| `bumper(b)`, `statue(s)` | models. Start from `bumperBase(b)` / `statueBase(s)` (see `engine/render/defaults.js` and either table's `theme/props.js`) |
| `figures`, `foePose` | a table's own jointed foe builders, by foe key (stock figures plus `tint` are usually enough) |
| `sprites:{bosses:{key(c){}}}` | a boss billboard, drawn in a 160-unit square centred on 0,0. Default: a hooded shape in the boss's colour |
| `scenery()` | builds the world round the table, including the ground. Helpers: `MB`, `box`, `cyl`, `cone`, `prism`, `groundY`, `elev`, `M` (shared materials) |
| `materials(M)` | change the shared materials (walls are `M.stone[tier]`, `M.frame`, `M.dark`) |
| `wingArt`, `wingProps` | per wing key: a floor painter and a prop builder |
| `fitNames:false` | letter level names at a fixed size (Gravebound keeps the original's); the default shrinks a long name to fit |

`theme/theme.css` (linked from the table's `index.html` after `engine/ui/page.css`) re-skins the page by setting the
variables `page.css` is written with: `--void --stone --stone-2 --line --bone --ash --gold --blood --frost --moss
--violet --display --label --body`.

Art rules: no `Math.random` (use `hash(n)`), keep floor art faint enough that inserts read over it, and remember
only what a real table would print belongs on the floor: walls, blocks, ramps and targets are real geometry.
