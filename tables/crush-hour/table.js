/* Crush Hour, as a table for the engine: layout (data), content (data), rules (hooks), theme (art).
   Three playfields standing as a heart, and the whole shared ruleset switched on and re-dressed: it is here to show
   that the same book can look and read nothing like Gravebound. */
import {layout} from './layout.js';
import {content} from './content.js';
import {rules} from './rules.js';
import {theme} from './theme/index.js';
export default {
  id: 'crush-hour',
  name: 'Crush Hour',
  store: 'crush-hour',
  accent: '#ff7eb6',
  blurb: 'A heart of three playfields: your street, your school, the plaza, and one confession to get right.',
  balls: 3,
  feel: 'standard',
  layout,
  content,
  rules,
  theme
};
