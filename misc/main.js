/* ============================================================
   KAMOTE CRUNCH  |  main.js
   Used by: index.html only
   shop.html and resellers.html have their own inline scripts
   ============================================================ */

/* ── Device detection ──────────────────────────────────────── */
const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const FB_PAGE_ID    = '103771944407778';
const GMAIL_ADDRESS = 'kamotecrunch2024@gmail.com';

/**
 * openEmail(subject, body)
 * Mobile  → mailto: (opens Gmail app / native mail)
 * Desktop → Gmail compose in new tab
 */
function openEmail(subject, body) {
  const sub = encodeURIComponent(subject);
  const bod = encodeURIComponent(body);
  if (IS_MOBILE) {
    window.location.href = `mailto:${GMAIL_ADDRESS}?subject=${sub}&body=${bod}`;
  } else {
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(GMAIL_ADDRESS)}&su=${sub}&body=${bod}`,
      '_blank'
    );
  }
}

/**
 * openMessenger(text)
 * Mobile  → fb-messenger:// deep link + auto-copy text
 * Desktop → facebook.com/messages direct + auto-copy text
 */
function openMessenger(text) {
  if (text) navigator.clipboard?.writeText(text).catch(() => {});
  if (IS_MOBILE) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `fb-messenger://user-thread/${FB_PAGE_ID}`;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 1500);
    setTimeout(() => window.open(`https://m.me/${FB_PAGE_ID}`, '_blank'), 600);
  } else {
    window.open(`https://www.facebook.com/messages/t/${FB_PAGE_ID}`, '_blank');
  }
}

/* ══════════════════════════════════════════════════════════════
   INTRO ANIMATION
══════════════════════════════════════════════════════════════ */
(function () {
  const overlay   = document.getElementById('intro-overlay');
  const container = document.getElementById('introParticles');
  if (!overlay || !container) return;
  const colors    = ['#F5A623','#E8621A','#fff','#FFD580'];
  const positions = [[20,80],[80,20],[60,70],[30,40],[75,55],[45,85],[15,30],[90,65],[50,10],[35,90]];
  positions.forEach(([lp, tp], i) => {
    const p   = document.createElement('div');
    p.className = 'particle';
    const size = 4 + Math.random() * 8;
    const tx   = (Math.random() - .5) * 300;
    const ty   = -(60 + Math.random() * 160);
    p.style.cssText =
      `width:${size}px;height:${size}px;left:${lp}%;top:${tp}%;` +
      `--p-color:${colors[i % colors.length]};--p-tx:${tx}px;--p-ty:${ty}px;` +
      `--p-dur:${1.5 + Math.random()}s;--p-delay:${0.8 + i * .1}s`;
    container.appendChild(p);
  });
  setTimeout(() => {
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display = 'none'; }, 800);
  }, 2400);
})();

/* ══════════════════════════════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════════════════════════════ */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.querySelector('.hamburger');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', open);
}
function closeMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.querySelector('.hamburger');
  menu.classList.remove('open');
  btn.classList.remove('is-open');
  btn.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.querySelector('.hamburger');
  if (menu?.classList.contains('open') &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)) closeMenu();
});

/* ══════════════════════════════════════════════════════════════
   FEEDBACK FORM (Contact section)
══════════════════════════════════════════════════════════════ */
function buildFeedbackText() {
  const name   = document.getElementById('fname')?.value.trim()  || '';
  const email  = document.getElementById('femail')?.value.trim() || '';
  const flavor = document.getElementById('fflavor')?.value       || '';
  const msg    = document.getElementById('fmsg')?.value.trim()   || '';
  const errEl  = document.getElementById('feedbackError');

  if (!name)  { errEl.textContent = '⚠ Please enter your name.';    document.getElementById('fname')?.focus();  return null; }
  if (!email) { errEl.textContent = '⚠ Please enter your email.';   document.getElementById('femail')?.focus(); return null; }
  if (!msg)   { errEl.textContent = '⚠ Please write a message.';    document.getElementById('fmsg')?.focus();   return null; }
  errEl.textContent = '';

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  const text =
      `💬 KAMOTE CRUNCH — FEEDBACK / MESSAGE\n`
    + `${dateStr} · ${timeStr}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `👤 Name    : ${name}\n`
    + `✉️ Email   : ${email}\n`
    + (flavor ? `🍠 Flavor  : ${flavor}\n` : '')
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `💬 Message :\n${msg}\n`
    + `━━━━━━━━━━━━━━━━━━━━`;

  return { name, email, flavor, msg, text };
}

function showFeedbackSuccess() {
  const s = document.getElementById('feedbackSuccess');
  if (s) s.style.display = 'flex';
  ['fname','femail','fmsg'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const sel = document.getElementById('fflavor'); if (sel) sel.value = '';
  setTimeout(() => { if (s) s.style.display = 'none'; }, 6000);
}

function submitFeedbackEmail() {
  const data = buildFeedbackText();
  if (!data) return;
  openEmail(`💬 Feedback from ${data.name} — Kamote Crunch`, data.text);
  showFeedbackSuccess();
  showToast(IS_MOBILE
    ? '✉️ Opening Gmail app with your message pre-filled!'
    : '✉️ Gmail opened with your message pre-filled! Just click Send.',
    5000);
}

function submitFeedbackMessenger() {
  const data = buildFeedbackText();
  if (!data) return;
  openMessenger(data.text);
  showFeedbackSuccess();
  showToast(IS_MOBILE
    ? '📋 Message copied! Paste it in Messenger to send.'
    : '📋 Message copied! Paste it in the Messenger chat.',
    6000);
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
(function () {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   NAV ACTIVE STATE
══════════════════════════════════════════════════════════════ */
(function () {
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!navLinks.length) return;
  window.addEventListener('scroll', () => {
    let cur = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--gold)' : '';
    });
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   ABOUT MEDIA SLIDER
══════════════════════════════════════════════════════════════ */
(function () {
  const track  = document.getElementById('mediaTrack');
  const dotsEl = document.getElementById('sliderDots');
  if (!track || !dotsEl) return;

  const slides  = track.querySelectorAll('.media-slide');
  const total   = slides.length;
  let   current = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
  });

  const slider  = document.getElementById('mediaSlider');
  const counter = document.createElement('div');
  counter.className   = 'slider-counter';
  counter.id          = 'sliderCounter';
  counter.textContent = `1 / ${total}`;
  slider?.appendChild(counter);

  function goTo(n) {
    slides[current].querySelector('video')?.pause();
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    const c = document.getElementById('sliderCounter');
    if (c) c.textContent = `${current + 1} / ${total}`;
  }

  window.sliderMove = dir => goTo(current + dir);

  let startX = 0;
  slider?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider?.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   PAGE TRANSITIONS
══════════════════════════════════════════════════════════════ */
(function () {
  const overlay = document.getElementById('ptOverlay');
  const bar     = document.getElementById('ptBar');
  if (!overlay) return;

  document.body.style.opacity    = '0';
  document.body.style.transition = 'opacity 0.35s ease';
  window.addEventListener('load', () => {
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  });

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        link.target === '_blank') return;
    e.preventDefault();
    overlay.classList.add('visible');
    if (bar) requestAnimationFrame(() => { bar.style.width = '100%'; });
    setTimeout(() => { window.location.href = href; }, 480);
  });
})();

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
function showToast(msg, duration = 3500) {
  let toast = document.getElementById('kcToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id        = 'kcToast';
    toast.className = 'kc-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}
