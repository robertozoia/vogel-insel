/* ============================================================
   ENGINE — three.js renderer, camera, physics, avatar, shooting, fx
   ============================================================ */
const V3 = THREE.Vector3;
const cv = $('#cv');
let renderer, scene3, camera, sun, hemi;
let VW = innerWidth, VH = innerHeight;
const lin = c => new THREE.Color(c).convertSRGBToLinear();

function initRenderer(){
  renderer = new THREE.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  scene3 = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1200);
  hemi = new THREE.HemisphereLight(lin('#dcecff'), lin('#4a3f36'), 0.62); scene3.add(hemi);
  sun = new THREE.DirectionalLight(lin('#fff1dc'), 1.35); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -50; sc.right = 50; sc.top = 50; sc.bottom = -50; sc.near = 1; sc.far = 260; sun.shadow.bias = -0.0005;
  scene3.add(sun); scene3.add(sun.target);
  resize3(); addEventListener('resize', resize3);
}
function resize3(){ VW = innerWidth; VH = innerHeight; renderer.setSize(VW, VH, false); cv.style.width = VW + 'px'; cv.style.height = VH + 'px'; camera.aspect = VW / VH; camera.updateProjectionMatrix(); }
const skyCache = {};
function setSky(top, bottom, fog, near = 90, far = 330){
  const k = top + bottom;
  if (!skyCache[k]){
    const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; skyCache[k] = t;
  }
  scene3.background = skyCache[k]; scene3.fog = new THREE.Fog(lin(fog), near, far);
}

/* ---------- materials & geometry caches ---------- */
const matCache = {}, geoCache = {};
function M(color, o = {}){
  const k = color + JSON.stringify(o);
  if (matCache[k]) return matCache[k];
  let m;
  if (o.basic) m = new THREE.MeshBasicMaterial({ color:lin(color), transparent:!!o.opacity, opacity:o.opacity ?? 1, side:o.double ? THREE.DoubleSide : THREE.FrontSide, depthWrite:o.opacity ? false : true, fog:o.fog !== false });
  else m = new THREE.MeshStandardMaterial({ color:lin(color), roughness:o.rough ?? 0.88, metalness:o.metal ?? 0, flatShading:o.flat !== false,
    emissive:o.em ? lin(o.em) : lin('#000000'), emissiveIntensity:o.emi ?? 1, transparent:!!o.opacity, opacity:o.opacity ?? 1, side:o.double ? THREE.DoubleSide : THREE.FrontSide });
  return (matCache[k] = m);
}
function G(kind, ...a){
  const k = kind + a.join('|');
  if (geoCache[k]) return geoCache[k];
  const C = { box:THREE.BoxGeometry, cyl:THREE.CylinderGeometry, cone:THREE.ConeGeometry, sph:THREE.SphereGeometry, ico:THREE.IcosahedronGeometry, oct:THREE.OctahedronGeometry, dod:THREE.DodecahedronGeometry, torus:THREE.TorusGeometry, plane:THREE.PlaneGeometry, circle:THREE.CircleGeometry, ring:THREE.RingGeometry }[kind];
  return (geoCache[k] = new C(...a));
}
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = null, shadow = true){
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; if (parent) parent.add(m); return m;
}

/* ---------- colliders ---------- */
const worldCols = [];
let activeCols = worldCols;
function makeCol(x, y, z, sx, sy, sz, extra){ return Object.assign({ min:new V3(x - sx / 2, y - sy / 2, z - sz / 2), max:new V3(x + sx / 2, y + sy / 2, z + sz / 2), active:true }, extra || {}); }
// A solid box: mesh + collider. y is the CENTER.
function solid(parent, cols, x, y, z, sx, sy, sz, color, o = {}){
  const m = mesh(G('box', sx, sy, sz), o.mat || M(color, o), x, y, z, parent, o.cast !== false);
  const c = makeCol(x, y, z, sx, sy, sz, o.col); c.mesh = m; cols.push(c); m.userData.col = c;
  return c;
}
function colMoveTo(c, x, y, z){ const hx = (c.max.x - c.min.x) / 2, hy = (c.max.y - c.min.y) / 2, hz = (c.max.z - c.min.z) / 2; c.min.set(x - hx, y - hy, z - hz); c.max.set(x + hx, y + hy, z + hz); if (c.mesh) c.mesh.position.set(x, y, z); }

/* ---------- text sprites ---------- */
function wrapLines(g, text, maxW){
  const out = [];
  String(text).split('\n').forEach(par => {
    const words = par.split(' '); let cur = '';
    for (const w of words){ const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur){ out.push(cur); cur = w; } else cur = t; }
    out.push(cur);
  });
  return out;
}
// o: { color, bg, size (world height per line), maxW (px), font, border, weight }
function textSprite(text, o = {}){
  const px = 64, font = `${o.weight || 700} ${px}px ${o.font || '"Atkinson Hyperlegible", sans-serif'}`;
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = font;
  const lines = wrapLines(g, text, o.maxW || 900);
  const tw = Math.max(...lines.map(l => g.measureText(l).width));
  const pad = o.bg ? 28 : 10, lh = px * 1.18;
  c.width = Math.ceil(tw + pad * 2); c.height = Math.ceil(lines.length * lh + pad * 1.2);
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.bg){
    g.fillStyle = o.bg; const r = 26;
    g.beginPath(); g.moveTo(r, 0); g.arcTo(c.width, 0, c.width, c.height, r); g.arcTo(c.width, c.height, 0, c.height, r); g.arcTo(0, c.height, 0, 0, r); g.arcTo(0, 0, c.width, 0, r); g.fill();
    if (o.border){ g.strokeStyle = o.border; g.lineWidth = 8; g.stroke(); }
  }
  lines.forEach((l, i) => {
    const y = pad * 0.6 + lh * (i + 0.5);
    if (!o.bg){ g.lineWidth = 12; g.strokeStyle = o.stroke || 'rgba(8,14,30,.9)'; g.lineJoin = 'round'; g.strokeText(l, c.width / 2, y); }
    g.fillStyle = o.color || '#fff'; g.fillText(l, c.width / 2, y);
  });
  const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false, fog:o.fog !== false, depthTest:o.depthTest !== false }));
  const h = (o.size || 0.8) * (c.height / lh);
  sp.scale.set(h * c.width / c.height, h, 1);
  sp.renderOrder = 10;
  sp.userData.disposeTex = tex;
  return sp;
}
function disposeTree(obj){
  obj.traverse(o => {
    if (o.isSprite){ if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    if (o.userData.ownGeo && o.geometry) o.geometry.dispose();
    if (o.userData.ownMat && o.material) o.material.dispose();
  });
}

/* ---------- SVG (our diagrams) -> canvas, for 3D billboards ---------- */
function svgToCanvas(inner, g, s){
  const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${inner}</svg>`, 'image/svg+xml');
  g.save(); g.scale(s, s);
  const walk = (el, st) => {
    for (const c of el.children){
      const a = n => c.getAttribute(n), x = { ...st };
      if (a('fill') != null) x.fill = a('fill'); if (a('stroke') != null) x.stroke = a('stroke'); if (a('stroke-width')) x.sw = +a('stroke-width');
      if (a('fill-opacity')) x.fo = +a('fill-opacity'); if (a('stroke-dasharray')) x.dash = a('stroke-dasharray').split(/[ ,]+/).map(Number); if (a('stroke-linecap')) x.cap = a('stroke-linecap');
      const tag = c.tagName.toLowerCase();
      if (tag === 'g'){ walk(c, x); continue; }
      g.save();
      const tr = a('transform'); if (tr){ const m = tr.match(/rotate\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\)/); if (m){ g.translate(+m[2], +m[3]); g.rotate(+m[1] * Math.PI / 180); g.translate(-m[2], -m[3]); } }
      let p = new Path2D();
      if (tag === 'path') p = new Path2D(a('d'));
      else if (tag === 'ellipse') p.ellipse(+a('cx'), +a('cy'), +a('rx'), +a('ry'), 0, 0, Math.PI * 2);
      else if (tag === 'circle') p.arc(+a('cx'), +a('cy'), +a('r'), 0, Math.PI * 2);
      else if (tag === 'rect') p.rect(+a('x') || 0, +a('y') || 0, +a('width'), +a('height'));
      else if (tag === 'line'){ p.moveTo(+a('x1'), +a('y1')); p.lineTo(+a('x2'), +a('y2')); }
      else { g.restore(); continue; }
      if (x.fill && x.fill !== 'none' && tag !== 'line'){ g.globalAlpha = x.fo; g.fillStyle = x.fill; g.fill(p); g.globalAlpha = 1; }
      if (x.stroke && x.stroke !== 'none'){ g.strokeStyle = x.stroke; g.lineWidth = x.sw; g.lineCap = x.cap; g.setLineDash(x.dash || []); g.stroke(p); g.setLineDash([]); }
      g.restore();
    }
  };
  walk(doc.documentElement, { fill:'#000', stroke:null, sw:1, fo:1, dash:null, cap:'butt' });
  g.restore();
}
// draws a diagram with numbered markers; state: {n:'ok'|'hi'|'bad'}
function drawDiagram(g, key, W2, state = {}, only = null){
  const D = DIAGRAMS[key], s = W2 / 420;
  g.fillStyle = '#fbf4e2'; g.fillRect(0, 0, W2, 300 * s);
  svgToCanvas(D.base(), g, s);
  for (const L of D.labels){
    if (only && !only.includes(L.n)) continue;
    const st = state[L.n];
    g.strokeStyle = '#3a2e22'; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(L.x * s, L.y * s); g.lineTo(L.mx * s, L.my * s); g.stroke();
    g.fillStyle = '#3a2e22'; g.beginPath(); g.arc(L.x * s, L.y * s, 3 * s, 0, 7); g.fill();
    g.fillStyle = st === 'ok' ? '#9be3ae' : st === 'hi' ? '#ffcf4a' : st === 'bad' ? '#ff8f86' : '#fffaf0';
    g.beginPath(); g.arc(L.mx * s, L.my * s, 12.5 * s, 0, 7); g.fill(); g.lineWidth = 2.2 * s; g.stroke();
    g.fillStyle = '#1d1712'; g.font = `700 ${13 * s}px "Atkinson Hyperlegible", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.n, L.mx * s, L.my * s + 0.5 * s);
  }
}

/* ---------- avatar ---------- */
function faceTexture(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#f2c79e'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#1b1b24'; g.fillRect(34, 46, 14, 20); g.fillRect(80, 46, 14, 20);
  g.fillStyle = '#fff'; g.fillRect(38, 48, 5, 6); g.fillRect(84, 48, 5, 6);
  g.strokeStyle = '#1b1b24'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(46, 86); g.quadraticCurveTo(64, 98, 84, 84); g.stroke();
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
const HATS = {
  none:{ n:'Keiner', price:0 }, cap:{ n:'Cap', price:0 }, helmet:{ n:'Space-Helm', price:150 }, headphones:{ n:'Kopfhörer', price:120 },
  crown:{ n:'Krone', price:450 }, horns:{ n:'Wikinger', price:220 }, halo:{ n:'Heiligenschein', price:300 }, wizard:{ n:'Zauberhut', price:260 },
};
const SHIRTS = ['#2f6fed', '#e2342f', '#1faa59', '#f2b632', '#7b3fe4', '#111827', '#f3f4f6', '#ff6fb5', '#12b5c9', '#ff7a1a'];
const PANTS = ['#1f2a44', '#3b3b3b', '#6b4a2a', '#0f5132', '#5b21b6', '#e5e7eb'];
function buildHat(kind){
  const h = new THREE.Group();
  if (kind === 'cap'){ mesh(G('box', 0.86, 0.22, 0.86), M(S.skin.shirt), 0, 0.1, 0, h); mesh(G('box', 0.8, 0.07, 0.42), M(S.skin.shirt), 0, 0.02, 0.58, h); }
  if (kind === 'helmet'){ const m = mesh(G('sph', 0.62, 16, 12), M('#dfe7f2', { opacity:0.45, flat:false, rough:0.1 }), 0, -0.4, 0, h, false); m.renderOrder = 3; mesh(G('torus', 0.6, 0.06, 6, 20), M('#9aa6b8'), 0, -0.72, 0, h).rotation.x = Math.PI / 2; }
  if (kind === 'headphones'){ mesh(G('torus', 0.5, 0.06, 6, 16, Math.PI), M('#222'), 0, -0.3, 0, h); mesh(G('box', 0.18, 0.34, 0.34), M('#e2342f'), -0.48, -0.4, 0, h); mesh(G('box', 0.18, 0.34, 0.34), M('#e2342f'), 0.48, -0.4, 0, h); }
  if (kind === 'crown'){ mesh(G('cyl', 0.42, 0.42, 0.26, 8), M('#f2b632', { metal:0.6, rough:0.3 }), 0, 0.12, 0, h); for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; mesh(G('cone', 0.09, 0.28, 4), M('#f2b632', { metal:0.6, rough:0.3 }), Math.cos(a) * 0.36, 0.38, Math.sin(a) * 0.36, h); } }
  if (kind === 'horns'){ mesh(G('box', 0.86, 0.26, 0.86), M('#8a8f98'), 0, 0.12, 0, h); [-1, 1].forEach(sx => { const c = mesh(G('cone', 0.12, 0.6, 6), M('#f2ecd8'), sx * 0.55, 0.35, 0, h); c.rotation.z = -sx * 0.9; }); }
  if (kind === 'halo'){ mesh(G('torus', 0.38, 0.06, 6, 20), M('#ffe46b', { em:'#ffd21a', emi:0.8 }), 0, 0.45, 0, h).rotation.x = Math.PI / 2; }
  if (kind === 'wizard'){ mesh(G('cone', 0.55, 1.1, 8), M('#4b2bb3'), 0, 0.55, 0, h); mesh(G('cyl', 0.7, 0.7, 0.08, 12), M('#4b2bb3'), 0, 0.02, 0, h); }
  return h;
}
function buildAvatar(){
  const root = new THREE.Group();
  const sk = S.skin, skin = M('#f2c79e');
  const legs = [], arms = [];
  [-1, 1].forEach(s => {
    const hip = new THREE.Group(); hip.position.set(s * 0.26, 1.0, 0); root.add(hip);
    mesh(G('box', 0.48, 1.0, 0.5), M(sk.pants), 0, -0.5, 0, hip); legs.push(hip);
    const sh = new THREE.Group(); sh.position.set(s * 0.75, 1.95, 0); root.add(sh);
    mesh(G('box', 0.46, 0.95, 0.48), M(sk.shirt), 0, -0.42, 0, sh);
    mesh(G('box', 0.44, 0.2, 0.46), skin, 0, -0.95, 0, sh); arms.push(sh);
  });
  mesh(G('box', 1.04, 1.0, 0.52), M(sk.shirt), 0, 1.5, 0, root);
  mesh(G('box', 1.06, 0.14, 0.54), M('#20232b'), 0, 1.02, 0, root);
  const headMats = [skin, skin, skin, skin, new THREE.MeshStandardMaterial({ map:faceTexture(), roughness:0.9, flatShading:true }), skin];
  const head = mesh(G('box', 0.82, 0.82, 0.82), headMats, 0, 2.43, 0, root);
  const hat = buildHat(sk.hat); hat.position.set(0, 2.84, 0); root.add(hat);
  // tool: a small blaster in the right hand
  const tool = new THREE.Group(); tool.position.set(0, -1.0, 0.2); arms[1].add(tool);
  mesh(G('box', 0.16, 0.22, 0.6), M('#2b3140'), 0, 0, 0.18, tool);
  const tip = mesh(G('box', 0.12, 0.12, 0.12), M('#3de0ff', { em:'#3de0ff', emi:1 }), 0, 0, 0.5, tool, false);
  return { root, legs, arms, head, tool, tip };
}

/* ---------- player ---------- */
const P = { pos:new V3(0, 0, 20), vel:new V3(), face:Math.PI, grounded:false, ground:null, hx:0.45, h:2.7, coyote:0, jumpBuf:0, checkpoint:new V3(0, 0, 20), safe:new V3(0, 0, 20), safeT:0,
  inv:0, phase:0, shootT:0, frozen:false, av:null, killY:-45, lastLand:0 };
function rebuildAvatar(){
  if (P.av) scene3.remove(P.av.root);
  P.av = buildAvatar(); scene3.add(P.av.root);
  P.av.root.traverse(o => { if (o.isMesh){ o.castShadow = true; } });
}
function teleport(v, face){ P.pos.copy(v); P.vel.set(0, 0, 0); if (face != null){ P.face = face; cam.yaw = face + Math.PI; } P.grounded = false; }
function overlaps(c, x, y, z){ return c.active && x - P.hx < c.max.x && x + P.hx > c.min.x && y < c.max.y && y + P.h > c.min.y && z - P.hx < c.max.z && z + P.hx > c.min.z; }
function playerUpdate(dt){
  const av = P.av;
  if (P.frozen){ P.vel.set(0, 0, 0); animateAvatar(dt, 0); return; }
  const f = (down('KeyW', 'ArrowUp') ? 1 : 0) - (down('KeyS', 'ArrowDown') ? 1 : 0);
  const r = (down('KeyD') ? 1 : 0) - (down('KeyA') ? 1 : 0);
  const sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  const fx = -sy, fz = -cy, rx = cy, rz = -sy;
  let wx = fx * f + rx * r, wz = fz * f + rz * r; const wl = Math.hypot(wx, wz);
  const speed = down('ShiftLeft', 'ShiftRight') ? 12.5 : 9;
  if (wl){ wx /= wl; wz /= wl; }
  const acc = P.grounded ? 70 : 28;
  P.vel.x += clamp(wx * speed - P.vel.x, -acc * dt, acc * dt);
  P.vel.z += clamp(wz * speed - P.vel.z, -acc * dt, acc * dt);
  if (wl) P.face = Math.atan2(wx, wz);
  else if (aimMode()) P.face = cam.yaw + Math.PI;
  // jump
  P.coyote -= dt; P.jumpBuf -= dt;
  if (keys.Space){ if (!P._spaceHeld) P.jumpBuf = 0.15; P._spaceHeld = true; } else P._spaceHeld = false;
  if (P.jumpBuf > 0 && P.coyote > 0){ P.vel.y = 12.2; P.coyote = 0; P.jumpBuf = 0; P.grounded = false; SFX.jump(); }
  P.vel.y -= 32 * dt; if (P.vel.y < -40) P.vel.y = -40;
  // moving platform carry
  if (P.grounded && P.ground && P.ground.dv){ P.pos.add(P.ground.dv); }
  // integrate + collide, axis by axis
  const cols = activeCols;
  const moveAxis = (ax) => {
    const d = P.vel[ax] * dt; if (!d) return;
    P.pos[ax] += d;
    for (const c of cols){
      if (!overlaps(c, P.pos.x, P.pos.y, P.pos.z)) continue;
      // step up small ledges
      if (P.grounded && c.max.y - P.pos.y <= 0.55 && !cols.some(o => o !== c && overlaps(o, P.pos.x, c.max.y + 0.01, P.pos.z))){ P.pos.y = c.max.y + 0.001; continue; }
      if (ax === 'x') P.pos.x = d > 0 ? c.min.x - P.hx - 0.001 : c.max.x + P.hx + 0.001;
      else P.pos.z = d > 0 ? c.min.z - P.hx - 0.001 : c.max.z + P.hx + 0.001;
      P.vel[ax] = 0;
    }
  };
  moveAxis('x'); moveAxis('z');
  const wasGround = P.grounded; P.grounded = false;
  P.pos.y += P.vel.y * dt;
  for (const c of cols){
    if (!overlaps(c, P.pos.x, P.pos.y, P.pos.z)) continue;
    if (P.vel.y <= 0){ P.pos.y = c.max.y; P.vel.y = 0; P.grounded = true; P.ground = c; }
    else { P.pos.y = c.min.y - P.h - 0.001; P.vel.y = 0; }
  }
  if (!P.grounded){
    // small probe so that standing exactly on top counts as grounded
    for (const c of cols) if (c.active && Math.abs(P.pos.y - c.max.y) < 0.02 && P.pos.x + P.hx > c.min.x && P.pos.x - P.hx < c.max.x && P.pos.z + P.hx > c.min.z && P.pos.z - P.hx < c.max.z){ P.grounded = true; P.ground = c; }
  }
  if (P.grounded){ P.coyote = 0.1; if (!wasGround && P.vel.y <= 0){ SFX.land(); P.lastLand = performance.now(); } }
  else P.ground = null;
  if (P.inv > 0) P.inv -= dt;
  animateAvatar(dt, Math.hypot(P.vel.x, P.vel.z));
}
function animateAvatar(dt, sp){
  const av = P.av; if (!av) return;
  av.root.position.copy(P.pos);
  let d = P.face - av.root.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  av.root.rotation.y += d * Math.min(1, dt * 14);
  P.phase += dt * (4 + sp * 0.9);
  const k = Math.min(1, sp / 9);
  const sw = P.grounded ? Math.sin(P.phase) * 0.9 * k : 0;
  av.legs[0].rotation.x = sw; av.legs[1].rotation.x = -sw;
  if (!P.grounded){ av.legs[0].rotation.x = 0.5; av.legs[1].rotation.x = -0.3; }
  av.arms[0].rotation.x = P.grounded ? -sw * 0.9 : -2.6;
  P.shootT = Math.max(0, P.shootT - dt);
  av.arms[1].rotation.x = P.shootT > 0 || aimMode() ? -1.5 : P.grounded ? sw * 0.9 : -2.6;
  av.tool.visible = aimMode() || P.shootT > 0;
  av.root.visible = !(P.inv > 0 && Math.floor(performance.now() / 90) % 2);
}

/* ---------- camera ---------- */
const cam = { yaw:0, pitch:0.26, dist:9.5, locked:false, dragging:false, dragMoved:0 };
function aimMode(){ return !!(activity && activity.shooting) || worldAim; }
let worldAim = false;
function cameraUpdate(dt){
  if (down('ArrowLeft')) cam.yaw += dt * 2.2; if (down('ArrowRight')) cam.yaw -= dt * 2.2;
  cam.pitch = clamp(cam.pitch, -0.35, 1.2);
  const tgt = new V3(P.pos.x, P.pos.y + 3.4, P.pos.z);
  const aim = aimMode();
  const dist = aim ? 6.5 : cam.dist;
  const off = new V3(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)).multiplyScalar(dist);
  if (aim){ off.x += Math.cos(cam.yaw) * 1.3; off.z += -Math.sin(cam.yaw) * 1.3; tgt.x += Math.cos(cam.yaw) * 1.3; tgt.z += -Math.sin(cam.yaw) * 1.3; }
  const want = tgt.clone().add(off);
  camera.position.lerp(want, Math.min(1, dt * 12));
  if (camera.position.distanceTo(want) > 12) camera.position.copy(want);
  camera.lookAt(tgt);
}
function demoCamera(t, cx = 0, cz = 0, r = 60, h = 34){
  camera.position.set(cx + Math.sin(t * 0.06) * r, h, cz + Math.cos(t * 0.06) * r);
  camera.lookAt(cx, 4, cz);
}
cv.addEventListener('mousedown', e => {
  if (modalOpen()) return;
  cam.dragging = true; cam.dragMoved = 0; cam.btn = e.button;
});
addEventListener('mouseup', e => {
  if (!cam.dragging) return; cam.dragging = false;
  if (modalOpen() || !S.started) return;
  if (cam.dragMoved < 6 && e.button === 0){
    if (!cam.locked && S.settings.lock !== false && cv.requestPointerLock){ try { const p = cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {} }
    if (cam.locked || cam.lockFailed || !cv.requestPointerLock || S.settings.lock === false) shoot();
    else if (aimMode()) shoot();
  }
});
addEventListener('mousemove', e => {
  const s = 0.0024 * (S.settings.sens || 1);
  if (cam.locked){ cam.yaw -= e.movementX * s; cam.pitch += e.movementY * s; return; }
  if (cam.dragging){ cam.dragMoved += Math.abs(e.movementX) + Math.abs(e.movementY); cam.yaw -= e.movementX * s * 1.2; cam.pitch += e.movementY * s * 1.2; }
});
cv.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('pointerlockerror', () => { cam.lockFailed = true; });
cv.addEventListener('wheel', e => { if (activity && activity.onWheel) activity.onWheel(e.deltaY); else cam.dist = clamp(cam.dist + e.deltaY * 0.01, 5, 14); }, { passive:true });
document.addEventListener('pointerlockchange', () => {
  cam.locked = document.pointerLockElement === cv;
  $('#clickhint').hidden = cam.locked || !S.started || modalOpen();
});
onModalChange = open => { if (open && document.pointerLockElement) document.exitPointerLock(); $('#clickhint').hidden = cam.locked || !S.started || open; };

/* ---------- shooting ---------- */
let shootables = [];
const ray = new THREE.Raycaster();
let ammo = 'der';
const AMMO_COL = { der:'#5b9dff', die:'#ff6b6b', das:'#3fdc8a' };
function registerShootable(obj, onHit, list = shootables){ const s = { obj, onHit }; obj.userData.shoot = s; list.push(s); return s; }
function shoot(){
  if (!S.started || modalOpen()) return;
  const canShoot = activity ? activity.shooting : true;
  if (!canShoot) return;
  P.shootT = 0.3; P.face = cam.yaw + Math.PI; SFX.shoot();
  ray.setFromCamera({ x:0, y:0 }, camera);
  const list = activity ? activity.shoot : shootables;
  const objs = list.filter(s => s.obj.visible !== false && s.obj.parent).map(s => s.obj);
  const hits = ray.intersectObjects(objs, true);
  const hand = new V3(); P.av.tip.getWorldPosition(hand);
  const col = activity && activity.tracerCol ? activity.tracerCol() : AMMO_COL[ammo];
  if (hits.length){
    let o = hits[0].object; while (o && !o.userData.shoot) o = o.parent;
    tracer(hand, hits[0].point, col);
    if (o) o.userData.shoot.onHit(hits[0].point);
  } else tracer(hand, ray.ray.at(90, new V3()), col);
}

/* ---------- fx: tracers, particles, orbs, popups ---------- */
const fx = [];
function tracer(a, b, color){
  const len = a.distanceTo(b); if (len < 0.1) return;
  const m = new THREE.Mesh(G('box', 0.09, 0.09, 1), new THREE.MeshBasicMaterial({ color:lin(color), transparent:true, opacity:0.95 }));
  m.scale.z = len; m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b); scene3.add(m);
  fx.push({ m, life:0.14, max:0.14, kind:'fade' });
  burst(b, color, 8, 5);
}
function burst(p, color, n = 18, spd = 9, size = 0.18){
  const mat = new THREE.MeshBasicMaterial({ color:lin(color), transparent:true });
  for (let i = 0; i < n; i++){
    const m = new THREE.Mesh(G('box', size, size, size), mat); m.position.copy(p); scene3.add(m);
    const v = new V3(Math.random() - 0.5, Math.random() * 0.9, Math.random() - 0.5).normalize().multiplyScalar(spd * (0.4 + Math.random()));
    fx.push({ m, v, life:0.6 + Math.random() * 0.4, max:1, kind:'part', mat });
  }
}
function fxUpdate(dt){
  for (let i = fx.length - 1; i >= 0; i--){
    const f = fx[i]; f.life -= dt;
    if (f.kind === 'part'){ f.v.y -= 20 * dt; f.m.position.addScaledVector(f.v, dt); f.m.rotation.x += dt * 5; f.m.scale.setScalar(Math.max(0.01, f.life / f.max)); }
    else if (f.kind === 'fade') f.m.material.opacity = Math.max(0, f.life / f.max);
    if (f.life <= 0){ scene3.remove(f.m); if (f.kind === 'fade') f.m.material.dispose(); fx.splice(i, 1); }
  }
  orbsUpdate(dt);
  popupsUpdate(dt);
}
// enemy projectiles
const orbs = [];
function fireOrb(from, to, speed = 13, color = '#ff5d6c', size = 0.45){
  const m = mesh(G('sph', size, 10, 8), M(color, { em:color, emi:0.9 }), from.x, from.y, from.z, scene3, false);
  const v = to.clone().sub(from).normalize().multiplyScalar(speed);
  orbs.push({ m, v, life:6, r:size });
}
function orbsUpdate(dt){
  for (let i = orbs.length - 1; i >= 0; i--){
    const o = orbs[i]; o.life -= dt; o.m.position.addScaledVector(o.v, dt);
    const p = o.m.position;
    const hit = p.x > P.pos.x - P.hx - o.r && p.x < P.pos.x + P.hx + o.r && p.z > P.pos.z - P.hx - o.r && p.z < P.pos.z + P.hx + o.r && p.y > P.pos.y - o.r && p.y < P.pos.y + P.h + o.r;
    if (hit && P.inv <= 0){ P.inv = 1.5; hurt(1); burst(p, '#ff5d6c', 14, 7); o.life = 0; if (activity && activity.onHurt) activity.onHurt(); }
    if (o.life <= 0){ scene3.remove(o.m); orbs.splice(i, 1); }
  }
}
function clearOrbs(){ orbs.forEach(o => scene3.remove(o.m)); orbs.length = 0; }
const popups = [];
function popText(pos, html, cls = ''){
  const d = document.createElement('div'); d.className = 'pop ' + cls; d.innerHTML = html; $('#popups').appendChild(d);
  popups.push({ d, p:pos.clone(), life:1.3 });
}
function popupsUpdate(dt){
  for (let i = popups.length - 1; i >= 0; i--){
    const q = popups[i]; q.life -= dt; q.p.y += dt * 1.6;
    const v = q.p.clone().project(camera);
    if (v.z > 1){ q.d.style.display = 'none'; } else { q.d.style.display = ''; q.d.style.transform = `translate(${(v.x * 0.5 + 0.5) * VW}px, ${(-v.y * 0.5 + 0.5) * VH}px) translate(-50%, -50%)`; q.d.style.opacity = Math.min(1, q.life * 2); }
    if (q.life <= 0){ q.d.remove(); popups.splice(i, 1); }
  }
}

/* ---------- HUD helpers for activities ---------- */
function banner(main, sub = ''){
  const b = $('#banner');
  if (main == null){ b.hidden = true; return; }
  b.hidden = false; b.querySelector('.b-main').innerHTML = main; b.querySelector('.b-sub').innerHTML = sub;
}
function astat(html){ const a = $('#astat'); if (html == null) a.hidden = true; else { a.hidden = false; a.innerHTML = html; } }
function ammoBar(mode){
  const a = $('#ammo');
  if (!mode){ a.hidden = true; return; }
  a.hidden = false;
  if (mode === 'art') a.innerHTML = ['der', 'die', 'das'].map((x, i) => `<button class="slot ${x} ${ammo === x ? 'on' : ''}" data-ammo="${x}" type="button"><kbd>${i + 1}</kbd>${x}</button>`).join('');
  else a.innerHTML = mode;
  $$('[data-ammo]', a).forEach(b => b.onclick = e => { e.stopPropagation(); ammo = b.dataset.ammo; ammoBar('art'); });
}
