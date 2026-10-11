# Judgment

Biblical pinball in three joined realms. Earth is the launch field, Heaven is above it, Hell is below it.
Only a fall out of Hell costs a ball. Three balls; the shared standard feel; no optional RPG systems.

## The pilgrimage

1. On Earth, complete the Candles, ring the Bells six times, and shoot Sanctuary. Each rescues one distinct
   soul. Progress persists between balls and through save/continue.
2. Shoot the single Ascension ramp to Heaven, then the Pearly Gates with all three souls saved. The Gates
   start Armageddon multiball and grant Grace, which returns one lost ball.
3. Descend to Hell, naturally or through Into the Abyss. Complete the Chains and shoot the Beast three times.
4. Shoot Redemption to win. Redemption is always available as a return to Earth, even before the final goal.

The bright Gates, cathedral rose, and dark Beast establish the three realms. Every field repeats the three
soul lamps and the Gates, Grace and Beast status. The HUD names the current objective. The table's How to Play
menu also explains the supporting targets, multiplier, Choir lock, and endless play.

There is one ascent ramp. Falls and transfer scoops form the other routes; Heaven has an open center, Earth
an asymmetric ramp and chapel, and Hell staggered blocks and a side escape. Shared flippers, orbits and lower
lanes keep the familiar handling. Scenery is procedural and decorative; it does not add hidden collisions.

## Engine addition

`ST` identifies the one field with `shooter:true`; `BT` still identifies the bottom field and final drain.
The shooter, initial camera and new/continued runs use `ST`. An interior launch field gets a bounded plunger
lane and a flared right outlane transfer. Existing tables keep their original geometry and behavior.

## Checks and captures

`npm run test:judgment` checks the layout, ten-minute deterministic replays, the complete goal sequence,
transfer physics, Grace, endless play, save/continue, launches and shot lamps.

`node tools/judgment-preview.mjs <output-directory>` captures all three fields in play, top-down and tilted,
plus the title, phone-sized touch view and Salvation screen. Add `--ui-only` to recapture just the menus and
phone presentation. The Salvation capture stages an end state; the behavior test proves the actual sequence.

See `docs/STATUS.md` for measured results and remaining human playtesting.
