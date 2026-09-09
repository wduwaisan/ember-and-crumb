/* ==========================================================================
   Ember & Crumb — Supabase gateway
   Every network call the site makes lives here. Nothing else imports the
   Supabase SDK, so switching backend (or removing it) touches one file.
   ========================================================================== */
const Backend = (() => {
  const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  let sb = null, ready = null;

  const enabled = () => !!EC_CONFIG.enabled;

  /* The SDK is only fetched when Supabase is actually configured, so an
     unconfigured site stays genuinely dependency-free. */
  function loadSDK() {
    if (window.supabase?.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SDK; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Could not load the Supabase library.'));
      document.head.append(s);
    });
  }

  function init() {
    if (!enabled()) return Promise.resolve(null);
    if (ready) return ready;
    ready = loadSDK().then(() => {
      sb = window.supabase.createClient(EC_CONFIG.supabaseUrl, EC_CONFIG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      return sb;
    }).catch(err => { console.warn('[Ember & Crumb] Supabase unavailable:', err.message); sb = null; return null; });
    return ready;
  }

  const client = () => sb;
  const need = () => { if (!sb) throw new Error(t('sb.offline')); return sb; };

  /* Supabase surfaces a lot of internal wording. Translate the few that a
     guest can actually trigger, and pass anything else through. */
  function humanise(err) {
    const m = (err?.message || '').toLowerCase();
    if (m.includes('invalid login credentials')) return t('err.creds');
    if (m.includes('user already registered')) return t('err.exists');
    if (m.includes('password should be at least')) return t('err.pw');
    if (m.includes('unable to validate email')) return t('err.email');
    if (m.includes('email not confirmed')) return t('sb.confirmFirst');
    if (m.includes('provider is not enabled')) return t('sb.providerOff');
    if (m.includes('invalid token') || m.includes('token has expired')) return t('sb.badCode');
    if (m.includes('sms') || m.includes('phone provider')) return t('sb.smsOff');
    if (m.includes('over_email_send_rate_limit') || m.includes('rate limit')) return t('sb.rateLimit');
    return err?.message || t('sb.generic');
  }
  const boom = err => { throw new Error(humanise(err)); };

  /* ============================================================== AUTH */
  async function signUpEmail({ name, email, password }) {
    const { data, error } = await need().auth.signUp({
      email, password,
      options: { data: { display_name: name }, emailRedirectTo: location.origin },
    });
    if (error) boom(error);
    /* With "Confirm email" on, there is a user but no session yet. */
    return { user: data.user, session: data.session, needsConfirm: !data.session };
  }

  async function signInEmail({ email, password }) {
    const { data, error } = await need().auth.signInWithPassword({ email, password });
    if (error) boom(error);
    return { user: data.user, session: data.session };
  }

  async function sendPhoneCode({ phone, name }) {
    const { error } = await need().auth.signInWithOtp({
      phone, options: { data: name ? { display_name: name } : undefined },
    });
    if (error) boom(error);
    return true;
  }

  async function verifyPhoneCode({ phone, code }) {
    const { data, error } = await need().auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) boom(error);
    return { user: data.user, session: data.session };
  }

  /* OAuth navigates away and returns to the page it started from. */
  async function signInOAuth(provider) {
    const { error } = await need().auth.signInWithOAuth({
      provider, options: { redirectTo: location.href.split('#')[0] },
    });
    if (error) boom(error);
  }

  async function signOut() { if (sb) await sb.auth.signOut(); }
  async function session() { return sb ? (await sb.auth.getSession()).data.session : null; }
  const onAuth = cb => sb?.auth.onAuthStateChange((_e, s) => cb(s));

  /* =========================================================== PROFILE */
  async function getProfile(uid) {
    const { data, error } = await need().from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) boom(error);
    return data;
  }
  async function updateProfile(uid, patch) {
    /* crumbs is column-revoked, so only these two can ever be sent. */
    const safe = {};
    if ('display_name' in patch) safe.display_name = patch.display_name;
    if ('usual' in patch) safe.usual = patch.usual;
    if (!Object.keys(safe).length) return;
    const { error } = await need().from('profiles').update(safe).eq('id', uid);
    if (error) boom(error);
  }

  /* ============================================================ ORDERS */
  async function getOrders(uid) {
    const { data, error } = await need().from('orders')
      .select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(100);
    if (error) boom(error);
    return data || [];
  }
  async function insertOrder(uid, o) {
    const { data, error } = await need().from('orders').insert({
      user_id: uid, code: o.code, lines: o.lines,
      subtotal: o.subtotal, service: o.service, total: o.total,
      fulfilment: o.fulfilment, notes: o.notes || null,
    }).select().single();
    if (error) boom(error);
    return data;
  }

  /* =========================================================== RECIPES */
  async function getRecipes(uid) {
    const { data, error } = await need().from('recipes')
      .select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (error) boom(error);
    return data || [];
  }
  async function insertRecipe(uid, r) {
    const { data, error } = await need().from('recipes').insert({
      user_id: uid, name: r.name, meta: r.meta, price: r.price,
      kind: r.kind, c1: r.c1, c2: r.c2, recipe: r.recipe,
    }).select().single();
    if (error) boom(error);
    return data;
  }
  async function deleteRecipe(id) {
    const { error } = await need().from('recipes').delete().eq('id', id);
    if (error) boom(error);
  }

  /* ============================================================== CART */
  async function getCart(uid) {
    const { data, error } = await need().from('carts').select('lines').eq('user_id', uid).maybeSingle();
    if (error) boom(error);
    return data?.lines || [];
  }
  async function saveCart(uid, lines) {
    const { error } = await need().from('carts')
      .upsert({ user_id: uid, lines, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) boom(error);
  }

  /* =========================================================== REVIEWS */
  /* Read from the view: it carries no user_id, so anonymity holds. */
  async function getReviews(productIds) {
    let q = need().from('reviews_public').select('*').order('created_at', { ascending: false });
    if (productIds?.length) q = q.in('product_id', productIds);
    const { data, error } = await q.limit(1000);
    if (error) boom(error);
    return data || [];
  }
  /* ...but read your OWN rows from the base table, so the site knows which
     review is yours to edit even when it is posted anonymously. */
  async function getMyReviews(uid) {
    const { data, error } = await need().from('reviews').select('*').eq('user_id', uid);
    if (error) boom(error);
    return data || [];
  }
  async function upsertReview(uid, r) {
    const { data, error } = await need().from('reviews').upsert({
      user_id: uid, product_id: r.product_id, display_name: r.display_name,
      anon: r.anon, stars: r.stars, body: r.body,
    }, { onConflict: 'product_id,user_id' }).select().single();
    if (error) boom(error);
    return data;
  }
  async function deleteReview(id) {
    const { error } = await need().from('reviews').delete().eq('id', id);
    if (error) boom(error);
  }

  return {
    enabled, init, client, humanise,
    signUpEmail, signInEmail, sendPhoneCode, verifyPhoneCode, signInOAuth, signOut, session, onAuth,
    getProfile, updateProfile,
    getOrders, insertOrder,
    getRecipes, insertRecipe, deleteRecipe,
    getCart, saveCart,
    getReviews, getMyReviews, upsertReview, deleteReview,
  };
})();
