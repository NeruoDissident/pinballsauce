import {G, T, A, TY, score, shot, popup, relight, lockBall, startMultiball, gameOver} from '../../engine/api.js';

function mechanisms(r) {
  const m = T.mechanisms;
  m.pearlyGates.open = r.souls.every(Boolean) || r.lockLit || r.judgment >= 2;
  m.beastJaw.open = r.judgment === 3 || (r.judgment === 2 && r.chains && r.attack > 0);
  T.holes.gates.closed = m.pearlyGates.position < 0.9;
  T.holes.beast.closed = m.beastJaw.position < 0.8;
  T.rails.haloLoop.divert = r.judgment === 2;
}
function ringBell(r, n) {
  if (r.souls[1]) return;
  r.bells = Math.min(6, r.bells + n);
  if (r.bells === 6) rescue(r, 1);
  G.dirty = true;
}

function rescue(r, i) {
  if (r.souls[i]) return;
  r.souls[i] = true;
  score(15000);
  const n = r.souls.filter(Boolean).length;
  popup(
    n === 3 ? 'The Gates Await' : 'Soul Rescued',
    n === 3 ? 'Ascend. Shoot the Pearly Gates.' : n + ' of 3 souls saved',
    'main'
  );
  A.s('quest');
  relight();
}
const travel = hd => {
  hd.plan = 'rail';
  hd.delay = 0.65;
};
export const rules = {
  newRun(r) {
    r.souls = [false, false, false];
    r.bells = 0;
    r.judgment = 0;
    r.chains = false;
    r.wounds = 0;
    r.redemptions = 0;
    r.attack = 0;
    r.comboWindow = 0;
    r.salvationPending = false;
    mechanisms(r);
  },
  tick(dt, r) {
    // Continue a save made before the mechanical attack window existed.
    r.attack ??= r.chains ? 25 : 0;
    if (r.comboWindow > 0) r.comboWindow = Math.max(0, r.comboWindow - dt);
    if (r.judgment === 2 && r.attack > 0) {
      r.attack = Math.max(0, r.attack - dt);
      if (!r.attack) {
        r.chains = false;
        T.banks.chains.segs.forEach(s => {
          s.on = true;
        });
        popup('The Jaw Closes', 'Break the Chains to open another attack window', 'bad');
        relight();
      }
    }
    mechanisms(r);
  },
  objective(r) {
    if (r.judgment === 3) return 'REDEMPTION — bring the souls home';
    if (r.judgment === 2)
      return !r.chains ? 'HELL — break the Chains' : 'BEAST ' + r.wounds + '/3 — JAW OPEN ' + Math.ceil(r.attack) + 's';
    if (r.souls.every(Boolean)) return 'HEAVEN — shoot the Pearly Gates';
    return (
      'SAVE SOULS ' +
      r.souls.filter(Boolean).length +
      '/3 — ' +
      (!r.souls[0] ? 'light the Candles' : !r.souls[1] ? 'ring the Bells ' + r.bells + '/6' : 'shoot Sanctuary')
    );
  },
  lamps(add, r) {
    const all = r.souls.every(Boolean);
    add('redemption', 'soft', G.focusTier === 2 ? 'flash' : 'lit');
    add('crosses', 'soft', 'lit');
    add('vigil', 'lock', 'lit');
    add('virtues', 'soft', 'lit');
    add('mercy', 'soft', 'lit');
    add('trumpets', 'gold', 'lit');
    add('serpent', 'soft', 'lit');
    add('pilgrimage', r.comboWindow > 0 ? 'gold' : 'soft', r.comboWindow > 0 ? 'flash' : 'lit');
    add('orbitFeed', 'soft', 'lit');
    add('cathedralBell', 'main', r.souls[1] ? 'lit' : 'flash');
    add('haloLoop', 'soft', 'lit');
    if (r.judgment !== 2) add('haloReturn', 'soft', 'lit');
    else add('apocalypse', 'danger', 'flash');
    add('abyss', 'danger', r.judgment === 2 ? 'flash' : 'lit');
    add('redemptionRise', 'soft', 'lit');
    if (!r.souls[0]) add('candles', 'main', 'flash');
    if (!r.souls[1]) add('bells', 'main', 'flash');
    if (!r.souls[2]) add('sanctuary', 'main', 'flash');
    if (r.judgment < 2) {
      add('ascension', all ? 'main' : 'soft', all ? 'flash' : 'lit');
      add('gates', all ? 'main' : 'soft', all ? 'flash' : 'lit');
    } else {
      add('descent', 'danger', 'flash');
      add(r.judgment === 3 ? 'redemption' : r.chains ? 'beast' : 'chains', 'main', 'flash');
    }
    if (r.lockLit) add('gates', 'lock', 'lit');
  },
  status: {
    soul1: r => +r.souls[0],
    soul2: r => +r.souls[1],
    soul3: r => +r.souls[2],
    gate: r => (r.judgment >= 2 ? 1 : r.souls.every(Boolean) ? 2 : 0),
    grace: r => +!!r.shield,
    beast: r => (r.judgment === 3 ? 1 : r.judgment === 2 ? 2 : 0),
    chain: r => +r.chains,
    wound1: r => +(r.wounds >= 1),
    wound2: r => +(r.wounds >= 2),
    wound3: r => +(r.wounds >= 3),
    bellProgress: r => (r.souls[1] ? 1 : r.bells > 0 ? 2 : 0),
    comboReady: r => (r.comboWindow > 0 ? 2 : 0)
  },
  on: {
    bump(o, b, r) {
      if (o.group === 'bells') ringBell(r, 1);
    },
    captive(o, b, r) {
      if (o.id !== 'cathedralBell') return;
      shot(o.id, o.x, o.y);
      ringBell(r, 2);
      score(2500, o.x, o.y, 'CATHEDRAL BELL');
      A.s('bell');
    },
    magnet() {
      A.s('quest');
    },
    flipHit(o, b, r) {
      if (o.tier === 1 && o.y < TY[1] + 700) r.comboWindow = 3;
    },
    rampIn(o, b, r) {
      if (o.id === 'ascension' && r.comboWindow > 0) {
        score(25000, b.x, b.y, 'ASCENSION COMBO');
        r.comboWindow = 0;
        popup('Ascension', 'Upper flipper combo · 25,000', 'good');
      }
    },
    ramp(o, b, r) {
      if (o.id === 'pilgrimage') {
        r.comboWindow = 5;
        score(5000, b.x, b.y, 'PILGRIMAGE');
      }
      if (o.id === 'redemptionRise' && r.salvationPending) {
        r.salvationPending = false;
        r.won = (r.won || 0) + 1;
        score(250000, b.x, b.y, 'SALVATION');
        if (!G.opt.endless) {
          gameOver(true);
          return;
        }
        r.souls = [false, false, false];
        r.bells = 0;
        r.judgment = 0;
        r.chains = false;
        r.wounds = 0;
        r.attack = 0;
        popup('Salvation', 'A new pilgrimage begins', 'main');
      }
    }
  },
  onComplete: {
    candles(x, y, r) {
      r.mult = Math.min(6, r.mult + 1);
      rescue(r, 0);
    },
    crosses(x, y, r) {
      r.kickback = true;
      G.save = Math.max(G.save, 10);
      popup('Mercy', 'Kickback restored · 10 seconds of ball save', 'good');
    },
    vigil(x, y, r) {
      r.lockLit = true;
      popup('The Choir Is Ready', 'Lock two balls at the Pearly Gates', 'good');
    },
    virtues(x, y, r) {
      r.mult = Math.min(6, r.mult + 1);
      r.shield = true;
      popup('Grace', 'One lost ball will be returned', 'good');
    },
    mercy(x, y, r) {
      r.shield = true;
      popup('Grace', 'One lost ball will be returned', 'good');
    },
    trumpets() {
      G.buffs.moon = 25;
      popup('The Trumpets Sound', 'Double scoring for 25 seconds', 'good');
    },
    chains(x, y, r) {
      r.chains = true;
      r.attack = 25;
      score(10000, x, y);
      popup(
        'Chains Broken',
        r.judgment === 2 ? 'Jaw open for 25 seconds · strike the Beast' : 'The Beast awaits Armageddon',
        'good'
      );
    },
    serpent(x, y, r) {
      r.kickback = true;
      popup('The Serpent Falls', 'Kickback restored', 'good');
    },
    embers(x, y, r) {
      r.mult = Math.min(6, r.mult + 1);
    }
  },
  onScoop: {
    sanctuary(h, b, hd, r) {
      rescue(r, 2);
      hd.delay = 0.8;
    },
    gates(h, b, hd, r) {
      travel(hd);
      r.shield = true;
      if (r.souls.every(Boolean) && r.judgment < 2) {
        r.judgment = 2;
        if (r.chains) r.attack = 25;
        startMultiball('Armageddon', 2, 'gates');
        popup('The Gates Open', 'Descend to Hell. Break the Chains. Defeat the Beast.', 'main');
      } else if (r.lockLit && !G.mb) lockBall(b);
      else {
        score(5000, h.x, h.y, 'GRACE');
        popup(
          'Grace',
          r.souls.every(Boolean) ? 'Confront the Beast below' : 'Rescue three souls on Earth to open the Gates',
          'good'
        );
      }
    },
    descent(h, b, hd) {
      travel(hd);
    },
    redemption(h, b, hd, r) {
      if (r.judgment === 3) {
        r.salvationPending = true;
        popup('Redemption', 'The souls rise. Bring them home.', 'main');
      } else popup('Redemption', 'Returned to Earth', 'good');
      r.redemptions++;
      travel(hd);
      G.save = Math.max(G.save, 6);
    },
    beast(h, b, hd, r) {
      hd.delay = 0.9;
      if (r.judgment !== 2) {
        score(3000, h.x, h.y);
        return;
      }
      if (!r.chains || r.attack <= 0) {
        popup('Bound in Chains', 'Break the lit targets to expose the Beast', 'bad');
        return;
      }
      r.wounds = Math.min(3, r.wounds + 1);
      T.mechanisms.beastJaw.flash = 1;
      score(20000, h.x, h.y, 'THE BEAST');
      A.s('bossHit');
      if (r.wounds === 3) {
        r.judgment = 3;
        popup('The Beast Falls', 'Shoot Redemption. Bring them home.', 'main');
        A.s('bossDie');
      } else popup('The Beast Recoils', 3 - r.wounds + ' strikes remain', 'boss');
    }
  },
  bonus(r) {
    return [
      ['Souls saved', r.souls.filter(Boolean).length, r.souls.filter(Boolean).length * 1500],
      ['Redemptions', r.redemptions, r.redemptions * 500]
    ];
  }
};
