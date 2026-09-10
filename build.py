# Generates the six HTML pages from one shared shell.
FONTS = ("https://fonts.googleapis.com/css2?"
  "family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700"
  "&family=Inter:wght@400;500;600;700"
  "&family=Amiri:ital,wght@0,400;0,700;1,400"
  "&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700"
  "&family=Great+Vibes&family=Playfair+Display:wght@500;600;700"
  "&family=Bebas+Neue&family=Caveat:wght@500;600;700"
  "&family=Cinzel:wght@500;600&family=Pacifico"
  "&family=Reem+Kufi:wght@500;600&family=Aref+Ruqaa:wght@400;700&display=swap")

HEAD = """<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#FDF7E4">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='19' fill='%234C2D1F'/%3E%3Cpath d='M20 9c5.5 2.4 8.5 6.4 8.5 11 0 4.9-3.8 8.9-8.5 8.9s-8.5-4-8.5-8.9C11.5 15.4 14.5 11.4 20 9z' fill='%23B8794B'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="FONTS" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body data-page="{page}">
<main>
""".replace("FONTS", FONTS)

FOOT = """</main>
<script src="js/i18n.js"></script>
<script src="js/config.js"></script>
<script src="js/email.js"></script>
<script src="js/backend.js"></script>
<script src="js/photos.js"></script>
<script src="js/data.js"></script>
<script src="js/store.js"></script>
<script src="js/ui.js"></script>
<script src="js/globe.js"></script>
<script src="js/reviews.js"></script>
<script src="js/studio.js"></script>
<script src="js/pages.js"></script>
</body>
</html>
"""

def page(name, title, desc, key, body):
    open(name, "w").write(HEAD.format(title=title, desc=desc, page=key) + body + FOOT)

# ------------------------------------------------------------------ HOME
page("index.html",
  "Ember &amp; Crumb — Roastery &amp; Bakehouse, Kuwait",
  "A small-batch coffee roastery and bakehouse in Zahra, Kuwait. Buy beans, syrups and baking supplies, order from the menu, or design your own drink, cake and cookie in the Studio.",
  "home", """
<section class="hero">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow" data-i18n="h.eyebrow"></span>
      <h1 class="display"><span data-i18n="h.t1"></span><br><span data-i18n="h.t2"></span><br><em data-i18n="h.t3"></em></h1>
      <p class="lede" style="max-width:48ch" data-i18n="h.lede"></p>
      <div class="hero-cta">
        <a href="studio.html" class="btn btn-primary btn-lg"><span data-i18n="h.cta1"></span> <span class="arrow">→</span></a>
        <a href="menu.html" class="btn btn-ghost btn-lg" data-i18n="h.cta2"></a>
      </div>
      <div class="hero-stats">
        <div><b>20</b><span data-i18n="h.s1"></span></div>
        <div><b>60+</b><span data-i18n="h.s2"></span></div>
        <div><b>4am</b><span data-i18n="h.s3"></span></div>
        <div><b>48h</b><span data-i18n="h.s4"></span></div>
      </div>
    </div>

    <div class="hero-art" aria-hidden="true">
      <div class="hero-disc"></div>
      <svg class="spin-text" viewBox="0 0 300 300">
        <defs><path id="circ" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0"/></defs>
        <!-- One pass of the phrase, fitted to the circle with textLength. The
             string used to run twice round a 741-unit circle it needed ~1037
             for, so its tail overlapped its own head and read as garble. -->
        <text font-family="Inter,sans-serif" font-size="11.5" font-weight="600" fill="rgba(76,45,31,.32)">
          <textPath href="#circ" startOffset="0%" textLength="741.4" lengthAdjust="spacing">SMALL-BATCH ROASTERY · DAWN BAKEHOUSE · MAKE YOUR OWN · </textPath>
        </text>
      </svg>
      <img class="hero-cup" src="img/hero-strawmatcha.webp" alt=""
        width="441" height="700" decoding="async" fetchpriority="high">
      <div class="float-chip c1"><i style="background:#e5b3bb">🍓</i> <span data-i18n="h.chip1"></span></div>
      <div class="float-chip c2"><i style="background:#bcd4a5">🍵</i> <span data-i18n="h.chip2"></span></div>
      <div class="float-chip c3"><i style="background:#e0c9a3">🥛</i> <span data-i18n="h.chip3"></span></div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    <span data-i18n="m.1"></span><span data-i18n="m.2"></span><span data-i18n="m.3"></span>
    <span data-i18n="m.4"></span><span data-i18n="m.5"></span><span data-i18n="m.6"></span>
    <span data-i18n="m.1"></span><span data-i18n="m.2"></span><span data-i18n="m.3"></span>
    <span data-i18n="m.4"></span><span data-i18n="m.5"></span><span data-i18n="m.6"></span>
  </div>
</div>

<section class="band reveal">
  <img src="img/home/iced.webp" alt="" loading="lazy" decoding="async">
  <div class="band-inner">
    <span class="eyebrow no-rule" data-i18n="h.bandEyebrow"></span>
    <p data-i18n="h.bandLine"></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split reveal">
      <div>
        <span class="eyebrow" data-i18n="h.st.eyebrow"></span>
        <h2 class="h1" style="margin:1rem 0 1.25rem" data-i18n="h.st.title"></h2>
        <p class="lede" data-i18n="h.st.lede"></p>
        <p style="font-size:.95rem;line-height:1.7;margin-top:1.5rem">
          <b data-i18n="h.st.exTitle"></b> <span data-i18n="h.st.exBody"></span></p>
        <div class="hero-cta">
          <a href="studio.html" class="btn btn-primary"><span data-i18n="h.st.cta1"></span> <span class="arrow">→</span></a>
          <a href="studio.html#cake" class="btn btn-ghost" data-i18n="h.st.cta2"></a>
          <a href="studio.html#cookie" class="btn btn-ghost" data-i18n="h.st.cta3"></a>
        </div>
      </div>
      <div class="split-media">
        <img src="img/home/table.webp" alt="" loading="lazy" decoding="async"
          style="width:100%;height:100%;object-fit:cover;display:block">
      </div>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow" data-i18n="h.how"></span>
        <h2 class="h2" style="margin-top:1rem" data-i18n="h.howTitle"></h2></div>
    </div>
    <div class="steps">
      <div class="step reveal"><h3 data-i18n="h.step1t"></h3><p data-i18n="h.step1b"></p></div>
      <div class="step reveal"><h3 data-i18n="h.step2t"></h3><p data-i18n="h.step2b"></p></div>
      <div class="step reveal"><h3 data-i18n="h.step3t"></h3><p data-i18n="h.step3b"></p></div>
    </div>
  </div>
</section>

<section class="section-tight shot-sec">
  <div class="wrap">
    <div class="phone-stage reveal">
      <div class="phone">
        <div class="phone-screen">
          <img class="phone-shot" src="img/home/camera.webp" alt="" loading="lazy" decoding="async">
          <!-- the shot was taken with the camera UI showing; the rest of the
               chrome is drawn so the screen reads as the live viewfinder -->
          <div class="cam-top" aria-hidden="true">
            <span class="cam-dot"></span><span class="cam-flash">⚡</span><span class="cam-live">LIVE</span>
          </div>
          <div class="cam-bottom" aria-hidden="true">
            <div class="cam-modes"><span>VIDEO</span><span class="on">PHOTO</span><span>PORTRAIT</span></div>
            <div class="cam-row">
              <span class="cam-thumb"></span>
              <span class="cam-shutter"></span>
              <span class="cam-flip"></span>
            </div>
          </div>
        </div>
        <img class="phone-frame" src="img/home/phone.webp" alt="" loading="lazy" decoding="async">
      </div>
      <div class="phone-copy">
        <span class="eyebrow no-rule" data-i18n="h.shotEyebrow"></span>
        <h2 data-i18n="h.shotTitle"></h2>
        <p data-i18n="h.shotBody"></p>
      </div>
    </div>
  </div>
</section>

<section class="section-tight gallery-sec" id="collage">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow" data-i18n="h.cgEyebrow"></span>
        <h2 class="h2" style="margin-top:1rem" data-i18n="h.cgTitle"></h2></div>
    </div>
    <div id="collageRoot"></div>
  </div>
</section>

<section class="section-tight" id="monthly">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow" data-i18n="mo.eyebrow"></span>
        <h2 class="h2" style="margin-top:1rem" data-i18n="mo.title"></h2>
        <p class="lede" data-i18n="mo.lede"></p></div>
    </div>
    <div id="monthlyRoot"></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow" data-i18n="h.bar"></span>
        <h2 class="h2" style="margin-top:1rem" data-i18n="h.barTitle"></h2>
        <p class="lede" data-i18n="h.barLede"></p></div>
      <a href="menu.html" class="btn btn-ghost"><span data-i18n="c.fullMenu"></span> <span class="arrow">→</span></a>
    </div>
    <div class="grid g4" id="homeDrinks"></div>
  </div>
</section>

<section class="quote-band section-tight">
  <div class="wrap-narrow center reveal">
    <span class="eyebrow no-rule">Bazaar</span>
    <p class="quote" style="margin-top:1.25rem" data-i18n="h.quote"></p>
    <p class="quote-by" data-i18n="h.quoteBy"></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow" data-i18n="h.roast"></span>
        <h2 class="h2" style="margin-top:1rem" data-i18n="h.roastTitle"></h2>
        <p class="lede" data-i18n="h.roastLede"></p></div>
      <a href="shop.html" class="btn btn-ghost"><span data-i18n="c.shopAll"></span> <span class="arrow">→</span></a>
    </div>
    <div class="grid g4" id="homeBeans"></div>
  </div>
</section>

<section class="section-tight" style="padding-bottom:clamp(4rem,9vw,7rem)">
  <div class="wrap">
    <div class="split reverse reveal">
      <div class="split-media hero-shot shot-caption" id="heroShot" style="aspect-ratio:4/5">
        <div class="shot-body">
          <div class="eyebrow no-rule" data-i18n="h.openDaily"></div>
          <p class="shot-hours">7am<br>— 11pm</p>
          <p class="shot-where" data-i18n="v.eyebrow"></p>
        </div>
      </div>
      <div>
        <span class="eyebrow" data-i18n="h.comeIn"></span>
        <h2 class="h1" style="margin:1rem 0 1.25rem" data-i18n="h.comeTitle"></h2>
        <p class="lede" data-i18n="h.comeBody"></p>
        <div class="hero-cta">
          <a href="visit.html" class="btn btn-primary"><span data-i18n="h.comeCta1"></span> <span class="arrow">→</span></a>
          <a href="visit.html#classes" class="btn btn-ghost" data-i18n="h.comeCta2"></a>
        </div>
      </div>
    </div>
  </div>
</section>
""")

# ---------------------------------------------------------------- STUDIO
page("studio.html",
  "The Studio — Design your own · Ember &amp; Crumb",
  "Build a drink, a layer cake or a lettered cookie ingredient by ingredient and watch it draw itself.",
  "studio", """
<section class="page-head">
  <div class="hero-glow" style="top:-34vw;inset-inline-start:-18vw" aria-hidden="true"></div>
  <div class="wrap center">
    <span class="eyebrow no-rule" data-i18n="st.eyebrow"></span>
    <h1 class="h1" style="margin:1rem auto 1.1rem;max-width:22ch" data-i18n="st.title"></h1>
    <p class="lede" style="margin-inline:auto;max-width:60ch" data-i18n="st.lede"></p>
    <div style="margin-top:2rem">
      <div class="studio-tabs" role="tablist">
        <button class="studio-tab active" data-mode="drink" role="tab"><span data-i18n="st.tabDrink"></span></button>
        <button class="studio-tab" data-mode="cake" role="tab"><span data-i18n="st.tabCake"></span></button>
        <button class="studio-tab" data-mode="cookie" role="tab"><span data-i18n="st.tabCookie"></span></button>
      </div>
    </div>
  </div>
</section>

<section style="padding-bottom:clamp(4rem,8vw,6.5rem)">
  <div class="wrap studio">
    <div class="studio-stage">
      <div class="stage-card">
        <div class="stage-viz" id="stageViz"></div>
        <div class="eyebrow no-rule" data-i18n="st.yours"></div>
        <h2 class="stage-name" id="stageName" style="margin-top:.4rem"></h2>
        <p class="stage-recipe" id="stageRecipe"></p>
        <div class="stage-meta">
          <div class="stage-price" id="stagePrice"></div>
          <div class="small muted" style="text-align:end;line-height:1.4" id="stageLead"></div>
        </div>
        <div class="stage-actions">
          <button class="btn btn-primary btn-lg btn-block" id="addBtn" data-i18n="st.addOrder"></button>
          <div class="row">
            <button class="btn btn-ghost btn-sm" id="saveBtn" data-i18n="st.saveRecipe"></button>
            <button class="btn btn-ghost btn-sm" id="surpriseBtn" data-i18n="st.surprise"></button>
          </div>
        </div>
      </div>
      <p class="small muted center" style="margin-top:1rem;line-height:1.6" data-i18n="st.footNote"></p>
    </div>
    <div id="optPanel"></div>
  </div>
</section>
""")

# ------------------------------------------------------------------ MENU
page("menu.html",
  "Menu — Coffee, pastry and cakes · Ember &amp; Crumb",
  "Signature lattes, nitro cold brew, Arabic qahwa, matcha, morning pastry, cookies and cakes from our Zahra bakehouse.",
  "menu", """
<section class="page-head">
  <div class="wrap">
    <span class="eyebrow" data-i18n="mn.eyebrow"></span>
    <h1 class="h1" data-i18n="mn.title"></h1>
    <p class="lede"><span data-i18n="mn.ledeA"></span>
      <a href="studio.html" class="btn-link" data-i18n="mn.ledeB"></a>.</p>
  </div>
</section>

<div class="sticky-bar">
  <div class="wrap row between row-wrap" style="gap:1rem">
    <div class="filter-bar" id="menuFilters"></div>
    <span class="small muted" id="menuCount"></span>
  </div>
</div>

<section class="section-tight"><div class="wrap"><div id="menuSections"></div></div></section>

<section class="section-tight" style="padding-bottom:clamp(4rem,8vw,6rem)">
  <div class="wrap">
    <div class="split reveal" style="align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-xl);padding:clamp(1.75rem,4vw,3.25rem);gap:clamp(1.5rem,4vw,3rem)">
      <div>
        <span class="eyebrow" data-i18n="mn.ctaEyebrow"></span>
        <h2 class="h2" style="margin:1rem 0 1rem" data-i18n="mn.ctaTitle"></h2>
        <p class="lede" data-i18n="mn.ctaBody"></p>
        <div class="hero-cta"><a href="studio.html" class="btn btn-primary"><span data-i18n="h.cta1"></span> <span class="arrow">→</span></a></div>
      </div>
      <div style="display:grid;gap:.6rem;grid-template-columns:1fr 1fr">
        <div class="opt on" style="pointer-events:none"><span class="swatch" style="background:#d4586a"></span><span class="opt-txt"><span class="opt-name">Strawberry Powder</span></span></div>
        <div class="opt on" style="pointer-events:none"><span class="swatch" style="background:#7ea24f"></span><span class="opt-txt"><span class="opt-name">Ceremonial Matcha</span></span></div>
        <div class="opt on" style="pointer-events:none"><span class="swatch sq" style="background:#e9d3a5"></span><span class="opt-txt"><span class="opt-name">Lady Fingers</span></span></div>
        <div class="opt on" style="pointer-events:none"><span class="swatch sq" style="background:#E3B45E"></span><span class="opt-txt"><span class="opt-name">Saffron Honey</span></span></div>
      </div>
    </div>
  </div>
</section>
""")

# ------------------------------------------------------------------ SHOP
page("shop.html",
  "Shop — Beans, syrups &amp; baking supplies · Ember &amp; Crumb",
  "Coffee roasted in Zahra with a 3D origin globe and a brewing-method finder, plus the house syrups, creams, flour and tools our own bakers use.",
  "shop", """
<section class="page-head">
  <div class="wrap">
    <span class="eyebrow" data-i18n="sh.eyebrow"></span>
    <h1 class="h1" data-i18n="sh.title"></h1>
    <p class="lede" data-i18n="sh.lede"></p>
  </div>
</section>

<section class="section-tight" style="padding-top:0">
  <div class="wrap">
    <div class="section-head" style="margin-bottom:1.5rem">
      <div><span class="eyebrow" data-i18n="bf.eyebrow"></span>
        <h2 class="h2" style="margin-top:.9rem" data-i18n="bf.title"></h2>
        <p class="lede" data-i18n="bf.lede"></p></div>
    </div>
    <div id="beanFinder"></div>
    <div id="methodCard"></div>
    <div style="margin:1.5rem 0 .75rem">
      <span class="label" data-i18n="bf.mapTitle"></span>
      <p class="small muted" style="max-width:70ch;margin-top:.35rem" data-i18n="bf.mapLede"></p>
    </div>
    <div class="globe-wrap" id="globeWrap">
      <button class="btn btn-quiet globe-reset" id="globeReset" data-i18n="bf.reset"></button>
      <span class="globe-hint" data-i18n="bf.spin"></span>
    </div>
  </div>
</section>

<div class="sticky-bar">
  <div class="wrap row between row-wrap" style="gap:1rem">
    <div class="filter-bar" id="shopFilters"></div>
    <span class="small muted" id="shopCount"></span>
  </div>
</div>

<section class="section-tight">
  <div class="wrap">
    <div id="beansSection">
      <h2 class="h3" style="margin-bottom:1.25rem" data-i18n="sh.beansHead"></h2>
      <div class="grid g4" id="beanGrid"></div>
    </div>
    <div id="syrupSection" style="margin-top:3.25rem">
      <h2 class="h3" data-i18n="sh.syrupHead"></h2>
      <p class="small muted" style="margin:.4rem 0 1.25rem;max-width:70ch" data-i18n="sh.syrupNote"></p>
      <div class="grid g4" id="syrupGrid"></div>
    </div>
    <div id="suppliesSection" style="margin-top:3.25rem">
      <h2 class="h3" style="margin-bottom:1.25rem" data-i18n="sh.suppliesHead"></h2>
      <div class="grid g4" id="supplyGrid"></div>
    </div>
  </div>
</section>

<section class="section-tight" style="padding-bottom:clamp(4rem,8vw,6rem)">
  <div class="wrap">
    <div class="grid g3">
      <div class="step reveal"><h3 data-i18n="sh.p1t"></h3><p data-i18n="sh.p1b"></p></div>
      <div class="step reveal"><h3 data-i18n="sh.p2t"></h3><p data-i18n="sh.p2b"></p></div>
      <div class="step reveal"><h3 data-i18n="sh.p3t"></h3><p><span data-i18n="sh.p3b"></span>
        <a href="visit.html#wholesale" class="btn-link" data-i18n="sh.talk"></a>.</p></div>
    </div>
  </div>
</section>
""")

# --------------------------------------------------------------- ACCOUNT
page("account.html",
  "Account · Ember &amp; Crumb",
  "Log in to keep your saved Studio recipes, see your order history and collect crumbs on every order.",
  "account", """
<section class="page-head" id="acctHead"><div class="wrap"></div></section>
<section style="padding-bottom:clamp(4rem,8vw,6.5rem)"><div class="wrap" id="acctRoot"></div></section>
""")

# ----------------------------------------------------------------- VISIT
page("visit.html",
  "Visit — Hours, classes &amp; wholesale · Ember &amp; Crumb",
  "Zahra, Kuwait. Hours, baking classes, wholesale coffee and answers about custom cake orders.",
  "visit", """
<section class="page-head">
  <div class="hero-glow" style="top:-30vw" aria-hidden="true"></div>
  <div class="wrap">
    <span class="eyebrow" data-i18n="v.eyebrow"></span>
    <h1 class="h1" data-i18n="v.title"></h1>
    <p class="lede" data-i18n="v.lede"></p>
  </div>
</section>

<section class="section-tight" id="hours">
  <div class="wrap grid g3">
    <div class="card reveal" style="padding:1.75rem"><span class="eyebrow no-rule" data-i18n="v.hours"></span>
      <div class="stack-sm" style="margin-top:1rem;font-size:.92rem">
        <div class="row between"><span data-i18n="v.satWed"></span><b>7am – 11pm</b></div>
        <div class="row between"><span data-i18n="v.thu"></span><b>7am – 1am</b></div>
        <div class="row between"><span data-i18n="v.fri"></span><b>1pm – 1am</b></div>
        <div class="row between muted"><span data-i18n="v.roastDays"></span><span data-i18n="v.roastWhen"></span></div>
      </div></div>
    <div class="card reveal" style="padding:1.75rem"><span class="eyebrow no-rule" data-i18n="v.find"></span>
      <p style="margin-top:1rem;font-size:.92rem;line-height:1.8"><span data-i18n="v.eyebrow"></span><br><br>
        <a href="tel:+96522212016" class="btn-link" dir="ltr">+965 2221 2016</a><br>
        <a href="mailto:hello@emberandcrumb.test" class="btn-link" dir="ltr">hello@emberandcrumb.test</a></p></div>
    <div class="card reveal" style="padding:1.75rem"><span class="eyebrow no-rule" data-i18n="v.good"></span>
      <p style="margin-top:1rem;font-size:.92rem;line-height:1.75" data-i18n="v.goodBody"></p></div>
  </div>
</section>

<section class="section-tight" id="classes">
  <div class="wrap">
    <div class="split reveal">
      <div class="split-media" style="background:linear-gradient(160deg,#EDE3CD,#C9A97F);display:grid;place-items:center;aspect-ratio:4/3">
        <span style="font-family:var(--serif);font-size:clamp(2.5rem,6vw,4.5rem);color:rgba(76,45,31,.24);letter-spacing:-.04em">9:00</span>
      </div>
      <div>
        <span class="eyebrow" data-i18n="v.classes"></span>
        <h2 class="h2" style="margin:1rem 0 1.1rem" data-i18n="v.classesTitle"></h2>
        <p class="lede" data-i18n="v.classesBody"></p>
        <ul class="stack-sm" style="margin-top:1.5rem;font-size:.92rem">
          <li class="row between" style="border-bottom:1px solid var(--line);padding-bottom:.6rem"><span>Croissants from scratch · 3 hrs</span><span class="price">KD 28.000</span></li>
          <li class="row between" style="border-bottom:1px solid var(--line);padding-bottom:.6rem"><span>Tiramisù, four ways · 2 hrs</span><span class="price">KD 21.000</span></li>
          <li class="row between" style="border-bottom:1px solid var(--line);padding-bottom:.6rem"><span>Cookie decorating · 2 hrs</span><span class="price">KD 18.000</span></li>
          <li class="row between"><span>Home espresso, dialled in · 2 hrs</span><span class="price">KD 20.000</span></li>
        </ul>
        <div class="hero-cta"><button class="btn btn-primary" data-toast="v.waitToast" data-i18n="v.waitlist"></button></div>
      </div>
    </div>
  </div>
</section>

<section class="section-tight" id="wholesale">
  <div class="wrap">
    <div class="split reverse reveal">
      <div class="split-media" style="background:linear-gradient(200deg,#4C2D1F,#6B4430);display:grid;place-items:center;aspect-ratio:4/3">
        <span style="font-family:var(--serif);font-size:clamp(2.5rem,6vw,4rem);color:rgba(253,247,228,.18);letter-spacing:-.04em">12</span>
      </div>
      <div>
        <span class="eyebrow" data-i18n="v.wholesale"></span>
        <h2 class="h2" style="margin:1rem 0 1.1rem" data-i18n="v.wsTitle"></h2>
        <p class="lede" data-i18n="v.wsBody"></p>
        <div class="hero-cta"><a href="mailto:wholesale@emberandcrumb.test" class="btn btn-ghost" dir="ltr">wholesale@emberandcrumb.test</a></div>
      </div>
    </div>
  </div>
</section>

<section class="section-tight" id="faq" style="padding-bottom:clamp(4rem,8vw,6rem)">
  <div class="wrap-narrow">
    <span class="eyebrow" data-i18n="v.faqEyebrow"></span>
    <h2 class="h2" style="margin:1rem 0 2rem" data-i18n="v.faqTitle"></h2>
    <div class="stack">
      <div class="card" style="padding:1.4rem 1.6rem"><b data-i18n="v.q1"></b>
        <p class="muted small" style="margin-top:.5rem;line-height:1.7" data-i18n="v.a1"></p></div>
      <div class="card" style="padding:1.4rem 1.6rem"><b data-i18n="v.q2"></b>
        <p class="muted small" style="margin-top:.5rem;line-height:1.7" data-i18n="v.a2"></p></div>
      <div class="card" style="padding:1.4rem 1.6rem"><b data-i18n="v.q3"></b>
        <p class="muted small" style="margin-top:.5rem;line-height:1.7" data-i18n="v.a3"></p></div>
      <div class="card" style="padding:1.4rem 1.6rem"><b data-i18n="v.q4"></b>
        <p class="muted small" style="margin-top:.5rem;line-height:1.7" data-i18n="v.a4"></p></div>
    </div>
  </div>
</section>
""")
print("6 pages written")
