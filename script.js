/**
 * PLEASE CLICK ON THE BUTTON TO SEND AN EMAIL
 * Production-Grade JavaScript — ES6+ Modules Pattern
 *
 * EMAILJS SETUP (REQUIRED BEFORE GOING LIVE):
 * ─────────────────────────────────────────────
 * 1. Create a free account at https://www.emailjs.com
 * 2. Add a new "Email Service" (Gmail recommended) → copy the Service ID
 * 3. Create an Email Template with these variables:
 *      {{message}}   — the user's message
 *      {{from_name}} — always "Website Visitor"
 *      {{to_name}}   — your name
 *    Copy the Template ID
 * 4. Go to Account → API Keys → copy your Public Key
 * 5. Replace the three XXXXXXXXX placeholders below
 * ─────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════════
   CONFIG — Fill these in from EmailJS dashboard
   ══════════════════════════════════════════════ */
const CONFIG = {
  EMAILJS_PUBLIC_KEY:  '4M4JeJGIF0gzk6kQH',
  EMAILJS_SERVICE_ID:  'service_wcwkamm',
  EMAILJS_TEMPLATE_ID: 'template_w7cblho',
  RECIPIENT_EMAIL:     'aprokopev2011@gmail.com',
  MAX_CHARS:           2000,
  WARN_CHARS:          1800,
  MIN_CHARS:           2,
  MAX_RETRIES:         2,
  RETRY_DELAY_MS:      1500,
  NOTIFICATION_DURATION: 4000,
};

/* ══════════════════════════════════════════════
   INIT — Bootstrap everything on DOM ready
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);

  CursorGlow.init();
  ParticleCanvas.init();
  RevealObserver.init();
  ModalController.init();
  Composer.init();
  Notifications.init();

  // PWA service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('sw.js')
      .catch(() => { /* SW optional, silence errors */ });
  }
});

/* ══════════════════════════════════════════════
   CURSOR GLOW — Mouse-reactive lighting
   ══════════════════════════════════════════════ */
const CursorGlow = (() => {
  let dot, ring;
  // Dot follows mouse instantly
  let mx = -999, my = -999;
  // Ring follows with lerp lag
  let rx = -999, ry = -999;
  const LERP = 0.12;

  function init() {
    dot  = document.getElementById('cursor-dot');
    ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    // Hover detection on interactive elements
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('a, button, input, textarea, [role="button"]');
      document.body.classList.toggle('cursor-hover', !!el);
    });

    tick();
  }

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    // Dot moves instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  }

  function onLeave() {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  }

  function onEnter() {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  }

  function onDown() {
    document.body.classList.add('cursor-click');
  }

  function onUp() {
    document.body.classList.remove('cursor-click');
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    // Ring lags behind with lerp
    rx = lerp(rx, mx, LERP);
    ry = lerp(ry, my, LERP);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   PARTICLE CANVAS — Animated aurora background
   ══════════════════════════════════════════════ */
const ParticleCanvas = (() => {
  let canvas, ctx, w, h;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let rafId;
  let time = 0;

  const PARTICLE_COUNT = 80;
  const AURORA_BANDS   = 4;

  class Particle {
    constructor() { this.reset(true); }

    reset(random = false) {
      this.x   = Math.random() * w;
      this.y   = random ? Math.random() * h : h + 20;
      this.vx  = (Math.random() - 0.5) * 0.3;
      this.vy  = -(Math.random() * 0.4 + 0.1);
      this.r   = Math.random() * 1.5 + 0.3;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.5 + 0.15;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
      this.color = Math.random() < 0.5
        ? `${Math.floor(Math.random()*80+90)},${Math.floor(Math.random()*50+60)},255`
        : `34,${Math.floor(Math.random()*60+180)},238`;
    }

    update() {
      this.life++;
      const ratio = this.life / this.maxLife;

      // Fade in/out
      if (ratio < 0.1)       this.alpha = (ratio / 0.1) * this.maxAlpha;
      else if (ratio > 0.8)  this.alpha = ((1 - ratio) / 0.2) * this.maxAlpha;
      else                    this.alpha = this.maxAlpha;

      // Subtle mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.4;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Dampen velocity
      this.vx *= 0.99;
      this.vy *= 0.99;

      this.x += this.vx;
      this.y += this.vy;

      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawAurora() {
    const t = time * 0.0008;
    const bands = [
      { y: h * 0.1, color: [123,108,255], alpha: 0.04 },
      { y: h * 0.35, color: [34,211,238], alpha: 0.03 },
      { y: h * 0.65, color: [167,139,250], alpha: 0.035 },
      { y: h * 0.88, color: [52,211,153], alpha: 0.025 },
    ];

    bands.forEach((b, i) => {
      const waveY = b.y + Math.sin(t + i * 1.3) * 40;
      const grad = ctx.createLinearGradient(0, waveY - 120, 0, waveY + 120);
      grad.addColorStop(0, `rgba(${b.color.join(',')},0)`);
      grad.addColorStop(0.5, `rgba(${b.color.join(',')},${b.alpha})`);
      grad.addColorStop(1, `rgba(${b.color.join(',')},0)`);

      ctx.save();
      ctx.beginPath();

      // Wavy band using bezier
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= w; x += 80) {
        const wave = Math.sin(t * 1.5 + x * 0.008 + i) * 30;
        ctx.lineTo(x, waveY + wave);
      }
      ctx.lineTo(w, waveY + 120);
      ctx.lineTo(0, waveY + 120);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }

  function drawGrid() {
    const gridSize = 80;
    const alpha = 0.025;
    ctx.strokeStyle = `rgba(123,108,255,${alpha})`;
    ctx.lineWidth = 0.5;

    const offsetX = (time * 0.05) % gridSize;
    const offsetY = (time * 0.03) % gridSize;

    ctx.beginPath();
    for (let x = -offsetX; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = -offsetY; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function init() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    tick();
  }

  function tick() {
    time++;
    ctx.clearRect(0, 0, w, h);

    // Aurora bands
    drawAurora();

    // Subtle grid
    drawGrid();

    // Particles
    particles.forEach(p => { p.update(); p.draw(); });

    rafId = requestAnimationFrame(tick);
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   REVEAL OBSERVER — Intersection-based reveals
   ══════════════════════════════════════════════ */
const RevealObserver = (() => {
  function init() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   MODAL CONTROLLER — Open / close with spring
   ══════════════════════════════════════════════ */
const ModalController = (() => {
  let overlay, panel, openBtn, closeBtn, backdrop;
  let isOpen = false;
  let firstFocusable, lastFocusable;

  function init() {
    overlay    = document.getElementById('modal-overlay');
    openBtn    = document.getElementById('open-modal-btn');
    closeBtn   = document.getElementById('modal-close');
    backdrop   = document.getElementById('modal-backdrop');

    if (!overlay || !openBtn) return;

    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);

    // Keyboard handling
    document.addEventListener('keydown', onKeydown);

    // Button ripple effect
    openBtn.addEventListener('pointerdown', createRipple);

    // Hover micro-interaction for main button
    openBtn.addEventListener('mouseenter', () => {
      openBtn.querySelector('.btn-bg').style.opacity = '1.6';
    });
  }

  function open() {
    if (isOpen) return;
    isOpen = true;

    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-open');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Focus first focusable inside modal
    setTimeout(() => {
      const focusables = getFocusables();
      if (focusables.length) focusables[0].focus();
    }, 350);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Return focus
    openBtn.focus();

    // Reset composer after close
    setTimeout(() => {
      Composer.reset();
    }, 400);
  }

  function onKeydown(e) {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last  = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function getFocusables() {
    if (!overlay) return [];
    return Array.from(
      overlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.disabled && !el.closest('[aria-hidden="true"]'));
  }

  function createRipple(e) {
    const btn    = e.currentTarget;
    const ripple = btn.querySelector('.btn-ripple');
    if (!ripple) return;

    const rect = btn.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x - size/2}px;
      top: ${y - size/2}px;
      transform: scale(0);
      opacity: 0.3;
      animation: none;
    `;

    // Force reflow
    void ripple.offsetWidth;

    ripple.style.animation = `rippleAnim 0.6s ease-out forwards`;
  }

  return { init, open, close };
})();

/* ══════════════════════════════════════════════
   COMPOSER — Message input logic
   ══════════════════════════════════════════════ */
const Composer = (() => {
  let textarea, fromInput, charCount, charCounter, sendBtn, validationMsg;
  let successPanel, dismissBtn;
  let retryCount = 0;
  let isSending = false;
  let spamTimer = null;
  let lastSendTime = 0;
  const SPAM_COOLDOWN = 30000; // 30s cooldown between sends

  function init() {
    textarea      = document.getElementById('message-input');
    charCount     = document.getElementById('char-count');
    charCounter   = document.getElementById('char-counter');
    sendBtn       = document.getElementById('send-btn');
    validationMsg = document.getElementById('validation-msg');
    successPanel  = document.getElementById('success-panel');
    dismissBtn    = document.getElementById('dismiss-success');
    fromInput     = document.getElementById('from-input');

    if (!textarea) return;

    textarea.addEventListener('input', onInput);
    textarea.addEventListener('keydown', onKeydown);
    fromInput?.addEventListener('input', () => { if (fromInput.value.trim()) hideValidation(); });
    sendBtn?.addEventListener('click', onSend);
    dismissBtn?.addEventListener('click', onDismiss);

    // Auto-resize textarea
    textarea.addEventListener('input', autoResize);
    autoResize.call(textarea);
  }

  function autoResize() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 320) + 'px';
  }

  function onInput() {
    const len = textarea.value.length;
    charCount.textContent = len;

    // Color counter by usage
    charCounter.classList.remove('warn', 'limit');
    if (len >= CONFIG.WARN_CHARS) charCounter.classList.add('warn');
    if (len >= CONFIG.MAX_CHARS)  charCounter.classList.add('limit');

    // Clear validation on type
    if (len >= CONFIG.MIN_CHARS) hideValidation();
  }

  function onKeydown(e) {
    // Ctrl+Enter or Cmd+Enter to send
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend();
    }
  }

  async function onSend() {
    if (isSending) return;

    const sender  = fromInput?.value.trim();
    const message = textarea.value.trim();

    // ─ Validate name ─
    if (!sender) {
      showValidation('Please enter your name before sending.');
      fromInput?.focus();
      shakeFromInput();
      return;
    }

    // ─ Validate message ─
    if (!message) {
      showValidation('Please write a message before sending.');
      textarea.focus();
      shakeTextarea();
      return;
    }

    if (message.length < CONFIG.MIN_CHARS) {
      showValidation('Message is too short. Write at least a few characters.');
      textarea.focus();
      return;
    }

    // Spam guard
    const now = Date.now();
    if (now - lastSendTime < SPAM_COOLDOWN) {
      const remaining = Math.ceil((SPAM_COOLDOWN - (now - lastSendTime)) / 1000);
      showValidation(`Please wait ${remaining}s before sending another message.`);
      return;
    }

    // ─ Send ─
    retryCount = 0;
    await attemptSend(message, sender);
  }

  async function attemptSend(message, sender) {
    isSending = true;
    setSendState('loading');
    hideValidation();

    const mood   = window.__getMoodForSend?.();
    const params = {
      name:    sender,
      email:   CONFIG.RECIPIENT_EMAIL,
      title:   'New Message from your website',
      message: mood ? `${mood}

${message}` : message,
    };

    try {
      await emailjs.send(
        CONFIG.EMAILJS_SERVICE_ID,
        CONFIG.EMAILJS_TEMPLATE_ID,
        params
      );

      // ─ SUCCESS ─
      isSending = false;
      lastSendTime = Date.now();
      setSendState('success');
      retryCount = 0;

      setTimeout(() => {
        showSuccessPanel();
      }, 600);

    } catch (err) {
      isSending = false;

      // Retry logic
      if (retryCount < CONFIG.MAX_RETRIES) {
        retryCount++;
        setSendState('idle');
        Notifications.show('error', 'Retrying...', `Attempt ${retryCount + 1} of ${CONFIG.MAX_RETRIES + 1}`);

        await delay(CONFIG.RETRY_DELAY_MS * retryCount);
        await attemptSend(message, sender);
      } else {
        // Final failure
        setSendState('idle');
        retryCount = 0;
        handleSendError(err);
      }
    }
  }

  function setSendState(state) {
    sendBtn.classList.remove('is-loading', 'is-success');
    sendBtn.disabled = false;

    if (state === 'loading') {
      sendBtn.classList.add('is-loading');
      sendBtn.disabled = true;
    } else if (state === 'success') {
      sendBtn.classList.add('is-success');
      sendBtn.disabled = true;
    }
  }

  function handleSendError(err) {
    const errMsg = getErrorMessage(err);

    showValidation(errMsg);

    Notifications.show(
      'error',
      'Message Not Sent',
      'Check your connection and try again.'
    );

    // Re-enable send after short pause
    setTimeout(() => {
      setSendState('idle');
    }, 800);
  }

  function getErrorMessage(err) {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }
    if (err?.status === 400) {
      return 'Invalid message format. Please try again.';
    }
    if (err?.status === 429) {
      return 'Too many requests. Please wait a moment and retry.';
    }
    return 'Something went wrong. Please try again in a moment.';
  }

  function showSuccessPanel() {
    if (!successPanel) return;
    successPanel.removeAttribute('aria-hidden');
    successPanel.classList.add('is-visible');

    // Announce to screen readers
    successPanel.setAttribute('role', 'status');
    successPanel.setAttribute('aria-label', 'Message sent successfully');

    // Fire confetti
    launchConfetti();
    window.__onMessageSent?.();

    // Show notification too
    Notifications.show('success', 'Delivered!', 'Your message has been sent successfully.');
  }

  function onDismiss() {
    if (!successPanel) return;
    successPanel.classList.remove('is-visible');
    successPanel.setAttribute('aria-hidden', 'true');

    // Close modal after dismiss
    setTimeout(() => {
      ModalController.close();
    }, 200);
  }

  function reset() {
    if (!textarea) return;
    textarea.value = '';
    if (fromInput) fromInput.value = '';
    textarea.style.height = 'auto';
    charCount && (charCount.textContent = '0');
    charCounter?.classList.remove('warn', 'limit');
    hideValidation();
    setSendState('idle');

    successPanel?.classList.remove('is-visible');
    successPanel?.setAttribute('aria-hidden', 'true');
    retryCount = 0;
    isSending = false;
  }

  function showValidation(msg) {
    if (!validationMsg) return;
    validationMsg.textContent = msg;
    validationMsg.classList.add('is-visible');
  }

  function hideValidation() {
    if (!validationMsg) return;
    validationMsg.classList.remove('is-visible');
  }

  function shakeFromInput() {
    const wrapper = document.getElementById('from-wrapper');
    if (!wrapper) return;
    wrapper.style.animation = 'none';
    void wrapper.offsetWidth;
    wrapper.style.animation = 'shakeAnim 0.4s ease-out';
    setTimeout(() => { wrapper.style.animation = ''; }, 400);
  }

  function shakeTextarea() {
    const wrapper = document.getElementById('textarea-wrapper');
    if (!wrapper) return;
    wrapper.style.animation = 'none';
    void wrapper.offsetWidth;
    wrapper.style.animation = 'shakeAnim 0.4s ease-out';
    setTimeout(() => { wrapper.style.animation = ''; }, 400);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return { init, reset };
})();

/* ══════════════════════════════════════════════
   NOTIFICATIONS — Toast notification system
   ══════════════════════════════════════════════ */
const Notifications = (() => {
  let dock;

  const ICONS = {
    success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  function init() {
    dock = document.getElementById('notification-dock');
  }

  function show(type, title, message) {
    if (!dock) return;

    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <div class="notification-icon" aria-hidden="true">${ICONS[type] || ''}</div>
      <div class="notification-content">
        <div class="notification-title">${escapeHtml(title)}</div>
        <div class="notification-msg">${escapeHtml(message)}</div>
      </div>
      <div class="notification-progress" aria-hidden="true"></div>
    `;

    dock.appendChild(el);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-in');
      });
    });

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(el), CONFIG.NOTIFICATION_DURATION);

    el.addEventListener('click', () => {
      clearTimeout(timer);
      dismiss(el);
    });
  }

  function dismiss(el) {
    el.classList.replace('is-in', 'is-out');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    // Fallback removal
    setTimeout(() => el.remove(), 500);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  return { init, show };
})();

/* ══════════════════════════════════════════════
   CONFETTI — Particle burst on success
   ══════════════════════════════════════════════ */
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width  = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;

  const COLORS = [
    '#7b6cff', '#a78bfa', '#22d3ee',
    '#34d399', '#fbbf24', '#f472b6',
    '#c084fc', '#60a5fa',
  ];

  const pieces = Array.from({ length: 80 }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * H * 0.3 - 20,
    w:     Math.random() * 8 + 4,
    h:     Math.random() * 4 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:    (Math.random() - 0.5) * 4,
    vy:    Math.random() * 2 + 1,
    rot:   Math.random() * Math.PI * 2,
    drot:  (Math.random() - 0.5) * 0.2,
    alpha: 1,
  }));

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    pieces.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.07; // gravity
      p.rot += p.drot;

      if (frame > 80) p.alpha -= 0.015;
      p.alpha = Math.max(0, p.alpha);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });

    if (pieces.some(p => p.alpha > 0)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  draw();
}

/* ══════════════════════════════════════════════
   INJECT CSS-based shake animation
   ══════════════════════════════════════════════ */
(function injectShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shakeAnim {
      0%,100% { transform: translateX(0); }
      15%      { transform: translateX(-6px); }
      30%      { transform: translateX(6px); }
      45%      { transform: translateX(-5px); }
      60%      { transform: translateX(5px); }
      75%      { transform: translateX(-3px); }
      90%      { transform: translateX(3px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════
   MESSAGE COUNTER — Persisted in localStorage
   ══════════════════════════════════════════════ */
const MessageCounter = (() => {
  const KEY = 'pcb_msg_count';
  let count = 0;
  let el;

  function init() {
    el = document.getElementById('counter-num');
    if (!el) return;
    count = parseInt(localStorage.getItem(KEY) || '0', 10);
    animateTo(count, false);
  }

  function increment() {
    count++;
    localStorage.setItem(KEY, count);
    animateTo(count, true);
  }

  function animateTo(target, bump) {
    if (!el) return;
    el.textContent = target;
    if (bump) {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
  }

  return { init, increment };
})();

/* ══════════════════════════════════════════════
   SUCCESS SOUND — Web Audio API synth chime
   ══════════════════════════════════════════════ */
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const start = ctx.currentTime + i * 0.1;
      const end   = start + 0.4;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.start(start);
      osc.stop(end);
    });
  } catch (e) {
    // Audio not supported — silent fail
  }
}

/* ══════════════════════════════════════════════
   EASTER EGG — Click headline 5 times
   ══════════════════════════════════════════════ */
const EasterEgg = (() => {
  let clicks = 0;
  let timer;
  let active = false;

  const messages = [
    '🎨 Rainbow mode activated!',
    '✨ You found the secret!',
    '🌈 Much colour. Very wow.',
    '🎉 Easter egg unlocked!',
    '💜 Made with love by Claude',
  ];

  function init() {
    const headline = document.getElementById('hero-headline');
    if (!headline) return;

    headline.addEventListener('click', () => {
      clicks++;
      clearTimeout(timer);

      if (clicks >= 5) {
        clicks = 0;
        trigger();
      } else {
        // Reset click count after 2s inactivity
        timer = setTimeout(() => { clicks = 0; }, 2000);
      }
    });
  }

  function trigger() {
    if (active) {
      // Toggle off
      active = false;
      document.body.classList.remove('rainbow-mode');
      showToast('🌙 Back to normal mode');
      return;
    }

    active = true;
    document.body.classList.add('rainbow-mode');

    const msg = messages[Math.floor(Math.random() * messages.length)];
    showToast(msg);

    // Fire extra confetti burst
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) launchConfetti();
  }

  function showToast(msg) {
    // Remove existing
    document.querySelector('.easter-toast')?.remove();

    const toast = document.createElement('div');
    toast.className = 'easter-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   TYPING INDICATOR — Main button reacts to typing
   ══════════════════════════════════════════════ */
const TypingIndicator = (() => {
  let typingTimer;

  function init() {
    const textarea  = document.getElementById('message-input');
    const mainBtn   = document.getElementById('open-modal-btn');
    if (!textarea || !mainBtn) return;

    textarea.addEventListener('input', () => {
      mainBtn.classList.add('is-typing');
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        mainBtn.classList.remove('is-typing');
      }, 1500);
    });
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   WIRE UP new modules to DOMContentLoaded
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  MessageCounter.init();
  EasterEgg.init();
  TypingIndicator.init();
});

/* ══════════════════════════════════════════════
   HOOK SUCCESS → counter + sound
   ══════════════════════════════════════════════ */
// Patch launchConfetti to also fire counter + sound
const _origLaunchConfetti = launchConfetti;
window.__onMessageSent = function() {
  MessageCounter.increment();
  playSuccessSound();
};

/* ══════════════════════════════════════════════
   LAST MESSAGE TIME — "2m ago" style timer
   ══════════════════════════════════════════════ */
const LastMessageTime = (() => {
  const KEY = 'pcb_last_sent';
  let el, ticker;

  function init() {
    el = document.getElementById('last-msg-time');
    if (!el) return;

    const saved = localStorage.getItem(KEY);
    if (saved) start(parseInt(saved, 10));
  }

  function record() {
    const now = Date.now();
    localStorage.setItem(KEY, now);
    start(now);
  }

  function start(timestamp) {
    clearInterval(ticker);
    update(timestamp);
    ticker = setInterval(() => update(timestamp), 15000);
  }

  function update(timestamp) {
    if (!el) return;
    const diff = Math.floor((Date.now() - timestamp) / 1000);

    let label;
    if (diff < 60)        label = 'just now';
    else if (diff < 3600) label = Math.floor(diff / 60) + 'm ago';
    else if (diff < 86400) label = Math.floor(diff / 3600) + 'h ago';
    else                   label = Math.floor(diff / 86400) + 'd ago';

    el.textContent = label;

    // Green flash if recent
    if (diff < 10) {
      el.classList.add('fresh');
      setTimeout(() => el.classList.remove('fresh'), 3000);
    }
  }

  return { init, record };
})();

/* ══════════════════════════════════════════════
   AUTO-CLOSE — Closes success modal after 5s
   ══════════════════════════════════════════════ */
const AutoClose = (() => {
  let timer;

  function start() {
    clearTimeout(timer);
    // 1.3s delay matches the CSS animation delay
    timer = setTimeout(() => {
      const dismissBtn = document.getElementById('dismiss-success');
      dismissBtn?.click();
    }, 6500); // 1.3s delay + 5s countdown
  }

  function cancel() {
    clearTimeout(timer);
  }

  return { start, cancel };
})();

/* ══════════════════════════════════════════════
   KEYBOARD SHORTCUT — Press / to open modal
   ══════════════════════════════════════════════ */
const KeyboardShortcut = (() => {
  function init() {
    const hint = document.getElementById('shortcut-hint');

    // Show hint after 2s of inactivity
    let hintTimer = setTimeout(() => hint?.classList.add('is-visible'), 2000);

    // Hide hint once modal opens
    document.getElementById('open-modal-btn')?.addEventListener('click', () => {
      hint?.classList.remove('is-visible');
    });

    document.addEventListener('keydown', (e) => {
      // Don't fire if user is typing in an input/textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '/') {
        e.preventDefault();
        hint?.classList.remove('is-visible');
        document.getElementById('open-modal-btn')?.click();
      }
    });
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   WIRE UP new modules
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  LastMessageTime.init();
  KeyboardShortcut.init();
});

// Patch success hook to also record time + start auto-close
const _prevOnMessageSent = window.__onMessageSent;
window.__onMessageSent = function() {
  _prevOnMessageSent?.();
  LastMessageTime.record();
  AutoClose.start();
};

// Cancel auto-close if user clicks dismiss manually
document.getElementById('dismiss-success')?.addEventListener('mousedown', () => {
  AutoClose.cancel();
}, { capture: true });

/* ══════════════════════════════════════════════
   LIVE CLOCK — Riga timezone, updates every second
   ══════════════════════════════════════════════ */
const LiveClock = (() => {
  function init() {
    const el = document.getElementById('clock-display');
    if (!el) return;
    tick();
    setInterval(tick, 1000);

    function tick() {
      const now = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Riga',
        hour:     '2-digit',
        minute:   '2-digit',
        second:   '2-digit',
        hour12:   false,
      });
      el.textContent = now;
    }
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   MOOD SELECTOR — Pick mood, tint modal accent
   ══════════════════════════════════════════════ */
const MoodSelector = (() => {
  let selected = null;
  const moodClasses = ['mood-mode-excited','mood-mode-love','mood-mode-angry','mood-mode-thoughtful'];

  function init() {
    const btns = document.querySelectorAll('.mood-btn');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.dataset.mood;

        // Toggle off if same mood clicked
        if (selected === mood) {
          selected = null;
          btns.forEach(b => b.classList.remove('is-selected'));
          moodClasses.forEach(c => document.body.classList.remove(c));
          return;
        }

        selected = mood;
        btns.forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        // Apply mood colour theme to body
        moodClasses.forEach(c => document.body.classList.remove(c));
        if (mood !== 'happy') {
          document.body.classList.add(`mood-mode-${mood}`);
        }

        // Satisfying bounce animation on emoji
        btn.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.4) rotate(-10deg)' },
          { transform: 'scale(0.9) rotate(5deg)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' },
        ], { duration: 400, easing: 'ease-out' });
      });
    });
  }

  function getSelected() {
    if (!selected) return null;
    const btn = document.querySelector(`.mood-btn[data-mood="${selected}"]`);
    return btn ? `${btn.dataset.emoji} ${selected}` : null;
  }

  function reset() {
    selected = null;
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('is-selected'));
    moodClasses.forEach(c => document.body.classList.remove(c));
  }

  return { init, getSelected, reset };
})();

/* ══════════════════════════════════════════════
   MAGNETIC BUTTON — Attracts to cursor when near
   ══════════════════════════════════════════════ */
const MagneticButton = (() => {
  const STRENGTH  = 0.35; // how much it moves
  const THRESHOLD = 120;  // px radius of effect

  function init() {
    const wrap = document.getElementById('magnetic-wrap');
    const btn  = document.getElementById('open-modal-btn');
    if (!wrap || !btn) return;

    document.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < THRESHOLD) {
        const pull = (1 - dist / THRESHOLD);
        const tx   = dx * pull * STRENGTH;
        const ty   = dy * pull * STRENGTH;
        wrap.style.transform = `translate(${tx}px, ${ty}px)`;
        btn.style.transform  = `translate(${tx * 0.4}px, ${ty * 0.4}px)`;
      } else {
        wrap.style.transform = '';
        btn.style.transform  = '';
      }
    });

    // Snap back when mouse leaves window
    document.addEventListener('mouseleave', () => {
      wrap.style.transform = '';
      btn.style.transform  = '';
    });
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   WIRE UP new modules
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  LiveClock.init();
  MoodSelector.init();
  MagneticButton.init();
});

/* Patch Composer to include mood in message params */
const _composerProto = window.__patchComposer;
(function patchMoodIntoSend() {
  // We hook into attemptSend by wrapping __onMessageSent
  // and patch the name field to include mood emoji
  const _origHook = window.__onMessageSent;
  window.__getMoodForSend = () => MoodSelector.getSelected();
  window.__resetMoodAfterSend = () => MoodSelector.reset();
})();
