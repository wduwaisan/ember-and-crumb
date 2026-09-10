/* ==========================================================================
   Ember & Crumb — accounts, bag, orders, saved recipes
   --------------------------------------------------------------------------
   Two interchangeable modes, chosen by js/config.js:

     LOCAL  no credentials configured. Everything lives in this browser's
            localStorage, passwords salted + SHA-256 hashed. Demo only.
     CLOUD  Supabase. Real auth (email, phone, Google, Facebook), real rows,
            data that follows the person between devices.

   Reads stay SYNCHRONOUS in both modes. In cloud mode they come from an
   in-memory cache hydrated on boot and kept warm by optimistic writes, so
   the hundreds of existing Store.cart() / Store.orders() call sites did not
   have to become async. Writes are async and reconcile in the background.
   ========================================================================== */
const Store = (() => {
  const K = { users:'ec_users', session:'ec_session', cart:'ec_cart', orders:'ec_orders', saved:'ec_saved' };

  const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const bus = new EventTarget();
  const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
  const on = (name, fn) => bus.addEventListener(name, fn);

  /* ---------------------------------------------------------- cloud state */
  let cloud = false;                 // Supabase reachable and configured
  let authUser = null;               // supabase auth user
  let cache = { profile: null, cart: [], orders: [], saved: [] };
  const resetCache = () => { cache = { profile: null, cart: [], orders: [], saved: [] }; };

  /* Cloud rows use database column names; the rest of the site expects the
     original shapes. Normalise once, here, rather than in every view. */
  const normOrder = r => ({
    id: r.code, rowId: r.id, at: new Date(r.created_at).getTime(),
    lines: r.lines || [], sub: +r.subtotal, tax: +r.service, total: +r.total,
    fulfilment: r.fulfilment, notes: r.notes, status: r.status,
  });
  const normRecipe = r => ({
    id: r.id, name: r.name, meta: r.meta, price: +r.price, kind: r.kind,
    c1: r.c1, c2: r.c2, recipe: r.recipe, at: new Date(r.created_at).getTime(),
  });

  /* ============================================================== hashing */
  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + '::' + pw);
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (const b of data) { h1 = Math.imul(h1 ^ b, 16777619) >>> 0; h2 = Math.imul(h2 + b, 2654435761) >>> 0; }
    return 'fb' + h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }
  const makeSalt = () => [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('');

  /* ================================================================= boot */
  async function boot() {
    if (!Backend.enabled()) return false;
    const c = await Backend.init();
    if (!c) return false;                       // SDK failed to load — stay local
    cloud = true;
    const s = await Backend.session();
    await adoptSession(s);
    Backend.onAuth(async next => {
      const changed = (next?.user?.id || null) !== (authUser?.id || null);
      if (changed) await adoptSession(next);
    });
    return true;
  }

  async function adoptSession(s) {
    authUser = s?.user || null;
    resetCache();
    if (!authUser) { emit('auth', null); emit('cart', []); return; }
    try {
      const [profile, orders, saved, cartLines] = await Promise.all([
        Backend.getProfile(authUser.id),
        Backend.getOrders(authUser.id),
        Backend.getRecipes(authUser.id),
        Backend.getCart(authUser.id),
      ]);
      cache.profile = profile;
      cache.orders = orders.map(normOrder);
      cache.saved = saved.map(normRecipe);
      /* Carry an anonymous bag into the account on first sign-in. */
      const guest = read(`${K.cart}_guest`, []);
      let lines = cartLines || [];
      if (guest.length) {
        guest.forEach(g => {
          const hit = lines.find(l => l.key === g.key && !l.custom);
          if (hit) hit.qty += g.qty; else lines.push(g);
        });
        localStorage.removeItem(`${K.cart}_guest`);
        Backend.saveCart(authUser.id, lines).catch(() => {});
      }
      cache.cart = lines;
    } catch (e) { console.warn('[Ember & Crumb] hydrate failed:', e.message); }
    emit('auth', current()); emit('cart', cache.cart);
  }

  const isCloud = () => cloud;

  /* ================================================================= AUTH */
  const users = () => read(K.users, {});
  const norm = e => String(e || '').trim().toLowerCase();

  async function signup({ name, email, password }) {
    name = String(name || '').trim();
    if (name.length < 2) throw new Error(t('err.name'));
    if (String(password).length < 8) throw new Error(t('err.pw'));

    /* Sign-up is instant — no confirmation mail — so this is the only gate
       against junk addresses. Strict on the domain, structural on the rest. */
    const check = EmailCheck.validate(email);
    if (!check.ok) { const e = new Error(check.error); e.suggestion = check.suggestion; throw e; }
    email = check.email;
    if (!(await EmailCheck.hasMailServer(email.split('@')[1]))) throw new Error(t('em.noServer'));

    if (cloud) {
      const { needsConfirm } = await Backend.signUpEmail({ name, email: norm(email), password });
      if (needsConfirm) { emit('confirm', norm(email)); return { name, email: norm(email), pending: true }; }
      return current();
    }

    email = norm(email);
    const all = users();
    if (all[email]) throw new Error(t('err.exists'));
    const salt = makeSalt();
    all[email] = { id: uid(), name, email, salt, pw: await hash(password, salt), created: Date.now(), points: 0 };
    write(K.users, all);
    return login({ email, password });
  }

  async function login({ email, password }) {
    if (cloud) { await Backend.signInEmail({ email: norm(email), password }); return current(); }

    email = norm(email);
    const u = users()[email];
    const bad = () => { throw new Error(t('err.creds')); };
    if (!u) { await hash(password, 'decoy'); bad(); }
    if (await hash(password, u.salt) !== u.pw) bad();

    const guest = read(`${K.cart}_guest`, []);
    write(K.session, { email, since: Date.now() });
    if (guest.length) {
      const mine = cart();
      guest.forEach(g => { const hit = mine.find(l => l.key === g.key && !l.custom); if (hit) hit.qty += g.qty; else mine.push(g); });
      write(scope(K.cart), mine);
      localStorage.removeItem(`${K.cart}_guest`);
    }
    emit('auth', current()); emit('cart', cart());
    return current();
  }

  /* --- the methods that only exist with a real backend --- */
  async function sendPhoneCode(phone, name) {
    if (!cloud) throw new Error(t('sb.needsBackend'));
    return Backend.sendPhoneCode({ phone, name });
  }
  async function verifyPhoneCode(phone, code) {
    if (!cloud) throw new Error(t('sb.needsBackend'));
    await Backend.verifyPhoneCode({ phone, code });
    return current();
  }
  async function oauth(provider) {
    if (!cloud) throw new Error(t('sb.needsBackend'));
    return Backend.signInOAuth(provider);
  }

  async function logout() {
    if (cloud) { await Backend.signOut(); authUser = null; resetCache(); emit('auth', null); emit('cart', []); return; }
    localStorage.removeItem(K.session); emit('auth', null);
  }

  function current() {
    if (cloud) {
      if (!authUser) return null;
      const p = cache.profile;
      return {
        id: authUser.id,
        name: p?.display_name || authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || authUser.phone || 'Guest',
        email: authUser.email || authUser.phone || '',
        points: p?.crumbs ?? 0,
        usual: p?.usual || '',
      };
    }
    const s = read(K.session, null); if (!s) return null;
    const u = users()[s.email];
    if (!u) { localStorage.removeItem(K.session); return null; }
    const { pw, salt, ...safe } = u;
    return safe;
  }

  function updateProfile(patch) {
    if (cloud) {
      if (!authUser) return null;
      if (cache.profile) {
        if ('name' in patch)  cache.profile.display_name = patch.name;
        if ('usual' in patch) cache.profile.usual = patch.usual;
      }
      Backend.updateProfile(authUser.id, {
        ...('name'  in patch ? { display_name: patch.name } : {}),
        ...('usual' in patch ? { usual: patch.usual } : {}),
      }).catch(e => console.warn(e.message));
      emit('auth', current());
      return current();
    }
    const s = read(K.session, null); if (!s) return null;
    const all = users(); if (!all[s.email]) return null;
    Object.assign(all[s.email], patch);
    write(K.users, all); emit('auth', current());
    return current();
  }

  const initials = u => !u ? '' : u.name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const scope = k => { const u = current(); return u ? `${k}_${u.id}` : `${k}_guest`; };

  /* ================================================================= CART */
  const cart = () => cloud ? (authUser ? cache.cart : read(`${K.cart}_guest`, [])) : read(scope(K.cart), []);

  function saveCart(c) {
    if (cloud && authUser) { cache.cart = c; Backend.saveCart(authUser.id, c).catch(e => console.warn(e.message)); }
    else if (cloud)        { write(`${K.cart}_guest`, c); }
    else                   { write(scope(K.cart), c); }
    emit('cart', c);
  }

  function addToCart(item) {
    const c = cart();
    const key = item.key || item.id;
    const hit = c.find(l => l.key === key && !l.custom);
    if (hit) hit.qty += (item.qty || 1);
    else c.push({
      key, id: item.id, name: item.name, price: +item.price, qty: item.qty || 1,
      meta: item.meta || '', custom: !!item.custom,
      c1: item.c1 || '#c8ae8b', c2: item.c2 || '#6b4326',
      recipe: item.recipe || null, kind: item.kind || 'item', art: item.art || null,
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
    const tax = sub * 0.05;
    return { sub, tax, total: sub + tax };
  }

  /* =============================================================== ORDERS */
  const orders = () => cloud ? cache.orders : read(scope(K.orders), []);

  async function placeOrder({ fulfilment = 'Pickup', notes = '' } = {}) {
    const lines = cart();
    if (!lines.length) throw new Error(t('err.emptyBag'));
    const tot = totals();
    const code = 'EC-' + Math.random().toString(36).slice(2, 7).toUpperCase();

    if (cloud) {
      if (!authUser) throw new Error(t('cart.loginFirst'));
      const row = await Backend.insertOrder(authUser.id, {
        code, lines, subtotal: +tot.sub.toFixed(3), service: +tot.tax.toFixed(3),
        total: +tot.total.toFixed(3), fulfilment, notes,
      });
      const order = normOrder(row);
      cache.orders.unshift(order);
      /* crumbs were incremented by a database trigger — re-read the truth */
      Backend.getProfile(authUser.id).then(p => { cache.profile = p; emit('auth', current()); }).catch(() => {});
      clearCart(); emit('order', order);
      return order;
    }

    const order = {
      id: code, at: Date.now(), lines, fulfilment, notes,
      sub: tot.sub, tax: tot.tax, total: tot.total,
      status: 'ac.inBakehouse',
      ready: Date.now() + (lines.some(l => l.kind === 'cake') ? 864e5 * 2 : 12e5),
    };
    const all = orders(); all.unshift(order); write(scope(K.orders), all);
    if (current()) updateProfile({ points: (current().points || 0) + Math.floor(tot.total) });
    clearCart(); emit('order', order);
    return order;
  }

  /* ======================================================= SAVED RECIPES */
  const saved = () => cloud ? cache.saved : read(scope(K.saved), []);

  async function saveRecipe(r) {
    if (cloud) {
      if (!authUser) throw new Error(t('st.saveLogin'));
      const row = await Backend.insertRecipe(authUser.id, r);
      cache.saved.unshift(normRecipe(row));
      emit('saved', cache.saved);
      return cache.saved;
    }
    const all = saved();
    all.unshift({ ...r, id: uid(), at: Date.now() });
    write(scope(K.saved), all); emit('saved', all);
    return all;
  }

  async function deleteRecipe(id) {
    if (cloud) {
      cache.saved = cache.saved.filter(r => r.id !== id);
      emit('saved', cache.saved);
      Backend.deleteRecipe(id).catch(e => console.warn(e.message));
      return;
    }
    const all = saved().filter(r => r.id !== id);
    write(scope(K.saved), all); emit('saved', all);
  }

  const money = n => I18N.money(n);

  return {
    on, emit, uid, money, boot, isCloud,
    signup, login, logout, current, updateProfile, initials,
    sendPhoneCode, verifyPhoneCode, oauth,
    cart, addToCart, setQty, removeFromCart, clearCart, cartCount, totals,
    orders, placeOrder,
    saved, saveRecipe, deleteRecipe,
  };
})();
