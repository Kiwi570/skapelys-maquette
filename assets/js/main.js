// Point d'entrée de la maquette Skapelys.
import * as core from './modules/core.js?v=1';
import * as S from './modules/sections.js?v=1';
import { mountDeadlines } from './modules/deadline.js?v=1';

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
}

function goToHash() {
  if (!location.hash || location.hash.length < 2) return;
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY);
}

async function start() {
  if (!gsap || !ScrollTrigger || !SplitText) {
    html.classList.remove('intro');
    basics();
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 450))]);

  basics();
  S.devis(gsap);
  S.faq(gsap);
  const scroller = core.smoothScroll(gsap, ScrollTrigger);
  core.anchors(scroller);
  core.pageTransitions(gsap);

  const startGL = () => {
    const host = document.querySelector('[data-gl]');
    if (!host || core.reduced()) return;
    let ok = false;
    try { const c = document.createElement('canvas'); ok = !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { ok = false; }
    if (!ok) return;
    import('./modules/gl.js?v=1').then((m) => m.mountField(host, gsap)).catch(() => {});
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
  goToHash();
  addEventListener('load', () => { ScrollTrigger.refresh(); goToHash(); }, { once: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
