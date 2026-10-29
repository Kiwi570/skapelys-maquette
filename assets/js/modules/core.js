// Socle : préférences de mouvement, défilement fluide, en-tête, rideau, curseur, micro-interactions.
const html = document.documentElement;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isMobile = () => matchMedia('(max-width: 900px)').matches;
export const reduced = () => html.classList.contains('motion-reduce');

function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }

export function motionToggle() {
  document.querySelectorAll('[data-motion-toggle]').forEach((b) => {
    b.textContent = reduced() ? 'Activer les animations' : 'Réduire les animations';
    b.setAttribute('aria-pressed', reduced() ? 'true' : 'false');
    b.addEventListener('click', () => { store('sk-motion', reduced() ? 'full' : 'reduce'); location.reload(); });
  });
}

// ---------- défilement fluide (molette sur ordinateur ; le tactile reste natif)
export function smoothScroll(gsap, ScrollTrigger) {
  if (reduced() || !finePointer) return null;
  html.classList.add('smooth');
  let target = scrollY, current = scrollY, active = false;
  const max = () => document.documentElement.scrollHeight - innerHeight;
  const clamp = (v) => Math.max(0, Math.min(max(), v));
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.body.classList.contains('menu-open')) return;
    if (e.target.closest && e.target.closest('textarea, [data-native-scroll]')) return;
    e.preventDefault();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 32; else if (e.deltaMode === 2) dy *= innerHeight;
    if (!active) current = scrollY;
    target = clamp(target + dy);
    active = true;
  }, { passive: false });
  addEventListener('scroll', () => { if (!active) { target = current = scrollY; } }, { passive: true });
  addEventListener('keydown', () => { active = false; });
  gsap.ticker.add((time, dt) => {
    if (!active) return;
    const k = 1 - Math.pow(1 - 0.11, (dt || 16.7) / 16.7);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.4) { current = target; active = false; }
    window.scrollTo(0, current);
  });
  return {
    to(y) { if (!active) current = scrollY; target = clamp(y); active = true; },
    stop() { active = false; },
  };
}

// ---------- ancres internes
export function anchors(scroller) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash.length < 2) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    const header = parseFloat(getComputedStyle(html).getPropertyValue('--header-h')) || 72;
    const y = el.getBoundingClientRect().top + scrollY - (el.matches('section, .hero') ? 0 : header + 16);
    if (scroller) scroller.to(y); else window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' });
    if (el.matches('section')) {
      const focusTarget = el.querySelector('h2, h1');
      if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); setTimeout(() => focusTarget.focus({ preventScroll: true }), reduced() ? 0 : 700); }
    }
  });
}

// ---------- en-tête et menu
export function header() {
  const h = document.querySelector('.site-header');
  if (!h) return;
  let last = scrollY;
  const bar = h.querySelector('.progress-fill');
  const onScroll = () => {
    const y = scrollY;
    if (bar) { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; }
    h.classList.toggle('is-solid', y > 30);
    const menuOpen = document.body.classList.contains('menu-open');
    h.classList.toggle('is-hidden', !menuOpen && y > innerHeight * 0.9 && y > last + 4);
    if (y < last - 4) h.classList.remove('is-hidden');
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const burger = h.querySelector('.burger');
  const menu = document.getElementById('menu-mobile');
  if (!burger || !menu) return;
  const set = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { h.classList.add('is-solid'); const f = menu.querySelector('a'); f && f.focus(); }
  };
  burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); burger.focus(); } });
  matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) set(false); });
}

// ---------- rideau : ouverture et transitions de page
export function curtainOut(gsap) {
  const bars = document.querySelectorAll('.curtain i');
  if (!bars.length || reduced()) return gsap.timeline();
  gsap.set(bars, { scaleY: 1, transformOrigin: '50% 0%' });
  return gsap.timeline().to(bars, { scaleY: 0, duration: 0.62, ease: 'power3.inOut', stagger: 0.05 });
}

export function pageTransitions(gsap) {
  if (reduced()) return;
  const bars = document.querySelectorAll('.curtain i');
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return;
    if (!/\.html$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    html.classList.add('leaving');
    gsap.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.42, ease: 'power3.in', stagger: 0.04, onComplete: () => { location.href = url.href; } });
  });
  addEventListener('pageshow', (e) => { if (e.persisted) { html.classList.remove('leaving'); gsap.set(bars, { scaleY: 0 }); } });
}

// ---------- curseur réticule avec cotes
export function reticle(gsap) {
  if (!finePointer || reduced()) return;
  const r = document.querySelector('.reticle');
  const box = document.querySelector('.reticle-box');
  const label = document.querySelector('.reticle-label');
  if (!r) return;
  html.classList.add('has-reticle');
  const xTo = gsap.quickTo(r, 'x', { duration: 0.18, ease: 'power3' });
  const yTo = gsap.quickTo(r, 'y', { duration: 0.18, ease: 'power3' });
  let hoverEl = null, mx = 0, my = 0, raf = 0;
  const sel = 'a, button, summary, label.chip, [data-tilt], .laptop, .media, .metier, input, textarea';
  const place = () => {
    raf = 0;
    if (!hoverEl) return;
    const b = hoverEl.getBoundingClientRect();
    box.style.transform = `translate(${b.left - 4}px, ${b.top - 4}px)`;
    box.style.width = `${b.width + 8}px`;
    box.style.height = `${b.height + 8}px`;
    label.textContent = `${Math.round(b.width)} × ${Math.round(b.height)}`;
    const lw = label.offsetWidth;
    const lx = Math.min(innerWidth - lw - 8, Math.max(8, b.left - 4));
    const ly = b.top - 26 < 8 ? b.bottom + 8 : b.top - 26;
    label.style.transform = `translate(${lx}px, ${ly}px)`;
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    r.classList.add('on');
    xTo(mx); yTo(my);
    const t = e.target.closest ? e.target.closest(sel) : null;
    if (t !== hoverEl) {
      hoverEl = t;
      r.classList.toggle('is-hover', !!t);
      box.classList.toggle('on', !!t);
      label.classList.toggle('on', !!t);
    }
    if (hoverEl && !raf) raf = requestAnimationFrame(place);
  }, { passive: true });
  addEventListener('scroll', () => { if (hoverEl && !raf) raf = requestAnimationFrame(place); }, { passive: true });
  document.addEventListener('pointerleave', () => { r.classList.remove('on'); box.classList.remove('on'); label.classList.remove('on'); hoverEl = null; });
}

// ---------- boutons magnétiques et inclinaison 3D
export function magnetic(gsap) {
  if (!finePointer || reduced()) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      xTo((e.clientX - b.left - b.width / 2) * 0.28);
      yTo((e.clientY - b.top - b.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' }); });
  });
}

export function tilt(gsap) {
  if (!finePointer || reduced()) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 1000 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    const max = el.matches('.offer, .choice, .service') ? 4 : 7;
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      ry(((e.clientX - b.left) / b.width - 0.5) * max * 2);
      rx(-((e.clientY - b.top) / b.height - 0.5) * max * 2);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

// ---------- titres révélés ligne à ligne, images en parallaxe
export function reveals(gsap, ScrollTrigger, SplitText) {
  if (reduced()) return;
  document.querySelectorAll('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, { yPercent: 105, duration: 0.95, ease: 'power4.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
      },
    });
  });
  document.querySelectorAll('[data-parallax]').forEach((m) => {
    const t = m.querySelector('img, .ph');
    if (!t) return;
    gsap.fromTo(t, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  document.querySelectorAll('[data-float]').forEach((m) => {
    const tw = gsap.to(m, { y: -12, rotation: -2, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
    new IntersectionObserver((en) => { en[0].isIntersecting ? tw.play() : tw.pause(); }).observe(m);
  });
}

// ---------- copier une coordonnée
export function copyButtons() {
  document.querySelectorAll('[data-copy]').forEach((b) => {
    b.addEventListener('click', () => {
      const v = b.getAttribute('data-copy');
      const done = () => { const t = b.textContent; b.textContent = 'Copié'; setTimeout(() => { b.textContent = t; }, 1600); };
      const fallback = () => {
        const sel = b.parentElement.querySelector('.sel');
        if (!sel) return;
        const range = document.createRange(); range.selectNodeContents(sel);
        const s = getSelection(); s.removeAllRanges(); s.addRange(range);
        b.textContent = 'Sélectionné';
        setTimeout(() => { b.textContent = 'Copier'; }, 1600);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, fallback);
        else fallback();
      } catch (e) { fallback(); }
    });
  });
}

// ---------- chiffres qui défilent
export function counters(gsap) {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.getAttribute('data-count'));
    if (reduced()) { el.textContent = String(end); return; }
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.4, ease: 'power3.out', snap: { v: 1 },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(o.v)); },
    });
  });
}
