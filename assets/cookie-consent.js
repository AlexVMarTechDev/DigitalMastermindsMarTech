/* Digital Masterminds: cookie consent banner (v1)
   - Strictly necessary cookies always run.
   - Non-essential scripts are written as <script type="text/plain" data-cookie-category="analytics|marketing">
     and only run after the visitor opts in here.
   - Honors Global Privacy Control (navigator.globalPrivacyControl): rejects non-essential by default.
   - Choice is stored in localStorage key "dmm_cookie_consent". Wrapped in try/catch so the banner still works without storage.
   - Any element with [data-cookie-settings] reopens the settings. */
(function () {
  'use strict';

  var KEY = 'dmm_cookie_consent';

  function read() {
    try { var r = window.localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }
  function write(c) {
    try { window.localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* storage blocked: banner shows again next visit */ }
  }
  function gpcOn() {
    return !!(window.navigator && window.navigator.globalPrivacyControl);
  }

  // Run every text/plain script whose category the visitor allowed.
  function activate(c) {
    var nodes = document.querySelectorAll('script[type="text/plain"][data-cookie-category]');
    Array.prototype.forEach.call(nodes, function (n) {
      var cat = n.getAttribute('data-cookie-category');
      if (!c || !c[cat]) return;
      var s = document.createElement('script');
      for (var i = 0; i < n.attributes.length; i++) {
        var a = n.attributes[i];
        if (a.name !== 'type' && a.name !== 'data-cookie-category') s.setAttribute(a.name, a.value);
      }
      s.text = n.text;
      n.parentNode.replaceChild(s, n);
    });
  }

  var banner, prefs, box, state = null;

  function css() {
    var st = document.createElement('style');
    st.textContent =
      '[hidden]{display:none!important}' +
      '#dmm-cc{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;padding:12px;font-family:Inter,Arial,Helvetica,sans-serif}' +
      '#dmm-cc .dmm-cc-in{max-width:980px;margin:0 auto;background:#171B1E;color:#D9D4E3;border:1px solid #2C3135;border-radius:16px;padding:20px 22px;box-shadow:0 18px 40px rgba(23,27,30,.35);display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center}' +
      '#dmm-cc .dmm-cc-copy{flex:1 1 380px;font-size:14px;line-height:1.55}' +
      '#dmm-cc .dmm-cc-h{font-family:Poppins,Arial,sans-serif;font-weight:700;font-size:16px;color:#fff;margin:0 0 4px}' +
      '#dmm-cc p{margin:0}' +
      '#dmm-cc a{color:#C9B6F5}' +
      '#dmm-cc .dmm-cc-acts{display:flex;flex-wrap:wrap;gap:10px}' +
      '#dmm-cc button{font:600 14px/1.2 Inter,Arial,Helvetica,sans-serif;border-radius:999px;padding:12px 18px;cursor:pointer;border:1px solid #6D28D9}' +
      '#dmm-cc .b1{background:#6D28D9;color:#fff}' +
      '#dmm-cc .b2{background:transparent;color:#EDE6FA;border-color:#4B4358}' +
      '#dmm-cc .dmm-cc-pref{flex:1 1 100%;display:grid;gap:12px;border-top:1px solid #2C3135;padding-top:14px}' +
      '#dmm-cc .dmm-cc-pref label{font-size:14px;display:flex;gap:10px;align-items:flex-start;cursor:pointer}' +
      '#dmm-cc .dmm-cc-pref input{margin-top:2px;accent-color:#8B5CF6;width:18px;height:18px;flex:0 0 18px}' +
      '#dmm-cc .dmm-cc-pref .b1{justify-self:start}' +
      '#dmm-cc .dmm-cc-note{font-size:13px;color:#A9A4B4}' +
      '#dmm-cc button:focus-visible,#dmm-cc a:focus-visible,#dmm-cc input:focus-visible{outline:3px solid #C9B6F5;outline-offset:2px}' +
      '@media (max-width:600px){#dmm-cc{padding:8px}#dmm-cc .dmm-cc-in{padding:16px}#dmm-cc .dmm-cc-acts{width:100%}#dmm-cc .dmm-cc-acts button{flex:1 1 30%;padding:12px 10px}}';
    document.head.appendChild(st);
  }

  function build() {
    css();
    banner = document.createElement('div');
    banner.id = 'dmm-cc';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'dmm-cc-t');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="dmm-cc-in">' +
        '<div class="dmm-cc-copy">' +
          '<p id="dmm-cc-t" class="dmm-cc-h">We use cookies</p>' +
          '<p>Strictly necessary cookies keep this site working and forms secure. With your permission we also use analytics and marketing cookies to understand the site and measure our ads. ' +
          '<a href="/cookies">Cookie Policy</a> &middot; <a href="/privacy-policy">Privacy Policy</a></p>' +
        '</div>' +
        '<div class="dmm-cc-acts">' +
          '<button type="button" class="b2" data-cc="reject">Reject non-essential</button>' +
          '<button type="button" class="b2" data-cc="manage" aria-expanded="false" aria-controls="dmm-cc-pref">Manage</button>' +
          '<button type="button" class="b1" data-cc="accept">Accept all</button>' +
        '</div>' +
        '<div id="dmm-cc-pref" class="dmm-cc-pref" hidden>' +
          '<p class="dmm-cc-note">Strictly necessary cookies are always on.</p>' +
          '<label><input type="checkbox" data-cat="analytics"> <span><strong>Analytics</strong>: how visitors use the site (Google Analytics and Tag Manager).</span></label>' +
          '<label><input type="checkbox" data-cat="marketing"> <span><strong>Marketing</strong>: measure and target our ads (LinkedIn Insight Tag).</span></label>' +
          '<button type="button" class="b1" data-cc="save">Save my choices</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    prefs = document.getElementById('dmm-cc-pref');

    banner.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-cc]') : null;
      if (!b) return;
      var act = b.getAttribute('data-cc');
      if (act === 'accept') save({ analytics: true, marketing: true });
      else if (act === 'reject') save({ analytics: false, marketing: false });
      else if (act === 'manage') togglePrefs();
      else if (act === 'save') {
        var a = banner.querySelector('input[data-cat="analytics"]').checked;
        var m = banner.querySelector('input[data-cat="marketing"]').checked;
        save({ analytics: a, marketing: m });
      }
    });

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
      if (!t) return;
      e.preventDefault();
      openSettings();
    });
  }

  function togglePrefs() {
    var open = prefs.hidden;
    prefs.hidden = !open;
    banner.querySelector('button[data-cc="manage"]').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = banner.querySelector('input[data-cat="analytics"]');
      if (first) first.focus();
    }
  }

  function syncBoxes(c) {
    banner.querySelector('input[data-cat="analytics"]').checked = !!(c && c.analytics);
    banner.querySelector('input[data-cat="marketing"]').checked = !!(c && c.marketing);
  }

  function openSettings() {
    syncBoxes(state);
    prefs.hidden = false;
    banner.querySelector('button[data-cc="manage"]').setAttribute('aria-expanded', 'true');
    banner.hidden = false;
    var first = banner.querySelector('input[data-cat="analytics"]');
    if (first) first.focus();
  }

  function save(choice) {
    var prev = state;
    var c = { v: 1, analytics: !!choice.analytics, marketing: !!choice.marketing, ts: Date.now() };
    write(c);
    state = c;
    banner.hidden = true;
    // If a category was switched off, scripts already running can't be undone: reload to drop them.
    var revoked = prev && ((prev.analytics && !c.analytics) || (prev.marketing && !c.marketing));
    if (revoked) { window.location.reload(); return; }
    activate(c);
  }

  function init() {
    build();
    state = read();
    if (state) { activate(state); return; }
    if (gpcOn()) {
      // Respect the browser's Global Privacy Control signal: non-essential off, no banner.
      state = { v: 1, analytics: false, marketing: false, gpc: true, ts: Date.now() };
      write(state);
      return;
    }
    banner.hidden = false;
  }

  window.dmmCookieSettings = openSettings;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
