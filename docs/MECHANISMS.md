# Optional moving parts and connected tracks

These features create no mechanism state or collisions when absent. Existing flipper feel, static collisions,
ramps and scoop ejects retain their defaults. Only Judgment currently opts in. Table rules import the API only.

## Layout mechanisms

`layout.mechanisms` is an optional array. Every entry has a unique `id`, `kind`, `field` id and local `x,y`.
Built state is `T.mechanisms[id]`; it is removed when loading a layout without mechanisms. New runs and
continue reset mechanical position, then the table's rules restore the intended state from saved progress.

- `gate`: rotating leaves. `leaves:[{x:0,y:0,length:40,closed:0,open:-Math.PI/2}, ...]`.
  Leaf offsets are relative to the mechanism origin, angles in the playfield plane. Set `m.open` in rules.
  `position` moves from 0 to 1 at `speed` units/sec. Collision follows each moving segment, including its
  surface velocity; an open leaf is still solid along the side of the entrance.
- `shutter`: a vertically retracting barrier. Same leaves; `lift` is the raised height. It clears collision
  once it is above the ball diameter. `scoop` optionally names the pocket behind it. Closure waits while a
  ball is held there or is passing through the `clearance` area, allowing a late capture to eject safely.
- `captive`: a restrained ball with a one-dimensional spring/damper. `angle` defaults upward; `travel` is
  its maximum displacement. Live-ball impulses transfer to it according to `mass` and `bounce`.
  An impact above `strike` emits `on.captive(mechanism, ball, run, impact)`, gated by `cooldown`.
  A table owns the score, sounds and goal progress; call `shot(m.id,m.x,m.y)` to register the shot.

All defaults are exported as `MECHANISM_DEFAULTS`: speed, width, restitution, visual height/color, shutter
lift/clearance, captive radius/travel/mass/spring/damping/strike/cooldown. Per-entry values override them.
Runtime fields include `position`, `s`, `v`, `cool`, `flash`, and leaf `a,w`.

`theme.mechanism(m, view)` may decorate the stock mechanism. `view.root`, `view.leaves`, and `view.ball`
are Three objects in local coordinates. It may return a pose callback, run once per drawn frame, which must
only change visuals. It must not consume simulation randomness. Stock mechanisms render without a theme hook.

## Ramps, feeds and junctions

Existing mouth-based ramps are unchanged. A mouth may optionally specify `angle` (radians) instead of `side`.
A block may specify a visual `height`, leaving its planar boundary unchanged.

A ramp may use `entry:['#field',x,y]` instead of a mouth; the `path` follows that entry. This represents a scoop
feed or a continuation at a junction, not an independently shootable ramp mouth. It is drawn just like any
other rail. Use `enterRail(ball, railId, speed?)` to feed a ball onto it. The default feed speed is named in
`RAIL_TRANSFER_DEFAULTS`; a rail's `feedSpeed` overrides it. `minSpeed` explicitly makes a powered/unidirectional
feed: useful for a return lift, not automatically applied to ordinary ramps.

- A scoop may declare `rail:'returnTrack'`. Its rule sets `held.plan='rail'`, plus the usual delay. `held.rail`
  can override the route. Added multiballs from such a scoop also use the visible track.
- `next:'normalTrack'`, `branch:'alternateTrack'`: connected rail continuations. Table rules set `rail.divert`
  to select the branch. Choice is made at the junction. The builder rejects unconnected endpoints (>12 units).
  The completed rail emits the normal `ramp` event before transfer. Each continuation can score separately.
- `hold:{at:.5,duration:1.1,releaseSpeed:680}`: an electromagnetic catch at a fraction of the rail length.
  It emits `on.magnet(rail,ball,run)`, visibly stops the ball, and always releases after the specified simulation
  time. Every transit gets a fresh hold, including after repeat shots. Pausing freezes that time normally.
- `startHeight` / `endHeight`: optional height above the floor at a rail endpoint; keep these equal at raised
  junctions. The physics remains guided/planar, matching the existing rail system.

The renderer supplies a visible diverter tongue and magnetic ring. The hold is a rail-mounted catch, not a
general free-playfield magnetic force model. Gates move in the table plane; shutters lift vertically.

## Verification

`node tests/mechanisms.mjs` uses physical approaches, not just rule calls: closed barriers rebound, open
barriers admit shots, a timed-out jaw waits for a captured ball, captive motion returns, both magnetic routes
release and end on the correct field, orbit feed reaches the upper flipper, and reset clears mechanism state.
`reach` probes qualified gates/jaws in their open position. Judgment's recorded layout includes mechanisms.
The existing tables' layout and replay recordings must pass without re-recording them.
