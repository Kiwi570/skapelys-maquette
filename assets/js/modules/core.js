// Socle : préférences de mouvement, défilement fluide, en-tête, rideau, curseur, micro-interactions.
const html = document.documentElement;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isMobile = () => matchMedia('(max-width: 900px)').matches;
export const reduced = () => html.classList.contains('motion-reduce');

function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }

// Adresse comparable, que le lien finisse par .html ou non (Vercel sert les adresses sans .html)
export const samePath = (a, b) => {
  const n = (p) => (p.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/');
  return n(a) === n(b);
};

export function motionToggle() {
  document.querySelectorAll('[data-motion-toggle]').forEach((b) => {
    b.textContent = reduced() ? 'Activer les animations' : 'Réduire les animations';
    b.setAttribute('aria-pressed', reduced() ? 'true' : 'false');
    b.addEventListener('click', () => { store('sk-motion', reduced() ? 'full' : 'reduce'); location.reload(); });
  });
}

// ---------- défilement fluide (molette et pavé tactile sur ordinateur ; le tactile reste natif)
export function smoothScroll(gsap) {
  if (reduced() || !finePointer) return null;
  html.classList.add('smooth');
  let target = scrollY, current = scrollY, active = false;
  const max = () => document.documentElement.scrollHeight - innerHeight;
  const clamp = (v) => Math.max(0, Math.min(max(), v));
  const stop = () => { active = false; target = current = scrollY; };
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.body.classList.contains('menu-open')) return;
    if (e.target.closest && e.target.closest('textarea, select, [data-native-scroll]')) return;
    e.preventDefault();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 32; else if (e.deltaMode === 2) dy *= innerHeight;
    if (!active) current = target = scrollY;
    target = clamp(target + dy);
    active = true;
  }, { passive: false });
  addEventListener('scroll', () => { if (!active) { target = current = scrollY; } }, { passive: true });
  // clavier, barre de défilement, glisser : le navigateur reprend la main tout de suite
  addEventListener('keydown', stop);
  addEventListener('pointerdown', (e) => { if (e.clientX >= document.documentElement.clientWidth || e.button === 1) stop(); });
  addEventListener('resize', () => { target = clamp(target); });
  gsap.ticker.add((time, dt) => {
    if (!active) return;
    const k = 1 - Math.pow(1 - 0.11, (dt || 16.7) / 16.7);
    target = clamp(target);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.5) { current = target; active = false; }
    window.scrollTo(0, current);
  });
  return {
    to(y) { if (!active) current = scrollY; target = clamp(y); active = true; },
    stop,
  };
}

// Position d'arrivée d'une ancre : les sections ont leur propre marge, les autres éléments passent sous l'en-tête
export function anchorY(el) {
  const header = parseFloat(getComputedStyle(html).getPropertyValue('--header-h')) || 72;
  return Math.round(el.getBoundingClientRect().top + scrollY - (el.matches('section, .hero') ? 0 : header + 16));
}

// ---------- ancres internes
export function anchors(scroller) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (!samePath(url.pathname, location.pathname) || !url.hash || url.hash.length < 2) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    const y = anchorY(el);
    if (scroller) scroller.to(y); else window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', url.hash);
    if (el.matches('section')) {
      const focusTarget = el.querySelector('h2, h1');
      if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); setTimeout(() => focusTarget.focus({ preventScroll: true }), reduced() ? 0 : 700); }
    }
  });
}

// ---------- en-tête, barre d'avancement et menu téléphone
export function header() {
  const gsap = window.gsap;
  const h = document.querySelector('.site-header');
  if (!h) return;
  let last = scrollY, ticking = false;
  const bar = h.querySelector('.progress-fill');
  const update = () => {
    ticking = false;
    const y = scrollY;
    if (bar) { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; }
    h.classList.toggle('is-solid', y > 30);
    const menuOpen = document.body.classList.contains('menu-open');
    if (!menuOpen && y > innerHeight * 0.9 && y > last + 4) h.classList.add('is-hidden');
    else if (y < last - 4 || y <= innerHeight * 0.9 || menuOpen) h.classList.remove('is-hidden');
    last = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
  // l'en-tête réapparaît dès qu'un élément de la navigation reçoit le focus clavier
  h.addEventListener('focusin', () => h.classList.remove('is-hidden'));

  const burger = h.querySelector('.burger');
  const menu = document.getElementById('menu-mobile');
  if (!burger || !menu) return;
  const items = () => [...menu.children];
  let anim = null;
  const set = (open, { focusBurger = false } = {}) => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    if (open === isOpen) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (anim) anim.kill();
    if (open) {
      h.classList.add('is-solid'); h.classList.remove('is-hidden');
      menu.hidden = false;
      if (gsap && !reduced()) {
        anim = gsap.timeline()
          .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'power3.inOut' })
          .fromTo(items(), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.045 }, 0.18);
      }
      const f = menu.querySelector('a'); f && f.focus({ preventScroll: true });
    } else {
      const done = () => { menu.hidden = true; if (gsap) gsap.set([menu, ...items()], { clearProps: 'clipPath,opacity,transform' }); };
      if (gsap && !reduced()) anim = gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.38, ease: 'power3.in', onComplete: done });
      else done();
      if (focusBurger) burger.focus();
    }
  };
  burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) set(false); });
  addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') set(false, { focusBurger: true });
    if (e.key === 'Tab') {
      // le focus reste dans le menu ouvert (bouton de fermeture compris)
      const f = [burger, ...menu.querySelectorAll('a, button')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) set(false); });
}

// ---------- rideau : ouverture et transitions de page
const curtainEl = () => document.querySelector('.curtain');

export function curtainOut(gsap) {
  const c = curtainEl();
  const bars = c ? c.querySelectorAll('i') : [];
  if (!c || reduced()) { if (c) c.style.display = 'none'; return gsap.timeline(); }
  // le rideau reste affiché pendant toute sa sortie, puis disparaît
  gsap.set(c, { display: 'grid' });
  gsap.set(bars, { scaleY: 1, transformOrigin: '50% 0%' });
  const logo = c.querySelector('.curtain-logo');
  const tl = gsap.timeline({ onComplete: () => gsap.set(c, { display: 'none' }) });
  if (logo) tl.to(logo, { opacity: 0, y: -14, duration: 0.3, ease: 'power2.in' }, 0);
  tl.to(bars, { scaleY: 0, duration: 0.62, ease: 'power4.inOut', stagger: { each: 0.045, from: 'start' } }, 0.06);
  return tl;
}

export function pageTransitions(gsap) {
  if (reduced()) return;
  const c = curtainEl();
  if (!c) return;
  const bars = c.querySelectorAll('i');
  const logo = c.querySelector('.curtain-logo');
  const isPage = (url) => url.origin === location.origin && (!/\.[a-z0-9]{2,5}$/i.test(url.pathname) || /\.html$/i.test(url.pathname));
  // les pages du site se préchargent dès le survol
  const prefetched = new Set();
  const prefetch = (a) => {
    const url = new URL(a.href, location.href);
    if (!isPage(url) || samePath(url.pathname, location.pathname) || prefetched.has(url.pathname)) return;
    prefetched.add(url.pathname);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = url.pathname; document.head.appendChild(l);
  };
  document.addEventListener('pointerover', (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !a.target) prefetch(a); }, { passive: true });
  document.addEventListener('focusin', (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !a.target) prefetch(a); });
  let leaving = false;
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (!isPage(url)) return;
    if (samePath(url.pathname, location.pathname)) {
      // lien vers la page en cours sans ancre : on remonte en haut au lieu de recharger
      if (!url.hash) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      return;
    }
    e.preventDefault();
    leaving = true;
    html.classList.add('leaving');
    gsap.set(c, { display: 'grid' });
    const tl = gsap.timeline({ onComplete: () => { location.href = url.href; } });
    tl.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.42, ease: 'power4.inOut', stagger: 0.035 });
    if (logo) tl.fromTo(logo, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.18');
  });
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    html.classList.remove('leaving');
    gsap.set(bars, { scaleY: 0 }); gsap.set(c, { display: 'none' });
  });
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
  let hoverEl = null, mx = -100, my = -100, raf = 0, inside = false;
  const sel = 'a, button, summary, label.chip, [data-tilt], .laptop, .media, .metier';
  const textSel = 'input:not([type="radio"]):not([type="checkbox"]), textarea';
  const setHover = (t) => {
    if (t === hoverEl) return;
    hoverEl = t;
    r.classList.toggle('is-hover', !!t);
    box.classList.toggle('on', !!t);
    label.classList.toggle('on', !!t);
  };
  const place = () => {
    raf = 0;
    // l'élément sous le pointeur peut changer pendant le défilement
    const under = document.elementFromPoint(mx, my);
    const overText = !!(under && under.closest && under.closest(textSel));
    r.classList.toggle('is-text', overText);
    setHover(!overText && under && under.closest ? under.closest(sel) : null);
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
  const schedule = () => { if (inside && !raf) raf = requestAnimationFrame(place); };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    inside = true;
    mx = e.clientX; my = e.clientY;
    r.classList.add('on');
    xTo(mx); yTo(my);
    schedule();
  }, { passive: true });
  addEventListener('scroll', schedule, { passive: true });
  const hide = () => { inside = false; r.classList.remove('on'); setHover(null); };
  document.documentElement.addEventListener('mouseleave', hide);
  addEventListener('blur', hide);
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
    el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true }); });
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
        return gsap.from(self.lines, { yPercent: 105, duration: 0.95, ease: 'power4.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      },
    });
  });
  // le décalage reste inférieur au débord de l'image (8 %) : aucun bord ne se découvre
  document.querySelectorAll('[data-parallax]').forEach((m) => {
    const t = m.querySelector('img, .ph');
    if (!t) return;
    gsap.fromTo(t, { yPercent: -5.5 }, { yPercent: 5.5, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  document.querySelectorAll('[data-float]').forEach((m) => {
    const tw = gsap.to(m, { y: -12, rotation: -2, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
    new IntersectionObserver((en) => { en[0].isIntersecting ? tw.play() : tw.pause(); }).observe(m);
  });
}

// ---------- copier une coordonnée
export function copyButtons() {
  document.querySelectorAll('[data-copy]').forEach((b) => {
    const original = b.textContent;
    let timer = 0;
    const say = (t) => { b.textContent = t; clearTimeout(timer); timer = setTimeout(() => { b.textContent = original; }, 1600); };
    b.addEventListener('click', () => {
      const v = b.getAttribute('data-copy');
      const fallback = () => {
        const sel = b.parentElement.querySelector('.sel');
        if (!sel) return;
        const range = document.createRange(); range.selectNodeContents(sel);
        const s = getSelection(); s.removeAllRanges(); s.addRange(range);
        say('Sélectionné');
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(() => say('Copié'), fallback);
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
    // largeur figée sur la valeur finale : le symbole € ne bouge pas pendant le comptage
    const w = el.getBoundingClientRect().width;
    el.style.display = 'inline-block';
    el.style.minWidth = `${Math.ceil(w)}px`;
    el.style.textAlign = 'right';
    const below = el.getBoundingClientRect().top > innerHeight * 0.9;
    const o = { v: 0 };
    if (below) el.textContent = '0';
    gsap.to(o, {
      v: end, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(o.v)); },
      onComplete: () => { el.textContent = String(end); },
    });
  });
}
