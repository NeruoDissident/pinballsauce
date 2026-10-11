# Judgment mechanical redesign

Active branch: `codex/judgment`. User approved the whole redesign, October 11, 2026.
Do not change any other table's layout, feel, rules, or defaults. Leave the shared Grave exit issue for separate work.

## Accepted scope

- Three joined realms; Earth launches, Hell drains. Pure pinball and biblical imagery.
- Earth: asymmetric orbit feed to an upper-right flipper, cross-field Ascension, a separate inlane return ramp, captive-ball cathedral bell.
- Heaven: physically opening Pearly Gates, raised halo loop, brief magnetic catch, diverter into a visible descent to Hell during Armageddon.
- Hell: large Beast with moving jaw; Chains open a timed attack window, three visible wounds, visible Redemption return track.
- Shape and color contrast: ivory/gold Heaven, cathedral Earth, crimson/black Hell. Keep shots and lower flippers readable.
- Deliver the complete game with all six tables in its menu, on this experimental branch and draft PR #1.

## Progress

- [x] Inspect existing rail, extra-flipper, rule and rendering APIs.
- [x] Add optional mechanism primitives; unchanged path for tables that do not use them.
- [x] Rebuild Judgment shot routes and connect mechanical rules.
- [x] Build and inspect moving landmarks and playfield art.
- [x] Focused physical mechanism/shot checks, reach, standards and soak.
- [x] Final existing-table layout/replay regression without re-recording those tables.
- [x] Re-record Judgment intentionally and build the full six-table menu.
- [x] Commit/push the verified work and update draft PR #1.

Testing policy: focused checks during development, one complete final regression for shared changes; no video comparisons. Passing automation does not substitute for the owner's playtest.

Final redesign verification details are in docs/STATUS.md, Stage 8.1. All 120 five-minute replays matched; existing tables and their recordings were unchanged. Engine commit 276d52a and table commit 9778fcd are pushed. Draft PR #1 has the redesign and verification description. The full-menu and standalone HTML builds are delivered.

## Owner playtest: flipper strength trial

The owner reports that Pilgrimage's entrance angle is difficult, Redemption is possible but difficult, and long ramps lack momentum. At the owner's request, increase only Judgment's `feel.flipper` to `1.15` (+15%). Keep the standard stroke acceleration and 85% cutoff, all geometry, and all ramp settings unchanged. No engine or other-table changes. Defer Pilgrimage repositioning until feedback on this strength trial.

Judgment's ten-minute replay baseline is intentionally re-recorded for the new strength. Reach finds shots for every flipper; its limited timing sweep no longer finds Ascension, but the short soak completes Ascension once. Do not interpret reach as proof that a human cannot hit a shot. Two five-minute soak seeds find no stuck balls or errors; Pilgrimage completes 11 times without a failed climb. Standards pass (47/48 fair launches). These are structural checks, not evidence that aiming is comfortable. Full-menu and standalone builds now contain the trial. Await the owner's feedback before moving anything.

Trial validation: `npm run check` and `npm test` pass, including all 120 replays and the progression/mechanism checks. Existing tables' baselines and every layout baseline remain unchanged. Two full-menu Judgment replays match source; the standalone file opens offline, launches, and responds to both flippers. Delivered as `Pinballsauce.html?v=flipper115#judgment` and `Judgment.html`.
