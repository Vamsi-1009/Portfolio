/* ================================================================
   PALLAM VAMSI — PORTFOLIO SCRIPT
   Full interactive, animated, immersive experience
================================================================ */

'use strict';

/* ================================================================
   UTILS
================================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const map = (v, a, b, c, d) => c + (v - a) / (b - a) * (d - c);

/* ================================================================
   CUSTOM CURSOR
================================================================ */
function initCursor() {
    const dot  = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (!dot || !ring || window.innerWidth < 768) return;

    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    let raf;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    // Smooth ring follow
    function animateRing() {
        rx = lerp(rx, mx, 0.15);
        ry = lerp(ry, my, 0.15);
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        raf = requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    const hoverTargets = 'a, button, .tag, .tech-badge, .proj-btn, .contact-item, .stat-card, .social-link';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverTargets)) {
            ring.classList.add('hovering');
            dot.style.transform = 'translate(-50%,-50%) scale(0.5)';
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverTargets)) {
            ring.classList.remove('hovering');
            dot.style.transform = 'translate(-50%,-50%) scale(1)';
        }
    });
}

/* ================================================================
   GLOBAL CANVAS — FLOATING PARTICLES (BACKGROUND)
================================================================ */
function initGlobalCanvas() {
    const canvas = $('#global-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => { resize(); initParticles(); });
    resize();

    const COLORS = [
        'rgba(108,99,255,',
        'rgba(56,189,248,',
        'rgba(244,114,182,',
        'rgba(52,211,153,'
    ];

    class BGParticle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 1.5 + 0.3;
            this.speed = Math.random() * 0.3 + 0.05;
            this.angle = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.wobble = Math.random() * 0.02 - 0.01;
        }
        update() {
            this.angle += this.wobble;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -10) this.y = H + 10;
            if (this.y > H + 10) this.y = -10;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor(W / 12), 120);
        particles = Array.from({ length: count }, () => new BGParticle());
    }

    initParticles();

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(draw);
    }
    draw();
}

/* ================================================================
   HERO CANVAS — INTERACTIVE CONSTELLATION
================================================================ */
function initHeroCanvas() {
    const canvas = $('#hero-canvas');
    const hero   = $('#hero');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let mouseX = -999, mouseY = -999;

    function resize() {
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
    }

    window.addEventListener('resize', () => { resize(); initParticles(); });
    resize();

    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
        mouseX = -999; mouseY = -999;
    });

    class HeroParticle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.ox = this.x;
            this.oy = this.y;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 1.8 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? 'rgba(108,99,255,' : 'rgba(56,189,248,';
        }
        update() {
            // Mouse repulsion
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const REPEL = 120;

            if (dist < REPEL) {
                const force = (REPEL - dist) / REPEL;
                const angle = Math.atan2(dy, dx);
                this.vx -= Math.cos(angle) * force * 0.8;
                this.vy -= Math.sin(angle) * force * 0.8;
            }

            // Damping + drift back
            this.vx *= 0.95;
            this.vy *= 0.95;
            this.x += this.vx;
            this.y += this.vy;

            // Wrap
            if (this.x < 0) this.x = W;
            if (this.x > W) this.x = 0;
            if (this.y < 0) this.y = H;
            if (this.y > H) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor(W / 14), 80);
        particles = Array.from({ length: count }, () => new HeroParticle());
    }

    initParticles();

    function drawConnections() {
        const MAX_DIST = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_DIST) {
                    const alpha = (1 - d / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(draw);
    }
    draw();
}

/* ================================================================
   HERO ANIMATE-IN (staggered)
================================================================ */
function initHeroAnimations() {
    const items = $$('.animate-in');
    items.forEach((el, i) => {
        const delay = parseFloat(el.dataset.delay || 0) * 120 + 200;
        setTimeout(() => el.classList.add('show'), delay);
    });
}

/* ================================================================
   TYPED TEXT EFFECT
================================================================ */
function initTyped() {
    const el = $('#typed');
    if (!el) return;

    const phrases = [
        'Full Stack Developer',
        'Backend Engineer',
        'Node.js Enthusiast',
        'Problem Solver',
        'Open Source Builder',
        'System Designer',
    ];

    let pIdx = 0, cIdx = 0, deleting = false;

    function tick() {
        const cur = phrases[pIdx];
        if (!deleting) {
            el.textContent = cur.slice(0, ++cIdx);
            if (cIdx === cur.length) {
                deleting = true;
                setTimeout(tick, 2000);
                return;
            }
        } else {
            el.textContent = cur.slice(0, --cIdx);
            if (cIdx === 0) {
                deleting = false;
                pIdx = (pIdx + 1) % phrases.length;
            }
        }
        const speed = deleting ? 35 : Math.random() * 55 + 45;
        setTimeout(tick, speed);
    }
    tick();
}

/* ================================================================
   NAVBAR
================================================================ */
function initNavbar() {
    const navbar = $('#navbar');
    const hamburger = $('#hamburger');
    const navLinks  = $('#nav-links');
    if (!navbar) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // Hamburger
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            const spans = $$('span', hamburger);
            if (open) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';

                // Stagger links in
                $$('.nav-item', navLinks).forEach((a, i) => {
                    a.style.opacity = '0';
                    a.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        a.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        a.style.opacity = '1';
                        a.style.transform = 'translateY(0)';
                    }, 80 + i * 60);
                });
            } else {
                spans.forEach(s => s.style.transform = '');
                spans[1].style.opacity = '';
            }
        });

        $$('.nav-item', navLinks).forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const spans = $$('span', hamburger);
                spans.forEach(s => s.style.transform = '');
                spans[1].style.opacity = '';
            });
        });
    }
}

/* ================================================================
   SCROLL PROGRESS BAR
================================================================ */
function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        bar.style.width = clamp(pct, 0, 100) + '%';
    }, { passive: true });
}

/* ================================================================
   ACTIVE NAV LINK ON SCROLL
================================================================ */
function initActiveNav() {
    const sections = $$('section[id]');
    const anchors  = $$('.nav-links .nav-item');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 250) current = s.id;
        });
        anchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
    }, { passive: true });
}

/* ================================================================
   SECTION REVEAL (Intersection Observer)
================================================================ */
function initReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
                // Animate skill bars when skills section enters view
                if (entry.target.id === 'skills') animateSkillBars();
            }
        });
    }, { threshold: 0.1 });

    $$('.reveal-section').forEach(s => observer.observe(s));
}

/* ================================================================
   SKILL PROGRESS BARS
================================================================ */
function animateSkillBars() {
    $$('.progress-fill').forEach(bar => {
        const target = bar.dataset.width || '0';
        setTimeout(() => {
            bar.style.width = target + '%';
        }, 200);
    });
}

/* ================================================================
   COUNTER ANIMATION
================================================================ */
function initCounters() {
    const counters = $$('.counter, .counter-decimal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el      = entry.target;
            const target  = parseFloat(el.dataset.target || 0);
            const decimal = el.classList.contains('counter-decimal');
            const dur     = 1400;
            const start   = performance.now();

            function tick(now) {
                const t   = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
                const val = ease * target;
                el.textContent = decimal ? val.toFixed(2) : Math.floor(val);
                if (t < 1) requestAnimationFrame(tick);
                else el.textContent = decimal ? target.toFixed(2) : target;
            }
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* ================================================================
   PROJECT CARD 3D TILT
================================================================ */
function initTilt() {
    $$('.proj-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            const rX = y * -8;
            const rY = x * 8;
            card.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.03)`;
            card.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    });
}

/* ================================================================
   MAGNETIC ELEMENTS
================================================================ */
function initMagnetic() {
    if (window.innerWidth < 768) return;

    $$('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2)  * 0.28;
            const y = (e.clientY - rect.top  - rect.height / 2) * 0.28;
            el.style.transform = `translate(${x}px, ${y}px)`;
            el.style.transition = 'transform 0.1s ease';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    });
}

/* ================================================================
   TIMELINE FILL ON SCROLL
================================================================ */
function initTimeline() {
    const timeline = $('.timeline');
    const fill     = $('#timeline-fill');
    if (!timeline || !fill) return;

    function update() {
        const rect = timeline.getBoundingClientRect();
        const vh   = window.innerHeight;
        const start = vh * 0.85;
        const dist  = start - rect.top;
        const total = rect.height + start;
        const pct   = clamp((dist / total) * 100, 0, 100);
        fill.style.height = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* ================================================================
   BACK TO TOP
================================================================ */
function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ================================================================
   RIPPLE EFFECT ON BUTTONS
================================================================ */
function initRipple() {
    $$('.btn, .proj-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const rect   = btn.getBoundingClientRect();
            const x      = e.clientX - rect.left;
            const y      = e.clientY - rect.top;
            const ripple = document.createElement('span');

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.25);
                pointer-events: none;
                transform: scale(0);
                animation: rippleAnim 0.55s ease-out forwards;
                left: ${x - 50}px;
                top: ${y - 50}px;
                width: 100px;
                height: 100px;
            `;

            if (!document.getElementById('ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.textContent = '@keyframes rippleAnim { to { transform: scale(3); opacity: 0; } }';
                document.head.appendChild(style);
            }

            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/* ================================================================
   SECTION TITLE HOVER SHIMMER
================================================================ */
function initTitleShimmer() {
    $$('.section-title').forEach(title => {
        title.addEventListener('mouseenter', () => {
            title.style.backgroundImage = 'linear-gradient(90deg, #6c63ff 0%, #a78bfa 25%, #38bdf8 50%, #a78bfa 75%, #6c63ff 100%)';
            title.style.backgroundSize = '200% auto';
            title.style.animation = 'shimmer 1.5s linear infinite';
        });
        title.addEventListener('mouseleave', () => {
            title.style.backgroundImage = '';
            title.style.backgroundSize = '';
            title.style.animation = '';
        });
    });

    // Add shimmer keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shimmer {
            from { background-position: 0% center; }
            to   { background-position: 200% center; }
        }
    `;
    document.head.appendChild(style);
}

/* ================================================================
   SKILL TAG STAGGER ANIMATION
================================================================ */
function initSkillTagAnimate() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const tags = $$('.tag', entry.target);
            tags.forEach((tag, i) => {
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    tag.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0)';
                }, 100 + i * 60);
            });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    $$('.skill-category').forEach(c => observer.observe(c));
}

/* ================================================================
   SMOOTH ANCHOR SCROLL
================================================================ */
function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = $(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ================================================================
   CONTACT ITEM SPOTLIGHT
================================================================ */
function initContactSpotlight() {
    $$('.contact-icon-btn').forEach(item => {
        item.addEventListener('mousemove', e => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (!item.matches(':hover')) return;
            item.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(108,99,255,0.2), rgba(108,99,255,0.12) 70%)`;
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = '';
        });
    });
}

/* ================================================================
   PARALLAX HERO CONTENT
================================================================ */
function initParallax() {
    if (window.innerWidth < 768) return;
    const hero = $('#hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = $('.hero-content', hero);
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }, { passive: true });
}

/* ================================================================
   CLICK SPARK EFFECT
================================================================ */
function initClickSparks() {
    document.addEventListener('click', e => {
        if (window.innerWidth < 768) return;

        const colors = ['#6c63ff', '#a78bfa', '#38bdf8', '#f472b6', '#34d399'];
        const numSparks = 8;

        for (let i = 0; i < numSparks; i++) {
            const spark = document.createElement('div');
            const angle = (i / numSparks) * 360;
            const dist  = Math.random() * 40 + 20;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size  = Math.random() * 4 + 2;

            spark.style.cssText = `
                position: fixed;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                transform: translate(-50%, -50%);
                animation: sparkFly 0.6s ease-out forwards;
                --dx: ${Math.cos(angle * Math.PI / 180) * dist}px;
                --dy: ${Math.sin(angle * Math.PI / 180) * dist}px;
            `;
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 650);
        }
    });

    // Inject keyframe once
    if (!document.getElementById('spark-style')) {
        const s = document.createElement('style');
        s.id = 'spark-style';
        s.textContent = `
            @keyframes sparkFly {
                0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
                100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(s);
    }
}

/* ================================================================
   FLOATING CODE PARALLAX (Subtle scroll parallax)
================================================================ */
function initFloatingCodeParallax() {
    if (window.innerWidth < 768) return;
    const codes = $$('.floating-code');
    const speeds = [0.04, -0.03, 0.05];

    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        codes.forEach((el, i) => {
            el.style.transform = `translateY(${sy * speeds[i]}px)`;
        });
    }, { passive: true });
}

/* ================================================================
   PAGE LOAD ANIMATION
================================================================ */
function initPageLoad() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
}

/* ================================================================
   SKILL CARD GLOW ON HOVER
================================================================ */
function initSkillGlow() {
    $$('.skill-category').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width)  * 100;
            const y = ((e.clientY - rect.top)  / rect.height) * 100;
            card.style.setProperty('--gx', x + '%');
            card.style.setProperty('--gy', y + '%');
        });
    });
}

/* ================================================================
   INIT ALL
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initCursor();
    initGlobalCanvas();
    initHeroCanvas();
    initHeroAnimations();
    initTyped();
    initNavbar();
    initScrollProgress();
    initActiveNav();
    initReveal();
    initCounters();
    initTilt();
    initMagnetic();
    initTimeline();
    initBackToTop();
    initRipple();
    initTitleShimmer();
    initSkillTagAnimate();
    initSmoothScroll();
    initContactSpotlight();
    initParallax();
    initClickSparks();
    initFloatingCodeParallax();
    initSkillGlow();
});
