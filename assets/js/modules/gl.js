// Champ de lignes de chantier en WebGL (OGL) : la grille ondule et s'écarte autour du curseur.
import { Renderer } from '../../vendor/ogl/core/Renderer.js';
import { Program } from '../../vendor/ogl/core/Program.js';
import { Mesh } from '../../vendor/ogl/core/Mesh.js';
import { Triangle } from '../../vendor/ogl/extras/Triangle.js';

const vertex = /* glsl */ `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime;
uniform float uDpr;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uAmt;
uniform float uCell;
uniform float uIntro;

void main() {
  vec2 p = gl_FragCoord.xy / uDpr;
  vec2 m = uMouse;
  vec2 v = p - m;
  float r2 = dot(v, v);
  // déformation lente, façon calque qui respire
  vec2 q = p + vec2(sin(p.y * 0.011 + uTime * 0.55), cos(p.x * 0.009 - uTime * 0.45)) * 7.0;
  // le curseur écarte les lignes
  float push = exp(-r2 / 36000.0) * uAmt;
  q += v * inversesqrt(r2 + 1.0) * 34.0 * push;
  vec2 g = abs(fract(q / uCell - 0.5) - 0.5) * uCell;
  float d = min(g.x, g.y);
  vec2 g2 = abs(fract(q / (uCell * 0.2) - 0.5) - 0.5) * (uCell * 0.2);
  float d2 = min(g2.x, g2.y);
  // rien à dessiner loin d'une ligne : sortie immédiate
  if (d > 1.8 && d2 > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec2 uv = p / uRes;
  float vign = smoothstep(1.15, 0.2, length((uv - vec2(0.62, 0.5)) * vec2(1.25, 1.0)));
  float reveal = smoothstep(0.0, 1.0, uIntro * 1.6 - (1.0 - uv.y) * 0.6);
  float major = (1.0 - smoothstep(0.0, 1.6, d)) * 0.26;
  float minor = (1.0 - smoothstep(0.0, 0.9, d2)) * 0.07;
  float glow = exp(-r2 / 22000.0) * uAmt;
  vec3 trait = vec3(0.616, 0.722, 0.918);
  vec3 signal = vec3(1.0, 0.824, 0.247);
  vec3 col = mix(trait, signal, clamp(glow * 1.2, 0.0, 1.0));
  float a = (major + minor) * vign * reveal + major * glow * 2.4;
  gl_FragColor = vec4(col * a, a);
}
`;

export function mountField(container, gsap) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.25);
  let renderer;
  try {
    renderer = new Renderer({ dpr, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  } catch (e) { return null; }
  const gl = renderer.gl;
  if (!gl) return null;
  gl.clearColor(0, 0, 0, 0);
  container.appendChild(gl.canvas);
  const uniforms = {
    uTime: { value: 0 }, uDpr: { value: dpr }, uRes: { value: [1, 1] }, uMouse: { value: [-9999, -9999] },
    uAmt: { value: 0 }, uCell: { value: coarse ? 48 : 60 }, uIntro: { value: 0 },
  };
  const program = new Program(gl, { vertex, fragment, uniforms, transparent: true, depthTest: false, depthWrite: false });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  let w = 1, h = 1;
  const resize = () => {
    const b = container.getBoundingClientRect();
    w = Math.max(1, b.width); h = Math.max(1, b.height);
    renderer.setSize(w, h);
    uniforms.uRes.value = [w, h];
  };
  resize();
  addEventListener('resize', resize);
  const target = { x: -9999, y: -9999, amt: 0 };
  const cur = { x: w * 0.7, y: h * 0.5 };
  container.parentElement.addEventListener('pointermove', (e) => {
    const b = container.getBoundingClientRect();
    target.x = e.clientX - b.left; target.y = h - (e.clientY - b.top); target.amt = 1;
  });
  container.parentElement.addEventListener('pointerleave', () => { target.amt = 0; });
  let visible = true, running = false;
  const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; update(); }, { threshold: 0 });
  io.observe(container);
  document.addEventListener('visibilitychange', () => update());
  const tick = (t) => {
    uniforms.uTime.value = t;
    if (target.x > -9000) {
      cur.x += (target.x - cur.x) * 0.08; cur.y += (target.y - cur.y) * 0.08;
      uniforms.uMouse.value = [cur.x, cur.y];
    }
    uniforms.uAmt.value += (target.amt - uniforms.uAmt.value) * 0.05;
    renderer.render({ scene: mesh });
  };
  const update = () => {
    const should = visible && !document.hidden;
    if (should && !running) { gsap.ticker.add(tick); running = true; }
    if (!should && running) { gsap.ticker.remove(tick); running = false; }
  };
  update();
  gsap.to(uniforms.uIntro, { value: 1, duration: 1.6, ease: 'power2.out' });
  container.closest('.hero')?.classList.add('gl-on');
  return { stop() { gsap.ticker.remove(tick); io.disconnect(); } };
}
