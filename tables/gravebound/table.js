/* Gravebound Pinball, as a table for the engine: layout (data), content (data), rules (hooks), theme (art). */
import {layout} from './layout.js';
import {content} from './content.js';
import {rules} from './rules.js';
import {theme} from './theme/index.js';
export default {
  id: 'gravebound',
  name: 'Gravebound Pinball',
  store: 'gravebound',
  accent: '#d9a441',
  blurb: 'A cursed kingdom on one table: the Hollow, the Wilds, the Black Keep, and a grave underneath.',
  layout,
  content,
  rules,
  theme
};
