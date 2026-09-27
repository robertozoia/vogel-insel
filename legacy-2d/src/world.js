/* ============================================================
   WORLD — island generation, rendering, overworld scene
   ============================================================ */
const TS = 32, MW = 90, MH = 64, CX = 45, CY = 32, RX = MW * 0.46, RY = MH * 0.44;
const HUB = 0.30, RING = 0.36, A0 = Math.PI / 2, SEC = 2 * Math.PI / 5, TAU = Math.PI * 2;
const T_WATER = 0, T_SAND = 1, T_GROUND = 2, T_WALL = 3, T_GATE = 4;
let tiles, zmap, perm, deco, pathm, towerm, WC, MM;
const PTS = {};
const GROUND_COL = ['#d8c28e', '#86c45f', '#6d6478', '#6f7f4b', '#4f8f45', '#dfe8ee'];

function polar(tx, ty){ const dx = (tx - CX) / RX, dy = (ty - CY) / RY; return { d:Math.hypot(dx, dy), a:Math.atan2(dy, dx) }; }
function coastR(a){ return 0.95 + 0.045 * Math.sin(a * 5 + 1) + 0.03 * Math.sin(a * 9 + 2); }
function nrm(a){ return ((a % TAU) + TAU) % TAU; }
function zoneOfAngle(a){ return 1 + Math.floor(nrm(a - A0) / SEC); }
function angDiff(a, b){ const d = nrm(a - b); return Math.min(d, TAU - d); }
function secMid(z){ return A0 + (z - 0.5) * SEC; }
function ptAt(f, a){ return { x:(CX + Math.cos(a) * f * RX) * TS, y:(CY + Math.sin(a) * f * RY) * TS }; }
function tI(tx, ty){ return ty * MW + tx; }
function tileAtPx(px, py){ const tx = Math.floor(px / TS), ty = Math.floor(py / TS); if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return -1; return tI(tx, ty); }

function genWorld(){
  const rng = mulberry32(20260927);
  const n = MW * MH;
  tiles = new Uint8Array(n); zmap = new Uint8Array(n); perm = new Uint8Array(n); deco = new Uint8Array(n); pathm = new Uint8Array(n); towerm = new Uint8Array(n);
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const i = tI(tx, ty), { d, a } = polar(tx + 0.5, ty + 0.5), cr = coastR(a);
    deco[i] = rng() * 256 | 0;
    zmap[i] = d < HUB ? 0 : zoneOfAngle(a);
    if (d > cr){ tiles[i] = T_WATER; continue; }
    tiles[i] = d > cr - 0.055 ? T_SAND : T_GROUND;
    if (d >= HUB && d < RING){
      const z = zoneOfAngle(a);
      if (angDiff(a, secMid(z)) * d * RX < 1.7){ tiles[i] = T_GATE; zmap[i] = z; }
      else { tiles[i] = T_WALL; perm[i] = 1; zmap[i] = 0; }
      continue;
    }
    if (d >= RING){
      for (let k = 0; k < 5; k++){ if (angDiff(a, A0 + k * SEC) * d * ((RX + RY) / 2) < 1.25){ tiles[i] = T_WALL; perm[i] = 1; break; } }
    }
  }
  for (let i = 0; i < n; i++) if (tiles[i] === T_GROUND && zmap[i] > 0 && rng() < 0.085) tiles[i] = T_WALL;
  // points of interest
  for (let z = 1; z <= 5; z++){
    const m = secMid(z);
    PTS[z] = { gate:ptAt((HUB + RING) / 2, m), inner:ptAt(0.12, m), npc:ptAt(0.45, m + 0.13), st:[ptAt(0.55, m - 0.3), ptAt(0.57, m + 0.3), ptAt(0.7, m - 0.25), ptAt(0.72, m + 0.25)], boss:ptAt(0.8, m) };
    const P = PTS[z];
    carveLine(P.inner, P.npc, 1.2); carveLine(P.npc, P.st[0]); carveLine(P.npc, P.st[1]); carveLine(P.st[0], P.st[1]);
    carveLine(P.st[0], P.st[2]); carveLine(P.st[1], P.st[3]); carveLine(P.st[2], P.boss); carveLine(P.st[3], P.boss);
    [P.npc, P.boss, ...P.st].forEach(p => carveDisk(p.x, p.y, 2.2, false));
  }
  PTS[0] = { center:{ x:CX * TS, y:CY * TS }, spawn:ptAt(0.13, Math.PI / 2), eule:ptAt(0.2, Math.PI / 2 + 0.45),
    lexikon:ptAt(0.19, Math.PI), laden:ptAt(0.19, 0), altar:ptAt(0.21, 4.09), arena:ptAt(0.21, 5.34) };
  for (let ty = CY - 2; ty <= CY; ty++) for (let tx = CX - 1; tx <= CX + 1; tx++){ const i = tI(tx, ty); tiles[i] = T_WALL; perm[i] = 1; towerm[i] = 1; }
}
function carveDisk(px, py, r, mark = true){
  const cx = px / TS, cy = py / TS;
  for (let ty = Math.floor(cy - r - 1); ty <= Math.ceil(cy + r + 1); ty++) for (let tx = Math.floor(cx - r - 1); tx <= Math.ceil(cx + r + 1); tx++){
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
    const dd = Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy); if (dd > r) continue;
    const i = tI(tx, ty);
    if (tiles[i] === T_WALL && !perm[i]) tiles[i] = T_GROUND;
    if (mark && dd < 0.9 && tiles[i] !== T_WATER && zmap[i] > 0) pathm[i] = 1;
  }
}
function carveLine(p, q, r = 1.3){
  const dist = Math.hypot(q.x - p.x, q.y - p.y), n = Math.ceil(dist / (TS * 0.4));
  for (let k = 0; k <= n; k++){ const f = k / n; carveDisk(p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f, r); }
}

/* ---------- pre-rendered map ---------- */
function renderWorld(){
  WC = document.createElement('canvas'); WC.width = MW * TS; WC.height = MH * TS;
  const g = WC.getContext('2d');
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) drawGroundTile(g, tx, ty);
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){ const i = tI(tx, ty); if (tiles[i] === T_WALL && !towerm[i]) drawWallTile(g, tx, ty); }
  MM = document.createElement('canvas'); MM.width = MW; MM.height = MH;
  const m = MM.getContext('2d');
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const i = tI(tx, ty), t = tiles[i];
    m.fillStyle = t === T_WATER ? '#2a7aa0' : t === T_WALL ? shade(GROUND_COL[zmap[i]], -55) : t === T_SAND ? '#e6d29b' : pathm[i] ? '#d9c79a' : GROUND_COL[zmap[i]];
    m.fillRect(tx, ty, 1, 1);
  }
}
function drawGroundTile(g, tx, ty){
  const i = tI(tx, ty), t = tiles[i], z = zmap[i], r = deco[i], x = tx * TS, y = ty * TS;
  if (t === T_WATER){
    g.fillStyle = '#2a7aa0'; g.fillRect(x, y, TS, TS);
    const { d, a } = polar(tx + 0.5, ty + 0.5);
    if (d < coastR(a) + 0.06){ g.fillStyle = '#3b95b8'; g.fillRect(x, y, TS, TS); }
    if (r % 6 === 0){ g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2; g.beginPath(); g.arc(x + 12, y + 18, 6, Math.PI * 1.1, Math.PI * 1.9); g.arc(x + 24, y + 18, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    return;
  }
  const base = t === T_SAND ? '#e6d29b' : GROUND_COL[t === T_WALL && perm[i] && z === 0 ? 0 : z];
  g.fillStyle = base; g.fillRect(x, y, TS, TS);
  if (t === T_SAND){ if (r % 4 === 0){ g.fillStyle = '#d4bd82'; circ(g, x + (r % 23) + 4, y + (r % 17) + 6, 1.6); } return; }
  switch (z){
    case 0:
      g.fillStyle = shade(base, -14);
      if (r % 2 === 0) rrect(g, x + 3, y + 3, 12, 10, 3); if (r % 3 === 0) rrect(g, x + 17, y + 17, 12, 10, 3);
      break;
    case 1:
      g.strokeStyle = shade(base, -25); g.lineWidth = 1.5;
      if (r % 3 === 0){ g.beginPath(); g.moveTo(x + 8, y + 22); g.lineTo(x + 10, y + 15); g.moveTo(x + 12, y + 22); g.lineTo(x + 13, y + 16); g.stroke(); }
      if (r % 11 === 0){ g.fillStyle = r % 2 ? '#f7d34a' : '#f39ac0'; circ(g, x + 20, y + 9, 3); g.fillStyle = '#fff6'; circ(g, x + 20, y + 9, 1.2); }
      break;
    case 2:
      g.fillStyle = shade(base, -12); if (r % 3 === 0) circ(g, x + (r % 20) + 6, y + (r % 13) + 8, 3);
      g.fillStyle = shade(base, 12); if (r % 5 === 0) circ(g, x + 22, y + 22, 2);
      break;
    case 3:
      if (r % 8 === 0){ g.fillStyle = '#4d6a5e'; ell(g, x + 16, y + 16, 12, 7); g.fillStyle = '#6d8f84'; ell(g, x + 13, y + 14, 4, 2); }
      else if (r % 3 === 0){ g.fillStyle = shade(base, -15); circ(g, x + 9, y + 20, 3); }
      break;
    case 4:
      if (r % 4 === 0){ g.fillStyle = shade(base, -18); ell(g, x + 10, y + 12, 4, 2.5, 0.6); ell(g, x + 22, y + 22, 4, 2.5, -0.4); }
      if (r % 17 === 0){ g.fillStyle = '#d96b4a'; circ(g, x + 16, y + 16, 3.5); g.fillStyle = '#fff'; circ(g, x + 15, y + 15, 1); }
      break;
    case 5:
      if (r % 4 === 0){ g.fillStyle = '#c9d6df'; ell(g, x + 14, y + 18, 7, 3); }
      if (r % 9 === 0){ g.fillStyle = '#fff'; circ(g, x + 8, y + 8, 1.5); }
      break;
  }
  if (pathm[i]){ g.fillStyle = z === 5 ? 'rgba(170,150,120,.45)' : z === 2 ? 'rgba(160,145,120,.5)' : 'rgba(214,190,140,.65)'; rrect(g, x + 1, y + 1, TS - 2, TS - 2, 9); }
}
function drawWallTile(g, tx, ty){
  const i = tI(tx, ty), z = zmap[i], r = deco[i], x = tx * TS, y = ty * TS, cx = x + 16, cy = y + 16;
  const ring = perm[i] && z === 0;
  if (ring){ g.fillStyle = '#3e7a3a'; rrect(g, x, y + 2, TS, TS - 2, 8); g.fillStyle = '#5c9a4f'; rrect(g, x + 3, y + 3, TS - 6, 10, 5); g.fillStyle = '#2f5f2c'; g.fillRect(x, y + TS - 6, TS, 6); return; }
  switch (z){
    case 1:
      g.fillStyle = '#3c8237'; circ(g, cx - 6, cy + 3, 10); circ(g, cx + 6, cy + 3, 10); g.fillStyle = '#58a64a'; circ(g, cx, cy - 4, 11);
      if (r % 3 === 0){ g.fillStyle = '#d63a4a'; circ(g, cx - 4, cy - 2, 2); circ(g, cx + 5, cy + 3, 2); }
      break;
    case 2:
      g.fillStyle = '#3b3548'; g.beginPath(); g.moveTo(x + 2, y + 30); g.lineTo(x + 6, y + 8); g.lineTo(x + 16, y + 1); g.lineTo(x + 28, y + 9); g.lineTo(x + 31, y + 30); g.closePath(); g.fill();
      g.fillStyle = '#5a5170'; g.beginPath(); g.moveTo(x + 8, y + 10); g.lineTo(x + 16, y + 4); g.lineTo(x + 20, y + 14); g.closePath(); g.fill();
      if (r % 5 === 0){ g.fillStyle = '#b9a8ff'; circ(g, x + 22, y + 20, 2); }
      break;
    case 3:
      g.fillStyle = '#56663a'; ell(g, cx, cy + 8, 14, 7);
      g.strokeStyle = '#7d8f3c'; g.lineWidth = 2.5;
      for (let k = 0; k < 4; k++){ g.beginPath(); g.moveTo(x + 7 + k * 6, y + 26); g.lineTo(x + 5 + k * 6 + (r % 3), y + 4 + (k % 2) * 4); g.stroke(); }
      g.fillStyle = '#6b4a2a'; for (let k = 0; k < 4; k += 2) rrect(g, x + 3 + k * 6 + (r % 3), y + 2 + (k % 2) * 4, 4, 9, 2);
      break;
    case 4:
      g.fillStyle = '#5a3d25'; g.fillRect(cx - 3, cy + 2, 6, 13);
      g.fillStyle = '#2a5f2a'; circ(g, cx, cy - 2, 17); g.fillStyle = '#3c7d36'; circ(g, cx - 4, cy - 6, 11); g.fillStyle = '#4f9544'; circ(g, cx - 6, cy - 9, 5);
      break;
    case 5:
      g.fillStyle = '#7d8793'; g.beginPath(); g.moveTo(x + 1, y + 30); g.lineTo(x + 9, y + 6); g.lineTo(x + 20, y + 2); g.lineTo(x + 31, y + 30); g.closePath(); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x + 9, y + 6); g.lineTo(x + 20, y + 2); g.lineTo(x + 25, y + 13); g.lineTo(x + 16, y + 10); g.lineTo(x + 7, y + 13); g.closePath(); g.fill();
      break;
    default:
      g.fillStyle = '#3e7a3a'; circ(g, cx, cy, 13);
  }
}

/* ---------- entities ---------- */
let ENTS = [];
function initEntities(){
  ENTS = [];
  const P0 = PTS[0];
  ENTS.push({ type:'tower', x:P0.center.x, y:P0.center.y + 8, r:44 });
  ENTS.push({ type:'npc', z:0, kind:'eule', x:P0.eule.x, y:P0.eule.y, r:14 });
  [['lexikon', 'Lexikon', '📖', '#8a4b2f'], ['laden', 'Laden', '🛒', '#2f6f8a'], ['altar', 'Morgen-Training', '🌅', '#b58a2a'], ['arena', 'Arena', '⚔️', '#7a2f4a']].forEach(([k, name, icon, roof]) =>
    ENTS.push({ type:'bld', kind:k, name, icon, roof, x:P0[k].x, y:P0[k].y, r:26 }));
  for (let z = 1; z <= 5; z++){
    const P = PTS[z];
    ENTS.push({ type:'npc', z, kind:NPCS[z].kind, x:P.npc.x, y:P.npc.y, r:14 });
    P.st.forEach((p, i) => ENTS.push({ type:'st', z, i, def:STATIONS[z][i], x:p.x, y:p.y, r:16 }));
    ENTS.push({ type:'boss', z, x:P.boss.x, y:P.boss.y, r:30 });
  }
  const rng = mulberry32(99);
  const MON_N = ['Nebel-Klecks', 'Vergiss-Mich', 'Grau-Wolke', 'Wort-Dieb'];
  for (let z = 1; z <= 5; z++){
    let placed = 0, tries = 0, fea = 0;
    while ((placed < 4 || fea < 10) && tries++ < 4000){
      const tx = Math.floor(rng() * MW), ty = Math.floor(rng() * MH), i = tI(tx, ty);
      if (zmap[i] !== z || tiles[i] !== T_GROUND) continue;
      const { d } = polar(tx + 0.5, ty + 0.5); if (d < 0.46 || d > 0.84) continue;
      const x = tx * TS + 16, y = ty * TS + 16;
      if (ENTS.some(e => e.type !== 'fea' && Math.hypot(e.x - x, e.y - y) < 110)) continue;
      if (placed < 4){ ENTS.push({ type:'mon', z, x, y, hx:x, hy:y, tx:x, ty:y, t:rng() * 9, seed:rng() * 9, name:MON_N[placed], alive:true, respawn:0 }); placed++; }
      else { ENTS.push({ type:'fea', z, x, y, taken:false, t:rng() * 6 }); fea++; }
    }
  }
}

/* ---------- collision ---------- */
function gateLocked(z){ return z > S.zone; }
function solidPx(px, py){
  const i = tileAtPx(px, py); if (i < 0) return true;
  const t = tiles[i];
  if (t === T_WATER || t === T_WALL) return true;
  if (t === T_GATE) return gateLocked(zmap[i]);
  return false;
}
function boxFree(x, y, r){ return !solidPx(x - r, y - r) && !solidPx(x + r, y - r) && !solidPx(x - r, y + r) && !solidPx(x + r, y + r); }
function moveBody(b, dx, dy, r){
  if (dx && boxFree(b.x + dx, b.y, r)) b.x += dx;
  if (dy && boxFree(b.x, b.y + dy, r)) b.y += dy;
}

/* ---------- objective ---------- */
function stationsDone(z){ let n = 0; for (let i = 0; i < 4; i++) if ((S.stations[z + '-' + i] || 0) >= 1) n++; return n; }
function objective(){
  if (!S.met[0]) return { text:'Sprich mit Professorin Eule im Nest-Dorf.', es:'Habla con la profesora Búho.', target:PTS[0].eule };
  for (let z = 1; z <= 5; z++){
    if (S.bosses[z]) continue;
    const Z = ZONES[z];
    if (!S.met[z]) return { text:`Geh in die ${Z.name} und sprich mit ${NPCS[z].name.replace(/^Die /, 'der ').replace(/^Der /, 'dem ')}.`, es:`Ve a ${Z.es} y habla con el guía.`, target:PTS[z].npc };
    const done = stationsDone(z);
    if (done < 3){
      let best = null; PTS[z].st.forEach((p, i) => { if (!(S.stations[z + '-' + i] >= 1) && !best) best = p; });
      return { text:`${Z.name}: Spiele an den Schreinen (${done}/4). Ab 3 ist der Boss offen.`, es:`Juega en los santuarios (${done}/4). Con 3 se abre el jefe.`, target:best };
    }
    return { text:`Besiege ${BOSSES[z].name.replace(/^Der /, 'den ').replace(/^Das /, 'das ')} in der ${Z.name}!`, es:`¡Vence a ${BOSSES[z].es}!`, target:PTS[z].boss };
  }
  if (!S.exams.some(e => e.pct >= 60)) return { text:'Stelle dich dem Vergess-Geier im Prüfungsturm (Mitte des Dorfes)!', es:'¡Enfréntate al Buitre del Olvido en la Torre del Examen!', target:PTS[0].center };
  return { text:'Alles geschafft! Mach das Lexikon golden und trainiere in der Arena.', es:'¡Lo lograste todo! Repasa el Lexikon y entrena en la Arena.', target:null };
}

/* ---------- overworld scene ---------- */
const player = { x:0, y:0, dir:1, t:0, moving:false, target:null, targetEnt:null, inv:0, zone:0, stepT:0 };
const cam = { x:0, y:0 };
const Overworld = {
  get pauseOnModal(){ return !this.demo; },
  demo:false, t:0, near:null, obj:null, objT:0,
  enter(){ $('#hud').hidden = false; $('#quest').hidden = this.demo; this.refreshObjective(); hud(); },
  exit(){},
  refreshObjective(){ this.obj = objective(); $('#quest').innerHTML = `<b>Ziel:</b> ${esc(this.obj.text)} <span class="es-inline">${esc(this.obj.es)}</span>`; },
  update(dt){
    this.t += dt;
    if (this.demo){
      const a = this.t * 0.05;
      cam.x = CX * TS - W / 2 + Math.cos(a) * 520; cam.y = CY * TS - H / 2 + Math.sin(a) * 340;
      return;
    }
    let dx = (down('KeyD', 'ArrowRight') ? 1 : 0) - (down('KeyA', 'ArrowLeft') ? 1 : 0);
    let dy = (down('KeyS', 'ArrowDown') ? 1 : 0) - (down('KeyW', 'ArrowUp') ? 1 : 0);
    if (dx || dy){ player.target = null; player.targetEnt = null; }
    else if (player.target){
      const vx = player.target.x - player.x, vy = player.target.y - player.y, dd = Math.hypot(vx, vy);
      const reach = player.targetEnt ? player.targetEnt.r + 22 : 6;
      if (dd < reach){ const e = player.targetEnt; player.target = null; player.targetEnt = null; if (e) interact(e); }
      else { dx = vx / dd; dy = vy / dd; }
    }
    const len = Math.hypot(dx, dy);
    player.moving = len > 0;
    if (len){
      const sp = 180 * dt; dx = dx / len * sp; dy = dy / len * sp;
      if (dx) player.dir = dx > 0 ? 1 : -1;
      const ox = player.x, oy = player.y;
      moveBody(player, dx, dy, 9);
      if (player.target && Math.hypot(player.x - ox, player.y - oy) < 0.2){ player.target = null; player.targetEnt = null; }
      player.t += dt;
    }
    for (const e of ENTS){
      if (!['tower', 'bld', 'st', 'npc', 'boss'].includes(e.type)) continue;
      const vx = player.x - e.x, vy = player.y - e.y, dd = Math.hypot(vx, vy), min = e.r + 10;
      if (dd < min && dd > 0.01){ const nx = e.x + vx / dd * min, ny = e.y + vy / dd * min; if (boxFree(nx, ny, 9)){ player.x = nx; player.y = ny; } }
    }
    const ti = tileAtPx(player.x, player.y), z = ti >= 0 ? zmap[ti] : 0;
    if (z !== player.zone){
      player.zone = z; const Z = ZONES[z];
      toast(`<b>${Z.name}</b> <span class="es-inline">${Z.es}</span>${Z.page ? ` · <span class="muted-l">${Z.page}</span>` : ''}`, 'zone');
      if (z === 0 && S.hearts < S.maxHearts){ S.hearts = S.maxHearts; hud(); toast('♥ Im Nest-Dorf sind deine Herzen wieder voll.', ''); }
      S.pos = { x:player.x, y:player.y }; save();
    }
    if (player.inv > 0) player.inv -= dt;
    // monsters, feathers
    for (const e of ENTS){
      if (e.type === 'mon'){
        e.t += dt;
        if (!e.alive){ e.respawn -= dt; if (e.respawn <= 0){ e.alive = true; e.x = e.hx; e.y = e.hy; } continue; }
        const dp = Math.hypot(player.x - e.x, player.y - e.y);
        const chase = dp < 170 && player.zone === e.z && player.inv <= 0;
        let gx = e.tx, gy = e.ty, sp = 38;
        if (chase){ gx = player.x; gy = player.y; sp = 72; }
        else if (Math.hypot(e.tx - e.x, e.ty - e.y) < 6){ e.tx = e.hx + (Math.random() - 0.5) * 180; e.ty = e.hy + (Math.random() - 0.5) * 180; }
        const vx = gx - e.x, vy = gy - e.y, dd = Math.hypot(vx, vy) || 1;
        moveBody(e, vx / dd * sp * dt, vy / dd * sp * dt, 10);
        if (!chase && Math.random() < dt * 0.3){ e.tx = e.hx + (Math.random() - 0.5) * 180; e.ty = e.hy + (Math.random() - 0.5) * 180; }
        if (dp < 24 && player.inv <= 0 && !modalOpen()){ startFight(e); return; }
      } else if (e.type === 'fea' && !e.taken){
        e.t += dt;
        if (Math.hypot(player.x - e.x, player.y - e.y) < 22){ e.taken = true; SFX.pick(); addFeathers(2); }
      }
    }
    // nearest interactable
    this.near = null; let bd = 1e9;
    for (const e of ENTS){
      if (!['tower', 'bld', 'st', 'npc', 'boss'].includes(e.type)) continue;
      const dd = Math.hypot(player.x - e.x, player.y - e.y) - e.r;
      if (dd < 34 && dd < bd){ bd = dd; this.near = e; }
    }
    cam.x = clamp(Math.round(player.x - W / 2), 0, MW * TS - W);
    cam.y = clamp(Math.round(player.y - H / 2), 0, MH * TS - H);
    this.objT -= dt; if (this.objT <= 0){ this.objT = 1; this.refreshObjective(); }
  },
  draw(g){
    const cx = Math.round(cam.x), cy = Math.round(cam.y);
    g.imageSmoothingEnabled = true;
    g.drawImage(WC, cx, cy, W, H, 0, 0, W, H);
    g.save(); g.translate(-cx, -cy);
    // gates
    for (let z = 1; z <= 5; z++){
      const p = PTS[z].gate;
      if (p.x < cx - 100 || p.x > cx + W + 100 || p.y < cy - 100 || p.y > cy + H + 100) continue;
      if (gateLocked(z)){
        g.save(); g.globalAlpha = 0.8;
        for (let k = 0; k < 6; k++){ g.fillStyle = k % 2 ? '#6d5b8a' : '#8f86a8'; circ(g, p.x + Math.cos(this.t + k) * 22, p.y + Math.sin(this.t * 1.3 + k * 2) * 14, 20); }
        g.restore(); drawEmoji(g, '🔒', p.x, p.y, 24);
        textOut(g, ZONES[z].name, p.x, p.y + 34, 'bold 13px "Atkinson Hyperlegible", sans-serif', '#fff');
      } else {
        textOut(g, ZONES[z].name, p.x, p.y - 30, 'bold 13px "Atkinson Hyperlegible", sans-serif', '#fff6d8');
      }
    }
    const list = ENTS.filter(e => e.x > cx - 120 && e.x < cx + W + 120 && e.y > cy - 160 && e.y < cy + H + 80);
    list.push({ type:'player', x:player.x, y:player.y });
    list.sort((a, b) => a.y - b.y);
    for (const e of list) drawEnt(g, e, this.t);
    // prompt
    if (!this.demo && this.near){ const e = this.near; const lab = promptFor(e); textOut(g, lab, e.x, e.y - e.r - 36, 'bold 15px "Atkinson Hyperlegible", sans-serif', '#ffe9a8'); }
    g.restore();
    if (!this.demo){ drawObjectiveArrow(g, this.obj, cx, cy, this.t); drawMinimap(g, this.t); }
  },
  key(e){
    if (this.demo) return;
    if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space'){ if (this.near) interact(this.near); }
    else if (e.code === 'Escape') openMenu();
    else if (e.code === 'KeyB') openLexikon();
  },
  click(x, y){
    if (this.demo) return;
    const wx = x + cam.x, wy = y + cam.y;
    const hit = ENTS.find(e => ['tower', 'bld', 'st', 'npc', 'boss'].includes(e.type) && Math.hypot(e.x - wx, e.y - wy) < e.r + 12);
    player.target = { x:hit ? hit.x : wx, y:hit ? hit.y : wy }; player.targetEnt = hit || null;
  },
};
function promptFor(e){
  if (e.type === 'npc') return 'E: Sprechen';
  if (e.type === 'bld') return `E: ${e.name}`;
  if (e.type === 'tower') return (S.bosses[5] || S.unlockAll) ? 'E: Prüfungsturm betreten' : '🔒 Prüfungsturm (nach 5 Bossen)';
  if (e.type === 'st'){ const st = S.stations[e.z + '-' + e.i] || 0; return `E: ${e.def.name} ${'★'.repeat(st)}${'☆'.repeat(3 - st)}`; }
  if (e.type === 'boss') return S.bosses[e.z] ? `E: ${BOSSES[e.z].name} (Revanche)` : stationsDone(e.z) >= 3 ? `E: Kampf gegen ${BOSSES[e.z].name}!` : `🔒 Boss: noch ${3 - stationsDone(e.z)} Schrein(e)`;
  return '';
}
function drawEnt(g, e, t){
  switch (e.type){
    case 'player': {
      if (Overworld.demo) return;
      if (player.inv > 0 && Math.floor(t * 12) % 2) return;
      drawRanger(g, player.x, player.y - 6, 1.35, player.dir, player.t, player.moving, S.hat && (SHOP.find(s => s.id === S.hat) || {}).emoji);
      return;
    }
    case 'npc': {
      drawNPC(g, e.kind, e.x, e.y - 6, 1.25, t + e.x, e.x > player.x ? -1 : 1);
      if (!S.met[e.z]){ const b = Math.sin(t * 5) * 3; drawEmoji(g, '💬', e.x + 16, e.y - 40 + b, 20); }
      return;
    }
    case 'st': {
      const st = S.stations[e.z + '-' + e.i] || 0;
      if (st === 3){ g.save(); g.globalAlpha = 0.35 + Math.sin(t * 3) * 0.15; g.fillStyle = '#f2b632'; circ(g, e.x, e.y - 6, 26); g.restore(); }
      shadowAt(g, e.x, e.y + 14, 18, 5);
      g.fillStyle = '#8b8577'; rrect(g, e.x - 16, e.y - 4, 32, 18, 4); g.fillStyle = '#a8a293'; rrect(g, e.x - 12, e.y - 12, 24, 10, 3);
      g.fillStyle = '#6f6a5e'; g.fillRect(e.x - 16, e.y + 10, 32, 4);
      drawEmoji(g, e.def.icon, e.x, e.y - 26 + Math.sin(t * 2 + e.i) * 3, 24);
      textOut(g, '★'.repeat(st) + '☆'.repeat(3 - st), e.x, e.y + 24, 'bold 12px sans-serif', '#ffd66b');
      return;
    }
    case 'boss': {
      const beaten = S.bosses[e.z];
      g.save(); if (beaten) g.globalAlpha = 0.55;
      drawBoss(g, BOSSES[e.z].kind, e.x, e.y - 14, 1.5, t);
      g.restore();
      if (!beaten && stationsDone(e.z) < 3){ g.save(); g.globalAlpha = 0.55; g.fillStyle = '#6d5b8a'; circ(g, e.x, e.y - 10, 38); g.restore(); drawEmoji(g, '🔒', e.x, e.y - 12, 22); }
      textOut(g, BOSSES[e.z].name, e.x, e.y + 26, 'bold 12px "Atkinson Hyperlegible", sans-serif', beaten ? '#cfe8c9' : '#ffb4a8');
      return;
    }
    case 'bld': {
      shadowAt(g, e.x, e.y + 18, 30, 6);
      if (e.kind === 'altar'){
        g.fillStyle = '#b8ad96'; rrect(g, e.x - 22, e.y - 6, 44, 22, 4); g.fillStyle = '#d4c8ad'; rrect(g, e.x - 26, e.y - 12, 52, 8, 3);
        g.save(); g.globalAlpha = 0.5 + Math.sin(t * 2) * 0.2; g.fillStyle = '#ffd66b'; circ(g, e.x, e.y - 26, 14); g.restore();
        drawEmoji(g, '🌅', e.x, e.y - 26, 20);
        if (S.lastDaily !== todayStr()) drawEmoji(g, '❗', e.x + 22, e.y - 40 + Math.sin(t * 5) * 3, 18);
      } else {
        g.fillStyle = '#e9dcc0'; g.fillRect(e.x - 24, e.y - 14, 48, 30);
        g.fillStyle = e.roof; g.beginPath(); g.moveTo(e.x - 30, e.y - 12); g.lineTo(e.x, e.y - 38); g.lineTo(e.x + 30, e.y - 12); g.closePath(); g.fill();
        g.fillStyle = '#6b4a2e'; g.fillRect(e.x - 6, e.y, 12, 16);
        g.fillStyle = '#fff6d8'; rrect(g, e.x - 17, e.y - 7, 16, 14, 3);
        drawEmoji(g, e.icon, e.x - 9, e.y, 12);
      }
      textOut(g, e.name, e.x, e.y + 30, 'bold 12px "Atkinson Hyperlegible", sans-serif', '#fff6d8');
      return;
    }
    case 'tower': {
      const open = S.bosses[5] || S.unlockAll;
      shadowAt(g, e.x, e.y + 20, 44, 10);
      g.fillStyle = '#8d8474'; g.fillRect(e.x - 34, e.y - 110, 68, 128);
      g.fillStyle = '#a69d8b'; for (let k = 0; k < 5; k++) g.fillRect(e.x - 38 + k * 16, e.y - 124, 12, 16);
      g.fillStyle = '#766e60'; for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) if ((r + c) % 2) g.fillRect(e.x - 34 + c * 17, e.y - 104 + r * 17, 17, 2);
      g.fillStyle = open ? '#ffd66b' : '#2b2433'; rrect(g, e.x - 12, e.y - 16, 24, 34, 10);
      g.fillStyle = open ? '#ffe9a8' : '#3a3144'; rrect(g, e.x - 7, e.y - 90, 14, 20, 6);
      g.strokeStyle = '#5a4632'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x, e.y - 124); g.lineTo(e.x, e.y - 150); g.stroke();
      g.fillStyle = '#e2742f'; g.beginPath(); g.moveTo(e.x, e.y - 150); g.lineTo(e.x + 22 + Math.sin(t * 4) * 3, e.y - 143); g.lineTo(e.x, e.y - 136); g.fill();
      if (!open){ g.save(); g.globalAlpha = 0.45; g.fillStyle = '#6d5b8a'; for (let k = 0; k < 5; k++) circ(g, e.x + Math.cos(t + k * 1.3) * 30, e.y - 60 + Math.sin(t * 0.8 + k) * 50, 18); g.restore(); drawEmoji(g, '🔒', e.x, e.y + 2, 18); }
      textOut(g, 'Prüfungsturm', e.x, e.y + 32, 'bold 13px "Atkinson Hyperlegible", sans-serif', '#ffe9a8');
      return;
    }
    case 'mon': if (e.alive) drawMonster(g, e.x, e.y - 8, 1.25, e.t, e.seed); return;
    case 'fea': if (!e.taken) drawEmoji(g, '🪶', e.x, e.y - 4 + Math.sin(e.t * 3) * 3, 18); return;
  }
}
function drawObjectiveArrow(g, obj, cx, cy, t){
  if (!obj || !obj.target) return;
  const px = player.x - cx, py = player.y - cy, tx = obj.target.x - cx, ty = obj.target.y - cy;
  const dd = Math.hypot(tx - px, ty - py); if (dd < 140) return;
  const a = Math.atan2(ty - py, tx - px), r = 52 + Math.sin(t * 5) * 4;
  g.save(); g.translate(px + Math.cos(a) * r, py - 8 + Math.sin(a) * r); g.rotate(a);
  g.fillStyle = '#f2b632'; g.strokeStyle = '#5a3d0a'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(14, 0); g.lineTo(-6, -9); g.lineTo(-2, 0); g.lineTo(-6, 9); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function drawMinimap(g, t){
  const w = 150, h = Math.round(150 * MH / MW), x = W - w - 12, y = 58;
  g.save(); g.fillStyle = 'rgba(15,32,38,.75)'; rrect(g, x - 4, y - 4, w + 8, h + 8, 8);
  g.imageSmoothingEnabled = false; g.drawImage(MM, x, y, w, h); g.imageSmoothingEnabled = true;
  const sx = w / (MW * TS), sy = h / (MH * TS);
  for (let z = 1; z <= 5; z++){
    const p = PTS[z].gate; if (gateLocked(z)){ g.fillStyle = '#6d5b8a'; circ(g, x + p.x * sx, y + p.y * sy, 4); }
    const b = PTS[z].boss; g.fillStyle = S.bosses[z] ? '#7fd08a' : '#ff6b5b'; circ(g, x + b.x * sx, y + b.y * sy, 2.6);
  }
  g.fillStyle = '#ffd66b'; circ(g, x + PTS[0].center.x * sx, y + PTS[0].center.y * sy, 3);
  if (Math.floor(t * 3) % 2 === 0){ g.fillStyle = '#fff'; circ(g, x + player.x * sx, y + player.y * sy, 3); }
  g.restore();
}
