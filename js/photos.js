/* ==========================================================================
   Ember & Crumb — photography
   --------------------------------------------------------------------------
   Two sources, in this order:

   1. Ember & Crumb's own brand shots, committed to img/menu as transparent
      WebP. Every menu item and every bag of beans has one. See CUTOUTS below.
   2. Unsplash, for the home-page mood boards and as the fallback for anything
      without a brand shot. Its licence allows free use for any purpose
      including commercial, with no attribution required. That matters: this
      site is deployed at a public URL, and images lifted from Pinterest or a
      mood-board blog would be someone else's copyrighted work sitting on it.

   Images are hotlinked from the Unsplash CDN, which they support and which
   keeps the repository light — no binaries in git. Each URL asks for exactly
   the width it will be shown at, so a menu thumbnail does not download a
   4000px original.

   Every id below was verified to load before being committed.
   ========================================================================== */
const Photos = (() => {
  const CDN = 'https://images.unsplash.com/photo-';

  /* w = rendered width in CSS px; the 2x is for retina. */
  const url = (id, w = 600, ratio = null) => {
    const p = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(Math.round(w * 2)), q: '72' });
    if (ratio) p.set('ar', ratio);
    return `${CDN}${id}?${p}`;
  };

  /* ------------------------------------------------------- per menu item */
  const ITEM = {
    /* --- from the bar --- */
    'd-nitro':        '1765510758735-634710ac4863',
    'd-nitrosweet':   '1559496417-e7f25cb247f3',
    'd-espresso':     '1610889556528-9a770e32642f',
    'd-cortado':      '1512568400610-62da28bc8a13',
    'd-flat':         '1593443320739-77f74939d0da',
    'd-tonic':        '1517701550927-30cf4ba1dba5',
    'd-cinn':         '1529892485617-25f63cd7b1e9',
    'd-banana':       '1541167760496-1628856ab772',
    'd-rcc':          '1562447457-579fc34967fb',
    'd-strawmatcha':  '1717398804885-a6c22b3e5c2f',
    'd-ginger':       '1636920272028-c27f1ae474c3',
    'd-rosecard':     '1559001724-fbad036dbc9e',
    'd-datelatte':    '1787980394419-018cc922da16',
    'd-lav':          '1503240778100-fd245e17a273',
    'd-blue':         '1717603545758-88cc454db69b',
    'd-matcha':       '1515823064-d6e0c04616a7',
    'd-hoji':         '1582785513054-8d1bf9d69c1a',
    'd-qahwa':        '1650097364104-eef0e54af0da',
    'd-chai':         '1579265898841-79c7890d69cf',
    'd-wafer':        '1780798465826-75f91b802421',
    'd-choc':         '1637572815755-c4b80092dce1',

    /* --- pastry case --- */
    'p-croissant':    '1691480162735-9b91238080f6',
    'p-pain':         '1483695028939-5bb13f8648b0',
    'p-morning':      '1530610476181-d83430b64dcd',
    'p-kouign':       '1652101270782-7b9187a6dafb',
    'p-pistachio':    '1567891026259-c133718572a4',
    'p-scone':        '1599125816289-736f5025fc05',
    'p-date':         '1662747923676-8151ebe0e101',

    /* --- cookies --- */
    'k-brownbutter':  '1558961363-fa8fdf82db35',
    'k-datecard':     '1499636136210-6f4ee915583e',
    'k-rose':         '1597733153203-a54d0fbc47de',
    'k-iced':         '1583743089695-4b816a340f82',
    'k-box12':        '1557310717-d6bea9f36682',

    /* --- cakes --- */
    'c-tiramisu':     '1517427294546-5aa121f68e8a',
    'c-strawmatcha':  '1602663491496-73f07481dbea',
    'c-basque':       '1623659194932-2029be969235',
    'c-pistachio':    '1575919361890-69028a013637',
    'c-olive':        '1619985632461-f33748ef8f3e',
    'c-black':        '1582716401301-b2407dc7563d',
    'c-lemon':        '1565685715007-06f2c4c44d19',

    /* --- beans --- */
    'b-ember':        '1447933601403-0c6688de566e',
    'b-nitro':        '1513530176992-0cf39c4cbed4',
    'b-yirg':         '1587734195503-904fca47e0e9',
    'b-geisha':       '1606486544554-164d98da4889',
    'b-sumatra':      '1551610290-e153ec567dd8',
    'b-yemen':        '1580933073521-dc49ac0d4e6a',
    'b-qahwa':        '1524350876685-274059332603',
    'b-costa':        '1612487458970-564127ec86f5',
  };

  /* ------------------------------------------ the mood boards on the home page */
  const MOOD = {
    hero:     '1613274554329-70f997f5789f',
    counter:  '1583354608715-177553a4035e',
    window:   '1579341560277-4dfaddaf6e98',
    hands:    '1572231086568-6984943e6629',
    beans:    '1447933601403-0c6688de566e',
    pour:     '1531441802565-2948024f1b22',
    pastry:   '1571157577110-493b325fdd3d',
    crema:    '1541779972238-2c60cd11ffc5',
    matcha:   '1631308491952-040f80133535',
    room:     '1598959652545-c0230cdbb01f',
    table:    '1624583338957-4d155ca886dc',
    warm:     '1621343607959-5d11ff0f1e39',
    grinder:  '1633073490205-27c0ad419a84',
    cookies:  '1612845575953-f4b1e3d63160',
    slice:    '1536749605762-e7445a2d43ec',
  };

  /* Transparent brand shots committed to img/menu as WebP — Ember & Crumb's
     own product photography and bag artwork, not stock. WebP because the set
     is 52 images: as PNG it came to 11MB, as WebP it is 2.3MB with the same
     8-bit alpha, which the soft drop shadows need.

     Listed explicitly rather than derived from an id prefix, so an item with
     no artwork falls back to its Unsplash photo instead of 404ing. */
  const CUTOUTS = new Set([
    'b-costa','b-decaf','b-ember','b-espresso','b-geisha','b-kenya','b-nitro','b-png',
    'b-qahwa','b-sumatra','b-yemen','b-yirg','c-basque','c-black','c-lemon','c-olive',
    'c-pistachio','c-strawmatcha','c-tiramisu','d-banana','d-blue','d-chai','d-choc',
    'd-cinn','d-cortado','d-datelatte','d-espresso','d-flat','d-ginger','d-hoji','d-lav',
    'd-matcha','d-nitro','d-nitrosweet','d-qahwa','d-rcc','d-rosecard','d-strawmatcha',
    'd-tonic','d-wafer','k-box12','k-brownbutter','k-datecard','k-iced','k-rose',
    'p-croissant','p-date','p-kouign','p-morning','p-pain','p-pistachio','p-scone'
  ]);
  const cutout = id => CUTOUTS.has(id) ? `img/menu/${id}.webp` : null;

  const has = id => !!ITEM[id];
  const forItem = (id, w) => ITEM[id] ? url(ITEM[id], w) : null;
  const mood = (key, w) => MOOD[key] ? url(MOOD[key], w) : null;

  /* A photo tile that fades up once decoded, over the item's own colours so
     there is never a white hole while it loads. */
  function tile(item, w, cls = '') {
    const cut = cutout(item.id);
    if (cut) {
      /* No placeholder gradient behind a cut-out: it would show through the
         transparency as a coloured rectangle, which is the thing we removed. */
      return `<img class="photo cut ${cls}" src="${cut}" alt="${esc(L(item))}"
        loading="lazy" decoding="async">`;
    }
    const src = forItem(item.id, w);
    if (!src) return null;
    return `<img class="photo ${cls}" src="${src}" alt="${esc(L(item))}"
      loading="lazy" decoding="async" width="${w}" height="${Math.round(w * 0.78)}"
      style="background:linear-gradient(150deg,${lighten(item.c1,.2)},${item.c2})">`;
  }

  return { url, forItem, mood, has, tile, cutout, ITEM, MOOD };
})();
