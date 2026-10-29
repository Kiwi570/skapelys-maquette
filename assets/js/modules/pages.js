// Effets des pages Refonte, Référencement, Dépannage et pages légales, et menu Services de l'en-tête.
import { reduced, finePointer, anchorY } from './core.js?v=5';
import { loopWhileVisible } from './sections.js?v=5';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------------------------------------------------------------- menu Services (en-tête)
export function megaMenu() {
  const gsap = window.gsap;
  const trig = $('.nav-trigger'), panel = document.getElementById('menu-services');
  if (!trig || !panel) return;
  const item = trig.closest('.nav-item');
  let open = false, tw = null, timer = 0, openedAt = 0, y0 = 0;
  const anim = () => gsap && !reduced();
  const set = (v, { focusFirst = false } = {}) => {
    if (v === open) { if (v && focusFirst) { const f = $('a', panel); f && f.focus(); } return; }
    open = v;
    trig.setAttribute('aria-expanded', String(v));
    if (tw) tw.kill();
    if (v) {
      openedAt = performance.now(); y0 = scrollY;
      panel.hidden = false;
      if (anim()) {
        tw = gsap.timeline()
          .fromTo(panel, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' })
          .fromTo($$('.mega-item', panel), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.36, stagger: 0.04, ease: 'power3.out' }, 0.04);
      }
      if (focusFirst) { const f = $('a', panel); f && f.focus(); }
    } else {
      const done = () => { panel.hidden = true; if (gsap) gsap.set([panel, ...$$('.mega-item', panel)], { clearProps: 'opacity,transform' }); };
      if (anim()) tw = gsap.to(panel, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in', onComplete: done });
      else done();
    }
  };
  trig.addEventListener('click', () => {
    // un clic juste après l'ouverture au survol ne referme pas le menu
    if (open && performance.now() - openedAt < 450) return;
    set(!open);
  });
  trig.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); set(true, { focusFirst: true }); } });
  if (finePointer) {
    item.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(timer); timer = setTimeout(() => set(true), 70); });
    item.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(timer); timer = setTimeout(() => set(false), 240); });
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { set(false); trig.focus(); } });
  document.addEventListener('click', (e) => { if (open && !item.contains(e.target)) set(false); });
  item.addEventListener('focusout', (e) => { if (open && e.relatedTarget && !item.contains(e.relatedTarget)) set(false); });
  addEventListener('scroll', () => { if (open && Math.abs(scrollY - y0) > 60) set(false); }, { passive: true });
  panel.addEventListener('keydown', (e) => {
    const links = $$('a', panel); const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) trig.focus(); else links[i - 1].focus(); }
  });
}

// ---------------------------------------------------------------- Refonte : comparateur avant / après
export function beforeAfter(gsap) {
  $$('[data-ba]').forEach((el) => {
    const before = $('[data-ba-before]', el), handle = $('[data-ba-handle]', el), range = $('.ba-range', el);
    if (!before || !range) return;
    const set = (v) => { before.style.clipPath = `inset(0 ${100 - v}% 0 0)`; handle.style.left = `${v}%`; };
    range.addEventListener('input', () => set(+range.value));
    set(+range.value);
    if (reduced() || !gsap) return;
    const o = { v: 50 };
    const upd = () => { set(o.v); range.value = String(Math.round(o.v)); };
    const tl = gsap.timeline({ paused: true, delay: 1 })
      .to(o, { v: 84, duration: 0.95, ease: 'power2.inOut', onUpdate: upd })
      .to(o, { v: 16, duration: 1.2, ease: 'power2.inOut', onUpdate: upd })
      .to(o, { v: 50, duration: 0.8, ease: 'power2.inOut', onUpdate: upd });
    let touched = false;
    const stop = () => { touched = true; tl.kill(); };
    range.addEventListener('pointerdown', stop);
    range.addEventListener('keydown', stop);
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting && !touched) { tl.play(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
  });
}

// ---------------------------------------------------------------- Refonte : avant / après en listes
export function versus(ScrollTrigger) {
  $$('[data-vs]').forEach((el) => {
    if (reduced() || !ScrollTrigger) { el.classList.add('is-on'); return; }
    ScrollTrigger.create({ trigger: el, start: 'top 72%', once: true, onEnter: () => el.classList.add('is-on') });
  });
}

// ---------------------------------------------------------------- Refonte : adresse du site ajoutée au devis
export function audit(scroller) {
  $$('[data-audit]').forEach((form) => {
    const input = $('input', form), msg = $('[data-audit-msg]', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let v = input.value.trim();
      if (!v || !/\./.test(v)) { msg.textContent = 'Indiquez l’adresse de votre site, par exemple votre-site.fr.'; input.focus(); return; }
      if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
      const site = document.getElementById('f-site'); if (site) site.value = v;
      const need = document.getElementById('besoin-refonte'); if (need) need.checked = true;
      msg.textContent = 'Adresse ajoutée à votre demande de devis.';
      const c = document.getElementById('contact');
      if (c) { const y = anchorY(c); if (scroller) scroller.to(y); else window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' }); }
    });
  });
}

// ---------------------------------------------------------------- Référencement : page de résultats (illustrative)
export function serp(gsap) {
  $$('[data-serp]').forEach((el) => {
    const rows = $$('.serp-item', el), q = $('[data-serp-q]', el);
    const you = rows.find((r) => r.classList.contains('is-you'));
    if (!you || rows.length < 6) return;
    const final = () => {
      const rh = rows[1].offsetTop - rows[0].offsetTop;
      gsap && gsap.set(you, { y: -4 * rh });
      gsap && gsap.set(rows.slice(1, 5), { y: rh });
    };
    if (reduced() || !gsap) { if (gsap) final(); else el.classList.add('is-static'); return; }
    const text = q.textContent;
    const o = { n: 0 };
    let rh = 0;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
    tl.call(() => { rh = rows[1].offsetTop - rows[0].offsetTop; gsap.set(rows, { y: 0, opacity: 1 }); you.classList.remove('is-up'); })
      .fromTo(o, { n: 0 }, { n: text.length, duration: 0.9, ease: 'none', onUpdate: () => { q.textContent = text.slice(0, Math.round(o.n)); } })
      .from(rows, { opacity: 0, y: 14, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '+=0.15');
    for (let k = 0; k < 4; k++) {
      const above = rows[4 - k];
      tl.to(you, { y: () => -(k + 1) * rh, duration: 0.5, ease: 'power3.inOut', onStart: () => you.classList.add('is-up') }, k === 0 ? '+=0.5' : '+=0.25')
        .to(above, { y: () => rh, duration: 0.5, ease: 'power3.inOut' }, '<');
    }
    tl.to({}, { duration: 2.4 })
      .to(rows, { opacity: 0, duration: 0.35, ease: 'power2.in' });
    loopWhileVisible(gsap, el, tl);
  });
}

// ---------------------------------------------------------------- Référencement : six chantiers animés
export function seoIcons(gsap, ScrollTrigger) {
  $$('[data-seo-ico]').forEach((svg) => {
    if (reduced() || !gsap) return;
    const k = svg.dataset.seoIco;
    const tl = gsap.timeline({ paused: true });
    if (k === 'kw') tl.from($$('.k-chips rect', svg), { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.08, ease: 'back.out(2.4)' }).fromTo($('.k-lens', svg), { x: -60 }, { x: 0, duration: 0.8, ease: 'power3.out' }, 0.1);
    if (k === 'txt') tl.from($$('rect', svg), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, stagger: 0.12, ease: 'power3.out' });
    if (k === 'tree') tl.from($$('.tr', svg), { x: -14, opacity: 0, duration: 0.45, stagger: 0.14, ease: 'power3.out' });
    if (k === 'speed') tl.fromTo($('.g-fg', svg), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0.18, duration: 1.1, ease: 'power3.out' }).fromTo($('.g-needle', svg), { rotation: -75, svgOrigin: '60 66' }, { rotation: 55, svgOrigin: '60 66', duration: 1.1, ease: 'power3.out' }, 0);
    if (k === 'links') tl.fromTo($$('.l-line', svg), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }).from($$('circle', svg), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, stagger: 0.08, ease: 'back.out(2.4)' }, 0.2);
    if (k === 'pin') tl.from($$('.p-pin, .p-dot', svg), { y: -26, opacity: 0, duration: 0.7, ease: 'bounce.out' }).fromTo($('.p-ring', svg), { scale: 0.4, opacity: 1, transformOrigin: '50% 50%' }, { scale: 2.6, opacity: 0, duration: 1, ease: 'power2.out' }, 0.5);
    const card = svg.closest('.seo-card');
    ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: () => tl.play() });
    if (finePointer && card) card.addEventListener('pointerenter', () => tl.restart());
  });
}

// ---------------------------------------------------------------- Dépannage : diagnostic en direct (illustratif)
export function fixHero(gsap) {
  $$('[data-fix]').forEach((el) => {
    const status = $('[data-fix-status]', el), txt = $('.st-text', status), lines = $$('[data-line]', el), svg = $('.fix-view svg', el);
    const ok = $('.gl-ok', svg), bad = $('.gl-bad', svg), fixed = $('.gl-fixed', svg);
    const setS = (t, cls) => { if (txt.textContent !== t) txt.textContent = t; status.classList.remove('is-alert', 'is-live'); if (cls) status.classList.add(cls); };
    if (reduced() || !gsap) {
      setS('En ligne', 'is-live');
      if (bad) bad.setAttribute('opacity', '0');
      if (fixed) fixed.setAttribute('opacity', '1');
      lines.forEach((l) => { l.style.opacity = '1'; });
      return;
    }
    // état de départ : le site est en panne
    setS('Erreur critique', 'is-alert'); gsap.set(lines, { opacity: 0, y: 6 }); gsap.set(bad, { opacity: 1 }); gsap.set(ok, { x: -16, skewX: -4 });
    // chaque état dure au moins 0,35 s : jamais plus de 3 changements brusques par seconde
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.6, paused: true, delay: 1.1 });
    tl.call(() => setS('Erreur critique', 'is-alert'))
      .set(lines, { opacity: 0, y: 6 }).set(fixed, { opacity: 0 }).set(bad, { opacity: 1 }).set(ok, { x: -16, skewX: -4 })
      .to({}, { duration: 1 })
      .call(() => setS('Diagnostic', null))
      .to(lines[0], { opacity: 1, y: 0, duration: 0.35 })
      .to(lines[1], { opacity: 1, y: 0, duration: 0.35 }, '+=0.7')
      .to(bad, { opacity: 0, duration: 0.45 }, '+=0.35')
      .to(ok, { x: 0, skewX: 0, duration: 0.45, ease: 'power2.out' }, '<')
      .to(lines[2], { opacity: 1, y: 0, duration: 0.35 }, '+=0.2')
      .to(fixed, { opacity: 1, duration: 0.4 }, '+=0.35')
      .call(() => setS('En ligne', 'is-live'))
      .to(lines[3], { opacity: 1, y: 0, duration: 0.35 }, '<');
    loopWhileVisible(gsap, el, tl);
  });
}

// ---------------------------------------------------------------- Dépannage : étapes qui s'allument au défilement
export function process(gsap, ScrollTrigger) {
  $$('[data-proc]').forEach((el) => {
    const steps = $$('[data-proc-step]', el);
    if (reduced() || !ScrollTrigger) { steps.forEach((s) => s.classList.add('on')); return; }
    // chaque étape s'allume en arrivant aux deux tiers de l'écran, et s'éteint si l'on remonte
    steps.forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 68%', onToggle: (st) => { if (st.isActive || st.progress === 1) s.classList.add('on'); }, onLeaveBack: () => s.classList.remove('on') }));
  });
}

// ---------------------------------------------------------------- Dépannage : les pannes se réparent
export function pannes(ScrollTrigger) {
  const cards = $$('[data-panne]');
  if (!cards.length) return;
  if (reduced() || !ScrollTrigger) { cards.forEach((c) => c.classList.add('is-fixed')); return; }
  cards.forEach((c, i) => ScrollTrigger.create({ trigger: c, start: 'top 82%', once: true, onEnter: () => setTimeout(() => c.classList.add('is-fixed'), 250 + (i % 3) * 160) }));
}

// ---------------------------------------------------------------- pages légales : sommaire qui suit la lecture
export function toc() {
  const nav = $('[data-toc]');
  if (!nav) return;
  const links = $$('a', nav);
  const secs = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  let cur = null, raf = 0;
  const update = () => {
    raf = 0;
    // la section courante est la dernière dont le titre est passé sous l'en-tête
    const hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    const line = Math.min(innerHeight * 0.33, hh + 64);
    let k = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) k = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4 && secs.length) {
      const last = secs[secs.length - 1].getBoundingClientRect();
      if (last.top < innerHeight) k = secs.length - 1;
    }
    if (links[k] === cur) return;
    if (cur) cur.removeAttribute('aria-current');
    cur = links[k]; cur.setAttribute('aria-current', 'true');
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}
