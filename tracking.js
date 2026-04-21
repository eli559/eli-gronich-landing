/**
 * Landing Page Tracking — Eli Gronich
 * Auto-tracks: page views, WhatsApp clicks, Instagram clicks,
 * phone calls, CTA buttons, scroll depth, form submissions.
 * Sends to private analytics dashboard.
 */

// ══════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════

const API_KEY = 'pk_landing_7f3a9c2e1b4d6e8a0f5c3b7d9e1a4f6c8b2d0e3a5c7f9b';
const ENDPOINT = 'https://management-dashboard-248948614304.me-west1.run.app/api/events/ingest';

// ══════════════════════════════════════════
//  Internal
// ══════════════════════════════════════════

function getSessionId() {
  try {
    var s = sessionStorage.getItem('_t_sid');
    if (s) return s;
  } catch(e) {}
  var id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  try { sessionStorage.setItem('_t_sid', id); } catch(e) {}
  return id;
}

var _sid = getSessionId();
var _scrollMarks = {};

function send(eventName, metadata) {
  try {
    var payload = {
      apiKey: API_KEY,
      eventName: eventName,
      sessionId: _sid,
      userIdentifier: null,
      page: window.location.pathname,
      value: null,
      metadata: metadata || {}
    };

    // Add referrer on first event
    if (document.referrer) {
      payload.metadata.referrer = document.referrer.substring(0, 200);
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function() {});
  } catch(e) {}
}

// ══════════════════════════════════════════
//  1. Page View — auto on load
// ══════════════════════════════════════════

send('page_view', {
  url: window.location.href,
  screen: window.innerWidth + 'x' + window.innerHeight
});

// ══════════════════════════════════════════
//  2. Click Tracking — WhatsApp, Instagram, Phone, CTA
// ══════════════════════════════════════════

document.addEventListener('click', function(e) {
  var el = e.target;

  // Walk up to find the <a> or <button>
  while (el && el !== document.body) {
    var tag = el.tagName;
    var href = el.getAttribute('href') || '';
    var cls = el.className || '';

    // WhatsApp
    if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
      send('click_whatsapp', { href: href.substring(0, 200) });
      return;
    }

    // Instagram
    if (href.indexOf('instagram.com') !== -1) {
      send('click_instagram', { href: href.substring(0, 200) });
      return;
    }

    // Phone
    if (href.indexOf('tel:') === 0) {
      send('click_phone', { number: href.replace('tel:', '') });
      return;
    }

    // CTA buttons
    if (cls.indexOf('btn') !== -1 || cls.indexOf('cta') !== -1 || cls.indexOf('CTA') !== -1) {
      var text = (el.textContent || '').trim().substring(0, 50);
      send('click_cta', { text: text, class: cls.substring(0, 100) });
      return;
    }

    // External links
    if (tag === 'A' && href.indexOf('http') === 0 && href.indexOf(window.location.host) === -1) {
      send('click_external', { href: href.substring(0, 200) });
      return;
    }

    el = el.parentElement;
  }
}, true);

// ══════════════════════════════════════════
//  3. Scroll Depth — 25%, 50%, 75%, 100%
// ══════════════════════════════════════════

window.addEventListener('scroll', function() {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return;

  var pct = Math.round((scrollTop / docHeight) * 100);

  var marks = [25, 50, 75, 100];
  for (var i = 0; i < marks.length; i++) {
    if (pct >= marks[i] && !_scrollMarks[marks[i]]) {
      _scrollMarks[marks[i]] = true;
      send('scroll_depth', { depth: marks[i] });
    }
  }
}, { passive: true });

// ══════════════════════════════════════════
//  4. Form Submit
// ══════════════════════════════════════════

document.addEventListener('submit', function(e) {
  var form = e.target;
  var id = form.id || form.getAttribute('name') || 'unknown';
  send('form_submit', { form_id: id });
}, true);

// ══════════════════════════════════════════
//  5. Time on Page — send on leave
// ══════════════════════════════════════════

var _startTime = Date.now();

function sendTimeOnPage() {
  var seconds = Math.round((Date.now() - _startTime) / 1000);
  if (seconds > 2) {
    send('time_on_page', { seconds: seconds });
  }
}

document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') sendTimeOnPage();
});

window.addEventListener('beforeunload', sendTimeOnPage);
