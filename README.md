# Ember & Crumb — Roastery & Bakehouse (Zahra, Kuwait)

A bilingual (English / العربية) coffee-roastery and bakery storefront with three
visual "make your own" builders — **drinks**, **cakes** and **lettered cookies** —
that draw your creation as you build it, price it live in Kuwaiti dinar, and send
it through as a recipe card the bar or bakehouse can follow.

## Run it

No build step, no dependencies. Any static server works:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. (Opening `index.html` straight from disk mostly
works, but browsers disable `crypto.subtle` on `file://`, so password hashing falls
back to a weaker function. Use a server.)

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Cinematic welcome, hero, the Studio pitch, **Recipe of the Month**, featured drinks and beans |
| `menu.html` | 20 drinks, pastry case, cookies, cakes by the slice or whole — filterable |
| `studio.html` | **The Studio** — three builders. `#cake` and `#cookie` open those tabs |
| `shop.html` | **Brew-method finder + 3D origin globe**, beans, house syrups, cake creams, baking supplies |
| `account.html` | Log in / sign up, order history, saved recipes, loyalty crumbs |
| `visit.html` | Hours, location, classes, wholesale, custom-order FAQ |

## Code layout

```
css/style.css   design tokens, components, all three preview renderers, RTL rules
js/globe.js     the 3-D origin globe: projection, spin, fly-to, hit testing
js/reviews.js   ratings and reviews: store, seed data, star rendering, panel
js/config.js    Supabase credentials + which sign-in providers are enabled
js/backend.js   the only file that talks to Supabase
js/email.js     email plausibility: keysmash, typo and fake-domain rejection
js/photos.js    the Unsplash photo map and the home-page mood board
supabase/       schema.sql (tables, RLS, triggers) and SETUP.md
js/i18n.js      the English/Arabic dictionary, direction switch and re-render bus
js/data.js      catalogue, ingredients, brew methods, world geometry, presets
js/store.js     accounts, cart, orders, saved recipes (localStorage)
js/ui.js        header, footer, cart drawer, auth modal, toasts, cinematic welcome
js/studio.js    the three builders: state, pricing, naming, live rendering
js/pages.js     home, menu, shop (map + finder) and account rendering
build.py        regenerates the six HTML files from one shared shell
stamp.sh        re-hashes the ?v= on asset links after you edit css/ or js/
```

Header, footer, cart drawer, auth modal and the welcome screen are injected by
`js/ui.js` on every page, so there is one copy rather than six that drift apart.

## The three builders

There are **no images anywhere in this project**. Every preview is plain DOM
elements coloured from the ingredient data, which is why adding a new syrup makes
it show up in the drawing with no other changes.

- **Drinks** — the cup is a `clip-path` silhouette; each ingredient adds a coloured
  band stacked bottom-up. Milk is tinted by the blend of syrups you chose, weighted
  by pump count. Matcha, hojicha, butterfly pea, strawberry powder and qahwa pour
  *on top of* the milk instead of under it, which is what makes a strawberry matcha
  look the way it does. Ice, foam, drizzles, dusting and the straw follow your picks.
- **Cakes** — a cross-section: sponge and filling alternate bottom-up, the sponge is
  tinted by whatever it is soaked in, and the exterior draws either as side walls
  plus a cap (frostings, glazes, drips) or as a thin dusting that still lets the
  layers show through (cocoa dust on a tiramisù).
- **Cookies** — the shape is an SVG path applied as a **CSS mask**, so dough, icing,
  border and scattered decorations are all clipped to the same silhouette (round,
  plaque, scalloped, heart, star, crescent, hexagon, arch). Your message is rendered
  live in whichever of the nine lettering styles you pick — six Latin (flowing
  script, classic serif, tall capitals, handwriting, engraved caps, retro round) and
  three Arabic (Amiri naskh, Reem Kufi, Aref Ruqaa) — in the ink colour and size you
  choose. What you see is the cookie you get.

## Screen transitions, cursor glow, and the welcome

Every page arrives deliberately: a cream veil lifts while the header drops in and the
first block of content rises in sequence (`runScreenIn` in `js/ui.js`). Clicking an
internal link fades the current screen out first, so pages hand over rather than
blink. On the home page the cinematic welcome plays first and the page entrance is
chained to its dismissal, so the two never fight.

A small warm toffee glow trails the pointer — 150 px at rest, tightening to about
100 px and brightening over anything clickable, and contracting further on press. It only exists on fine
pointers (never on touch) and is removed entirely under `prefers-reduced-motion`,
along with the veil and every staged entrance.

## The bean finder and origin globe

`shop.html` asks what you will brew with before it shows you anything. Pick one of
eight methods — espresso, dallah/Turkish, V60, Chemex, French press, moka, AeroPress,
cold brew — and the page shows the grind and the recipe we use, then narrows the bean
list to the ones that actually suit it. Ask for the dallah and you get the Yemeni
Mokha Matari and the blonde qahwa roast; ask for a V60 and you get the washed and
anaerobic lots.

Beside it sits a **3-D globe** — a real orthographic projection drawn on canvas from
the coarse `[lon, lat]` outlines in `LANDMASS` (`js/data.js`), with a lit limb, a
graticule, the Coffee Belt shaded across the tropics, and every bag pinned to its
actual farm coordinates.

It drifts on its own, you can drag it (with inertia) or steer it with the arrow keys,
and pins fade and shrink toward the horizon so depth reads correctly. Pins pop in on a
stagger the first time the globe scrolls into view. Choosing a brewing method dims the
origins that will not suit it **and flies the sphere round to the first one that
does**; tapping a pin flies to it, labels it and scrolls to that bean's card. The
render loop only runs while the globe is on screen, and auto-rotation and easing are
disabled under `prefers-reduced-motion`.

## Ratings and reviews

Beans, matcha, syrups and creams carry a 0–5 star rating and a review thread. The
star line on each product card opens a panel with the average, a distribution
across all six ratings, the write form and every review.

- **0 is a real rating.** It gets its own control next to the stars rather than being
  unreachable, and it is counted in the distribution.
- **Naming is the reviewer's choice.** Left as it is, a review appears under first
  name plus last initial — *Wahj A.* — the same shortening used elsewhere on the
  site. Tick "post anonymously" and other visitors see *Anonymous* instead.
- Reviewers can edit or delete their own review; one per person per product.
- A review is badged **Bought this** when that account's order history contains the
  product, checked at the moment of posting.
- Names and review bodies are wrapped in `<bdi>` / `dir="auto"`, so an English review
  reads correctly inside the Arabic layout and vice versa — without it, a trailing
  full stop jumps to the wrong end of the line.

Which categories accept reviews is one line — the `CATS` set at the top of
`js/reviews.js`. Add `'chocolate'`, `'flour'`, `'pantry'` or `'tools'` to open those
shelves up too.

The shop ships with seeded reviews in both languages so the panel is not empty on a
first visit; they are marked `seed: true` and live in the same store as real ones.

**On "anonymous":** it hides the name from the interface, but this demo still records
which account wrote the review so the author can come back and edit it. The checkbox
says so in as many words. A real build would either drop the link or keep it
server-side where a visitor cannot read it — in `localStorage` anyone can.

## Recipe of the Month

`MONTHLY_RECIPES` in `js/data.js` holds guest-designed creations. The current one is
rendered on the home page **using the real Studio renderer**, so the picture is the
actual drink, not an illustration of it. "Order it" adds it to the bag; "Open it in
the Studio" hands the saved builder state over through `sessionStorage` so anyone can
tweak it and make it theirs.

## English / Arabic

The globe button in the header switches language and document direction. Every
product, ingredient, brewing method and preset carries an Arabic twin (`ar_name`,
`ar_desc`, …); UI strings live in one `[english, arabic]` dictionary in `js/i18n.js`.
The choice is remembered in `localStorage`.

Arabic swaps the type stack to Amiri + IBM Plex Sans Arabic, flips the layout to RTL,
loosens the headline leading (Arabic needs more than the tight Latin tracking), and
renders numbers in Arabic-Indic digits with **U+066B** as the decimal mark — a plain
full stop next to Arabic-Indic digits is visually identical to the zero glyph (٠),
so `13.100` would read as `١٣٠١٠٠`.

## Photography

Every photograph comes from **Unsplash**, whose licence permits free use for any
purpose, commercial included, with no attribution required. They are hotlinked
from the Unsplash CDN — which Unsplash supports — so the repository stays free of
binaries and each request asks for exactly the width it will be displayed at.

This matters because the site is deployed at a public URL. Images pulled off
Pinterest or a mood-board blog are somebody else's copyrighted work, and a real
takedown lands on the account that published them. Unsplash gets the same look
without that exposure. Every photo id in `js/photos.js` was verified to load
before it was committed.

Images fade up once decoded, over the item's own colours so a slow connection
never shows a white hole. The reveal cannot rely on an inline `onload`: an image
already cached is complete before the handler attaches, and would sit invisible
forever — so `revealPhotos()` checks `complete` first and only then listens.

## Palette

| | |
| --- | --- |
| Cream `#FDF7E4` | page ground |
| Warm Sand `#DED0B6` | secondary surfaces, map land, plates, sleeves |
| Toffee Brown `#B8794B` | accent, links, primary hover |
| Espresso `#4C2D1F` | text, buttons, footer |

## Accounts — now a real backend

Accounts, crumbs, orders, saved recipes, reviews and the cart live in **Supabase**
(project `ztotgsiwivdbznifbpdh`). An account works on any device, and a review one
person writes is a review everyone reads.

Sign in by **email, phone code, Google or Facebook** — see
[`supabase/SETUP.md`](./supabase/SETUP.md) for which of those still need
configuring in the dashboard.

Three things are enforced by the database rather than trusted from the browser,
and each is verified rather than assumed:

| Guarantee | How | Verified |
| --- | --- | --- |
| Crumbs cannot be forged | trigger awards them; client is column-revoked from `profiles.crumbs` | update attempt returns *permission denied* |
| Anonymous reviews stay anonymous | public reads go through `reviews_public`, which has no `user_id` column | column absent; `display_name` is `null` on anonymous rows |
| "Bought this" cannot be faked | trigger checks the reviewer's real orders | `false` on a product never ordered |

Row Level Security is on for all five tables: you can only ever read your own
profile, orders, recipes and cart.

**Sign-up is instant** — email confirmation is off, because Supabase's built-in
mailer on the free plan caps at a few messages an hour and would silently fail for
real visitors. What stops junk addresses instead is `js/email.js`, which is strict
about the domain and only structural about the part before the `@`. That asymmetry
is deliberate: `t054128@coded.edu.kw` is a real university login that any
"looks random" check would wrongly reject. It catches keysmashes, fake and
placeholder domains, throwaway inboxes and near-miss typos (offering a one-tap fix),
and optionally confirms the domain has an MX record via DNS-over-HTTPS — sending
only the domain, never the address, and failing open so a network hiccup never
blocks a real person.

### Turning the backend off

Blank the two strings in `js/config.js` and the whole site reverts to the original
localStorage behaviour with no code changes and no errors — handy for demoing
offline. In that mode passwords are salted and SHA-256 hashed locally, which is
reasonable hygiene for a demo but is not real auth.

Prices are illustrative Kuwaiti dinar with a 5% service charge, not a tax filing.

## Accessibility & responsiveness

Every tappable thing is at least 44 px on a coarse pointer (`@media (pointer: coarse)`
raises chips, icon buttons, add buttons, steppers and swatches). Filter rails use a
26 px radius rather than a full pill, so a rail that wraps to two rows reads as a
rounded panel instead of a squashed capsule. On phones the sticky category rail
scrolls sideways in one row rather than growing four rows tall — the brew-method
finder above it still wraps, because seeing all eight methods at once is its whole
point — and menu rows restack so the description gets the full width with the price
and add button on their own line.

Semantic landmarks, labelled fields and icon buttons, visible focus rings,
`aria-pressed` on every builder option, arrow-key control and a focus ring on the
globe so it is not pointer-only, Escape closes the drawer and the modal, the
welcome screen is skippable by click or key and auto-dismisses, and a
`prefers-reduced-motion` block disables every animation (the intro's staged reveal,
the page veil and transitions, the cursor glow, and the globe's spin and easing). Tested at 375 px, 960 px and 1120 px+ in both directions; nothing
scrolls sideways at any width.
