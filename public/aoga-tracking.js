/*! AOGA tracking v2 (Next.js + Razorpay). Load once, site-wide, in app/layout:
 *   <Script src="/aoga-tracking.js" strategy="afterInteractive" />
 * No secrets here; the pixel ID is public by design. Do NOT add another Meta Pixel snippet.
 */
(function () {
  'use strict';
  if (window.AOGA) return; // loaded once
  var CFG = window.AOGA_CONFIG || {};
  var PIXEL_ID = CFG.pixelId || '1117465297387226';
  var ATTR_KEY = 'aoga_attr_v1';
  var ATTR_DAYS = 30;

  // ---- 1. Meta Pixel base code (official snippet) ----
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');

  // ---- 2. Helpers ----
  function getJSON(kind, key) { try { return JSON.parse(window[kind].getItem(key) || 'null'); } catch (e) { return null; } }
  function setJSON(kind, key, val) { try { window[kind].setItem(key, JSON.stringify(val)); } catch (e) {} }
  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ---- 3. Attribution: UTM, fbclid and gym code survive page changes (30 days; a new ad click wins) ----
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gym'];
  function captureAttribution() {
    var q = new URLSearchParams(location.search);
    var saved = getJSON('localStorage', ATTR_KEY) || {};
    if (saved.ts && Date.now() - saved.ts > ATTR_DAYS * 864e5) saved = {};
    var fresh = {};
    KEYS.forEach(function (k) { var v = q.get(k) || (k === 'gym' ? q.get('ref') : null); if (v) fresh[k] = v.slice(0, 200); });
    if (!Object.keys(fresh).length) return;
    if (fresh.fbclid && fresh.fbclid !== saved.fbclid) fresh.fbclid_ts = Date.now();
    var keepGym = saved.gym; // a gym code is kept even when a later ad click has no gym
    saved = Object.assign({}, fresh.utm_source ? {} : saved, fresh, { ts: Date.now() });
    if (!saved.gym && keepGym) saved.gym = keepGym;
    setJSON('localStorage', ATTR_KEY, saved);
  }
  captureAttribution();
  function attribution() { return getJSON('localStorage', ATTR_KEY) || {}; }
  function fbc() {
    var c = cookie('_fbc'); if (c) return c;
    var a = attribution();
    return a.fbclid ? 'fb.1.' + (a.fbclid_ts || Date.now()) + '.' + a.fbclid : '';
  }

  // ---- 4. Public API used by the register flow ----
  var viewed = {};
  var lastIc = null;
  var AOGA = {
    attribution: attribution,

    // Merge into the body of POST /api/order as `tracking`. Creates a fresh event id each call.
    trackingPayload: function () {
      var a = attribution();
      lastIc = 'ic_' + uuid();
      return {
        event_id: lastIc, fbp: cookie('_fbp'), fbc: fbc(),
        utm_source: a.utm_source || '', utm_medium: a.utm_medium || '', utm_campaign: a.utm_campaign || '', utm_content: a.utm_content || '',
        gym: a.gym || '', page_url: location.href.split('#')[0],
      };
    },

    // Sport chosen on step 1, or a sport section seen (auto for elements with data-aoga-sport="...").
    viewSport: function (sport) {
      if (!sport || viewed[sport]) return; viewed[sport] = 1;
      window.fbq('track', 'ViewContent', { content_name: sport, content_category: 'registration' });
    },

    // After /api/order returned a Razorpay order (paid category). Same event id as the server copy.
    registrationStarted: function (o) {
      window.fbq('track', 'InitiateCheckout',
        { currency: 'INR', value: o.value, content_name: o.sport, content_category: o.label, num_items: 1 },
        { eventID: o.eventId || lastIc });
    },

    // In the Razorpay handler, after /api/verify succeeded. Same event id as the server webhook Purchase.
    paid: function (o) {
      var key = 'aoga_purchase_' + o.orderId;
      if (getJSON('localStorage', key)) return; // never twice in this browser
      window.fbq('track', 'Purchase',
        { currency: 'INR', value: o.value, content_name: o.sport, content_category: o.label, num_items: 1 },
        { eventID: 'purchase_' + o.orderId });
      setJSON('localStorage', key, 1);
    },

    // Free Star Category registration (no payment).
    freeRegistered: function (o) {
      window.fbq('track', 'CompleteRegistration', { content_name: o.label, value: 0, currency: 'INR', status: 'free' }, { eventID: 'reg_' + o.regId });
    },

    whatsappClick: function (keyword) {
      window.fbq('track', 'Contact', { content_name: keyword || 'whatsapp' });
    },
  };

  // ---- 5. Auto: WhatsApp clicks, sport sections, page changes inside the Next.js app ----
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me\/|api\.whatsapp\.com\//i.test(href)) {
      var kw = ''; try { kw = (new URL(href, location.href).searchParams.get('text') || '').split(/\s/)[0]; } catch (err) {}
      AOGA.whatsappClick(a.getAttribute('data-aoga-keyword') || kw || 'whatsapp');
    }
  }, true);

  var io = null;
  function bindSportViews() {
    var els = document.querySelectorAll('[data-aoga-sport]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { AOGA.viewSport(el.getAttribute('data-aoga-sport')); }); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { AOGA.viewSport(en.target.getAttribute('data-aoga-sport')); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  var lastPath = location.pathname;
  function onRouteChange() {
    if (location.pathname === lastPath) return; // query-only changes are not new pages
    lastPath = location.pathname;
    viewed = {};
    captureAttribution();
    window.fbq('track', 'PageView');
    setTimeout(bindSportViews, 600);
  }
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    history[m] = function () { var r = orig.apply(this, arguments); onRouteChange(); return r; };
  });
  window.addEventListener('popstate', onRouteChange);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindSportViews); else bindSportViews();
  window.AOGA = AOGA;
})();
