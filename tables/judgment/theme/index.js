import {floorArt} from './art.js';
import {scenery, bumper} from './props.js';

export const theme = {
  pal: [
    {a: '#647184', b: '#404e68', acc: '#e8c66d', acc2: '#fff4c6', glow: '#a1c7ed', stone: '#c9c2ad'},
    {a: '#292d43', b: '#141722', acc: '#b49162', acc2: '#dcbf8a', glow: '#edc98f', stone: '#777180'},
    {a: '#300b12', b: '#10070d', acc: '#ad302a', acc2: '#ff925e', glow: '#ff543b', stone: '#3d2832'},
    {a: '#160810', b: '#080509', acc: '#80282a', acc2: '#ff925e', glow: '#ff543b', stone: '#31212a'}
  ],
  flagstones: false,
  floorArt,
  scenery,
  bumper,
  fog: ['#1d3148', '#0b101c', '#12050b', '#12050b'],
  tierLight: ['#edf4ff', '#ecd7b6', '#ff6841', '#ff6841'],
  motes: [
    {col: '#fff5c5', style: 'drift'},
    {col: '#bacdf0', style: 'drift'},
    {col: '#ff502f', style: 'rise'},
    {col: '#ff502f', style: 'rise'}
  ],
  music: [{wave: 'sine'}, {wave: 'triangle'}, {wave: 'sawtooth', low: true}],
  fonts: {fontD: 'Georgia, serif', fontL: '"Segoe UI", sans-serif'},
  lampCols: {
    main: '#ffdb70',
    side: '#9de3ff',
    lock: '#90e4cf',
    soft: '#edf5ff',
    danger: '#ff493c',
    gold: '#ffb95b',
    spell: '#c8b5ff'
  },
  fx: {
    flash: 0.45,
    shake: 0.65,
    particle: 'spark',
    bursts: {bump: {col: '#ff865e'}, bell: {col: '#fff2ac'}, eject: {col: '#d6e9ff'}}
  },
  sounds: {
    bell: (arg, A) => {
      A.tone(880, 0.6, 'sine', 0.09);
      A.tone(1320, 0.5, 'sine', 0.04);
    },
    quest: (arg, A) => {
      A.arp([392, 494, 587, 784], 0.12, 'sine', 0.12);
    },
    bossHit: (arg, A) => {
      A.tone(65, 0.35, 'sawtooth', 0.12);
      A.noise(0.13, 0.08);
    }
  }
};
