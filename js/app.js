// ==========================================
// SERVO FIEL — LANDING PAGE ANIMATION SYSTEM
// Vanilla JS · 60fps · Zero dependencies
// ==========================================

'use strict';

/** Shorthand DOM selector */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/** Refresh Lucide icons after DOM mutations */
function refreshIcons() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


// ==========================================
// PARTICLE SYSTEM — Constellation Canvas
// ==========================================

const ParticleSystem = (() => {
  let canvas, ctx;
  let particles = [];
  let animId = null;
  let isPaused = false;

  // Gold / champagne palette with varying alpha
  const COLORS = [
    { r: 212, g: 175, b: 55 },   // Classic gold
    { r: 218, g: 189, b: 104 },  // Champagne
    { r: 196, g: 164, b: 75 },   // Muted gold
    { r: 230, g: 200, b: 120 },  // Light gold
    { r: 180, g: 150, b: 60 },   // Dark gold
  ];

  const CONNECTION_DISTANCE = 120;

  class Particle {
    constructor(w, h) {
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = 1 + Math.random() * 2;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 0.1 + Math.random() * 0.3;
      this.pulseSpeed = 0.005 + Math.random() * 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(w, h, time) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;

      this.currentAlpha = this.alpha + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.08;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.currentAlpha})`;
      ctx.fill();
    }
  }

  function getParticleCount() {
    return window.innerWidth < 768 ? 35 : 65;
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const target = getParticleCount();
    while (particles.length < target) {
      particles.push(new Particle(canvas.width, canvas.height));
    }
    while (particles.length > target) {
      particles.pop();
    }
  }

  function drawConnections() {
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212,175,55,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop(time) {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.update(canvas.width, canvas.height, time);
      p.draw(ctx);
    }

    drawConnections();

    animId = requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('particleCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'particleCanvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
      document.body.prepend(canvas);
    }

    ctx = canvas.getContext('2d');
    resize();

    const count = getParticleCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    animId = requestAnimationFrame(loop);

    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isPaused = false;
        animId = requestAnimationFrame(loop);
      }
    });
  }

  return { init };
})();


// ==========================================
// RIPPLE EFFECT — Material-style touch feedback
// ==========================================

const RippleEffect = (() => {

  function attach() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const computed = getComputedStyle(btn);
      if (computed.position === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';

      const ripple = document.createElement('span');
      ripple.className = 'ripple';

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position:absolute;
        left:${x}px;
        top:${y}px;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:rgba(212,175,55,0.25);
        transform:scale(0);
        pointer-events:none;
        z-index:1;
      `;

      btn.appendChild(ripple);

      ripple.animate([
        { transform: 'scale(0)', opacity: 0.6 },
        { transform: 'scale(1)', opacity: 0 }
      ], {
        duration: 600,
        easing: 'ease-out',
        fill: 'forwards'
      }).onfinish = () => ripple.remove();
    });
  }

  return { attach };
})();


// ==========================================
// SCROLL REVEAL — IntersectionObserver
// ==========================================

const ScrollReveal = (() => {
  let observer = null;

  function init() {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      }
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    const selectors = [
      '.sales-block',
      '.audience-card',
      '.module-card',
      '.testimonial-card',
      '.faq-item',
      '.support-block',
      '.support-item',
      '.offer',
    ];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
      });
    }

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      if (!el.classList.contains('revealed')) {
        observer.observe(el);
      }
    });
  }

  return { init };
})();


// ==========================================
// 3D TILT EFFECT — Module Cards
// ==========================================

const TiltEffect = (() => {
  const MAX_DEGREES = 5;

  function init() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.module-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const nx = (e.clientX - centerX) / (rect.width / 2);
      const ny = (e.clientY - centerY) / (rect.height / 2);

      const rotateY = Math.max(-MAX_DEGREES, Math.min(MAX_DEGREES, nx * MAX_DEGREES));
      const rotateX = Math.max(-MAX_DEGREES, Math.min(MAX_DEGREES, -ny * MAX_DEGREES));

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease-out';
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.module-card');
      if (!card) return;
      if (!card.contains(e.relatedTarget)) {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease-out';
      }
    });
  }

  return { init };
})();


// ==========================================
// ANIMATED COUNTER — Price reveal
// ==========================================

const AnimatedCounter = (() => {
  let hasPlayed = false;

  function animateValue(element, start, end, duration) {
    if (!element) return;

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);

      element.innerHTML = `por apenas <strong>R$ ${current},90</strong>`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function init() {
    const priceEl = document.querySelector('.offer__price');
    if (!priceEl) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasPlayed) {
          hasPlayed = true;
          animateValue(priceEl, 0, 49, 1500);
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.3 });

    observer.observe(priceEl);
  }

  return { init };
})();


// ==========================================
// VSL PLAYER — Click to embed video
// ==========================================

const VSLPlayer = (() => {

  const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/PKheeW8KMe0?autoplay=1&rel=0&modestbranding=1';

  function init() {
    const placeholder = $('#vslPlaceholder');
    const iframe = $('#vslVideo');
    const playBtn = $('#vslPlayBtn');

    if (!placeholder || !iframe || !playBtn) return;

    playBtn.addEventListener('click', () => {
      // Fade placeholder out
      placeholder.style.transition = 'opacity 0.4s ease';
      placeholder.style.opacity = '0';

      setTimeout(() => {
        placeholder.style.display = 'none';
        iframe.src = VIDEO_EMBED_URL;
        iframe.classList.remove('hidden');

        // Fade iframe in
        iframe.style.opacity = '0';
        iframe.style.transition = 'opacity 0.4s ease';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            iframe.style.opacity = '1';
          });
        });
      }, 400);
    });
  }

  return { init };
})();


// ==========================================
// HEADER — Sticky scroll behavior
// ==========================================

function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.style.boxShadow = '0 4px 32px hsla(210,50%,8%,0.35)';
    } else {
      header.style.boxShadow = '';
    }
  }, { passive: true });
}


// ==========================================
// HERO ENTRANCE ANIMATION
// ==========================================

function animateHeroEntrance() {
  const elements = [
    { sel: '#hero-badge',        delay: 0   },
    { sel: '.hero__title',       delay: 120 },
    { sel: '.hero__sub',         delay: 220 },
    { sel: '.hero__stats',       delay: 320 },
    { sel: '.vsl-wrapper',       delay: 440 },
  ];

  elements.forEach(({ sel, delay }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'none';

    setTimeout(() => {
      el.style.transition = 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  });
}


// ==========================================
// INITIALIZATION — Wire everything up
// ==========================================

function init() {
  ParticleSystem.init();
  RippleEffect.attach();
  ScrollReveal.init();
  TiltEffect.init();
  AnimatedCounter.init();
  VSLPlayer.init();
  initHeader();
  refreshIcons();

  // Small delay so fonts/icons are ready before entrance animation
  setTimeout(animateHeroEntrance, 100);


}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);
