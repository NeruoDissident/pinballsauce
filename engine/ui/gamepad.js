/* Standard browser gamepads. No game dependencies: the lobby and a running table own separate sessions. */
export const GAMEPAD_HELP =
  'LB / LT: left flippers · RB / RT: right flippers · Hold A, release to launch; tap A to nudge · Y: view · Menu: pause';

export function bindGamepad({context, frame, lost = () => {}}) {
  // The silent splash preview must never consume controller input.
  if (window.__pbPreviewId || window.frameElement?.classList.contains('pk-preview')) return () => {};
  let index = null,
    previous = {},
    lastContext,
    armed = false,
    repeatAt = 0,
    direction = '',
    stopped = false,
    raf;
  const release = () => {
    previous = {};
    armed = false;
    direction = '';
    frame({held: {}, pressed: {}, move: ''});
  };
  const suspend = () => {
    release();
    if (index !== null) lost();
  };
  const visibility = () => {
    if (document.hidden) suspend();
  };
  const disconnected = e => {
    if (e.gamepad.index === index) {
      index = null;
      release();
      lost();
    }
  };
  function gamepadFrame(now) {
    if (stopped) return;
    raf = requestAnimationFrame(gamepadFrame);
    if (document.hidden || !document.hasFocus()) return;
    let pads;
    try {
      pads = navigator.getGamepads?.() || [];
    } catch (_) {
      pads = [];
    }
    let pad = index === null ? null : pads[index];
    if (index !== null && (!pad?.connected || pad.mapping !== 'standard')) {
      index = null;
      release();
      lost();
      return;
    }
    if (!pad) {
      pad = [...pads].find(p => p?.connected && p.mapping === 'standard');
      if (!pad) return;
      index = pad.index;
    }
    const down = i => !!pad.buttons[i]?.pressed || (pad.buttons[i]?.value || 0) > 0.5;
    const x = pad.axes[0] || 0,
      y = pad.axes[1] || 0;
    const held = {
      l: down(4) || down(6),
      r: down(5) || down(7),
      a: down(0),
      b: down(1),
      view: down(3),
      pause: down(9),
      up: down(12) || y < -0.55,
      down: down(13) || y > 0.55,
      left: down(14) || x < -0.55,
      right: down(15) || x > 0.55
    };
    const nextContext = context();
    if (nextContext !== lastContext) {
      lastContext = nextContext;
      release();
    }
    // Require a neutral frame after boot, focus changes and menu transitions. A held confirmation
    // must not also launch a ball or confirm the next menu. Triggers must also be released first.
    if (!armed) {
      if (!Object.values(held).some(Boolean)) armed = true;
      return;
    }
    const pressed = Object.fromEntries(Object.entries(held).map(([k, v]) => [k, v && !previous[k]]));
    const dir = held.up ? 'up' : held.down ? 'down' : held.left ? 'left' : held.right ? 'right' : '';
    let move = '';
    if (dir !== direction) {
      direction = dir;
      repeatAt = now + 350;
      move = dir;
    } else if (dir && now >= repeatAt) {
      repeatAt = now + 130;
      move = dir;
    }
    previous = held;
    frame({held, pressed, move});
  }
  addEventListener('blur', suspend);
  addEventListener('gamepaddisconnected', disconnected);
  document.addEventListener('visibilitychange', visibility);
  raf = requestAnimationFrame(gamepadFrame);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    release();
    removeEventListener('blur', suspend);
    removeEventListener('gamepaddisconnected', disconnected);
    document.removeEventListener('visibilitychange', visibility);
  };
}

// Controller focus is explicit (not :focus-visible, which varies by browser input heuristic).
export function padFocus(el) {
  document.querySelectorAll('.pad-focus').forEach(e => e.classList.remove('pad-focus'));
  if (!el) return;
  el.classList.add('pad-focus');
  el.focus({preventScroll: true});
  el.scrollIntoView({block: 'nearest', inline: 'nearest'});
}

export function padMenu(root, move, confirm) {
  const items = [...root.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(
    e => e.getClientRects().length && !e.closest('[hidden]')
  );
  if (!items.length) return;
  let el = document.activeElement;
  if (!items.includes(el)) {
    el = items[0];
    padFocus(el);
  }
  if (move) {
    const delta = move === 'left' || move === 'up' ? -1 : 1;
    if (el.type === 'range' && (move === 'left' || move === 'right')) {
      // Volume sliders use useful 5% steps; power honors its explicit 10% step.
      const step = Number(el.getAttribute('step')) || 5;
      el.value = Math.max(Number(el.min), Math.min(Number(el.max), Number(el.value) + delta * step));
      el.dispatchEvent(new window.Event('input', {bubbles: true}));
      padFocus(el);
    } else padFocus(items[(items.indexOf(el) + delta + items.length) % items.length]);
  } else if (confirm) {
    if (el.type === 'text') root.querySelector('[data-act="saveScore"]')?.click();
    else if (el.type !== 'range') el.click();
    padFocus(root.contains(document.activeElement) ? document.activeElement : null);
  }
}
