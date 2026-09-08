/* ==========================================================================
   Ember & Crumb — client-side store
   DEMO PERSISTENCE: everything lives in this browser's localStorage.
   Passwords are salted + SHA-256 hashed so they are never stored in plain
   text, but this is NOT a substitute for a real server. Do not ship as-is.
   ========================================================================== */
const Store = (() => {
  const K = { users:'ec_users', session:'ec_session', cart:'ec_cart', orders:'ec_orders', saved:'ec_saved' };

  /* ---------- low level ---------- */
  const read = (k, fb) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
    catch { return fb; }
  };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch { return false; }
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* ---------- hashing ---------- */
  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + '::' + pw);
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for insecure contexts (e.g. opened directly from disk).
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (const b of data) { h1 = Math.imul(h1 ^ b, 16777619) >>> 0; h2 = Math.imul(h2 + b, 2654435761) >>> 0; }
    return 'fb' + h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }
  const makeSalt = () => [...crypto.getRandomValues(new Uint8Array(12))]
    .map(b => b.toString(16).padStart(2, '0')).join('');

  /* ---------- events ---------- */
  const bus = new EventTarget();
  const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
  const on = (name, fn) => bus.addEventListener(name, fn);

  /* ================================================================ AUTH */
  const users = () => read(K.users, {});
  const norm = e => String(e || '').trim().toLowerCase();

  async function signup({ name, email, password }) {
    name = String(name || '').trim();
    email = norm(email);
    if (name.length < 2) throw new Error(t('err.name'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error(t('err.email'));
    if (String(password).length < 8) throw new Error(t('err.pw'));
    const all = users();
    if (all[email]) throw new Error(t('err.exists'));
    const salt = makeSalt();
    all[email] = {
      id: uid(), name, email, salt,
      pw: await hash(password, salt),
      created: Date.now(),
      points: 0,
    };
    write(K.users, all);
    return login({ email, password });
  }

  async function login({ email, password }) {
    email = norm(email);
    const u = users()[email];
    // Same message either way so the form can't be used to enumerate accounts.
    const bad = () => { throw new Error(t('err.creds')); };
    if (!u) { await hash(password, 'decoy'); bad(); }
    if (await hash(password, u.salt) !== u.pw) bad();
    const guest = read(`${K.cart}_guest`, []);
    write(K.session, { email, since: Date.now() });
    if (guest.length) {            // carry an anonymous bag into the account
      const mine = cart();
      guest.forEach(g => {
        const hit = mine.find(l => l.key === g.key && !l.custom);
        if (hit) hit.qty += g.qty; else mine.push(g);
      });
      write(scope(K.cart), mine);
      localStorage.removeItem(`${K.cart}_guest`);
    }
    emit('auth', current());
    emit('cart', cart());
    return current();
  }

  function logout() { localStorage.removeItem(K.session); emit('auth', null); }

  function current() {
    const s = read(K.session, null);
    if (!s) return null;
    const u = users()[s.email];
    if (!u) { localStorage.removeItem(K.session); return null; }
    const { pw, salt, ...safe } = u;
    return safe;
  }

  function updateProfile(patch) {
    const s = read(K.session, null); if (!s) return null;
    const all = users(); if (!all[s.email]) return null;
    Object.assign(all[s.email], patch);
    write(K.users, all); emit('auth', current());
    return current();
  }

  const initials = u => !u ? '' : u.name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();

  /* Per-user key so two accounts on one browser don't share a cart. */
  const scope = k => { const u = current(); return u ? `${k}_${u.id}` : `${k}_guest`; };

  /* ================================================================ CART */
  const cart = () => read(scope(K.cart), []);
  const saveCart = c => { write(scope(K.cart), c); emit('cart', c); };

  function addToCart(item) {
    const c = cart();
    const key = item.key || item.id;
    const hit = c.find(l => l.key === key && !l.custom);
    if (hit) hit.qty += (item.qty || 1);
    else c.push({
      key, id: item.id, name: item.name, price: +item.price,
      qty: item.qty || 1, meta: item.meta || '', custom: !!item.custom,
      c1: item.c1 || '#c8ae8b', c2: item.c2 || '#6b4326',
      recipe: item.recipe || null, kind: item.kind || 'item',
    });
    saveCart(c);
    return c;
  }
  function setQty(key, qty) {
    let c = cart();
    const line = c.find(l => l.key === key); if (!line) return;
    line.qty = qty;
    if (line.qty <= 0) c = c.filter(l => l.key !== key);
    saveCart(c);
  }
  const removeFromCart = key => saveCart(cart().filter(l => l.key !== key));
  const clearCart = () => saveCart([]);
  const cartCount = () => cart().reduce((n, l) => n + l.qty, 0);

  function totals() {
    const sub = cart().reduce((n, l) => n + l.price * l.qty, 0);
    const tax = sub * 0.05;          // service charge, not VAT
    return { sub, tax, total: sub + tax };
  }

  /* ============================================================== ORDERS */
  const orders = () => read(scope(K.orders), []);

  function placeOrder({ fulfilment = 'Pickup', notes = '' } = {}) {
    const lines = cart();
    if (!lines.length) throw new Error(t('err.emptyBag'));
    const tot = totals();
    const order = {
      id: 'EC-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
      at: Date.now(), lines, fulfilment, notes,
      sub: tot.sub, tax: tot.tax, total: tot.total,
      status: 'ac.inBakehouse',      // i18n key, resolved at render time
      ready: Date.now() + (lines.some(l => l.kind === 'cake') ? 864e5 * 2 : 12e5),
    };
    const all = orders(); all.unshift(order); write(scope(K.orders), all);
    // Loyalty: one point per whole dollar.
    if (current()) updateProfile({ points: (current().points || 0) + Math.floor(tot.total) });
    clearCart(); emit('order', order);
    return order;
  }

  /* ====================================================== SAVED RECIPES */
  const saved = () => read(scope(K.saved), []);
  function saveRecipe(r) {
    const all = saved();
    all.unshift({ ...r, id: uid(), at: Date.now() });
    write(scope(K.saved), all); emit('saved', all);
    return all;
  }
  function deleteRecipe(id) {
    const all = saved().filter(r => r.id !== id);
    write(scope(K.saved), all); emit('saved', all);
  }

  const money = n => I18N.money(n);

  return {
    on, emit, uid, money,
    signup, login, logout, current, updateProfile, initials,
    cart, addToCart, setQty, removeFromCart, clearCart, cartCount, totals,
    orders, placeOrder,
    saved, saveRecipe, deleteRecipe,
  };
})();
