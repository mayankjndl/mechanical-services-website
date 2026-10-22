/* ============================================================
   OMSHREE INDUSTRIES SERVICE — script.js
   Multi-Page: Intersection Observer · Mobile Nav · FAQ · Form
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initScrollReveal();
  initSmoothScroll();
  initContactForm();
  initFaqAccordion();
  initMarquee();
});

/* ─── STICKY HEADER ─────────────────────────────────────── */
function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  // If page has no full-height hero, keep solid always
  const hasHero = document.getElementById('hero');
  if (!hasHero) header.classList.add('header-solid');

  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else if (hasHero) header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── MOBILE NAV DRAWER ─────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const navOverlay = document.getElementById('nav-overlay');
  if (!hamburger || !mobileNav) return;

  const openNav = () => {
    hamburger.classList.add('active');
    mobileNav.classList.add('open');
    navOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => navOverlay.classList.add('visible'));
  };
  const closeNav = () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => { navOverlay.style.display = 'none'; }, 350);
  };

  hamburger.addEventListener('click', () => mobileNav.classList.contains('open') ? closeNav() : openNav());
  navOverlay.addEventListener('click', closeNav);
  document.querySelectorAll('.mobile-nav a').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}

/* ─── SCROLL REVEAL ─────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -70px 0px', threshold: 0.10 });
  els.forEach(el => observer.observe(el));
}

/* ─── SMOOTH SCROLL ─────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header')?.offsetHeight || 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 16, behavior: 'smooth' });
    });
  });
}

/* ─── FAQ ACCORDION ─────────────────────────────────────── */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Open current if was closed
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ─── MARQUEE (duplicate items for seamless loop) ───────── */
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
}

/* ─── CONTACT FORM ──────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('enquiry-form');
  const formContainer = document.getElementById('form-container');
  const successMsg = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form) return;

  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => { if (input.classList.contains('input-error')) validateField(input); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;
    inputs.forEach(i => { if (!validateField(i)) isValid = false; });
    if (!isValid) { shakeForm(); return; }
    setSubmitLoading(submitBtn, true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
      const data = await res.json();
      if (data.success) {
        formContainer.style.opacity = '0';
        formContainer.style.transform = 'translateY(20px)';
        formContainer.style.transition = 'all 0.4s ease';
        setTimeout(() => {
          formContainer.style.display = 'none';
          successMsg.style.display = 'block';
          successMsg.style.opacity = '0';
          requestAnimationFrame(() => { successMsg.style.transition = 'all 0.4s ease'; successMsg.style.opacity = '1'; });
        }, 400);
        form.reset();
      } else throw new Error();
    } catch {
      showToast('⚠️ Submission failed. Please call +91 9545318160 directly.');
      setSubmitLoading(submitBtn, false);
    }
  });
}

function validateField(input) {
  const val = input.value.trim();
  let ok = true;
  input.classList.remove('input-error', 'input-valid');
  if (input.hasAttribute('required') && !val) ok = false;
  else if (input.type === 'email' && val) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  else if (input.type === 'tel' && val) ok = /^[\d\s\+\-\(\)]{7,15}$/.test(val);
  input.classList.add(ok ? 'input-valid' : 'input-error');
  return ok;
}

function setSubmitLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="btn-spinner"></span> Sending...' : '🚀 Send Enquiry';
  btn.style.opacity = loading ? '0.8' : '1';
}

function shakeForm() {
  const f = document.getElementById('enquiry-form');
  f.classList.add('form-shake');
  setTimeout(() => f.classList.remove('form-shake'), 600);
}

function showToast(msg) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast-notification';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 5000);
}

/* ─── RUNTIME STYLE INJECTIONS ──────────────────────────── */
const s = document.createElement('style');
s.textContent = `
  .input-error { border-color: #C0392B !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.15) !important; }
  .input-valid { border-color: rgba(37,211,102,0.5) !important; }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  .form-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97); }
  .btn-spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .toast-notification { position:fixed; bottom:100px; right:32px; background:#2E3440; color:#FFF8E7; padding:16px 24px; border-radius:8px; font-size:0.9rem; box-shadow:0 10px 40px rgba(0,0,0,0.4); z-index:9999; opacity:0; transform:translateY(20px); transition:all 0.35s ease; border-left:3px solid #C0392B; max-width:340px; }
`;
document.head.appendChild(s);
