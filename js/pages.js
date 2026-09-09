/* ==========================================================================
   Ember & Crumb — per-page rendering
   Each block no-ops unless its page is the one that loaded.
   ========================================================================== */

/* --------------------------------------------------------------- artwork */
function artwork(item, kind) {
  const { c1, c2 } = item;
  if (kind === 'drink') {
    return `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 34%,${lighten(c1,.52)},${lighten(c2,.20)})">
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58px;height:96px">
        <div class="cup iced" style="width:58px;height:96px">
          <div class="cup-body">
            <div class="cup-liquid" style="height:90%">
              <div class="layer" style="bottom:0;height:46%;background:${c2}"></div>
              <div class="layer" style="bottom:44%;height:12%;background:${mix(c2, c1, .5)}"></div>
              <div class="layer" style="bottom:55%;height:46%;background:${c1}"></div>
            </div>
            <div class="foam" style="bottom:88%;height:16%;background:linear-gradient(${lighten(c1,.58)},${lighten(c1,.36)})"></div>
          </div>
        </div>
        <div style="position:absolute;left:-16%;right:-16%;bottom:-9px;height:11px;border-radius:50%;
             background:radial-gradient(ellipse,rgba(76,45,31,.26),transparent 70%)"></div>
      </div></div>`;
  }
  if (kind === 'cookie') {
    const m = maskURL(COOKIE_OPTS.shape[2].path);
    return `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 36%,${lighten(c1,.50)},${lighten(c2,.22)})">
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:92px;height:92px;
           -webkit-mask-image:url('${m}');mask-image:url('${m}');-webkit-mask-size:100% 100%;mask-size:100% 100%;
           background:linear-gradient(150deg,${lighten(c2,.2)},${c2});box-shadow:0 8px 18px -8px rgba(76,45,31,.4)">
        <div style="position:absolute;inset:9%;-webkit-mask-image:url('${m}');mask-image:url('${m}');
             -webkit-mask-size:100% 100%;mask-size:100% 100%;background:${c1}"></div>
      </div></div>`;
  }
  if (kind === 'bottle') {
    return `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 34%,${lighten(c1,.50)},${lighten(c2,.24)})">
      <div style="position:absolute;left:50%;top:53%;transform:translate(-50%,-50%);width:62px;height:122px">
        <div style="position:absolute;left:38%;right:38%;top:0;height:15px;background:${darken(c2,.34)};border-radius:3px 3px 0 0"></div>
        <div style="position:absolute;left:34%;right:34%;top:13px;height:16px;background:linear-gradient(90deg,${darken(c1,.12)},${lighten(c1,.2)},${darken(c1,.12)})"></div>
        <div style="position:absolute;inset:27px 0 0;border-radius:9px 9px 7px 7px;overflow:hidden;
             background:linear-gradient(100deg,${darken(c2,.06)},${c1} 40%,${c2});
             box-shadow:0 10px 22px -8px rgba(76,45,31,.45), inset -10px 0 18px -12px rgba(0,0,0,.5), inset 9px 0 16px -12px rgba(255,255,255,.5)">
          <span style="position:absolute;left:12%;right:12%;top:34%;height:34%;border-radius:3px;background:rgba(255,251,244,.86)"></span>
          <span style="position:absolute;left:20%;right:20%;top:42%;height:2px;background:${darken(c2,.2)};opacity:.5"></span>
          <span style="position:absolute;left:26%;right:26%;top:52%;height:2px;background:${darken(c2,.2)};opacity:.32"></span>
        </div>
      </div></div>`;
  }
  if (kind === 'tub') {
    return `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 36%,${lighten(c1,.50)},${lighten(c2,.24)})">
      <div style="position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);width:104px;height:88px">
        <div style="position:absolute;left:-4%;right:-4%;top:0;height:17px;border-radius:8px 8px 4px 4px;
             background:linear-gradient(${lighten(c2,.28)},${c2});box-shadow:0 3px 6px rgba(76,45,31,.2)"></div>
        <div style="position:absolute;inset:15px 6% 0;border-radius:4px 4px 12px 12px;
             background:linear-gradient(100deg,${darken(c1,.05)},${lighten(c1,.16)} 45%,${darken(c1,.1)});
             box-shadow:0 10px 20px -8px rgba(76,45,31,.4), inset -10px 0 16px -12px rgba(0,0,0,.35)">
          <span style="position:absolute;left:16%;right:16%;top:30%;height:26%;border-radius:99px;background:rgba(255,251,244,.8)"></span>
        </div>
      </div></div>`;
  }
  if (kind === 'bake') {
    return `<div style="position:absolute;inset:0;background:linear-gradient(165deg,${lighten(c1,.38)},${lighten(c2,.2)})">
      <div style="position:absolute;left:50%;bottom:24%;transform:translateX(-50%);width:96px">
        <div style="height:20px;background:${c1};border-radius:3px 3px 0 0"></div>
        <div style="height:11px;background:${lighten(c1,.42)}"></div>
        <div style="height:20px;background:${c2}"></div>
        <div style="height:11px;background:${lighten(c1,.42)}"></div>
        <div style="height:20px;background:${c1};border-radius:0 0 5px 5px"></div>
      </div></div>`;
  }
  return `<div style="position:absolute;inset:0;background:linear-gradient(160deg,${lighten(c1,.44)},${lighten(c2,.26)})">
    <div style="position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:88px;height:112px;
         background:linear-gradient(150deg,${c1},${c2});border-radius:5px 5px 8px 8px;
         box-shadow:0 10px 24px -8px rgba(76,45,31,.42), inset -14px 0 24px -14px rgba(0,0,0,.4), inset 12px 0 20px -14px rgba(255,255,255,.35)">
      <div style="position:absolute;top:-7px;left:8%;right:8%;height:11px;background:${darken(c2,.3)};border-radius:4px"></div>
      <div style="position:absolute;top:38%;left:14%;right:14%;height:2px;background:rgba(255,255,255,.4)"></div>
    </div></div>`;
}

function productCard(item, kind, opts = {}) {
  const tag = L(item, 'tag');
  /* A real photograph where we have one; the drawn artwork is the fallback,
     so nothing ever renders as an empty box. */
  const shot = Photos.tile(item, 420);
  return `<article class="card reveal">
    <div class="card-media">${shot || artwork(item, kind)}
      ${tag ? `<span class="tag ${item.tagClass || ''} badge-float">${esc(tag)}</span>` : ''}</div>
    <div class="card-body">
      ${opts.sub ? `<span class="eyebrow no-rule" style="font-size:.64rem;color:var(--ink-40)">${esc(opts.sub)}</span>` : ''}
      <h3 class="card-title">${esc(L(item))}</h3>
      <p class="card-desc">${esc(L(item, 'desc') || L(item, 'notes'))}</p>
      ${opts.note ? `<p class="card-note">${esc(opts.note)}</p>` : ''}
      ${ratingLineHTML(item)}
      <div class="card-foot">
        <span class="price">${money(item.price)}${item.unit ? `<span class="price-unit">/ ${esc(L(item,'unit'))}</span>` : ''}</span>
        <button class="add-btn" data-add="${esc(item.id)}" data-kind="${kind}" aria-label="${esc(t('c.add'))}">${I.plus}</button>
      </div>
    </div></article>`;
}

const lookup = id => [...BEANS, ...SUPPLIES, ...DRINKS, ...BAKES].find(x => x.id === id);

function wireAdd(root) {
  if (root.dataset.addWired) return;
  root.dataset.addWired = '1';
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    if (b.dataset.whole) return;
    const item = lookup(b.dataset.add); if (!item) return;
    Store.addToCart({
      id: item.id, key: item.id, name: L(item), price: item.price,
      c1: item.c1, c2: item.c2,
      kind: item.cat === 'cake' ? 'cake' : item.cat === 'cookie' ? 'cookie' : 'item',
      meta: L(item, 'unit') || L(item, 'origin') || '',
    });
    b.classList.add('added'); b.innerHTML = I.check;
    setTimeout(() => { b.classList.remove('added'); b.innerHTML = I.plus; }, 1300);
    toast(t('cart.added', { name: L(item) }), I.check);
  });
}

/* ==========================================================================
   HOME
   ========================================================================== */
function monthlyHTML() {
  const cur = MONTHLY_RECIPES.find(r => r.current) || MONTHLY_RECIPES[0];
  const past = MONTHLY_RECIPES.filter(r => r !== cur);
  const lines = (I18N.isRTL() ? cur.ar_recipeLines : cur.recipeLines) || cur.recipeLines;
  return `
  <div class="monthly reveal">
    <div class="monthly-art" aria-hidden="true">
      <span class="monthly-month">${esc(L(cur, 'month'))}</span>
      <div class="monthly-viz" id="monthlyViz"></div>
    </div>
    <div class="monthly-body">
      <h3 class="h2" style="margin:0 0 .5rem;font-size:clamp(1.6rem,3vw,2.3rem)">${esc(L(cur))}</h3>
      <p class="small" style="color:var(--ink-40);margin-bottom:1rem">${t('mo.by')} ${esc(L(cur, 'by'))}</p>
      <p class="quote" style="font-size:clamp(1.05rem,1.7vw,1.3rem);margin-bottom:1.1rem">“${esc(L(cur, 'quote'))}”</p>
      <p style="font-size:.92rem;line-height:1.7;color:var(--ink-70)">${esc(L(cur, 'story'))}</p>
      <div class="monthly-recipe">
        <span class="label">${t('mo.inThis')}</span>
        <ul>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
      </div>
      <div class="row row-wrap" style="margin-top:1.5rem;gap:.7rem">
        <button class="btn btn-primary" data-monthly-order>${t('mo.order')} · ${money(cur.price)}</button>
        <button class="btn btn-ghost" data-monthly-studio>${t('mo.openStudio')} <span class="arrow">→</span></button>
      </div>
    </div>
  </div>
  <div class="past-row">
    <span class="label" style="margin-bottom:.9rem">${t('mo.past')}</span>
    <div class="grid g2">
      ${past.map(p => `<article class="past-card">
        <span class="past-swatch" style="background:linear-gradient(150deg,${p.c1},${p.c2})"></span>
        <div><b>${esc(L(p))}</b>
          <small>${esc(L(p, 'month'))} · ${esc(L(p, 'by'))}</small></div>
        <span class="price">${money(p.price)}</span>
      </article>`).join('')}
    </div>
  </div>`;
}

/* The mood board. Deliberately imperfect: pieces overlap, sit at slight
   angles and vary in size, the way a pinned board does. */
const COLLAGE = [
  { k: 'counter', cls: 'c1', cap: 'h.cg1' },
  { k: 'pour',    cls: 'c2', cap: 'h.cg2' },
  { k: 'pastry',  cls: 'c3', cap: 'h.cg3' },
  { k: 'crema',   cls: 'c4', cap: 'h.cg4' },
  { k: 'window',  cls: 'c5', cap: 'h.cg5' },
  { k: 'grinder', cls: 'c6', cap: 'h.cg6' },
];

function collageHTML() {
  return `<div class="collage">
    ${COLLAGE.map(p => `
      <figure class="cg ${p.cls}">
        <img src="${Photos.mood(p.k, 420)}" alt="" loading="lazy" decoding="async"
             onload="this.classList.add('in')">
        <figcaption>${t(p.cap)}</figcaption>
      </figure>`).join('')}
    <blockquote class="cg-quote">${t('h.cgQuote')}</blockquote>
  </div>`;
}

function initHome() {
  const root = $('#monthlyRoot'); if (!root) return;

  const draw = () => {
    $('#homeDrinks').innerHTML = ['d-strawmatcha','d-rosecard','d-nitro','d-datelatte']
      .map(id => DRINKS.find(x => x.id === id)).map(x => productCard(x, 'drink')).join('');
    $('#homeBeans').innerHTML = ['b-ember','b-yemen','b-yirg','b-qahwa']
      .map(id => BEANS.find(x => x.id === id))
      .map(b => productCard(b, 'bag', { sub: L(b, 'origin'), note: `${L(b,'roast')} · ${L(b,'notes')}` })).join('');
    root.innerHTML = monthlyHTML();
    const cg = $('#collageRoot'); if (cg) cg.innerHTML = collageHTML();
    revealPhotos();
    const hero = $('#heroShot');
    if (hero && !hero.dataset.loaded) {
      hero.style.backgroundImage = `url("${Photos.mood('hero', 900)}")`;
      hero.dataset.loaded = '1';
    }

    /* Draw the month's creation using the real Studio renderer. */
    const cur = MONTHLY_RECIPES.find(r => r.current) || MONTHLY_RECIPES[0];
    const viz = $('#monthlyViz');
    if (viz && typeof renderDrink === 'function') {
      if (cur.mode === 'drink') { Object.assign(drink, { syrups:{}, extras:[], finishes:[] }, cur.state); viz.innerHTML = renderDrink(); }
      else if (cur.mode === 'cake') { Object.assign(cake, cur.state); viz.innerHTML = renderCake(); }
      else { Object.assign(cookie, cur.state); viz.innerHTML = renderCookie(); }
    }
    initReveal(); revealPhotos();
  };
  draw();

  root.addEventListener('click', e => {
    const cur = MONTHLY_RECIPES.find(r => r.current) || MONTHLY_RECIPES[0];
    if (e.target.closest('[data-monthly-order]')) {
      Store.addToCart({ id:'monthly-' + cur.mode, key:Store.uid(), custom:true, kind:cur.mode,
        name:L(cur), price:cur.price, c1:cur.c1, c2:cur.c2,
        meta:(I18N.isRTL() ? cur.ar_recipeLines : cur.recipeLines).join(' · ') });
      toast(t('cart.added', { name: L(cur) }), I.check);
      openCart();
    }
    if (e.target.closest('[data-monthly-studio]')) {
      try { sessionStorage.setItem('ec_studio_load', JSON.stringify({ mode:cur.mode, state:cur.state, name:L(cur) })); } catch {}
      location.href = 'studio.html';
    }
  });

  wireAdd(document.body);
  I18N.onChange(draw);
}

/* ==========================================================================
   MENU
   ========================================================================== */
const MENU_GROUPS = [
  { f:'signature', src:'drink' }, { f:'nitro', src:'drink' }, { f:'espresso', src:'drink' },
  { f:'matcha', src:'drink' },    { f:'other', src:'drink' },
  { f:'pastry', src:'bake' },     { f:'cookie', src:'bake' }, { f:'cake', src:'bake' },
];

function menuRow(item, kind) {
  const tag = L(item, 'tag');
  const whole = item.whole
    ? `<button class="btn btn-ghost btn-sm" data-add="${esc(item.id)}" data-kind="${kind}" data-whole="1">${t('c.whole', { p: money(item.whole) })}</button>` : '';
  const shot = Photos.tile(item, 110, 'menu-photo');
  const cut = !!Photos.cutout(item.id);
  return `<div class="menu-item">
    <div class="menu-swatch${cut ? ' bare' : ''}"${cut ? '' : ` style="background:linear-gradient(150deg,${lighten(item.c1,.18)},${item.c2})"`}>${shot || ''}</div>
    <div class="menu-main">
      <b>${esc(L(item))}</b>${tag ? `<span class="tag ${item.tagClass || ''}">${esc(tag)}</span>` : ''}
      <p>${esc(L(item, 'desc'))}</p>
    </div>
    <div class="menu-right">
      ${whole}
      <span class="price">${money(item.price)}</span>
      <button class="add-btn" data-add="${esc(item.id)}" data-kind="${kind}" aria-label="${esc(t('c.add'))}">${I.plus}</button>
    </div></div>`;
}

function initMenu() {
  const root = $('#menuSections'); if (!root) return;
  let filter = 'all';

  const draw = () => {
    root.innerHTML = MENU_GROUPS.map(g => {
      const items = (g.src === 'drink' ? DRINKS : BAKES).filter(x => x.cat === g.f);
      return `<section class="menu-block" data-block="${g.f}" style="margin-bottom:3rem">
        <div class="section-head" style="margin-bottom:1.25rem;align-items:baseline">
          <div><h2 class="h3">${t('mn.' + g.f)}</h2><p class="small muted" style="margin-top:.3rem">${t('mn.n.' + g.f)}</p></div>
          <span class="small muted">${t('c.showing', { n: I18N.digits(items.length) })}</span>
        </div>
        <div class="menu-list">${items.map(x => menuRow(x, g.src)).join('')}</div>
      </section>`;
    }).join('');
    applyFilter();
    revealPhotos(root);
  };

  const applyFilter = () => {
    let vis = 0;
    $$('.menu-block').forEach(b => {
      const on = filter === 'all' || b.dataset.block === filter;
      b.style.display = on ? '' : 'none';
      if (on) vis += $$('.menu-item', b).length;
    });
    $('#menuCount').textContent = t('c.showing', { n: I18N.digits(vis) });
    $$('#menuFilters .chip').forEach(c => c.classList.toggle('active', c.dataset.f === filter));
  };

  const drawFilters = () => {
    $('#menuFilters').innerHTML = ['all', ...MENU_GROUPS.map(g => g.f)]
      .map(f => `<button class="chip${f === filter ? ' active' : ''}" data-f="${f}">${t('mn.' + f)}</button>`).join('');
  };

  drawFilters(); draw();

  $('#menuFilters').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    filter = c.dataset.f; applyFilter();
    if (filter !== 'all') $('.sticky-bar').scrollIntoView({ behavior:'smooth', block:'start' });
  });

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-whole]'); if (!b) return;
    const item = lookup(b.dataset.add);
    Store.addToCart({ id:item.id + '-whole', key:item.id + '-whole', name:`${L(item)} — ${t('c.whole', { p:'' }).trim()}`,
      price:item.whole, c1:item.c1, c2:item.c2, kind:'cake', meta:t('mn.n.cake') });
    toast(t('mn.wholeAdded', { name: L(item) }), I.check);
  });
  wireAdd(root);
  I18N.onChange(() => { drawFilters(); draw(); });
}

/* ==========================================================================
   SHOP — bean finder, origin map, product grids
   ========================================================================== */
function initShop() {
  const finder = $('#beanFinder'); if (!finder) return;
  let method = null, filter = 'all', selected = null;

  const drawFinder = () => {
    finder.innerHTML = `
      <div class="filter-bar methods" id="methodBar">
        ${BREW_METHODS.map(m => `<button class="chip${method === m.id ? ' active' : ''}" data-m="${m.id}">${esc(L(m, 'name'))}</button>`).join('')}
        ${method ? `<button class="chip ghost" data-m="">${t('bf.showAll')}</button>` : ''}
      </div>`;
  };

  /* The globe is built once and then told about changes — rebuilding it would
     restart the entrance animation every time a filter is touched. */
  let globe = null;
  const globePoints = () => BEANS.map(b => ({
    id: b.id, lon: b.lon, lat: b.lat, color: b.c1, label: L(b), sub: L(b, 'origin'),
  }));
  const ensureGlobe = () => {
    const wrap = $('#globeWrap'); if (!wrap || globe) return;
    globe = Globe.create(wrap, {
      points: globePoints(),
      ariaLabel: t('bf.mapTitle'),
      onSelect: id => { selected = id; if (id) revealBean(id); },
    });
    $('#globeReset').onclick = () => { selected = null; globe.reset(); };
  };
  const revealBean = id => {
    const list = method ? BEANS.filter(b => b.methods.includes(method)) : BEANS;
    const card = $$('#beanGrid .card')[list.findIndex(b => b.id === id)];
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 1400);
  };

  const drawBeans = () => {
    const list = method ? BEANS.filter(b => b.methods.includes(method)) : BEANS;
    const m = method ? find(BREW_METHODS, method) : null;
    $('#methodCard').innerHTML = m ? `
      <div class="method-card">
        <div><span class="label">${t('bf.grind')}</span><b>${esc(L(m, 'grind'))}</b></div>
        <div><span class="label">${t('bf.howWeBrew')}</span><b>${esc(L(m, 'recipe'))}</b></div>
        <div class="method-count">${list.length === 1 ? t('bf.match1') : t('bf.matches', { n: I18N.digits(list.length) })}</div>
      </div>` : '';
    $('#beanGrid').innerHTML = list.map(b => productCard(b, 'bag', {
      sub: L(b, 'origin'),
      note: m ? `${t('bf.grind')}: ${L(m, 'grind')} · ${L(b, 'notes')}` : `${L(b, 'roast')} · ${L(b, 'notes')}`,
    })).join('');
    initReveal(); revealPhotos();
  };

  const drawSupplies = () => {
    const syrups = SUPPLIES.filter(s => s.cat === 'syrup' || s.cat === 'cream');
    const rest = SUPPLIES.filter(s => !['syrup','cream'].includes(s.cat));
    $('#syrupGrid').innerHTML = syrups.map(s => productCard(s, s.cat === 'syrup' ? 'bottle' : 'tub', { sub: L(s, 'notes') })).join('');
    $('#supplyGrid').innerHTML = rest.map(s => productCard(s, 'bag', { sub: L(s, 'notes') })).join('');
    applyShopFilter();
    initReveal(); revealPhotos();
  };

  const SHOP_CATS = ['all','bean','syrup','cream','flour','chocolate','matcha','pantry','tools'];
  const drawShopFilters = () => {
    $('#shopFilters').innerHTML = SHOP_CATS
      .map(f => `<button class="chip${f === filter ? ' active' : ''}" data-f="${f}">${t('sh.' + f)}</button>`).join('');
  };

  function applyShopFilter() {
    const beansOn = filter === 'all' || filter === 'bean';
    const syrupOn = filter === 'all' || filter === 'syrup' || filter === 'cream';
    const restOn  = !['bean','syrup','cream'].includes(filter);
    $('#beansSection').hidden = !beansOn;
    $('#syrupSection').hidden = !syrupOn;
    $('#suppliesSection').hidden = !restOn;
    let n = beansOn ? $$('#beanGrid .card').length : 0;
    $$('#syrupGrid .card').forEach((card, i) => {
      const s = SUPPLIES.filter(x => x.cat === 'syrup' || x.cat === 'cream')[i];
      const ok = syrupOn && (filter === 'all' || s.cat === filter);
      card.style.display = ok ? '' : 'none'; if (ok) n++;
    });
    $$('#supplyGrid .card').forEach((card, i) => {
      const s = SUPPLIES.filter(x => !['syrup','cream'].includes(x.cat))[i];
      const ok = restOn && (filter === 'all' || s.cat === filter);
      card.style.display = ok ? '' : 'none'; if (ok) n++;
    });
    $('#shopCount').textContent = t('c.products', { n: I18N.digits(n) });
    $$('#shopFilters .chip').forEach(c => c.classList.toggle('active', c.dataset.f === filter));
  }

  const drawAll = () => {
    drawFinder(); drawBeans(); drawShopFilters(); drawSupplies();
    ensureGlobe();
    globe?.setPoints(globePoints());
  };
  drawAll();

  finder.addEventListener('click', e => {
    const c = e.target.closest('[data-m]'); if (!c) return;
    method = c.dataset.m || null;
    if (method) filter = 'bean';
    selected = null;
    drawFinder(); drawBeans(); drawShopFilters(); applyShopFilter();
    globe?.setActive(method ? BEANS.filter(b => b.methods.includes(method)).map(b => b.id) : null);
  });

  $('#shopFilters').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    filter = c.dataset.f; applyShopFilter();
  });

  wireAdd(document.body);
  I18N.onChange(drawAll);
  Reviews.on('change', () => { drawBeans(); drawSupplies(); });
  Store.on('auth', () => { drawBeans(); drawSupplies(); });
}

/* ==========================================================================
   ACCOUNT
   ========================================================================== */
const when = ts => new Date(ts).toLocaleString(I18N.isRTL() ? 'ar-KW' : 'en-GB',
  { weekday:'short', day:'numeric', month:'short', hour:'numeric', minute:'2-digit' });

function loggedOutView() {
  return `<div class="wrap-narrow center" style="padding:2rem 0 4rem">
    <h1 class="h1" style="max-width:20ch;margin-inline:auto">${t('ac.title')}</h1>
    <p class="lede" style="margin:1.25rem auto 2rem;max-width:52ch">${t('ac.lede')}</p>
    <div class="row" style="justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" data-auth="signup">${t('ac.createBtn')}</button>
      <button class="btn btn-ghost btn-lg" data-auth="login">${t('ac.haveOne')}</button>
    </div>
    <div class="grid g3" style="margin-top:4rem;text-align:start">
      <div class="step"><h3>${t('ac.f1t')}</h3><p>${t('ac.f1b')}</p></div>
      <div class="step"><h3>${t('ac.f2t')}</h3><p>${t('ac.f2b')}</p></div>
      <div class="step"><h3>${t('ac.f3t')}</h3><p>${t('ac.f3b')}</p></div>
    </div>
    <p class="small muted" style="margin-top:3rem;max-width:56ch;margin-inline:auto;line-height:1.6">${t('ac.demo')}</p>
  </div>`;
}

function loggedInView(u) {
  const orders = Store.orders(), saved = Store.saved();
  return `<div class="acct-grid">
    <aside class="acct-side">
      <div class="acct-avatar">${esc(Store.initials(u))}</div>
      <div class="h4" style="font-family:var(--serif);font-size:1.2rem">${esc(u.name)}</div>
      <p class="small muted" style="margin-top:.2rem;word-break:break-all">${esc(u.email)}</p>
      <div class="row between" style="margin-top:1.25rem;padding:.85rem 1rem;background:var(--paper-2);border-radius:var(--r-sm);border:1px solid var(--line)">
        <span class="small muted">${t('ac.crumbs')}</span>
        <b class="mono-num" style="font-family:var(--serif);font-size:1.2rem">${I18N.digits(u.points || 0)}</b>
      </div>
      <nav class="acct-nav">
        <button data-pane="orders">${t('ac.orders')} <span class="muted">(${I18N.digits(orders.length)})</span></button>
        <button data-pane="recipes">${t('ac.recipes')} <span class="muted">(${I18N.digits(saved.length)})</span></button>
        <button data-pane="details">${t('ac.details')}</button>
      </nav>
      <button class="btn btn-ghost btn-sm btn-block" id="logoutBtn" style="margin-top:1.25rem">${t('ac.logout')}</button>
    </aside>
    <div id="acctPane"></div>
  </div>`;
}

function paneOrders() {
  const orders = Store.orders();
  if (!orders.length) return `<div class="empty" style="background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg)">
    <p style="margin-bottom:1.25rem">${t('ac.noOrders')}</p>
    <a href="menu.html" class="btn btn-primary btn-sm">${t('ac.browse')}</a></div>`;
  return orders.map(o => `<article class="order-card">
    <div class="order-head">
      <div><b style="font-family:var(--serif);font-size:1.15rem">${esc(o.id)}</b>
        <p class="small muted" style="margin-top:.2rem">${when(o.at)} · ${esc(o.fulfilment)}</p></div>
      <div style="text-align:end"><span class="tag tag-sage">${t(o.status)}</span>
        <div class="price" style="margin-top:.4rem">${money(o.total)}</div></div>
    </div>
    <div class="order-items">
      ${o.lines.map(l => `<div><span>${I18N.digits(l.qty)}× ${esc(l.name)}${l.meta ? `<br><small class="muted">${esc(l.meta)}</small>` : ''}</span>
        <span class="mono-num">${money(l.price * l.qty)}</span></div>`).join('')}
    </div>
    <div class="row" style="margin-top:1.1rem;padding-top:1rem;border-top:1px solid var(--line)">
      <button class="btn btn-ghost btn-sm" data-reorder="${esc(o.id)}">${t('ac.again')}</button>
    </div></article>`).join('');
}

function paneRecipes() {
  const saved = Store.saved();
  if (!saved.length) return `<div class="empty" style="background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg)">
    <p style="margin-bottom:1.25rem">${t('ac.noRecipes')}</p>
    <a href="studio.html" class="btn btn-primary btn-sm">${t('ac.openStudio')}</a></div>`;
  return `<div class="grid g2">${saved.map(r => `<article class="card">
    <div class="card-media" style="aspect-ratio:16/8;background:linear-gradient(150deg,${r.c1},${r.c2})"></div>
    <div class="card-body">
      <span class="tag ${r.kind === 'cake' ? 'tag-plum' : r.kind === 'cookie' ? 'tag-gold' : 'tag-ember'}">${t('ac.' + (r.kind || 'drink'))}</span>
      <h3 class="card-title">${esc(r.name)}</h3>
      <p class="card-desc" style="font-size:.8rem">${esc(r.meta)}</p>
      <div class="card-foot">
        <span class="price">${money(r.price)}</span>
        <div class="row" style="gap:.4rem">
          <button class="btn btn-quiet" data-delrecipe="${esc(r.id)}" aria-label="${esc(t('c.remove'))}">${I.trash}</button>
          <button class="btn btn-primary btn-sm" data-addrecipe="${esc(r.id)}">${t('c.add')}</button>
        </div>
      </div></div></article>`).join('')}</div>`;
}

function paneDetails(u) {
  return `<div class="order-card">
    <h2 class="h3" style="margin-bottom:1.4rem">${t('ac.details')}</h2>
    <form class="stack" id="detailsForm">
      <div class="field"><label for="p-name">${t('auth.name')}</label>
        <input class="input" id="p-name" value="${esc(u.name)}"></div>
      <div class="field"><label for="p-email">${t('auth.email')}</label>
        <input class="input" id="p-email" value="${esc(u.email)}" disabled>
        <p class="small muted" style="margin-top:.4rem">${t('ac.emailFixed')}</p></div>
      <div class="field"><label for="p-usual">${t('ac.usual')}</label>
        <input class="input" id="p-usual" value="${esc(u.usual || '')}" placeholder="${esc(t('ac.usualPh'))}"></div>
      <button class="btn btn-primary" type="submit">${t('ac.saveChanges')}</button>
    </form>
    <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--line)">
      <h3 class="h4">${t('ac.yourData')}</h3>
      <p class="small muted" style="margin:.5rem 0 1rem;line-height:1.6">${t('ac.dataBody')}</p>
      <button class="btn btn-ghost btn-sm" id="wipeBtn">${t('ac.erase')}</button>
    </div></div>`;
}

function initAccount() {
  const root = $('#acctRoot'); if (!root) return;
  let pane = location.hash === '#recipes' ? 'recipes' : location.hash === '#details' ? 'details' : 'orders';

  const draw = () => {
    const u = Store.current();
    $('#acctHead').innerHTML = `<div class="wrap"><span class="eyebrow">${u ? t('nav.account') : 'Ember & Crumb'}</span>
      ${u ? `<h1 class="h1" style="margin-top:1rem">${t('ac.morning', { name: esc(u.name.split(' ')[0]) })}</h1>` : ''}</div>`;
    root.innerHTML = u ? loggedInView(u) : loggedOutView();
    if (u) drawPane();
  };

  const drawPane = () => {
    const u = Store.current(); if (!u) return;
    $('#acctPane').innerHTML = pane === 'orders' ? paneOrders() : pane === 'recipes' ? paneRecipes() : paneDetails(u);
    $$('.acct-nav button').forEach(b => b.classList.toggle('active', b.dataset.pane === pane));
    history.replaceState(null, '', '#' + pane);

    if (pane === 'details') {
      $('#detailsForm').onsubmit = e => {
        e.preventDefault();
        Store.updateProfile({ name: $('#p-name').value.trim() || u.name, usual: $('#p-usual').value.trim() });
        toast(t('ac.saved'), I.check); draw();
      };
      $('#wipeBtn').onclick = () => {
        if (!confirm(t('ac.eraseConfirm'))) return;
        Object.keys(localStorage).filter(k => k.startsWith('ec_')).forEach(k => localStorage.removeItem(k));
        location.href = 'index.html';
      };
    }
  };

  root.addEventListener('click', e => {
    const nav = e.target.closest('[data-pane]');
    if (nav) { pane = nav.dataset.pane; return drawPane(); }
    const auth = e.target.closest('[data-auth]');
    if (auth) return openAuth(auth.dataset.auth);
    if (e.target.closest('#logoutBtn')) { Store.logout(); toast(t('auth.loggedOut')); return; }

    const re = e.target.closest('[data-reorder]');
    if (re) {
      const o = Store.orders().find(x => x.id === re.dataset.reorder);
      o.lines.forEach(l => Store.addToCart({ ...l, key: l.custom ? Store.uid() : l.key }));
      toast(t('ac.backAdded', { n: I18N.digits(o.lines.length) }), I.check);
      openCart(); return;
    }
    const add = e.target.closest('[data-addrecipe]');
    if (add) {
      const r = Store.saved().find(x => x.id === add.dataset.addrecipe);
      Store.addToCart({ id:'studio-' + r.kind, key:Store.uid(), name:r.name, meta:r.meta,
        price:r.price, c1:r.c1, c2:r.c2, custom:true, kind:r.kind, recipe:r.recipe });
      toast(t('cart.added', { name: r.name }), I.check); openCart(); return;
    }
    const del = e.target.closest('[data-delrecipe]');
    if (del) { Store.deleteRecipe(del.dataset.delrecipe); drawPane(); toast(t('ac.recipeDeleted')); }
  });

  Store.on('auth', draw);
  Store.on('saved', () => { if (pane === 'recipes') drawPane(); });
  Store.on('order', draw);
  I18N.onChange(draw);
  draw();
}

/* ------------------------------------------------------- small niceties */
function initMisc() {
  document.body.addEventListener('click', e => {
    const el = e.target.closest('[data-toast]');
    if (el) toast(t(el.dataset.toast));
    const rv = e.target.closest('[data-reviews]');
    if (rv) { e.preventDefault(); openReviews(rv.dataset.reviews); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHome(); initMenu(); initShop(); initAccount(); initMisc();
});
