/* ==========================================================================
   Ember & Crumb — the origin globe
   An orthographic 3-D globe on a 2-D canvas: spin it with the pointer, and
   selecting an origin flies the sphere round until that farm faces you.
   ========================================================================== */
const Globe = (() => {
  const DEG = Math.PI / 180;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeBack  = t => { const c = 1.70158 + 1; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  /* Shortest signed way round from a to b, in degrees. */
  const shortest = (a, b) => ((b - a + 540) % 360) - 180;

  function create(wrap, opts = {}) {
    const canvas = document.createElement('canvas');
    canvas.className = 'globe-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', opts.ariaLabel || 'Rotating globe of coffee origins');
    const label = document.createElement('div');
    label.className = 'globe-label';
    label.hidden = true;
    wrap.append(canvas, label);

    const ctx = canvas.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
    let rotL = -55, rotP = 14;              // yaw / pitch, degrees
    let spin = reduced ? 0 : 4.2;           // degrees per second
    let points = opts.points || [];
    let active = null;                      // Set of ids, or null for "all"
    let selected = null, hovered = null;
    let tween = null;                       // { fromL, fromP, toL, toP, t, dur }
    let entered = 0;                        // 0..1 entrance progress
    let entering = false, born = 0;
    let dragging = false, moved = 0, lastX = 0, lastY = 0, vel = 0;
    let raf = 0, last = 0, visible = false;

    /* ------------------------------------------------------------ layout */
    function resize() {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) / 2 * 0.88;
      cx = W / 2; cy = H / 2;
      draw();
    }

    /* -------------------------------------------------------- projection */
    function project(lon, lat) {
      const l = (lon - rotL) * DEG, p = lat * DEG, p0 = rotP * DEG;
      const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
      let x = Math.cos(p) * Math.sin(l);
      let y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
      if (cosc <= 0) {                       // behind the horizon: pin to the limb
        const m = Math.hypot(x, y) || 1;
        x /= m; y /= m;
      }
      return { x: cx + x * R * scale(), y: cy - y * R * scale(), vis: cosc > 0, cosc };
    }
    const scale = () => 0.72 + 0.28 * entered;

    /* ------------------------------------------------------------ drawing */
    function ringPath(ring) {
      let anyVisible = false;
      ctx.beginPath();
      for (let i = 0; i < ring.length; i++) {
        const q = project(ring[i][0], ring[i][1]);
        if (q.vis) anyVisible = true;
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
      }
      ctx.closePath();
      return anyVisible;
    }

    function strokeArc(fn, steps, w, colour) {
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= steps; i++) {
        const [lon, lat] = fn(i / steps);
        const q = project(lon, lat);
        if (!q.vis) { pen = false; continue; }
        if (pen) ctx.lineTo(q.x, q.y); else { ctx.moveTo(q.x, q.y); pen = true; }
      }
      ctx.lineWidth = w; ctx.strokeStyle = colour; ctx.stroke();
    }

    function draw() {
      const r = R * scale();
      ctx.clearRect(0, 0, W, H);
      if (r <= 0) return;

      ctx.save();
      ctx.globalAlpha = 0.15 + 0.85 * entered;

      /* ocean sphere */
      const g = ctx.createRadialGradient(cx - r * .38, cy - r * .44, r * .05, cx, cy, r * 1.18);
      g.addColorStop(0, '#FFFEFA'); g.addColorStop(.55, '#F4E8D0'); g.addColorStop(1, '#DCC7A2');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = g; ctx.fill();

      /* clip everything else to the sphere */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();

      /* the coffee belt, built from stacked latitude lines */
      for (let lat = -25; lat <= 25; lat += 1.6) {
        strokeArc(u => [-180 + u * 360, lat], 90, r * .034, 'rgba(184,121,75,.10)');
      }

      /* graticule */
      for (let lat = -60; lat <= 60; lat += 20) strokeArc(u => [-180 + u * 360, lat], 90, 1, 'rgba(76,45,31,.10)');
      for (let lon = -180; lon < 180; lon += 20) strokeArc(u => [lon, -90 + u * 180], 60, 1, 'rgba(76,45,31,.10)');

      /* land */
      ctx.lineJoin = 'round';
      for (const ring of Object.values(LANDMASS)) {
        if (!ringPath(ring)) continue;
        ctx.fillStyle = '#BFA477'; ctx.fill();
        ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(76,45,31,.42)'; ctx.stroke();
      }

      /* limb shading — this is what reads as a sphere */
      const sh = ctx.createRadialGradient(cx - r * .32, cy - r * .36, r * .12, cx, cy, r * 1.02);
      sh.addColorStop(0, 'rgba(255,255,255,.30)');
      sh.addColorStop(.52, 'rgba(255,255,255,0)');
      sh.addColorStop(.86, 'rgba(76,45,31,.13)');
      sh.addColorStop(1, 'rgba(76,45,31,.34)');
      ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.restore();

      /* rim */
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7);
      ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(76,45,31,.30)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r + 5, 0, 7);
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(184,121,75,.07)'; ctx.stroke();

      /* pins, far ones first so near ones sit on top */
      const now = performance.now();
      const shown = points.map((p, i) => ({ p, i, q: project(p.lon, p.lat) }))
        .filter(o => o.q.vis)
        .sort((a, b) => a.q.cosc - b.q.cosc);

      for (const o of shown) {
        const { p, q, i } = o;
        const pop = entering
          ? Math.max(0, Math.min(1, (now - born - i * 65) / 480))
          : 1;
        if (pop <= 0) continue;
        const on = !active || active.has(p.id);
        const isSel = selected === p.id, isHov = hovered === p.id;
        const depth = .45 + .55 * q.cosc;                 // fade toward the limb
        const base = (isSel ? 8.5 : isHov ? 7.5 : 6) * depth * easeBack(pop);
        ctx.globalAlpha = (on ? 1 : .2) * depth * pop * (0.15 + 0.85 * entered);

        if (isSel) {                                       // pulsing halo
          const t = (now % 1800) / 1800;
          ctx.beginPath(); ctx.arc(q.x, q.y, base + 4 + t * 16, 0, 7);
          ctx.fillStyle = `rgba(184,121,75,${(1 - t) * .28})`; ctx.fill();
        }
        if (on) {
          ctx.beginPath(); ctx.arc(q.x, q.y, base + 5, 0, 7);
          ctx.fillStyle = 'rgba(184,121,75,.20)'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(q.x, q.y, base, 0, 7);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.lineWidth = 2.2 * depth; ctx.strokeStyle = '#FFFDF6'; ctx.stroke();
        ctx.beginPath(); ctx.arc(q.x, q.y, base * .34, 0, 7);
        ctx.fillStyle = '#FFFDF6'; ctx.fill();
        o.screen = q; o.radius = base + 7;
      }
      ctx.restore();
      hitList = shown;
      placeLabel();
    }

    let hitList = [];

    function placeLabel() {
      const id = hovered || selected;
      const hit = hitList.find(o => o.p.id === id && o.q.vis);
      if (!hit) { label.hidden = true; return; }
      label.hidden = false;
      label.innerHTML = `<b>${hit.p.label}</b><span>${hit.p.sub}</span>`;
      label.style.left = hit.q.x + 'px';
      label.style.top  = (hit.q.y - 16) + 'px';
      label.classList.toggle('sel', selected === hit.p.id);
    }

    /* ------------------------------------------------------------- ticker */
    function frame(ts) {
      const dt = Math.min(64, ts - (last || ts)); last = ts;
      let busy = false;

      if (entering) {
        entered = Math.min(1, (ts - born) / 900);
        if (entered >= 1 && ts - born > 900 + points.length * 65 + 480) entering = false;
        busy = true;
      }
      if (tween) {
        tween.t = Math.min(1, tween.t + dt / tween.dur);
        const e = easeInOut(tween.t);
        rotL = tween.fromL + tween.dL * e;
        rotP = tween.fromP + tween.dP * e;
        if (tween.t >= 1) tween = null;
        busy = true;
      } else if (dragging) {
        busy = true;
      } else if (Math.abs(vel) > .01) {
        rotL -= vel; vel *= 0.94; busy = true;
      } else if (spin && !hovered) {
        rotL += spin * dt / 1000; busy = true;
      }
      if (selected) busy = true;                 // keep the halo pulsing

      draw();
      raf = (busy && visible) ? requestAnimationFrame(frame) : 0;
    }
    function kick() { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } }

    /* -------------------------------------------------------- interaction */
    const localXY = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function hitAt(x, y) {
      let best = null, bestD = 1e9;
      for (const o of hitList) {
        if (!o.q.vis) continue;
        const d = Math.hypot(o.q.x - x, o.q.y - y);
        if (d < (o.radius || 12) + 6 && d < bestD) { best = o; bestD = d; }
      }
      return best;
    }

    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      dragging = true; moved = 0; vel = 0; tween = null;
      [lastX, lastY] = localXY(e);
      canvas.classList.add('grabbing');
      kick();
    });
    canvas.addEventListener('pointermove', e => {
      const [x, y] = localXY(e);
      if (dragging) {
        const dx = x - lastX, dy = y - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        rotL -= dx * 0.32;
        rotP = Math.max(-78, Math.min(78, rotP + dy * 0.32));
        vel = reduced ? 0 : dx * 0.32;
        lastX = x; lastY = y;
        kick();
      } else {
        const h = hitAt(x, y);
        const id = h ? h.p.id : null;
        if (id !== hovered) { hovered = id; canvas.classList.toggle('over', !!id); kick(); }
      }
    });
    const release = e => {
      if (!dragging) return;
      dragging = false; canvas.classList.remove('grabbing');
      if (moved < 6) {
        const [x, y] = localXY(e);
        const h = hitAt(x, y);
        if (h) { select(h.p.id); opts.onSelect?.(h.p.id); }
        else if (selected) { select(null); opts.onSelect?.(null); }
      }
      kick();
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', () => { dragging = false; canvas.classList.remove('grabbing'); });
    canvas.addEventListener('pointerleave', () => { hovered = null; canvas.classList.remove('over'); kick(); });

    /* Keyboard: arrows spin, so the globe is not pointer-only. */
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', e => {
      const step = e.shiftKey ? 20 : 8;
      if (e.key === 'ArrowLeft')  { rotL -= step; tween = null; }
      else if (e.key === 'ArrowRight') { rotL += step; tween = null; }
      else if (e.key === 'ArrowUp')    { rotP = Math.min(78, rotP + step); tween = null; }
      else if (e.key === 'ArrowDown')  { rotP = Math.max(-78, rotP - step); tween = null; }
      else return;
      e.preventDefault(); kick();
    });

    /* ---------------------------------------------------------------- api */
    function flyTo(lon, lat, dur = 950) {
      const toL = lon, toP = Math.max(-60, Math.min(60, lat));
      if (reduced) { rotL = toL; rotP = toP; kick(); return; }
      tween = { fromL: rotL, fromP: rotP, dL: shortest(rotL, toL), dP: toP - rotP, t: 0, dur };
      kick();
    }
    function select(id) {
      selected = id;
      const p = points.find(x => x.id === id);
      if (p) flyTo(p.lon, p.lat);
      kick();
    }
    function setPoints(next) { points = next; kick(); }
    function setActive(ids) {
      active = ids ? new Set(ids) : null;
      /* Fly to the first surviving origin so the filter visibly does something. */
      if (ids && ids.length) { const p = points.find(x => x.id === ids[0]); if (p) flyTo(p.lon, p.lat, 1100); }
      kick();
    }
    function replay() { born = performance.now(); entering = true; entered = 0; kick(); }

    const ro = new ResizeObserver(resize); ro.observe(wrap);
    const io = new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible) { if (!born) replay(); kick(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: .08 });
    io.observe(wrap);
    resize();

    const api = {
      select, setActive, setPoints, replay, flyTo,
      /* Exposed so the page (and tests) can ask where the sphere is pointing. */
      rotation: () => ({ lon: ((rotL % 360) + 540) % 360 - 180, lat: rotP, tweening: !!tween }),
      project: (lon, lat) => project(lon, lat),
      centre: () => ({ cx, cy, r: R * scale() }),
      reset() { selected = null; flyTo(-55, 14); },
      destroy() { ro.disconnect(); io.disconnect(); if (raf) cancelAnimationFrame(raf); wrap.innerHTML = ''; },
    };
    wrap._globe = api;
    return api;
  }

  return { create };
})();
