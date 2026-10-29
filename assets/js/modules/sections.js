// Animations propres à chaque section de la maquette Skapelys.
import { reduced, isMobile, finePointer } from './core.js?v=4';
import { describeDeadline } from './deadline.js?v=4';

const $ = (s, r = document) => r.querySelector(s);

// Une boucle ne tourne que lorsque son élément est à l'écran
export function loopWhileVisible(gsap, el, anim) {
  const io = new IntersectionObserver((en) => { en[0].isIntersecting ? anim.play() : anim.pause(); }, { rootMargin: '80px' });
  io.observe(el);
  return anim;
}
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------------------------------------------------------------- fenêtre « chantier »
function siteParts(root) {
  const svg = $('svg.site-svg', root);
  return {
    svg,
    grid: $('.s-grid', svg),
    paper: $('.s-paper', svg),
    wire: $$('.s-wire > *', svg),
    wireG: $('.s-wire', svg),
    fills: $$('.s-fill > .sf', svg),
    cotes: $('.s-cotes', svg),
    chat: $('.s-chat', svg),
    chatParts: $$('.s-chat > *', svg),
    typing: $$('.s-typing', svg),
    status: $('.browser-status', root),
    statusText: $('.st-text', root),
    url: $('.url-text', root),
  };
}

function setStatus(parts, text, live) {
  if (!parts.statusText) return;
  if (parts.statusText.textContent !== text) parts.statusText.textContent = text;
  parts.status.classList.toggle('is-live', !!live);
}

// État initial « terrain nu » avant la construction
function blank(gsap, parts) {
  gsap.set(parts.wire, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 });
  gsap.set(parts.wireG, { opacity: 1 });
  gsap.set(parts.fills, { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' });
  gsap.set(parts.paper, { opacity: 0 });
  gsap.set(parts.cotes, { opacity: 0 });
  gsap.set(parts.chat, { opacity: 0 });
  gsap.set(parts.grid, { opacity: 0.4 });
}

export function buildTimeline(gsap, parts, { speed = 1, partial = false } = {}) {
  const tl = gsap.timeline();
  tl.to(parts.grid, { opacity: 1, duration: 0.3 * speed })
    .to(parts.wire, { strokeDashoffset: 0, duration: 0.55 * speed, ease: 'power2.inOut', stagger: 0.025 * speed }, '<0.05')
    .to(parts.cotes, { opacity: 1, duration: 0.25 * speed }, '<0.3');
  if (partial) return tl;
  tl
    .call(() => setStatus(parts, 'Développement', false))
    .to(parts.paper, { opacity: 1, duration: 0.3 * speed }, '>0.05')
    .to(parts.fills, { opacity: 1, scale: 1, duration: 0.42 * speed, ease: 'back.out(1.6)', stagger: 0.035 * speed }, '<0.05')
    .to(parts.wireG, { opacity: 0, duration: 0.3 * speed }, '<0.2')
    .to(parts.cotes, { opacity: 0.0, duration: 0.3 * speed }, '>-0.1')
    .call(() => setStatus(parts, 'En ligne', true));
  return tl;
}

function typeUrl(gsap, el, text, duration) {
  const o = { n: 0 };
  return gsap.to(o, { n: text.length, duration, ease: 'none', onUpdate: () => { el.textContent = text.slice(0, Math.round(o.n)); } });
}

// ---------------------------------------------------------------- ouverture
export function heroIntro(gsap, SplitText, curtainTl, onDone) {
  const html = document.documentElement;
  const hero = $('[data-hero]') || $('[data-hero-page]') || $('.notfound');
  if (!hero) { html.classList.remove('intro'); onDone && onDone(); return; }
  const title = $('[data-hero-title]', hero);
  const intro = $$('[data-intro]', hero);
  const visual = $('[data-intro-visual]', hero);
  // seule une fenêtre « chantier » (svg.site-svg) se construit à l'ouverture
  const b0 = $('.browser', hero);
  const browserEl = b0 && $('svg.site-svg', b0) ? b0 : null;
  const mascot = $('[data-mascot]', hero) || $('.mascot-peek', hero);
  if (reduced()) { html.classList.remove('intro'); onDone && onDone(); return; }

  const split = title ? SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' }) : null;
  gsap.set(intro, { y: 22, opacity: 0 });
  if (split) gsap.set(split.lines, { yPercent: 108 });
  if (visual) gsap.set(visual, { y: 40, opacity: 0, rotationX: 8, transformPerspective: 1200, transformOrigin: '50% 100%' });
  let parts = null;
  if (browserEl) {
    parts = siteParts(browserEl);
    blank(gsap, parts);
    setStatus(parts, 'Maquette', false);
    if (parts.url) parts.url.textContent = '';
  }
  if (mascot) gsap.set(mascot, { y: 60, rotation: 12, opacity: 0 });
  html.classList.remove('intro');

  const tl = gsap.timeline({ onComplete: () => onDone && onDone() });
  tl.add(curtainTl, 0);
  if (split) tl.to(split.lines, { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.08, onComplete: () => { html.dataset.titleDone = String(Math.round(performance.now())); split.revert(); } }, 0.22);
  tl.to(intro, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, 0.38);
  if (visual) tl.to(visual, { y: 0, opacity: 1, rotationX: 0, duration: 0.75, ease: 'power3.out' }, 0.3);
  if (parts) {
    if (parts.url) tl.add(typeUrl(gsap, parts.url, browserEl.closest('.notfound') ? 'skapelys.fr/page-introuvable' : 'votre-entreprise.fr', 0.5), 0.45);
    const nf = !!browserEl.closest('.notfound');
    tl.add(buildTimeline(gsap, parts, { speed: 0.68, partial: nf }), 0.5);
    if (nf) tl.call(() => setStatus(parts, 'Introuvable', false));
  }
  if (mascot) tl.to(mascot, { y: 0, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, '>-0.35');
  // la perspective d'entrée est retirée une fois posée (pas de calque 3D permanent)
  if (visual) tl.set(visual, { clearProps: 'transform,transformPerspective,opacity' });
  return tl;
}

// ---------------------------------------------------------------- le chantier en direct (épinglé)
export function chantier(gsap, ScrollTrigger) {
  const sec = $('[data-chantier]');
  if (!sec) return;
  const browserEl = $('.browser', sec);
  const parts = siteParts(browserEl);
  const steps = $$('.step', sec);
  const friseSpans = $$('.frise span', sec);
  const fill = $('.frise-fill', sec);
  const devs = $$('[data-dev]', sec);
  const labels = ['Votre projet', 'Maquette', 'Développement', 'En ligne'];
  const apply = (p) => {
    const i = Math.min(3, Math.floor(p * 4 + 0.0001));
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    setStatus(parts, labels[i], i === 3 && p > 0.86);
    friseSpans.forEach((s, k) => s.classList.toggle('on', p * 4 >= k - 0.02));
    if (fill) gsap.set(fill, { scaleX: Math.min(1, p) });
    devs.forEach((d, k) => d.classList.toggle('on', p > 0.55 + k * 0.06));
  };
  if (reduced() || (isMobile() && innerHeight < 720)) {
    steps.forEach((s) => s.classList.add('is-active'));
    setStatus(parts, 'En ligne', true);
    gsap.set(parts.chat, { opacity: 0 });
    friseSpans.forEach((s) => s.classList.add('on'));
    if (fill) gsap.set(fill, { scaleX: 1 });
    devs.forEach((d) => d.classList.add('on'));
    return;
  }
  blank(gsap, parts);
  gsap.set(parts.chat, { opacity: 1 });
  const later = parts.chatParts.slice(3);
  gsap.set(later, { opacity: 0, y: 14 });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(later, { opacity: 1, y: 0, duration: 0.12, stagger: 0.1, ease: 'power2.out' }, 0.1)
    .to(parts.typing, { opacity: 0.5, duration: 0.1, yoyo: true, repeat: 3 }, 0.55)
    .to(parts.chat, { opacity: 0, duration: 0.15 }, 0.95)
    .to(parts.grid, { opacity: 1, duration: 0.2 }, 1.0)
    .to(parts.wire, { strokeDashoffset: 0, duration: 0.5, stagger: 0.02 }, 1.05)
    .to(parts.cotes, { opacity: 1, duration: 0.15 }, 1.45)
    .to(parts.paper, { opacity: 1, duration: 0.2 }, 2.0)
    .to(parts.fills, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, 2.05)
    .to(parts.wireG, { opacity: 0, duration: 0.2 }, 2.5)
    .to(parts.cotes, { opacity: 0, duration: 0.2 }, 2.7)
    .to(browserEl, { scale: 1.02, duration: 0.3, ease: 'power2.inOut', yoyo: true, repeat: 1 }, 3.3)
    .to({}, { duration: 0.1 }, 3.9);
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: () => '+=' + Math.round(innerHeight * 3.2), pin: true, scrub: 0.6, anticipatePin: 1,
    animation: tl, invalidateOnRefresh: true,
    onUpdate: (st) => apply(st.progress),
  });
  apply(0);
}

// ---------------------------------------------------------------- pour qui : galerie horizontale + caméléon
export function metiers(gsap, ScrollTrigger) {
  const sec = $('[data-metiers]');
  if (!sec) return;
  const track = $('[data-track]', sec);
  const cards = $$('[data-metier]', sec);
  const cham = $('[data-chameleon]', sec);
  const setHue = (card) => { if (cham && card) cham.style.filter = `hue-rotate(${card.dataset.hue}deg) saturate(1.15)`; };
  if (reduced()) {
    track.style.width = 'auto'; track.style.flexWrap = 'wrap';
    return;
  }
  const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
  const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 0.8, animation: tween, invalidateOnRefresh: true, anticipatePin: 1,
    onUpdate: () => {
      const mid = innerWidth / 2; let best = null, bd = 1e9;
      cards.forEach((c) => { const b = c.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - mid); if (d < bd) { bd = d; best = c; } });
      setHue(best);
    },
  });
  cards.forEach((c) => {
    const ms = $('.mini-site', c);
    const im = $('.media img, .media .ph', c);
    if (ms) gsap.from(ms, { yPercent: -40, opacity: 0, rotation: -5, duration: 0.8, ease: 'back.out(1.7)', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 85%', toggleActions: 'play none none reverse' } });
    if (im) gsap.fromTo(im, { xPercent: -4.5, scale: 1.12 }, { xPercent: 4.5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
  });
}

// ---------------------------------------------------------------- services : micro-animations
export function services(gsap, ScrollTrigger) {
  $$('[data-service]').forEach((card) => {
    const svg = $('svg[data-anim]', card);
    if (!svg || reduced()) return;
    const k = svg.dataset.anim;
    let tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
    if (k === 'creation') {
      const b = $$('.blk', svg);
      tl.from(b, { y: -40, opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(1.8)', stagger: 0.12 })
        .to(b, { opacity: 0, y: 20, duration: 0.35, stagger: 0.05 }, '+=1.4');
    } else if (k === 'refonte') {
      const cut = $('.rf-cut', svg), h = $('.rf-handle', svg);
      tl.fromTo(cut, { attr: { width: 20 } }, { attr: { width: 280 }, duration: 1.6, ease: 'power2.inOut' })
        .fromTo(h, { x: -130 }, { x: 130, duration: 1.6, ease: 'power2.inOut' }, 0)
        .to(cut, { attr: { width: 20 }, duration: 1.4, ease: 'power2.inOut' }, '+=0.8')
        .to(h, { x: -130, duration: 1.4, ease: 'power2.inOut' }, '<');
    } else if (k === 'seo') {
      const rows = $$('.seo-row', svg), bars = $$('.seo-bar', svg);
      tl.from(rows, { x: -16, opacity: 0, duration: 0.35, stagger: 0.12 })
        .from(bars, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, stagger: 0.12, ease: 'power2.out' }, 0.1)
        .to(rows, { opacity: 0, duration: 0.3, stagger: 0.05 }, '+=1.4');
    } else if (k === 'maintenance') {
      const bars = $$('.mt-bar', svg), oks = $$('.mt-ok', svg);
      tl.fromTo(bars, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.6, stagger: 0.3, ease: 'power1.inOut' })
        .from(oks, { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.3, ease: 'back.out(2.5)' }, 0.5)
        .to([...bars, ...oks], { opacity: 0, duration: 0.3 }, '+=1.2')
        .set([...bars, ...oks], { opacity: 1 });
    } else if (k === 'depannage') {
      tl = glitchTimeline(gsap, svg, { repeat: -1 });
    }
    ScrollTrigger.create({ trigger: card, start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? tl.play() : tl.pause()) });
  });
}

// Moins de 3 changements brusques par seconde : chaque état dure au moins 0,4 s.
function glitchTimeline(gsap, svg, opts = {}) {
  const ok = $('.gl-ok', svg), bad = $('.gl-bad', svg), fixed = $('.gl-fixed', svg);
  const tl = gsap.timeline({ repeat: opts.repeat ?? 0, repeatDelay: 1, paused: true });
  tl.set(fixed, { opacity: 0 })
    .to(ok, { x: 6, duration: 0.4, ease: 'steps(1)' })
    .set(bad, { opacity: 1 })
    .to(ok, { x: -4, skewX: -6, duration: 0.45, ease: 'steps(1)' })
    .set(bad, { opacity: 0.4 }, '+=0.05')
    .to(ok, { x: 0, skewX: 0, duration: 0.45, ease: 'power2.out' }, '+=0.4')
    .to(bad, { opacity: 0, duration: 0.4 }, '<')
    .to(fixed, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', transformOrigin: '50% 50%' })
    .to({}, { duration: 1.6 });
  return tl;
}

export function glitchCard(gsap, ScrollTrigger) {
  const g = $('[data-glitch]');
  if (!g || reduced()) return;
  const svg = $('svg', g);
  const tl = glitchTimeline(gsap, svg, { repeat: -1 });
  ScrollTrigger.create({ trigger: g, start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? tl.play() : tl.pause()) });
  if (finePointer) g.addEventListener('pointerenter', () => tl.restart());
}

// ---------------------------------------------------------------- réalisations (épinglé)
export function realisations(gsap, ScrollTrigger) {
  $$('[data-real-section]').forEach((sec) => {
    const items = $$('.real-item', sec);
    const shots = $$('.shot', sec);
    const laptop = $('[data-laptop]', sec);
    const link = $('[data-laptop-link]', sec);
    let cur = -1;
    const set = (i) => {
      if (i === cur) return; cur = i;
      items.forEach((x, k) => x.classList.toggle('is-active', k === i));
      shots.forEach((x, k) => x.classList.toggle('is-active', k === i));
      const a = items[i] && $('a', items[i]);
      if (link && a) { link.href = a.href; const dom = $('.domain', items[i]).textContent; $('.laptop-cta', link).textContent = 'Voir ' + dom; link.setAttribute('aria-label', 'Voir le site ' + dom + ' (nouvel onglet)'); }
    };
    set(0);
    if (reduced()) return;
    if (isMobile() && innerHeight < 720) {
      sec.classList.add('no-pin');
      items.forEach((it, k) => it.addEventListener('click', () => set(k)));
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(laptop, { rotationY: -18, rotationX: 8, transformPerspective: 1600 }, { rotationY: 10, rotationX: 0, duration: 1 }, 0);
    shots.forEach((s, k) => {
      const im = $('img', s);
      if (im) tl.fromTo(im, { scale: 1.16, yPercent: 3 }, { scale: 1.08, yPercent: -3, duration: 0.5 }, k * 0.5);
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: () => '+=' + Math.round(innerHeight * 1.8), pin: true, scrub: 0.7, animation: tl, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (st) => set(st.progress < 0.5 ? 0 : 1),
    });
    items.forEach((it, k) => it.addEventListener('mouseenter', () => set(k)));
  });
}

// ---------------------------------------------------------------- avis : pause et arrêt hors écran
export function ribbons() {
  $$('.avis').forEach((sec) => {
    const box = $('.ribbons', sec), btn = $('[data-ribbon-toggle]', sec);
    if (!box) return;
    const io = new IntersectionObserver((en) => box.classList.toggle('is-off', !en[0].isIntersecting));
    io.observe(box);
    if (!btn) return;
    if (reduced()) { btn.hidden = true; return; }
    btn.addEventListener('click', () => {
      const p = !box.classList.contains('is-paused');
      box.classList.toggle('is-paused', p);
      btn.setAttribute('aria-pressed', String(p));
      $('.pause-txt', btn).textContent = p ? 'Reprendre le défilement' : 'Mettre en pause';
    });
  });
}

// ---------------------------------------------------------------- zone : cartes flottantes
export function floatCards(gsap) {
  if (reduced()) return;
  $$('[data-float-card]').forEach((c, i) => {
    gsap.from(c, { y: 30, opacity: 0, duration: 0.8, ease: 'back.out(1.6)', delay: i * 0.15, scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
    loopWhileVisible(gsap, c, gsap.to(c, { y: i % 2 ? 8 : -8, duration: 2.8 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }));
  });
}

// ---------------------------------------------------------------- avis : note qui roule, étoiles qui se remplissent
export function avis(gsap) {
  $$('[data-score]').forEach((sc) => {
    if (reduced()) return;
    const digits = $$('.digit span', sc);
    const fills = $$('.score-stars .fill', sc);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sc, start: 'top 85%', once: true } });
    tl.from(digits, { yPercent: 100, duration: 0.9, ease: 'power4.out', stagger: 0.12 })
      .fromTo(fills, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, stagger: 0.1, ease: 'back.out(2.6)' }, 0.3);
  });
}

// ---------------------------------------------------------------- cartes : Bourg-en-Bresse et ses communes
export function maps(gsap) {
  $$('[data-map]').forEach((m) => {
    const lines = $$('.link-line', m), towns = $$('.town-g', m), dots = $$('.town-dot', m), ring = $('.hub-ring', m);
    if (reduced()) { towns.forEach((t) => t.classList.add('on')); return; }
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 80%', once: true } });
    tl.to(lines, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.14 });
    towns.forEach((t, i) => tl.call(() => t.classList.add('on'), null, 0.55 + i * 0.14));
    tl.fromTo(dots, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.14 }, 0.45);
    tl.fromTo($$('.town-label', m), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.14 }, 0.6);
    if (ring) loopWhileVisible(gsap, m, gsap.to(ring, { attr: { r: 30 }, opacity: 0, duration: 1.8, repeat: -1, ease: 'power1.out', paused: true }));
  });
}

// ---------------------------------------------------------------- bento « pourquoi Skapelys »
export function bento(gsap) {
  if (reduced()) return;
  const chat = $('[data-chat]');
  if (chat) gsap.from($$('.bubble', chat), { y: 16, opacity: 0, scale: 0.94, duration: 0.5, stagger: 0.45, ease: 'back.out(1.8)', transformOrigin: '0% 100%', scrollTrigger: { trigger: chat, start: 'top 80%', once: true } });
  const inc = $('[data-inclus]');
  if (inc) gsap.from($$('.check', inc), { scale: 0, rotation: -90, duration: 0.5, stagger: 0.15, ease: 'back.out(2.4)', scrollTrigger: { trigger: inc, start: 'top 80%', once: true } });
  const del = $('[data-delai]');
  if (del) {
    const spans = $$('.frise span', del), fill = $('.frise-fill', del);
    const tl = gsap.timeline({ scrollTrigger: { trigger: del, start: 'top 80%', once: true } });
    tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power1.inOut' });
    spans.forEach((s, i) => tl.call(() => s.classList.add('on'), null, i * 0.38));
  }
  $$('[data-reveal-photo]').forEach((ph) => gsap.fromTo(ph, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: ph, start: 'top 85%', once: true } }));
}

// ---------------------------------------------------------------- tarifs : conseil en trois questions
export function quiz() {
  $$('[data-quiz]').forEach((q) => {
    const name = $('[data-qr-name]', q), price = $('[data-qr-price]', q), extra = $('[data-qr-extra]', q), cta = $('[data-qr-cta]', q);
    const update = () => {
      const pages = (q.querySelector('input[name="q-pages"]:checked') || {}).value;
      const fn = (q.querySelector('input[name="q-fn"]:checked') || {}).value;
      const mt = (q.querySelector('input[name="q-mt"]:checked') || {}).value;
      const one = pages === '1' && fn === 'non';
      name.textContent = one ? 'Site One Page' : 'Site Sur Mesure';
      price.textContent = (one ? '690 €' : 'dès 990 €') + (mt === 'del' ? ' + 50 €/mois' : '');
      extra.textContent = (one ? 'Livré en 5 jours ouvrés après réception de vos contenus.' : 'Livré en 2 à 3 semaines en général, avec votre fiche Google Business Profile.')
        + (mt === 'del' ? ' Maintenance : mises à jour, sauvegardes et petites modifications.' : '');
      cta.dataset.pick = one ? 'one-page' : 'sur-mesure';
      if (mt === 'del') cta.dataset.pickMaint = '1'; else delete cta.dataset.pickMaint;
    };
    let lastKey = '';
    q.addEventListener('change', () => {
      update();
      const key = name.textContent + price.textContent;
      const g = window.gsap;
      if (key !== lastKey && g && !reduced()) g.fromTo([name, price, extra], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power3.out', overwrite: true });
      lastKey = key;
    });
    update();
    lastKey = name.textContent + price.textContent;
  });
}

// Un bouton de formule présélectionne le formulaire de devis
export function picks() {
  document.addEventListener('click', (e) => {
    const nb = e.target.closest && e.target.closest('[data-pick-need]');
    if (nb) { const n = document.getElementById('besoin-' + nb.dataset.pickNeed); if (n) n.checked = true; return; }
    const b = e.target.closest && e.target.closest('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick;
    const map = { 'one-page': 'formule-one-page', 'sur-mesure': 'formule-sur-mesure', maintenance: 'formule-maintenance' };
    const r = document.getElementById(map[v]);
    if (r) r.checked = true;
    // sur la page Refonte, une formule reste une refonte
    const cur = document.querySelector('input[name="besoin"]:checked');
    if (v !== 'maintenance' && cur && cur.id === 'besoin-refonte') return;
    const need = document.getElementById(v === 'maintenance' ? 'besoin-maintenance' : 'besoin-creation');
    if (need) need.checked = true;
  });
}

// ---------------------------------------------------------------- clés en main : le trousseau
export function cles(gsap) {
  $$('.cles').forEach((sec) => {
    const keys = $$('.key', sec);
    if (!keys.length || reduced()) return;
    gsap.from(keys, { y: -140, opacity: 0, duration: 1.1, ease: 'bounce.out', stagger: 0.18, scrollTrigger: { trigger: sec, start: 'top 65%', once: true } });
  });
}

// ---------------------------------------------------------------- accordéons : FAQ et comparateur
export function faq(gsap) {
  $$('details.qa, details.compare').forEach((d) => {
    const s = $('summary', d), body = $('.answer, .acc-body', d);
    if (!s || !body || reduced()) return;
    let tw = null;
    s.addEventListener('click', (e) => {
      e.preventDefault();
      const closing = d.open && !d.classList.contains('is-closing');
      const from = d.open ? body.offsetHeight : 0;
      const fromO = d.open ? Number(gsap.getProperty(body, 'opacity')) : 0;
      if (tw) tw.kill();
      if (closing) {
        d.classList.add('is-closing');
        tw = gsap.fromTo(body, { height: from }, { height: 0, opacity: 0, duration: 0.38, ease: 'power2.inOut', onComplete: () => { d.open = false; d.classList.remove('is-closing'); gsap.set(body, { clearProps: 'height,opacity' }); } });
      } else {
        d.classList.remove('is-closing');
        d.open = true;
        tw = gsap.fromTo(body, { height: from, opacity: fromO }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out', onComplete: () => gsap.set(body, { clearProps: 'height,opacity' }) });
      }
    });
  });
}

// ---------------------------------------------------------------- demande de devis en trois étapes (simulée)
export function devis(gsap) {
  $$('[data-devis]').forEach((form) => {
    const steps = $$('.form-step', form);
    const prog = $$('.form-progress span', form);
    const prev = $('[data-prev]', form), next = $('[data-next]', form), send = $('[data-send]', form);
    const card = form.closest('.form-card');
    const done = $('[data-done]', card);
    const bodyEl = $('.form-body', card) || card;
    let i = 0, hTw = null;
    const smoothHeight = (fn) => {
      if (reduced()) { fn(); return; }
      const h0 = bodyEl.offsetHeight;
      if (hTw) { hTw.kill(); gsap.set(bodyEl, { clearProps: 'height,overflow' }); }
      fn();
      const h1 = bodyEl.offsetHeight;
      if (Math.abs(h1 - h0) < 2) return;
      hTw = gsap.fromTo(bodyEl, { height: h0, overflow: 'hidden' }, { height: h1, duration: 0.45, ease: 'power3.inOut', onComplete: () => gsap.set(bodyEl, { clearProps: 'height,overflow' }) });
    };
    const show = (n, focus = true) => smoothHeight(() => showStep(n, focus));
    const showStep = (n, focus = true) => {
      i = n;
      steps.forEach((s, k) => { s.hidden = k !== n; });
      prog.forEach((p, k) => p.classList.toggle('on', k <= n));
      prev.hidden = n === 0;
      next.hidden = n === steps.length - 1;
      send.hidden = n !== steps.length - 1;
      if (!reduced()) gsap.from(steps[n], { x: 24, opacity: 0, duration: 0.45, ease: 'power3.out' });
      if (focus) { const f = steps[n].querySelector('input:checked, input, textarea'); f && f.focus({ preventScroll: true }); }
    };
    const msg = (field, text) => { field.classList.toggle('invalid', !!text); const e = $('.err', field); if (e) e.textContent = text || ''; };
    const valid = (n) => {
      let ok = true;
      $$('[data-req]', steps[n]).forEach((f) => {
        const inp = $('input, textarea', f);
        let t = '';
        if (inp.type === 'checkbox') { if (!inp.checked) t = 'Cochez cette case pour que Skapelys puisse vous recontacter.'; }
        else if (!inp.value.trim()) t = inp.name === 'projet' ? 'Décrivez votre projet en quelques mots.' : (inp.name === 'nom' ? 'Indiquez votre nom.' : 'Indiquez votre adresse e-mail.');
        else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) t = 'Cette adresse e-mail semble incomplète, par exemple nom@domaine.fr.';
        msg(f, t);
        if (t && ok) { ok = false; inp.focus(); }
      });
      return ok;
    };
    $$('[data-req] input, [data-req] textarea', form).forEach((inp) => inp.addEventListener('input', () => { const f = inp.closest('[data-req]'); if (f.classList.contains('invalid')) msg(f, ''); }));
    next.addEventListener('click', () => { if (valid(i)) show(i + 1); });
    prev.addEventListener('click', () => show(i - 1));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid(i)) return;
      const dl = $('[data-done-deadline]', done);
      if (dl) dl.textContent = describeDeadline(new Date()).text;
      smoothHeight(() => { form.hidden = true; done.hidden = false; });
      done.focus({ preventScroll: true });
      if (!reduced()) {
        gsap.from(done.children, { y: 20, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' });
        const m = $('.done-mascot', done);
        if (m) gsap.from(m, { rotation: -14, scale: 0.6, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
      }
    });
    $('[data-restart]', done).addEventListener('click', () => { form.reset(); smoothHeight(() => { form.hidden = false; done.hidden = true; showStep(0); }); });
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && i < steps.length - 1) { e.preventDefault(); next.click(); }
    });
    showStep(0, false);
  });
}

// ---------------------------------------------------------------- pied de page
export function footerWord(gsap) {
  const w = $('.footer-word .fill');
  if (!w || reduced()) return;
  gsap.fromTo(w, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
}

// ---------------------------------------------------------------- page Création : une page ou plusieurs
export function pagesAnim(gsap) {
  const el = $('[data-pages-anim]');
  if (!el || reduced()) return;
  const one = $('.pa-one', el), multi = $('.pa-multi', el), blks = $$('.pa-blk', el), sheets = $$('.pa-sheet', el);
  const l1 = $$('.pa-lab-one', el), l2 = $$('.pa-lab-multi', el);
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3, paused: true });
  loopWhileVisible(gsap, el, tl);
  tl.to({}, { duration: 1.6 })
    .to(one, { scale: 0.85, opacity: 0, duration: 0.45, transformOrigin: '50% 50%', ease: 'power2.in' })
    .to(l1, { opacity: 0, duration: 0.3 }, '<')
    .set(multi, { opacity: 1 })
    .fromTo(sheets, { x: (k) => (k - 1) * -195, rotation: (k) => (k - 1) * 8, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', immediateRender: false })
    .to(l2, { opacity: 1, duration: 0.3 }, '<0.2')
    .to({}, { duration: 1.8 })
    .to(sheets, { x: (k) => (k - 1) * -195, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.in' })
    .to(l2, { opacity: 0, duration: 0.3 }, '<')
    .set(multi, { opacity: 0 })
    .set(one, { scale: 1, opacity: 1 })
    .fromTo(blks, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(1.7)', immediateRender: false })
    .to(l1, { opacity: 1, duration: 0.3 }, '<');
}

// ---------------------------------------------------------------- page Maintenance : tableau de bord illustratif
export function dashboard(gsap) {
  const d = $('[data-dash]');
  if (!d || reduced()) return;
  const bars = $$('.upd .bar i', d), st = $$('.upd .st', d), path = $('.uptime path', d);
  gsap.set(bars, { scaleX: 1 });
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 1.4, paused: true });
  loopWhileVisible(gsap, d, tl);
  tl.set(st, { opacity: 0 })
    .fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.45, ease: 'power1.inOut' })
    .to(st, { opacity: 1, duration: 0.3, stagger: 0.45 }, 0.7);
  if (path) loopWhileVisible(gsap, d, gsap.fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: 'none', repeat: -1, repeatDelay: 0.6, paused: true }));
}

export function checklists(gsap) {
  $$('[data-checklist]').forEach((ul) => {
    if (reduced()) return;
    gsap.from($$('li', ul), { x: -16, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: ul, start: 'top 82%', once: true } });
  });
}
