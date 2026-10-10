/* ================= A TABLE'S OWN WORDS FOR THE SHARED RULES =================
   The classes, their spellbooks, the companions, the perks and the relics are the same on every table: that is what
   makes two tables feel like one maker built them. A table may re-skin the words (and the colours) without touching
   what anything does, through content.names:

     names:{classes:{knight:{name:'Street Titan',tag:'...',pass:'...',color:'#f6c85f'}},
            spells:{charge:{name:'Wrecking Field',text:'...'}},
            companions:{tank:{name:'BRICK',desc:'...'}}, roles:{tank:{name:'Tank'}},
            perks:{bellRinger:{name:'...',desc:'...'}}, relics:{key:{name:'...'}},
            goals:{breaker:{text:'...'}}}

   Only the fields given are replaced. Keys are the engine's ids (see docs/RULESET.md); an unknown key is an error,
   so a typo cannot silently do nothing. Numbers and functions are left alone unless a table names them on purpose. */
import {CLASSES} from './classes.js';
import {COMPANIONS, ROLES} from './party.js';
import {PERKS, RELICS} from './perks.js';
import {SLOT_GOAL, SPELLS, spellDef} from './spells.js';

export function applyNames(n) {
  if (!n) return;
  const into = (what, get, src) => {
    for (const k in src || {}) {
      const t = get(k);
      if (!t) throw new Error('content.names.' + what + ': there is no "' + k + '"');
      Object.assign(t, src[k]);
    }
  };
  into('classes', k => CLASSES[k], n.classes);
  into('spells', k => spellDef(k), n.spells);
  into('companions', k => COMPANIONS[k], n.companions);
  into('roles', k => ROLES[k], n.roles);
  into('perks', k => PERKS.find(p => p.id === k), n.perks);
  into('relics', k => RELICS.find(p => p.id === k), n.relics);
  into('goals', k => SLOT_GOAL[k], n.goals);
}
