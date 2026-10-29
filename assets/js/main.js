// Point d'entrée de la maquette Skapelys.
import * as core from './modules/core.js?v=3';
import * as S from './modules/sections.js?v=3';
import { mountDeadlines } from './modules/deadline.js?v=3';

const html = document.documentElement;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const SplitText = window.SplitText;

function basics() {
  core.header();
  core.motionToggle();
  core.copyButtons();
  mountDeadlines();
  S.quiz();
  S.picks();
  S.ribbons();
}

// Arrivée sur une ancre (#tarifs…) : une seule fois, et jamais si le visiteur a déjà défilé
let hashDone = false, userScrolled = false;
addEventListener('wheel', () => { userScrolled = true; }, { passive: true, once: true });
addEventListener('touchmove', () => { userScrolled = true; }, { passive: true, once: true });
addEventListener('keydown', () => { userScrolled = true; }, { once: true });
function goToHash(final) {
  if (hashDone || userScrolled || !location.hash || location.hash.length < 2) return;
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) window.scrollTo(0, core.anchorY(el));
  if (final) hashDone = true;
}

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; }
}

async function start() {
  if (!gsap || !ScrollTrigger || !SplitText) {
    html.classList.remove('intro');
    html.classList.add('no-gl');
    const c = document.querySelector('.curtain'); if (c) c.style.display = 'none';
    basics();
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 450))]);

  basics();
  S.devis(gsap);
  S.faq(gsap);
  const scroller = core.smoothScroll(gsap);
  core.anchors(scroller);
  core.pageTransitions(gsap);

  // le champ de lignes WebGL n'apparaît qu'après l'ouverture ; sans WebGL, la grille CSS prend le relais
  const glHost = document.querySelector('[data-gl]');
  const glOk = !!glHost && !core.reduced() && webglAvailable();
  if (glHost && !glOk) html.classList.add('no-gl');
  const startGL = () => {
    if (!glOk) return;
    import('./modules/gl.js?v=3').then((m) => { if (!m.mountField(glHost, gsap)) html.classList.add('no-gl'); }).catch(() => html.classList.add('no-gl'));
  };
  S.heroIntro(gsap, SplitText, core.curtainOut(gsap), () => { html.dataset.introDone = String(Math.round(performance.now())); startGL(); });

  // sections épinglées d'abord, dans l'ordre de la page
  S.chantier(gsap, ScrollTrigger);
  S.metiers(gsap, ScrollTrigger);
  S.realisations(gsap, ScrollTrigger);

  // le reste
  core.reveals(gsap, ScrollTrigger, SplitText);
  core.counters(gsap);
  S.services(gsap, ScrollTrigger);
  S.glitchCard(gsap, ScrollTrigger);
  S.avis(gsap);
  S.floatCards(gsap);
  S.maps(gsap);
  S.bento(gsap);
  S.cles(gsap);
  S.footerWord(gsap);
  S.pagesAnim(gsap);
  S.dashboard(gsap);
  S.checklists(gsap);
  core.magnetic(gsap);
  core.tilt(gsap);
  core.reticle(gsap);

  ScrollTrigger.refresh();
  goToHash(false);
  addEventListener('load', () => { ScrollTrigger.refresh(); goToHash(true); }, { once: true });
  if (document.readyState === 'complete') { ScrollTrigger.refresh(); goToHash(true); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
