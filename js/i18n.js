/* ==========================================================================
   Ember & Crumb — English / Arabic
   One dictionary of [english, arabic] pairs, a document-direction switch,
   and a re-render bus so JS-built views repaint in the new language.
   ========================================================================== */
const I18N = (() => {
  const KEY = 'ec_lang';
  let lang = (() => { try { return localStorage.getItem(KEY) || 'en'; } catch { return 'en'; } })();

  const S = {
    /* ---- chrome ---- */
    'brand.tag':          ['Roastery · Bakehouse', 'محمصة · مخبز'],
    'nav.home':           ['Home', 'الرئيسية'],
    'nav.menu':           ['Menu', 'القائمة'],
    'nav.studio':         ['Studio', 'الاستوديو'],
    'nav.shop':           ['Shop', 'المتجر'],
    'nav.visit':          ['Visit', 'زورونا'],
    'nav.account':        ['Account', 'حسابي'],
    'nav.make':           ['Make your own', 'صمّم بنفسك'],
    'nav.openBag':        ['Open bag', 'افتح الحقيبة'],
    'nav.menuLabel':      ['Menu', 'القائمة'],
    'lang.switch':        ['العربية', 'English'],
    'lang.label':         ['Switch to Arabic', 'التبديل إلى الإنجليزية'],

    /* ---- generic ---- */
    'c.close':            ['Close', 'إغلاق'],
    'c.add':              ['Add', 'أضف'],
    'c.remove':           ['Remove', 'حذف'],
    'c.pickOne':          ['Choose one', 'اختر واحداً'],
    'c.pickEach':         ['Pick one of each', 'اختر واحداً من كل صف'],
    'c.addMany':          ['Add as many as you like', 'أضف ما تشاء'],
    'c.optional':         ['Optional', 'اختياري'],
    'c.showing':          ['{n} showing', 'يُعرض {n}'],
    'c.items':            ['{n} items', '{n} عناصر'],
    'c.item':             ['{n} item', 'عنصر واحد'],
    'c.products':         ['{n} products', '{n} منتجاً'],
    'c.fullMenu':         ['Full menu', 'القائمة كاملة'],
    'c.shopAll':          ['Shop everything', 'تسوّق كل شيء'],
    'c.serves':           ['Serves {n}', 'تكفي {n}'],
    'c.each':             ['each', 'للحبة'],
    'c.whole':            ['Whole {p}', 'كاملة {p}'],

    /* ---- cart ---- */
    'cart.title':         ['Your bag', 'حقيبتك'],
    'cart.empty':         ['Nothing yet', 'لا شيء بعد'],
    'cart.emptyLine':     ['Your bag is empty — which feels like a missed opportunity.', 'حقيبتك فارغة، وهذه فرصة ضائعة.'],
    'cart.emptyCta':      ['Design something', 'صمّم شيئاً'],
    'cart.subtotal':      ['Subtotal', 'المجموع الفرعي'],
    'cart.tax':           ['Service (5%)', 'الخدمة (٥٪)'],
    'cart.total':         ['Total', 'الإجمالي'],
    'cart.collection':    ['Collection', 'الاستلام'],
    'cart.pickupShop':    ['Pickup — Zahra', 'استلام — الزهراء'],
    'cart.pickupRoast':   ['Pickup — the roastery', 'استلام — المحمصة'],
    'cart.delivery':      ['Delivery in Kuwait City', 'توصيل داخل مدينة الكويت'],
    'cart.place':         ['Place order · {p}', 'أرسل الطلب · {p}'],
    'cart.note':          ['Cakes need 48 hours. Drinks are made when you arrive.', 'الكيك يحتاج ٤٨ ساعة. المشروبات تُحضّر عند وصولك.'],
    'cart.more':          ['One more', 'واحد إضافي'],
    'cart.less':          ['One fewer', 'واحد أقل'],
    'cart.loginFirst':    ['Log in to place your order — it keeps your history and your crumbs.', 'سجّل الدخول لإتمام الطلب — لنحفظ سجلك ونقاطك.'],
    'cart.placed':        ['Order {id} is in. We are on it.', 'تم استلام الطلب {id}. نحن نعمل عليه.'],
    'cart.added':         ['{name} added to your bag.', 'تمت إضافة {name} إلى حقيبتك.'],

    /* ---- auth ---- */
    'auth.welcome':       ['Welcome back', 'أهلاً بعودتك'],
    'auth.create':        ['Make an account', 'أنشئ حساباً'],
    'auth.sub':           ['Your saved recipes and order history live here.', 'وصفاتك المحفوظة وسجل طلباتك هنا.'],
    'auth.login':         ['Log in', 'تسجيل الدخول'],
    'auth.signup':        ['Sign up', 'حساب جديد'],
    'auth.name':          ['Name', 'الاسم'],
    'auth.email':         ['Email', 'البريد الإلكتروني'],
    'auth.password':      ['Password', 'كلمة المرور'],
    'auth.pwHint':        ['At least 8 characters', '٨ أحرف على الأقل'],
    'auth.createBtn':     ['Create account', 'إنشاء الحساب'],
    'auth.working':       ['One moment…', 'لحظة…'],
    'auth.demoNote':      ['Demo accounts are stored in this browser only. Passwords are salted and hashed, never kept in plain text — but please do not reuse a real one.',
                           'الحسابات التجريبية تُحفظ في هذا المتصفح فقط. كلمات المرور مشفّرة ولا تُحفظ كنص، لكن أرجو ألا تستخدم كلمة مرور حقيقية.'],
    'auth.hiBack':        ['Welcome back, {name}.', 'أهلاً بعودتك يا {name}.'],
    'auth.hiNew':         ['Account ready. Welcome, {name}.', 'الحساب جاهز. أهلاً بك يا {name}.'],
    'auth.loggedOut':     ['Logged out. Your bag is waiting.', 'تم تسجيل الخروج. حقيبتك بانتظارك.'],
    'err.name':           ['Please tell us your name.', 'من فضلك أخبرنا باسمك.'],
    'err.email':          ['That email address does not look right.', 'البريد الإلكتروني لا يبدو صحيحاً.'],
    'err.pw':             ['Passwords need at least 8 characters.', 'كلمة المرور تحتاج ٨ أحرف على الأقل.'],
    'err.exists':         ['An account already uses that email. Try logging in.', 'هذا البريد مستخدم بالفعل. جرّب تسجيل الدخول.'],
    'err.creds':          ['That email and password combination is not recognised.', 'البريد الإلكتروني وكلمة المرور غير متطابقين.'],
    'err.emptyBag':       ['Your bag is empty.', 'حقيبتك فارغة.'],

    /* ---- sign-in methods ---- */
  'auth.orWith':       ['or continue with', 'أو تابع عبر'],
  'auth.google':       ['Continue with Google', 'المتابعة بحساب Google'],
  'auth.facebook':     ['Continue with Facebook', 'المتابعة بحساب Facebook'],
  'auth.mEmail':       ['Email', 'البريد'],
  'auth.mPhone':       ['Phone', 'الهاتف'],
  'auth.phone':        ['Phone number', 'رقم الهاتف'],
  'auth.phoneHint':    ['We will text you a six-digit code.', 'سنرسل لك رمزاً من ست خانات.'],
  'auth.sendCode':     ['Send me a code', 'أرسل لي رمزاً'],
  'auth.codeSentTo':   ['Code sent to {phone}', 'أُرسل الرمز إلى {phone}'],
  'auth.enterCode':    ['Six-digit code', 'الرمز المكوّن من ست خانات'],
  'auth.verify':       ['Verify and continue', 'تحقّق وتابع'],
  'auth.resend':       ['Send another code', 'أرسل رمزاً آخر'],
  'auth.otherNumber':  ['Use a different number', 'استخدم رقماً آخر'],
  'auth.redirecting':  ['Taking you to {provider}…', 'جارٍ تحويلك إلى {provider}…'],
  'auth.confirmSent':  ['Almost there — open the link we emailed to {email} to finish signing up.',
                        'اقتربنا — افتح الرابط الذي أرسلناه إلى {email} لإكمال التسجيل.'],

  /* ---- email plausibility ---- */
  'em.blank':        ['Please enter an email address.', 'من فضلك أدخل بريداً إلكترونياً.'],
  'em.long':         ['That address is too long to be real.', 'هذا العنوان أطول من أن يكون حقيقياً.'],
  'em.shape':        ['That does not look like an email address — it should read name@domain.com.',
                      'هذا لا يبدو بريداً إلكترونياً — يجب أن يكون بالشكل name@domain.com.'],
  'em.localChars':   ['The part before the @ has characters an email cannot contain.',
                      'الجزء قبل @ يحتوي رموزاً غير مسموحة في البريد.'],
  'em.localDots':    ['The part before the @ cannot start, end, or double up on dots.',
                      'الجزء قبل @ لا يبدأ أو ينتهي بنقطة ولا يحتوي نقطتين متتاليتين.'],
  'em.noDot':        ['The domain needs a dot in it, like gmail.com.', 'النطاق يحتاج نقطة، مثل gmail.com.'],
  'em.domainChars':  ['That domain contains characters a real domain cannot.', 'النطاق يحتوي رموزاً غير ممكنة في نطاق حقيقي.'],
  'em.badTld':       ['That domain ending does not look right.', 'نهاية النطاق لا تبدو صحيحة.'],
  'em.unknownTld':   ['We do not recognise “{tld}” as a real domain ending. Check it is spelled right.',
                      'لا نعرف «{tld}» كنهاية نطاق حقيقية. تأكد من الإملاء.'],
  'em.fakeDomain':   ['That domain is a placeholder, not a real one.', 'هذا النطاق للتوضيح فقط وليس حقيقياً.'],
  'em.disposable':   ['Throwaway inboxes are not accepted — please use an address you actually read.',
                      'لا نقبل العناوين المؤقتة — استخدم بريداً تقرأه فعلاً.'],
  'em.typo':         ['Did you mean {good}?', 'هل تقصد {good}؟'],
  'em.random':       ['That domain does not look real. Have another look at it.', 'هذا النطاق لا يبدو حقيقياً. راجعه مرة أخرى.'],
  'em.noServer':     ['We cannot find a mail server for that domain, so it would never receive anything.',
                      'لم نجد خادم بريد لهذا النطاق، فلن يصله شيء أبداً.'],
  'em.useIt':        ['Use {good}', 'استخدم {good}'],
  'em.checking':     ['Checking that address…', 'جارٍ التحقق من العنوان…'],

  /* ---- backend states ---- */
  'sb.demo':           ['Demo mode — accounts live only in this browser.', 'وضع تجريبي — الحسابات محفوظة في هذا المتصفح فقط.'],
  'sb.live':           ['Your account works on any device.', 'حسابك يعمل على أي جهاز.'],
  'sb.offline':        ['We cannot reach the server right now. Please try again in a moment.',
                        'تعذّر الوصول إلى الخادم الآن. حاول بعد قليل.'],
  'sb.needsBackend':   ['This sign-in method needs the server, which is not connected yet.',
                        'طريقة الدخول هذه تحتاج الخادم، وهو غير متصل بعد.'],
  'sb.notConfigured':  ['{provider} sign-in is not switched on yet. It needs to be enabled in the Supabase dashboard first.',
                        'الدخول عبر {provider} غير مفعّل بعد. يجب تفعيله من لوحة تحكم Supabase أولاً.'],
  'sb.providerOff':    ['That sign-in method is not enabled on this site yet.', 'طريقة الدخول هذه غير مفعّلة في الموقع بعد.'],
  'sb.smsOff':         ['Text-message sign-in is not set up yet. Try email instead.', 'الدخول عبر الرسائل النصية غير مُعد بعد. جرّب البريد.'],
  'sb.confirmFirst':   ['Open the confirmation link we emailed you, then log in.', 'افتح رابط التأكيد المرسل إلى بريدك ثم سجّل الدخول.'],
  'sb.badCode':        ['That code is wrong or has expired. Try sending a new one.', 'الرمز غير صحيح أو منتهي. اطلب رمزاً جديداً.'],
  'sb.rateLimit':      ['Too many attempts. Please wait a minute and try again.', 'محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة.'],
  'sb.generic':        ['Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'],

  /* ---- footer ---- */
    'f.blurb':            ['We roast in the back, bake before dawn, and let you design the rest. Two counters, one very small building.',
                           'نحمّص في الخلف، ونخبز قبل الفجر، ونترك لك تصميم الباقي. كاونتران في مبنى صغير جداً.'],
    'f.order':            ['Order', 'اطلب'],
    'f.bakehouse':        ['Bakehouse', 'المخبز'],
    'f.drinkStudio':      ['Drink Studio', 'استوديو المشروبات'],
    'f.cakeStudio':       ['Cake Studio', 'استوديو الكيك'],
    'f.cookieStudio':     ['Cookie Studio', 'استوديو الكوكيز'],
    'f.beansSupplies':    ['Beans & supplies', 'البن والمستلزمات'],
    'f.history':          ['Order history', 'سجل الطلبات'],
    'f.visitUs':          ['Visit us', 'زورونا'],
    'f.hours':            ['Hours', 'ساعات العمل'],
    'f.classes':          ['Classes', 'الدورات'],
    'f.wholesale':        ['Wholesale', 'الجملة'],
    'f.custom':           ['Custom orders', 'الطلبات الخاصة'],
    'f.listTitle':        ['The Friday Bake List', 'قائمة الجمعة'],
    'f.listBlurb':        ['What we are roasting, what is coming out of the oven, and which micro-lot is nearly gone.',
                           'ما نحمّصه، وما يخرج من الفرن، وأي دفعة نادرة أوشكت على النفاد.'],
    'f.join':             ['Join', 'اشترك'],
    'f.joined':           ['You are on the Bake List. See you Friday.', 'أنت الآن في القائمة. نراك يوم الجمعة.'],
    'f.addr':             ['© {y} Ember & Crumb Roastery & Bakehouse · Zahra, Kuwait',
                           '© {y} إمبر آند كرَمب للتحميص والخبز · الزهراء، الكويت'],
    'f.demo':             ['A student demo project — accounts and orders are stored only in this browser.',
                           'مشروع تجريبي — الحسابات والطلبات تُحفظ في هذا المتصفح فقط.'],
  };

  /* Arabic-Indic digits, so numbers match the surrounding copy. */
  const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const digits = str => lang === 'ar' ? String(str).replace(/[0-9]/g, d => AR_DIGITS[+d]) : String(str);

  function t(key, vars) {
    const pair = S[key];
    let out = pair ? (pair[lang === 'ar' ? 1 : 0] ?? pair[0]) : key;
    if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, v);
    return out;
  }

  /* Pick the Arabic twin of a data field when it exists. */
  function L(obj, field = 'name') {
    if (!obj) return '';
    if (lang === 'ar') { const v = obj['ar_' + field]; if (v !== undefined && v !== '') return v; }
    return obj[field] ?? '';
  }

  /* Kuwaiti dinar, three decimals.
     Arabic uses U+066B as the decimal mark: a full stop next to Arabic-Indic
     digits is indistinguishable from the zero glyph (٠). */
  function money(n) {
    const v = Number(n || 0).toFixed(3);
    return lang === 'ar' ? `${digits(v).replace('.', '\u066B')} د.ك` : `KD ${v}`;
  }

  const listeners = new Set();
  const onChange = fn => listeners.add(fn);

  function paintStatic(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }

  function apply() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('page.title.' + (document.body.dataset.page || 'home')) || document.title;
    paintStatic();
    listeners.forEach(fn => { try { fn(lang); } catch (e) { console.warn(e); } });
  }

  function set(next) {
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch {}
    apply();
  }
  const toggle = () => set(lang === 'en' ? 'ar' : 'en');
  const get = () => lang;
  const isRTL = () => lang === 'ar';

  /* Merge extra strings (page bundles load after this file). */
  const extend = more => Object.assign(S, more);

  return { t, L, money, digits, set, get, toggle, isRTL, apply, onChange, extend, paintStatic };
})();

/* Short aliases used everywhere else. */
const t = (k, v) => I18N.t(k, v);
const L = (o, f) => I18N.L(o, f);

/* ==========================================================================
   Page + studio strings
   ========================================================================== */
I18N.extend({
  'page.title.home':   ['Ember & Crumb — Roastery & Bakehouse, Kuwait', 'إمبر آند كرَمب — محمصة ومخبز، الكويت'],
  'page.title.menu':   ['Menu — Coffee, pastry and cakes · Ember & Crumb', 'القائمة — قهوة ومعجنات وكيك · إمبر آند كرَمب'],
  'page.title.studio': ['The Studio — Design your own · Ember & Crumb', 'الاستوديو — صمّم بنفسك · إمبر آند كرَمب'],
  'page.title.shop':   ['Shop — Beans, syrups & baking supplies · Ember & Crumb', 'المتجر — بن وشرابات ومستلزمات · إمبر آند كرَمب'],
  'page.title.account':['Account · Ember & Crumb', 'حسابي · إمبر آند كرَمب'],
  'page.title.visit':  ['Visit — Hours, classes & wholesale · Ember & Crumb', 'زورونا — الأوقات والدورات والجملة · إمبر آند كرَمب'],

  /* ---- cinematic intro ---- */
  'intro.eyebrow':  ['Zahra, Kuwait · Est. 2026', 'الزهراء، الكويت · تأسست ٢٠٢٦'],
  'intro.welcome':  ['Welcome in', 'أهلاً وسهلاً'],
  'intro.line1':    ['The ovens have been on since four.', 'الأفران تعمل منذ الرابعة فجراً.'],
  'intro.line2':    ['The roaster is still warm.', 'المحمصة ما زالت دافئة.'],
  'intro.line3':    ['Everything else is up to you.', 'وكل ما تبقّى متروك لك.'],
  'intro.enter':    ['Step inside', 'تفضّل بالدخول'],
  'intro.skip':     ['Skip', 'تخطّي'],

  /* ---- home ---- */
  'h.eyebrow':      ['Zahra, Kuwait · Est. 2026', 'الزهراء، الكويت · تأسست ٢٠٢٦'],
  'h.t1':           ['We roast it.', 'نحن نحمّصها.'],
  'h.t2':           ['We bake it.', 'نحن نخبزها.'],
  'h.t3':           ['You design it.', 'وأنت تصمّمها.'],
  'h.lede':         ['Roastery and bakehouse in one small building. Buy the beans — or design a drink, cake or cookie nobody has made, and watch us build it.',
                     'محمصة ومخبز في مبنى صغير واحد. اشترِ البن، أو صمّم مشروباً أو كيكة أو كوكيز لم يصنعها أحد، وشاهدنا نحضّرها.'],
  'h.cta1':         ['Open the Studio', 'ادخل الاستوديو'],
  'h.cta2':         ['See the menu', 'شاهد القائمة'],
  'h.s1':           ['Drinks on the bar', 'مشروباً على البار'],
  'h.s2':           ['Studio ingredients', 'مكوّناً في الاستوديو'],
  'h.s3':           ['Ovens on', 'تشتعل الأفران'],
  'h.s4':           ['Custom cake lead', 'مهلة الكيك الخاص'],
  'h.chip1':        ['Strawberry powder', 'بودرة الفراولة'],
  'h.chip2':        ['Ceremonial matcha', 'ماتشا احتفالية'],
  'h.chip3':        ['Oat, barista', 'شوفان باريستا'],
  'm.1':            ['Nitro on tap', 'نيترو على الصنبور'],
  'm.2':            ['Laminated at 4am', 'توريق عند الرابعة فجراً'],
  'm.3':            ['Single-origin micro-lots', 'دفعات نادرة أحادية الأصل'],
  'm.4':            ['Design your own cake', 'صمّم كيكتك'],
  'm.5':            ['House-made syrups', 'شرابات بيتية'],
  'm.6':            ['Qahwa in a dallah', 'قهوة في دلة'],

  'h.st.eyebrow':   ['The Studio', 'الاستوديو'],
  'h.st.title':     ['If you can picture it, somebody here can make it.', 'إن كنت تتخيّله، فهناك من يصنعه هنا.'],
  'h.st.lede':      ['Most menus ask you to pick a row. Ours lets you build one — a drink, a cake layer by layer, a cookie in your own words. It draws and prices itself as you go.',
                     'أغلب القوائم تطلب اختيار سطر. قائمتنا تدعك تصنع سطراً — مشروباً، أو كيكة طبقة طبقة، أو كوكيز بكلماتك. تُرسم وتُسعّر أمامك.'],
  'h.st.exTitle':   ['A worked example.', 'مثال عملي.'],
  'h.st.exBody':    ['A tiramisù is just lady fingers, a soak and a cream. Soak them in strawberry and matcha instead of espresso. A guest built that here; now it is on the menu.',
                     'التيراميسو أصابع سيدة ونقع وكريمة. انقعها بالفراولة والماتشا بدل الإسبريسو. صمّمها ضيف هنا، وصارت في القائمة.'],
  'h.st.cta1':      ['Design a drink', 'صمّم مشروباً'],
  'h.st.cta2':      ['Design a cake', 'صمّم كيكة'],
  'h.st.cta3':      ['Design a cookie', 'صمّم كوكيز'],

  'h.how':          ['How it works', 'كيف تعمل'],
  'h.howTitle':     ['Three screens between an idea and the pass.', 'ثلاث شاشات بين الفكرة والمطبخ.'],
  'h.step1t':       ['Build it', 'ابنِها'],
  'h.step1b':       ['Pick a base, a milk, syrups by the pump — or stack a cake, or ice a cookie. The preview redraws with every tap.',
                     'اختر القاعدة والحليب والشراب بالضخّة، أو ارصف كيكة، أو زيّن كوكيز. المعاينة تُرسم مع كل ضغطة.'],
  'h.step2t':       ['Name it', 'سمّها'],
  'h.step2b':       ['Name it, leave a note — allergies, sweetness, collection time. Save it to your account for next time.',
                     'سمِّها واترك ملاحظة: الحساسية، الحلاوة، وقت الاستلام. احفظها في حسابك للمرة القادمة.'],
  'h.step3t':       ['Order it', 'اطلبها'],
  'h.step3b':       ['It reaches the counter as a recipe card, not a riddle. Drinks in six minutes, cakes in forty-eight.',
                     'تصل إلى الكاونتر كبطاقة وصفة لا كأحجية. المشروبات في ست دقائق، والكيك في ٤٨ ساعة.'],

  'h.bar':          ['From the bar', 'من البار'],
  'h.barTitle':     ['The drinks we already got right.', 'المشروبات التي أتقنّاها بالفعل.'],
  'h.barLede':      ['House-made syrups, local milk, and a nitro tap that does most of the work.', 'شرابات بيتية وحليب محلي وصنبور نيترو يقوم بأغلب العمل.'],
  'h.quoteBy':      ['Best New Bakery — Bazaar Magazine, 2026', 'أفضل مخبز جديد — مجلة بازار، ٢٠٢٦'],
  'h.quote':        ['“A customer invented the strawberry matcha tiramisù on an iPad by the window. Three weeks later it was on the permanent menu.”',
                     '«تيراميسو الفراولة والماتشا ابتكرته زبونة بجانب النافذة. وبعد ثلاثة أسابيع صار في القائمة الدائمة.»'],
  'h.roast':        ['From the roastery', 'من المحمصة'],
  'h.roastTitle':   ['Take the bag home.', 'خذ الكيس معك.'],
  'h.roastLede':    ['Roasted in the back on a 5 kg drum, bagged the same week, dated on the label.', 'نحمّص في الخلف على مُحمّصة ٥ كغم، ونعبّئ في الأسبوع نفسه، والتاريخ على الملصق.'],
  'h.comeIn':       ['Come in', 'تفضّل'],
  'h.comeTitle':    ['Ten tables, one long bar, and the smell of the 4am bake.', 'عشر طاولات وبار طويل ورائحة خَبز الرابعة فجراً.'],
  'h.comeBody':     ['The roaster runs Tuesdays and Fridays, so the street smells like it. Lamination happens in the window. Morning buns are usually gone by ten.',
                     'المحمصة تعمل الثلاثاء والجمعة فيعبق الشارع. والتوريق يتم عند النافذة. وكعكات الصباح تنفد عادةً بحلول العاشرة.'],
  'h.comeCta1':     ['Plan a visit', 'خطّط لزيارة'],
  'h.comeCta2':     ['Book a class', 'احجز دورة'],
  'h.openDaily':    ['Open daily', 'مفتوح يومياً'],

  'h.cgEyebrow':    ['Around the shop', 'من داخل المحل'],
  'h.cgTitle':      ['Mornings here, more or less.', 'صباحاتنا هنا، تقريباً.'],
  'h.cg1':          ['cinnamon buns, down by the water', 'لفائف القرفة، عند الماء'],
  'h.cg2':          ['the quiet hour', 'الساعة الهادئة'],
  'h.cg3':          ['matcha for the drive home', 'ماتشا لطريق العودة'],
  'h.cg4':          ['the case, mid-morning', 'الفاترينة، منتصف الصباح'],
  'h.cg5':          ['rain, and the lights on', 'مطر، والأضواء مضاءة'],

  /* full-bleed band */
  'h.bandEyebrow':  ['Most afternoons', 'أغلب فترات العصر'],
  'h.bandLine':     ['Two iced, one small table, and nowhere in particular to be.',
                     'قهوتان مثلجتان، طاولة صغيرة، ولا مكان معيّن نقصده.'],

  /* shot-on-a-phone section */
  'h.shotEyebrow':  ['Straight off the phone', 'مباشرة من الجوال'],
  'h.shotTitle':    ['Nothing here is styled.', 'لا شيء هنا مُنسَّق.'],
  'h.shotBody':     ['Every photograph here was taken on a phone, at the counter or on the way out. No studio — what you see is what you get handed.',
                     'كل صورة هنا التُقطت بالجوال، عند الكاونتر أو في طريق الخروج. بلا استوديو — ما تراه هو ما سيُسلَّم إليك.'],
  'h.cgQuote':      ['“Everything here starts before the sun does.”', '«كل شيء هنا يبدأ قبل الشمس.»'],
  'f.photos':       ['Photography via Unsplash', 'الصور من Unsplash'],

  /* ---- recipe of the month ---- */
  'mo.eyebrow':     ['Recipe of the month', 'وصفة الشهر'],
  'mo.title':       ['Designed by a guest. Now on the board.', 'صمّمها ضيف. والآن على اللوح.'],
  'mo.lede':        ['Each month one Studio creation goes on the menu for everybody. If yours is picked, you drink free for a year.',
                     'كل شهر نختار تصميماً من الاستوديو ونصنعه للجميع. إن اختير تصميمك، تشرب مجاناً لسنة.'],
  'mo.by':          ['Designed by', 'من تصميم'],
  'mo.inThis':      ['What is in it', 'المكوّنات'],
  'mo.order':       ['Order it', 'اطلبها'],
  'mo.openStudio':  ['Open it in the Studio', 'افتحها في الاستوديو'],
  'mo.past':        ['Previously on the board', 'سابقاً على اللوح'],
  'mo.loaded':      ['Loaded into the Studio — change anything you like.', 'تم تحميلها في الاستوديو — غيّر ما تشاء.'],

  /* ---- menu ---- */
  'mn.eyebrow':     ['The menu', 'القائمة'],
  'mn.title':       ['Everything we already know how to make.', 'كل ما نعرف صنعه بالفعل.'],
  'mn.ledeA':       ['Twenty drinks, a pastry case that empties by eleven, cookies by the box and cakes by the slice or whole. Nothing here stops you from changing it —',
                     'عشرون مشروباً، وواجهة معجنات تفرغ بحلول الحادية عشرة، وكوكيز بالعلبة، وكيك بالقطعة أو كاملاً. ولا شيء يمنعك من تغييره —'],
  'mn.ledeB':       ['build your own instead', 'صمّم واحداً بنفسك'],
  'mn.all':         ['Everything', 'الكل'],
  'mn.signature':   ['Signature lattes', 'لاتيهات مميزة'],
  'mn.nitro':       ['Nitro tap', 'صنبور النيترو'],
  'mn.espresso':    ['Espresso bar', 'بار الإسبريسو'],
  'mn.matcha':      ['Matcha & tea', 'ماتشا وشاي'],
  'mn.other':       ['Not coffee', 'بدون قهوة'],
  'mn.pastry':      ['Pastry case', 'واجهة المعجنات'],
  'mn.cookie':      ['Cookies', 'كوكيز'],
  'mn.cake':        ['Cakes', 'الكيك'],
  'mn.n.signature': ['House-made syrups, made on the bar all day.', 'شرابات بيتية تُحضّر على البار طوال اليوم.'],
  'mn.n.nitro':     ['Sixteen-hour cold brew, nitrogen poured.', 'قهوة باردة ١٦ ساعة، تُسكب بالنيتروجين.'],
  'mn.n.espresso':  ['Bakehouse Espresso unless you ask otherwise.', 'إسبريسو المخبز ما لم تطلب غير ذلك.'],
  'mn.n.matcha':    ['Uji ceremonial grade, whisked to order.', 'ماتشا أوجي احتفالية، تُخفق عند الطلب.'],
  'mn.n.other':     ['For the people you came in with.', 'لمن جاء معك.'],
  'mn.n.pastry':    ['Baked from 4am. Gone by eleven, most days.', 'تُخبز من الرابعة فجراً، وتنفد بحلول الحادية عشرة غالباً.'],
  'mn.n.cookie':    ['Iced to order, or designed from scratch in the Studio.', 'تُزيّن عند الطلب، أو تُصمَّم من الصفر في الاستوديو.'],
  'mn.n.cake':      ['By the slice, or whole with 48 hours notice.', 'بالقطعة، أو كاملة بإشعار ٤٨ ساعة.'],
  'mn.ctaEyebrow':  ['Not seeing it?', 'لم تجده؟'],
  'mn.ctaTitle':    ['Then it doesn’t exist yet. Go make it.', 'إذاً هو غير موجود بعد. اذهب واصنعه.'],
  'mn.ctaBody':     ['The Studio has sixty-odd ingredients, house syrups by the pump, a cake builder that lets you decide what the sponge is soaked in, and a cookie you can write on. Half of this menu started there.',
                     'في الاستوديو أكثر من ستين مكوّناً، وشرابات بالضخّة، وبانٍ للكيك يدعك تختار ما يُنقع فيه، وكوكيز تكتب عليها. نصف هذه القائمة بدأ هناك.'],
  'mn.wholeAdded':  ['Whole {name} added — we will call to confirm the date.', 'تمت إضافة {name} كاملة — سنتصل لتأكيد الموعد.'],

  /* ---- shop ---- */
  'sh.eyebrow':     ['The shop', 'المتجر'],
  'sh.title':       ['Beans from the back room, and the syrups we actually use.', 'بن من الغرفة الخلفية، والشرابات التي نستخدمها فعلاً.'],
  'sh.lede':        ['Everything on this page is something we buy for ourselves first. Roast dates on every bag, no house-brand relabelling, and nothing we would not hand a friend who asked what to buy.',
                     'كل ما في هذه الصفحة نشتريه لأنفسنا أولاً. تاريخ التحميص على كل كيس، بلا إعادة تسمية، ولا شيء لا نوصي به صديقاً يسأل.'],
  'sh.all':         ['Everything', 'الكل'],
  'sh.bean':        ['Coffee beans', 'حبوب القهوة'],
  'sh.syrup':       ['Syrups', 'الشرابات'],
  'sh.cream':       ['Creams & fillings', 'الكريمات والحشوات'],
  'sh.flour':       ['Flour', 'الدقيق'],
  'sh.chocolate':   ['Chocolate & cocoa', 'شوكولاتة وكاكاو'],
  'sh.matcha':      ['Matcha', 'ماتشا'],
  'sh.pantry':      ['Pantry', 'المؤن'],
  'sh.tools':       ['Tools', 'الأدوات'],
  'sh.beansHead':   ['Coffee, roasted here', 'قهوة، محمّصة هنا'],
  'sh.syrupHead':   ['Syrups, creams & fillings', 'الشرابات والكريمات والحشوات'],
  'sh.syrupNote':   ['The same bottles and tubs we use behind the bar and in the bakehouse — so a drink or a cake you designed here can be finished at home.',
                     'القوارير والعلب نفسها التي نستخدمها خلف البار وفي المخبز — لتُكمل في بيتك ما صمّمته هنا.'],
  'sh.suppliesHead':['Baking supplies', 'مستلزمات الخبز'],
  'sh.p1t':         ['Roasted to order', 'تُحمّص عند الطلب'],
  'sh.p1b':         ['Bags leave the same week they are roasted, with the date stamped on the base. Whole bean only — grinding it three weeks early helps nobody.',
                     'تخرج الأكياس في أسبوع تحميصها، والتاريخ مختوم على القاعدة. حبوب كاملة فقط — الطحن قبل ثلاثة أسابيع لا يفيد أحداً.'],
  'sh.p2t':         ['Subscribe and forget', 'اشترك وانسَ'],
  'sh.p2b':         ['Pick a bag and a cadence and we will rotate the micro-lots for you. Pause it any week. Cancel it in two clicks, no email required.',
                     'اختر كيساً ووتيرة وسنبدّل لك الدفعات النادرة. أوقفه أي أسبوع، وألغِه بنقرتين دون رسائل.'],
  'sh.p3t':         ['Wholesale', 'الجملة'],
  'sh.p3b':         ['A dozen cafés and three restaurants around Kuwait already pour our coffee.', 'اثنا عشر مقهى وثلاثة مطاعم في الكويت تقدّم قهوتنا.'],
  'sh.talk':        ['Talk to us', 'تحدّث إلينا'],

  /* ---- bean finder ---- */
  'bf.eyebrow':     ['Find your bean', 'اعثر على بُنّك'],
  'bf.title':       ['How are you going to brew it?', 'كيف ستحضّرها؟'],
  'bf.lede':        ['Tell us the kit on your counter and we will show only the beans that are good in it — with the grind and the recipe we use ourselves.',
                     'أخبرنا بالأداة التي لديك وسنعرض البن الذي يناسبها فقط — مع درجة الطحن والوصفة التي نستخدمها.'],
  'bf.grind':       ['Grind', 'الطحن'],
  'bf.howWeBrew':   ['How we brew it', 'كيف نحضّرها'],
  'bf.matches':     ['{n} beans suit this method', '{n} أنواع تناسب هذه الطريقة'],
  'bf.match1':      ['1 bean suits this method', 'نوع واحد يناسب هذه الطريقة'],
  'bf.showAll':     ['Show every bean', 'اعرض كل الأنواع'],
  'bf.mapTitle':    ['Where it grew', 'من أين جاءت'],
  'bf.mapLede':     ['Every bag we sell, pinned to the farm it came from. Spin the globe, tap a pin to fly to it, or pick a brewing method above to dim the origins that will not suit it.',
                     'كل كيس نبيعه مثبّت على المزرعة التي جاء منها. أدر الكرة، أو اضغط دبوساً للانتقال إليه، أو اختر طريقة تحضير أعلاه لتخفت الأصول غير المناسبة.'],
  'bf.belt':        ['The Coffee Belt', 'حزام القهوة'],
  'bf.selected':    ['Selected', 'مختار'],
  'bf.spin':        ['Drag to spin the globe · tap a pin to fly there', 'اسحب لتدوير الكرة · اضغط على دبوس للانتقال إليه'],
  'bf.reset':       ['Reset view', 'إعادة الضبط'],
  'bf.origin':      ['Origin', 'المنشأ'],

  /* ---- studio ---- */
  'st.eyebrow':     ['The Studio', 'الاستوديو'],
  'st.title':       ['Make something that isn’t on the menu yet.', 'اصنع شيئاً ليس في القائمة بعد.'],
  'st.lede':        ['Every tap redraws the preview and re-prices the order. Build it, name it, leave a note for the person making it, and send it through.',
                     'كل ضغطة تعيد رسم المعاينة وتحديث السعر. ابنِها، وسمّها، واترك ملاحظة لمن سيصنعها، ثم أرسلها.'],
  'st.tabDrink':    ['Drink Studio', 'المشروبات'],
  'st.tabCake':     ['Cake Studio', 'الكيك'],
  'st.tabCookie':   ['Cookie Studio', 'الكوكيز'],
  'st.yours':       ['Your creation', 'من تصميمك'],
  'st.yourPrice':   ['Your price', 'سعرك'],
  'st.addOrder':    ['Add to order', 'أضف للطلب'],
  'st.saveRecipe':  ['Save recipe', 'احفظ الوصفة'],
  'st.surprise':    ['Surprise me', 'فاجئني'],
  'st.readyDrink':  ['Ready in about 6 minutes', 'جاهز خلال ٦ دقائق'],
  'st.readyCake':   ['Ready in 48 hours', 'جاهزة خلال ٤٨ ساعة'],
  'st.readyCookie': ['Ready in 24 hours', 'جاهزة خلال ٢٤ ساعة'],
  'st.footNote':    ['Drinks are made when you arrive. Cakes need 48 hours and cookies 24 — we will call to confirm the details.',
                     'المشروبات تُحضّر عند وصولك. الكيك يحتاج ٤٨ ساعة والكوكيز ٢٤ — وسنتصل لتأكيد التفاصيل.'],
  'st.presetDrink': ['Start from a house favourite', 'ابدأ من مفضّل البيت'],
  'st.presetCake':  ['Start from something we already make', 'ابدأ مما نصنعه بالفعل'],
  'st.presetCookie':['Start from a design we ice often', 'ابدأ من تصميم نزيّنه كثيراً'],
  'st.thenChange':  ['Then change anything', 'ثم غيّر ما تشاء'],
  'st.thenReinvent':['Then reinvent it', 'ثم أعد ابتكاره'],
  'st.loaded':      ['Loaded “{name}” — now change anything.', 'تم تحميل «{name}» — غيّر ما تشاء الآن.'],
  'st.rolled':      ['Rolled the dice. Some of these are genuinely good.', 'رمينا النرد. بعضها لذيذ فعلاً.'],
  'st.added':       ['“{name}” added — {p}', 'أُضيفت «{name}» — {p}'],
  'st.savedTo':     ['Saved “{name}” to your recipes.', 'حُفظت «{name}» في وصفاتك.'],
  'st.saveLogin':   ['Make an account to keep your recipes between visits.', 'أنشئ حساباً لتحتفظ بوصفاتك بين الزيارات.'],

  'st.g.recap':     ['Everything you have added', 'كل ما أضفته'],
  'st.recapEmpty':  ['Nothing added yet — syrups, extras and dustings collect here as you go.',
                     'لم تُضف شيئاً بعد — الشرابات والإضافات والرشّات تتجمّع هنا أثناء تصميمك.'],
  'st.recapSum':    ['{v} in add-ons', '{v} إضافات'],
  'st.kindSyrup':   ['syrup', 'شراب'],
  'st.kindExtra':   ['extra', 'إضافة'],
  'st.kindFinish':  ['on top', 'رشّة'],
  'st.less':        ['One less', 'واحد أقل'],
  'st.more':        ['One more', 'واحد أكثر'],
  'st.quadCap':     ['four shots max', 'أربع جرعات كحد أقصى'],
  'st.g.cup':       ['Cup & temperature', 'الكوب ودرجة الحرارة'],
  'st.g.base':      ['The base', 'القاعدة'],
  'st.g.milk':      ['Milk', 'الحليب'],
  'st.g.syrup':     ['House syrups', 'الشرابات البيتية'],
  'st.g.extra':     ['Texture & extras', 'القوام والإضافات'],
  'st.g.finish':    ['The finish', 'اللمسة الأخيرة'],
  'st.g.name':      ['Name it & brief your barista', 'سمّها وأخبر الباريستا'],
  'st.g.nameCake':  ['Name it & brief your baker', 'سمّها وأخبر الخبّاز'],
  'st.g.nameCookie':['Name it & brief the decorator', 'سمّها وأخبر المزيّن'],
  'st.pumps':       ['{n} pumps · tap to add, then set strength', '{n} ضخّات · اضغط للإضافة ثم اضبط القوة'],
  'st.pump1':       ['1 pump · tap to add, then set strength', 'ضخّة واحدة · اضغط للإضافة ثم اضبط القوة'],
  'st.dustHint':    ['Dusted, drizzled or scattered on top', 'مرشوش أو مقطّر أو منثور في الأعلى'],
  'st.callIt':      ['Call it something', 'أعطها اسماً'],
  'st.notesBar':    ['Notes for the bar', 'ملاحظات للبار'],
  'st.notesBake':   ['Notes for the bakehouse', 'ملاحظات للمخبز'],
  'st.notesDecor':  ['Notes for the decorator', 'ملاحظات للمزيّن'],
  'st.phBar':       ['Light ice, extra hot, oat foam on the side — tell them anything.', 'ثلج قليل، ساخن جداً، رغوة شوفان جانباً — اكتب ما تشاء.'],
  'st.phBake':      ['Nut allergy at the table, less sweet please, collecting Saturday at 3pm.', 'حساسية مكسرات، أقل حلاوة من فضلك، الاستلام السبت ٣ عصراً.'],
  'st.phDecor':     ['Keep the lettering small, no glitter on the edges, boxed for a gift.', 'اجعل الخط صغيراً، بلا بريق على الحواف، ومغلّفة كهدية.'],

  'st.g.size':      ['Size', 'الحجم'],
  'st.g.layers':    ['Layers', 'الطبقات'],
  'st.g.sponge':    ['The sponge', 'الكيك'],
  'st.g.soak':      ['The soak', 'النقع'],
  'st.g.filling':   ['Fillings', 'الحشوات'],
  'st.g.exterior':  ['The outside', 'الغلاف الخارجي'],
  'st.g.garnish':   ['Garnish', 'التزيين'],
  'st.soakHint':    ['This is where a tiramisù stops being a tiramisù', 'هنا يتوقف التيراميسو عن كونه تيراميسو'],
  'st.layerHint':   ['{n} layers of sponge, {f} of filling', '{n} طبقات كيك و{f} حشوة'],
  'st.fillHint':    ['{n} of 4 · they repeat between layers in order', '{n} من ٤ · تتكرر بين الطبقات بالترتيب'],
  'st.garnishHint': ['Scattered across the top', 'منثورة في الأعلى'],
  'st.inscription': ['Piped inscription', 'كتابة بالكريمة'],
  'st.max4fill':    ['Four fillings is already ambitious. Remove one first.', 'أربع حشوات طموح كافٍ. احذف واحدة أولاً.'],
  'st.max4garnish': ['Four garnishes is plenty — the cake needs somewhere to breathe.', 'أربع زينات تكفي — الكيكة تحتاج مساحة للتنفس.'],
  'st.max4decor':   ['Four decorations is the limit before it stops being a cookie.', 'أربع زينات هي الحد قبل أن تتوقف عن كونها كوكيز.'],

  'st.g.pack':      ['How many', 'الكمية'],
  'st.g.shape':     ['Shape', 'الشكل'],
  'st.g.dough':     ['The dough', 'العجينة'],
  'st.g.icing':     ['Icing colour', 'لون الآيسنغ'],
  'st.g.message':   ['Your message', 'رسالتك'],
  'st.g.font':      ['The lettering', 'الخط'],
  'st.g.decor':     ['Decoration', 'الزينة'],
  'st.msgLabel':    ['What should it say?', 'ماذا تريدها أن تقول؟'],
  'st.msgPh':       ['Mabrouk · Happy birthday · مبروك', 'مبروك · كل عام وأنت بخير · Congratulations'],
  'st.msgHint':     ['Up to 30 characters, piped by hand', 'حتى ٣٠ حرفاً، تُكتب يدوياً'],
  'st.inkColour':   ['Ink colour', 'لون الكتابة'],
  'st.textSize':    ['Lettering size', 'حجم الخط'],
  'st.fontHint':    ['Tap a font to see your words in it', 'اضغط على خط لترى كلماتك به'],
  'st.fontArabicOnly':['Arabic-ready', 'يدعم العربية'],
  'st.fontLatinOnly': ['Latin only', 'لاتيني فقط'],
  'st.noMessage':   ['No lettering', 'بدون كتابة'],
  'st.shapeHint':   ['Cut by hand from one sheet', 'تُقطع يدوياً من صفيحة واحدة'],

  /* ---- account ---- */
  'ac.title':       ['Keep your recipes, and your order history.', 'احتفظ بوصفاتك وسجل طلباتك.'],
  'ac.lede':        ['An account saves everything you design in the Studio, remembers your usual, and collects a crumb for every dinar. Ten crumbs, one free drink.',
                     'الحساب يحفظ كل ما تصمّمه في الاستوديو، ويتذكّر طلبك المعتاد، ويجمع فتاتة عن كل دينار. عشر فتات، مشروب مجاني.'],
  'ac.createBtn':   ['Create an account', 'أنشئ حساباً'],
  'ac.haveOne':     ['I already have one', 'لديّ حساب'],
  'ac.f1t':         ['Saved recipes', 'الوصفات المحفوظة'],
  'ac.f1b':         ['Every drink, cake and cookie you build, one tap from the bag.', 'كل مشروب وكيكة وكوكيز تصنعها، على بعد ضغطة من الحقيبة.'],
  'ac.f2t':         ['Order history', 'سجل الطلبات'],
  'ac.f2b':         ['What you ordered, when, and what it cost — reorder in a click.', 'ماذا طلبت ومتى وبكم — أعد الطلب بنقرة.'],
  'ac.f3t':         ['Crumbs', 'الفتات'],
  'ac.f3b':         ['A point per dinar. They do not expire, because that would be rude.', 'نقطة لكل دينار. لا تنتهي صلاحيتها، فذلك سيكون تصرفاً غير لائق.'],
  'ac.demo':        ['This is a demo build: accounts live in this browser’s local storage only. Passwords are salted and SHA-256 hashed rather than stored as text, but please still use a throwaway one.',
                     'هذه نسخة تجريبية: الحسابات تُحفظ في تخزين هذا المتصفح فقط. كلمات المرور مشفّرة بـ SHA-256 ولا تُحفظ كنص، لكن استخدم كلمة مرور مؤقتة رجاءً.'],
  'ac.morning':     ['Morning, {name}.', 'صباح الخير يا {name}.'],
  'ac.crumbs':      ['Crumbs', 'الفتات'],
  'ac.orders':      ['Orders', 'الطلبات'],
  'ac.recipes':     ['Saved recipes', 'الوصفات المحفوظة'],
  'ac.details':     ['Your details', 'بياناتك'],
  'ac.logout':      ['Log out', 'تسجيل الخروج'],
  'ac.noOrders':    ['No orders yet. The first one is the hardest.', 'لا طلبات بعد. الأول هو الأصعب.'],
  'ac.browse':      ['Browse the menu', 'تصفّح القائمة'],
  'ac.noRecipes':   ['Nothing saved yet. Go build something strange.', 'لا شيء محفوظ بعد. اذهب واصنع شيئاً غريباً.'],
  'ac.openStudio':  ['Open the Studio', 'افتح الاستوديو'],
  'ac.again':       ['Order this again', 'أعد هذا الطلب'],
  'ac.inBakehouse': ['In the bakehouse', 'في المخبز'],
  'ac.usual':       ['Your usual', 'طلبك المعتاد'],
  'ac.usualPh':     ['16oz iced oat cinnamon sugar latte', 'لاتيه القرفة بالشوفان مثلج ١٦ أونصة'],
  'ac.emailFixed':  ['Email is the account key in this demo, so it cannot be changed.', 'البريد هو مفتاح الحساب في هذه النسخة، فلا يمكن تغييره.'],
  'ac.saveChanges': ['Save changes', 'احفظ التغييرات'],
  'ac.saved':       ['Saved.', 'تم الحفظ.'],
  'ac.yourData':    ['Your data', 'بياناتك'],
  'ac.dataBody':    ['Everything — this account, your bag, your orders and your saved recipes — is stored in this browser only. Clearing site data removes all of it, permanently.',
                     'كل شيء — الحساب والحقيبة والطلبات والوصفات — محفوظ في هذا المتصفح فقط. مسح بيانات الموقع يحذفها نهائياً.'],
  'ac.erase':       ['Erase everything on this device', 'امسح كل شيء من هذا الجهاز'],
  'ac.eraseConfirm':['This erases every Ember & Crumb account, order and saved recipe stored in this browser. There is no undo. Continue?',
                     'سيمسح هذا كل الحسابات والطلبات والوصفات المحفوظة في هذا المتصفح. لا تراجع. هل تريد المتابعة؟'],
  'ac.backAdded':   ['{n} items back in your bag.', 'أُعيدت {n} عناصر إلى حقيبتك.'],
  'ac.recipeDeleted':['Recipe deleted.', 'حُذفت الوصفة.'],
  'ac.drink':       ['Drink', 'مشروب'],
  'ac.cake':        ['Cake', 'كيك'],
  'ac.cookie':      ['Cookie', 'كوكيز'],

  /* ---- reviews ---- */
  'rv.first':        ['Be the first to review', 'كن أول من يقيّم'],
  'rv.one':          ['1 review', 'تقييم واحد'],
  'rv.many':         ['{n} reviews', '{n} تقييماً'],
  'rv.all':          ['All reviews', 'كل التقييمات'],
  'rv.yourRating':   ['Your rating', 'تقييمك'],
  'rv.yourReview':   ['Your review', 'رأيك'],
  'rv.nStars':       ['{n} stars', '{n} نجوم'],
  'rv.zero':         ['0 — no stars', '٠ — بلا نجوم'],
  'rv.placeholder':  ['How did it brew, bake or pour? What would you tell someone standing at the shelf?',
                      'كيف كانت في التحضير أو الخبز؟ ماذا تقول لشخص واقف أمام الرف؟'],
  'rv.postAnon':     ['Post anonymously', 'انشر دون اسم'],
  'rv.anonNote':     ['Leave it off and your review appears under {name} — switch it on and visitors see “Anonymous”. Either way this demo still links it to your account, so you can come back and edit it.',
                      'إن تركته مغلقاً يظهر تقييمك باسم {name} — وإن فعّلته يرى الزوار «مجهول». وفي الحالتين تبقى النسخة التجريبية تربط التقييم بحسابك لتتمكن من تعديله لاحقاً.'],
  'rv.anon':         ['Anonymous', 'مجهول'],
  'rv.post':         ['Post review', 'انشر التقييم'],
  'rv.update':       ['Update your review', 'حدّث تقييمك'],
  'rv.edit':         ['Edit', 'تعديل'],
  'rv.edited':       ['edited', 'مُعدّل'],
  'rv.bought':       ['Bought this', 'شراء موثّق'],
  'rv.thanks':       ['Thank you — your review is up.', 'شكراً لك — نُشر تقييمك.'],
  'rv.empty':        ['No reviews yet. Yours would be the first.', 'لا تقييمات بعد. سيكون تقييمك الأول.'],
  'rv.needAccount':  ['Log in to leave a rating and a review.', 'سجّل الدخول لترك تقييم ورأي.'],
  'rv.needText':     ['Please write a few words with your rating.', 'اكتب بضع كلمات مع تقييمك من فضلك.'],
  'rv.confirmDelete':['Delete your review? This cannot be undone.', 'حذف تقييمك؟ لا يمكن التراجع.'],
  'rv.sort':         ['Sort reviews', 'ترتيب التقييمات'],
  'rv.newest':       ['Newest first', 'الأحدث أولاً'],
  'rv.highest':      ['Highest rated', 'الأعلى تقييماً'],
  'rv.lowest':       ['Lowest rated', 'الأدنى تقييماً'],
  'rv.readAll':      ['Ratings & reviews', 'التقييمات والآراء'],

  /* ---- visit ---- */
  'v.eyebrow':      ['Zahra, Kuwait', 'الزهراء، الكويت'],
  'v.title':        ['Come stand in the warm bit near the oven.', 'تعال وقف في المكان الدافئ قرب الفرن.'],
  'v.lede':         ['Ten tables, one long bar, a roaster that runs twice a week and makes the whole street smell like breakfast.',
                     'عشر طاولات وبار طويل ومحمصة تعمل مرتين أسبوعياً فتجعل الشارع كله برائحة الفطور.'],
  'v.hours':        ['Hours', 'ساعات العمل'],
  'v.satWed':       ['Saturday — Wednesday', 'السبت — الأربعاء'],
  'v.thu':          ['Thursday', 'الخميس'],
  'v.fri':          ['Friday', 'الجمعة'],
  'v.roastDays':    ['Roasting days', 'أيام التحميص'],
  'v.roastWhen':    ['Tue & Fri', 'الثلاثاء والجمعة'],
  'v.find':         ['Find us', 'موقعنا'],
  'v.good':         ['Good to know', 'معلومات مفيدة'],
  'v.goodBody':     ['Parking behind the block. Step-free entrance on the side. Family seating upstairs. The wifi password is on the tip jar.',
                     'مواقف خلف العمارة. مدخل بلا درج من الجانب. جلسات عائلية في الأعلى. وكلمة الواي فاي على صندوق البقشيش.'],
  'v.classes':      ['Classes', 'الدورات'],
  'v.classesTitle': ['Learn the lamination. Ruin one batch. Take the rest home.', 'تعلّم التوريق. أفسد دفعة. وخذ الباقي معك.'],
  'v.classesBody':  ['Saturday mornings, eight people, three hours, all the butter you can justify. Croissants one week, tiramisù the next, cookie decorating whenever the icing is mixed.',
                     'صباحات السبت، ثمانية أشخاص، ثلاث ساعات، وكل الزبدة التي يمكنك تبريرها. كرواسون في أسبوع، وتيراميسو في التالي، وتزيين الكوكيز متى جهز الآيسنغ.'],
  'v.waitlist':     ['Join the waitlist', 'انضم لقائمة الانتظار'],
  'v.waitToast':    ['Classes open for booking on the first of each month. We will email the Bake List first.',
                     'يُفتح الحجز أول كل شهر. سنراسل قائمة الجمعة أولاً.'],
  'v.wholesale':    ['Wholesale', 'الجملة'],
  'v.wsTitle':      ['We will help you dial it in, then leave you alone.', 'سنساعدك في الضبط ثم نتركك وشأنك.'],
  'v.wsBody':       ['Green sourcing, roast profiles, tap installs and staff training for cafés and restaurants across Kuwait. We are new, so the minimum order is smaller than you expect.',
                     'توريد البن الأخضر، وملفات التحميص، وتركيب الصنابير، وتدريب الفريق للمقاهي والمطاعم في الكويت. والحد الأدنى للطلب أصغر مما تتوقع.'],
  'v.faqEyebrow':   ['Custom orders', 'الطلبات الخاصة'],
  'v.faqTitle':     ['The questions we get every week.', 'الأسئلة التي تصلنا كل أسبوع.'],
  'v.q1':           ['How far ahead do you need a custom cake?', 'كم من الوقت تحتاجون لكيكة خاصة؟'],
  'v.a1':           ['Forty-eight hours for anything from the Cake Studio, twenty-four for cookies. Tiered cakes, sugar work or anything over ten inches, give us a week and a phone call.',
                     '٤٨ ساعة لأي شيء من استوديو الكيك، و٢٤ ساعة للكوكيز. أما الكيك متعدد الطوابق أو أعمال السكر أو ما يزيد عن ١٠ إنش، فأعطنا أسبوعاً واتصالاً.'],
  'v.q2':           ['Can you work around allergies?', 'هل تراعون الحساسية؟'],
  'v.a2':           ['Usually. Put it in the notes field in the Studio and we will call to confirm. We cannot promise a nut-free environment — there is Bronte pistachio paste within arm’s reach of everything.',
                     'غالباً. اكتبها في خانة الملاحظات وسنتصل للتأكيد. لكننا لا نضمن بيئة خالية من المكسرات — فمعجون الفستق قريب من كل شيء.'],
  'v.q3':           ['Is the Studio price the final price?', 'هل سعر الاستوديو نهائي؟'],
  'v.a3':           ['For drinks and cookies, yes. For cakes it is accurate for anything standard; if your design needs something we do not stock, we will quote the difference before we start.',
                     'للمشروبات والكوكيز، نعم. وللكيك دقيق في الطلبات المعتادة؛ وإن احتاج تصميمك شيئاً غير متوفر لدينا فسنخبرك بالفرق قبل البدء.'],
  'v.q4':           ['Do you actually put guest designs on the menu?', 'هل تضعون تصاميم الضيوف في القائمة فعلاً؟'],
  'v.a4':           ['Every month, one of them. The strawberry matcha tiramisù is the famous one already. If yours is picked, you drink free for a year and your name goes on the card.',
                     'كل شهر واحد منها. وتيراميسو الفراولة والماتشا هو الأشهر. وإن اختير تصميمك، تشرب مجاناً لسنة ويُكتب اسمك على البطاقة.'],
});
