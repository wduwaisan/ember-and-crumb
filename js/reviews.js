/* ==========================================================================
   Ember & Crumb — ratings and reviews
   Beans, matcha, syrups and creams can be rated 0–5 and commented on.
   Reviewers choose whether to be named; a named reviewer shows as first name
   plus last initial, the same shortening used everywhere else on the site.
   ========================================================================== */
const Reviews = (() => {
  const KEY = 'ec_reviews';
  /* Which shop categories accept reviews. Beans are handled separately.
     Add 'chocolate', 'flour', 'pantry' or 'tools' here to open those up. */
  const CATS = new Set(['matcha', 'syrup', 'cream']);

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

  const bus = new EventTarget();
  const on = (n, f) => bus.addEventListener(n, f);
  const emit = n => bus.dispatchEvent(new CustomEvent(n));

  /* ---------------------------------------------------------------- seed */
  const day = 864e5, now = Date.now();
  const SEED = {
    'b-ember': [
      { name:'Noura A.', stars:5, at:now-3*day, bought:true, text:'Third bag. It never fights the milk and it is forgiving when I am half asleep. The roast date on the bottom is always within the week.' },
      { name:'Faisal M.', stars:4, at:now-11*day, bought:true, text:'Really good value for the price. Slightly flat on the second week, so buy small and often.' },
      { name:'', anon:true, stars:5, at:now-19*day, text:'اشتريتها بعد ما جربت اللاتيه عندهم. نفس الطعم بالضبط في البيت.' },
    ],
    'b-yemen': [
      { name:'Abdullah S.', stars:5, at:now-2*day, bought:true, text:'This is the one. Cardamom and dried fruit without adding anything. Expensive, but I have paid more for worse.' },
      { name:'Hessa K.', stars:5, at:now-14*day, text:'طعمها يذكرني بقهوة جدي. حسّيتها أصلية من أول فنجان.' },
      { name:'Tom R.', stars:3, at:now-26*day, text:'Beautiful cup but very particular — I wasted a lot of it before I stopped treating it like an espresso bean. Ask them how to brew it first.' },
    ],
    'b-yirg': [
      { name:'Mariam H.', stars:5, at:now-6*day, bought:true, text:'Bergamot is not marketing here, it is actually there. Best in a V60 with a slightly coarser grind than they suggest.' },
      { name:'', anon:true, stars:4, at:now-21*day, text:'Lovely, but far too delicate for milk. Went back and bought the house blend for lattes.' },
    ],
    'b-qahwa': [
      { name:'Latifa J.', stars:5, at:now-4*day, bought:true, text:'أخيراً قهوة شقراء ما تحتاج أزيد عليها شي غير الهيل. الدلة عندنا ما فضت منها من شهر.' },
      { name:'Yousef A.', stars:4, at:now-17*day, text:'Good blonde roast for qahwa. I grind a touch finer than they recommend and it holds better in the dallah.' },
    ],
    'b-geisha': [
      { name:'Sara D.', stars:5, at:now-9*day, bought:true, text:'Absurd, in a good way. Split it with two friends and we brewed it together on a Friday. Worth doing once.' },
      { name:'', anon:true, stars:2, at:now-30*day, text:'I could not taste what everyone else is tasting, and at this price that stings. Get a single cup at the bar first.' },
    ],
    'b-sumatra': [
      { name:'Khaled B.', stars:5, at:now-8*day, bought:true, text:'Heavy and earthy exactly as described. Oat milk does not dent it at all.' },
    ],
    's-matcha': [
      { name:'Dana K.', stars:5, at:now-1*day, bought:true, text:'Vivid green, no bitterness, and it whisks smooth without clumping. I stopped buying the supermarket tin months ago.' },
      { name:'Reem F.', stars:5, at:now-13*day, text:'غالية شوي بس تسوى. اللون والطعم فرق كبير عن اللي كنت أشتريه.' },
      { name:'', anon:true, stars:4, at:now-24*day, text:'Excellent but the 100g tin goes quickly if you drink one a day. I wish they sold a bigger size.' },
    ],
    's-culinary': [
      { name:'Omar T.', stars:4, at:now-7*day, bought:true, text:'Holds its colour through baking, which the cheap stuff never did. Sponge came out properly green.' },
    ],
    'y-rose': [
      { name:'Shaikha M.', stars:5, at:now-5*day, bought:true, text:'شراب الورد والهيل صار أساسي عندنا. نحطه على الحليب البارد وينتهي خلال أسبوعين.' },
      { name:'Jassim A.', stars:4, at:now-16*day, text:'Floral without going anywhere near soap, which is the hard part. A little goes a long way.' },
    ],
    'y-date': [
      { name:'Ahmad Q.', stars:5, at:now-10*day, bought:true, text:'Tastes like actual dates rather than caramel pretending. Very good over vanilla ice cream too.' },
      { name:'', anon:true, stars:5, at:now-22*day, text:'ما توقعت إنه بيكون بهالحلاوة المتوازنة. الملح يفرق.' },
    ],
    'y-cinn': [
      { name:'Layla N.', stars:5, at:now-12*day, bought:true, text:'Two pumps and my flat white tastes like theirs. The bottle is bigger than it looks.' },
      { name:'Peter H.', stars:3, at:now-28*day, text:'Good syrup, but slightly too sweet for me. I dilute it a bit and it is perfect.' },
    ],
    'k-masc': [
      { name:'Fatima R.', stars:5, at:now-6*day, bought:true, text:'Saved my entire evening. Layered a tiramisù in twenty minutes and nobody could tell I had not whipped it myself.' },
      { name:'', anon:true, stars:4, at:now-20*day, text:'Lovely texture. Five days is honest — mine was still fine on day four.' },
    ],
    'k-matcha': [
      { name:'Bader Z.', stars:5, at:now-15*day, bought:true, text:'Pipes beautifully and does not go grey overnight. Used it between layers of a sponge for my sister’s birthday.' },
    ],
    'k-royal': [
      { name:'Munira S.', stars:4, at:now-18*day, bought:true, text:'Same colours as the Cookie Studio, which is the whole point. The tips clog if you leave them out, so rinse them.' },
    ],
  };

  function all() {
    let db = read();
    if (!db) {                                     // first visit: lay down the seed
      db = {};
      for (const [pid, list] of Object.entries(SEED)) {
        db[pid] = list.map((r, i) => ({
          id: 'seed-' + pid + '-' + i, uid: null, seed: true,
          name: r.name || '', anon: !!r.anon, stars: r.stars, text: r.text,
          at: r.at, bought: !!r.bought,
        }));
      }
      write(db);
    }
    return db;
  }

  /* Must be a shop product: DRINKS also use cat:'matcha', and a drink has no
     review panel to open. */
  const canReview = item => !!item &&
    (BEANS.includes(item) || (SUPPLIES.includes(item) && CATS.has(item.cat)));
  const forProduct = id => (all()[id] || []).slice().sort((a, b) => b.at - a.at);

  function summary(id) {
    const list = forProduct(id);
    if (!list.length) return { count: 0, avg: 0, dist: [0, 0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of list) { dist[r.stars]++; sum += r.stars; }
    return { count: list.length, avg: sum / list.length, dist };
  }

  /* First name plus last initial — "Wahj Al-Duwaisan" becomes "Wahj A." */
  function shortName(full) {
    const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }

  const mine = id => {
    const u = Store.current(); if (!u) return null;
    return (all()[id] || []).find(r => r.uid === u.id) || null;
  };

  function save(id, { stars, text, anon }) {
    const u = Store.current();
    if (!u) throw new Error(t('rv.needAccount'));
    stars = Math.max(0, Math.min(5, Math.round(+stars)));
    text = String(text || '').trim().slice(0, 600);
    if (!text) throw new Error(t('rv.needText'));

    const db = all();
    const list = db[id] || (db[id] = []);
    const existing = list.find(r => r.uid === u.id);
    const bought = Store.orders().some(o => o.lines.some(l => l.id === id || l.key === id));

    if (existing) Object.assign(existing, { stars, text, anon: !!anon, at: Date.now(), edited: true, name: shortName(u.name), bought });
    else list.push({ id: Store.uid(), uid: u.id, name: shortName(u.name), anon: !!anon, stars, text, at: Date.now(), bought });

    write(db); emit('change');
    return true;
  }

  function remove(id, reviewId) {
    const u = Store.current(); if (!u) return;
    const db = all();
    db[id] = (db[id] || []).filter(r => !(r.id === reviewId && r.uid === u.id));
    write(db); emit('change');
  }

  return { all, canReview, forProduct, summary, shortName, mine, save, remove, on, CATS };
})();

/* ==========================================================================
   Star rendering
   ========================================================================== */
const STAR_PATH = 'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z';
const starSVG = (cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;

/* A static rating, fractional fill and all. */
function starsHTML(value, cls = '') {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = n => Array.from({ length: 5 }, () => starSVG(n)).join('');
  return `<span class="stars ${cls}" role="img" aria-label="${I18N.digits(value.toFixed(1))} / ${I18N.digits(5)}">
    <span class="stars-bg">${row('')}</span>
    <span class="stars-fg" style="width:${pct}%">${row('')}</span>
  </span>`;
}

/* The 0–5 input. Zero is a real choice, so it gets its own control. */
function starInputHTML(value) {
  return `<div class="star-input" id="starInput" role="radiogroup" aria-label="${esc(t('rv.yourRating'))}" data-value="${value}">
    ${[1,2,3,4,5].map(n => `<button type="button" class="star-btn${value >= n ? ' on' : ''}" data-star="${n}"
        role="radio" aria-checked="${value === n}" aria-label="${esc(t('rv.nStars', { n: I18N.digits(n) }))}">${starSVG()}</button>`).join('')}
    <button type="button" class="star-zero${value === 0 ? ' on' : ''}" data-star="0"
      role="radio" aria-checked="${value === 0}">${t('rv.zero')}</button>
  </div>`;
}

/* ==========================================================================
   The reviews panel
   ========================================================================== */
let rvProduct = null, rvSort = 'new', rvDraft = { stars: 5, anon: false, text: '' };

function reviewCardHTML(r) {
  const u = Store.current();
  const own = u && r.uid === u.id;
  const who = r.anon ? t('rv.anon') : (r.name || t('rv.anon'));
  return `<article class="rv-item${own ? ' own' : ''}">
    <div class="rv-head">
      <span class="rv-avatar${r.anon ? ' anon' : ''}">${r.anon ? '?' : esc((r.name || '?')[0])}</span>
      <div class="rv-who">
        <b><bdi>${esc(who)}</bdi></b>
        <span>${rvWhen(r.at)}${r.edited ? ' · ' + t('rv.edited') : ''}</span>
      </div>
      <div class="rv-right">
        ${r.bought ? `<span class="tag tag-sage">${t('rv.bought')}</span>` : ''}
        ${starsHTML(r.stars, 'sm')}
      </div>
    </div>
    <p class="rv-text" dir="auto">${esc(r.text)}</p>
    ${own ? `<div class="rv-actions">
      <button class="btn btn-quiet" data-rv-edit="${esc(r.id)}">${t('rv.edit')}</button>
      <button class="btn btn-quiet" data-rv-del="${esc(r.id)}">${t('c.remove')}</button>
    </div>` : ''}
  </article>`;
}

const rvWhen = ts => new Date(ts).toLocaleDateString(I18N.isRTL() ? 'ar-KW' : 'en-GB',
  { day: 'numeric', month: 'short', year: 'numeric' });

function reviewPanelHTML() {
  const item = rvProduct;
  const s = Reviews.summary(item.id);
  const u = Store.current();
  const own = Reviews.mine(item.id);

  let list = Reviews.forProduct(item.id);
  if (rvSort === 'high') list = list.slice().sort((a, b) => b.stars - a.stars || b.at - a.at);
  if (rvSort === 'low')  list = list.slice().sort((a, b) => a.stars - b.stars || b.at - a.at);

  const bars = [5, 4, 3, 2, 1, 0].map(n => {
    const pct = s.count ? (s.dist[n] / s.count) * 100 : 0;
    return `<div class="rv-bar"><span>${I18N.digits(n)}</span>
      <i><b style="width:${pct}%"></b></i>
      <em>${I18N.digits(s.dist[n])}</em></div>`;
  }).join('');

  const form = u ? `
    <form class="rv-form" id="rvForm">
      <div class="field">
        <label>${t('rv.yourRating')}</label>
        ${starInputHTML(rvDraft.stars)}
      </div>
      <div class="field">
        <label for="rvText">${t('rv.yourReview')}</label>
        <textarea class="textarea" id="rvText" maxlength="600" required dir="auto"
          placeholder="${esc(t('rv.placeholder'))}">${esc(rvDraft.text)}</textarea>
        <div class="rv-count"><span id="rvChars">${I18N.digits(rvDraft.text.length)}</span> / ${I18N.digits(600)}</div>
      </div>
      <label class="rv-anon">
        <input type="checkbox" id="rvAnon" ${rvDraft.anon ? 'checked' : ''}>
        <span><b>${t('rv.postAnon')}</b>
          <em>${t('rv.anonNote', { name: `<bdi>${esc(Reviews.shortName(u.name))}</bdi>` })}</em></span>
      </label>
      <div class="err" id="rvErr"></div>
      <button class="btn btn-primary btn-block" type="submit">${own ? t('rv.update') : t('rv.post')}</button>
    </form>` : `
    <div class="rv-signin">
      <p>${t('rv.needAccount')}</p>
      <button class="btn btn-primary btn-sm" data-rv-login>${t('auth.login')}</button>
    </div>`;

  return `<button class="icon-btn modal-close" id="rvClose" aria-label="${esc(t('c.close'))}">${I.x}</button>
  <div class="modal-inner">
    <div class="rv-product">
      <span class="rv-swatch" style="background:linear-gradient(150deg,${lighten(item.c1,.16)},${item.c2})"></span>
      <div>
        <div class="eyebrow no-rule">${esc(L(item, 'origin') || L(item, 'notes'))}</div>
        <h2 class="h3" style="margin-top:.25rem">${esc(L(item))}</h2>
      </div>
    </div>

    <div class="rv-summary">
      <div class="rv-avg">
        <b>${s.count ? I18N.digits(s.avg.toFixed(1)) : '—'}</b>
        ${starsHTML(s.avg)}
        <span class="rv-n">${s.count === 1 ? t('rv.one') : t('rv.many', { n: I18N.digits(s.count) })}</span>
      </div>
      <div class="rv-bars">${bars}</div>
    </div>

    ${form}

    <div class="rv-listhead">
      <span class="label" style="margin:0">${t('rv.all')}</span>
      <select class="select rv-sort" id="rvSort" aria-label="${esc(t('rv.sort'))}">
        <option value="new"  ${rvSort==='new'?'selected':''}>${t('rv.newest')}</option>
        <option value="high" ${rvSort==='high'?'selected':''}>${t('rv.highest')}</option>
        <option value="low"  ${rvSort==='low'?'selected':''}>${t('rv.lowest')}</option>
      </select>
    </div>
    <div class="rv-list">
      ${list.length ? list.map(reviewCardHTML).join('')
        : `<p class="muted small center" style="padding:1.5rem 0">${t('rv.empty')}</p>`}
    </div>
  </div>`;
}

function buildReviewModal() {
  const m = document.createElement('div');
  m.className = 'modal modal-wide'; m.id = 'reviewModal';
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  document.body.append(m);

  m.addEventListener('click', e => {
    if (e.target.closest('#rvClose')) return closeAll();
    if (e.target.closest('[data-rv-login]')) { closeAll(); return openAuth('login', t('rv.needAccount')); }

    const st = e.target.closest('[data-star]');
    if (st) {
      rvDraft.stars = +st.dataset.star;
      const wrap = $('#starInput');
      wrap.dataset.value = rvDraft.stars;
      $$('.star-btn', wrap).forEach(b => {
        const on = rvDraft.stars >= +b.dataset.star;
        b.classList.toggle('on', on); b.setAttribute('aria-checked', +b.dataset.star === rvDraft.stars);
      });
      $('.star-zero', wrap).classList.toggle('on', rvDraft.stars === 0);
      $('.star-zero', wrap).setAttribute('aria-checked', rvDraft.stars === 0);
      return;
    }
    const ed = e.target.closest('[data-rv-edit]');
    if (ed) {
      const r = Reviews.forProduct(rvProduct.id).find(x => x.id === ed.dataset.rvEdit);
      if (r) { rvDraft = { stars: r.stars, anon: r.anon, text: r.text }; paintReviews(); $('#rvText')?.focus(); }
      return;
    }
    const del = e.target.closest('[data-rv-del]');
    if (del) {
      if (!confirm(t('rv.confirmDelete'))) return;
      Reviews.remove(rvProduct.id, del.dataset.rvDel);
      rvDraft = { stars: 5, anon: false, text: '' };
      return;
    }
  });

  /* Hovering the row previews the rating without committing it. */
  m.addEventListener('pointerover', e => {
    const st = e.target.closest('.star-btn'); if (!st) return;
    const n = +st.dataset.star;
    $$('.star-btn', m).forEach(b => b.classList.toggle('preview', +b.dataset.star <= n));
  });
  m.addEventListener('pointerout', e => {
    if (e.target.closest('.star-input')) $$('.star-btn', m).forEach(b => b.classList.remove('preview'));
  });

  m.addEventListener('input', e => {
    if (e.target.id === 'rvText') {
      rvDraft.text = e.target.value;
      $('#rvChars').textContent = I18N.digits(e.target.value.length);
    }
    if (e.target.id === 'rvAnon') rvDraft.anon = e.target.checked;
  });
  m.addEventListener('change', e => {
    if (e.target.id === 'rvSort') { rvSort = e.target.value; paintReviews(); }
  });
  m.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#rvErr');
    try {
      Reviews.save(rvProduct.id, rvDraft);
      rvDraft = { stars: 5, anon: false, text: '' };
      toast(t('rv.thanks'), I.check);
    } catch (ex) { err.textContent = ex.message; err.classList.add('show'); }
  });

  Reviews.on('change', () => { if (rvProduct) paintReviews(); });
}

function paintReviews() {
  const m = $('#reviewModal'); if (!m || !rvProduct) return;
  m.innerHTML = reviewPanelHTML();
}

function openReviews(productId) {
  const item = [...BEANS, ...SUPPLIES].find(x => x.id === productId);
  if (!item) return;
  rvProduct = item;
  const own = Reviews.mine(item.id);
  rvDraft = own ? { stars: own.stars, anon: own.anon, text: own.text } : { stars: 5, anon: false, text: '' };
  paintReviews();
  $('#scrim').classList.add('open');
  $('#reviewModal').classList.add('open');
  document.body.classList.add('no-scroll');
}

/* A compact rating line for a product card. */
function ratingLineHTML(item) {
  if (!Reviews.canReview(item)) return '';
  const s = Reviews.summary(item.id);
  return `<button class="rating-line" data-reviews="${esc(item.id)}" type="button">
    ${starsHTML(s.avg, 'sm')}
    <span class="rating-n">${s.count
      ? `${I18N.digits(s.avg.toFixed(1))} · ${s.count === 1 ? t('rv.one') : t('rv.many', { n: I18N.digits(s.count) })}`
      : t('rv.first')}</span>
  </button>`;
}
