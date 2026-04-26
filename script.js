/* ============================================
   ELI GRONICH — Interactions
   ============================================ */

// Always start from top on load/refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');
    const hidePreloader = () => preloader.classList.add('hidden');
    window.addEventListener('load', () => setTimeout(hidePreloader, 700));
    setTimeout(hidePreloader, 2400);




    /* ---------- Navigation ---------- */
    const nav = document.getElementById('nav');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });


    /* ---------- Mobile Menu ---------- */
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    menu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    /* ---------- Smooth Scroll ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 90,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* ---------- Scroll Animations ---------- */
    const animEls = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = (entry.target.dataset.delay || 0) * 140;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    animEls.forEach(el => observer.observe(el));


    /* ---------- Counter Animation ---------- */
    const counters = document.querySelectorAll('.counter-number');
    let counted = false;

    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counted) {
                counted = true;
                counters.forEach(c => {
                    const target = +c.dataset.count;
                    const start = performance.now();
                    const duration = 2800;

                    (function tick(now) {
                        const p = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - p, 4);
                        c.textContent = Math.round(target * eased);
                        if (p < 1) requestAnimationFrame(tick);
                    })(start);
                });
            }
        });
    }, { threshold: 0.5 });

    const counterSection = document.querySelector('.hero-counter');
    if (counterSection) counterObs.observe(counterSection);




    /* ---------- Subtle Hero Parallax ---------- */
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth - 0.5) * 4;
            const y = (e.clientY / window.innerHeight - 0.5) * 4;
            heroContent.style.transform = `translate(${x}px, ${y}px)`;
        }, { passive: true });
    }


    /* ---------- Watermark Parallax ---------- */
    const watermark = document.getElementById('watermark');
    const aboutSection = document.getElementById('about');

    if (watermark && aboutSection) {
        window.addEventListener('scroll', () => {
            const rect = aboutSection.getBoundingClientRect();
            const viewH = window.innerHeight;

            if (rect.top < viewH && rect.bottom > 0) {
                const progress = (viewH - rect.top) / (viewH + rect.height);
                const shift = (progress - 0.5) * 30;
                watermark.style.transform = `translateY(calc(-50% + ${shift}px))`;
            }
        }, { passive: true });
    }


    /* ---------- Gold Line Reveal ---------- */
    document.querySelectorAll('.card-line, .label-line, .section-divider-line').forEach(line => {
        const lineObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    lineObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        lineObs.observe(line);
    });




    /* ---------- Train Infinite Loop + Touch ---------- */
    const train = document.getElementById('baTrain');
    if (train) {
        const origCards = Array.from(train.children);
        origCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            train.appendChild(clone);
        });
        const totalCards = train.children.length;
        train.style.animationDuration = (totalCards * 5) + 's';

        // Touch: pause animation, resume after 2s from same spot
        if ('ontouchstart' in window) {
            const wrap = train.closest('.ba-train-wrap');
            let resumeTimer = null;

            wrap.addEventListener('touchstart', () => {
                clearTimeout(resumeTimer);
                train.style.animationPlayState = 'paused';
            }, { passive: true });

            wrap.addEventListener('touchend', () => {
                resumeTimer = setTimeout(() => {
                    train.style.animationPlayState = 'running';
                }, 2000);
            }, { passive: true });
        }
    }


/* ---------- Video Modal ---------- */
    const videoModal = document.getElementById('videoModal');
    const videoModalPlayer = document.getElementById('videoModalPlayer');
    const videoModalBg = document.getElementById('videoModalBg');
    const videoModalClose = document.getElementById('videoModalClose');

    function openVideoModal(src) {
        videoModalPlayer.src = src;
        videoModal.classList.add('open');
        document.body.classList.add('modal-open');
        videoModalPlayer.play();
    }

    function closeVideoModal() {
        videoModalPlayer.pause();
        videoModal.classList.remove('open');
        document.body.classList.remove('modal-open');
        setTimeout(() => { videoModalPlayer.src = ''; }, 400);
    }

    document.querySelectorAll('.video-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const src = wrap.querySelector('video').getAttribute('src');
            openVideoModal(src);
        });
    });

    if (videoModalBg) videoModalBg.addEventListener('click', closeVideoModal);
    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && videoModal.classList.contains('open')) {
            closeVideoModal();
        }
    });

    /* ---------- Video Lazy Load ---------- */
    const videoCards = document.querySelectorAll('.video-wrap video');
    if (videoCards.length) {
        const videoObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.preload = 'metadata';
                    videoObs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });
        videoCards.forEach(v => videoObs.observe(v));
    }


    /* ---------- Cookie Settings Button ---------- */
    const cookieBtn = document.getElementById('openCookieBtn');
    if (cookieBtn) {
        cookieBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof openCookieSettings === 'function') openCookieSettings();
        });
    }

    /* ---------- Active Nav Link ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-cta)');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 160) {
                current = s.id;
            }
        });
        navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
        });
    }, { passive: true });


    /* ---------- Mobile: Auto-reveal hover states on scroll ---------- */
    if (!window.matchMedia('(hover: hover)').matches) {
        const hoverEls = document.querySelectorAll('.testimonial-card, .philosophy-card, .service-item, .video-card, .ba-train-card');
        const hoverObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('touch-active');
                    hoverObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        hoverEls.forEach(el => hoverObs.observe(el));
    }


    /* ---------- Instagram Deep Link ---------- */
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        document.querySelectorAll('[data-ig]').forEach(link => {
            const user = link.dataset.ig;
            link.href = `instagram://user?username=${user}`;
            link.removeAttribute('target');

            link.addEventListener('click', () => {
                let appOpened = false;

                // If page loses focus/visibility — app opened successfully
                const onHide = () => { appOpened = true; };
                document.addEventListener('visibilitychange', onHide);
                window.addEventListener('blur', onHide);

                // After 2s, check if app opened
                setTimeout(() => {
                    document.removeEventListener('visibilitychange', onHide);
                    window.removeEventListener('blur', onHide);

                    if (!appOpened) {
                        // App didn't open — go to web in new tab
                        window.open(`https://instagram.com/${user}`, '_blank');
                    }
                }, 2000);
            });
        });
    }


    /* ---------- Accessibility Widget ---------- */
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yPanel = document.getElementById('a11yPanel');
    const a11yClose = document.getElementById('a11yClose');

    if (a11yToggle && a11yPanel) {
        let fontScale = 0;

        a11yToggle.addEventListener('click', () => {
            a11yPanel.classList.toggle('open');
        });

        a11yClose.addEventListener('click', () => {
            a11yPanel.classList.remove('open');
        });

        document.addEventListener('click', e => {
            if (!e.target.closest('.a11y-widget')) {
                a11yPanel.classList.remove('open');
            }
        });

        a11yPanel.querySelectorAll('.a11y-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                switch (action) {
                    case 'font-up':
                        fontScale = Math.min(fontScale + 1, 4);
                        document.documentElement.style.fontSize = (16 + fontScale * 2) + 'px';
                        break;
                    case 'font-down':
                        fontScale = Math.max(fontScale - 1, -2);
                        document.documentElement.style.fontSize = (16 + fontScale * 2) + 'px';
                        break;
                    case 'contrast':
                        document.body.classList.toggle('a11y-contrast');
                        btn.classList.toggle('active');
                        break;
                    case 'links':
                        document.body.classList.toggle('a11y-links');
                        btn.classList.toggle('active');
                        break;
                    case 'grayscale':
                        document.body.classList.toggle('a11y-grayscale');
                        btn.classList.toggle('active');
                        break;
                    case 'readable-font':
                        document.body.classList.toggle('a11y-readable');
                        btn.classList.toggle('active');
                        break;
                    case 'reset':
                        fontScale = 0;
                        document.documentElement.style.fontSize = '';
                        document.body.classList.remove('a11y-contrast', 'a11y-links', 'a11y-grayscale', 'a11y-readable');
                        a11yPanel.querySelectorAll('.a11y-btn.active').forEach(b => b.classList.remove('active'));
                        break;
                }
            });
        });
    }

});
