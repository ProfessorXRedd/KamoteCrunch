/* ============================================================
   KAMOTE CRUNCH – Main Script  |  main.js
   ============================================================ */

/* ── Product catalogue ─────────────────────────────────────── */
const PRODUCTS = {
  'Caramel':        { price: 35,  img: 'images/caramel.jpg'       },
  'Cheese':         { price: 35,  img: 'images/cheese.jpg'        },
  'Spicy Cheese':   { price: 35,  img: 'images/spicycheese.jpg'   },
  'Barbecue':       { price: 35,  img: 'images/bbq.jpg'           },
  'Spicy Barbecue': { price: 35,  img: 'images/spicybarbecue.jpg' },
  'Sweet & Sour':   { price: 35,  img: 'images/sweetandsour.jpg'  },
};

/* ── Facebook Messenger link ───────────────────────────────── */
const FB_MESSENGER_URL = 'https://www.facebook.com/messages/t/103771944407778';

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
  positions.forEach(([lp,tp], i) => {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 4 + Math.random()*8, tx=(Math.random()-.5)*300, ty=-(60+Math.random()*160);
    p.style.cssText = `width:${size}px;height:${size}px;left:${lp}%;top:${tp}%;`
      + `--p-color:${colors[i%colors.length]};--p-tx:${tx}px;--p-ty:${ty}px;`
      + `--p-dur:${1.5+Math.random()}s;--p-delay:${0.8+i*.1}s`;
    container.appendChild(p);
  });
  setTimeout(() => { overlay.classList.add('fade-out'); setTimeout(() => { overlay.style.display='none'; }, 800); }, 2400);
})();

/* ══════════════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════════════ */
function toggleMenu() {
  const menu=document.getElementById('mobileMenu'), btn=document.querySelector('.hamburger');
  const open=menu.classList.toggle('open');
  btn.classList.toggle('is-open',open); btn.setAttribute('aria-expanded',open);
}
function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  const btn=document.querySelector('.hamburger');
  btn.classList.remove('is-open'); btn.setAttribute('aria-expanded','false');
}
document.addEventListener('click',(e)=>{
  const menu=document.getElementById('mobileMenu'),btn=document.querySelector('.hamburger');
  if(menu.classList.contains('open')&&!menu.contains(e.target)&&!btn.contains(e.target)) closeMenu();
});

/* ══════════════════════════════════════════════════════════════
   CART UI
══════════════════════════════════════════════════════════════ */
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  renderCart();
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}
function updateCountBadge() {
  const total=Object.values(cart).reduce((s,i)=>s+i.qty,0);
  const badge=document.getElementById('cartCountBadge');
  const prev=parseInt(badge.textContent)||0;
  badge.textContent=total;
  if(total!==prev){ badge.classList.remove('bump'); requestAnimationFrame(()=>badge.classList.add('bump')); setTimeout(()=>badge.classList.remove('bump'),400); }
}
function renderCart() {
  const container=document.getElementById('cartItemsList');
  const keys=Object.keys(cart);
  if(keys.length===0){
    container.innerHTML='<div class="cart-empty">🍠<br>Your cart is empty.<br>Add some flavors!</div>';
    document.getElementById('cartTotal').textContent='₱0.00';
    return;
  }
  container.innerHTML=keys.map(name=>{
    const item=cart[name], product=PRODUCTS[name];
    const lineTotal=(product.price*item.qty).toFixed(2);
    return `<div class="cart-item" data-name="${name}">
      <img class="cart-item-img" src="${product.img}" alt="${name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${name}</div>
        <div class="cart-item-price">₱${product.price.toFixed(2)} each</div>
        <div class="cart-item-qty">
          <button class="cqty-btn" onclick="changeCartQty('${name}',-1)">−</button>
          <span class="cqty-num">${item.qty}</span>
          <button class="cqty-btn" onclick="changeCartQty('${name}',1)">+</button>
          <span style="font-size:.78rem;color:rgba(255,255,255,.4);margin-left:6px;">= ₱${lineTotal}</span>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${name}')" title="Remove">✕</button>
    </div>`;
  }).join('');
  const subtotal=keys.reduce((s,n)=>s+PRODUCTS[n].price*cart[n].qty,0);
  document.getElementById('cartTotal').textContent=`₱${subtotal.toFixed(2)}`;
}
function addToCart(name,qty){ if(!cart[name])cart[name]={qty:0}; cart[name].qty+=qty; saveCart(); updateCountBadge(); }
function changeCartQty(name,delta){ if(!cart[name])return; cart[name].qty=Math.max(0,cart[name].qty+delta); if(cart[name].qty===0)delete cart[name]; saveCart(); updateCountBadge(); renderCart(); }
function removeFromCart(name){ delete cart[name]; saveCart(); updateCountBadge(); renderCart(); }
function addToCartFromCard(btn,productName){
  const card=btn.closest('.product-card'), qtyEl=card.querySelector('.qty-num');
  const qty=parseInt(qtyEl?qtyEl.textContent:'1')||1;
  addToCart(productName,qty);
  btn.textContent='✓ Added!'; btn.classList.add('added');
  setTimeout(()=>{ btn.textContent='Add to Cart 🛒'; btn.classList.remove('added'); },1600);
}
function changeQty(btn,delta){
  const qtyEl=btn.closest('.qty-control').querySelector('.qty-num');
  qtyEl.textContent=Math.max(1,(parseInt(qtyEl.textContent)||1)+delta);
}

/* ══════════════════════════════════════════════════════════════
   ORDER SUMMARY — 2-STEP CHECKOUT
══════════════════════════════════════════════════════════════ */

/* Open modal → always start at Step 1 */
function checkout() {
  if(Object.keys(cart).length===0){ alert('Your cart is empty! Add some flavors first 🍠'); return; }
  closeCart();
  goToStep1();
  document.getElementById('summaryOverlay').classList.add('open');
  document.getElementById('summaryModal').classList.add('open');
}
function closeSummary() {
  document.getElementById('summaryOverlay').classList.remove('open');
  document.getElementById('summaryModal').classList.remove('open');
}

/* ── Step 1: Details Form ──────────────────────────────────── */
function goToStep1() {
  document.getElementById('orderStep1').style.display = 'block';
  document.getElementById('orderStep2').style.display = 'none';
  document.getElementById('step1Indicator').classList.add('active');
  document.getElementById('step2Indicator').classList.remove('active');
  const inner = document.querySelector('.summary-inner');
  if (inner) inner.scrollTop = 0;
}

/* ── Step 2: Validate → build receipt → show ──────────────── */
function goToStep2() {
  const name    = document.getElementById('oName').value.trim();
  const address = document.getElementById('oAddress').value.trim();
  const phone   = document.getElementById('oPhone').value.trim();
  const email   = document.getElementById('oEmail').value.trim();
  const payment = document.querySelector('input[name="oPayment"]:checked');
  const errEl   = document.getElementById('oFormError');

  if (!name)    { errEl.textContent='⚠ Please enter your full name.';         document.getElementById('oName').focus();    return; }
  if (!address) { errEl.textContent='⚠ Please enter your delivery address.';  document.getElementById('oAddress').focus(); return; }
  if (!phone)   { errEl.textContent='⚠ Please enter your contact number.';    document.getElementById('oPhone').focus();   return; }
  if (!payment) { errEl.textContent='⚠ Please select a payment method.'; return; }
  errEl.textContent = '';

  buildReceipt(name, address, phone, email, payment.value);

  document.getElementById('orderStep1').style.display = 'none';
  document.getElementById('orderStep2').style.display = 'block';
  document.getElementById('step1Indicator').classList.remove('active');
  document.getElementById('step2Indicator').classList.add('active');
  const inner = document.querySelector('.summary-inner');
  if (inner) inner.scrollTop = 0;
}

/* ── Build receipt card + compose message text ─────────────── */
function buildReceipt(name, address, phone, email, payment) {
  const keys    = Object.keys(cart);
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
  const timeStr = now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
  const note    = document.getElementById('oNote').value.trim();

  /* Receipt card fields */
  document.getElementById('receiptDate').textContent    = `${dateStr} · ${timeStr}`;
  document.getElementById('receiptName').textContent    = name;
  document.getElementById('receiptAddress').textContent = address;
  document.getElementById('receiptPhone').textContent   = phone;

  /* Email row on receipt */
  const emailRow = document.getElementById('receiptEmailRow');
  if (emailRow) {
    if (email) {
      document.getElementById('receiptEmail').textContent = email;
      emailRow.style.display = 'flex';
    } else {
      emailRow.style.display = 'none';
    }
  }

  /* Payment method on receipt */
  const payRow = document.getElementById('receiptPaymentRow');
  const payBadge = document.getElementById('receiptPayment');
  if (payBadge) {
    payBadge.textContent = payment === 'GCash' ? '📲 GCash' : '🚚 Cash on Delivery';
    payBadge.className = 'receipt-cust-val receipt-payment-badge ' + (payment === 'GCash' ? 'badge-gcash' : 'badge-cod');
  }

  const noteWrap = document.getElementById('receiptNoteWrap');
  if (note) { document.getElementById('receiptNote').textContent = note; noteWrap.style.display='flex'; }
  else      { noteWrap.style.display = 'none'; }

  document.getElementById('receiptItems').innerHTML = keys.map(n => {
    const lineTotal=(PRODUCTS[n].price*cart[n].qty).toFixed(2);
    return `<div class="receipt-row">
      <span class="receipt-flavor">${n} <span class="receipt-qty">×${cart[n].qty}</span></span>
      <span class="receipt-price">₱${lineTotal}</span>
    </div>`;
  }).join('');

  const total = keys.reduce((s,n)=>s+PRODUCTS[n].price*cart[n].qty, 0);
  document.getElementById('receiptTotal').textContent = `₱${total.toFixed(2)}`;

  /* Compose the full message (used by clipboard + Messenger) */
  const orderLines = keys.map(n=>`• ${n} ×${cart[n].qty}  =  ₱${(PRODUCTS[n].price*cart[n].qty).toFixed(2)}`).join('\n');
  window._orderText =
      `🍠 KAMOTE CRUNCH — NEW ORDER\n`
    + `${dateStr} · ${timeStr}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `👤 Name    : ${name}\n`
    + `📍 Address : ${address}\n`
    + `📱 Contact : ${phone}\n`
    + (email ? `✉️ Email   : ${email}\n` : '')
    + `💳 Payment : ${payment}\n`
    + (note ? `📝 Note    : ${note}\n` : '')
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `ORDER SUMMARY:\n${orderLines}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `TOTAL: ₱${total.toFixed(2)}\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `Please confirm my order. Salamat! 🍠`;

  updateStep2Buttons(payment);
}

/* ── Show/hide Step 2 buttons based on payment method ──────── */
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
      gcashCta.id = 'btnGCashPay';
      gcashCta.className = 'action-btn messenger';
      gcashCta.style.cssText = 'background:linear-gradient(135deg,#007bff,#0090d4);box-shadow:0 4px 18px rgba(0,120,255,0.4);';
      gcashCta.innerHTML = '📲 Pay via GCash &amp; Send Order';
      gcashCta.onclick = () => openGCash();
      const actionsDiv = document.querySelector('#orderStep2 .summary-actions');
      if (actionsDiv) actionsDiv.insertBefore(gcashCta, actionsDiv.firstChild);
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

/* ── Payment method change ─────────────────────────────────── */
function onPaymentChange() {
  const val = document.querySelector('input[name="oPayment"]:checked')?.value;
  // Highlight selected option
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
  if (val === 'COD')   document.getElementById('payOptCOD').classList.add('selected');
  if (val === 'GCash') document.getElementById('payOptGCash').classList.add('selected');
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
  navigator.clipboard.writeText('09300962240').then(() => {
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  }).catch(() => { alert('Could not copy. Number: 09300962240'); });
}

/* ── Send via Email (mailto auto-fill) ─────────────────────── */
function sendEmail() {
  const keys    = Object.keys(cart);
  const name    = document.getElementById('oName').value.trim();
  const address = document.getElementById('oAddress').value.trim();
  const phone   = document.getElementById('oPhone').value.trim();
  const email   = document.getElementById('oEmail').value.trim();
  const note    = document.getElementById('oNote').value.trim();

  if (!window._orderText) { alert('Please complete your order details first.'); return; }

  const subject = encodeURIComponent('🍠 Kamote Crunch — New Order from ' + name);
  const body    = encodeURIComponent(window._orderText);
  const mailto  = `mailto:kamotecrunch2024@gmail.com?subject=${subject}&body=${body}`;

  /* Try to open Gmail compose in new tab first; fallback to mailto */
  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=kamotecrunch2024@gmail.com&su=${encodeURIComponent('🍠 Kamote Crunch — New Order from ' + (document.getElementById('oName')?.value.trim() || 'Customer'))}&body=${encodeURIComponent(window._orderText || '')}`;
  const newTab = window.open(gmailUrl, '_blank');
  if (!newTab) { window.location.href = mailto; }
  showToast('✉️ Gmail compose opened with your order pre-filled! Just click Send.', 5000);
}

/* ── Copy order text ───────────────────────────────────────── */
function copyOrder() {
  navigator.clipboard.writeText(window._orderText||'').then(()=>{
    const btn=document.getElementById('copyBtn');
    btn.textContent='✓ Copied!'; btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent='📋 Copy Order Text'; btn.classList.remove('copied'); },2200);
  }).catch(()=>{ alert('Could not copy. Please screenshot the order card instead.'); });
}

/* ── Save receipt as image ─────────────────────────────────── */
function saveImage() {
  const card=document.getElementById('receiptCard');
  const btn=document.getElementById('saveImgBtn');
  btn.textContent='⏳ Saving...'; btn.disabled=true;
  html2canvas(card,{backgroundColor:null,scale:3,useCORS:true,logging:false})
    .then(canvas=>{
      const link=document.createElement('a');
      link.download=`KamoteCrunch_Order_${Date.now()}.png`;
      link.href=canvas.toDataURL('image/png'); link.click();
      btn.textContent='✓ Saved!'; btn.classList.add('copied');
      setTimeout(()=>{ btn.textContent='📸 Save as Image'; btn.disabled=false; btn.classList.remove('copied'); },2200);
    })
    .catch(()=>{ btn.textContent='📸 Save as Image'; btn.disabled=false; alert('Could not save image. Please screenshot instead.'); });
}

/* ── Send via Messenger ────────────────────────────────────── */
/*
   Facebook m.me links don't support URL-injected message text.
   Best approach: auto-copy to clipboard → open Messenger → show
   a toast telling the user to paste.
*/
function openMessenger() {
  if (navigator.clipboard && window._orderText) {
    navigator.clipboard.writeText(window._orderText).catch(()=>{});
  }
  window.open(FB_MESSENGER_URL, '_blank');
}

function confirmAndSend() {
  openMessenger();
  showToast('📋 Order text auto-copied! Open the Messenger chat and paste (long-press → Paste) to send your order.', 6000);
  setTimeout(()=>{ cart={}; saveCart(); updateCountBadge(); closeSummary(); }, 900);
}

/* ── Toast notification ────────────────────────────────────── */
function showToast(msg, duration=3500) {
  let toast = document.getElementById('kcToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'kcToast';
    toast.className = 'kc-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>toast.classList.remove('show'), duration);
}

/* ══════════════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════════════ */
function submitForm(){
  const name=document.getElementById('fname').value.trim();
  const email=document.getElementById('femail').value.trim();
  const msg=document.getElementById('fmsg').value.trim();
  if(!name||!email||!msg){alert('Please fill in your name, email, and message.');return;}
  const s=document.getElementById('successMsg');
  s.style.display='block';
  document.getElementById('fname').value='';
  document.getElementById('femail').value='';
  document.getElementById('fmsg').value='';
  document.getElementById('fflavor').value='';
  setTimeout(()=>{s.style.display='none';},5000);
}
function orderFlavor(btn){
  const flavor=btn.closest('.product-card').querySelector('.product-name').textContent.trim();
  document.getElementById('contact').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>{
    const sel=document.getElementById('fflavor');
    const map={'Caramel':'Caramel','Cheese':'Cheese','Spicy Cheese':'Spicy Cheese','Barbecue':'Barbecue','Spicy Barbecue':'Spicy Barbecue','Sweet & Sour':'Sweet & Sour'};
    for(const k in map){if(flavor.includes(k)){sel.value=map[k];break;}}
  },700);
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL + NAV ACTIVE STATE
══════════════════════════════════════════════════════════════ */
const revealObserver=new IntersectionObserver((entries)=>{ entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}); },{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const navLinks=document.querySelectorAll('.nav-links a');
window.addEventListener('scroll',()=>{
  let cur=''; document.querySelectorAll('section[id]').forEach(s=>{if(window.scrollY>=s.offsetTop-120)cur=s.id;});
  navLinks.forEach(a=>{a.style.color=a.getAttribute('href')==='#'+cur?'var(--gold)':'';});
},{passive:true});

/* ── Init ──────────────────────────────────────────────────── */
updateCountBadge();
