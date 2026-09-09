/* ==========================================================================
   Ember & Crumb — the Studio
   Three live builders: a drink in a glass, a cake in cross-section, and an
   iced cookie you can letter in the font of your choice.
   ========================================================================== */

const find = (list, id) => list.find(o => o.id === id);
const TOP_POUR = ['matcha', 'hojicha', 'butterfly', 'strawberry', 'qahwa'];
const ICE = [[14,6,17,-12],[52,3,20,9],[30,24,16,22],[62,26,18,-8],[20,46,19,14],[54,50,17,-18],[36,66,15,6]];

/* Deterministic scatter so decorations do not jump on every repaint. */
const rnd = (i, salt = 1) => { const x = Math.sin((i + 1) * 12.9898 * salt) * 43758.5453; return x - Math.floor(x); };

/* ========================================================================
   DRINK
   ======================================================================== */
const drink = {
  temp:'iced', size:'16', base:'espresso', milk:'whole',
  syrups:{}, extras:{}, finishes:{}, notes:'', name:'', preset:'',
};

/* Extras and finishes used to be plain id arrays; they now carry a count, the
   way syrups always have. Saved orders and the preset table still hold arrays,
   so anything coming in is normalised rather than migrated. */
const toCounts = v => Array.isArray(v)
  ? Object.fromEntries(v.filter(Boolean).map(id => [id, 1]))
  : { ...(v || {}) };
const counts = m => Object.entries(m || {}).filter(([, n]) => n > 0);
const has = (m, id) => (m || {})[id] > 0;

/* How many of one add-on you may stack. Espresso is the interesting one: the
   house base is a double, so two more is a quad and that is the ceiling. */
function capFor(group, id) {
  if (group === 'syrup') return 4;
  if (group === 'extra' && id === 'shot') {
    const baseShots = (drink.base === 'espresso' || drink.base === 'decaf') ? 2 : 0;
    return Math.max(1, 4 - baseShots);
  }
  return 3;
}
const bagFor = g => g === 'syrup' ? drink.syrups : g === 'extra' ? drink.extras : drink.finishes;

/* Caps can move under a build that already exists -- four shots on a matcha
   base is fine, but switching that base to a double espresso would make six.
   Re-clamp before every paint rather than trusting the buttons. */
function clampCounts() {
  for (const g of ['syrup', 'extra', 'finish']) {
    const bag = bagFor(g);
    for (const id of Object.keys(bag)) {
      const n = Math.min(bag[id], capFor(g, id));
      if (n > 0) bag[id] = n; else delete bag[id];
    }
  }
}

function drinkPrice() {
  let p = 1.200;
  p += find(DRINK_OPTS.temp, drink.temp)?.price || 0;
  p += find(DRINK_OPTS.size, drink.size)?.price || 0;
  p += find(DRINK_OPTS.base, drink.base)?.price || 0;
  p += find(DRINK_OPTS.milk, drink.milk)?.price || 0;
  for (const [id, pumps] of Object.entries(drink.syrups))
    p += (find(DRINK_OPTS.syrup, id)?.price || 0) * pumps;
  for (const [id, n] of counts(drink.extras))   p += (find(DRINK_OPTS.extra, id)?.price || 0) * n;
  for (const [id, n] of counts(drink.finishes)) p += (find(DRINK_OPTS.finish, id)?.price || 0) * n;
  return p;
}

function syrupTint() {
  const entries = Object.entries(drink.syrups).filter(([, n]) => n > 0);
  if (!entries.length) return { color:null, pumps:0 };
  let total = 0, color = null;
  for (const [id, n] of entries) {
    const c = find(DRINK_OPTS.syrup, id)?.color; if (!c) continue;
    total += n;
    color = color === null ? c : mix(color, c, n / total);
  }
  return { color, pumps: Math.min(total, 6) };
}

function drinkName() {
  if (drink.name.trim()) return drink.name.trim();
  if (drink.preset) return drink.preset;
  const base = find(DRINK_OPTS.base, drink.base);
  const milk = find(DRINK_OPTS.milk, drink.milk);
  const syrup = Object.entries(drink.syrups).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0];
  const bits = [];
  if (drink.temp === 'iced') bits.push(I18N.isRTL() ? 'مثلج' : 'Iced');
  if (drink.temp === 'nitro') bits.push(I18N.isRTL() ? 'نيترو' : 'Nitro');
  if (syrup) bits.push(L(find(DRINK_OPTS.syrup, syrup[0])));
  if (milk && ['oat','pistachio','coconut','almond','camel'].includes(milk.id)) bits.push(L(milk));
  bits.push(L(base).replace('Double ', '').replace(' Powder', ''));
  if (milk && milk.id !== 'none' && !TOP_POUR.includes(drink.base)) bits.push(I18N.isRTL() ? 'لاتيه' : 'Latte');
  return bits.join(' ');
}

function drinkRecipe() {
  const bits = [
    I18N.isRTL() ? `${I18N.digits(drink.size)} أونصة` : `${drink.size} oz`,
    L(find(DRINK_OPTS.temp, drink.temp)),
    L(find(DRINK_OPTS.base, drink.base)),
  ];
  const milk = find(DRINK_OPTS.milk, drink.milk);
  if (milk.id !== 'none') bits.push(L(milk));
  Object.entries(drink.syrups).filter(([, n]) => n > 0)
    .forEach(([id, n]) => bits.push(`${I18N.digits(n)}× ${L(find(DRINK_OPTS.syrup, id))}`));
  for (const [id, n] of counts(drink.extras))
    bits.push((n > 1 ? I18N.digits(n) + '\u00d7 ' : '') + L(find(DRINK_OPTS.extra, id)));
  for (const [id, n] of counts(drink.finishes))
    bits.push((n > 1 ? I18N.digits(n) + '\u00d7 ' : '') + L(find(DRINK_OPTS.finish, id)));
  return bits.join(' · ');
}

function renderDrink() {
  const size = find(DRINK_OPTS.size, drink.size);
  const baseOpt = find(DRINK_OPTS.base, drink.base);
  const milkOpt = find(DRINK_OPTS.milk, drink.milk);
  const iced = drink.temp !== 'hot';
  const w = Math.round((iced ? 132 : 146) * size.scale);
  const h = Math.round((iced ? 226 : 196) * size.scale);

  const { color: sc, pumps } = syrupTint();
  const hasMilk = milkOpt.color !== null;
  const topPour = TOP_POUR.includes(drink.base);

  const layers = [];
  const push = (hPct, color) => layers.push({ h:hPct, color });
  const tintedBase = sc ? mix(baseOpt.color, sc, Math.min(.34, pumps * .09)) : baseOpt.color;

  if (!hasMilk) {
    push(100, has(drink.extras, 'tonic') ? lighten(tintedBase, .40) : tintedBase);
  } else {
    const milkMixed = sc ? mix(milkOpt.color, sc, Math.min(.62, pumps * .17)) : milkOpt.color;
    const deep = darken(tintedBase, .04);
    if (topPour) { push(58, milkMixed); push(14, mix(milkMixed, deep, .5)); push(28, deep); }
    else         { push(34, deep); push(13, mix(deep, milkMixed, .55)); push(53, milkMixed); }
  }
  if (drink.base === 'nitrocb' || drink.temp === 'nitro') {
    const last = layers[layers.length - 1];
    layers[layers.length - 1] = { h: last.h, color: lighten(last.color, .16) };
  }

  const fillPct = iced ? 89 : 84;
  let acc = 0;
  const layerHTML = layers.map(l => {
    const html = `<div class="layer" style="bottom:${acc}%;height:${l.h + .6}%;background:${l.color}"></div>`;
    acc += l.h; return html;
  }).join('');

  const foamExtra = counts(drink.extras).map(([id]) => find(DRINK_OPTS.extra, id)).find(e => e && e.foam);
  const foamColor = foamExtra ? foamExtra.color : (drink.temp === 'nitro' ? '#e2cdae' : null);
  const foamH = foamExtra ? 17 : 11;
  const foamHTML = foamColor
    ? `<div class="foam" style="bottom:${fillPct - 1}%;height:${foamH}%;background:linear-gradient(${lighten(foamColor,.2)},${foamColor})"></div>` : '';

  const iceHTML = drink.temp === 'iced'
    ? ICE.map(([l, tp, s, r]) => `<div class="ice" style="inset-inline-start:${l}%;top:${tp + 6}%;width:${s}px;height:${s}px;--rot:${r}deg;animation-delay:${-r/6}s"></div>`).join('')
    : '';

  const fins = counts(drink.finishes).map(([id]) => find(DRINK_OPTS.finish, id)).filter(Boolean);
  const drizzles = fins.filter(f => f.drizzle);
  const dusts = fins.filter(f => !f.drizzle);
  const topOffset = (foamColor ? 100 - fillPct - foamH : 100 - fillPct);
  const drizzleHTML = drizzles.map((d, i) => `
    <svg class="drizzle" style="top:${topOffset + 3}%;transform:translateY(${i*5}px)" viewBox="0 0 100 18" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 11 Q13 2 23 11 T43 11 T63 11 T83 11 T97 11" fill="none" stroke="${d.color}" stroke-width="2.6" stroke-linecap="round" opacity=".92"/>
    </svg>`).join('');
  const dustHTML = dusts.length ? `<div class="garnish-row" style="top:${topOffset - 2}%">
      ${dusts.flatMap(d => [0,1,2].map(k =>
        `<span class="g-dot" style="background:${d.color};width:${7 + (k%2)*3}px;height:${7 + (k%2)*3}px;opacity:${.75 + k*.08}"></span>`)).join('')}
    </div>` : '';

  const hot = drink.temp === 'hot';
  return `
  <div class="cup ${hot ? 'hot' : 'iced'}" style="width:${w}px;height:${h}px">
    ${hot ? `<div class="steam"><i></i><i></i><i></i></div>` : ''}
    ${drink.temp === 'iced' ? `<div class="straw"></div>` : ''}
    <div class="cup-body">
      <div class="cup-liquid" style="height:${fillPct}%">${layerHTML}${iceHTML}</div>
      ${foamHTML}
    </div>
    ${dustHTML}${drizzleHTML}
    ${hot ? `<div class="cup-lid"></div><div class="cup-sleeve"></div>` : ''}
  </div>`;
}

/* ========================================================================
   CAKE
   ======================================================================== */
const cake = {
  format:'6in', layers:4, sponge:'ladyfinger', soak:'strawmatcha',
  fillings:['mascarpone','matchacream','strawcomp'], exterior:'cocoadust',
  garnishes:['g-fdstraw','g-matcha'], inscription:'', notes:'', name:'', preset:'',
};

function cakePrice() {
  let p = find(CAKE_OPTS.format, cake.format)?.price || 0;
  const scale = cake.format === 'slice' ? .25 : find(CAKE_OPTS.format, cake.format).w;
  p += (find(CAKE_OPTS.sponge, cake.sponge)?.price || 0) * cake.layers * scale;
  p += (find(CAKE_OPTS.soak, cake.soak)?.price || 0) * scale * 1.4;
  cake.fillings.forEach(id => p += (find(CAKE_OPTS.filling, id)?.price || 0) * scale * 1.6);
  p += (find(CAKE_OPTS.exterior, cake.exterior)?.price || 0) * scale;
  cake.garnishes.forEach(id => p += (find(CAKE_OPTS.garnish, id)?.price || 0) * scale);
  if (cake.inscription.trim()) p += 1.000;
  return p;
}

function cakeName() {
  if (cake.name.trim()) return cake.name.trim();
  if (cake.preset) return cake.preset;
  const sponge = find(CAKE_OPTS.sponge, cake.sponge);
  const soak = find(CAKE_OPTS.soak, cake.soak);
  const fill = cake.fillings[0] ? find(CAKE_OPTS.filling, cake.fillings[0]) : null;
  const ar = I18N.isRTL();
  const bits = [];
  if (soak && soak.id !== 'none') bits.push(L(soak).replace(' + ', ' '));
  if (sponge.id === 'ladyfinger') bits.push(ar ? 'تيراميسو' : 'Tiramisù');
  else {
    if (fill) bits.push(L(fill).replace(' Cream','').replace(' Compote',''));
    bits.push(L(sponge).replace(' Sponge','').replace(' Cake',''));
  }
  const out = [...new Set(bits.join(' ').split(' '))].join(' ');
  return out + (cake.format === 'slice' ? (ar ? ' — قطعة' : ' Slice') : (ar ? ' — كيكة' : ' Cake'));
}

function cakeRecipe() {
  const f = find(CAKE_OPTS.format, cake.format);
  const bits = [`${L(f)} · ${t('c.serves', { n: I18N.isRTL() ? f.ar_serves : f.serves })}`];
  bits.push(I18N.isRTL()
    ? `${I18N.digits(cake.layers)} طبقات ${L(find(CAKE_OPTS.sponge, cake.sponge))}`
    : `${cake.layers} layers of ${find(CAKE_OPTS.sponge, cake.sponge).name.toLowerCase()}`);
  const soak = find(CAKE_OPTS.soak, cake.soak);
  if (soak.id !== 'none') bits.push(I18N.isRTL() ? `منقوعة بـ${L(soak)}` : `soaked in ${soak.name.toLowerCase()}`);
  if (cake.fillings.length) bits.push(cake.fillings.map(id => L(find(CAKE_OPTS.filling, id))).join('، '));
  const ext = find(CAKE_OPTS.exterior, cake.exterior);
  if (ext.id !== 'naked') bits.push(L(ext));
  if (cake.garnishes.length) bits.push(cake.garnishes.map(id => L(find(CAKE_OPTS.garnish, id))).join('، '));
  return bits.join(' · ');
}

const GARNISH_SHAPE = {
  berry:  c => `<svg width="17" height="19" viewBox="0 0 17 19"><path d="M8.5 19C4 16.5 1.5 13 1.5 9.5 1.5 6 4.6 4 8.5 4s7 2 7 5.5C15.5 13 13 16.5 8.5 19z" fill="${c}"/><path d="M8.5 5V1M8.5 4c-2-.6-3.4-1.9-3.8-3.4C6.6.1 8 1.6 8.5 4z" stroke="#5f7a3f" stroke-width="1.3" fill="#6d8a49"/></svg>`,
  dust:   c => `<svg width="20" height="9" viewBox="0 0 20 9">${[2,6,10,14,18].map((x,i)=>`<circle cx="${x}" cy="${4+(i%2?2:-1)}" r="${1.6+(i%3)*.5}" fill="${c}" opacity=".85"/>`).join('')}</svg>`,
  crumb:  c => `<svg width="20" height="10" viewBox="0 0 20 10">${[1,6,11,16].map((x,i)=>`<rect x="${x}" y="${3+(i%2)*2}" width="3.4" height="3" rx="1" fill="${c}" transform="rotate(${i*22-20} ${x+1.7} ${4+(i%2)*2})"/>`).join('')}</svg>`,
  leaf:   c => `<svg width="15" height="13" viewBox="0 0 15 13"><path d="M1 8C3 2 7 0 11 1c3 .8 4 4 2.4 7-1.6 3-6 5-9.4 4C1.8 11.6 1 10 1 8z" fill="${c}"/></svg>`,
  curl:   c => `<svg width="15" height="17" viewBox="0 0 15 17"><path d="M3 16C1 11 2.5 5 7 2c3-2 6-1 7 1.5C15 6 13 8 10.5 8 8 8 6.5 6 7.5 4" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  flower: c => `<svg width="17" height="17" viewBox="0 0 17 17">${[0,72,144,216,288].map(a=>`<ellipse cx="8.5" cy="4" rx="2.7" ry="4" fill="${c}" transform="rotate(${a} 8.5 8.5)"/>`).join('')}<circle cx="8.5" cy="8.5" r="2.2" fill="#f0d98a"/></svg>`,
  blob:   c => `<svg width="17" height="16" viewBox="0 0 17 16"><path d="M2 15C1 9 3 1 8.5 1S16 9 15 15z" fill="${c}"/></svg>`,
  bean:   c => `<svg width="14" height="17" viewBox="0 0 14 17"><ellipse cx="7" cy="8.5" rx="5.5" ry="8" fill="${c}"/><path d="M7 1.5c-1.6 3-1.6 11 0 14" stroke="#c9a06a" stroke-width="1.2" fill="none"/></svg>`,
  shard:  c => `<svg width="13" height="18" viewBox="0 0 13 18"><path d="M2 18 6 0l5 18z" fill="${c}" opacity=".9"/></svg>`,
};

function renderCake() {
  const fmt = find(CAKE_OPTS.format, cake.format);
  const sponge = find(CAKE_OPTS.sponge, cake.sponge);
  const soak = find(CAKE_OPTS.soak, cake.soak);
  const ext = find(CAKE_OPTS.exterior, cake.exterior);

  const w = Math.round(250 * fmt.w);
  const spongeColor = soak.color ? mix(sponge.color, soak.color, .34) : sponge.color;
  const n = cake.layers;
  const totalH = Math.round(Math.min(236, 54 + n * 34) * (cake.format === 'slice' ? .84 : 1));
  const fillCount = Math.max(0, n - 1);
  const spongeH = (totalH * .70) / n;
  const fillH = fillCount ? (totalH * .30) / fillCount : 0;

  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push(`<div class="cake-layer sponge" style="height:${spongeH}px;background:${i % 2 ? darken(spongeColor,.03) : spongeColor}"></div>`);
    if (i < fillCount) {
      const fid = cake.fillings.length ? cake.fillings[i % cake.fillings.length] : null;
      const fc = fid ? find(CAKE_OPTS.filling, fid).color : lighten(spongeColor, .30);
      rows.push(`<div class="cake-layer" style="height:${fillH}px;background:linear-gradient(${lighten(fc,.12)},${fc})"></div>`);
    }
  }

  let extHTML = '';
  if (ext.color && ext.dust) {
    extHTML = `<div class="cake-exterior" style="background:${ext.color}14"></div>
      <div class="cake-top" style="background:linear-gradient(${ext.color},${darken(ext.color,.12)});height:11px;top:0;border-radius:4px 4px 0 0"></div>`;
  } else if (ext.color) {
    const side = Math.max(6, Math.round(w * .042));
    extHTML = `<div class="cake-exterior" style="box-shadow:inset ${side}px 0 0 ${ext.color}, inset -${side}px 0 0 ${ext.color}"></div>
      <div class="cake-top" style="background:linear-gradient(${lighten(ext.color,.16)},${ext.color});height:13px"></div>`;
    if (ext.drip) {
      const drips = Math.max(4, Math.round(w / 30));
      let d = `M0 0 H${w} V6 `;
      for (let i = drips - 1; i >= 0; i--) {
        const x = (i + .5) * (w / drips), len = 12 + ((i * 37) % 22), rw = 5 + ((i * 13) % 5);
        d += `L${(x + rw).toFixed(1)} 6 Q${(x + rw).toFixed(1)} ${6+len} ${x.toFixed(1)} ${6+len} Q${(x - rw).toFixed(1)} ${6+len} ${(x - rw).toFixed(1)} 6 `;
      }
      extHTML += `<svg class="cake-drip" viewBox="0 0 ${w} 44" width="${w}" height="44" aria-hidden="true"><path d="${d}H0 Z" fill="${ext.color}"/></svg>`;
    }
  }

  const garnishHTML = cake.garnishes.length ? `<div class="cake-garnish">
      ${cake.garnishes.map(id => { const g = find(CAKE_OPTS.garnish, id);
        return (GARNISH_SHAPE[g.shape] || GARNISH_SHAPE.dust)(g.color); }).join('')}
    </div>` : '';

  const inscHTML = cake.inscription.trim()
    ? `<div class="cake-inscription" style="font-size:${w > 180 ? '.95rem' : '.78rem'}">${esc(cake.inscription.trim())}</div>` : '';

  return `<div class="cake" style="width:${w}px">
      <div class="cake-stack" style="height:${totalH}px">${rows.join('')}${extHTML}${inscHTML}</div>
      ${garnishHTML}
      <div class="cake-plate"></div>
    </div>`;
}

/* ========================================================================
   COOKIE
   ======================================================================== */
const cookie = {
  pack:'six', size:'md', shape:'round', dough:'sugar', icing:'white',
  text:'', font:'script', textColor:'#B8794B', textSize:17,
  decor:['x-border'], notes:'', name:'', preset:'',
};

function cookieQty() { return find(COOKIE_OPTS.pack, cookie.pack)?.qty || 1; }

function cookiePrice() {
  const pack = find(COOKIE_OPTS.pack, cookie.pack);
  let unit = 0;
  unit += find(COOKIE_OPTS.size, cookie.size)?.price || 0;
  unit += find(COOKIE_OPTS.shape, cookie.shape)?.price || 0;
  unit += find(COOKIE_OPTS.dough, cookie.dough)?.price || 0;
  unit += find(COOKIE_OPTS.icing, cookie.icing)?.price || 0;
  cookie.decor.forEach(id => unit += find(COOKIE_OPTS.decor, id)?.price || 0);
  if (cookie.text.trim()) unit += .350;
  /* Extras are charged per cookie at half rate — the tray is iced in one go. */
  return pack.price + unit * pack.qty * .5;
}

function cookieName() {
  if (cookie.name.trim()) return cookie.name.trim();
  if (cookie.preset) return cookie.preset;
  const ar = I18N.isRTL();
  const shape = L(find(COOKIE_OPTS.shape, cookie.shape));
  const dough = L(find(COOKIE_OPTS.dough, cookie.dough));
  if (cookie.text.trim()) {
    const words = cookie.text.trim().slice(0, 18);
    return ar ? `كوكيز «${words}»` : `“${words}” Cookie`;
  }
  return ar ? `كوكيز ${dough} ${shape}` : `${dough} ${shape} Cookie`;
}

function cookieRecipe() {
  const ar = I18N.isRTL();
  const pack = find(COOKIE_OPTS.pack, cookie.pack);
  const bits = [L(pack), L(find(COOKIE_OPTS.size, cookie.size)), L(find(COOKIE_OPTS.shape, cookie.shape)),
    L(find(COOKIE_OPTS.dough, cookie.dough))];
  const ic = find(COOKIE_OPTS.icing, cookie.icing);
  if (ic.id !== 'none') bits.push(ar ? `آيسنغ ${L(ic)}` : `${ic.name.toLowerCase()} icing`);
  if (cookie.text.trim()) bits.push(`“${cookie.text.trim()}” · ${L(find(COOKIE_OPTS.font, cookie.font))}`);
  if (cookie.decor.length) bits.push(cookie.decor.map(id => L(find(COOKIE_OPTS.decor, id))).join('، '));
  return bits.join(' · ');
}

const DECOR_SHAPE = {
  sprinkle:(c,i)=>`<span style="position:absolute;width:7px;height:2.6px;border-radius:2px;background:${['#D98A9B','#8FAE5E','#E3B45E','#B8794B','#C98A95'][i%5]};transform:rotate(${rnd(i,3)*360}deg)"></span>`,
  dust:    (c,i)=>`<span style="position:absolute;width:${2+rnd(i,4)*2}px;height:${2+rnd(i,4)*2}px;border-radius:50%;background:${c};opacity:.85"></span>`,
  glitter: (c,i)=>`<span style="position:absolute;width:3px;height:3px;background:${c};transform:rotate(45deg);opacity:${.5+rnd(i,5)*.5}"></span>`,
  pearl:   (c,i)=>`<span style="position:absolute;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 32% 30%,#fff,${c});box-shadow:0 1px 2px rgba(76,45,31,.25)"></span>`,
  leaf:    (c,i)=>`<span style="position:absolute;width:${7+rnd(i,6)*7}px;height:${5+rnd(i,7)*6}px;background:linear-gradient(120deg,#F0D48A,${c});border-radius:${40+rnd(i,8)*40}% ${30+rnd(i,9)*50}% ${50+rnd(i,2)*30}% ${40+rnd(i,3)*40}%;opacity:.95"></span>`,
  petal:   (c,i)=>`<span style="position:absolute;width:9px;height:6px;border-radius:60% 40% 55% 45%;background:${c};transform:rotate(${rnd(i,4)*360}deg);opacity:.9"></span>`,
  crumb:   (c,i)=>`<span style="position:absolute;width:4px;height:3.4px;border-radius:1.5px;background:${c};transform:rotate(${rnd(i,5)*360}deg)"></span>`,
};

function renderCookie() {
  const size = find(COOKIE_OPTS.size, cookie.size);
  const shape = find(COOKIE_OPTS.shape, cookie.shape);
  const dough = find(COOKIE_OPTS.dough, cookie.dough);
  const icing = find(COOKIE_OPTS.icing, cookie.icing);
  const font = find(COOKIE_OPTS.font, cookie.font);
  const d = Math.round(216 * size.scale);
  const mask = maskURL(shape.path);
  /* Single quotes: this string is interpolated into a double-quoted style attribute. */
  const maskCSS = `-webkit-mask-image:url('${mask}');mask-image:url('${mask}');-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;

  const hasBorder = cookie.decor.includes('x-border');
  const borderCol = icing.color ? lighten(icing.color, .45) : '#FFFBF2';
  const icingInset = hasBorder ? 11 : 7;

  /* Scatter decorations around the icing, avoiding the middle where text sits. */
  const scatterables = cookie.decor.map(id => find(COOKIE_OPTS.decor, id))
    .filter(x => x && DECOR_SHAPE[x.shape]);
  let k = 0;
  const decorHTML = scatterables.flatMap(dec => {
    const count = dec.shape === 'leaf' ? 4 : dec.shape === 'pearl' ? 9 : 14;
    return Array.from({ length: count }, () => {
      k++;
      const a = rnd(k, 1) * Math.PI * 2;
      const r = 27 + rnd(k, 2) * 17;                    // % from centre — a ring, not the middle
      const x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
      return `<span class="ck-dec" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">${DECOR_SHAPE[dec.shape](dec.color, k)}</span>`;
    });
  }).join('');

  const drizzleDec = cookie.decor.includes('x-drizzle')
    ? `<svg class="ck-drizzle" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${[30,45,60,75].map(y => `<path d="M12 ${y} Q30 ${y-9} 50 ${y} T88 ${y}" fill="none" stroke="#4A2A17" stroke-width="2.1" stroke-linecap="round" opacity=".85"/>`).join('')}
      </svg>` : '';

  const words = cookie.text.trim();
  const fs = Math.round(cookie.textSize * size.scale);
  const textHTML = words ? `<div class="ck-text" style="
      font-family:${font.family};font-weight:${font.weight};line-height:${font.lh};
      color:${cookie.textColor};font-size:${fs}px;max-width:${shape.id === 'plaque' ? 82 : 66}%">
      ${esc(words)}</div>` : '';

  return `<div class="cookie" style="width:${d}px;height:${d}px">
    <div class="ck-shape" style="${maskCSS};background:linear-gradient(155deg,${lighten(dough.color,.14)},${dough.color} 55%,${darken(dough.color,.10)})">
      <div class="ck-crumb"></div>
      ${hasBorder && icing.color ? `<div class="ck-icing" style="inset:5%;${maskCSS};background:${borderCol}"></div>` : ''}
      ${icing.color ? `<div class="ck-icing" style="inset:${icingInset}%;${maskCSS};background:linear-gradient(160deg,${lighten(icing.color,.13)},${icing.color})"></div>` : ''}
      ${drizzleDec}
    </div>
    <div class="ck-decor" style="${maskCSS}">${decorHTML}</div>
    ${textHTML}
    <div class="ck-shadow"></div>
  </div>`;
}

/* ========================================================================
   Option rendering
   ======================================================================== */
/* The tile used to be a <button> with the stepper's own buttons inside it.
   That is invalid nesting, and the parser simply dropped them -- the stepper
   rendered as an empty gap, which is why adding and removing felt broken.
   The tile is a div with a button role now, so the -/+ inside are real
   buttons, and the tail keeps a fixed width so a tile does not resize the
   moment it is switched on. */
function optHTML(o, { on, kind, group, swatch = true, pill = false, qty = null }) {
  const price = o.price ? `<span class="opt-price">+${money(o.price)}</span>` : '';
  const sw = swatch && o.color ? `<span class="swatch${kind==='cake'?' sq':''}" style="background:${o.color}"></span>`
    : swatch && o.color === null ? `<span class="swatch" style="background:repeating-linear-gradient(45deg,#EFE6D4,#EFE6D4 4px,#DED0B6 4px,#DED0B6 8px)"></span>` : '';

  let tail = price;
  if (qty !== null) {
    const cap = capFor(group, o.id);
    tail = on
      ? `<span class="pumps">
           <button class="pump-btn" data-pump="-1" data-group="${group}" data-id="${o.id}" type="button"
             aria-label="${esc(t('st.less'))}">&minus;</button>
           <span class="pump-n">${I18N.digits(qty)}</span>
           <button class="pump-btn" data-pump="1" data-group="${group}" data-id="${o.id}" type="button"
             aria-label="${esc(t('st.more'))}"${qty >= cap ? ' disabled' : ''}>+</button>
         </span>`
      : price;
  }

  return `<div class="opt${pill?' pill':''}${qty!==null?' qty':''}${on?' on':''}"
    data-group="${group}" data-id="${o.id}" role="button" tabindex="0" aria-pressed="${!!on}">
    ${sw}<span class="opt-txt"><span class="opt-name">${esc(L(o))}</span>
    ${o.sub || o.ar_sub ? `<span class="opt-sub">${esc(L(o,'sub'))}</span>` : ''}</span>
    <span class="opt-tail">${tail}</span>
    <span class="opt-check">${I.check}</span></div>`;
}

const groupHTML = (n, title, hint, body) => `<section class="opt-group">
  <div class="opt-head"><h3 class="opt-title"><i>${typeof n === 'number' ? I18N.digits(n) : n}</i>${title}</h3>
  <span class="opt-hint">${hint}</span></div>${body}</section>`;

function presetHTML(list, kind) {
  return list.map((p, i) => {
    let dots;
    if (kind === 'drink') dots = [find(DRINK_OPTS.base, p.state.base)?.color,
      find(DRINK_OPTS.milk, p.state.milk)?.color || '#E8DDCB',
      find(DRINK_OPTS.syrup, Object.keys(p.state.syrups)[0])?.color || '#D8C3A0'];
    else if (kind === 'cake') dots = [find(CAKE_OPTS.sponge, p.state.sponge)?.color,
      find(CAKE_OPTS.filling, p.state.fillings[0])?.color || '#EFE0C6',
      find(CAKE_OPTS.exterior, p.state.exterior)?.color || '#E8DDCB'];
    else dots = [find(COOKIE_OPTS.dough, p.state.dough)?.color,
      find(COOKIE_OPTS.icing, p.state.icing)?.color || '#FFFBF2',
      find(COOKIE_OPTS.decor, p.state.decor[0])?.color || '#E0BC55'];
    return `<button class="preset" data-preset="${kind}:${i}" type="button">
      <b>${esc(L(p))}</b><span>${esc(L(p,'blurb'))}</span>
      <span class="dots">${dots.map(c => `<i style="background:${c}"></i>`).join('')}</span></button>`;
  }).join('');
}

/* ========================================================================
   Panels
   ======================================================================== */
/* A running list of everything added, with the same stepper as the tiles, so
   you can adjust without hunting back up through six groups for the one you
   want to change. */
function addonsRecap() {
  const rows = [];
  const add = (group, list, kindLabel) => {
    for (const [id, n] of counts(bagFor(group))) {
      const o = find(list, id); if (!o) continue;
      rows.push({ group, o, n, kindLabel, line: (o.price || 0) * n });
    }
  };
  add('syrup',  DRINK_OPTS.syrup,  t('st.kindSyrup'));
  add('extra',  DRINK_OPTS.extra,  t('st.kindExtra'));
  add('finish', DRINK_OPTS.finish, t('st.kindFinish'));

  const sum = rows.reduce((a, r) => a + r.line, 0);
  const body = !rows.length
    ? `<p class="recap-empty">${t('st.recapEmpty')}</p>`
    : `<ul class="recap-list">${rows.map(r => {
        const cap = capFor(r.group, r.o.id);
        return `<li class="recap-row">
          <span class="recap-sw" style="background:${r.o.color || 'var(--sand)'}"></span>
          <span class="recap-name">${esc(L(r.o))}<em>${esc(r.kindLabel)}</em></span>
          <span class="pumps">
            <button class="pump-btn" data-pump="-1" data-group="${r.group}" data-id="${r.o.id}" type="button"
              aria-label="${esc(t('st.less'))}">&minus;</button>
            <span class="pump-n">${I18N.digits(r.n)}</span>
            <button class="pump-btn" data-pump="1" data-group="${r.group}" data-id="${r.o.id}" type="button"
              aria-label="${esc(t('st.more'))}"${r.n >= cap ? ' disabled' : ''}>+</button>
          </span>
          <span class="recap-price">${r.line ? money(r.line) : '&mdash;'}</span>
        </li>`;
      }).join('')}</ul>`;

  return groupHTML(I.spark, t('st.g.recap'),
    rows.length ? t('st.recapSum', { v: money(sum) }) : '',
    `<div class="recap">${body}</div>`);
}

function drinkPanel() {
  const O = DRINK_OPTS;
  const total = Object.values(drink.syrups).reduce((a, b) => a + b, 0);
  return `
  <div class="opt-group" style="padding-bottom:1rem">
    <div class="opt-head"><h3 class="opt-title"><i>${I.spark}</i>${t('st.presetDrink')}</h3>
      <span class="opt-hint">${t('st.thenChange')}</span></div>
    <div class="presets" data-scroll-key="presets-drink">${presetHTML(DRINK_PRESETS, 'drink')}</div>
  </div>
  ${groupHTML(1, t('st.g.cup'), t('c.pickEach'), `
    <div class="opts pillrow" style="margin-bottom:.7rem">
      ${O.temp.map(o => optHTML(o, { on: drink.temp === o.id, group:'temp', pill:true, swatch:false })).join('')}</div>
    <div class="opts pillrow">
      ${O.size.map(o => optHTML(o, { on: drink.size === o.id, group:'size', pill:true, swatch:false })).join('')}</div>`)}
  ${groupHTML(2, t('st.g.base'), t('c.pickOne'), `<div class="opts wide">
    ${O.base.map(o => optHTML(o, { on: drink.base === o.id, group:'base' })).join('')}</div>`)}
  ${groupHTML(3, t('st.g.milk'), t('c.pickOne'), `<div class="opts">
    ${O.milk.map(o => optHTML(o, { on: drink.milk === o.id, group:'milk' })).join('')}</div>`)}
  ${groupHTML(4, t('st.g.syrup'), total === 1 ? t('st.pump1') : t('st.pumps', { n: I18N.digits(total) }), `<div class="opts counted">
    ${O.syrup.map(o => optHTML(o, { on: has(drink.syrups, o.id), group:'syrup', qty: drink.syrups[o.id] || 0 })).join('')}</div>`)}
  ${groupHTML(5, t('st.g.extra'), t('c.addMany'), `<div class="opts counted">
    ${O.extra.map(o => optHTML(o, { on: has(drink.extras, o.id), group:'extra', qty: drink.extras[o.id] || 0 })).join('')}</div>`)}
  ${groupHTML(6, t('st.g.finish'), t('st.dustHint'), `<div class="opts counted">
    ${O.finish.map(o => optHTML(o, { on: has(drink.finishes, o.id), group:'finish', qty: drink.finishes[o.id] || 0 })).join('')}</div>`)}
  ${groupHTML(7, t('st.g.name'), t('c.optional'), `
    <div class="stack">
      <div class="field"><label for="d-name">${t('st.callIt')}</label>
        <input class="input" id="d-name" data-bind="drink.name" maxlength="46"
          placeholder="${esc(drinkName())}" value="${esc(drink.name)}"></div>
      <div class="field"><label for="d-notes">${t('st.notesBar')}</label>
        <textarea class="textarea" id="d-notes" data-bind="drink.notes"
          placeholder="${esc(t('st.phBar'))}">${esc(drink.notes)}</textarea></div>
    </div>`)}
  ${addonsRecap()}`;
}

function cakePanel() {
  const O = CAKE_OPTS;
  const fmt = find(O.format, cake.format);
  return `
  <div class="opt-group" style="padding-bottom:1rem">
    <div class="opt-head"><h3 class="opt-title"><i>${I.spark}</i>${t('st.presetCake')}</h3>
      <span class="opt-hint">${t('st.thenReinvent')}</span></div>
    <div class="presets" data-scroll-key="presets-cake">${presetHTML(CAKE_PRESETS, 'cake')}</div>
  </div>
  ${groupHTML(1, t('st.g.size'), t('c.serves', { n: I18N.isRTL() ? fmt.ar_serves : fmt.serves }), `<div class="opts">
    ${O.format.map(o => optHTML(o, { on: cake.format === o.id, group:'format', swatch:false })).join('')}</div>`)}
  ${groupHTML(2, t('st.g.layers'), `<span id="layerHint">${t('st.layerHint', { n: I18N.digits(cake.layers), f: I18N.digits(Math.max(0, cake.layers - 1)) })}</span>`, `
    <input type="range" class="range" min="2" max="6" step="1" value="${cake.layers}" id="layerRange" aria-label="${esc(t('st.g.layers'))}">
    <div class="row between small muted" style="margin-top:-.25rem"><span>${I18N.digits(2)}</span><span>${I18N.digits(6)}</span></div>`)}
  ${groupHTML(3, t('st.g.sponge'), t('c.pickOne'), `<div class="opts wide">
    ${O.sponge.map(o => optHTML(o, { on: cake.sponge === o.id, group:'sponge', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(4, t('st.g.soak'), t('st.soakHint'), `<div class="opts wide">
    ${O.soak.map(o => optHTML(o, { on: cake.soak === o.id, group:'soak', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(5, t('st.g.filling'), t('st.fillHint', { n: I18N.digits(cake.fillings.length) }), `<div class="opts">
    ${O.filling.map(o => optHTML(o, { on: cake.fillings.includes(o.id), group:'filling', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(6, t('st.g.exterior'), t('c.pickOne'), `<div class="opts wide">
    ${O.exterior.map(o => optHTML(o, { on: cake.exterior === o.id, group:'exterior', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(7, t('st.g.garnish'), t('st.garnishHint'), `<div class="opts">
    ${O.garnish.map(o => optHTML(o, { on: cake.garnishes.includes(o.id), group:'garnish', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(8, t('st.g.nameCake'), t('c.optional'), `
    <div class="stack">
      <div class="field"><label for="c-name">${t('st.callIt')}</label>
        <input class="input" id="c-name" data-bind="cake.name" maxlength="46"
          placeholder="${esc(cakeName())}" value="${esc(cake.name)}"></div>
      <div class="field"><label for="c-insc">${t('st.inscription')} <span class="muted" style="text-transform:none;letter-spacing:0">(+${money(1)})</span></label>
        <input class="input" id="c-insc" data-bind="cake.inscription" maxlength="28" value="${esc(cake.inscription)}"></div>
      <div class="field"><label for="c-notes">${t('st.notesBake')}</label>
        <textarea class="textarea" id="c-notes" data-bind="cake.notes"
          placeholder="${esc(t('st.phBake'))}">${esc(cake.notes)}</textarea></div>
    </div>`)}`;
}

function cookiePanel() {
  const O = COOKIE_OPTS;
  const words = cookie.text.trim();
  const fontCards = O.font.map(f => {
    const on = cookie.font === f.id;
    const sample = words || (I18N.isRTL() ? f.ar_sample : f.sample);
    const flag = f.arabic && !f.latin ? t('st.fontArabicOnly') : f.arabic ? t('st.fontArabicOnly') : t('st.fontLatinOnly');
    return `<button class="font-card${on ? ' on' : ''}" data-group="font" data-id="${f.id}" type="button" aria-pressed="${on}">
      <span class="font-sample" style="font-family:${f.family};font-weight:${f.weight};line-height:${f.lh}">${esc(sample.slice(0, 16))}</span>
      <span class="font-meta"><b>${esc(L(f))}</b><em>${flag}</em></span>
      <span class="opt-check">${I.check}</span></button>`;
  }).join('');

  return `
  <div class="opt-group" style="padding-bottom:1rem">
    <div class="opt-head"><h3 class="opt-title"><i>${I.spark}</i>${t('st.presetCookie')}</h3>
      <span class="opt-hint">${t('st.thenChange')}</span></div>
    <div class="presets" data-scroll-key="presets-cookie">${presetHTML(COOKIE_PRESETS, 'cookie')}</div>
  </div>
  ${groupHTML(1, t('st.g.pack'), t('c.pickEach'), `
    <div class="opts pillrow" style="margin-bottom:.7rem">
      ${O.pack.map(o => optHTML(o, { on: cookie.pack === o.id, group:'pack', pill:true, swatch:false })).join('')}</div>
    <div class="opts pillrow">
      ${O.size.map(o => optHTML(o, { on: cookie.size === o.id, group:'ckSize', pill:true, swatch:false })).join('')}</div>`)}
  ${groupHTML(2, t('st.g.shape'), t('st.shapeHint'), `<div class="opts shapes">
    ${O.shape.map(o => {
      const m = maskURL(o.path);
      return `<button class="opt shape-opt${cookie.shape === o.id ? ' on' : ''}" data-group="shape" data-id="${o.id}" type="button" aria-pressed="${cookie.shape === o.id}">
        <span class="shape-chip" style="-webkit-mask-image:url('${m}');mask-image:url('${m}')"></span>
        <span class="opt-txt"><span class="opt-name">${esc(L(o))}</span></span>
        <span class="opt-check">${I.check}</span></button>`;
    }).join('')}</div>`)}
  ${groupHTML(3, t('st.g.dough'), t('c.pickOne'), `<div class="opts">
    ${O.dough.map(o => optHTML(o, { on: cookie.dough === o.id, group:'dough', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(4, t('st.g.icing'), t('c.pickOne'), `<div class="opts">
    ${O.icing.map(o => optHTML(o, { on: cookie.icing === o.id, group:'icing', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(5, t('st.g.message'), t('st.msgHint'), `
    <div class="stack">
      <div class="field"><label for="ck-text">${t('st.msgLabel')}</label>
        <input class="input ck-input" id="ck-text" data-bind="cookie.text" maxlength="30"
          placeholder="${esc(t('st.msgPh'))}" value="${esc(cookie.text)}"></div>
      <div class="grid g2" style="gap:1rem">
        <div class="field"><label for="ck-color">${t('st.inkColour')}</label>
          <div class="ink-row" id="inkRow">
            ${['#4C2D1F','#B8794B','#FFFBF2','#DED0B6','#E3B45E','#C98A95','#8FAE5E','#8A5A46'].map(c =>
              `<button class="ink${cookie.textColor.toUpperCase() === c ? ' on' : ''}" data-ink="${c}" type="button"
                style="background:${c}" aria-label="${c}"></button>`).join('')}
          </div></div>
        <div class="field"><label for="ck-size">${t('st.textSize')}</label>
          <input type="range" class="range" id="ck-size" min="10" max="26" step="1" value="${cookie.textSize}"></div>
      </div>
    </div>`)}
  ${groupHTML(6, t('st.g.font'), t('st.fontHint'), `<div class="font-grid">${fontCards}</div>`)}
  ${groupHTML(7, t('st.g.decor'), t('c.addMany'), `<div class="opts">
    ${O.decor.map(o => optHTML(o, { on: cookie.decor.includes(o.id), group:'decor', kind:'cake' })).join('')}</div>`)}
  ${groupHTML(8, t('st.g.nameCookie'), t('c.optional'), `
    <div class="stack">
      <div class="field"><label for="k-name">${t('st.callIt')}</label>
        <input class="input" id="k-name" data-bind="cookie.name" maxlength="46"
          placeholder="${esc(cookieName())}" value="${esc(cookie.name)}"></div>
      <div class="field"><label for="k-notes">${t('st.notesDecor')}</label>
        <textarea class="textarea" id="k-notes" data-bind="cookie.notes"
          placeholder="${esc(t('st.phDecor'))}">${esc(cookie.notes)}</textarea></div>
    </div>`)}`;
}

/* ========================================================================
   Wiring
   ======================================================================== */
let mode = 'drink';
const MODES = {
  drink:  { render: renderDrink,  name: drinkName,  recipe: drinkRecipe,  price: drinkPrice,  panel: drinkPanel,  lead: 'st.readyDrink' },
  cake:   { render: renderCake,   name: cakeName,   recipe: cakeRecipe,   price: cakePrice,   panel: cakePanel,   lead: 'st.readyCake' },
  cookie: { render: renderCookie, name: cookieName, recipe: cookieRecipe, price: cookiePrice, panel: cookiePanel, lead: 'st.readyCookie' },
};

function paintStage() {
  const M = MODES[mode];
  $('#stageViz').innerHTML = M.render() + '<div class="stage-shadow"></div>';
  $('#stageName').textContent = M.name();
  $('#stageRecipe').textContent = M.recipe();
  $('#stagePrice').innerHTML = `<small>${t('st.yourPrice')}</small>${money(M.price())}`;
  $('#stageLead').textContent = t(M.lead);
}

/* Rebuilding the panel with innerHTML throws away the scroll position of
   anything inside it, so the preset rail jumped back to its first card every
   time a box was picked. Positions are captured by key and put back around
   the swap. Switching studios is left alone -- a different rail should start
   at its own beginning. */
let paintedMode = null;

function paint() {
  clampCounts();
  paintStage();
  const panel = $('#optPanel');
  const same = paintedMode === mode;
  const keep = same ? new Map([...panel.querySelectorAll('[data-scroll-key]')]
    .map(e => [e.dataset.scrollKey, [e.scrollLeft, e.scrollTop]])) : null;

  panel.innerHTML = MODES[mode].panel();

  if (keep) panel.querySelectorAll('[data-scroll-key]').forEach(e => {
    const at = keep.get(e.dataset.scrollKey);
    if (at) { e.scrollLeft = at[0]; e.scrollTop = at[1]; }
  });
  paintedMode = mode;

  $$('.studio-tab').forEach(x => x.classList.toggle('active', x.dataset.mode === mode));
  history.replaceState(null, '', mode === 'drink' ? location.pathname : location.pathname + '#' + mode);
}

/* Stage-only repaint keeps the caret inside whatever is being typed. */
function softPaint() {
  paintStage();
  const hint = $('#layerHint');
  if (hint) hint.textContent = t('st.layerHint', { n: I18N.digits(cake.layers), f: I18N.digits(Math.max(0, cake.layers - 1)) });
  $$('.font-sample').forEach(el => {
    const words = cookie.text.trim();
    const card = el.closest('.font-card');
    const f = find(COOKIE_OPTS.font, card.dataset.id);
    el.textContent = (words || (I18N.isRTL() ? f.ar_sample : f.sample)).slice(0, 16);
  });
}

function applyPreset(kind, i) {
  const list = kind === 'drink' ? DRINK_PRESETS : kind === 'cake' ? CAKE_PRESETS : COOKIE_PRESETS;
  const p = list[i];
  if (kind === 'drink') {
    const st = structuredClone(p.state);
    Object.assign(drink, { syrups:{}, extras:{}, finishes:{}, notes:'' }, st, { name:'', preset:L(p) });
    drink.extras = toCounts(st.extras); drink.finishes = toCounts(st.finishes);
  }
  else if (kind === 'cake') Object.assign(cake, structuredClone(p.state), { name:'', preset:L(p), notes:'' });
  else Object.assign(cookie, structuredClone(p.state), { name:'', preset:L(p), notes:'' });
  paint();
  toast(t('st.loaded', { name: L(p) }));
}

function surprise() {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const some = (a, n) => [...a].sort(() => Math.random() - .5).slice(0, n).map(o => o.id);
  if (mode === 'drink') {
    Object.assign(drink, {
      temp: pick(DRINK_OPTS.temp).id, size: pick(DRINK_OPTS.size).id,
      base: pick(DRINK_OPTS.base).id, milk: pick(DRINK_OPTS.milk).id,
      syrups: Object.fromEntries(some(DRINK_OPTS.syrup, 1 + (Math.random() * 2 | 0)).map(id => [id, 1 + (Math.random() * 2 | 0)])),
      extras: toCounts(some(DRINK_OPTS.extra, Math.random() * 3 | 0)),
      finishes: toCounts(some(DRINK_OPTS.finish, 1 + (Math.random() * 2 | 0))), name: '', preset: '',
    });
  } else if (mode === 'cake') {
    Object.assign(cake, {
      format: pick(CAKE_OPTS.format).id, layers: 2 + (Math.random() * 5 | 0),
      sponge: pick(CAKE_OPTS.sponge).id, soak: pick(CAKE_OPTS.soak).id,
      fillings: some(CAKE_OPTS.filling, 1 + (Math.random() * 3 | 0)),
      exterior: pick(CAKE_OPTS.exterior).id,
      garnishes: some(CAKE_OPTS.garnish, 1 + (Math.random() * 2 | 0)), name: '', preset: '',
    });
  } else {
    Object.assign(cookie, {
      pack: pick(COOKIE_OPTS.pack).id, size: pick(COOKIE_OPTS.size).id,
      shape: pick(COOKIE_OPTS.shape).id, dough: pick(COOKIE_OPTS.dough).id,
      icing: pick(COOKIE_OPTS.icing.filter(x => x.color)).id,
      font: pick(COOKIE_OPTS.font).id,
      textColor: pick(['#4C2D1F','#B8794B','#FFFBF2','#E3B45E','#C98A95']),
      decor: some(COOKIE_OPTS.decor, 1 + (Math.random() * 2 | 0)), name: '', preset: '',
    });
  }
  paint();
  toast(t('st.rolled'));
}

function currentItem() {
  const M = MODES[mode];
  const state = mode === 'drink' ? drink : mode === 'cake' ? cake : cookie;
  let c1, c2;
  if (mode === 'drink') {
    c1 = find(DRINK_OPTS.milk, drink.milk)?.color || lighten(find(DRINK_OPTS.base, drink.base).color, .3);
    c2 = find(DRINK_OPTS.base, drink.base).color;
  } else if (mode === 'cake') {
    c1 = find(CAKE_OPTS.sponge, cake.sponge).color;
    c2 = find(CAKE_OPTS.filling, cake.fillings[0])?.color || darken(find(CAKE_OPTS.sponge, cake.sponge).color, .3);
  } else {
    c1 = find(COOKIE_OPTS.icing, cookie.icing)?.color || find(COOKIE_OPTS.dough, cookie.dough).color;
    c2 = find(COOKIE_OPTS.dough, cookie.dough).color;
  }
  return {
    key: Store.uid(), id: 'studio-' + mode, kind: mode, custom: true,
    name: M.name(),
    meta: M.recipe() + (state.notes ? ` — “${state.notes}”` : ''),
    price: M.price(), c1, c2,
    recipe: { mode, state: structuredClone(state) },
  };
}

/* Load a Studio state handed over from another page (recipe of the month). */
function consumeHandoff() {
  let raw = null;
  try { raw = sessionStorage.getItem('ec_studio_load'); sessionStorage.removeItem('ec_studio_load'); } catch {}
  if (!raw) return false;
  try {
    const { mode: m, state, name } = JSON.parse(raw);
    if (!MODES[m]) return false;
    mode = m;
    if (m === 'drink') {
      Object.assign(drink, { syrups:{}, extras:{}, finishes:{}, notes:'' }, state, { name: name || '' });
      drink.extras = toCounts(state.extras); drink.finishes = toCounts(state.finishes);
    }
    else if (m === 'cake') Object.assign(cake, state, { name: name || '', notes:'' });
    else Object.assign(cookie, state, { name: name || '', notes:'' });
    setTimeout(() => toast(t('mo.loaded')), 500);
    return true;
  } catch { return false; }
}

function initStudio() {
  if (!consumeHandoff()) {
    const h = location.hash.replace('#', '');
    if (MODES[h]) mode = h;
  }
  paint();

  $$('.studio-tab').forEach(tab => tab.onclick = () => { mode = tab.dataset.mode; paint(); });
  $('#surpriseBtn').onclick = surprise;

  $('#addBtn').onclick = () => {
    const item = currentItem();
    Store.addToCart(item);
    toast(t('st.added', { name: item.name, p: money(item.price) }), I.check);
  };

  $('#saveBtn').onclick = () => {
    if (!Store.current()) { openAuth('signup', t('st.saveLogin')); return; }
    const item = currentItem();
    Store.saveRecipe({ name:item.name, meta:item.meta, price:item.price, kind:item.kind,
      c1:item.c1, c2:item.c2, recipe:item.recipe });
    toast(t('st.savedTo', { name: item.name }), I.heart);
  };

  $('#optPanel').addEventListener('click', e => {
    const pump = e.target.closest('[data-pump]');
    if (pump) {
      e.stopPropagation();
      const { id, group } = pump.dataset, d = +pump.dataset.pump;
      const bag = bagFor(group);
      const next = Math.max(0, Math.min(capFor(group, id), (bag[id] || 0) + d));
      if (next) bag[id] = next; else delete bag[id];
      drink.preset = '';
      return paint();
    }
    const ink = e.target.closest('[data-ink]');
    if (ink) { cookie.textColor = ink.dataset.ink; cookie.preset = '';
      $$('#inkRow .ink').forEach(b => b.classList.toggle('on', b === ink)); return softPaint(); }

    const preset = e.target.closest('[data-preset]');
    if (preset) { const [k, i] = preset.dataset.preset.split(':'); return applyPreset(k, +i); }

    const opt = e.target.closest('.opt, .font-card'); if (!opt) return;
    const { group, id } = opt.dataset;
    switch (group) {
      case 'temp': case 'size': case 'base': case 'milk': drink[group] = id; break;
      case 'syrup': case 'extra': case 'finish': {
        const bag = bagFor(group);
        if (bag[id]) delete bag[id];
        else bag[id] = Math.min(group === 'syrup' ? 2 : 1, capFor(group, id));
        break;
      }
      case 'format': case 'sponge': case 'soak': case 'exterior': cake[group] = id; break;
      case 'filling':
        if (cake.fillings.includes(id)) cake.fillings = cake.fillings.filter(x => x !== id);
        else if (cake.fillings.length >= 4) return toast(t('st.max4fill'));
        else cake.fillings.push(id);
        break;
      case 'garnish':
        if (cake.garnishes.includes(id)) cake.garnishes = cake.garnishes.filter(x => x !== id);
        else if (cake.garnishes.length >= 4) return toast(t('st.max4garnish'));
        else cake.garnishes.push(id);
        break;
      case 'pack': cookie.pack = id; break;
      case 'ckSize': cookie.size = id; break;
      case 'shape': case 'dough': case 'icing': case 'font': cookie[group] = id; break;
      case 'decor':
        if (cookie.decor.includes(id)) cookie.decor = cookie.decor.filter(x => x !== id);
        else if (cookie.decor.length >= 4) return toast(t('st.max4decor'));
        else cookie.decor.push(id);
        break;
      default: return;
    }
    ({ temp:drink, size:drink, base:drink, milk:drink, syrup:drink, extra:drink, finish:drink,
       format:cake, sponge:cake, soak:cake, exterior:cake, filling:cake, garnish:cake,
       pack:cookie, ckSize:cookie, shape:cookie, dough:cookie, icing:cookie,
       font:cookie, decor:cookie })[group].preset = '';
    paint();
  });

  /* .opt is a div with a button role, so it needs its own key handling. */
  $('#optPanel').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const opt = e.target.closest('.opt'); if (!opt || e.target.closest('[data-pump]')) return;
    e.preventDefault(); opt.click();
  });

  $('#optPanel').addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'layerRange') { cake.layers = +el.value; cake.preset = ''; return softPaint(); }
    if (el.id === 'ck-size')    { cookie.textSize = +el.value; cookie.preset = ''; return softPaint(); }
    if (!el.dataset.bind) return;
    const [obj, key] = el.dataset.bind.split('.');
    const target = ({ drink, cake, cookie })[obj];
    target[key] = el.value;
    // typing your own name or a note does not change what is being made
    if (key !== 'name' && key !== 'notes') target.preset = '';
    softPaint();
  });

  I18N.onChange(paint);
}

document.addEventListener('DOMContentLoaded', () => { if ($('#optPanel')) initStudio(); });
