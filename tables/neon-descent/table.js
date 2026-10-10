/* Neon Descent, as a table for the engine: layout (data), content (data), rules (hooks), theme (art). */
import {layout} from './layout.js';
import {content} from './content.js';
import {rules} from './rules.js';
import {theme} from './theme/index.js';
export default {
  id: 'neon-descent',
  name: 'Neon Descent',
  store: 'neon-descent',
  accent: '#43e7ed',
  blurb: 'Four districts up an arcology, freeways for ramps, and a machine at the top to switch off.',
  layout,
  content,
  rules,
  theme
};
