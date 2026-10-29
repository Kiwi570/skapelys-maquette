// Délai « réponse sous 24 h ouvrées » : calcul indicatif.
// Lecture retenue : le jour ouvré suivant, à la même heure, hors samedis, dimanches et jours fériés français.
// Message envoyé un jour non ouvré : réponse avant la fin du jour ouvré suivant.

function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const key = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const cache = new Map();

export function holidays(year) {
  if (cache.has(year)) return cache.get(year);
  const e = easterSunday(year);
  const plus = (n) => new Date(e.getFullYear(), e.getMonth(), e.getDate() + n);
  const list = [
    new Date(year, 0, 1), plus(1), new Date(year, 4, 1), new Date(year, 4, 8), plus(39), plus(50),
    new Date(year, 6, 14), new Date(year, 7, 15), new Date(year, 10, 1), new Date(year, 10, 11), new Date(year, 11, 25),
  ];
  const set = new Set(list.map(key));
  cache.set(year, set);
  return set;
}

export function isBusinessDay(d) {
  const wd = d.getDay();
  if (wd === 0 || wd === 6) return false;
  return !holidays(d.getFullYear()).has(key(d));
}

export function responseDeadline(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), now.getMinutes(), 0, 0);
  if (isBusinessDay(now)) {
    while (!isBusinessDay(next)) next.setDate(next.getDate() + 1);
    return { date: next, endOfDay: false };
  }
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 0, 0);
  while (!isBusinessDay(d)) d.setDate(d.getDate() + 1);
  return { date: d, endOfDay: true };
}

const fmtDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtTime = new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', minute: '2-digit' });

export function describeDeadline(now = new Date()) {
  const { date, endOfDay } = responseDeadline(now);
  const day = fmtDay.format(date);
  const time = fmtTime.format(date).replace(':', ' h ');
  return { date, endOfDay, text: endOfDay ? `${day}, en fin de journée` : `${day}, ${time}` };
}

export function countdown(now, target) {
  let s = Math.max(0, Math.floor((target - now) / 1000));
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const p = (n) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export function mountDeadlines(root = document) {
  const els = [...root.querySelectorAll('[data-deadline]')];
  if (!els.length) return;
  const tick = () => {
    const now = new Date();
    const d = describeDeadline(now);
    els.forEach((el) => {
      const dateEl = el.querySelector('[data-deadline-date]');
      const clockEl = el.querySelector('[data-deadline-clock]');
      if (dateEl && dateEl.textContent !== d.text) dateEl.textContent = d.text;
      if (clockEl) clockEl.textContent = countdown(now, d.date);
    });
  };
  tick();
  setInterval(tick, 1000);
}
