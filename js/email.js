/* ==========================================================================
   Ember & Crumb — email plausibility
   --------------------------------------------------------------------------
   Sign-up is instant (no confirmation mail), so this is the only thing
   standing between the database and "asdkjhasd@fjkdshf.zzz".

   The important asymmetry: we are STRICT about the domain and only
   STRUCTURAL about the part before the @. Plenty of perfectly real
   addresses look random on the left — t054128@coded.edu.kw is a university
   login, not a keysmash — and wrongly rejecting a real person is a far worse
   failure than letting one junk address through.
   ========================================================================== */
const EmailCheck = (() => {

  /* Every two-letter TLD is a real country code, so those pass on sight.
     For longer endings we keep a list: it is the part people fat-finger. */
  const TLDS = new Set(`com net org edu gov mil int info biz name pro app dev
    xyz online site website store shop tech space live life world today news
    media blog cloud digital agency studio design email link click page one
    art bar bio cab cafe care cash chat city club codes coffee company cool
    date deals delivery diet direct estate events expert family fashion film
    finance fit fund gallery games gift global gold golf group guide guru
    health help home host house institute jobs kitchen land legal loan love
    market menu mobi money network ninja partners photo photography pizza
    place plus press pub recipes rest restaurant review rocks run sale school
    science services show social software solutions style support systems
    team tips tools tours town toys trade training travel video villas vin
    vision watch wiki work works wtf zone academy accountant asia band best
    center coop consulting education engineer enterprises equipment example
    exchange fyi holdings industries international management marketing
    ventures museum aero travelers post tel`.trim().split(/\s+/));

  /* Endings that exist only in documentation and test rigs. */
  const FAKE_TLDS = new Set(['example','test','invalid','localhost','local','lan','home','internal','corp']);

  /* Reserved for documentation — Supabase rejects some of these too. */
  const FAKE_DOMAINS = new Set(['example.com','example.org','example.net','test.com','domain.com','yourdomain.com','mydomain.com']);

  /* Throwaway inboxes: valid mail servers, but not a person we can reach. */
  const DISPOSABLE = new Set(`mailinator.com guerrillamail.com 10minutemail.com tempmail.com
    yopmail.com trashmail.com sharklasers.com getnada.com temp-mail.org fakeinbox.com
    throwawaymail.com maildrop.cc dispostable.com mailnesia.com tempmailo.com
    emailondeck.com moakt.com mohmal.com discard.email spam4.me grr.la
    guerrillamailblock.com mytemp.email tempr.email`.trim().split(/\s+/));

  /* One keystroke away from a real provider — worth offering a correction. */
  const TYPOS = {
    'gmial.com':'gmail.com', 'gmai.com':'gmail.com', 'gmal.com':'gmail.com',
    'gnail.com':'gmail.com', 'gmail.co':'gmail.com', 'gmail.cm':'gmail.com',
    'gmail.con':'gmail.com', 'gmails.com':'gmail.com', 'gmaill.com':'gmail.com',
    'hotmial.com':'hotmail.com', 'hotmai.com':'hotmail.com', 'hotmail.co':'hotmail.com',
    'hotmail.con':'hotmail.com', 'hotnail.com':'hotmail.com',
    'outlok.com':'outlook.com', 'outloo.com':'outlook.com', 'outlook.co':'outlook.com',
    'yahooo.com':'yahoo.com', 'yaho.com':'yahoo.com', 'yahoo.co':'yahoo.com',
    'yahoo.con':'yahoo.com', 'icloud.co':'icloud.com', 'iclod.com':'icloud.com',
    'protonmai.com':'protonmail.com', 'live.co':'live.com',
  };

  /* Applied to the domain's own name only — never to the local part, and
     never to short names, because bbc, ibm, kfc and nbk are all real. */
  function looksRandom(label) {
    const s = label.toLowerCase().replace(/[^a-z]/g, '');
    if (s.length < 5) return false;

    /* Signals that are safe at any length. */
    if (/(.)\1{3,}/.test(s)) return true;                       // aaaa
    /* Keyboard runs of FIVE, not four. Four would reject property.com,
       which contains "erty", and liberty, puberty and so on. Five-letter
       runs (qwert, asdfg, zxcvb) appear in no English word. */
    for (const row of ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']) {
      for (let i = 0; i + 5 <= row.length; i++) {
        const run = row.slice(i, i + 5);
        if (s.includes(run) || s.includes([...run].reverse().join(''))) return true;
      }
    }

    /* Fuzzier signals — only once the name is long enough that a real word
       would almost certainly contain a vowel and a normal consonant rhythm. */
    if (s.length < 7) return false;
    if (!/[aeiouy]/.test(s)) return true;                       // fjkdshf
    if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(s)) return true;
    return false;
  }

  /* Structural + plausibility. Returns { ok } or { ok:false, error, suggestion }. */
  function validate(raw) {
    const email = String(raw || '').trim();
    if (!email) return { ok: false, error: t('em.blank') };
    if (email.length > 254) return { ok: false, error: t('em.long') };

    const at = email.lastIndexOf('@');
    if (at < 1 || at === email.length - 1) return { ok: false, error: t('em.shape') };

    const local = email.slice(0, at);
    const domain = email.slice(at + 1).toLowerCase();

    /* --- the part before @: structure only --- */
    if (local.length > 64) return { ok: false, error: t('em.long') };
    if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return { ok: false, error: t('em.localChars') };
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return { ok: false, error: t('em.localDots') };

    /* --- the part after @: strict --- */
    if (!domain.includes('.')) return { ok: false, error: t('em.noDot') };
    if (/\s/.test(domain) || domain.includes('..')) return { ok: false, error: t('em.shape') };

    const labels = domain.split('.');
    if (labels.some(l => !/^[a-z0-9-]{1,63}$/.test(l) || l.startsWith('-') || l.endsWith('-')))
      return { ok: false, error: t('em.domainChars') };

    const tld = labels[labels.length - 1];
    if (FAKE_TLDS.has(tld)) return { ok: false, error: t('em.fakeDomain') };
    if (!/^[a-z]{2,24}$/.test(tld)) return { ok: false, error: t('em.badTld') };
    if (tld.length > 2 && !TLDS.has(tld)) return { ok: false, error: t('em.unknownTld', { tld: '.' + tld }) };

    if (TYPOS[domain]) return { ok: false, error: t('em.typo', { good: TYPOS[domain] }), suggestion: local + '@' + TYPOS[domain] };
    if (FAKE_DOMAINS.has(domain)) return { ok: false, error: t('em.fakeDomain') };
    if (DISPOSABLE.has(domain)) return { ok: false, error: t('em.disposable') };

    /* the second-level label: "coded" in coded.edu.kw, "gmail" in gmail.com */
    const name = labels.length > 2 ? labels[labels.length - 3] || labels[0] : labels[0];
    if (looksRandom(name)) return { ok: false, error: t('em.random') };

    return { ok: true, email: local + '@' + domain };
  }

  /* Does the domain actually accept mail? Asks Cloudflare's public DNS over
     HTTPS for MX records. Only the DOMAIN is sent — never the whole address.
     Fails OPEN: if DNS is slow, blocked or offline we let the sign-up through
     rather than locking out a real person over a network hiccup. */
  async function hasMailServer(domain) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 2500);
      const ask = async type => {
        const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
          { headers: { accept: 'application/dns-json' }, signal: ctl.signal });
        return r.ok ? r.json() : null;
      };
      const mx = await ask('MX');
      clearTimeout(timer);
      if (!mx) return true;                                  // could not tell — allow
      if (mx.Answer && mx.Answer.length) return true;        // has a mail server
      if (mx.Status === 3) return false;                     // NXDOMAIN — no such domain
      /* No MX but the domain exists: some small domains accept mail on the A
         record, so give it the benefit of the doubt. */
      return true;
    } catch { return true; }
  }

  return { validate, hasMailServer, looksRandom, TLDS, DISPOSABLE };
})();
