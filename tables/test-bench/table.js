/* Test Bench, as a table for the engine: layout (data), content (data), rules (hooks). No theme: the engine's default look. */
import {layout} from './layout.js';
import {content} from './content.js';
import {rules} from './rules.js';
export default {
  id: 'test-bench',
  name: 'Test Bench',
  store: 'test-bench',
  accent: '#62d8ff',
  blurb: 'A plain table that exercises the engine: five fields on a grid, three flipper sizes, drains that are ramps.',
  layout,
  content,
  rules
};
