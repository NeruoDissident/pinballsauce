# New table checklist

For "today I want a space pinball game". Follow it top to bottom. Open `TABLE_FORMAT.md` beside it for the exact keys.
The reference table is `tables/gravebound` (every feature). The model for a *second* table is `tables/neon-descent`:
it was made with this list.

A new table is a re-dressing, not a re-invention: the rule set is fixed (RULESET.md), and the geometry comes from a
bin of assemblies that have already been played for hundreds of bot-hours. You choose the theme, the shape of the
journey, the names and the look.

## 0. Settle the brief (ask the owner, or decide and say what you decided)

1. Theme and mood in a sentence. Three or four colours.
2. How many fields: 2, 3 or 4. (Each is a full playfield with its own flippers. Three is Gravebound, four is Neon Descent.)
3. The journey: what is at the bottom, what is at the top, who is the last boss.
4. One twist, if any, and whether it fits a hook (see "Twists" at the end). If it needs an engine change, say so first.
5. Wings (side rooms) or not. They are optional; Neon Descent has none.

## 1. Start from a copy

```
cp -r tables/neon-descent tables/<id>          # no wings.   Use tables/gravebound if you want wings.
```

- `table.js`: set `id`, `name`, `store` (all new).
- `index.html`: the `<title>` and `theme-color`.
- Root `index.html`: add the table to the picker list.
- Empty `theme/index.js` down to `export const theme={};` and delete the other theme files. You will see the engine's
  default look until step 6. Layout first, art last.

## 2. Plan the fields on paper

For each field, top to bottom, write one line each:

- its name, and whether a boss stands there;
- its two ramp mouths and where each ramp goes (up one, a loop, up two);
- its scoops and what each is for (see the feature map in step 5);
- its banks (drops or standups), its spinner, its bumper group, its lane set;
- which skeleton from the parts bin it is built on.

Rules of thumb that keep a table readable: the bottom field carries the plunger, the top lanes with the skill shot,
the Grave-opening bumpers, the recruit scoop and the kickback. Every field needs a way up and something worth
staying for. Every ramp ends at an inlane.

## 3. Build the layout from the parts bin

All coordinates are local to the field. **Mirroring** (x becomes 640 - x, sides swap) is safe on any field except the
bottom one, which is not symmetric. Anything not in this bin is new geometry: allowed, but it must pass the soak in
step 7 before you build on it.

### Skeleton A: the symmetric field (Gravebound's Wilds; Neon Descent's Kabuki and Cathedral)

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

### Skeleton B: the bottom field (Gravebound's Hollow; Neon Descent's Undercity). Use it exactly.

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

### Skeleton C: the top field (Gravebound's Keep; Neon Descent's Citadel)

Left half and centre: two bumpers at (236,300) and (404,300); a centre mouth `{x:320,y:470,side:0}`; a corner pocket
`{t:'block',pts:[[66,250],[150,262],[150,340],['notch',112,302],[66,340]]}` with its hole at (112,322, r 14); three
standups low on the left `from:[78,546],to:[128,496],n:3,pad:.08` on the block `[[78,546],[128,496],[112,470],[66,462],[66,540]]`;
drops flanking the centre ramp `from:[236,486],to:[286,464],n:2` and `from:[354,464],to:[404,486],n:2`; a spinner in
the left orbit at (43,455); statue (320,205, r 22); boss (320,650).
Right half: either Skeleton A's right half (mouth at (452,480,1), funnel wall, `scoopBlock`, hole at (528,488)), as
Neon Descent does, or Gravebound's bell lane and oubliette (copy those five pieces from its layout).

### Ramp paths

`T` is the top of the field the ramp starts on (40 + 1040 x its index). Each path is for the mouth shown; mirror x
for the other side.

| Ramp | Mouth | Path |
|---|---|---|
| Up one field, left side, to the left inlane above | (172 or 188, 480, -1) | `[104,T+300],[70,T+180],[46,T+60],[40,T-80],[40,T-220],[42,T-320],[52,T-364],[68,T-378],[80,T-364],[81,T-328]` |
| Up one field, right side, to the right inlane above | (452,480,1) | `[528,T+300],[566,T+190],[592,T+70],[600,T-70],[600,T-200],[598,T-310],[590,T-358],[574,T-374],[560,T-360],[559,T-324]` |
| Loop over the top, left mouth to the right inlane | (188,480,-1) | `[118,T+310],[92,T+220],[118,T+142],[200,T+86],[320,T+66],[440,T+86],[522,T+142],[550,T+220],[560,T+420],[559,T+680],[559,T+716]` |
| Loop on the bottom field, right mouth to the left inlane | (434,480,1) | `[510,T+300],[528,T+220],[500,T+142],[420,T+86],[320,T+68],[220,T+86],[140,T+142],[106,T+220],[92,T+320],[84,T+480],[81,T+640],[81,T+712]` |
| Centre ramp, round the arch to the right inlane | (320,470,0) | `[300,T+260],[250,T+180],[185,T+120],[130,T+98],[200,T+68],[320,T+52],[430,T+70],[500,T+130],[540,T+220],[558,T+320],[559,T+520],[559,T+714]` |
| Freeway up TWO fields along the right rim (`k:.05, lift:22`) | (434,480,1) | `[512,T+292],[564,T+192],[622,T+110],[664,T+10],[682,T-120],[686,T-460],[686,T-860],[686,T-1160],[680,T-1260],[660,T-1340],[628,T-1392],[594,T-1414],[572,T-1414],[560,T-1400],[559,T-1364]` |
| Freeway up TWO fields along the left rim (`k:.06, lift:22`) | (188,480,-1) | `[104,T+280],[52,T+170],[-4,T+70],[-38,T-50],[-46,T-220],[-46,T-620],[-46,T-1020],[-42,T-1160],[-22,T-1270],[16,T-1352],[48,T-1402],[68,T-1416],[80,T-1402],[81,T-1368]` |

Two ramps that cross: give one `lift:30`. Two ramps may end at the same inlane.

### Tunnels

One per scoop whose rule says `hd.plan='tunnel'`, and one from `rise` (the Grave's way out) to a scoop on the bottom
field. `via` is three or four waypoints roughly between the two scoops; only the camera uses them.

### Geometry rules (why the bin exists)

- Nothing the ball can rest on: every top face slopes at least 15 degrees, pockets have a notch that is a scoop.
- A gap is either under 18 wide (a wall) or over 28 (a lane). The ball is 20 to 25 across.
- Standups go on the lower faces of a block. Drops may stand free.
- Leave the centre of each field open from y 560 to 880: foes spawn there, bosses stand at (cx, 650).
- A mouth needs a funnel wall on its open side (`'@id.lb','@id.lt'` or `'@id.rb','@id.rt'`) and a block or
  `scoopBlock` on the other.

## 4. Inserts

One `shots[]` entry for every id a quest or a lamp will name: each ramp, scoop, bank, bumper group, spinner, lane
set and statue, and `orbitL<i>` / `orbitR<i>` per field. Copy the positions from the table whose skeleton you used;
they sit just below their shot, pointing at it.

## 5. Content and rules

Work in this order; each step only needs the one before.

1. **Foes**: one per job you want (all eight is normal). Copy the numbers from Gravebound's foe with that job.
   Pick a `figure` and `tint`. Flag machines or undead `undead:1`.
2. **Bosses**: one per boss field. `cast.shots` must be shots on its own field; `frenzyFrom` a scoop on its field;
   `summon` (and `wardBy`) foes you defined. Copy a Gravebound boss's numbers for the same place in the order.
3. **Campaign(s)**: pools of steps per stage, and a `plan`. Every step id must have an insert. One campaign is
   enough; three (as Gravebound) gives runs variety.
4. **Side quests**: 12 to 16. At least four must begin on the bottom field.
5. **Feature map**: decide which of your features plays each house role, then write `rules.js` by editing the copy.

| House role (Gravebound) | Its effect | Neon Descent |
|---|---|---|
| Top lanes, bottom field (Vigil Candles) | multiplier +1, small heal | Signal Lights |
| Drop bank, bottom field (Town Gate) | kickback lit, heal 5, calls 2 foes | Toll Booth |
| Standups, bottom field (Chapel) | heal 18, cleanse, calls 2 | Night Market |
| Low standups (Smithy) | +25% damage 30 s, kickback lit | Chop Shop |
| Centre scoop, bottom field (Tavern) | side quests, recruits for hire | Hideout |
| Low scoop, bottom field (Crypt Stair) | tunnel up one field | Sewer Grate |
| Drops round the door (Goblin Camp) | lights the lock, calls 3 | The Curtain |
| Left scoop (Catacombs) | the two-ball lock; else 5 coin and a follower | Pachinko Parlor |
| Door and scoop behind it (Sealed Door, Secret Passage) | tunnel up; first time a discovery | Stage Door, Backstage |
| Right scoop (Witch's Hut) | a random boon on a 40 s timer, side quests | The Fixer |
| Inlanes and outlanes as a set (Moon Phases) | double scoring 20 s | Neon Signs |
| Drops by the centre ramp (Royal Guard) | twice: opens the vault | Firewall |
| Corner pocket (Sanctum) | vault multiball when open, else 8 coin | Core Vault |
| Standups, top field (Armory) | half damage 30 s, calls 1 | Black ICE |
| Right pocket, top field (Oubliette) | tunnel down to the bottom field | Service Elevator |

   You do not need all of them. You do need: a multiplier, a kickback relight, a recruit and side-quest scoop, a
   lock, a way up from every field, and the Grave-opening bumpers.
6. **`lamps`**: light what is available (the lock, the timed boon, the recruit scoop, the door).
7. **Words**: `names` (classes, abilities, companions, relics, boons in your theme's voice), `text` (title, the
   Grave's words, the coin's name), `help` (rewrite the nine pages for your table), `ways`, `spinCalls`,
   `graveStir`, `noPerks`.

## 6. Theme, in this order (stop whenever it is good enough)

1. `pal` and the per-tier colours. 2. `theme.css` (page skin) and `fonts`. 3. `floorArt` per field.
4. `bumper` and `statue` models. 5. Boss billboards. 6. `scenery` and `materials`. 7. `music`.

Check each in play and in inspect mode. Keep floor art faint; inserts must read over it.

## 7. Prove it

```
npm run check                                         # nothing undefined
tables/<id>/index.html?inspect                        # look at every field top-down; save a screenshot of each
node tests/soak.mjs 20 --table <id> --seeds 8         # must print: no pockets, NEVER (none), every ramp made more than failed
node tests/table.mjs --table <id> --record            # record the layout
node tests/replay.mjs 10 --table <id> --record        # record 20 replay scenarios; then run without --record: must MATCH
node tests/replay.mjs 5                               # Gravebound must still match the original
```

Then add the table to the `test` script in `package.json`, and play it: each class for a few minutes, every field,
one boss. The soak cannot tell you whether it is fun.

**Done means:** the checks above pass; every field has been looked at in inspect mode; the title, a ball on each
field and a boss have been seen in play; `docs/STATUS.md` has a line for the table saying what was verified and how.

## Twists: what fits a hook, what needs the engine

Fits a table today (no engine change): what any bank, lane set or scoop does; timers; new flags on the run; extra
multiballs; which foes appear where and when; boss sequences; wing rules of the three kinds; all words and art;
re-skinning classes.

Needs a general engine feature first (propose it; do not special-case a table): a new piece type (a magnet, a
captive ball, a moving target); a new foe job; a new wing rule; a new curse or buff; fields that are not 640 by
1040 or do not stack top to bottom; more than one door; reshaping the Grave; a new class or ability.

Never: a different gravity, flipper, or scoring table for one machine.
