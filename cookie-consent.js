/* ============================================
   Cookie Consent System — DigitalCraft
   Lightweight, GDPR-ready, no dependencies
   ============================================ */

(function() {
    'use strict';

    const CONSENT_KEY = 'dc_cookie_consent';
    const CONSENT_VERSION = '1';

    // Categories
    const CATEGORIES = {
        essential: { label: 'עוגיות חיוניות', desc: 'נדרשות לתפקוד בסיסי של האתר. לא ניתן לבטל.', required: true },
        analytics: { label: 'אנליטיקה', desc: 'עוזרות לנו להבין איך משתמשים באתר ולשפר אותו.', required: false }
    };

    // Scripts blocked until consent
    const BLOCKED_SCRIPTS = {
        analytics: ['tracking.js']
    };

    function getConsent() {
        try {
            const raw = localStorage.getItem(CONSENT_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.version !== CONSENT_VERSION) return null;
            return data;
        } catch(e) { return null; }
    }

    function saveConsent(categories) {
        const data = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            categories: categories
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    }

    function loadAllowedScripts(categories) {
        Object.keys(BLOCKED_SCRIPTS).forEach(cat => {
            if (categories[cat]) {
                BLOCKED_SCRIPTS[cat].forEach(src => {
                    if (!document.querySelector(`script[src="${src}"]`)) {
                        const s = document.createElement('script');
                        s.src = src;
                        s.defer = true;
                        document.body.appendChild(s);
                    }
                });
            }
        });
    }

    function removeBlockedScripts() {
        Object.keys(BLOCKED_SCRIPTS).forEach(cat => {
            BLOCKED_SCRIPTS[cat].forEach(src => {
                const el = document.querySelector(`script[src="${src}"]`);
                if (el) el.remove();
            });
        });
        // Clear sessionStorage from tracking
        sessionStorage.removeItem('_t_sid');
    }

    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookieConsent';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'הסכמה לעוגיות');
        banner.innerHTML = `
            <div class="cc-inner">
                <div class="cc-text">
                    <p>האתר משתמש בעוגיות לתפעול, מדידה ושיפור חוויה. עוגיות לא חיוניות יופעלו רק באישור.</p>
                    <a href="cookies.html" class="cc-link">מדיניות עוגיות</a>
                </div>
                <div class="cc-actions">
                    <button class="cc-btn cc-btn--accept" id="ccAcceptAll">אשר הכל</button>
                    <button class="cc-btn cc-btn--reject" id="ccRejectAll">דחה הכל</button>
                    <button class="cc-btn cc-btn--manage" id="ccManage">נהל העדפות</button>
                </div>
            </div>
            <div class="cc-prefs" id="ccPrefs" style="display:none;">
                <div class="cc-prefs-inner">
                    <h3 class="cc-prefs-title">ניהול העדפות עוגיות</h3>
                    ${Object.entries(CATEGORIES).map(([key, cat]) => `
                        <label class="cc-pref-row">
                            <span class="cc-pref-info">
                                <strong>${cat.label}</strong>
                                <span>${cat.desc}</span>
                            </span>
                            <input type="checkbox" ${cat.required ? 'checked disabled' : ''} data-cat="${key}" class="cc-toggle">
                        </label>
                    `).join('')}
                    <button class="cc-btn cc-btn--save" id="ccSavePrefs">שמור העדפות</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        bindEvents(banner);
    }

    function bindEvents(banner) {
        banner.querySelector('#ccAcceptAll').addEventListener('click', () => {
            const cats = {};
            Object.keys(CATEGORIES).forEach(k => cats[k] = true);
            saveConsent(cats);
            loadAllowedScripts(cats);
            closeBanner();
        });

        banner.querySelector('#ccRejectAll').addEventListener('click', () => {
            const cats = { essential: true };
            Object.keys(CATEGORIES).forEach(k => { if (!CATEGORIES[k].required) cats[k] = false; });
            saveConsent(cats);
            removeBlockedScripts();
            closeBanner();
        });

        banner.querySelector('#ccManage').addEventListener('click', () => {
            const prefs = banner.querySelector('#ccPrefs');
            prefs.style.display = prefs.style.display === 'none' ? 'block' : 'none';
        });

        banner.querySelector('#ccSavePrefs').addEventListener('click', () => {
            const cats = { essential: true };
            banner.querySelectorAll('.cc-toggle').forEach(cb => {
                if (cb.dataset.cat) cats[cb.dataset.cat] = cb.checked;
            });
            saveConsent(cats);
            if (cats.analytics) {
                loadAllowedScripts(cats);
            } else {
                removeBlockedScripts();
            }
            closeBanner();
        });
    }

    function closeBanner() {
        const el = document.getElementById('cookieConsent');
        if (el) {
            el.classList.add('cc-closing');
            setTimeout(() => el.remove(), 400);
        }
    }

    // Public: reopen preferences
    window.openCookieSettings = function() {
        const existing = document.getElementById('cookieConsent');
        if (existing) existing.remove();
        createBanner();
        const prefs = document.getElementById('ccPrefs');
        if (prefs) prefs.style.display = 'block';
        // Restore saved state
        const consent = getConsent();
        if (consent) {
            document.querySelectorAll('.cc-toggle').forEach(cb => {
                if (cb.dataset.cat && !CATEGORIES[cb.dataset.cat].required) {
                    cb.checked = !!consent.categories[cb.dataset.cat];
                }
            });
        }
    };

    // Init
    function init() {
        const consent = getConsent();
        if (consent) {
            // User already chose — load accordingly
            loadAllowedScripts(consent.categories);
        } else {
            // Remove tracking.js that may be in HTML (block before consent)
            removeBlockedScripts();
            // Show banner
            createBanner();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
