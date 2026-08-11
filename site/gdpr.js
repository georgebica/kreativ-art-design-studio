/*!
 * Consimtamant cookies — Kreativ Art Design Studio
 * Banner + blocare scripturi tertre pana la accept + Google Consent Mode v2.
 * Categorii: necesare (mereu active), preferinte, statistici, marketing.
 */
(function () {
  'use strict';

  var COOKIE = 'gm_cookie_consent';
  var VERSION = 1;              // bump = invalideaza consimtamintele vechi
  var LIFETIME_DAYS = 180;
  var CATS = ['necessary', 'preferences', 'analytics', 'marketing'];

  var ACCENT = '#7a8b4f', BG = '#0e0d0a', TXT = '#ffffff';

  /* ---------------- cookie helpers ---------------- */
  function readConsent() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    if (!m) return null;
    try {
      var d = JSON.parse(decodeURIComponent(m[1]));
      if (!d || d.version !== VERSION) return null;
      return d;
    } catch (e) { return null; }
  }
  function writeConsent(cats) {
    var data = { version: VERSION, date: new Date().toISOString().slice(0, 10) };
    CATS.forEach(function (c) { data[c] = c === 'necessary' ? true : !!cats[c]; });
    var exp = new Date(Date.now() + LIFETIME_DAYS * 864e5).toUTCString();
    document.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(data)) +
      ';expires=' + exp + ';path=/;SameSite=Lax' +
      (location.protocol === 'https:' ? ';Secure' : '');
    return data;
  }

  /* ---------------- Google Consent Mode v2 ---------------- */
  function gtagUpdate(d) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      ad_storage: d.marketing ? 'granted' : 'denied',
      ad_user_data: d.marketing ? 'granted' : 'denied',
      ad_personalization: d.marketing ? 'granted' : 'denied',
      analytics_storage: d.analytics ? 'granted' : 'denied',
      functionality_storage: d.preferences ? 'granted' : 'denied',
      personalization_storage: d.preferences ? 'granted' : 'denied'
    });
  }

  /* ---------------- activare scripturi blocate ---------------- */
  function unblock(d) {
    // <script type="text/plain" data-gmc-cat="...">
    Array.prototype.slice.call(document.querySelectorAll('script[type="text/plain"][data-gmc-cat]'))
      .forEach(function (old) {
        var cat = old.getAttribute('data-gmc-cat');
        if (!d[cat]) return;
        var s = document.createElement('script');
        Array.prototype.slice.call(old.attributes).forEach(function (a) {
          if (a.name !== 'type' && a.name !== 'data-gmc-cat') s.setAttribute(a.name, a.value);
        });
        if (old.src) { s.src = old.src; } else { s.textContent = old.textContent; }
        old.parentNode.insertBefore(s, old);
        old.parentNode.removeChild(old);
      });
    // iframe-uri blocate: <iframe data-gmc-src="..." data-gmc-cat="...">
    Array.prototype.slice.call(document.querySelectorAll('iframe[data-gmc-src][data-gmc-cat]'))
      .forEach(function (f) {
        var cat = f.getAttribute('data-gmc-cat');
        if (!d[cat] || f.getAttribute('src')) return;
        f.setAttribute('src', f.getAttribute('data-gmc-src'));
        var ph = f.parentNode.querySelector('.gmc-ph');
        if (ph) ph.style.display = 'none';
        f.style.display = '';
      });
  }

  /* ---------------- stergere cookie-uri la retragerea consimtamantului ---------------- */
  // Blocarea scripturilor nu elimina cookie-urile deja setate. Daca o categorie
  // e refuzata, stergem cookie-urile plasate anterior de acea categorie.
  var CAT_COOKIES = {
    analytics: [/^_ga$/, /^_ga_/, /^_gid$/, /^_gat/, /^_gcl_/],
    marketing: [/^_fbp$/, /^_fbc$/, /^IDE$/, /^test_cookie$/]
  };
  function purge(d) {
    var host = location.hostname;
    var domains = ['', host, '.' + host];
    var parts = host.split('.');
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (raw) {
      var name = raw.split('=')[0].trim();
      if (!name) return;
      Object.keys(CAT_COOKIES).forEach(function (cat) {
        if (d[cat]) return;                       // categoria e permisa -> nu stergem
        var hit = CAT_COOKIES[cat].some(function (re) { return re.test(name); });
        if (!hit) return;
        domains.forEach(function (dom) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' +
            (dom ? ';domain=' + dom : '');
        });
      });
    });
  }

  function apply(d) { gtagUpdate(d); purge(d); unblock(d); }

  /* ---------------- CSS ---------------- */
  function css() {
    var s = document.createElement('style');
    s.textContent =
      '.gmc-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:' + BG + ';color:' + TXT + ';' +
      'font-family:Hind,system-ui,sans-serif;padding:20px 18px;box-shadow:0 -6px 28px rgba(0,0,0,.28);display:none}' +
      '.gmc-bar.on{display:block}' +
      '.gmc-in{max-width:1200px;margin:0 auto;display:flex;gap:22px;align-items:center;flex-wrap:wrap;justify-content:space-between}' +
      '.gmc-tx{flex:1;min-width:260px;font-size:14px;line-height:1.65;color:rgba(255,255,255,.86);margin:0}' +
      '.gmc-tx b{color:#fff;font-weight:600}' +
      '.gmc-tx a{color:' + ACCENT + ';text-decoration:underline;text-underline-offset:2px}' +
      '.gmc-btns{display:flex;gap:10px;flex-wrap:wrap;flex-shrink:0}' +
      '.gmc-b{font-family:inherit;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;' +
      'padding:13px 22px;border:1px solid transparent;cursor:pointer;transition:.2s;white-space:nowrap;line-height:1;border-radius:0}' +
      '.gmc-b--ok{background:' + ACCENT + ';color:#fff;border-color:' + ACCENT + '}' +
      '.gmc-b--ok:hover{background:#fff;color:' + BG + ';border-color:#fff}' +
      '.gmc-b--no,.gmc-b--set{background:transparent;color:#fff;border-color:rgba(255,255,255,.42)}' +
      '.gmc-b--no:hover,.gmc-b--set:hover{background:#fff;color:' + BG + ';border-color:#fff}' +
      /* panel */
      '.gmc-ov{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.62);display:none;padding:20px;overflow:auto}' +
      '.gmc-ov.on{display:flex;align-items:center;justify-content:center}' +
      '.gmc-pan{background:#fff;color:' + BG + ';max-width:620px;width:100%;padding:32px;font-family:Hind,system-ui,sans-serif;max-height:88vh;overflow:auto}' +
      '.gmc-pan h2{font-family:Vidaloka,Georgia,serif;font-size:26px;line-height:1.2;margin:0 0 8px;font-weight:400;text-transform:none}' +
      '.gmc-pan>p{font-size:14px;line-height:1.7;color:#1c1a16;margin:0 0 20px}' +
      '.gmc-row{border-top:1px solid #e8e4d8;padding:16px 0;display:flex;gap:16px;align-items:flex-start;justify-content:space-between}' +
      '.gmc-row h3{font-family:Vidaloka,Georgia,serif;font-size:17px;margin:0 0 5px;font-weight:400;text-transform:none;line-height:1.3}' +
      '.gmc-row p{font-size:13px;line-height:1.6;color:#3a352d;margin:0}' +
      '.gmc-sw{flex-shrink:0;position:relative;width:46px;height:26px}' +
      '.gmc-sw input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer;z-index:2}' +
      '.gmc-sw i{position:absolute;inset:0;background:#cfcabc;transition:.2s;border-radius:26px;display:block;pointer-events:none}' +
      '.gmc-sw i:after{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;transition:.2s;border-radius:50%}' +
      '.gmc-sw input:checked+i{background:' + ACCENT + '}' +
      '.gmc-sw input:checked+i:after{transform:translateX(20px)}' +
      '.gmc-sw input:disabled+i{opacity:.55}' +
      '.gmc-pact{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;border-top:1px solid #e8e4d8;padding-top:22px}' +
      '.gmc-b--save{background:' + BG + ';color:#fff;border-color:' + BG + '}' +
      '.gmc-b--save:hover{background:' + ACCENT + ';border-color:' + ACCENT + '}' +
      '.gmc-b--all{background:' + ACCENT + ';color:#fff;border-color:' + ACCENT + '}' +
      '.gmc-b--all:hover{background:' + BG + ';border-color:' + BG + '}' +
      '.gmc-b--rej{background:transparent;color:' + BG + ';border-color:rgba(14,13,10,.3)}' +
      '.gmc-b--rej:hover{background:' + BG + ';color:#fff}' +
      /* floating */
      '.gmc-fl{position:fixed;left:16px;bottom:16px;z-index:2147482999;width:46px;height:46px;min-width:46px;min-height:46px;' +
      'aspect-ratio:1/1;padding:0;border-radius:50%;background:' + BG + ';color:#fff;border:1px solid rgba(255,255,255,.25);' +
      'cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.3);line-height:0}' +
      '.gmc-fl.on{display:flex}.gmc-fl:hover{background:' + ACCENT + '}.gmc-fl svg{width:21px;height:21px;display:block}' +
      /* placeholder embed blocat */
      '.gmc-ph{background:#faf8f3;border:1px solid #e8e4d8;padding:28px;text-align:center;font-family:Hind,system-ui,sans-serif;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-height:100%;height:100%}' +
      '.gmc-ph p{margin:0;font-size:14px;line-height:1.6;color:#3a352d;max-width:380px}' +
      '@media(max-width:900px){.gmc-in{flex-direction:column;align-items:stretch;gap:14px}.gmc-btns{width:100%}.gmc-b{flex:1;text-align:center;padding:13px 12px}}' +
      '@media(max-width:600px){.gmc-bar{padding:16px 14px}.gmc-tx{font-size:13px}.gmc-b{font-size:10px;letter-spacing:.12em}.gmc-pan{padding:24px 20px}.gmc-fl{bottom:76px}}';
    document.head.appendChild(s);
  }

  /* ---------------- UI ---------------- */
  var bar, panel, floatBtn;

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'gmc-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Preferinte cookies');
    bar.innerHTML =
      '<div class="gmc-in">' +
      '<p class="gmc-tx"><b>Folosim cookie-uri.</b> Cele necesare fac site-ul sa functioneze. Pentru statistici si continut incorporat (harta) avem nevoie de acordul tau. ' +
      'Poti accepta, refuza sau alege pe categorii. Detalii in <a href="/politica-de-cookies/">Politica de Cookies</a>.</p>' +
      '<div class="gmc-btns">' +
      '<button type="button" class="gmc-b gmc-b--set" data-a="set">Set&#259;ri</button>' +
      '<button type="button" class="gmc-b gmc-b--no" data-a="rej">Refuz</button>' +
      '<button type="button" class="gmc-b gmc-b--ok" data-a="all">Accept tot</button>' +
      '</div></div>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'all') save({ preferences: 1, analytics: 1, marketing: 1 });
      else if (a === 'rej') save({ preferences: 0, analytics: 0, marketing: 0 });
      else openPanel();
    });
  }

  var ROWS = [
    ['necessary', 'Strict necesare', 'Fac site-ul sa functioneze (navigare, securitate, retinerea optiunii tale de cookies). Nu pot fi dezactivate.'],
    ['preferences', 'Preferinte', 'Retin alegerile tale si permit continut incorporat, cum este harta Google de pe pagina de contact.'],
    ['analytics', 'Statistici', 'Ne arata anonim cate persoane viziteaza site-ul si ce pagini citesc, ca sa il imbunatatim (Google Analytics).'],
    ['marketing', 'Marketing', 'Ar fi folosite pentru reclame relevante. In acest moment nu rulam astfel de scripturi pe site.']
  ];

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'gmc-ov';
    var rows = ROWS.map(function (r) {
      var nec = r[0] === 'necessary';
      return '<div class="gmc-row"><div><h3>' + r[1] + '</h3><p>' + r[2] + '</p></div>' +
        '<label class="gmc-sw"><input type="checkbox" data-c="' + r[0] + '"' +
        (nec ? ' checked disabled' : '') + ' aria-label="' + r[1] + '"><i></i></label></div>';
    }).join('');
    panel.innerHTML =
      '<div class="gmc-pan" role="dialog" aria-modal="true" aria-label="Set&#259;ri cookies">' +
      '<h2>Set&#259;ri cookies</h2>' +
      '<p>Alege ce categorii permiti. Poti reveni oricand asupra optiunii, din butonul rotund din coltul din stanga-jos.</p>' +
      rows +
      '<div class="gmc-pact">' +
      '<button type="button" class="gmc-b gmc-b--all" data-a="all">Accept tot</button>' +
      '<button type="button" class="gmc-b gmc-b--save" data-a="save">Salveaz&#259; optiunile</button>' +
      '<button type="button" class="gmc-b gmc-b--rej" data-a="rej">Refuz tot</button>' +
      '</div></div>';
    document.body.appendChild(panel);
    panel.addEventListener('click', function (e) {
      if (e.target === panel) { panel.classList.remove('on'); return; }
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'all') save({ preferences: 1, analytics: 1, marketing: 1 });
      else if (a === 'rej') save({ preferences: 0, analytics: 0, marketing: 0 });
      else {
        var o = {};
        panel.querySelectorAll('input[data-c]').forEach(function (i) { o[i.getAttribute('data-c')] = i.checked; });
        save(o);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('on')) panel.classList.remove('on');
    });
  }

  function buildFloat() {
    floatBtn = document.createElement('button');
    floatBtn.type = 'button';
    floatBtn.className = 'gmc-fl';
    floatBtn.setAttribute('aria-label', 'Setari cookies');
    floatBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
      '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10.6 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16.11 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.43 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    document.body.appendChild(floatBtn);
    floatBtn.addEventListener('click', openPanel);
  }

  function openPanel() {
    var d = readConsent();
    panel.querySelectorAll('input[data-c]').forEach(function (i) {
      var c = i.getAttribute('data-c');
      if (c === 'necessary') { i.checked = true; return; }
      i.checked = d ? !!d[c] : false;
    });
    panel.classList.add('on');
    bar.classList.remove('on');
  }

  function save(o) {
    var d = writeConsent(o);
    apply(d);
    bar.classList.remove('on');
    panel.classList.remove('on');
    floatBtn.classList.add('on');
  }

  /* ---------------- init ---------------- */
  function init() {
    css(); buildBar(); buildPanel(); buildFloat();

    // linkuri externe care deschid panoul (bara ANPC)
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-gmc-open]');
      if (t) { e.preventDefault(); openPanel(); }
    });

    var d = readConsent();
    if (d) { apply(d); floatBtn.classList.add('on'); }
    else { bar.classList.add('on'); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
