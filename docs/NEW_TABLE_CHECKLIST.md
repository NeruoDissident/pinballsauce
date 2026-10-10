# Making a new table

For "today I want a space pinball game". Follow it top to bottom, with `TABLE_FORMAT.md` open beside it for the exact
keys. Read `tables/test-bench/layout.js` before you start: it is the shortest layout that uses every feature.

The engine gives you the cabinet and the rules. **The playfield is yours**: how many fields, where they stand, what
is in each one, how many flippers and how long, where the roads go and how fast they are. What is not yours is the
physics, the scoring and the size of a field: those are the manufacturer, and they are why two tables feel related.

## The priorities

When two things pull against each other, the earlier one wins. Check your table against them in this order.

1. **The ball never sticks.** No ledge it can rest on, no gap it can wedge in.
2. **The ball always comes back to a flipper.** Every ramp, scoop, orbit and chute ends where it feeds one.
3. **Every shot can be made, and every flipper has shots.** Three to five per flipper, at different angles.
4. **The player can read the table.** Nothing overhead hides a flipper. Every shot has an insert in front of it.
   What the game is doing is on lamps, where a real table would put them.
5. Then the theme.

Each has a test (step 8). A table that fails 1, 2 or 3 is not finished however good it looks.

## 0. Settle the brief (ask the owner, or decide and say what you decided)

1. Theme and mood in a sentence. Three or four colours.
2. **The shape**: how many fields and how they stand (step 1). This is the first thing a player sees. If the owner
   described a shape ("a diamond", "one big table", "a tower"), build that shape. If you think another would play
   better, say so and ask. Do not quietly build the other one.
3. The journey: where the ball starts, where the last boss stands, how the player gets there.
4. What makes it this table: one or two things (fast freeways, a third flipper, a room with tiny flippers).
5. Wings (side rooms) or not. Optional.

## 1. Choose the shape

A field is a cell 640 wide and 1040 deep. Put fields on the grid with `at: [column, row]` (TABLE_FORMAT, "Fields on
a grid"). Some shapes:

```
 one table        a stack            a diamond              a row of rooms         a tower with a side room
                  [0,0]                 [0,0]                                           [0,0]
  [0,0]           [0,1]            [-.5,1] [.5,1]        [-1,0] [0,0] [1,0]              [0,1]  [1,1]
                  [0,2]                 [0,2]                                           [0,2]
```

The rules of the grid:

- **The home field is the last one listed.** Column 0, the lowest row. It has the plunger and the only real drain.
- **Same column, next row = joined.** The upper field's drain falls into the lower field's arch. Nothing to write.
- **Any other field needs a drain ramp** to a field you name. Losing the ball there costs position, not the ball.
- **Every field needs a way in and a way on.** Draw the roads before the fields: for each field, which ramp or
  chute brings the ball, and which ramp takes it further. A field nothing leads to is dead; a field with no way on
  is a trap for the quest.

Write the plan down as a list before any geometry: field, where it stands, how the ball gets in, how it gets out
(up and down), and the one thing that field is for.

## 2. Start from a copy

```
cp -r tables/test-bench tables/<id>       # plain, no art, a grid.     Or tables/neon-descent (themed, a stack, no
                                          # wings) or tables/gravebound (themed, a stack, wings).
```

- `table.js`: set `id`, `name`, `store` (all new), `blurb`, `accent`.
- `index.html`: the `<title>` and `theme-color`.
- Root `index.html`: add the table to the list.
- If you copied a themed table, empty `theme/index.js` down to `export const theme={};` and delete the other theme
  files. Layout first, art last: you will see the engine's default look until step 7.

## 3. Design each field

### What the ball does (the numbers)

| Fact | Number |
|---|---|
| The ball | radius 11 (party balls 10 to 12.5): about 22 across |
| Gravity | 1150 units/s², toward the bottom of the table. Top speed 2300 |
| A climb of `h` units costs | `v² = 2 × 1150 × h`. A ball at 1000 climbs 435; at 1500, 980; at 2000, 1740 |
| Best strike off a flipper | mini about 1400 (climbs 820), standard about 1950 (1650), long about 2200 (2050) |
| A wall | gives back 0.45 of the speed across it. Under 70 units/s nothing bounces: the ball settles and rolls |
| A slingshot | adds 420 to 580 away from its face |
| A pop bumper | adds 470 away from its centre |
| Flipper line | y 900. A field's own space is x 20 to 620, y 20 to 900 |

### Rules of geometry

- **A gap is closed or it is a lane.** Under 18 wide the ball cannot enter; 28 or more it passes. Never between:
  that is where a ball wedges.
- **Nothing to rest on.** Any surface the ball can land on slopes at least 15 degrees toward where you want the ball
  to go. A flat-topped block needs a peak or a notch with a scoop in it. A square corner needs a wall across it.
- **A pocket has a way out or is a scoop.** A one-way `gate` lets the ball into a place it then has to leave by
  another way; use one where you want that, and nowhere by accident.
- **Standups stand on something** (the face of a block or a wall). Drops may stand free.
- **A ramp mouth needs a wall on each side of its throat** (`'@id.lb','@id.lt'` and `'@id.rb','@id.rt'`), or a block.
- **Leave room for foes**: open floor round (cx, 400) and (cx, 650), or give the field `rise`, `line` and `drop`.

### Flippers and shots

- Start from the flippers. For each one, decide its three to five shots, then place them. A shot is a ramp mouth, a
  scoop, a bank, a spinner lane, an orbit, a bumper nest.
- The standard pair at the foot of a field is the default. Change its size with `standard:{flippers:'mini'}` or
  `'long'`; replace it with `flippers:false` and your own `flipper` pieces.
- **A mini** throws about half as far as a standard one. Put it half way up a field, or put its shots within about
  400 units of it. At the foot of a field a mini pair leaves a wide gap between the tips: that is a hard room.
- **A long** reaches the top of its own field easily and makes the gap between the tips small: an easy room.
- **A flipper up the field** needs two things: something that brings the ball to it (a wall or a gate that ends at
  its pivot, the end of a ramp) and something only it can hit. Without the first it never gets the ball; without
  the second it is decoration.
- More flippers is not more fun. One extra, with a reason, reads well. Every left-button flipper moves together.
- Do not guess what a flipper reaches. `npm run reach -- <id>` rolls a ball down every flipper at every timing and
  prints what it hit. Move things until every shot is on some flipper's list.

### Everything returns

- A ramp ends at an inlane, or anywhere the ball then rolls to a flipper. At a standard inlane that is `(81, 712)` on
  the left and `(559, 716)` on the right (`(525, 716)` on the home field), with the last two path points heading down.
- A scoop ejects to a flipper tip (`eject:'L'` or `'R'`), or with a kick you aim yourself (`eject:[vx, vy]`).
- A chute (drain ramp) ends like a ramp.
- An orbit comes back round the arch by itself. A field with `arch:false` has no orbits: give it another long shot.

### Overhead

Ramps are drawn above the table and they hide what is under them. Route them over the aprons (the dead triangles
below the flipper shelf), up the outside of the side walls and round the arch. Never across a flipper, an outlane or
the middle of a field. Where two cross, give one `lift:30`. Look at every field tilted in inspect mode: if you cannot
see both flippers and both outlanes, move the ramp.

## 4. Roads: ramps, chutes, tunnels

For each road in your plan from step 1:

- **A ramp** starts at a `mouth` piece on the field it leaves. Write its `path` with `['#fieldId', x, y]` points.
  Speed is yours to set: TABLE_FORMAT, "How fast". Short version: the defaults climb one field; `k:.06` climbs two;
  `k:.1, drag:.02, exitV:1000` is a freeway that hands the ball on at speed.
- **A chute** (drain ramp) is `{id, name, drain:'from', to:'to', path}`. No mouth. One for every field that has
  nothing joined below it, except the home field.
- **A tunnel** joins two scoops: `{from, to, via}`. The ball is hidden while it travels. The Grave needs one from
  `rise` to a scoop on the home field.

If you leave `ways` out of the content, the engine lights the right road when a quest is on another field. It
works that out from these ramps and tunnels, so there is nothing to keep in step.

## 5. Inserts and lamps: light it like a real table

**Inserts** (`shots[]`): one for every id a quest or a lamp will name: each ramp, scoop, bank, bumper group,
spinner, lane set and statue, and `orbitL<n>` / `orbitR<n>` for a field with orbits.

- An arrow sits 40 to 60 units in front of its shot, on the line the ball takes, pointing at it (`ang`).
- A `kind:'dot'` is for what you hit rather than enter: a bumper nest, a spinner, a lane set.
- The engine lights them: gold for the main quest, blue for errands, green for the lock, red for a boss's spell.

**Status lamps** (`lamp` pieces): put the state of the game on the floor, where a player looks.

| Lamp | Where a real table puts it |
|---|---|
| `mult2` to `mult6` | a column up the middle of the home field, above the flippers, 2x nearest the player |
| `save` | above the gap between the flippers (not in it: the party's guard stands there, with a name tag) |
| `kickback` | in the left outlane |
| `lockLit`, `lock1` | beside the scoop that locks |
| `rally`, `grave`, `mb`, `combo` | in the middle, either side of the column |
| your own (`rules.status`) | beside the feature it belongs to |

Keep lamps 28 or more apart, label each in one or two words, keep them out from under ramps, and keep them off the
rune ring (twelve dots on a circle of radius 96 round (cx, 650) on every field; the test bench's column steps over
the one at (cx, 746)).

## 6. Content and rules

Work in this order; each step only needs the one before.

1. **Foes**: one per job you want (all eight is normal). Copy the numbers from Gravebound's foe with that job.
   Pick a `figure` and `tint`. Flag machines or undead `undead:1`.
2. **Bosses**: `tier` is the field's id. `cast.shots` must be shots on its own field; `frenzyFrom` a scoop on its
   field; `summon` (and `wardBy`) foes you defined. Copy a Gravebound boss's numbers for the same place in the order.
3. **Campaign(s)**: pools of steps per stage, and a `plan`. Every step id must have an insert. One campaign is
   enough; three (as Gravebound) gives runs variety.
4. **Side quests**: 12 to 16 for a full table. At least one must begin on the home field (a run starts with one).
5. **Features**: decide what each bank, lane set and scoop does, then write `rules.js`. The house roles below are
   what Gravebound gives its features; you do not need all of them. You do need: a multiplier, a kickback relight,
   a scoop that hands out side quests (and recruits, if you want the party to grow), a lock, a way on from every
   field, and bumpers with `opensGrave:true`.

| House role (Gravebound) | Its effect | Neon Descent |
|---|---|---|
| Top lanes, home field (Vigil Candles) | multiplier +1, small heal | Signal Lights |
| Drop bank, home field (Town Gate) | kickback lit, heal 5, calls 2 foes | Toll Booth |
| Standups, home field (Chapel) | heal 18, cleanse, calls 2 | Night Market |
| Low standups (Smithy) | +25% damage 30 s, kickback lit | Chop Shop |
| Centre scoop, home field (Tavern) | side quests, recruits for hire | Hideout |
| Low scoop, home field (Crypt Stair) | tunnel up one field | Sewer Grate |
| Drops round the door (Goblin Camp) | lights the lock, calls 3 | The Curtain |
| Left scoop (Catacombs) | the two-ball lock; else 5 coin and a follower | Pachinko Parlor |
| Door and scoop behind it (Sealed Door, Secret Passage) | tunnel up; first time a discovery | Stage Door, Backstage |
| Right scoop (Witch's Hut) | a random boon on a 40 s timer, side quests | The Fixer |
| Inlanes and outlanes as a set (Moon Phases) | double scoring 20 s | Neon Signs |
| Drops by the centre ramp (Royal Guard) | twice: opens the vault | Firewall |
| Corner pocket (Sanctum) | vault multiball when open, else 8 coin | Core Vault |
| Standups, top field (Armory) | half damage 30 s, calls 1 | Black ICE |
| Right pocket, top field (Oubliette) | tunnel down to the home field | Service Elevator |

6. **`lamps`** (in rules): light what is available (the lock, a timed boon, the quest scoop, a door).
   **`on`**: anything a plain event should add on this table (a ramp that pays more each time round, a slingshot
   that counts). **`status`**: states for your own status lamps.
7. **Words**: `names` (classes, abilities, companions, relics, boons in your theme's voice), `text` (title, the
   Grave's words, the coin's name), `help` (your own pages), `spinCalls`, `graveStir`, `noPerks`.

## 7. Theme, in this order (stop whenever it is good enough)

1. `pal` and the per-tier colours. 2. `theme.css` (page skin) and `fonts`. 3. `floorArt` per field.
4. `bumper` and `statue` models. 5. Boss billboards. 6. `scenery` and `materials`. 7. `music`.

Check each in play and in inspect mode. Keep floor art faint; inserts and lamps must read over it.

## 8. Prove it

```
npm run check                                         # nothing undefined
tables/<id>/index.html?inspect                        # every field, top-down and tilted; save a screenshot of each
npm run reach -- <id>                                 # priority 3: every shot on some flipper's list, no idle flipper
node tests/soak.mjs 20 --table <id> --seeds 8         # priorities 1 and 2: no pockets; every ramp made more than
                                                      #   failed; every chute ridden; NEVER (none), or explained
node tests/table.mjs --table <id> --record            # record the layout
node tests/replay.mjs 10 --table <id> --record        # record 20 replay scenarios; then run without --record: must MATCH
npm test                                              # the other tables must still match their recordings
```

Then add the table to the `test` and `test:full` scripts in `package.json`, and play it: each class for a few
minutes, every field, one boss. The bot only flips, it does not aim; neither test can tell you whether it is fun.

**Done means:** the checks above pass; every field has been looked at tilted in inspect mode with both flippers and
both outlanes in view; the title, a ball on each field and a boss have been seen in play; `docs/STATUS.md` has a
line for the table saying what was verified and how, and what was not.

---

## Appendix A: assemblies that are already shot-tested

You do not have to use these. They are arrangements that have been played for hundreds of bot-hours on the shipped
tables, so they are a safe place to start a field that keeps the standard arch, orbits, slingshots and lanes. All
coordinates are local. Mirroring (x becomes 640 - x, sides swap) is safe on any field except the home field, which
is not symmetric (the plunger lane takes its right edge).

### A symmetric field (Gravebound's Wilds; Neon Descent's Kabuki and Cathedral)

```js
{t:'bumper',x:236,y:232,r:24,group:G},{t:'bumper',x:404,y:232,r:24,group:G},{t:'bumper',x:320,y:262,r:24,group:G},
{t:'mouth',id:L,x:188,y:480,side:-1},{t:'mouth',id:R,x:452,y:480,side:1},
{t:'scoopBlock',mouth:L,side:-1,xg:66,topY:380,name:S1},{t:'hole',id:S1,name:'...',x:112,y:488,r:13,eject:'L'},
{t:'wall',w:3,pts:['@L.rb','@L.rt']},
   ... one centre feature, one spinner lane ...
{t:'wall',w:3,pts:['@R.lb','@R.lt']},
{t:'scoopBlock',mouth:R,side:1,xg:574,topY:380,name:S2},{t:'hole',id:S2,name:'...',x:528,y:488,r:13,eject:'R'},
{t:'floorSet',id:F,name:'...',col:'#...'}
statue:{id,x:320,y:178,r:20}   boss:{x:320,y:650}
spawn:[[150,585],[225,640],[320,600],[415,640],[490,585],[236,578],[370,560],[320,690]]
```

Centre features (pick one):

```js
// a building with a door and a scoop behind it (drops either side of a two-drop door)
{t:'bank',id:B,name:'...',kind:'drop',from:[248,396],to:[300,372],n:2},{t:'bank',id:B,kind:'drop',from:[340,372],to:[392,396],n:2},
{t:'bank',id:D,name:'...',kind:'drop',from:[300,372],to:[320,366],n:1,door:{time:22,popup:['...','...']}},{t:'bank',id:D,kind:'drop',from:[320,366],to:[340,372],n:1},
{t:'wall',w:3,style:'scoop',pts:[[300,372],[298,346],[308,332],[320,328],[332,332],[342,346],[340,372]]},
{t:'hole',id:S3,name:'...',x:320,y:352,r:13,eject:'R'},
// or a closed block with three standups on its underside and a peaked roof
{t:'block',name:V,pts:[[248,396],[300,372],[340,372],[392,396],[372,344],[320,326],[268,344]]},
{t:'bank',id:M,name:'...',kind:'target',from:[248,396],to:[300,372],n:1,pad:.06},
{t:'bank',id:M,kind:'target',from:[300,372],to:[340,372],n:1,pad:.04},{t:'bank',id:M,kind:'target',from:[340,372],to:[392,396],n:1,pad:.06},
```

Spinner lane, left of centre (mirror it for right of centre: walls at 344 and 388, spinner at 366):

```js
{t:'wall',w:3,pts:[[252,548],[252,468]]},{t:'wall',w:3,pts:[[296,548],[296,468]]},{t:'spinner',id:SP,x:274,y:508,r:20},
```

### A home field (Gravebound's Hollow; Neon Descent's Undercity; the test bench's Home)

```js
{id,name,short,shooter:true, boss:{x:303,y:650},   // boss only if one stands here
 spawn:[[160,585],[215,640],[303,600],[392,640],[445,600],[255,560],[350,560],[303,690]],
 pieces:[
  {t:'lanes',id:LN,name:'...',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4},skill:true,ballReset:true},
  {t:'bumper',x:258,y:234,r:24,group:G,opensGrave:true},{t:'bumper',x:382,y:234,r:24,group:G,opensGrave:true},{t:'bumper',x:320,y:304,r:24,group:G,opensGrave:true},
  {t:'mouth',id:L,x:172,y:480,side:-1},{t:'mouth',id:R,x:434,y:480,side:1},
  {t:'bank',id:B1,name:'...',kind:'drop',from:[192,336],to:[254,310],n:3},{t:'block',name:B1,pts:[[190,330],[252,304],[236,270],[190,282]]},
  {t:'bank',id:B2,name:'...',kind:'target',from:[412,298],to:[482,323],n:3,pad:.05},{t:'block',name:B2,pts:[[412,298],[482,323],[540,300],[540,250],[446,262]]},
  {t:'block',name:'wedge',pts:[[66,390],'@L.lt','@L.lb',[72,520],[66,500]]},{t:'wall',w:3,pts:['@L.rb','@L.rt']},
  {t:'bank',id:B3,name:'...',kind:'target',from:[70,640],to:[112,604],n:2,pad:.1},{t:'block',name:B3,pts:[[70,640],[112,604],[96,584],[66,576],[66,636]]},
  {t:'centerScoop',x:303,w:28},{t:'hole',id:S1,name:'...',x:303,y:444,r:14,eject:'L'},
  {t:'wall',w:3,pts:['@R.lb','@R.lt']},
  {t:'block',name:S2,pts:['@R.rt',[540,390],[540,640],['notch',505,602],[470,640],[470,540],'@R.rb']},{t:'hole',id:S2,name:'...',x:505,y:622,r:13,eject:'R'},
  {t:'spinner',id:SP,x:195,y:540,r:20,rot:Math.atan2(.925,.38)-Math.PI/2},
  {t:'shooter'},{t:'kickback',x:41,y:935,r:17}]}
```

### A top field (Gravebound's Keep; Neon Descent's Citadel; the test bench's Apex uses half of it)

Two bumpers at (236,300) and (404,300); a centre mouth `{x:320,y:470,side:0}`; a corner pocket
`{t:'block',pts:[[66,250],[150,262],[150,340],['notch',112,302],[66,340]]}` with its hole at (112,322, r 14); three
standups low on the left `from:[78,546],to:[128,496],n:3,pad:.08` on the block `[[78,546],[128,496],[112,470],[66,462],[66,540]]`;
drops flanking the centre `from:[236,486],to:[286,464],n:2` and `from:[354,464],to:[404,486],n:2`; a spinner in
the left orbit at (43,455); statue (320,205, r 22); boss (320,650). Right half: the symmetric field's right half
(mouth at (452,480,1), funnel wall, `scoopBlock`, hole at (528,488)).

### A room of its own shape (the test bench's West Wing)

`standard:{arch:false, slings:false, lanes:false, flippers:'mini'}`, then: a wall across each top corner
(`[[20,130],[130,20]]`, `[[620,130],[510,20]]`); a one-way gate `{pts:[[20,180],[150,300]], solid:[60,120]}` feeding
a third flipper at (150,306); standups under the lid for that flipper (`from:[380,24],to:[480,24]`); a centre scoop
between two posts; its own slingshots (`a:[100,650], b:[100,770], c:[175,800]` and the mirror); `lane` rollovers at
(81,810), (559,810), (41,900), (599,900); a post at (320,940) between the mini flippers.

### Ramp paths

`f` is the field the ramp starts on. A negative y is above that field: inside the field joined above it.

| Ramp | Mouth | Path |
|---|---|---|
| Up to the field joined above, left side, to its left inlane | (172 or 188, 480, -1) | `['#f',104,300],['#f',70,180],['#f',46,60],['#f',40,-80],['#f',40,-220],['#f',42,-320],['#f',52,-364],['#f',68,-378],['#f',80,-364],['#f',81,-328]` |
| Up to the field joined above, right side, to its right inlane | (452,480,1) | `['#f',528,300],['#f',566,190],['#f',592,70],['#f',600,-70],['#f',600,-200],['#f',598,-310],['#f',590,-358],['#f',574,-374],['#f',560,-360],['#f',559,-324]` |
| Loop over the top, left mouth to the right inlane | (188,480,-1) | `['#f',118,310],['#f',92,220],['#f',118,142],['#f',200,86],['#f',320,66],['#f',440,86],['#f',522,142],['#f',550,220],['#f',560,420],['#f',559,680],['#f',559,716]` |
| Loop on the home field, right mouth to the left inlane | (434,480,1) | `['#f',510,300],['#f',528,220],['#f',500,142],['#f',420,86],['#f',320,68],['#f',220,86],['#f',140,142],['#f',106,220],['#f',92,320],['#f',84,480],['#f',81,640],['#f',81,712]` |
| Centre ramp, round the arch to the right inlane | (320,470,0) | `['#f',300,260],['#f',250,180],['#f',185,120],['#f',130,98],['#f',200,68],['#f',320,52],['#f',430,70],['#f',500,130],['#f',540,220],['#f',558,320],['#f',559,520],['#f',559,714]` |
| Freeway up TWO joined fields along the right rim (`k:.05, lift:22`) | (434,480,1) | `['#f',512,292],['#f',564,192],['#f',622,110],['#f',664,10],['#f',682,-120],['#f',686,-460],['#f',686,-860],['#f',686,-1160],['#f',680,-1260],['#f',660,-1340],['#f',628,-1392],['#f',594,-1414],['#f',572,-1414],['#f',560,-1400],['#f',559,-1364]` |
| Freeway up TWO joined fields along the left rim (`k:.06, lift:22`) | (188,480,-1) | `['#f',104,280],['#f',52,170],['#f',-4,70],['#f',-38,-50],['#f',-46,-220],['#f',-46,-620],['#f',-46,-1020],['#f',-42,-1160],['#f',-22,-1270],['#f',16,-1352],['#f',48,-1402],['#f',68,-1416],['#f',80,-1402],['#f',81,-1368]` |
| Home field up to a field half a column left and a row up (`k:.06`); mirror for the right | (172,480,-1) | `['#home',90,280],['#home',10,160],['#home',-100,60],['#west',150,1010],['#west',95,920],['#west',48,830],['#west',36,740],['#west',46,676],['#west',66,656],['#west',80,670],['#west',81,712]` |
| Sideways freeway to the next field in the row (`k:.1, exitV:900, drag:.03, lift:14`) | (188,480,-1) | see `bridge` in the test bench |
| A chute from the foot of a field to the left inlane of the field below and half a column right | none | `['#f',320,1180],['#home',-30,440],['#home',20,620],['#home',81,640],['#home',81,712]` |

## Appendix B: what fits a table, what needs the engine

Fits a table today (no engine change): the shape of the table on the grid; the shape of any field; any number, size
and place of flippers; walls, gates, posts, slingshots, rollovers, lamps; ramp speeds; what any bank, lane set, scoop
or plain event does; timers; flags on the run; extra multiballs; which foes appear where and when; boss sequences;
wing rules of the three kinds; all words and art; re-skinning classes.

Needs a general engine feature first (propose it; do not special-case a table): a new piece type (a magnet, a
captive ball, a moving target, a second plunger); a new foe job; a new wing rule; a new curse or buff; a field that
is not 640 by 1040; more than one door; reshaping the Grave; a new class or ability.

Never: a different gravity, flipper strength or scoring table for one machine.
