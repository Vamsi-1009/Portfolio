/* --- Navbar scroll effect --- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* --- Mobile hamburger --- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        const spans = hamburger.querySelectorAll('span');

        if (isOpen) {
            // Animate In - Stagger links
            const links = navLinks.querySelectorAll('a');
            links.forEach((link, idx) => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    link.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    link.style.opacity = '1';
                    link.style.transform = 'translateY(0)';
                }, 100 + (idx * 50));
            });

            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(s => s.style.transform = '');
            spans[1].style.opacity = '1';
        });
    });
}

/* --- Typed text effect --- */
const phrases = [
    'Full Stack Developer',
    'Backend Engineer',
    'Node.js Enthusiast',
    'Problem Solver',
    'Open Source Contributor',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed');

if (typedEl) {
    function type() {
        const current = phrases[phraseIdx];
        if (!deleting) {
            typedEl.textContent = current.slice(0, ++charIdx);
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(type, 1800);
                return;
            }
        } else {
            typedEl.textContent = current.slice(0, --charIdx);
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
            }
        }
        // Human-like typing variance
        const typingSpeed = deleting ? 40 : Math.random() * 50 + 50;
        setTimeout(type, typingSpeed);
    }
    type();
}

/* --- 3D TILT EFFECT FOR PROJECT CARDS --- */
const cards = document.querySelectorAll('.proj-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // max rotation deg
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

/* --- SCROLL REVEAL ANIMATIONS --- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // only animate once
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('section').forEach(sec => {
    revealObserver.observe(sec);
});

// Staggered children animation
const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll('.skill-tag, .edu-card, .timeline-item');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.animation = `fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`;
                    child.style.opacity = '1';
                }, index * 100);
            });
            staggerObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.skills-grid, .edu-grid, .timeline').forEach(grid => {
    staggerObserver.observe(grid);
});


/* --- PARTICLE BACKGROUND ANIMATION --- */
// Create canvas if it doesn't exist
const heroSection = document.getElementById('hero');
if (heroSection) {
    let canvas = document.getElementById('hero-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'hero-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0'; // Behind content
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0.6'; // Slightly more visible
        heroSection.prepend(canvas);
    }

    // Interactive Particles
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        particles.forEach(p => {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const angle = Math.atan2(dy, dx);
                p.vx -= Math.cos(angle) * 0.5;
                p.vy -= Math.sin(angle) * 0.5;
            }
        });
    });

    // ... rest of canvas logic ...
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? 'rgba(108, 99, 255, 0.5)' : 'rgba(56, 189, 248, 0.5)';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = w;
            if (this.x > w) this.x = 0;
            if (this.y < 0) this.y = h;
            if (this.y > h) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(window.innerWidth / 10, 100);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
}


/* --- Active nav linkHighlight --- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.clientHeight;
        if (window.scrollY >= top - 200) {
            current = sec.id;
        }
    });

    navAnchors.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${current}`) {
            a.classList.add('active');
        }
    });
});


/* --- CUSTOM CURSOR & SCROLL PROGRESS --- */
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const progressBar = document.getElementById('scroll-progress');

// Custom Cursor Logic
if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with lag
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .proj-card, .contact-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovered'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovered'));
    });
}

// Global Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (progressBar) progressBar.style.width = `${scrollPercent}%`;
});

// Timeline Line Drawing Animation
const timelineObj = document.querySelector('.timeline');
if (timelineObj) {
    // Create fill line if not exists
    let fillLine = document.querySelector('.timeline-line-fill');
    if (!fillLine) {
        fillLine = document.createElement('div');
        fillLine.className = 'timeline-line-fill';
        timelineObj.prepend(fillLine);
    }

    const updateTimeline = () => {
        const rect = timelineObj.getBoundingClientRect();
        const start = window.innerHeight * 0.8;
        const end = -rect.height;

        // Calculate how much of the timeline has been scrolled past
        const dist = start - rect.top;
        const total = rect.height + start;
        let percentage = (dist / total) * 100;

        // Clamp between 0 and 100
        percentage = Math.max(0, Math.min(100, percentage));

        // Only animate if visible
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            fillLine.style.height = `${percentage}%`;
        }
    };

    window.addEventListener('scroll', updateTimeline);
    updateTimeline(); // init
}
