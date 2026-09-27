/* ============================================================
   MODELS — low-poly birds, bosses, portals, drones, props
   ============================================================ */
const BIRD_LOOK = {
  amsel:{ body:'#26262e', belly:'#34343d', head:'#26262e', beak:'#f2b632', beakKind:'short' },
  adler:{ body:'#5b3a22', belly:'#6d4a2e', head:'#f4efe4', beak:'#f2b632', beakKind:'hook' },
  pelikan:{ body:'#f2efe8', belly:'#ffffff', head:'#f2efe8', beak:'#f2c14e', beakKind:'pouch' },
  buntspecht:{ body:'#1f1f24', belly:'#f2efe8', head:'#1f1f24', beak:'#44444c', beakKind:'chisel', cap:'#d2322d', under:'#d2322d' },
  gartenbaumlaeufer:{ body:'#8a6a48', belly:'#efe6d6', head:'#8a6a48', beak:'#4a3a2a', beakKind:'thin' },
  maeusebussard:{ body:'#6e4a2c', belly:'#d9c3a0', head:'#6e4a2c', beak:'#3a3a3a', beakKind:'hook' },
  storch:{ body:'#f4f2ee', belly:'#ffffff', head:'#f4f2ee', beak:'#e0452f', beakKind:'long', wingTip:'#1b1b1f' },
  stockente:{ body:'#7a6048', belly:'#b99c7c', head:'#1f6b45', beak:'#d8b73a', beakKind:'flat' },
  crow:{ body:'#15151b', belly:'#222229', head:'#15151b', beak:'#50505a', beakKind:'short' },
  liar:{ body:'#6b3fa3', belly:'#b48be0', head:'#6b3fa3', beak:'#ff8fb1', beakKind:'short' },
};
function beakMesh(kind, color, g){
  const m = M(color);
  const add = (geo, x, y, z, rx = Math.PI / 2, sx = 1, sy = 1, sz = 1) => { const b = mesh(geo, m, x, y, z, g); b.rotation.x = rx; b.scale.set(sx, sy, sz); return b; };
  switch (kind){
    case 'hook': { add(G('cone', 0.2, 0.5, 6), 0, 0, 0.3); const t = add(G('cone', 0.1, 0.25, 6), 0, -0.12, 0.52, Math.PI); t.rotation.x = Math.PI * 1.1; break; }
    case 'long': add(G('cone', 0.12, 1.4, 6), 0, -0.05, 0.75); break;
    case 'thin': { const b = add(G('cone', 0.07, 0.8, 5), 0, -0.1, 0.42); b.rotation.x = Math.PI / 2 + 0.35; break; }
    case 'chisel': add(G('box', 0.14, 0.14, 0.7), 0, 0, 0.4, 0); break;
    case 'flat': add(G('box', 0.36, 0.1, 0.55), 0, -0.05, 0.32, 0); break;
    case 'pouch': add(G('box', 0.26, 0.12, 1.3), 0, 0, 0.7, 0); add(G('sph', 0.28, 8, 6), 0, -0.25, 0.62, 0, 0.8, 0.9, 2.2); break;
    default: add(G('cone', 0.16, 0.42, 6), 0, 0, 0.26);
  }
}
function birdModel(kind, s = 1){
  const L = BIRD_LOOK[kind] || BIRD_LOOK.amsel;
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(s);
  [-0.22, 0.22].forEach(x => { mesh(G('cyl', 0.05, 0.05, 0.7, 5), M('#d18a3a'), x, 0.35, 0, g); mesh(G('box', 0.25, 0.05, 0.35), M('#d18a3a'), x, 0.03, 0.08, g); });
  const body = mesh(G('ico', 0.75, 1), M(L.body), 0, 1.25, 0, g); body.scale.set(1, 0.9, 1.25);
  const belly = mesh(G('ico', 0.6, 1), M(L.belly), 0, 1.1, 0.28, g); belly.scale.set(0.9, 0.8, 0.9);
  if (L.under){ mesh(G('ico', 0.3, 0), M(L.under), 0, 0.85, -0.6, g); }
  [-1, 1].forEach(sx => { const w = mesh(G('ico', 0.5, 0), M(shadeHex(L.body, -25)), sx * 0.68, 1.3, -0.1, g); w.scale.set(0.3, 0.7, 1.2); if (L.wingTip) mesh(G('ico', 0.3, 0), M(L.wingTip), sx * 0.7, 1.1, -0.6, g).scale.set(0.3, 0.5, 0.8); });
  const tail = mesh(G('box', 0.5, 0.1, 0.8), M(shadeHex(L.body, -20)), 0, 1.2, -1.05, g); tail.rotation.x = -0.35;
  const head = new THREE.Group(); head.position.set(0, 2.05, 0.55); g.add(head);
  mesh(G('ico', 0.46, 1), M(L.head), 0, 0, 0, head);
  if (L.cap) mesh(G('ico', 0.2, 0), M(L.cap), 0, 0.35, -0.1, head);
  [-1, 1].forEach(sx => { mesh(G('sph', 0.1, 8, 6), M('#ffffff'), sx * 0.28, 0.1, 0.3, head, false); mesh(G('sph', 0.06, 6, 5), M('#111111'), sx * 0.31, 0.1, 0.36, head, false); });
  const bk = new THREE.Group(); bk.position.set(0, -0.02, 0.38); head.add(bk); beakMesh(L.beakKind, L.beak, bk);
  root.userData.head = head;
  return root;
}
function penguinModel(s = 1){
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(s);
  mesh(G('ico', 0.7, 1), M('#1f2330'), 0, 1.2, 0, g).scale.set(1, 1.45, 0.9);
  mesh(G('ico', 0.55, 1), M('#f6f4ee'), 0, 1.1, 0.25, g).scale.set(0.9, 1.3, 0.7);
  [-1, 1].forEach(sx => { const f = mesh(G('ico', 0.35, 0), M('#1f2330'), sx * 0.72, 1.3, 0, g); f.scale.set(0.25, 1, 0.6); f.rotation.z = sx * 0.3; mesh(G('box', 0.3, 0.08, 0.45), M('#e8903a'), sx * 0.22, 0.04, 0.15, g); });
  const head = new THREE.Group(); head.position.set(0, 2.25, 0.05); g.add(head);
  mesh(G('ico', 0.45, 1), M('#1f2330'), 0, 0, 0, head);
  [-1, 1].forEach(sx => { mesh(G('sph', 0.1, 8, 6), M('#ffffff'), sx * 0.2, 0.08, 0.36, head, false); mesh(G('sph', 0.05, 6, 5), M('#111111'), sx * 0.22, 0.08, 0.43, head, false); });
  const b = mesh(G('cone', 0.12, 0.35, 5), M('#e8903a'), 0, -0.05, 0.52, head); b.rotation.x = Math.PI / 2;
  root.userData.head = head; return root;
}
function owlModel(s = 1){
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(s);
  mesh(G('ico', 0.8, 1), M('#8a6440'), 0, 1.25, 0, g).scale.set(1, 1.2, 0.95);
  mesh(G('ico', 0.55, 1), M('#d9bf93'), 0, 1.1, 0.35, g).scale.set(0.95, 1.1, 0.6);
  const head = new THREE.Group(); head.position.set(0, 2.35, 0.05); g.add(head);
  mesh(G('ico', 0.62, 1), M('#8a6440'), 0, 0, 0, head);
  [-1, 1].forEach(sx => {
    mesh(G('cyl', 0.24, 0.24, 0.08, 12), M('#f6e7c4'), sx * 0.26, 0.05, 0.52, head).rotation.x = Math.PI / 2;
    mesh(G('sph', 0.12, 8, 6), M('#f2a33a'), sx * 0.26, 0.05, 0.58, head, false);
    mesh(G('sph', 0.06, 6, 5), M('#111'), sx * 0.26, 0.05, 0.66, head, false);
    mesh(G('torus', 0.26, 0.03, 5, 14), M('#222'), sx * 0.26, 0.05, 0.6, head, false);
    const t = mesh(G('cone', 0.14, 0.4, 4), M('#6d4d2e'), sx * 0.42, 0.62, 0, head); t.rotation.z = -sx * 0.4;
  });
  mesh(G('cone', 0.1, 0.25, 4), M('#e0a13a'), 0, -0.18, 0.6, head).rotation.x = Math.PI * 1.1;
  mesh(G('box', 0.95, 0.08, 0.95), M('#1f1f28'), 0, 0.7, 0, head).rotation.y = Math.PI / 4;
  mesh(G('box', 0.5, 0.2, 0.5), M('#1f1f28'), 0, 0.6, 0, head);
  root.userData.head = head; return root;
}
function npcModel(kind, s = 1.4){ if (kind === 'eule') return owlModel(s); if (kind === 'pinguin') return penguinModel(s); return birdModel(kind, s); }
function shadeHex(hex, amt){
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------- bosses ---------- */
function bossModel(kind){
  const root = new THREE.Group(); let upd = () => {};
  if (kind === 'crow' || kind === 'liar'){
    const b = birdModel(kind, 3.4); root.add(b);
    const head = b.userData.head;
    if (kind === 'crow'){
      const cr = new THREE.Group(); cr.position.set(0, 0.45, -0.05); head.add(cr);
      mesh(G('cyl', 0.36, 0.36, 0.2, 8), M('#f2b632', { metal:0.6, rough:0.3 }), 0, 0, 0, cr);
      for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; mesh(G('cone', 0.08, 0.28, 4), M('#f2b632', { metal:0.6, rough:0.3 }), Math.cos(a) * 0.3, 0.22, Math.sin(a) * 0.3, cr); }
      [-1, 1].forEach(sx => mesh(G('sph', 0.07, 6, 5), M('#ff2a2a', { em:'#ff2a2a', emi:1 }), sx * 0.31, 0.1, 0.38, head, false));
    } else {
      mesh(G('box', 0.95, 0.2, 0.3), M('#111'), 0, 0.1, 0.3, head);
      for (let i = 0; i < 3; i++){ const q = textSprite('?', { color:'#ffc83d', size:1.6 }); q.userData.a = i * 2.1; root.add(q); }
      upd = t => root.children.forEach(c => { if (c.isSprite){ c.position.set(Math.cos(t + c.userData.a) * 4, 7 + Math.sin(t * 2 + c.userData.a), Math.sin(t + c.userData.a) * 4); } });
    }
    const baseUpd = upd; upd = t => { b.position.y = Math.sin(t * 2) * 0.3; b.rotation.z = Math.sin(t * 1.3) * 0.05; baseUpd(t); };
  }
  if (kind === 'bones'){
    const bone = M('#efe7d2'), dark = M('#2a1f3a');
    const g = new THREE.Group(); root.add(g); g.scale.setScalar(2.2);
    mesh(G('ico', 0.6, 1), bone, 0, 3.2, 0.9, g);
    [-1, 1].forEach(sx => mesh(G('sph', 0.16, 8, 6), M('#b26bff', { em:'#b26bff', emi:1.2 }), sx * 0.24, 3.3, 1.4, g, false));
    mesh(G('cone', 0.2, 0.9, 5), bone, 0, 3.05, 1.7, g).rotation.x = Math.PI / 2;
    mesh(G('cyl', 0.12, 0.12, 2.2, 6), bone, 0, 2.2, -0.2, g).rotation.x = 1.1;
    for (let i = 0; i < 5; i++){ const r = mesh(G('torus', 0.55 - i * 0.04, 0.06, 5, 12, Math.PI), bone, 0, 2.2 - i * 0.02, 0.4 - i * 0.35, g); r.rotation.z = Math.PI; }
    [-1, 1].forEach(sx => { const w = new THREE.Group(); w.position.set(sx * 0.5, 2.4, 0.2); g.add(w); mesh(G('cyl', 0.07, 0.07, 1.6, 5), bone, sx * 0.8, 0.4, 0, w).rotation.z = sx * 1.1; mesh(G('cyl', 0.06, 0.06, 1.6, 5), bone, sx * 1.9, 1.1, 0, w).rotation.z = sx * 0.5; root.userData['w' + sx] = w; });
    const aura = mesh(G('sph', 3.2, 12, 10), M('#8b5cf6', { basic:true, opacity:0.12 }), 0, 5.5, 0, root, false);
    upd = t => { g.position.y = Math.sin(t * 1.8) * 0.4; root.userData.w1.rotation.z = Math.sin(t * 3) * 0.3; root.userData['w-1'].rotation.z = -Math.sin(t * 3) * 0.3; aura.scale.setScalar(1 + Math.sin(t * 3) * 0.05); };
  }
  if (kind === 'kraken'){
    const g = new THREE.Group(); root.add(g);
    mesh(G('ico', 2.4, 1), M('#4f8a5c'), 0, 5, 0, g).scale.set(1, 1.1, 1);
    mesh(G('ico', 1.2, 1), M('#6aa874'), -0.8, 6.4, 0.8, g);
    [-1, 1].forEach(sx => { mesh(G('sph', 0.55, 10, 8), M('#ffffff'), sx * 0.9, 5.3, 2.0, g, false); mesh(G('sph', 0.28, 8, 6), M('#16261a'), sx * 0.95, 5.3, 2.45, g, false); });
    mesh(G('cone', 0.5, 1.1, 5), M('#e0a13a'), 0, 4.3, 2.3, g).rotation.x = Math.PI * 0.6;
    const tents = [];
    for (let i = 0; i < 7; i++){
      const a = i / 7 * Math.PI * 2, tg = new THREE.Group(); tg.position.set(Math.cos(a) * 1.6, 3.2, Math.sin(a) * 1.6); g.add(tg);
      const segs = [];
      for (let k = 0; k < 6; k++){ segs.push(mesh(G('sph', 0.45 - k * 0.06, 7, 5), M(k % 2 ? '#3f7a4c' : '#4f8a5c'), 0, 0, 0, tg)); }
      tents.push({ tg, segs, a });
    }
    upd = t => { g.position.y = Math.sin(t * 1.5) * 0.4; tents.forEach(T => T.segs.forEach((s, k) => s.position.set(Math.cos(T.a) * k * 0.5 + Math.sin(t * 3 + k + T.a) * 0.3 * k * 0.3, -k * 0.55, Math.sin(T.a) * k * 0.5 + Math.cos(t * 2.5 + k) * 0.3 * k * 0.3))); };
  }
  if (kind === 'golem'){
    const st = M('#6f7682'), st2 = M('#868e9b'), g = new THREE.Group(); root.add(g);
    mesh(G('box', 3.4, 3.2, 2.4), st, 0, 3.6, 0, g); mesh(G('box', 2.4, 2, 2), st2, 0, 6.2, 0.2, g);
    [-1, 1].forEach(sx => { mesh(G('sph', 0.28, 8, 6), M('#7fe3ff', { em:'#7fe3ff', emi:1.3 }), sx * 0.5, 6.4, 1.22, g, false); mesh(G('box', 1, 2.2, 1), st, sx * 0.8, 1.1, 0, g); });
    const jaw = [];
    [-1, 1].forEach(sy => { const j = new THREE.Group(); j.position.set(0, 5.8, 1.2); g.add(j); mesh(G('box', 0.5, 0.3, 1.8), M('#3f444d'), 0, sy * 0.2, 0.9, j); jaw.push({ j, sy }); });
    const arms = [];
    [-1, 1].forEach(sx => { const a = new THREE.Group(); a.position.set(sx * 2.1, 4.8, 0); g.add(a); mesh(G('box', 0.9, 2.6, 0.9), st2, 0, -1.2, 0, a); mesh(G('box', 1.1, 0.5, 1.4), M('#3f444d'), 0, -2.6, 0.3, a); arms.push({ a, sx }); });
    upd = t => { const o = (Math.sin(t * 4) + 1) * 0.25; jaw.forEach(J => J.j.rotation.x = -J.sy * o); arms.forEach(A => A.a.rotation.x = Math.sin(t * 2 + A.sx) * 0.4); g.position.y = Math.abs(Math.sin(t * 2)) * 0.2; };
  }
  if (kind === 'geier'){
    const b = birdModel('maeusebussard', 3.4); root.add(b);
    const head = b.userData.head; head.children[0].material = M('#e6a7a0');
    upd = t => { b.position.y = Math.sin(t * 2) * 0.3; };
  }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, update:upd };
}

/* ---------- props ---------- */
function swirlTexture(c1, c2){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5;
  for (let k = 0; k < 4; k++){ g.beginPath(); for (let a = 0; a < 6; a += 0.1){ const r = a * 9; const x = 64 + Math.cos(a + k * Math.PI / 2) * r, y = 64 + Math.sin(a + k * Math.PI / 2) * r; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
const swirlCache = {};
function portalModel(color, label, sub = ''){
  const root = new THREE.Group();
  mesh(G('cyl', 2.2, 2.4, 0.4, 10), M('#3a4150'), 0, 0.2, 0, root);
  const ring = mesh(G('torus', 1.7, 0.22, 8, 24), M(color, { em:color, emi:0.6, rough:0.4 }), 0, 2.3, 0, root);
  const key = color; if (!swirlCache[key]) swirlCache[key] = swirlTexture(color, '#0a1030');
  const disc = mesh(G('circle', 1.55, 24), new THREE.MeshBasicMaterial({ map:swirlCache[key], transparent:true, opacity:0.9, side:THREE.DoubleSide }), 0, 2.3, 0, root, false);
  const sign = textSprite(label, { size:0.55, color:'#fff' }); sign.position.set(0, 4.8, 0); root.add(sign);
  let subS = null;
  if (sub){ subS = textSprite(sub, { size:0.45, color:'#ffc83d' }); subS.position.set(0, 4.2, 0); root.add(subS); }
  root.userData = { ring, disc, sign, subS };
  return root;
}
function setPortalSub(p, text){
  if (p.userData.subS){ p.remove(p.userData.subS); disposeTree(p.userData.subS); }
  const s = textSprite(text, { size:0.45, color:'#ffc83d' }); s.position.set(0, 4.2, 0); p.add(s); p.userData.subS = s;
}
function droneModel(color = '#8f86a8'){
  const g = new THREE.Group();
  mesh(G('oct', 0.7, 0), M(color, { rough:0.4 }), 0, 0, 0, g);
  mesh(G('torus', 0.95, 0.08, 6, 16), M('#2b3140'), 0, 0, 0, g).rotation.x = Math.PI / 2;
  const eye = mesh(G('sph', 0.22, 8, 6), M('#ff5d6c', { em:'#ff5d6c', emi:1 }), 0, 0.05, 0.55, g, false);
  g.userData.eye = eye;
  return g;
}
function treeRound(parent, cols, x, y, z, s = 1, leaf = '#3f8f3a'){
  mesh(G('cyl', 0.3 * s, 0.4 * s, 2.4 * s, 6), M('#6b4a2e'), x, y + 1.2 * s, z, parent);
  mesh(G('ico', 1.8 * s, 0), M(leaf), x, y + 3.4 * s, z, parent);
  mesh(G('ico', 1.1 * s, 0), M(shadeHex(leaf, 25)), x + 0.6 * s, y + 4.2 * s, z + 0.3 * s, parent);
  cols.push(makeCol(x, y + 1.5 * s, z, 0.8 * s, 3 * s, 0.8 * s));
}
function treePine(parent, cols, x, y, z, s = 1, leaf = '#2e6a35', snow = false){
  mesh(G('cyl', 0.25 * s, 0.35 * s, 1.6 * s, 6), M('#5a3d25'), x, y + 0.8 * s, z, parent);
  for (let k = 0; k < 3; k++){
    mesh(G('cone', (1.8 - k * 0.45) * s, 2 * s, 7), M(leaf), x, y + (2.2 + k * 1.2) * s, z, parent);
    if (snow) mesh(G('cone', (0.9 - k * 0.2) * s, 0.9 * s, 7), M('#f4f8fb'), x, y + (2.7 + k * 1.2) * s, z, parent);
  }
  cols.push(makeCol(x, y + 1.5 * s, z, 0.8 * s, 3 * s, 0.8 * s));
}
function rock(parent, cols, x, y, z, s = 1, color = '#7d8793', solidRock = true){
  const r = mesh(G('dod', 1, 0), M(color), x, y + 0.5 * s, z, parent); r.scale.set(1.3 * s, 0.9 * s, 1.1 * s); r.rotation.y = x * 7 + z;
  if (solidRock) cols.push(makeCol(x, y + 0.45 * s, z, 2.2 * s, 0.9 * s, 1.9 * s));
}
function crystal(parent, x, y, z, s = 1, color = '#a78bfa'){
  const c = mesh(G('oct', 0.6, 0), M(color, { em:color, emi:0.5, rough:0.3 }), x, y + 0.8 * s, z, parent); c.scale.set(0.6 * s, 1.6 * s, 0.6 * s); return c;
}
function lavaPlane(parent, y = -14, color = '#ff6a1a'){
  const m = mesh(G('plane', 900, 900), M(color, { basic:true }), 0, y, 0, parent, false); m.rotation.x = -Math.PI / 2; m.receiveShadow = false; return m;
}
