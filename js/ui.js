/* ==========================================================================
   Ember & Crumb — shared chrome
   Header, footer, cart drawer, auth modal, toasts, language switch and the
   cinematic welcome. All injected by JS so the pages cannot drift apart.
   ========================================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const money = n => I18N.money(n);
const num = n => I18N.digits(n);

/* Blend two hex colours. t=0 → a, t=1 → b. */
function mix(a, b, k) {
  const p = h => { h = h.replace('#',''); if (h.length===3) h = [...h].map(c=>c+c).join('');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; };
  const [r1,g1,b1] = p(a), [r2,g2,b2] = p(b);
  const c = (x,y) => Math.round(x + (y - x) * k).toString(16).padStart(2,'0');
  return `#${c(r1,r2)}${c(g1,g2)}${c(b1,b2)}`;
}
const lighten = (c, k) => mix(c, '#ffffff', k);
const darken  = (c, k) => mix(c, '#2A1710', k);

/* ---------------------------------------------------------------- icons */
const I = {
  bag:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  user:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  menu:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  x:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  plus:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  arrow:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  spark:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z"/></svg>',
  cup:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h12v7a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2v3M12 2v3"/></svg>',
  cake:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6"/><path d="M4 16c2 0 2 1.4 4 1.4S10 16 12 16s2 1.4 4 1.4S18 16 20 16"/><path d="M12 12V8M9 12V9M15 12V9"/></svg>',
  cookie:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="10.5" r="1.1" fill="currentColor"/><circle cx="11" cy="15" r="1.1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>',
  heart:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  trash:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  globe:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9.2"/><path d="M3 12h18M12 2.8c2.6 2.6 2.6 15.8 0 18.4M12 2.8c-2.6 2.6-2.6 15.8 0 18.4"/></svg>',
  leaf:'<svg width="30" height="30" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18.5" fill="#4C2D1F"/><path d="M20 9c5.5 2.4 8.5 6.4 8.5 11 0 4.9-3.8 8.9-8.5 8.9s-8.5-4-8.5-8.9C11.5 15.4 14.5 11.4 20 9z" fill="#B8794B"/><path d="M20 11.5v16.4" stroke="#4C2D1F" stroke-width="1.5" stroke-linecap="round"/><path d="M20 17.5l3.6-3.2M20 22l-3.6-3.2" stroke="#4C2D1F" stroke-width="1.4" stroke-linecap="round"/></svg>',
};

/* ---------------------------------------------------------------- toast */
function toast(msg, icon = I.spark) {
  let wrap = $('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.append(wrap); }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i>${icon}</i><span>${esc(msg)}</span>`;
  wrap.append(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 320); }, 2900);
}

/* ==========================================================================
   Cinematic welcome — the first thing you see, once per session
   ========================================================================== */
function buildIntro() {
  if (document.body.dataset.page !== 'home') return;
  let seen = false;
  try { seen = sessionStorage.getItem('ec_seen_intro') === '1'; } catch {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (seen) return;

  const el = document.createElement('div');
  el.className = 'intro' + (reduced ? ' no-anim' : '');
  el.id = 'intro';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Welcome');
  el.innerHTML = `
    <div class="intro-glow" aria-hidden="true"></div>
    <button class="intro-skip btn-quiet" id="introSkip" data-i18n="intro.skip">${t('intro.skip')}</button>
    <div class="intro-inner">
      <div class="intro-mark" aria-hidden="true">${I.leaf}</div>
      <p class="eyebrow no-rule intro-el i1" data-i18n="intro.eyebrow">${t('intro.eyebrow')}</p>
      <h1 class="intro-title intro-el i2">Ember &amp; Crumb</h1>
      <p class="intro-welcome intro-el i3" data-i18n="intro.welcome">${t('intro.welcome')}</p>
      <div class="intro-lines">
        <span class="intro-el i4" data-i18n="intro.line1">${t('intro.line1')}</span>
        <span class="intro-el i5" data-i18n="intro.line2">${t('intro.line2')}</span>
        <span class="intro-el i6" data-i18n="intro.line3">${t('intro.line3')}</span>
      </div>
      <div class="intro-scene intro-el i7" aria-hidden="true">
        <div class="cup iced" style="width:56px;height:96px">
          <div class="straw" style="height:88px;top:-30px"></div>
          <div class="cup-body"><div class="cup-liquid" style="height:88%">
            <div class="layer" style="bottom:0;height:56%;background:#EEBFC2"></div>
            <div class="layer" style="bottom:54%;height:48%;background:#8FAE5E"></div>
          </div></div>
          <div class="foam" style="bottom:86%;height:16%;background:#F7DCE0"></div>
        </div>
        <div class="cake" style="width:92px">
          <div class="cake-stack" style="height:74px">
            <div class="cake-layer sponge" style="height:18px;background:#E4C39C"></div>
            <div class="cake-layer" style="height:10px;background:#F7EDD8"></div>
            <div class="cake-layer sponge" style="height:18px;background:#DDB88E"></div>
            <div class="cake-layer" style="height:10px;background:#CF5F6D"></div>
            <div class="cake-layer sponge" style="height:18px;background:#E4C39C"></div>
            <div class="cake-top" style="background:#6A4126;height:8px;top:0"></div>
          </div>
          <div class="cake-plate"></div>
        </div>
        <div class="intro-cookie">${introCookie()}</div>
      </div>
      <button class="btn btn-primary btn-lg intro-el i8" id="introEnter">
        <span data-i18n="intro.enter">${t('intro.enter')}</span> <span class="arrow">→</span>
      </button>
    </div>`;
  document.body.append(el);
  document.body.classList.add('no-scroll');

  const done = () => {
    el.classList.add('leaving');
    el.dispatchEvent(new CustomEvent('ec:dismissed'));
    document.body.classList.remove('no-scroll');
    try { sessionStorage.setItem('ec_seen_intro', '1'); } catch {}
    setTimeout(() => el.remove(), 900);
    removeEventListener('keydown', onKey);
  };
  const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } };
  $('#introEnter').onclick = done;
  $('#introSkip').onclick = done;
  addEventListener('keydown', onKey);
  setTimeout(() => { if (document.body.contains(el)) done(); }, reduced ? 2500 : 11000);
}

/* A small iced heart cookie for the welcome scene. */
function introCookie() {
  const m = maskURL(COOKIE_OPTS.shape.find(x => x.id === 'heart').path);
  const mask = `-webkit-mask-image:url('${m}');mask-image:url('${m}');`
             + `-webkit-mask-size:100% 100%;mask-size:100% 100%;`
             + `-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;
  return `<div class="ck-shape" style="${mask};background:linear-gradient(160deg,#E8CD9C,#C79A5C)">
      <div class="ck-crumb"></div>
      <div class="ck-icing" style="inset:6%;${mask};background:#FFFBF2"></div>
      <div class="ck-icing" style="inset:13%;${mask};background:linear-gradient(160deg,#F6D2D6,#EEBFC2)"></div>
    </div>`;
}

/* Wrap an SVG path in a data URI usable as a CSS mask. */
function maskURL(path) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" fill="#000"/></svg>`)}`;
}

/* --------------------------------------------------------------- header */
const NAV = [
  ['index.html', 'nav.home'], ['menu.html', 'nav.menu'], ['studio.html', 'nav.studio'],
  ['shop.html', 'nav.shop'], ['visit.html', 'nav.visit'],
];

function headerHTML() {
  const here = (location.pathname.split('/').pop() || 'index.html');
  const links = NAV.map(([h, k]) =>
    `<a href="${h}" class="${h === here ? 'active' : ''}">${t(k)}</a>`).join('');
  return `<div class="wrap nav">
    <a class="brand" href="index.html">
      <span class="mark">${I.leaf}</span>
      <span>Ember &amp; Crumb<small>${t('brand.tag')}</small></span>
    </a>
    <nav class="nav-links" id="navLinks">${links}
      <a href="account.html" class="mobile-only">${t('nav.account')}</a>
    </nav>
    <div class="nav-actions">
      <a href="studio.html" class="btn btn-ember btn-sm hide-sm">${I.spark} ${t('nav.make')}</a>
      <button class="lang-btn" id="langBtn" aria-label="${esc(t('lang.label'))}" title="${esc(t('lang.label'))}">
        ${I.globe}<span>${t('lang.switch')}</span></button>
      <button class="icon-btn" id="acctBtn" aria-label="${esc(t('nav.account'))}">${I.user}</button>
      <button class="icon-btn" id="cartBtn" aria-label="${esc(t('nav.openBag'))}">${I.bag}
        <span class="cart-count" id="cartCount">0</span></button>
      <button class="icon-btn nav-toggle" id="navToggle" aria-label="${esc(t('nav.menuLabel'))}" aria-expanded="false">${I.menu}</button>
    </div>
  </div>`;
}

function wireHeader() {
  $('#navToggle').onclick = e => {
    const open = $('#navLinks').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', open);
    e.currentTarget.innerHTML = open ? I.x : I.menu;
  };
  $('#cartBtn').onclick = openCart;
  $('#langBtn').onclick = () => I18N.toggle();
  $('#acctBtn').onclick = () => {
    if (Store.current()) location.href = 'account.html'; else openAuth('login');
  };
  paintAcctBtn();
}

function buildHeader() {
  const el = document.createElement('header');
  el.className = 'site-header';
  el.id = 'siteHeader';
  el.innerHTML = headerHTML();
  document.body.prepend(el);
  addEventListener('scroll', () => el.classList.toggle('stuck', scrollY > 8), { passive: true });
  wireHeader();
}

function paintAcctBtn() {
  const u = Store.current(), btn = $('#acctBtn');
  if (!btn) return;
  btn.innerHTML = u ? `<span class="avatar">${esc(Store.initials(u))}</span>` : I.user;
  btn.title = u ? u.name : t('nav.account');
}

/* --------------------------------------------------------------- footer */
function footerHTML() {
  return `<div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html"><span class="mark">${I.leaf}</span>
          <span>Ember &amp; Crumb<small>${t('brand.tag')}</small></span></a>
        <p style="margin-top:1.1rem;font-size:.9rem;line-height:1.7;color:rgba(243,231,210,.66);max-width:36ch">${t('f.blurb')}</p>
      </div>
      <div><h4>${t('f.order')}</h4><ul>
        <li><a href="menu.html">${t('c.fullMenu')}</a></li>
        <li><a href="studio.html">${t('f.drinkStudio')}</a></li>
        <li><a href="studio.html#cake">${t('f.cakeStudio')}</a></li>
        <li><a href="studio.html#cookie">${t('f.cookieStudio')}</a></li>
        <li><a href="shop.html">${t('f.beansSupplies')}</a></li>
        <li><a href="account.html">${t('f.history')}</a></li></ul></div>
      <div><h4>${t('f.bakehouse')}</h4><ul>
        <li><a href="visit.html">${t('f.visitUs')}</a></li>
        <li><a href="visit.html#hours">${t('f.hours')}</a></li>
        <li><a href="visit.html#classes">${t('f.classes')}</a></li>
        <li><a href="visit.html#wholesale">${t('f.wholesale')}</a></li>
        <li><a href="visit.html#faq">${t('f.custom')}</a></li></ul></div>
      <div><h4>${t('f.listTitle')}</h4>
        <p style="font-size:.87rem;color:rgba(243,231,210,.66);line-height:1.65">${t('f.listBlurb')}</p>
        <form class="newsletter" id="newsForm">
          <input type="email" placeholder="you@example.com" required aria-label="${esc(t('auth.email'))}">
          <button type="submit">${t('f.join')}</button>
        </form></div>
    </div>
    <div class="footer-note">
      <span>${t('f.addr', { y: num(new Date().getFullYear()) })}</span>
      <span>${t('f.demo')}</span>
    </div>
  </div>`;
}

function buildFooter() {
  const f = document.createElement('footer');
  f.className = 'site-footer';
  f.id = 'siteFooter';
  f.innerHTML = footerHTML();
  document.body.append(f);
  wireFooter();
}
function wireFooter() {
  $('#newsForm').onsubmit = e => { e.preventDefault(); e.target.reset(); toast(t('f.joined')); };
}

/* ==========================================================================
   Cart drawer
   ========================================================================== */
function buildCart() {
  const scrim = document.createElement('div');
  scrim.className = 'scrim'; scrim.id = 'scrim';
  const d = document.createElement('aside');
  d.className = 'drawer'; d.id = 'cartDrawer';
  d.innerHTML = `
    <div class="drawer-head">
      <div><div class="eyebrow no-rule" id="cartEyebrow">${t('cart.title')}</div>
        <div class="h4" style="font-family:var(--serif);font-size:1.3rem" id="cartHeading"></div></div>
      <button class="icon-btn" id="cartClose" aria-label="${esc(t('c.close'))}">${I.x}</button>
    </div>
    <div class="drawer-body" id="cartBody"></div>
    <div class="drawer-foot" id="cartFoot" hidden></div>`;
  document.body.append(scrim, d);
  scrim.onclick = closeAll;
  $('#cartClose').onclick = closeCart;
  addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  renderCart();
}

function openCart() { $('#scrim').classList.add('open'); $('#cartDrawer').classList.add('open'); document.body.classList.add('no-scroll'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); if (!$('.modal.open')) { $('#scrim').classList.remove('open'); document.body.classList.remove('no-scroll'); } }
function closeAll() { $('#cartDrawer')?.classList.remove('open'); $$('.modal').forEach(m => m.classList.remove('open')); $('#scrim')?.classList.remove('open'); document.body.classList.remove('no-scroll'); }

function renderCart() {
  const body = $('#cartBody'), foot = $('#cartFoot'), head = $('#cartHeading');
  if (!body) return;
  $('#cartEyebrow').textContent = t('cart.title');
  const lines = Store.cart(), n = Store.cartCount();
  const badge = $('#cartCount');
  if (badge) { badge.textContent = num(n); badge.classList.toggle('show', n > 0); }
  head.textContent = n ? (n === 1 ? t('c.item', { n: num(n) }) : t('c.items', { n: num(n) })) : t('cart.empty');

  if (!lines.length) {
    foot.hidden = true;
    body.innerHTML = `<div class="empty">${I.bag}
      <p style="margin-bottom:1.25rem">${t('cart.emptyLine')}</p>
      <a href="studio.html" class="btn btn-primary btn-sm">${t('cart.emptyCta')} ${I.arrow}</a></div>`;
    return;
  }

  body.innerHTML = lines.map(l => `
    <div class="cart-line">
      <div class="cart-thumb" style="background:linear-gradient(150deg,${l.c1},${l.c2})"></div>
      <div class="cart-info">
        <b>${esc(l.name)}</b>
        ${l.meta ? `<small>${esc(l.meta)}</small>` : ''}
        <div class="qty">
          <button data-dec="${esc(l.key)}" aria-label="${esc(t('cart.less'))}">−</button>
          <span>${num(l.qty)}</span>
          <button data-inc="${esc(l.key)}" aria-label="${esc(t('cart.more'))}">+</button>
          <button data-del="${esc(l.key)}" aria-label="${esc(t('c.remove'))}" style="margin-inline-start:.15rem">${I.trash}</button>
        </div>
      </div>
      <div class="cart-price">${money(l.price * l.qty)}</div>
    </div>`).join('');

  const tt = Store.totals();
  foot.hidden = false;
  foot.innerHTML = `
    <div class="totals">
      <div class="t-row"><span class="muted">${t('cart.subtotal')}</span><span>${money(tt.sub)}</span></div>
      <div class="t-row"><span class="muted">${t('cart.tax')}</span><span>${money(tt.tax)}</span></div>
      <div class="t-row grand"><span>${t('cart.total')}</span><span>${money(tt.total)}</span></div>
    </div>
    <label class="label" for="fulfil">${t('cart.collection')}</label>
    <select class="select" id="fulfil" style="margin-bottom:.75rem">
      <option>${t('cart.pickupShop')}</option>
      <option>${t('cart.pickupRoast')}</option>
      <option>${t('cart.delivery')}</option>
    </select>
    <button class="btn btn-primary btn-block btn-lg" id="checkout">${t('cart.place', { p: money(tt.total) })}</button>
    <p class="small muted center" style="margin-top:.75rem">${t('cart.note')}</p>`;

  body.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const ls = Store.cart();
    if (b.dataset.inc) Store.setQty(b.dataset.inc, (ls.find(l => l.key === b.dataset.inc)?.qty || 0) + 1);
    if (b.dataset.dec) Store.setQty(b.dataset.dec, (ls.find(l => l.key === b.dataset.dec)?.qty || 0) - 1);
    if (b.dataset.del) Store.removeFromCart(b.dataset.del);
  };
  $('#checkout').onclick = () => {
    if (!Store.current()) { closeCart(); openAuth('login', t('cart.loginFirst')); return; }
    try {
      const o = Store.placeOrder({ fulfilment: $('#fulfil').value });
      closeCart();
      toast(t('cart.placed', { id: o.id }), I.check);
      setTimeout(() => location.href = 'account.html#orders', 900);
    } catch (err) { toast(err.message); }
  };
}

/* ==========================================================================
   Auth modal
   ========================================================================== */
let authMode = 'login';

function authInnerHTML() {
  return `<button class="icon-btn modal-close" id="authClose" aria-label="${esc(t('c.close'))}">${I.x}</button>
  <div class="modal-inner">
    <div class="eyebrow no-rule">Ember &amp; Crumb</div>
    <h2 class="h2" style="font-size:1.75rem;margin:.5rem 0 .4rem" id="authTitle">${t('auth.welcome')}</h2>
    <p class="small muted" id="authSub" style="margin-bottom:1.4rem">${t('auth.sub')}</p>
    <div class="auth-switch">
      <button data-mode="login" class="active">${t('auth.login')}</button>
      <button data-mode="signup">${t('auth.signup')}</button>
    </div>
    <form id="authForm" class="stack" novalidate>
      <div class="field" id="nameField" hidden>
        <label for="au-name">${t('auth.name')}</label>
        <input class="input" id="au-name" autocomplete="name">
      </div>
      <div class="field">
        <label for="au-email">${t('auth.email')}</label>
        <input class="input" id="au-email" type="email" autocomplete="email" placeholder="you@example.com">
      </div>
      <div class="field">
        <label for="au-pw">${t('auth.password')}</label>
        <input class="input" id="au-pw" type="password" autocomplete="current-password" placeholder="${esc(t('auth.pwHint'))}">
        <div class="pw-meter" id="pwMeter" hidden><i></i></div>
      </div>
      <div class="err" id="authErr"></div>
      <button class="btn btn-primary btn-block btn-lg" type="submit" id="authSubmit">${t('auth.login')}</button>
    </form>
    <p class="small muted center" style="margin-top:1.1rem;line-height:1.55">${t('auth.demoNote')}</p>
  </div>`;
}

function setAuthMode(next) {
  authMode = next;
  $$('#authModal .auth-switch button').forEach(b => b.classList.toggle('active', b.dataset.mode === authMode));
  $('#nameField').hidden = authMode === 'login';
  $('#pwMeter').hidden = authMode === 'login';
  $('#authTitle').textContent = authMode === 'login' ? t('auth.welcome') : t('auth.create');
  $('#authSubmit').textContent = authMode === 'login' ? t('auth.login') : t('auth.createBtn');
  $('#au-pw').autocomplete = authMode === 'login' ? 'current-password' : 'new-password';
  $('#authErr').classList.remove('show');
}

function wireAuth() {
  const m = $('#authModal');
  $$('.auth-switch button', m).forEach(b => b.onclick = () => setAuthMode(b.dataset.mode));
  $('#authClose').onclick = closeAll;
  $('#au-pw').oninput = e => {
    const v = e.target.value;
    const score = Math.min(4, (v.length >= 8) + (v.length >= 12) + /[A-Z]/.test(v) + /[^a-zA-Z]/.test(v));
    const bar = $('#pwMeter i');
    bar.style.width = (score / 4 * 100) + '%';
    bar.style.background = ['#B8794B','#B8794B','#C9A25E','#8A8C63','#8A8C63'][score];
  };
  $('#authForm').onsubmit = async e => {
    e.preventDefault();
    const err = $('#authErr'), btn = $('#authSubmit');
    err.classList.remove('show');
    btn.disabled = true; btn.textContent = t('auth.working');
    try {
      const payload = { name: $('#au-name').value, email: $('#au-email').value, password: $('#au-pw').value };
      const u = authMode === 'login' ? await Store.login(payload) : await Store.signup(payload);
      closeAll(); $('#authForm').reset();
      toast(t(authMode === 'login' ? 'auth.hiBack' : 'auth.hiNew', { name: u.name.split(' ')[0] }), I.check);
    } catch (ex) {
      err.textContent = ex.message; err.classList.add('show');
    } finally {
      btn.disabled = false; setAuthMode(authMode);
    }
  };
  setAuthMode(authMode);
}

function buildAuth() {
  const m = document.createElement('div');
  m.className = 'modal'; m.id = 'authModal';
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = authInnerHTML();
  document.body.append(m);
  wireAuth();
}

function openAuth(mode = 'login', sub) {
  setAuthMode(mode);
  if (sub) $('#authSub').textContent = sub;
  $('#scrim').classList.add('open'); $('#authModal').classList.add('open');
  document.body.classList.add('no-scroll');
  setTimeout(() => $(mode === 'signup' ? '#au-name' : '#au-email').focus(), 340);
}


/* ==========================================================================
   Cursor glow — a warm light that follows the pointer, on fine pointers only
   ========================================================================== */
const HOT = 'a,button,input,select,textarea,summary,[role="button"],.opt,.preset,.chip,.font-card,.ink,.card,.menu-item,.pin,.globe-canvas';

function initCursorGlow() {
  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glow = document.createElement('div'); glow.className = 'cursor-glow';
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  document.body.append(glow, dot);

  let tx = innerWidth / 2, ty = innerHeight / 2;   // pointer
  let gx = tx, gy = ty;                            // glow, trailing
  let on = false, raf = 0;

  const tick = () => {
    gx += (tx - gx) * 0.16;                        // the halo lags a little
    gy += (ty - gy) * 0.16;
    glow.style.transform = `translate3d(${gx}px,${gy}px,0) translate(-50%,-50%)`;
    dot.style.transform  = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
    raf = (Math.abs(tx - gx) > .4 || Math.abs(ty - gy) > .4) ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (!on) { on = true; document.body.classList.add('glow-on'); gx = tx; gy = ty; }
    const hot = !!e.target.closest?.(HOT);
    glow.classList.toggle('hot', hot);
    dot.classList.toggle('hot', hot);
    kick();
  }, { passive: true });

  addEventListener('pointerdown', () => glow.classList.add('press'));
  addEventListener('pointerup',   () => glow.classList.remove('press'));
  document.addEventListener('mouseleave', () => { on = false; document.body.classList.remove('glow-on'); });
  document.addEventListener('mouseenter', () => { on = true;  document.body.classList.add('glow-on'); });
}

/* ==========================================================================
   Screen transitions — every page arrives, and leaves, deliberately
   ========================================================================== */
const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Elements worth staging on arrival, in the order they should appear. */
const ENTER_SEL = '.eyebrow, h1, .lede, .hero-cta, .hero-stats, .hero-art, .studio-tabs, .filter-bar';

function runScreenIn() {
  const veil = $('#pgVeil');
  if (veil) { veil.classList.add('out'); setTimeout(() => veil.remove(), 800); }
  $('#siteHeader')?.classList.add('enter');
  if (REDUCED()) return;

  const first = document.querySelector('main > section');
  if (!first) return;
  const seen = new Set();
  [...first.querySelectorAll(ENTER_SEL)]
    .filter(el => { if (seen.has(el) || el.closest('.card')) return false; seen.add(el); return true; })
    .slice(0, 8)
    .forEach((el, i) => {
      el.classList.add('screen-el');
      el.style.animationDelay = (120 + i * 85) + 'ms';
    });
}

function buildVeil() {
  if (REDUCED()) return;
  const v = document.createElement('div');
  v.className = 'pg-veil'; v.id = 'pgVeil'; v.setAttribute('aria-hidden', 'true');
  document.body.append(v);
}

/* Fade out before a same-site navigation so pages hand over instead of blinking. */
function initScreenOut() {
  if (REDUCED()) return;
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a'); if (!a) return;
    const href = a.getAttribute('href') || '';
    if (a.target || a.hasAttribute('download') || !/\.html(\?|#|$)/.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;   // same page anchor
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 260);
  });
  /* Coming back via the back button must not leave the page faded out. */
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));
}

/* ------------------------------------------------------- reveal on scroll */
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .06 });
  $$('.reveal:not(.in)').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
}

/* ------------------------------------------------------------------ boot */
function initShell() {
  I18N.apply();
  buildVeil();
  buildHeader(); buildCart(); buildAuth(); buildReviewModal(); buildFooter(); buildIntro();
  renderCart(); initReveal(); initCursorGlow(); initScreenOut();
  /* On the home page the welcome plays first; the page arrives behind it. */
  if ($('#intro')) $('#intro').addEventListener('ec:dismissed', runScreenIn, { once: true });
  else runScreenIn();
  Store.on('cart', renderCart);
  Store.on('auth', () => { paintAcctBtn(); renderCart(); });

  I18N.onChange(() => {
    $('#siteHeader').innerHTML = headerHTML(); wireHeader();
    $('#siteFooter').innerHTML = footerHTML(); wireFooter();
    $('#authModal').innerHTML = authInnerHTML(); wireAuth();
    renderCart();
    const intro = $('#intro'); if (intro) I18N.paintStatic(intro);
  });
}
document.addEventListener('DOMContentLoaded', initShell);
