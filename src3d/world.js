/* ============================================================
   WORLD — hub, islands, bridges, NPCs, portals, roaming drones
   ============================================================ */
const world = { group:new THREE.Group(), inter:[], drones:[], fields:{}, portals:{}, bossStatues:{}, npcs:[], t:0, zone:0, arrow:null, near:null };
const ISL = {
  1:{ c:new V3(125, 0, 0), dir:[1, 0], top:'#6cae4a', side:'#6b4a2e', theme:'meadow', sky:['#8fd3ff', '#e9f6ff'] },
  2:{ c:new V3(0, 0, 125), dir:[0, 1], top:'#6d6478', side:'#3b3548', theme:'cave', sky:['#3b3150', '#9e8fb8'] },
  3:{ c:new V3(-125, 0, 0), dir:[-1, 0], top:'#6f8a4a', side:'#4a3a28', theme:'swamp', sky:['#7d9a86', '#d8e4c8'] },
  4:{ c:new V3(0, 0, -125), dir:[0, -1], top:'#3f8a3a', side:'#5a3d25', theme:'forest', sky:['#6fb58a', '#e2f3d0'] },
  5:{ c:new V3(150, 40, -150), dir:[1, 0], top:'#eef3f7', side:'#8a93a0', theme:'snow', sky:['#9cc8ee', '#f4f9ff'] },
};
const HUB_SPAWN = new V3(0, 0, 17);
function islPt(z, a, b, y = 0){ const I = ISL[z], d = I.dir; return new V3(I.c.x + d[0] * a - d[1] * b, I.c.y + y, I.c.z + d[1] * a + d[0] * b); }

function buildWorld(){
  const g = world.group, C = worldCols;
  scene3.add(g);
  // ---- hub ----
  solid(g, C, 0, -3, 0, 60, 6, 60, '#9c8f72');
  mesh(G('box', 56, 0.2, 56), M('#c4b48e'), 0, 0.02, 0, g, false).receiveShadow = true;
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if ((i + j) % 2 === 0) mesh(G('box', 7.6, 0.06, 7.6), M('#b3a27b'), i * 8, 0.13, j * 8, g, false);
  [[48, -9], [36, -15], [22, -21], [10, -27]].forEach(([s, y]) => mesh(G('box', s, 6, s), M('#7a6a52'), 0, y, 0, g, false));
  // tower
  solid(g, C, 0, 12, 0, 7, 24, 7, '#9a917f').mesh.visible = false;
  mesh(G('cyl', 3.7, 4.2, 24, 10), M('#8f8676'), 0, 12, 0, g);
  for (let k = 0; k < 10; k++){ const a = k / 10 * Math.PI * 2; mesh(G('box', 1.1, 1.3, 1.1), M('#a69d8b'), Math.cos(a) * 3.9, 24.6, Math.sin(a) * 3.9, g); }
  mesh(G('cone', 3.2, 5.5, 10), M('#6d5b8a'), 0, 28, 0, g);
  const flag = mesh(G('box', 0.1, 1.4, 2.2), M('#e2742f'), 0, 31.5, 1.1, g); world.flag = flag;
  mesh(G('box', 2.8, 4.2, 0.6), M('#3a2e22'), 0, 2.1, 3.9, g);
  world.towerField = mesh(G('plane', 2.6, 4.0), M('#b26bff', { basic:true, opacity:0.5, double:true }), 0, 2.1, 4.3, g, false);
  const tl = textSprite('Prüfungsturm', { size:1.0, color:'#ffc83d' }); tl.position.set(0, 6.2, 4.6); g.add(tl);
  world.inter.push({ pos:new V3(0, 0, 5.4), r:3.2, text:() => (S.bosses[5] || S.unlockAll) ? 'Prüfungsturm betreten' : '🔒 Prüfungsturm (nach allen 5 Bossen)', act:() => enterTower() });
  // Eule
  const eule = npcModel('eule', 1.35); eule.position.set(-7, 0, 13); eule.rotation.y = 0.4; g.add(eule); world.npcs.push({ m:eule, z:0 });
  addNameTag(eule, 'Professorin Eule', 3.9);
  world.inter.push({ pos:eule.position, r:3.4, text:() => 'Sprechen: Professorin Eule', act:() => talkNPC(0), npc:0 });
  // kiosks
  kiosk(g, C, 18, 13, '#2f6fed', 'Skin-Shop 🛒', () => openShop());
  kiosk(g, C, -18, 13, '#8a4b2f', 'Wort-Inventar 📖', () => openLexikon());
  world.portals.daily = hubPortal(g, 18, -16, '#ffc83d', 'Tages-Run', () => startDaily());
  world.portals.arena = hubPortal(g, -18, -16, '#ff5d6c', 'Arena', () => arenaConfirm());
  world.portals.gipfel = hubPortal(g, 9, -22, '#bfe6ff', 'Merkmal-Gipfel', () => { if (S.zone < 5 && !S.unlockAll){ toast('🔒 Der Gipfel öffnet sich nach dem Werkzeug-Golem (Zone 4).'); return; } travelZ5(); });
  // lamps & trees on the hub
  [[-26, -26], [26, -26], [-26, 26], [26, 26]].forEach(([x, z]) => treeRound(g, C, x, 0, z, 1.1, '#4f9a44'));
  [[-10, 24], [10, 24], [24, 0], [-24, 0], [0, -26]].forEach(([x, z]) => { mesh(G('cyl', 0.12, 0.15, 3.4, 6), M('#2b3140'), x, 1.7, z, g); mesh(G('sph', 0.35, 8, 6), M('#fff3c4', { em:'#ffd66b', emi:1 }), x, 3.5, z, g, false); });
  // ---- bridges ----
  [1, 2, 3, 4].forEach(z => buildBridge(z));
  // ---- islands ----
  [1, 2, 3, 4, 5].forEach(z => buildIsland(z));
  // arrow
  world.arrow = new THREE.Group();
  const cone = mesh(G('cone', 0.28, 0.8, 4), M('#ffc83d', { em:'#ffb31a', emi:0.7 }), 0, 0, 0, world.arrow, false); cone.rotation.x = Math.PI / 2;
  scene3.add(world.arrow);
  refreshWorldLocks();
}
function addNameTag(obj, text, h){ const s = textSprite(text, { size:0.42, color:'#fff' }); s.position.set(0, h, 0); obj.add(s); return s; }
function kiosk(g, C, x, z, color, label, act){
  solid(g, C, x, 1.2, z, 5, 2.4, 3, '#e9dcc0');
  mesh(G('box', 5.6, 0.3, 3.6), M(color), x, 3.8, z, g);
  [[-2.4, -1.4], [2.4, -1.4], [-2.4, 1.4], [2.4, 1.4]].forEach(([dx, dz]) => mesh(G('box', 0.2, 1.4, 0.2), M('#5a3d25'), x + dx, 3.1, z + dz, g));
  const s = textSprite(label, { size:0.7, color:'#fff' }); s.position.set(x, 5, z); g.add(s);
  world.inter.push({ pos:new V3(x, 0, z + 2.6), r:3, text:() => label, act });
}
function hubPortal(g, x, z, color, label, act){
  const p = portalModel(color, label); p.position.set(x, 0, z); g.add(p);
  world.inter.push({ pos:new V3(x, 0, z), r:3.4, text:() => label, act });
  return p;
}
function buildBridge(z){
  const g = world.group, C = worldCols, I = ISL[z], d = I.dir;
  const a0 = 30, a1 = 125 - 32, mid = (a0 + a1) / 2, len = a1 - a0;
  const cx = d[0] * mid, cz = d[1] * mid;
  const sx = d[0] ? len : 6, sz = d[1] ? len : 6;
  solid(g, C, cx, -0.5, cz, sx, 1, sz, '#8a6a48');
  for (let k = 0; k < len; k += 3){ const px = d[0] * (a0 + k + 1.5), pz = d[1] * (a0 + k + 1.5); mesh(G('box', d[0] ? 2.8 : 6.2, 0.1, d[1] ? 2.8 : 6.2), M(k % 6 ? '#a07d55' : '#946f49'), px, 0.02, pz, g, false); }
  [-1, 1].forEach(s => { const ox = -d[1] * 3.1 * s, oz = d[0] * 3.1 * s; solid(g, C, cx + ox, 0.6, cz + oz, d[0] ? len : 0.3, 1.2, d[1] ? len : 0.3, '#6b4a2e'); });
  // force field at the hub end
  const fx = d[0] * 32, fz = d[1] * 32;
  const field = mesh(G('plane', 6, 5), M('#ff5d6c', { basic:true, opacity:0.45, double:true }), fx, 2.5, fz, g, false);
  field.rotation.y = d[0] ? Math.PI / 2 : 0;
  const col = makeCol(fx, 2.5, fz, d[0] ? 0.6 : 6, 5, d[1] ? 0.6 : 6); C.push(col);
  const lab = textSprite(`🔒 ${ZONES[z].name}`, { size:0.6, color:'#fff' }); lab.position.set(fx, 5.8, fz); g.add(lab);
  const name = textSprite(`${ZONES[z].name} →`, { size:0.9, color:'#ffc83d' }); name.position.set(d[0] * 36, 3.5, d[1] * 36); g.add(name);
  world.fields[z] = { field, col, lab };
}
function buildIsland(z){
  const g = world.group, C = worldCols, I = ISL[z], c = I.c, rng = mulberry32(z * 97);
  solid(g, C, c.x, c.y - 3, c.z, 64, 6, 64, I.side);
  mesh(G('box', 64.2, 1, 64.2), M(I.top), c.x, c.y - 0.45, c.z, g, false).receiveShadow = true;
  [[54, -9], [40, -15], [26, -21], [12, -27]].forEach(([s, y]) => mesh(G('box', s, 6, s), M(shadeHex(I.side, -12)), c.x, c.y + y, c.z, g, false));
  const keep = [];
  // NPC
  const np = islPt(z, -18, 7);
  const npc = npcModel(NPCS[z].kind, 1.45); npc.position.copy(np); npc.rotation.y = Math.atan2(-I.dir[0], -I.dir[1]); g.add(npc);
  addNameTag(npc, NPCS[z].name, 4.2); world.npcs.push({ m:npc, z });
  world.inter.push({ pos:np, r:3.6, text:() => `Sprechen: ${NPCS[z].name}`, act:() => talkNPC(z), npc:z });
  keep.push(np);
  // stations
  world.portals['z' + z] = [];
  const spots = [[-4, -16], [-4, 16], [12, -16], [12, 16]];
  STATIONS[z].forEach((def, i) => {
    const p = islPt(z, spots[i][0], spots[i][1]);
    const col = ['#3de0ff', '#a6ff4d', '#ffc83d', '#ff7ad9'][i];
    const pm = portalModel(col, `${def.icon} ${def.name}`, starStr(S.stations[z + '-' + i] || 0)); pm.position.copy(p); pm.rotation.y = Math.atan2(-I.dir[1] * (spots[i][1] > 0 ? 1 : -1), 0) ; g.add(pm);
    pm.rotation.y = spots[i][1] > 0 ? (I.dir[0] ? 0 : Math.PI / 2) : (I.dir[0] ? Math.PI : -Math.PI / 2);
    world.portals['z' + z].push(pm);
    world.inter.push({ pos:p, r:3.4, text:() => `${def.icon} ${def.name}  ${starStr(S.stations[z + '-' + i] || 0)}`, act:() => startStation(z, i) });
    keep.push(p);
  });
  // boss
  const bp = islPt(z, 22, 0);
  solid(g, C, bp.x, c.y + 0.2, bp.z, 13, 0.4, 13, '#3a4150');
  [[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]].forEach(([dx, dz]) => solid(g, C, bp.x + dx, c.y + 2.4, bp.z + dz, 1.2, 4.4, 1.2, '#5a6272'));
  const B = bossModel(BOSSES[z].kind); B.root.position.set(bp.x, c.y + 0.4, bp.z); B.root.rotation.y = Math.atan2(-I.dir[0], -I.dir[1]); B.root.scale.setScalar(0.7); g.add(B.root);
  const dome = mesh(G('sph', 7.5, 16, 12), M('#b26bff', { basic:true, opacity:0.18, double:true }), bp.x, c.y + 1, bp.z, g, false);
  const bl = textSprite(BOSSES[z].name, { size:0.8, color:'#ff9aa2' }); bl.position.set(bp.x, c.y + 10.5, bp.z); g.add(bl);
  world.bossStatues[z] = { B, dome, pos:bp, lab:bl };
  world.inter.push({ pos:bp, r:7.5, text:() => S.bosses[z] ? `${BOSSES[z].name} (Revanche)` : stationsDone(z) >= 3 ? `⚔️ Bosskampf: ${BOSSES[z].name}` : `🔒 Boss: noch ${3 - stationsDone(z)} Portal(e)`, act:() => {
    if (!S.bosses[z] && stationsDone(z) < 3){ toast(`🔒 Schaffe zuerst 3 Portale (${stationsDone(z)}/3).`); return; } bossConfirm(z); } });
  keep.push(bp);
  if (z === 5){
    const rp = islPt(5, -26, 0);
    const back = portalModel('#ffc83d', '↩ Zurück zum Dorf'); back.position.copy(rp); back.rotation.y = Math.PI / 2; g.add(back);
    world.inter.push({ pos:rp, r:3.4, text:() => 'Zurück zum Nest-Dorf', act:() => { SFX.portal(); teleport(HUB_SPAWN.clone().add(new V3(9, 0, -18)), Math.PI); } });
    keep.push(rp);
  }
  // decoration
  let n = 0, tries = 0;
  while (n < 22 && tries++ < 400){
    const a = -28 + rng() * 56, b = -28 + rng() * 56;
    if (Math.abs(b) < 5 && a < 16) continue;
    const p = islPt(z, a, b);
    if (keep.some(k => Math.hypot(k.x - p.x, k.z - p.z) < 7)) continue;
    const s = 0.8 + rng() * 0.6;
    switch (I.theme){
      case 'meadow': rng() < 0.6 ? treeRound(g, C, p.x, c.y, p.z, s, rng() < 0.5 ? '#4f9a44' : '#6fb04a') : flowerPatch(g, p.x, c.y, p.z, rng); break;
      case 'cave': rng() < 0.5 ? rock(g, C, p.x, c.y, p.z, s * 1.3, '#4a4258') : crystal(g, p.x, c.y, p.z, s * 1.4, rng() < 0.5 ? '#a78bfa' : '#67e8f9'); break;
      case 'swamp': rng() < 0.4 ? deadTree(g, C, p.x, c.y, p.z, s) : rng() < 0.7 ? pond(g, p.x, c.y, p.z, s) : reeds(g, p.x, c.y, p.z); break;
      case 'forest': rng() < 0.75 ? treePine(g, C, p.x, c.y, p.z, s * 1.2) : mushroom(g, p.x, c.y, p.z, s); break;
      case 'snow': rng() < 0.55 ? treePine(g, C, p.x, c.y, p.z, s, '#2f5f45', true) : rock(g, C, p.x, c.y, p.z, s * 1.2, '#9aa4b1'); break;
    }
    n++;
  }
  // roaming article drones
  for (let k = 0; k < 3; k++){
    const home = islPt(z, -8 + k * 9, (k - 1) * 10, 3.5);
    spawnWorldDrone(z, home);
  }
}
function flowerPatch(g, x, y, z, rng){ for (let k = 0; k < 5; k++){ const c = ['#f7d34a', '#f39ac0', '#ffffff', '#9ad0ff'][k % 4]; mesh(G('box', 0.25, 0.4, 0.25), M(c), x + (rng() - 0.5) * 2, y + 0.2, z + (rng() - 0.5) * 2, g, false); } }
function deadTree(g, C, x, y, z, s){ mesh(G('cyl', 0.25 * s, 0.4 * s, 4 * s, 5), M('#4a3a28'), x, y + 2 * s, z, g); const b = mesh(G('cyl', 0.12 * s, 0.18 * s, 2 * s, 5), M('#4a3a28'), x + 0.7 * s, y + 3 * s, z, g); b.rotation.z = -0.8; C.push(makeCol(x, y + 2 * s, z, 0.8 * s, 4 * s, 0.8 * s)); }
function pond(g, x, y, z, s){ const p = mesh(G('cyl', 2.4 * s, 2.4 * s, 0.1, 10), M('#3f5c5a', { rough:0.2 }), x, y + 0.03, z, g, false); p.receiveShadow = true; }
function reeds(g, x, y, z){ for (let k = 0; k < 6; k++){ mesh(G('cyl', 0.05, 0.05, 1.8, 4), M('#7d8f3c'), x + (k % 3) * 0.4 - 0.4, y + 0.9, z + Math.floor(k / 3) * 0.4, g, false); mesh(G('cyl', 0.1, 0.1, 0.4, 5), M('#6b4a2a'), x + (k % 3) * 0.4 - 0.4, y + 1.9, z + Math.floor(k / 3) * 0.4, g, false); } }
function mushroom(g, x, y, z, s){ mesh(G('cyl', 0.2 * s, 0.25 * s, 0.8 * s, 6), M('#f2ecd8'), x, y + 0.4 * s, z, g); mesh(G('sph', 0.7 * s, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#d6453a'), x, y + 0.8 * s, z, g); }
function starStr(n){ return '★'.repeat(n) + '☆'.repeat(3 - n); }

/* ---------- roaming article drones ---------- */
function spawnWorldDrone(z, home){
  const d = { z, home, t:Math.random() * 10, alive:true, respawn:0, g:droneModel(), label:null, id:null, cool:0 };
  world.group.add(d.g); d.g.position.copy(home);
  registerShootable(d.g, () => hitWorldDrone(d));
  newDroneWord(d);
  world.drones.push(d);
}
function newDroneWord(d){
  const ids = topicIds(ZONES[d.z].topic, w => !!w.art && !w.po);
  d.id = pick(pickWords(ids, 4));
  if (d.label){ d.g.remove(d.label); disposeTree(d.label); }
  d.label = textSprite(WMAP[d.id].de + ' ?', { size:0.55, color:'#fff' }); d.label.position.set(0, 1.5, 0); d.g.add(d.label);
}
function hitWorldDrone(d){
  if (!d.alive) return;
  const w = WMAP[d.id], pos = d.g.position.clone();
  if (ammo === w.art){
    onAnswer('right', { id:d.id, type:'art' }); SFX.boom(); burst(pos, AMMO_COL[w.art], 26, 10);
    popText(pos, `<b class="${artClass(w.art)}">${esc(nounLabel(w))}</b> ✔`); speak(nounLabel(w));
    d.alive = false; d.g.visible = false; d.respawn = 20;
  } else {
    onAnswer('wrong', { id:d.id, type:'art' }); SFX.bad();
    popText(pos, `✘ Es heißt <b class="${artClass(w.art)}">${esc(nounLabel(w))}</b>`, 'bad'); speak(nounLabel(w));
    const tgt = P.pos.clone().add(new V3(0, 1.4, 0));
    fireOrb(pos, tgt, 11); setTimeout(() => d.alive && fireOrb(d.g.position.clone(), P.pos.clone().add(new V3(0, 1.4, 0)), 11), 350);
  }
}

/* ---------- locks, objective, update ---------- */
function refreshWorldLocks(){
  for (const z of [1, 2, 3, 4]){
    const f = world.fields[z]; if (!f) continue;
    const open = z === 1 || z <= S.zone || S.unlockAll;
    f.field.visible = !open; f.col.active = !open; f.lab.visible = !open;
  }
  world.towerField.visible = !(S.bosses[5] || S.unlockAll);
  for (const z in world.bossStatues){
    const b = world.bossStatues[z];
    b.dome.visible = !S.bosses[z] && stationsDone(+z) < 3;
    b.B.root.visible = true;
  }
  for (let z = 1; z <= 5; z++) (world.portals['z' + z] || []).forEach((pm, i) => setPortalSub(pm, starStr(S.stations[z + '-' + i] || 0)));
  if (world.portals.gipfel) world.portals.gipfel.userData.ring.material = M(S.zone >= 5 || S.unlockAll ? '#bfe6ff' : '#555b66', { em:S.zone >= 5 || S.unlockAll ? '#bfe6ff' : '#222', emi:0.6, rough:0.4 });
}
function stationsDone(z){ let n = 0; for (let i = 0; i < 4; i++) if ((S.stations[z + '-' + i] || 0) >= 1) n++; return n; }
function objective(){
  if (!S.met[0]) return { text:'Sprich mit Professorin Eule.', es:'Habla con la profesora Búho.', target:new V3(-7, 0, 13) };
  for (let z = 1; z <= 5; z++){
    if (S.bosses[z]) continue;
    const Z = ZONES[z];
    if (z === 5 && world.zone !== 5 && !S.met[5]) return { text:'Nimm das Portal zum Merkmal-Gipfel im Dorf.', es:'Toma el portal a la Cumbre en el pueblo.', target:new V3(9, 0, -22) };
    if (!S.met[z]) return { text:`${Z.name}: Sprich mit ${NPCS[z].name.replace(/^Die /, 'der ').replace(/^Der /, 'dem ')}.`, es:`${Z.es}: habla con el guía.`, target:islPt(z, -18, 7) };
    const done = stationsDone(z);
    if (done < 3){ const spots = [[-4, -16], [-4, 16], [12, -16], [12, 16]]; const i = [0, 1, 2, 3].find(k => !(S.stations[z + '-' + k] >= 1)); return { text:`${Z.name}: Schaffe 3 von 4 Portalen (${done}/3).`, es:`Supera 3 de 4 portales (${done}/3).`, target:islPt(z, spots[i][0], spots[i][1]) }; }
    return { text:`Besiege ${BOSSES[z].name.replace(/^Der /, 'den ').replace(/^Das /, 'das ')}!`, es:`¡Vence a ${BOSSES[z].es}!`, target:world.bossStatues[z].pos };
  }
  if (!S.exams.some(e => e.pct >= 60)) return { text:'Stelle dich dem Vergess-Geier im Prüfungsturm!', es:'¡Enfréntate al Buitre del Olvido en la Torre!', target:new V3(0, 0, 5.4) };
  return { text:'Alles geschafft! Farm Gold-Wörter im Tages-Run und in der Arena.', es:'¡Todo superado! Repasa en el Tages-Run y la Arena.', target:null };
}
let objCache = null, objT = 0;
function refreshObjective(){ objCache = objective(); $('#quest').innerHTML = `<b>MISSION</b> ${esc(objCache.text)} <span class="es-inline">${esc(objCache.es)}</span>`; refreshWorldLocks(); }
function zoneAt(p){
  for (let z = 1; z <= 5; z++){ const c = ISL[z].c; if (Math.abs(p.x - c.x) < 34 && Math.abs(p.z - c.z) < 34 && Math.abs(p.y - c.y) < 30) return z; }
  if (Math.abs(p.x) < 31 && Math.abs(p.z) < 31) return 0;
  return -1;
}
function worldUpdate(dt){
  world.t += dt; const t = world.t;
  // portals & props
  for (const k in world.portals){ const v = world.portals[k]; (Array.isArray(v) ? v : [v]).forEach(p => { p.userData.disc.rotation.z -= dt * 1.5; p.userData.ring.rotation.z += dt * 0.3; }); }
  world.flag.rotation.y = Math.sin(t * 2) * 0.3;
  for (const z in world.bossStatues) world.bossStatues[z].B.update(t);
  world.npcs.forEach(n => { const h = n.m.userData.head; if (h) h.rotation.y = Math.sin(t * 0.8 + n.z) * 0.4; n.m.position.y = (n.z === 5 ? ISL[5].c.y : n.z === 0 ? 0 : 0) + Math.abs(Math.sin(t * 2 + n.z)) * 0.05; });
  for (const z in world.fields){ const f = world.fields[z]; if (f.field.visible) f.field.material.opacity = 0.35 + Math.sin(t * 4) * 0.1; }
  // drones
  for (const d of world.drones){
    d.t += dt;
    if (!d.alive){ d.respawn -= dt; if (d.respawn <= 0){ d.alive = true; d.g.visible = true; newDroneWord(d); } continue; }
    d.g.position.set(d.home.x + Math.sin(d.t * 0.5) * 6, d.home.y + Math.sin(d.t * 1.7) * 0.6, d.home.z + Math.cos(d.t * 0.4) * 6);
    d.g.rotation.y += dt;
  }
  // zone detection
  const z = zoneAt(P.pos);
  if (z >= 0 && z !== world.zone){
    world.zone = z; const Z = ZONES[z];
    toast(`<b>${Z.name}</b> <span class="es-inline">${Z.es}</span>${Z.page ? ` · ${Z.page}` : ''}`, 'zone');
    const sky = z === 0 ? ['#7cc4f0', '#e8f5ff'] : ISL[z].sky; setSky(sky[0], sky[1], sky[1], 120, 420);
    if (z === 0 && S.hearts < S.maxHearts){ S.hearts = S.maxHearts; hud(); toast('♥ Im Dorf sind deine Herzen wieder voll.'); }
    S.pos = { x:P.pos.x, y:P.pos.y, z:P.pos.z }; save();
  }
  // safe spot & falling
  if (P.grounded && worldCols.includes(P.ground)){ P.safeT -= dt; if (P.safeT <= 0){ P.safe.copy(P.pos); P.safeT = 0.5; } }
  if (P.pos.y < Math.min(0, P.safe.y) - 40){ SFX.fall(); teleport(P.safe.clone().add(new V3(0, 0.5, 0))); toast('Hoppla! Zurück auf festen Boden.'); }
  // objective arrow
  objT -= dt; if (objT <= 0){ objT = 1; refreshObjective(); }
  const tg = objCache && objCache.target;
  if (tg && P.pos.distanceTo(tg) > 9){
    world.arrow.visible = true;
    { const a = Math.atan2(tg.x - P.pos.x, tg.z - P.pos.z); world.arrow.position.set(P.pos.x + Math.sin(a) * 1.6, P.pos.y + 3.3 + Math.sin(t * 4) * 0.1, P.pos.z + Math.cos(a) * 1.6); }
    world.arrow.rotation.set(0, Math.atan2(tg.x - P.pos.x, tg.z - P.pos.z), 0);
  } else world.arrow.visible = false;
  // nearest interactable
  let best = null, bd = 1e9;
  for (const it of world.inter){ const dd = Math.hypot(it.pos.x - P.pos.x, it.pos.z - P.pos.z); if (dd < it.r && Math.abs(it.pos.y - P.pos.y) < 4 && dd < bd){ bd = dd; best = it; } }
  world.near = best;
  const pr = $('#prompt');
  if (best){ pr.hidden = false; pr.innerHTML = `<kbd>E</kbd> ${esc(best.text())}`; } else pr.hidden = true;
}
function interactNear(){ if (world.near){ $('#prompt').hidden = true; world.near.act(); } }
function travelZ5(){ SFX.portal(); teleport(islPt(5, -22, 0, 0.2), Math.PI / 2 * -1 + Math.PI); cam.yaw = -Math.PI / 2; }
function enterTower(){
  if (!(S.bosses[5] || S.unlockAll)){ toast('🔒 Der Prüfungsturm öffnet sich, wenn alle 5 Bosse besiegt sind.'); return; }
  startExam();
}
