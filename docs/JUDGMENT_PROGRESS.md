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
- [ ] Commit/push the verified work and update draft PR #1.

Testing policy: focused checks during development, one complete final regression for shared changes; no video comparisons. Passing automation does not substitute for the owner's playtest.

Final verification details are in docs/STATUS.md, Stage 8.1. All 120 five-minute replays match; existing tables and their recordings are unchanged. The only remaining task is publishing the prepared branch commits/PR description.
