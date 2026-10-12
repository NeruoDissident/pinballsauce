/* ================= HUD, MENUS, INPUT ================= */
import {INS, closeInspect, inspectKey, openInspect} from '../app/inspect.js';
import {gfxInfo, gfxKey, resize} from '../app/shell.js';
import {G, T, xpNeed} from '../core/state.js';
import {$, clamp, esc, fmt, prefs, store} from '../core/util.js';
import {CAMS, R3} from '../render/core.js';
import {nudge, setFlip} from '../rules/ball.js';
import {wakeInfo} from '../rules/bosses.js';
import {choose} from '../rules/choices.js';
import {CLASSES} from '../rules/classes.js';
import {COMPANIONS, ROLES} from '../rules/party.js';
import {PERKS, RELICS} from '../rules/perks.js';
import {qCur} from '../rules/quests.js';
import {continueRun, startDemo, startRun} from '../rules/run.js';
import {PLAYER_HP} from '../rules/score.js';
import {SLOTS_ORDER, SLOT_GOAL, goalText, spellDef, spellOf, spellOn, spellRank} from '../rules/spells.js';
import {portrait} from '../rules/tavern.js';
import {wingText} from '../rules/wings.js';
import {BOSSES, CAMPAIGNS, HELP, RULES, STAGES, TEXT, USE, WINGS, WING_KEYS, tr} from '../table/content.js';
import {FLIPPER_POWER, GT, LEVEL_NAMES, NM, WT0, flipperBoost, setFlipperBoost} from '../table/layout.js';
import {A} from './audio.js';
import {GAMEPAD_HELP, bindGamepad, padMenu} from './gamepad.js';
import {explainStep, glossary} from './help.js';

export function popup(title, sub, kind, note) {
  if (G.demo) return;
  title = tr(title); // the table's wording, if it has its own. An empty title drops the banner
  if (!title) return;
  UI.popup(title, tr(sub || ''), kind || 'info', tr(note || ''));
}
export const VERSION = 'engine 0.1';
// a table opened from its own folder (tables/<id>/) has the list of tables two levels up. An installed app has no
// browser Back button, so the title menu offers the way there.
const IN_REPO = /\/tables\/[^/]+\/(index\.html)?$/.test(location.pathname);
const powerText = () => '+' + flipperBoost + '%';
function powerControl() {
  const ticks = [];
  for (let n = FLIPPER_POWER.min; n <= FLIPPER_POWER.max; n += FLIPPER_POWER.step)
    ticks.push('<option value="' + n + '"></option>');
  return (
    '<div class="flipper-power"><label for="optFlipper">Flipper power <output id="flipperValue" for="optFlipper">' +
    powerText() +
    '</output></label><input id="optFlipper" type="range" min="' +
    FLIPPER_POWER.min +
    '" max="' +
    FLIPPER_POWER.max +
    '" step="' +
    FLIPPER_POWER.step +
    '" value="' +
    flipperBoost +
    '" list="flipperTicks" aria-describedby="flipperNote" aria-valuetext="' +
    powerText() +
    '"><datalist id="flipperTicks">' +
    ticks.join('') +
    '</datalist><div class="power-marks" aria-hidden="true"><span>Baseline</span><span>+50%</span><span>+100% · Double</span></div>' +
    '<p id="flipperNote" class="hint">10% steps above the new baseline. Applies to all tables and saves automatically.</p></div>'
  );
}
export const UI = {
  cur: null,
  q: [],
  busy: false,
  eraseArmed: false,
  popup(title, sub, kind, note) {
    if (kind === 'good') UI.q = UI.q.filter(p => p.kind !== 'good');
    UI.q.push({title, sub, kind, note});
    if (UI.q.length > 4) UI.q.splice(0, UI.q.length - 4);
    if (!UI.busy) UI.next();
  },
  next() {
    const p = UI.q.shift(),
      el = $('banner');
    if (!p) {
      UI.busy = false;
      el.textContent = '';
      return;
    }
    UI.busy = true;
    el.textContent = '';
    const d = document.createElement('div');
    d.className = 'bn k-' + p.kind;
    for (const [tag, txt] of [
      ['h2', p.title],
      ['p', p.sub],
      ['small', p.note]
    ]) {
      if (!txt) continue;
      const n = document.createElement(tag);
      n.textContent = txt;
      d.appendChild(n);
    }
    const dur =
      (p.note ? 3.8 : p.kind === 'good' || p.kind === 'info' ? 1.7 : p.sub ? 2.3 : 1.5) * (UI.q.length > 1 ? 0.65 : 1);
    d.style.animationDuration = dur + 's';
    el.appendChild(d);
    setTimeout(UI.next, dur * 1000 + 40);
  },
  objText(q) {
    const o = qCur(q);
    if (!o) return '';
    return (
      o.text +
      (o.n > 1 ? ' (' + Math.min(q.prog, o.n) + '/' + o.n + ')' : '') +
      (q.tl > 0 ? ' — ' + Math.ceil(q.tl) + 's' : '')
    );
  },
  sync(force) {
    const r = G.run,
      play = G.mode === 'play' && r && !G.demo;
    $('hud').hidden = !play;
    $('pauseBtn').hidden = !play;
    $('app').classList.toggle('playing', !!play);
    if (!play) {
      $('bossbar').hidden = true;
      G.cam.top = 0;
      return;
    }
    if (!G.dirty && !force) return;
    G.dirty = false;
    G.cam.top = 0;
    const m = G.mods,
      c = CLASSES[(G.balls.length === 1 && G.balls[0].cls) || r.cls];
    $('hScore').textContent = fmt(r.score);
    // the HUD shows only what this table uses
    $('hLv').hidden = !USE.levels;
    $('hLv').textContent = tr('Lv ' + r.level);
    $('hCls').textContent = USE.classes ? c.name : '';
    $('hGold').hidden = $('hCoin').hidden = !USE.gold;
    $('hGold').textContent = r.gold;
    $('bXp').parentNode.hidden = !USE.levels;
    $('bCh').parentNode.hidden = !USE.meter;
    $('journal').hidden = !USE.quests && !USE.side;
    $('sheet').hidden = !USE.classes && !USE.party && !USE.cards;
    $('bHp').parentNode.hidden = !PLAYER_HP();
    $('bHp').style.width = clamp((r.hp / m.maxHp) * 100, 0, 100) + '%';
    $('tHp').textContent = Math.ceil(r.hp) + ' / ' + m.maxHp;
    $('bHp').parentNode.classList.toggle('low', r.hp < m.maxHp * 0.3);
    $('bXp').style.width = clamp((r.xp / xpNeed(r.level)) * 100, 0, 100) + '%';
    const armed = G.balls.some(b => b.arm > 0 || b.pow),
      g = r.grave;
    $('bCh').style.width = clamp(r.charge, 0, 100) + '%';
    $('tCh').textContent = tr(armed ? c.shot + ' armed' : r.charge >= 100 ? c.abil + ' ready' : c.shot);
    $('bCh').parentNode.classList.toggle('full', r.charge >= 100);
    let b = '';
    for (let i = 1; i < r.ballsLeft; i++) b += '<i></i>';
    $('hBalls').innerHTML = b;
    $('hBallN').textContent = tr('Ball ' + r.ballNum);
    $('hObj').textContent = G.inGrave
      ? T.banks.nails.segs.some(x => x.on)
        ? TEXT.graveObjNails
        : TEXT.graveObjLight
      : G.focusTier > GT
        ? wingText()
        : r.main
          ? UI.objText(r.main)
          : !USE.quests
            ? RULES.objective
              ? RULES.objective(r) || ''
              : ''
            : TEXT.quiet;
    const chips = [];
    const ch = (t, k) => {
      t = tr(t);
      if (t) chips.push('<span class="chip ' + (k || '') + '">' + esc(t) + '</span>');
    };
    if (G.pending.length)
      ch(
        G.pending[0] === 'book'
          ? 'Level up waiting: shoot a scoop'
          : G.pending[0] === 'perk'
            ? 'A boon waits: shoot a scoop'
            : TEXT.tavernWaits,
        'gold'
      );
    if (r.mult > 1) ch(r.mult + 'x', 'gold');
    if (G.plunge.ready)
      ch(UI.touch ? 'Hold the right side, let go to launch' : 'Hold Space, release to launch', 'frost');
    if (G.save > 0 && !G.plunge.ready) ch('Ball save ' + Math.ceil(G.save) + 's', 'frost');
    if (r.shield) ch('Ward', 'gold');
    if (G.inGrave) ch('The lid closes in ' + Math.ceil(G.graveT) + 's', G.graveT < 8 ? 'bad' : 'moss');
    else if (G.focusTier > GT)
      ch(WINGS[WING_KEYS[G.focusTier - WT0]].clock + Math.ceil(G.wingT || 0) + 's', G.wingT < 12 ? 'bad' : 'moss');
    else if (G.wave.active) ch('Wave ' + G.wave.active.n + ' · ' + G.wave.active.left + ' left', 'bad');
    else if (USE.grave && g.open) ch(TEXT.graveChip + ' open', 'moss');
    else if (USE.grave && g.hits > 0) ch(TEXT.graveChip + ' ' + g.hits + '/' + g.need, '');
    if (armed) ch(G.balls.some(b => b.pow) ? c.shot : c.shot + ' armed. Flip to release', 'violet');
    else if (!G.plunge.ready && r.charge >= 100 && USE.party && !G.rallyActive)
      ch('Cradle 1.5 s to Rally the party', 'frost');
    else if (!G.plunge.ready && r.charge >= 33 && USE.classes) ch('Cradle the ball: ' + c.shot, 'frost');
    if (G.rallyActive) ch('Rally · ' + G.balls.length + ' balls', 'gold');
    else if (G.balls.length === 1 && G.balls[0].rallyRole) ch(G.balls[0].label + ' · Last ball', 'gold');
    if (G.rallyT > 0) ch('Rally powers ' + Math.ceil(G.rallyT) + 's', 'gold');
    for (const cs of G.casts) ch(spellDef(cs.id).name + ' ' + Math.ceil(cs.t) + 's', 'violet');
    for (const sl of SLOTS_ORDER) {
      const d = spellOf(r.cls, sl);
      if (d && spellRank(d.id) >= 0 && !spellOn(d.id) && G.focusTier < NM) ch(d.name + ': ' + goalText(sl), 'soft');
    }
    if (G.mb) ch(G.mb.name + ' multiball', 'gold');
    if (r.lockLit) ch('Lock lit' + (r.locks ? ' ' + r.locks + '/2' : ''), 'moss');
    if (G.combo > 1 && G.comboT > 0) ch('Combo ' + G.combo + 'x', 'violet');
    if (G.buffs.sharp > 0) ch(TEXT.buffs.sharp, 'gold');
    if (G.buffs.stealth > 0) ch(TEXT.buffs.stealth, 'violet');
    if (G.buffs.aegis > 0) ch(TEXT.buffs.aegis, 'frost');
    if (G.buffs.moon > 0) ch(TEXT.buffs.moon, 'frost');
    if (G.curse.dark > 0) ch('Darkness', 'bad');
    if (G.curse.weak > 0) ch('Weakened', 'bad');
    if (G.curse.hex > 0) ch('Hexed', 'bad');
    if (G.curse.burn > 0) ch('Burning', 'bad');
    if (G.tilt > 0) ch(G.fallen ? 'Fallen' : 'Tilt', 'bad');
    $('hFx').innerHTML = chips.join('');
    const bo = G.boss,
      wk = G.focusTier < NM ? wakeInfo(G.focusTier) : null,
      here = bo && bo.alive && bo.tier === G.focusTier;
    $('bossbar').hidden = !(here || (wk && wk.state === 'dormant') || (bo && bo.alive));
    $('bossbar').classList.toggle('dormant', !here && !!(wk && wk.state === 'dormant'));
    if (!here && wk && wk.state === 'dormant') {
      $('bossName').textContent = BOSSES[wk.key].name;
      $('bossHp').style.width = Math.round(wk.fill * 100) + '%';
      const nq = r.main && qCur(r.main),
        nt = nq && nq.t !== 'boss' ? UI.objText(r.main) : '';
      $('bossPhase').textContent = tr(wk.fill < 1 ? 'Wakes with the main quest. Next: ' : 'Rising. ') + nt;
    } else if (bo && bo.alive && !here) {
      $('bossName').textContent = bo.def.name;
      $('bossHp').style.width = clamp((bo.hp / bo.maxHp) * 100, 0, 100) + '%';
      $('bossPhase').textContent = tr('Waiting on ') + LEVEL_NAMES[bo.tier];
    } else if (bo && bo.alive) {
      $('bossName').textContent = bo.def.name;
      $('bossHp').style.width = clamp((bo.hp / bo.maxHp) * 100, 0, 100) + '%';
      $('bossPhase').textContent = tr(
        {
          shield: 'Warded. Strike the lit bumpers',
          open: bo.stun > 0 ? 'Staggered. Double damage' : 'Exposed. Strike the boss',
          summon: 'Summoning. Slay the minions',
          cast: 'Casting ' + bo.def.cast.name + '. Hit a red shot',
          frenzy: 'Frenzy'
        }[bo.phase] || ''
      );
    }
    // side panels
    let h = '';
    if (r.main) {
      const q = r.main;
      h += '<h4>' + esc(q.name) + '</h4><p class="flav">' + esc(q.text) + '</p><ol class="steps">';
      q.steps.forEach((o, i) => {
        h +=
          '<li class="' +
          (i < q.si ? 'done' : i === q.si ? 'cur' : '') +
          '"><b>' +
          (q.stages || STAGES)[i] +
          '</b>' +
          (i < q.si
            ? '<span>' + esc(o.text) + '</span>'
            : i === q.si
              ? '<span>' + esc(UI.objText(q)) + '</span>'
              : '') +
          '</li>';
      });
      h += '</ol>';
    } else h = USE.quests ? '<p class="flav">' + esc(TEXT.noMain) + '</p>' : '';
    $('jMain').innerHTML = h;
    $('jMain').previousElementSibling.textContent = TEXT.mainHead;
    $('jMain').previousElementSibling.hidden = $('jMain').hidden = !USE.quests;
    $('jSide').previousElementSibling.textContent = TEXT.sideHead;
    $('jSide').previousElementSibling.hidden = $('jSide').hidden = !USE.side;
    h = '';
    for (const q of r.side)
      h +=
        '<div class="sq"><h4>' +
        esc(q.name) +
        '</h4><em>' +
        esc(q.giver) +
        '</em><span>' +
        esc(UI.objText(q)) +
        '</span></div>';
    $('jSide').innerHTML = h || '<p class="flav">' + esc(TEXT.noSide) + '</p>';
    const cnt = {};
    r.perks.forEach(p => (cnt[p] = (cnt[p] || 0) + 1));
    const rc = {};
    r.relics.forEach(p => (rc[p] = (rc[p] || 0) + 1));
    // the sheet beside the table: one section for each system this table uses
    h = '';
    if (USE.classes)
      h +=
        '<h4 style="color:' +
        c.color +
        '">' +
        c.name +
        '</h4><p class="flav">' +
        esc(c.tag) +
        '</p><dl>' +
        (USE.levels ? '<dt>Level</dt><dd>' + r.level + '</dd>' : '') +
        '<dt>Power</dt><dd>' +
        Math.round(m.pow) +
        '</dd><dt>Crit</dt><dd>' +
        Math.round(m.crit * 100) +
        '%</dd>' +
        (USE.gold
          ? '<dt>' + esc(TEXT.coin[0].toUpperCase() + TEXT.coin.slice(1)) + '</dt><dd>' + r.gold + '</dd>'
          : '') +
        (USE.foes ? '<dt>Slain</dt><dd>' + r.kills + '</dd>' : '') +
        '<dt>Threat</dt><dd>' +
        r.threat +
        '</dd></dl>' +
        '<h3>Powers</h3><p class="pw"><b>Nudge: ' +
        esc(c.nudge) +
        '.</b> ' +
        esc(c.nudgeText) +
        '</p><p class="pw"><b>Cradle: ' +
        esc(c.shot) +
        '.</b> ' +
        esc(c.shotText) +
        '</p>';
    if (USE.party) h += '<p class="pw"><b>Full meter: Rally.</b> Cradle 1.5 s and the party comes out.</p>';
    if (USE.levels)
      h +=
        '<h3>Spellbook</h3>' +
        SLOTS_ORDER.map(sl => {
          const d = spellOf(r.cls, sl),
            rk = spellRank(d.id);
          return (
            '<p class="pw"' +
            (rk < 0 ? ' style="opacity:.5"' : '') +
            '><b>' +
            esc(d.name) +
            (rk >= 0 ? ' ' + (rk + 1) : '') +
            '.</b> ' +
            (rk < 0 ? 'Locked. ' : '') +
            esc(SLOT_GOAL[sl].text) +
            (rk >= 0 ? ' <small>' + esc(goalText(sl)) + '</small>' : '') +
            '</p>'
          );
        }).join('');
    if (USE.cards)
      h +=
        '<h3>Boons</h3><ul class="tags">' +
        (Object.keys(cnt)
          .map(id => {
            const p = PERKS.find(x => x.id === id);
            if (!p) return '';
            return (
              '<li class="' +
              p.kind +
              '" title="' +
              esc(p.desc) +
              '">' +
              esc(p.name) +
              (cnt[id] > 1 ? ' ' + cnt[id] : '') +
              '</li>'
            );
          })
          .join('') || '<li class="none">None yet</li>') +
        '</ul>' +
        '<h3>Relics</h3><ul class="tags">' +
        (Object.keys(rc)
          .map(id => {
            const p = RELICS.find(x => x.id === id);
            return '<li title="' + esc(p.desc) + '">' + esc(p.name) + (rc[id] > 1 ? ' ' + rc[id] : '') + '</li>';
          })
          .join('') || '<li class="none">None yet</li>') +
        '</ul>';
    if (USE.party)
      h +=
        '<h3>Party</h3>' +
        (r.recruits || [])
          .map(q => {
            const cc = CLASSES[q.cls],
              sp = spellDef(q.spell);
            return (
              '<p class="pw mate"><i class="orb" style="--c:' +
              cc.color +
              ';--g:' +
              cc.glow +
              '"></i><b style="color:' +
              cc.glow +
              '">' +
              cc.name +
              '</b> <small>' +
              esc(sp.name) +
              '</small></p>'
            );
          })
          .join('') +
        ((r.party || [])
          .map(q => {
            const d = COMPANIONS[q.id],
              R = ROLES[d.role];
            return (
              '<p class="pw mate" title="' +
              esc(d.desc) +
              '"><b style="color:' +
              R.col +
              '">' +
              esc(d.name) +
              '</b> <small>' +
              R.name +
              ', ' +
              q.slot +
              ' post</small><i class="bar"><i style="width:' +
              Math.round((100 * q.hp) / q.maxHp) +
              '%;background:' +
              (q.hp > 0 ? R.col : '#553') +
              '"></i></i>' +
              (q.hp <= 0 ? ' <small>wounded</small>' : '') +
              '</p>'
            );
          })
          .join('') || '<p class="flav">' + esc(TEXT.alone) + '</p>');
    $('sheetBody').innerHTML = h;
  },
  bonus(b, more) {
    const el = $('bonus');
    if (!b) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML =
      '<h2>' +
      (b.fallen ? 'Fallen' : b.tilt ? 'Tilt' : 'Ball lost') +
      '</h2><dl>' +
      b.lines.map(l => '<dt>' + tr(l[0]) + '</dt><dd>' + l[1] + ' <small>' + fmt(l[2]) + '</small></dd>').join('') +
      '<dt>Multiplier</dt><dd>' +
      b.mult +
      'x</dd></dl><p class="big">' +
      (b.tilt ? 'No bonus' : '+' + fmt(b.total)) +
      '</p><p>' +
      (more ? 'The next ball is on its way.' : 'That was your last ball.') +
      '</p>';
  },
  choice(c) {
    if (!c) {
      UI.menu(null);
      return;
    }
    let h =
      '<div class="pane wide"><h2>' + esc(c.title) + '</h2><p class="lead">' + esc(c.sub) + '</p><div class="cards">';
    c.opts.forEach((o, i) => {
      const no = o.cost && G.run.gold < o.cost;
      h +=
        '<button class="card' +
        (o.key ? ' key' : '') +
        (o.orb ? ' hire' : '') +
        '" data-act="choose" data-i="' +
        i +
        '"' +
        (no ? ' disabled' : '') +
        '>' +
        (o.orb
          ? o.face
            ? '<img class="face" src="' + portrait(o.face[0], o.face[1]) + '" alt="">'
            : '<i class="orb big" style="--c:' + o.orb[0] + ';--g:' + o.orb[1] + '"></i>'
          : '') +
        '<small>' +
        esc(o.tag || '') +
        '</small><b>' +
        esc(o.name) +
        '</b><span>' +
        esc(o.desc) +
        '</span></button>';
    });
    h +=
      '</div><p class="hint">' +
      (UI.touch ? 'Tap one to take it.' : 'Flippers move, Space or Enter picks.') +
      '</p></div>';
    UI.show(h, 'choice');
  },
  gameOver(r) {
    UI.overRun = r;
    UI.menu('over');
  },
  show(html, name) {
    if (Object.values(inputHolds).some(holds => holds.size)) clearInputs();
    const m = $('menu');
    m.innerHTML = html;
    m.hidden = false;
    m.className = name === 'title' ? 'attract' : '';
    UI.cur = name;
    const b = m.querySelector('button:not([disabled]),input');
    if (b) b.focus({preventScroll: true});
  },
  menu(name) {
    const m = $('menu');
    UI.eraseArmed = false;
    if (!name) {
      m.hidden = true;
      m.innerHTML = '';
      UI.cur = null;
      return;
    }
    let h = '';
    const btn = (act, label, extra) => '<button data-act="' + act + '"' + (extra || '') + '>' + label + '</button>';
    if (name === 'title') {
      const sv = store.get('run', null),
        meta = store.get('meta', {});
      h =
        '<div class="pane title"><p class="eyebrow">' +
        esc(TEXT.eyebrow) +
        '</p><h1>' +
        esc(TEXT.title) +
        '<span>' +
        esc(TEXT.titleSmall) +
        '</span></h1><nav>' +
        btn('new', 'New run') +
        (sv && sv.run
          ? btn(
              'continue',
              'Continue <small>' +
                esc(
                  [
                    USE.classes && CLASSES[sv.run.cls] ? CLASSES[sv.run.cls].name : '',
                    USE.levels ? 'level ' + sv.run.level : '',
                    'ball ' + sv.run.ballNum
                  ]
                    .filter(Boolean)
                    .join(', ')
                ) +
                '</small>'
            )
          : '') +
        btn('help', 'How to play') +
        btn('scores', 'High scores') +
        btn('options', 'Options') +
        btn('controls', 'Controls') +
        btn('inspect', 'Inspect table') +
        (window.__pbTables || IN_REPO ? btn('tables', 'Other tables') : '') +
        '</nav>' +
        (meta.bosses && USE.gold
          ? '<p class="hint">Legacy: ' +
            meta.bosses +
            ' bosses slain. New heroes start with ' +
            Math.min(100, meta.bosses * 10) +
            ' ' +
            esc(TEXT.coin) +
            '.</p>'
          : '<p class="hint">' + esc(TEXT.hintFresh) + '</p>') +
        (G.opt.endless ? '<p class="hint">Endless mode is on.</p>' : '') +
        '<p class="ver">' +
        esc(TEXT.version || VERSION) +
        '</p></div>';
    } else if (name === 'class') {
      h =
        '<div class="pane wide"><h2>Choose your hero</h2><p class="lead">The ball is the hero. Hits fill your power meter. Hold the ball still on a raised flipper to spend a third of it on your class shot, or all of it at full.</p><div class="cards four">';
      for (const k in CLASSES) {
        const c = CLASSES[k];
        h +=
          '<button class="card cls" data-act="class" data-k="' +
          k +
          '"><i class="orb" style="--c:' +
          c.color +
          ';--g:' +
          c.glow +
          '"></i><b>' +
          c.name +
          '</b><small>' +
          esc(c.tag) +
          '</small><span class="stat">Health ' +
          c.hp +
          ' &middot; Power ' +
          c.pow +
          '</span><span>' +
          esc(c.pass) +
          '</span><span><em>Nudge: ' +
          esc(c.nudge) +
          '.</em> ' +
          esc(c.nudgeText) +
          '</span><span><em>Cradle: ' +
          esc(c.shot) +
          '.</em> ' +
          esc(c.shotText) +
          '</span><span><em>Full meter: ' +
          esc(c.abil) +
          '.</em> ' +
          esc(c.abilText) +
          '</span></button>';
      }
      h += '</div><nav class="row">' + btn('title', 'Back') + '</nav></div>';
    } else if (name === 'scores') {
      const sc = store.get('scores', []);
      h =
        '<div class="pane"><h2>High scores</h2>' +
        (sc.length
          ? '<table><thead><tr><th></th><th>Name</th><th>Score</th>' +
            (USE.classes ? '<th>' + esc(TEXT.heroHead) + '</th>' : '') +
            '</tr></thead><tbody>' +
            sc
              .map(
                (s, i) =>
                  '<tr' +
                  (s.id === UI.lastId ? ' class="me"' : '') +
                  '><td>' +
                  (i + 1) +
                  '</td><td>' +
                  esc(s.name) +
                  '</td><td>' +
                  fmt(s.score) +
                  '</td>' +
                  (USE.classes ? '<td>' + esc(s.cls) + (USE.levels ? ' ' + s.level : '') + '</td>' : '') +
                  '</tr>'
              )
              .join('') +
            '</tbody></table>'
          : '<p class="lead">' + esc(TEXT.noScores) + '</p>') +
        '<nav class="row">' +
        btn('title', 'Back') +
        '</nav></div>';
    } else if (name === 'party') {
      h =
        '<div class="pane wide"><h2>Who stands the drain?</h2><p class="lead">A companion guards the bottom drain. A ball that would go out bounces off them, at a cost to their health. Swarms go for them.</p><div class="cards">';
      for (const k of UI.firstPick || []) {
        const d = COMPANIONS[k],
          R = ROLES[d.role];
        h +=
          '<button class="card" data-act="recruit" data-k="' +
          k +
          '"><small style="color:' +
          R.col +
          '">' +
          R.name +
          '</small><b>' +
          esc(d.name) +
          '</b><span>' +
          esc(d.desc) +
          '</span></button>';
      }
      h += '</div><nav class="row">' + btn('alone', 'Ride alone') + btn('new', 'Back') + '</nav></div>';
    } else if (name === 'options') {
      h =
        '<div class="pane"><h2>Options</h2>' +
        powerControl() +
        '<label for="optMusic">Music<input id="optMusic" type="range" min="0" max="100" value="' +
        Math.round(A.vol.m * 100) +
        '"></label><label for="optSfx">Sound effects<input id="optSfx" type="range" min="0" max="100" value="' +
        Math.round(A.vol.s * 100) +
        '"></label>' +
        '<label for="optShake" class="check"><input id="optShake" type="checkbox"' +
        (G.opt.shake ? ' checked' : '') +
        '>Screen shake</label><label for="optAuto" class="check"' +
        (USE.levels || USE.cards || USE.party ? '' : ' hidden') +
        '><input id="optAuto" type="checkbox"' +
        (G.opt.autoPick ? ' checked' : '') +
        '>Auto pick: level-ups, boons and hires are chosen for you, no interruptions</label><label for="optEndless" class="check"' +
        (USE.quests ? '' : ' hidden') +
        '><input id="optEndless" type="checkbox"' +
        (G.opt.endless ? ' checked' : '') +
        '>' +
        esc(TEXT.endlessNote) +
        '</label><nav>' +
        btn('gfxCam', 'View: ' + CAMS[R3.camMode].name) +
        btn('gfxQual', 'Detail: ' + (R3.q ? R3.q.label : '')) +
        btn('erase', 'Erase saved run and scores') +
        btn(UI.back || 'title', 'Back') +
        '</nav></div>';
    } else if (name === 'controls') {
      h =
        '<div class="pane"><h2>Controls</h2><dl class="keys"><dt>Left flippers</dt><dd>Z, Left Arrow or Left Shift</dd><dt>Right flippers</dt><dd>/, Right Arrow or Right Shift</dd><dt>Nudge</dt><dd>Space</dd><dt>Launch</dt><dd>Hold Space or the right flipper, then release</dd>' +
        (USE.classes
          ? '<dt>Class power</dt><dd>Hold the ball still on a raised flipper until the ring fills, then let it roll and flip</dd>'
          : USE.party
            ? '<dt>Rally</dt><dd>With a full meter, hold the ball still on a raised flipper until the ring fills</dd>'
            : '') +
        '<dt>Controller</dt><dd>' +
        GAMEPAD_HELP +
        '. D-pad or left stick: menus; A: select; B: back. Press a button to connect. On handheld PCs, select Gamepad mode.</dd><dt>Pause</dt><dd>P or Esc</dd><dt>View, detail, full screen</dt><dd>C, Q and F</dd><dt>Touch</dt><dd>Left and right halves of the screen flip. Hold the right half and let go to launch. Double-tap either half to nudge (mash and you will tilt); the bottom middle of the screen nudges too. The eye button at the top changes the view.</dd></dl>' +
        '<p class="lead">Every left flipper on the table moves together, and so does every right one. ' +
        esc(TEXT.controlsNote) +
        '</p><nav class="row">' +
        btn(UI.back || 'title', 'Back') +
        '</nav></div>';
    } else if (name === 'pause') {
      const r = G.run,
        ex = q => {
          const t = explainStep(qCur(q));
          return t ? '<small class="what">' + esc(t) + '</small>' : '';
        };
      h =
        '<div class="pane doc"><h2>Paused</h2>' +
        powerControl() +
        (r.main ? '<p class="lead">' + esc(UI.objText(r.main)) + '</p>' + ex(r.main) : '') +
        r.side
          .map(q => '<p class="sqline"><b>' + esc(q.name) + '.</b> ' + esc(UI.objText(q)) + '</p>' + ex(q))
          .join('') +
        '<nav>' +
        btn('resume', 'Resume') +
        btn('help', 'How to play') +
        btn('options', 'Options') +
        btn('controls', 'Controls') +
        btn('inspect', 'Inspect table') +
        btn('abandon', 'Abandon run') +
        '</nav></div>';
    } else if (name === 'help') {
      h =
        '<div class="pane doc wide"><h2>How to play</h2>' +
        HELP.map(sec => '<h3>' + esc(sec[0]) + '</h3><p class="lead">' + esc(sec[1]) + '</p>').join('') +
        '<h3>Every named shot</h3>' +
        glossary()
          .map(
            g =>
              '<h4>' +
              esc(g[0].replace(/^the /, 'The ')) +
              '</h4><dl class="gloss">' +
              g[1]
                .map(
                  r =>
                    '<dt>' +
                    esc(r[0]) +
                    '</dt><dd>' +
                    esc(r[1].replace(r[0] + ' is ', '').replace(/^\w/, c => c.toUpperCase())) +
                    '</dd>'
                )
                .join('') +
              '</dl>'
          )
          .join('') +
        '<nav class="row">' +
        btn(UI.back || 'title', 'Back') +
        '</nav></div>';
    } else if (name === 'over') {
      const r = UI.overRun,
        t = Math.round(r.time),
        won = r.ended === 'won',
        camp = r.arcs.map(k => CAMPAIGNS[k].name).join(', ');
      h =
        '<div class="pane"><p class="eyebrow">' +
        esc(won ? TEXT.overWon : TEXT.overLost) +
        '</p><h2 class="score">' +
        fmt(r.score) +
        '</h2><p class="lead">' +
        esc(won && r.arcs.length ? CAMPAIGNS[r.arcs[r.arcs.length - 1]].win : won ? '' : TEXT.lost) +
        '</p><dl>' +
        // one line for each system this table uses
        (USE.classes
          ? '<dt>' +
            esc(TEXT.heroHead) +
            '</dt><dd>' +
            CLASSES[r.cls].name +
            (USE.levels ? ', level ' + r.level : '') +
            '</dd>'
          : '') +
        (USE.quests
          ? '<dt>' +
            esc(TEXT.campHead) +
            (r.arcs.length > 1 ? 's' : '') +
            '</dt><dd>' +
            esc(camp) +
            (won ? ' <small>complete</small>' : '') +
            '</dd>'
          : '') +
        (USE.bosses ? '<dt>Bosses slain</dt><dd>' + r.bossKills + '</dd>' : '') +
        (USE.foes ? '<dt>Foes slain</dt><dd>' + r.kills + '</dd>' : '') +
        (USE.side ? '<dt>' + esc(TEXT.sideHead) + ' done</dt><dd>' + r.questsDone + '</dd>' : '') +
        (WING_KEYS.length
          ? '<dt>Wing</dt><dd>' +
            (r.wing && r.wing.done
              ? esc(WINGS[r.wing.key].name) + ' cleared'
              : r.wing && r.wing.key
                ? esc(WINGS[r.wing.key].name) + ' left standing'
                : 'none') +
            '</dd>'
          : '') +
        (USE.cards
          ? '<dt>Relics</dt><dd>' +
            (r.relics.length
              ? r.relics
                  .map(id => {
                    const x = RELICS.find(q => q.id === id);
                    return x ? esc(x.name) : '';
                  })
                  .filter(Boolean)
                  .join(', ')
              : 'none') +
            '</dd>'
          : '') +
        '<dt>Best combo</dt><dd>' +
        r.stat.bestCombo +
        'x</dd><dt>Balls lost</dt><dd>' +
        (won ? r.ballNum - 1 : r.ballNum) +
        '</dd><dt>Time</dt><dd>' +
        ((t / 60) | 0) +
        ':' +
        ('0' + (t % 60)).slice(-2) +
        '</dd></dl>' +
        '<label for="hsName">' +
        esc(TEXT.nameAsk) +
        '<input id="hsName" type="text" maxlength="12" autocomplete="off" value="' +
        esc(store.get('name', '')) +
        '" placeholder="Name"></label><nav>' +
        btn('saveScore', 'Save score') +
        btn('new', 'New run') +
        btn('title', 'Title') +
        '</nav></div>';
    }
    UI.show(h, name);
  },
  act(el) {
    const a = el.dataset.act;
    A.init();
    A.s('ui');
    switch (a) {
      case 'new': // pick a class ball if the table has classes, a companion if it has a party, else just play
      case 'class':
        UI.cls = a === 'class' ? el.dataset.k : 'plain';
        if (a === 'new' && USE.classes) UI.menu('class');
        else if (USE.party) {
          UI.firstPick = Object.keys(COMPANIONS);
          UI.menu('party');
        } else {
          UI.menu(null);
          startRun(UI.cls, null);
        }
        break;
      case 'recruit':
        UI.menu(null);
        startRun(UI.cls, el.dataset.k);
        break;
      case 'alone':
        UI.menu(null);
        startRun(UI.cls, null);
        break;
      case 'continue':
        UI.menu(null);
        if (!continueRun()) UI.menu('title');
        break;
      case 'scores':
        UI.menu('scores');
        break;
      case 'inspect':
        openInspect();
        break;
      case 'tables':
        if (window.__pbTables) window.__pbTables();
        else location.href = '../../index.html'; // the list of tables at the top of the repo
        break; // only in a build that carries more than one table (app/picker.js)
      case 'options':
        UI.back = UI.cur === 'pause' ? 'pause' : 'title';
        UI.menu('options');
        break;
      case 'controls':
        UI.back = UI.cur === 'pause' ? 'pause' : 'title';
        UI.menu('controls');
        break;
      case 'help':
        UI.back = UI.cur === 'pause' ? 'pause' : 'title';
        UI.menu('help');
        break;
      case 'pause':
        UI.menu('pause');
        break;
      case 'title':
        if (G.mode !== 'title' || !G.demo) startDemo();
        UI.menu('title');
        break;
      case 'resume':
        G.paused = false;
        UI.menu(null);
        break;
      case 'abandon':
        if (el.dataset.sure) {
          G.paused = false;
          store.del('run');
          startDemo();
          UI.menu('title');
        } else {
          el.dataset.sure = 1;
          el.textContent = 'Press again to abandon';
        }
        break;
      case 'erase':
        if (UI.eraseArmed) {
          store.del('run');
          store.del('scores');
          store.del('meta');
          el.textContent = 'Erased';
          el.disabled = true;
        } else {
          UI.eraseArmed = true;
          el.textContent = 'Press again to erase';
        }
        break;
      case 'choose':
        choose(+el.dataset.i);
        break;
      case 'gfxCam':
      case 'gfxQual': {
        gfxKey(a === 'gfxCam' ? 'cam' : 'qual');
        UI.menu('options');
        const b = $('menu').querySelector('[data-act=' + a + ']');
        if (b) b.focus({preventScroll: true});
        break;
      }
      case 'saveScore': {
        const r = UI.overRun,
          name = ($('hsName').value || 'Nameless').trim().slice(0, 12) || 'Nameless';
        store.set('name', name);
        const sc = store.get('scores', []);
        UI.lastId = Date.now();
        sc.push({
          id: UI.lastId,
          name: name + (r.ended === 'won' ? ' \u2655' : '') + (r.dev ? ' *' : ''),
          score: r.score,
          cls: CLASSES[r.cls].name,
          level: r.level
        });
        sc.sort((a, b) => b.score - a.score);
        store.set('scores', sc.slice(0, 10));
        startDemo();
        UI.menu('scores');
        break;
      }
    }
  }
};
export function togglePause() {
  if (G.mode !== 'play' || G.choice) return;
  if (UI.cur && UI.cur !== 'pause') {
    UI.menu('pause');
    return;
  }
  G.paused = !G.paused;
  UI.menu(G.paused ? 'pause' : null);
  if (G.paused) {
    clearInputs();
  }
}
export const KEYS = {
  ArrowLeft: 'l',
  KeyZ: 'l',
  ShiftLeft: 'l',
  KeyA: 'l',
  ArrowRight: 'r',
  Slash: 'r',
  ShiftRight: 'r',
  KeyL: 'r',
  KeyM: 'r',
  Space: 'n',
  ArrowDown: 'n',
  ArrowUp: 'u',
  KeyP: 'p',
  Escape: 'p',
  KeyC: 'cam',
  KeyQ: 'qual',
  KeyF: 'full',
  Backquote: 'dev',
  Digit1: 'd1',
  Digit2: 'd2',
  Digit3: 'd3',
  Digit4: 'd4',
  Digit5: 'd5',
  Digit6: 'd6',
  Digit7: 'd7',
  Digit8: 'd8',
  Digit9: 'd9',
  KeyG: 'dg',
  KeyB: 'db',
  KeyN: 'dn'
};
export function moveFocus(d) {
  const bs = [...$('menu').querySelectorAll('button:not([disabled]),input')];
  if (!bs.length) return;
  let i = bs.indexOf(document.activeElement);
  i = (i + d + bs.length) % bs.length;
  if (i < 0) i = 0;
  bs[i].focus({preventScroll: true});
  A.s('ui');
}
// Keep input sources independent: releasing a trigger cannot cancel a held keyboard key or finger.
const inputHolds = {l: new Set(), r: new Set(), n: new Set()};
function inputHold(source, key, on) {
  const holds = inputHolds[key];
  if (on) holds.add(source);
  else holds.delete(source);
  if (key === 'n') G.in.n = !!holds.size;
  else setFlip(key === 'l' ? -1 : 1, !!holds.size);
}
function clearInputs() {
  for (const holds of Object.values(inputHolds)) holds.clear();
  setFlip(-1, false);
  setFlip(1, false);
  G.in.n = false;
}
function padBack() {
  if (INS.on) closeInspect();
  else if (UI.cur === 'pause') togglePause();
  else if (['options', 'controls', 'help', 'scores', 'class', 'party'].includes(UI.cur))
    UI.act({
      dataset: {act: UI.cur === 'party' ? 'new' : ['scores', 'class'].includes(UI.cur) ? 'title' : UI.back || 'title'}
    });
  else if (UI.cur === 'title') $('menu').querySelector('[data-act="tables"]')?.click();
}
export function bindInput() {
  bindGamepad({
    context: () => (INS.on ? 'inspect' : UI.cur || G.mode),
    lost: () => {
      if (G.mode === 'play' && !G.paused && !G.choice && !INS.on) togglePause();
    },
    frame: ({held, pressed, move}) => {
      if (Object.values(pressed).some(Boolean)) A.init();
      const playing = !UI.cur && !INS.on && G.mode === 'play' && !G.paused;
      inputHold('pad', 'l', playing && held.l);
      inputHold('pad', 'r', playing && held.r);
      inputHold('pad', 'n', playing && held.a);
      if (INS.on) {
        if (pressed.b || pressed.pause) closeInspect();
      } else if (UI.cur) {
        if (pressed.pause && G.paused) {
          G.paused = false;
          UI.menu(null);
        } else if (pressed.b) padBack();
        else padMenu($('menu'), move, pressed.a);
      } else if (playing) {
        if (pressed.pause || pressed.b) togglePause();
        else {
          if (pressed.a) nudge();
          if (pressed.view) gfxKey('cam');
        }
      }
    }
  });
  addEventListener('keydown', e => {
    if (inspectKey(e)) return;
    const k = KEYS[e.code],
      typing = e.target && e.target.tagName === 'INPUT' && e.target.type === 'text';
    if (typing) {
      if (e.code === 'Enter') {
        const b = $('menu').querySelector('[data-act=saveScore]');
        if (b) UI.act(b);
      }
      return;
    }
    if (!k) return;
    A.init();
    if (UI.cur) {
      if (e.target && e.target.type === 'range' && (k === 'l' || k === 'r') && e.code.startsWith('Arrow')) return;
      if (k === 'l' || k === 'u') {
        moveFocus(-1);
        e.preventDefault();
      } else if (k === 'r' || (k === 'n' && e.code === 'ArrowDown')) {
        moveFocus(1);
        e.preventDefault();
      } else if (k === 'p') {
        e.preventDefault();
        if (UI.cur === 'pause') togglePause();
        else if (
          UI.cur === 'options' ||
          UI.cur === 'controls' ||
          UI.cur === 'help' ||
          UI.cur === 'scores' ||
          UI.cur === 'class'
        )
          UI.act({dataset: {act: UI.cur === 'scores' || UI.cur === 'class' ? 'title' : UI.back || 'title'}});
      }
      return;
    }
    e.preventDefault();
    if (e.repeat) return;
    if (k === 'l') inputHold(e.code, 'l', true);
    else if (k === 'r') inputHold(e.code, 'r', true);
    else if (k === 'n' || k === 'u') {
      inputHold(e.code, 'n', true);
      nudge();
    } else if (k === 'p') togglePause();
    else gfxKey(k);
  });
  addEventListener('keyup', e => {
    const k = KEYS[e.code];
    if (!k) return;
    if (k === 'l') inputHold(e.code, 'l', false);
    else if (k === 'r') inputHold(e.code, 'r', false);
    else if (k === 'n' || k === 'u') inputHold(e.code, 'n', false);
  });
  $('menu').addEventListener('click', e => {
    const b = e.target.closest('button[data-act]');
    if (b && !b.disabled) UI.act(b);
  });
  $('menu').addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'optFlipper') {
      t.value = setFlipperBoost(t.value);
      prefs.set('flipperBoost', flipperBoost);
      $('flipperValue').textContent = powerText();
      t.setAttribute('aria-valuetext', powerText());
    } else if (t.id === 'optMusic') {
      A.vol.m = t.value / 100;
      A.setVol();
    } else if (t.id === 'optSfx') {
      A.vol.s = t.value / 100;
      A.setVol();
      A.s('target');
    } else if (t.id === 'optShake') {
      G.opt.shake = t.checked;
      prefs.set('opt', G.opt);
    } else if (t.id === 'optEndless') {
      G.opt.endless = t.checked;
      prefs.set('opt', G.opt);
    } else if (t.id === 'optAuto') {
      G.opt.autoPick = t.checked;
      prefs.set('opt', G.opt);
    }
  });
  $('pauseBtn').addEventListener('click', () => {
    A.init();
    togglePause();
  });
  $('camBtn').addEventListener('click', e => {
    A.init();
    gfxKey('cam');
    e.currentTarget.blur();
  });
  // a flip zone keeps the finger that pressed it until that finger lifts, even if the thumb drifts off the zone
  const DOUBLE_TAP = 230, // ms: a second tap on the same side this soon is a nudge
    lastTap = {};
  const zone = (el, side) => {
    const ids = new Set();
    const up = e => {
      if (!ids.delete(e.pointerId)) return;
      if (!ids.size) inputHold('touch', side < 0 ? 'l' : 'r', false);
    };
    el.addEventListener('pointerdown', e => {
      A.init();
      ids.add(e.pointerId);
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
      inputHold('touch', side < 0 ? 'l' : 'r', true);
      e.preventDefault();
      // touch has no nudge key: tap the same side twice quickly to bang the cabinet. Mash and the tilt fills
      const now = performance.now();
      if (now - (lastTap[side] || -1e9) < DOUBLE_TAP) {
        nudge();
        lastTap[side] = -1e9;
      } else lastTap[side] = now;
    });
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
  };
  zone($('tL'), -1);
  zone($('tR'), 1);
  const tn = $('tN'),
    nup = () => {
      inputHold('touch', 'n', false);
    };
  tn.addEventListener('pointerdown', e => {
    A.init();
    try {
      tn.setPointerCapture(e.pointerId);
    } catch (_) {}
    inputHold('touch', 'n', true);
    nudge();
    e.preventDefault();
  });
  tn.addEventListener('pointerup', nup);
  tn.addEventListener('pointercancel', nup);
  tn.addEventListener('lostpointercapture', nup);
  const showTouch = () => {
    if (UI.touch) return;
    $('touch').hidden = false;
    UI.touch = true;
    gfxInfo();
  };
  if (window.matchMedia && matchMedia('(pointer: coarse)').matches) showTouch();
  addEventListener(
    'pointerdown',
    e => {
      if (e.pointerType === 'touch') showTouch();
      A.init();
    },
    {passive: true}
  );
  addEventListener('contextmenu', e => e.preventDefault());
  // iOS ignores user-scalable=no: stop pinch and double-tap zoom by hand, and long-press selection
  for (const t of ['gesturestart', 'gesturechange', 'gestureend'])
    document.addEventListener(t, e => e.preventDefault(), {passive: false});
  {
    let lastT = 0;
    document.addEventListener(
      'touchend',
      e => {
        const now = Date.now();
        if (
          now - lastT < 350 &&
          !(e.target && e.target.closest && e.target.closest('input,select,textarea,button,label'))
        )
          e.preventDefault();
        lastT = now;
      },
      {passive: false}
    );
  }
  document.addEventListener(
    'touchmove',
    e => {
      if (e.touches.length > 1) e.preventDefault();
    },
    {passive: false}
  );
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('selectstart', e => {
    if (!(e.target && e.target.closest && e.target.closest('input'))) e.preventDefault();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.mode === 'play' && !G.paused && !G.choice) togglePause();
  });
  addEventListener('blur', () => {
    clearInputs();
  });
  addEventListener('resize', resize);
  // a phone turning over: the size is not settled when the event fires, so ask again shortly after
  addEventListener('orientationchange', () => {
    setTimeout(resize, 60);
    setTimeout(resize, 400);
  });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
}
