/* Starfall, as a table: layout (data), content (data), rules (hooks). The plain table: one playfield, pinball only. */
import {layout} from './layout.js';
import {content} from './content.js';
import {rules} from './rules.js';
export default {
  id: 'starfall',
  name: 'Starfall',
  store: 'starfall',
  accent: '#7ad0ff',
  blurb: 'One playfield and nothing but pinball: a loop, a lock, cargo to bank, and a mission written in lights.',
  // the engine systems this table does not use (docs/PINBALL.md, section 9). It also lists no enemies, no bosses,
  // no side quests and no Grave, so it has none.
  uses: {classes: false, party: false, cards: false, gold: false},
  balls: 3,
  feel: 'standard',
  layout,
  content,
  rules,
  theme: {
    // one palette per tier: the playfield, then the slot the engine keeps for a room under it
    pal: [
      {a: '#0d1a3a', b: '#060b1a', acc: '#4aa8ff', acc2: '#e0f0ff', glow: '#7ad0ff', stone: '#24314f'},
      {a: '#0a0f1c', b: '#04060c', acc: '#4aa8ff', acc2: '#e0f0ff', glow: '#7ad0ff', stone: '#1a2338'}
    ],
    flagstones: false,
    // what is lettered on the table (the page's own faces are in theme/theme.css)
    fonts: {
      fontD: '"Avenir Next","Segoe UI","Helvetica Neue",Arial,sans-serif',
      fontL: '"Avenir Next","Segoe UI","Helvetica Neue",Arial,sans-serif'
    }
  }
};
