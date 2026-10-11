import {layout} from './layout.js';
import {content} from './content.js';
import {rules} from './rules.js';
import {theme} from './theme/index.js';

export default {
  id: 'judgment',
  name: 'Judgment',
  store: 'judgment',
  accent: '#f1d28d',
  blurb: 'Heaven above. Hell below. Three souls to save, one Beast to overcome.',
  uses: {classes: false, levels: false, health: false, party: false, cards: false, gold: false},
  balls: 3,
  feel: 'standard',
  layout,
  content,
  rules,
  theme
};
