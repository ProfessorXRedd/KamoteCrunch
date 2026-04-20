/* ============================================================
   KAMOTE CRUNCH  |  main.js
   ============================================================ */

/* ── Config ────────────────────────────────────────────────── */
const PRODUCTS = {
  'Caramel':        { price: 35, img: 'images/caramel.jpg'       },
  'Cheese':         { price: 35, img: 'images/cheese.jpg'        },
  'Spicy Cheese':   { price: 35, img: 'images/spicycheese.jpg'   },
  'Barbecue':       { price: 35, img: 'images/bbq.jpg'           },
  'Spicy Barbecue': { price: 35, img: 'images/spicybarbecue.jpg' },
  'Sweet & Sour':   { price: 35, img: 'images/sweetandsour.jpg'  },
};

const FB_PAGE_ID    = '103771944407778';
const FB_PAGE_URL   = 'https://www.facebook.com/profile.php?id=100070086709566';
const GMAIL_ADDRESS = 'kamotecrunch2024@gmail.com';

/* ── Device detection ──────────────────────────────────────── */
const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * openEmail(subject, body)
 * Mobile/iOS  → mailto: (opens Gmail app or native mail)
 * Desktop     → Gmail compose in new tab
 */
function openEmail(subject, body) {
  const sub  = encodeURIComponent(subject);
  const bod  = encodeURIComponent(body);
  if (IS_MOBILE) {
    window.location.href = `mailto:${GMAIL_ADDRESS}?subject=${sub}&body=${bod}`;
  } else {
    const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(GMAIL_ADDRESS)}&su=${sub}&body=${bod}`;
    window.open(url, '_blank');
  }
}

/**
 * openMessenger(text)
 * Mobile/iOS  → fb-messenger:// deep link (opens Messenger app) + auto-copy text
 * Desktop     → facebook.com/messages direct link + auto-copy text
 */
function openMessenger(text) {
  if (text) {
    navigator.clipboard?.writeText(text).catch(() => {});
  }
  if (IS_MOBILE) {
    /* Try Messenger app deep link first; fallback to m.facebook.com */
    const appLink = `fb-messenger://user-thread/${FB_PAGE_ID}`;
    const webLink = `https://m.me/${FB_PAGE_ID}`;
    const iframe  = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = appLink;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
    /* Short delay so the app has time to open; if it fails, open web */
    setTimeout(() => {
      window.open(webLink, '_blank');
    }, 600);
  } else {
    window.open(`https://www.facebook.com/messages/t/${FB_PAGE_ID}`, '_blank');
  }
}

/* ── Cart state ────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('kc_cart') || '{}');
function saveCart() { localStorage.setItem('kc_cart', JSON.stringify(cart)); }

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
    const size  = 4 + Math.random() * 8;
    const tx    = (Math.random() - .5) * 300;
    const ty    = -(60 + Math.random() * 160);
    p.style.cssText = `width:${size}px;height:${size}px;left:${lp}%;top:${tp}%;`
      + `--p-color:${colors[i % colors.length]};--p-tx:${tx}px;--p-ty:${ty}px;`
      + `--p-dur:${1.5 + Math.random()}s;--p-delay:${0.8 + i * .1}s`;
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
  if (menu?.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target))
    closeMenu();
});

/* ══════════════════════════════════════════════════════════════
   CHECKOUT — 2-STEP MODAL
══════════════════════════════════════════════════════════════ */
function checkout() {
  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty! Add some flavors first 🍠');
    return;
  }
  closeCart?.();
  goToStep1();
  document.getElementById('summaryOverlay').classList.add('open');
  document.getElementById('summaryModal').classList.add('open');
}

function closeSummary() {
  document.getElementById('summaryOverlay').classList.remove('open');
  document.getElementById('summaryModal').classList.remove('open');
}

function goToStep1() {
  document.getElementById('orderStep1').style.display = 'block';
  document.getElementById('orderStep2').style.display = 'none';
  document.getElementById('step1Indicator').classList.add('active');
  document.getElementById('step2Indicator').classList.remove('active');
  document.querySelector('.summary-inner')?.scrollTo(0, 0);
}

function goToStep2() {
  const name    = document.getElementById('oName').value.trim();
  const address = document.getElementById('oAddress').value.trim();
  const phone   = document.getElementById('oPhone').value.trim();
  const email   = document.getElementById('oEmail').value.trim();
  const payment = document.querySelector('input[name="oPayment"]:checked');
  const errEl   = document.getElementById('oFormError');

  if (!name)    { errEl.textContent = '⚠ Please enter your full name.';        document.getElementById('oName').focus();    return; }
  if (!address) { errEl.textContent = '⚠ Please enter your delivery address.'; document.getElementById('oAddress').focus(); return; }
  if (!phone)   { errEl.textContent = '⚠ Please enter your contact number.';   document.getElementById('oPhone').focus();   return; }
  if (!payment) { errEl.textContent = '⚠ Please select a payment method.';     return; }
  errEl.textContent = '';

  buildReceipt(name, address, phone, email, payment.value);

  document.getElementById('orderStep1').style.display = 'none';
  document.getElementById('orderStep2').style.display = 'block';
  document.getElementById('step1Indicator').classList.remove('active');
  document.getElementById('step2Indicator').classList.add('active');
  document.querySelector('.summary-inner')?.scrollTo(0, 0);
}

/* ── Build receipt card + compose order text ───────────────── */
function buildReceipt(name, address, phone, email, payment) {
  const keys    = Object.keys(cart);
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const note    = document.getElementById('oNote')?.value.trim() || '';

  /* Receipt card */
  document.getElementById('receiptDate').textContent    = `${dateStr} · ${timeStr}`;
  document.getElementById('receiptName').textContent    = name;
  document.getElementById('receiptAddress').textContent = address;
  document.getElementById('receiptPhone').textContent   = phone;

  const emailRow = document.getElementById('receiptEmailRow');
  if (emailRow) {
    document.getElementById('receiptEmail').textContent = email;
    emailRow.style.display = email ? 'flex' : 'none';
  }

  const payBadge = document.getElementById('receiptPayment');
  if (payBadge) {
    payBadge.textContent = payment === 'GCash' ? '📲 GCash' : '🚚 Cash on Delivery';
    payBadge.className   = 'receipt-cust-val receipt-payment-badge ' + (payment === 'GCash' ? 'badge-gcash' : 'badge-cod');
  }

  const noteWrap = document.getElementById('receiptNoteWrap');
  if (noteWrap) {
    document.getElementById('receiptNote').textContent = note;
    noteWrap.style.display = note ? 'flex' : 'none';
  }

  document.getElementById('receiptItems').innerHTML = keys.map(n => {
    const line = (PRODUCTS[n].price * cart[n].qty).toFixed(2);
    return `<div class="receipt-row">
      <span class="receipt-flavor">${n} <span class="receipt-qty">×${cart[n].qty}</span></span>
      <span class="receipt-price">₱${line}</span>
    </div>`;
  }).join('');

  const total = keys.reduce((s, n) => s + PRODUCTS[n].price * cart[n].qty, 0);
  document.getElementById('receiptTotal').textContent = `₱${total.toFixed(2)}`;

  /* Order message text */
  const orderLines = keys.map(n => `• ${n} ×${cart[n].qty}  =  ₱${(PRODUCTS[n].price * cart[n].qty).toFixed(2)}`).join('\n');
  window._orderText =
      `🍠 KAMOTE CRUNCH — NEW ORDER\n`
    + `${dateStr} · ${timeStr}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `👤 Name    : ${name}\n`
    + `📍 Address : ${address}\n`
    + `📱 Contact : ${phone}\n`
    + (email   ? `✉️ Email   : ${email}\n`   : '')
    + `💳 Payment : ${payment}\n`
    + (note    ? `📝 Note    : ${note}\n`    : '')
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `ORDER SUMMARY:\n${orderLines}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `TOTAL: ₱${total.toFixed(2)}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `Please confirm my order. Salamat! 🍠`;

  window._orderName    = name;
  window._orderPayment = payment;

  updateStep2Buttons(payment);
}

/* ── Show/hide Step 2 buttons by payment ───────────────────── */
function updateStep2Buttons(payment) {
  const isGCash = payment === 'GCash';
  const btnM = document.getElementById('btnMessenger');
  const btnE = document.getElementById('btnEmail');
  const btnS = document.getElementById('saveImgBtn');
  const divS = document.getElementById('divSaveForLater');
  const btnC = document.getElementById('copyBtn');

  if (isGCash) {
    if (btnM) btnM.style.display = 'none';
    if (btnE) btnE.style.display = 'none';
    if (btnS) btnS.style.display = 'none';
    if (divS) divS.style.display = 'none';
    if (btnC) btnC.style.display = 'flex';
    let gcashCta = document.getElementById('btnGCashPay');
    if (!gcashCta) {
      gcashCta = document.createElement('button');
      gcashCta.id        = 'btnGCashPay';
      gcashCta.className = 'action-btn messenger';
      gcashCta.style.cssText = 'background:linear-gradient(135deg,#007bff,#0090d4);box-shadow:0 4px 18px rgba(0,120,255,0.4);';
      gcashCta.innerHTML = '📲 Pay via GCash &amp; Send Order';
      gcashCta.onclick   = openGCash;
      document.querySelector('#orderStep2 .summary-actions')?.prepend(gcashCta);
    } else {
      gcashCta.style.display = 'flex';
    }
  } else {
    if (btnM) btnM.style.display = 'flex';
    if (btnE) btnE.style.display = 'flex';
    if (btnS) btnS.style.display = 'flex';
    if (divS) divS.style.display = 'block';
    if (btnC) btnC.style.display = 'flex';
    const gcashCta = document.getElementById('btnGCashPay');
    if (gcashCta) gcashCta.style.display = 'none';
  }
}

/* ── Payment radio change ──────────────────────────────────── */
function onPaymentChange() {
  const val = document.querySelector('input[name="oPayment"]:checked')?.value;
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
  if (val === 'COD')   document.getElementById('payOptCOD')?.classList.add('selected');
  if (val === 'GCash') document.getElementById('payOptGCash')?.classList.add('selected');
}

/* ── Send via Messenger ────────────────────────────────────── */
function confirmAndSend() {
  openMessenger(window._orderText);
  const hint = IS_MOBILE
    ? '📋 Order text copied! Paste it in Messenger to send your order.'
    : '📋 Order text copied! Paste it in the Messenger chat.';
  showToast(hint, 6000);
  setTimeout(() => { cart = {}; saveCart(); updateCountBadge?.(); closeSummary(); }, 900);
}

/* ── Send via Email ────────────────────────────────────────── */
function sendEmail() {
  if (!window._orderText) { alert('Please complete your order details first.'); return; }
  const name    = window._orderName || 'Customer';
  const subject = `🍠 Kamote Crunch — New Order from ${name}`;
  openEmail(subject, window._orderText);
  const hint = IS_MOBILE
    ? '✉️ Opening Gmail app with your order pre-filled! Just tap Send.'
    : '✉️ Gmail opened with your order pre-filled! Just click Send.';
  showToast(hint, 5000);
}

/* ── Copy order text ───────────────────────────────────────── */
function copyOrder() {
  navigator.clipboard.writeText(window._orderText || '').then(() => {
    const btn = document.getElementById('copyBtn');
    if (btn) { btn.textContent = '✓ Copied!'; btn.classList.add('copied'); }
    setTimeout(() => {
      const b = document.getElementById('copyBtn');
      if (b) { b.textContent = '📋 Copy Order Text'; b.classList.remove('copied'); }
    }, 2200);
  }).catch(() => { alert('Could not copy. Please screenshot the order card instead.'); });
}

/* ── Save receipt as image ─────────────────────────────────── */
function saveImage() {
  const card = document.getElementById('receiptCard');
  const btn  = document.getElementById('saveImgBtn');
  if (btn) { btn.textContent = '⏳ Saving...'; btn.disabled = true; }
  html2canvas(card, { backgroundColor: null, scale: 3, useCORS: true, logging: false })
    .then(canvas => {
      const link      = document.createElement('a');
      link.download   = `KamoteCrunch_Order_${Date.now()}.png`;
      link.href       = canvas.toDataURL('image/png');
      link.click();
      if (btn) { btn.textContent = '✓ Saved!'; btn.classList.add('copied'); }
      setTimeout(() => {
        if (btn) { btn.textContent = '📸 Save as Image'; btn.disabled = false; btn.classList.remove('copied'); }
      }, 2200);
    })
    .catch(() => {
      if (btn) { btn.textContent = '📸 Save as Image'; btn.disabled = false; }
      alert('Could not save image. Please screenshot instead.');
    });
}

/* ── GCash modal ───────────────────────────────────────────── */
function openGCash() {
  document.getElementById('gcashOverlay').classList.add('open');
  document.getElementById('gcashModal').classList.add('open');
}
function closeGCash() {
  document.getElementById('gcashOverlay').classList.remove('open');
  document.getElementById('gcashModal').classList.remove('open');
}
function copyGCashNum(btn) {
  navigator.clipboard.writeText('09300962240')
    .then(() => { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); })
    .catch(() => { alert('Number: 09300962240'); });
}

/* ── Toast ─────────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════════
   FEEDBACK FORM (index.html contact section)
══════════════════════════════════════════════════════════════ */

/* Validate + build feedback text — returns null if invalid */
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
      `💬 KAMOTE CRUNCH — FEEDBACK / MESSAGE
`
    + `${dateStr} · ${timeStr}
`
    + `━━━━━━━━━━━━━━━━━━━━
`
    + `👤 Name    : ${name}
`
    + `✉️ Email   : ${email}
`
    + (flavor ? `🍠 Flavor  : ${flavor}
` : '')
    + `━━━━━━━━━━━━━━━━━━━━
`
    + `💬 Message :
${msg}
`
    + `━━━━━━━━━━━━━━━━━━━━`;

  return { name, email, flavor, msg, text };
}

function showFeedbackSuccess() {
  document.getElementById('feedbackSuccess').style.display = 'flex';
  /* Reset fields */
  ['fname','femail','fmsg'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const sel = document.getElementById('fflavor'); if (sel) sel.value = '';
  setTimeout(() => {
    const s = document.getElementById('feedbackSuccess');
    if (s) s.style.display = 'none';
  }, 6000);
}

/* Send via Email (device-aware) */
function submitFeedbackEmail() {
  const data = buildFeedbackText();
  if (!data) return;
  const subject = encodeURIComponent(`💬 Feedback from ${data.name} — Kamote Crunch`);
  const body    = encodeURIComponent(data.text);
  openEmail(decodeURIComponent(subject), data.text);
  showFeedbackSuccess();
  showToast(IS_MOBILE
    ? '✉️ Opening Gmail app with your message pre-filled!'
    : '✉️ Gmail opened with your message pre-filled! Just click Send.',
    5000);
}

/* Send via Messenger (device-aware) */
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

/* Legacy — kept for safety */
function submitForm() { submitFeedbackEmail(); }

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
).observe ? (() => {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})() : null;

/* ══════════════════════════════════════════════════════════════
   NAV ACTIVE STATE (index.html only)
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
   ABOUT MEDIA SLIDER (index.html only)
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
  counter.className = 'slider-counter';
  counter.id        = 'sliderCounter';
  counter.textContent = `1 / ${total}`;
  slider?.appendChild(counter);

  function goTo(n) {
    const prevVid = slides[current].querySelector('video');
    if (prevVid) prevVid.pause();
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    const c = document.getElementById('sliderCounter');
    if (c) c.textContent = `${current + 1} / ${total}`;
  }

  window.sliderMove = dir => goTo(current + dir);

  let startX = 0;
  slider?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider?.addEventListener('touchend',   e => {
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
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        link.target === '_blank') return;
    e.preventDefault();
    overlay.classList.add('visible');
    if (bar) requestAnimationFrame(() => { bar.style.width = '100%'; });
    setTimeout(() => { window.location.href = href; }, 480);
  });
})();

/* ── Cart stubs (index.html has no cart but functions may be called) */
function updateCountBadge() {}
function closeCart() {}
function openCart() {}
