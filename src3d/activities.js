/* ============================================================
   ACTIVITIES — every challenge runs in its own "instance" far from the world
   ============================================================ */
let activity = null;
const AO = new V3(6000, 0, 0);
const ART_HEX = { der:'#3d7bff', die:'#ff4d5e', das:'#22c76b' };
const ART_TXT = { der:'#8fbcff', die:'#ff9aa3', das:'#7ff0b0' };
function artColorOf(html){ const m = /art-(der|die|das)/.exec(html || ''); return m ? ART_TXT[m[1]] : '#ffffff'; }

class Activity {
  constructor(){ this.group = new THREE.Group(); this.cols = []; this.shoot = []; this.t = 0; this.shooting = false; this.correct = 0; this.total = 0; this.killY = -18; this._done = false; }
  B(x, y, z, sx, sy, sz, color, o){ return solid(this.group, this.cols, AO.x + x, AO.y + y, AO.z + z, sx, sy, sz, color, o); }
  W(x, y, z){ return new V3(AO.x + x, AO.y + y, AO.z + z); }
  put(obj, x, y, z){ obj.position.set(AO.x + x, AO.y + y, AO.z + z); this.group.add(obj); return obj; }
  finish(res){ if (this._done) return; this._done = true; setTimeout(() => this.done(res || { correct:this.correct, total:this.total }), res && res.delay || 0); }
  fail(){ this.finish({ correct:this.correct, total:this.total, failed:true }); }
  respawn(pen = true){
    SFX.fall(); teleport(P.checkpoint.clone(), P.face);
    if (pen){ hurt(1); if (S.hearts <= 0){ toast('💀 Keine Herzen mehr!', 'bad'); this.fail(); return false; } }
    if (this.onRespawn) this.onRespawn(); return true;
  }
  baseUpdate(dt){ this.t += dt; if (!this._done && P.pos.y < AO.y + this.killY) this.respawn(this.fallPenalty !== false); }
}
async function runActivity(act){
  const back = P.pos.clone(), backFace = P.face;
  activity = act; world.group.visible = false; world.arrow.visible = false; activeCols = act.cols;
  $('#quest').hidden = true; $('#prompt').hidden = true;
  ammoBar(act.ammo || null); $('#crosshair').hidden = !act.shooting;
  scene3.add(act.group); act.setup();
  teleport(act.spawn, act.spawnFace ?? Math.PI); P.checkpoint.copy(act.spawn);
  const res = await new Promise(r => { act.done = r; });
  clearOrbs(); if (act.cleanup) act.cleanup();
  popups.forEach(q => q.d.remove()); popups.length = 0;
  scene3.remove(act.group); disposeTree(act.group);
  activity = null; world.group.visible = true; activeCols = worldCols; P.frozen = false;
  banner(null); astat(null); ammoBar('art'); $('#crosshair').hidden = false; $('#quest').hidden = false;
  teleport(back, backFace);
  const sky = world.zone > 0 ? ISL[world.zone].sky : ['#7cc4f0', '#e8f5ff']; setSky(sky[0], sky[1], sky[1], 120, 420);
  return res;
}
function hudTime(t){ const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; }

/* ============ ARTIKEL-OBBY ============ */
// Layout chosen so that EVERY platform of the next row is reachable with a normal jump (no sprint):
// worst case (side -> opposite side) edge gap ~4.8 m vs. ~6.5 m jump range.
const OBBY = { px:4.0, w:3.2, dz:6.2, rise:0.4 };
class Obby extends Activity {
  constructor(topic){ super(); this.ids = pickWords(topicIds(topic, w => !!w.art), 12); this.total = this.ids.length; this.rows = []; this.falling = []; }
  setup(){
    setSky('#ff9a66', '#3a1426', '#5a2233', 60, 240);
    this.lava = lavaPlane(this.group, AO.y - 14); this.lava.position.set(AO.x, AO.y - 14, AO.z);
    this.B(0, -0.5, 0, 12, 1, 12, '#4b5563');
    this.spawn = this.W(0, 0.05, 3);
    let z = -10, y = 0;
    this.ids.forEach((id, k) => {
      if (k > 0 && k % 4 === 0){
        z += 1; y += 0.4;
        const cp = this.B(0, y - 0.3, z - 2.5, 13, 0.6, 5, '#374151'); cp.cp = this.W(0, y, z - 2.5);
        const fl = new THREE.Group(); mesh(G('cyl', 0.08, 0.08, 3, 5), M('#ddd'), 0, 1.5, 0, fl); mesh(G('box', 1.2, 0.8, 0.05), M('#a6ff4d', { em:'#a6ff4d', emi:0.5 }), 0.6, 2.6, 0, fl); this.put(fl, 5.5, y, z - 2.5);
        z -= 9.5;
      }
      const w = WMAP[id], row = { id, art:w.art, done:false, missed:false, plats:[] };
      shuffle(['der', 'die', 'das']).forEach((a, i) => {
        const x = (i - 1) * OBBY.px;
        const c = this.B(x, y - 0.3, z, OBBY.w, 0.6, OBBY.w, ART_HEX[a], { rough:0.45 });
        c.row = row; c.art = a; c.home = new V3(AO.x + x, AO.y + y - 0.3, AO.z + z); row.plats.push(c);
        const lab = textSprite(a.toUpperCase(), { size:0.6, color:'#fff' }); lab.position.set(AO.x + x, AO.y + y + 0.8, AO.z + z); this.group.add(lab); c.lab = lab;
      });
      row.sign = textSprite(w.po ? w.de + ' (Plural)' : w.de, { size:1, color:'#fff', bg:'rgba(10,16,32,.82)', border:'#ffc83d' });
      row.sign.position.set(AO.x, AO.y + y + 4.3, AO.z + z); this.group.add(row.sign);
      row.y = y; row.z = z; this.rows.push(row);
      z -= OBBY.dz; y += OBBY.rise;
    });
    const end = this.B(0, y - 0.5, z - 3, 13, 1, 10, '#4b5563'); end.end = true;
    const tro = portalModel('#ffc83d', '🏆 Ziel'); this.put(tro, 0, y, z - 5);
  }
  onRespawn(){ this.falling.forEach(c => { c.falling = false; c.active = true; colMoveTo(c, c.home.x, c.home.y, c.home.z); c.lab.visible = true; }); this.falling = []; }
  update(dt){
    this.baseUpdate(dt);
    this.lava.material.color.copy(lin(Math.sin(this.t * 2) > 0 ? '#ff6a1a' : '#ff7a2a'));
    for (const c of this.falling){ c.mesh.position.y -= dt * 14; c.lab.visible = false; }
    for (const r of this.rows) if (r.done) r.plats.forEach(c => { if (c.art !== r.art && c.mesh.position.y > c.home.y - 30) c.mesh.position.y -= dt * 8; });
    const g = P.grounded && P.ground;
    if (g){
      if (g.row && !g.row.done){
        const r = g.row, w = WMAP[r.id];
        if (g.art === r.art){
          r.done = true; r.plats.forEach(c => { if (c !== g){ c.active = false; c.lab.visible = false; } });
          if (!r.missed){ this.correct++; onAnswer('right', { id:r.id, type:'art' }); }
          SFX.ok(); speak(nounLabel(w)); popText(new V3(g.home.x, g.home.y + 2.5, g.home.z), `<b class="${artClass(w.art)}">${esc(nounLabel(w))}</b>`);
        } else if (!g.falling){
          if (!r.missed){ r.missed = true; onAnswer('wrong', { id:r.id, type:'art' }); }
          g.falling = true; g.active = false; this.falling.push(g); SFX.bad(); speak(nounLabel(w));
          banner(`✘ Es heißt <b class="${artClass(w.art)}">${esc(nounLabel(w))}</b>`, w.tip ? '💡 ' + esc(w.tip) : esc(w.es));
          this.bannerHold = 2.5;
        }
      }
      if (g.cp) P.checkpoint.copy(g.cp);
      if (g.end && !this._done){ SFX.win(); this.finish({ correct:this.correct, total:this.total, delay:600 }); }
    }
    this.bannerHold = (this.bannerHold || 0) - dt;
    const cur = this.rows.findIndex(r => !r.done);
    this.rows.forEach((r, i) => { r.sign.visible = i === cur; });
    if (this.bannerHold <= 0){
      if (cur >= 0){ const w = WMAP[this.rows[cur].id]; banner(`Welcher Artikel? <b>${esc(w.de)}</b>${w.po ? ' <small>(Plural)</small>' : ''}`, `<span class="art-der">der</span> · <span class="art-die">die</span> · <span class="art-das">das</span> — spring auf die richtige Farbe`); }
      else banner('Zum Ziel! 🏆');
    }
    astat(`⏱ ${hudTime(this.t)} · ✔ ${this.correct}/${this.total} · Reihe ${Math.max(0, cur) + (cur < 0 ? this.total : 1)}/${this.total}`);
  }
}

/* ============ DOOR RUN ============ */
function doorQ(q, max = 3){
  const opts = q.options.map(o => ({ text:stripTags(o.html), color:artColorOf(o.html), ok:o.val === q.correct }));
  const right = opts.filter(o => o.ok).slice(0, 1), wrong = shuffle(opts.filter(o => !o.ok)).slice(0, max - 1);
  return { prompt:q.prompt, say:q.say, opts:shuffle([...right, ...wrong]), id:q.id, explainEs:q.explainEs, answer:stripTags(q.answerHTML || ''), sayAfter:q.sayAfter, type:q.type };
}
class DoorRun extends Activity {
  constructor(title, qs, o = {}){ super(); this.title = title; this.qs = qs; this.total = qs.length; this.o = o; this.secs = []; this.cur = -1; }
  setup(){
    const sk = this.o.sky || ['#1d2547', '#6f7fb8']; setSky(sk[0], sk[1], sk[1], 50, 200);
    const pl = lavaPlane(this.group, 0, '#2a1a4a'); pl.position.set(AO.x, AO.y - 16, AO.z);
    this.B(0, -0.5, 2, 16, 1, 10, '#475569');
    this.spawn = this.W(0, 0.05, 4);
    this.qs.forEach((q, i) => {
      const z0 = -3 - i * 20, zw = z0 - 10.5;
      this.B(0, -0.5, z0 - 5.5, 16, 1, 11, i % 2 ? '#3b4a63' : '#415270');
      const n = q.opts.length, xs = n === 2 ? [-4, 4] : [-5.5, 0, 5.5];
      let x = -8;
      xs.forEach(cx => { const w = cx - 2 - x; if (w > 0.01) this.B(x + w / 2, 3.5, zw, w, 7, 1, '#1f2937'); this.B(cx, 5.9, zw, 4, 2.2, 1, '#1f2937'); x = cx + 2; });
      if (8 - x > 0.01) this.B(x + (8 - x) / 2, 3.5, zw, 8 - x, 7, 1, '#1f2937');
      const sec = { q, z0, zw, xs, cp:this.W(0, 0.05, z0 - 1), chosen:null, missed:false };
      q.opts.forEach((o, k) => {
        const cx = xs[k];
        [-2, 2].forEach(dx => mesh(G('box', 0.3, 4.8, 1.2), M('#ffc83d', { em:'#ffb31a', emi:0.4 }), AO.x + cx + dx, AO.y + 2.4, AO.z + zw, this.group));
        const sp = textSprite(o.text, { size:0.5, color:o.color, bg:'rgba(8,12,26,.88)', maxW:560 });
        sp.position.set(AO.x + cx, AO.y + 8.4 + (sp.scale.y - 0.7) / 2, AO.z + zw + 0.6); this.group.add(sp);
        if (o.ok) this.B(cx, -0.5, zw - 4.7, 4.2, 1, 9.4, '#415270');
      });
      this.secs.push(sec);
    });
    const endZ = -3 - this.qs.length * 20;
    const e = this.B(0, -0.5, endZ - 4, 16, 1, 10, '#475569'); e.end = true;
    this.put(portalModel('#ffc83d', '🏆 Ziel'), 0, 0, endZ - 6);
  }
  onRespawn(){ const s = this.secs[this.cur]; if (s) s.chosen = null; this.showQ(true); }
  showQ(force){
    const s = this.secs[this.cur]; if (!s) return;
    banner(`<span class="b-num">${this.cur + 1}/${this.total}</span> ${s.q.prompt}`, 'Lauf durch die richtige Tür!');
    if (s.q.say && !force) speak(s.q.say);
  }
  update(dt){
    this.baseUpdate(dt);
    const lz = P.pos.z - AO.z;
    const idx = this.secs.findIndex(s => lz <= s.z0 + 2 && lz > s.z0 - 20);
    if (idx >= 0 && idx !== this.cur){ this.cur = idx; P.checkpoint.copy(this.secs[idx].cp); this.showQ(); }
    const s = this.secs[this.cur];
    if (s && !s.chosen && Math.abs(lz - s.zw) < 0.7){
      const lx = P.pos.x - AO.x; const k = s.xs.findIndex(cx => Math.abs(lx - cx) < 2);
      if (k >= 0){
        const o = s.q.opts[k]; s.chosen = o;
        if (o.ok){
          if (!s.missed){ this.correct++; onAnswer('right', { id:s.q.id, type:s.q.type }); }
          SFX.ok(); popText(P.pos.clone().add(new V3(0, 3, 0)), '✔ ' + esc(o.text)); speak(s.q.sayAfter || o.text);
        } else {
          if (!s.missed){ s.missed = true; onAnswer('wrong', { id:s.q.id, type:s.q.type }); }
          SFX.bad(); speak(s.q.sayAfter || '');
          banner(`✘ Richtig ist: <b>${esc(s.q.answer || s.q.opts.find(x => x.ok).text)}</b>`, s.q.explainEs || '');
        }
      }
    }
    if (P.grounded && P.ground && P.ground.end && !this._done){ SFX.win(); this.finish({ correct:this.correct, total:this.total, delay:500 }); }
    astat(`${esc(this.title)} · ⏱ ${hudTime(this.t)} · ✔ ${this.correct}/${this.total}`);
  }
}

/* ============ DROHNEN-JAGD / ARENA ============ */
class DroneHunt extends Activity {
  constructor(ids, o = {}){ super(); this.pool = ids; this.endless = !!o.endless; this.total = o.n || 12; this.shooting = true; this.drones = []; this.k = 0; this.cur = null; this.fireT = 4; this.wait = 0; this.fallPenalty = false; }
  setup(){
    setSky('#101a3a', '#4f6aa8', '#2a3a6a', 60, 200);
    this.B(0, -0.5, 0, 44, 1, 44, '#232b3d');
    for (let k = -20; k <= 20; k += 5){ mesh(G('box', 44, 0.02, 0.08), M('#3de0ff', { basic:true }), AO.x, AO.y + 0.01, AO.z + k, this.group, false); mesh(G('box', 0.08, 0.02, 44), M('#3de0ff', { basic:true }), AO.x + k, AO.y + 0.01, AO.z, this.group, false); }
    [[-22, 0, 1, 44], [22, 0, 1, 44], [0, -22, 44, 1], [0, 22, 44, 1]].forEach(([x, z, sx, sz]) => this.B(x, 1, z, sx, 2, sz, '#3a4458'));
    [[-9, -6], [9, -6], [-12, 8], [12, 8], [0, 2]].forEach(([x, z]) => this.B(x, 1.25, z, 2.4, 2.5, 2.4, '#4b5570'));
    this.spawn = this.W(0, 0.05, 16);
    for (let i = 0; i < 5; i++){
      const d = { g:droneModel('#9aa4c7'), ph:i * 1.3, word:null, label:null, flash:0, hl:false };
      this.put(d.g, 0, 5, 0); registerShootable(d.g, () => this.hit(d), this.shoot); this.drones.push(d);
    }
    this.next();
  }
  modes(w){ const m = ['es2de', 'es2de', 'de2es']; if (w.def) m.push('def'); if (hasVoice(nounLabel(w))) m.push('audio'); return m; }
  next(){
    if (!this.endless && this.k >= this.total){ SFX.win(); this.finish({ correct:this.correct, total:this.total, delay:400 }); return; }
    const id = pick(pickWords(this.pool, 6)), w = WMAP[id], mode = pick(this.modes(w));
    const words = shuffle([w, ...distractors(w, 4)]);
    this.drones.forEach((d, i) => {
      d.word = words[i]; d.hl = false; d.g.visible = true; d.g.userData.eye.material = M('#ff5d6c', { em:'#ff5d6c', emi:1 });
      if (d.label){ d.g.remove(d.label); disposeTree(d.label); }
      const txt = mode === 'de2es' ? d.word.es : nounLabel(d.word);
      d.label = textSprite(txt, { size:0.5, color:mode === 'de2es' ? '#ffffff' : ART_TXT[d.word.art] || '#fff', maxW:520 }); d.label.position.set(0, 1.6, 0); d.g.add(d.label);
    });
    const P2 = { es2de:`Finde auf Deutsch: <span class="es-big">${esc(w.es)}</span>`, def:`Welches Wort passt? „${esc(w.def)}“`, audio:`Hör zu! ${speakBtn(nounLabel(w))} Welches Wort war das?`, de2es:`Was bedeutet ${wordHTML(w)}?` };
    banner(P2[mode], 'Schieß die richtige Drohne ab · die anderen schießen zurück!');
    if (mode === 'audio') speak(nounLabel(w));
    this.cur = { w, mode, tries:0 };
  }
  hit(d){
    if (!this.cur || this.wait > 0 || !d.g.visible) return;
    const w = this.cur.w, pos = d.g.getWorldPosition(new V3());
    if (d.word.id === w.id){
      if (this.cur.tries === 0){ this.correct++; onAnswer('right', { id:w.id }); } else grade(w.id, 'close');
      SFX.boom(); burst(pos, '#3de0ff', 30, 11); d.g.visible = false; speak(nounLabel(w));
      popText(pos, `✔ ${wordHTML(w)} = <i>${esc(w.es)}</i>`);
      this.k++; this.cur = null; this.wait = 0.8;
    } else {
      this.cur.tries++; if (this.cur.tries === 1) onAnswer('wrong', { id:w.id });
      SFX.bad(); d.flash = 0.5;
      banner(`✘ Das ist ${wordHTML(d.word)} = <i>${esc(d.word.es)}</i>`, `Gesucht: ${wordHTML(w)} — die goldene Drohne!`);
      speak(nounLabel(d.word));
      for (let i = 0; i < 2; i++) setTimeout(() => this.drones.includes(d) && fireOrb(d.g.getWorldPosition(new V3()), P.pos.clone().add(new V3((Math.random() - 0.5) * 2, 1.4, 0)), 11), i * 300);
      const good = this.drones.find(x => x.word.id === w.id); good.hl = true; good.g.userData.eye.material = M('#ffc83d', { em:'#ffc83d', emi:1.4 });
    }
  }
  update(dt){
    this.baseUpdate(dt);
    this.drones.forEach((d, i) => {
      const t = this.t * (0.35 + i * 0.04) + d.ph;
      d.g.position.set(AO.x + Math.sin(t) * (10 + i), AO.y + 4 + Math.sin(t * 2.3) * 1.5 + i * 0.4, AO.z + Math.cos(t * 1.3) * 9 - 2);
      d.g.rotation.y += dt * 1.5; d.flash = Math.max(0, d.flash - dt);
      d.g.scale.setScalar(d.hl ? 1.25 + Math.sin(this.t * 10) * 0.1 : d.flash > 0 ? 1.3 : 1);
    });
    if (this.wait > 0){ this.wait -= dt; if (this.wait <= 0) this.next(); }
    this.fireT -= dt;
    if (this.fireT <= 0 && this.cur){
      const d = pick(this.drones.filter(x => x.g.visible && x.word.id !== this.cur.w.id));
      if (d) fireOrb(d.g.getWorldPosition(new V3()), P.pos.clone().add(new V3(0, 1.4, 0)), 11 + Math.min(6, this.k * 0.3));
      this.fireT = Math.max(this.endless ? 0.9 : 1.6, 3.6 - this.k * 0.12);
    }
    if (S.hearts <= 0 && !this._done){ toast('💀 Keine Herzen mehr!', 'bad'); this.fail(); }
    astat(this.endless ? `Arena · Treffer: <b>${this.k}</b> · Rekord ${S.arenaBest}` : `⏱ ${hudTime(this.t)} · ✔ ${this.correct} · ${this.k}/${this.total}`);
  }
}

/* ============ BESCHRIFTEN-RAID ============ */
class LabelRaid extends Activity {
  constructor(key){ super(); this.key = key; this.D = DIAGRAMS[key]; this.total = this.D.labels.length + 5; this.state = {}; this.missed = {}; this.pads = []; this.crystals = []; this.carry = null; this.phase = 1; this.fallPenalty = false; }
  setup(){
    setSky('#23385a', '#a8c0dc', '#6a86aa', 60, 220);
    this.B(0, -0.5, 0, 40, 1, 36, '#39465c');
    [[-20, 0, 1, 36], [20, 0, 1, 36], [0, 18, 40, 1]].forEach(([x, z, sx, sz]) => this.B(x, 1, z, sx, 2, sz, '#2b3547'));
    // billboard
    this.cvs = document.createElement('canvas'); this.cvs.width = 1260; this.cvs.height = 900; this.ctx2 = this.cvs.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cvs); this.tex.encoding = THREE.sRGBEncoding; this.tex.anisotropy = 8;
    const bb = new THREE.Mesh(G('plane', 20, 14.3), new THREE.MeshBasicMaterial({ map:this.tex })); bb.userData.ownMat = true;
    this.put(bb, 0, 8.6, -16.5);
    this.B(0, 8.6, -17, 21, 15.3, 0.4, '#1f2937');
    [-9, 9].forEach(x => this.B(x, 0.8, -16.8, 0.6, 1.6, 0.6, '#1f2937'));
    this.redraw();
    const title = textSprite(this.D.title, { size:0.9, color:'#ffc83d' }); this.put(title, 0, 16.6, -16);
    const L = this.D.labels, n = L.length, row1 = Math.ceil(n / 2);
    L.forEach((l, i) => {
      const r = i < row1 ? 0 : 1, cnt = r ? n - row1 : row1, k = r ? i - row1 : i;
      const x = (k - (cnt - 1) / 2) * 4.6, z = r ? 0.5 : -6;
      const pad = mesh(G('cyl', 1.4, 1.5, 0.3, 12), M('#3a4150'), AO.x + x, AO.y + 0.15, AO.z + z, this.group);
      const num = textSprite(String(l.n), { size:1, color:'#fff' }); num.position.set(AO.x + x, AO.y + 1.4, AO.z + z); this.group.add(num);
      this.pads.push({ L:l, x, z, mesh:pad, state:'' });
    });
    const rng = Math.random;
    L.forEach(l => {
      let x, z, t = 0; do { x = -16 + rng() * 32; z = 7 + rng() * 8; t++; } while (t < 200 && this.crystals.some(c => Math.hypot(c.hx - x, c.hz - z) < 3.6));
      const g = new THREE.Group(); const a = labelText(l).split(' ')[0];
      mesh(G('oct', 0.55, 0), M(ART_HEX[a] || '#ffc83d', { em:ART_HEX[a] || '#ffc83d', emi:0.5, rough:0.3 }), 0, 0, 0, g);
      const sp = textSprite(labelText(l), { size:0.45, color:ART_TXT[a] || '#fff', maxW:620 }); sp.position.set(0, 1.1, 0); g.add(sp);
      this.put(g, x, 1.4, z);
      this.crystals.push({ L:l, g, hx:x, hz:z, placed:false, back:0 });
    });
    this.spawn = this.W(0, 0.05, 13);
    banner('Teil 1: Trag jedes Wort zur richtigen Nummer', 'Lauf in einen Kristall · dann auf die passende Nummer');
  }
  redraw(){ drawDiagram(this.ctx2, this.key, 1260, this.state); this.tex.needsUpdate = true; }
  update(dt){
    this.baseUpdate(dt);
    this.crystals.forEach((c, i) => {
      if (c.placed) return;
      if (c === this.carry){ c.g.position.set(P.pos.x, P.pos.y + 4, P.pos.z); c.g.rotation.y += dt * 3; return; }
      c.g.position.set(AO.x + c.hx, AO.y + 1.4 + Math.sin(this.t * 2 + i) * 0.25, AO.z + c.hz); c.g.rotation.y += dt;
    });
    if (this.phase === 1){
      if (!this.carry){
        const c = this.crystals.find(c => !c.placed && Math.hypot(P.pos.x - c.g.position.x, P.pos.z - c.g.position.z) < 1.6 && P.pos.y < AO.y + 3);
        if (c){ this.carry = c; SFX.pick(); speak(labelText(c.L)); }
      } else if (P.grounded){
        const pad = this.pads.find(p => Math.hypot(P.pos.x - (AO.x + p.x), P.pos.z - (AO.z + p.z)) < 1.5);
        if (pad && pad.state !== 'ok') this.drop(pad);
      }
      const left = this.crystals.filter(c => !c.placed).length;
      astat(`⏱ ${hudTime(this.t)} · Platziert ${this.D.labels.length - left}/${this.D.labels.length}`);
    } else if (this.phase === 2 && !this.asking && P.grounded){
      const pad = this.pads.find(p => p.state === 'todo' && Math.hypot(P.pos.x - (AO.x + p.x), P.pos.z - (AO.z + p.z)) < 1.5);
      if (pad) this.ask(pad);
    }
    this.pads.forEach(p => { if (p.state === 'todo') p.mesh.material = M(Math.sin(this.t * 6) > 0 ? '#ff9f1a' : '#ffc83d', { em:'#ff9f1a', emi:0.6 }); });
  }
  drop(pad){
    const c = this.carry, L = c.L;
    if (L.n === pad.L.n){
      c.placed = true; this.carry = null; c.g.position.set(AO.x + pad.x, AO.y + 1.2, AO.z + pad.z);
      pad.state = 'ok'; pad.mesh.material = M('#22c76b', { em:'#22c76b', emi:0.4 }); this.state[L.n] = 'ok'; this.redraw();
      if (!this.missed[L.n]){ this.correct++; onAnswer('right', { id:L.id }); } else grade(L.id, 'close');
      SFX.ok(); speak(labelText(L)); popText(c.g.position.clone().add(new V3(0, 1.5, 0)), '✔ ' + esc(labelText(L)));
      if (this.crystals.every(x => x.placed)) this.startPhase2();
    } else {
      if (!this.missed[L.n]){ this.missed[L.n] = true; onAnswer('wrong', { id:L.id }); }
      SFX.bad(); this.carry = null;
      banner(`✘ Nummer ${pad.L.n} ist nicht <b>${esc(labelText(L))}</b>`, `Tipp: Nummer ${pad.L.n} = <i>${esc(WMAP[pad.L.id].es)}</i> · ${esc(labelText(L))} = <i>${esc(WMAP[L.id].es)}</i>`);
      this.state[pad.L.n] = 'bad'; this.redraw(); setTimeout(() => { if (this.state[pad.L.n] === 'bad'){ delete this.state[pad.L.n]; this.redraw(); } }, 900);
    }
  }
  startPhase2(){
    this.phase = 2; SFX.win();
    this.todo = sample(this.pads, 5); this.todo.forEach(p => { p.state = 'todo'; this.state[p.L.n] = 'hi'; });
    this.crystals.forEach(c => { if (this.todo.some(p => p.L.n === c.L.n)) c.g.visible = false; });
    this.redraw();
    banner('Teil 2: Schreib-Phase ✍️', 'Lauf auf eine <b>orange</b> Nummer und schreib das Wort mit Artikel');
    astat('Schreib-Phase · 0/5');
  }
  async ask(pad){
    this.asking = true; P.frozen = true; const L = pad.L;
    const q = { type:'type', id:L.id, prompt:`Was ist Nummer <b>${L.n}</b>? (mit Artikel)`, media:diagramSVG(this.key, { hi:L.n, only:[L.n] }), accept:labelAccepts(L), answerHTML:labelHTML(L),
      explain:wordExplain(WMAP[L.id]), explainEs:wordTip(WMAP[L.id]), es:`Escribe el nombre del número ${L.n} con su artículo.`, sayAfter:labelText(L), placeholder:'der / die / das + Wort' };
    openModal(`<div class="series-head"><h2>✍️ Schreib-Phase</h2></div><div id="qmount"></div>`, 'wide');
    const r = await askQ(q, $('#qmount'));
    closeModal();
    if (r.result === 'right') this.correct++; else if (r.result === 'close') this.correct += 0.5;
    pad.state = 'ok'; pad.mesh.material = M(r.result === 'wrong' ? '#ff4d5e' : '#22c76b'); this.state[L.n] = 'ok'; this.redraw();
    const c = this.crystals.find(x => x.L.n === L.n); if (c){ c.g.visible = true; }
    const done = this.todo.filter(p => p.state === 'ok').length;
    astat(`Schreib-Phase · ${done}/5`);
    P.frozen = false; this.asking = false;
    if (done === 5) this.finish();
  }
}

/* ============ SCHNABEL-BLASTER ============ */
class BeakBlaster extends Activity {
  constructor(){ super(); this.total = 18; this.shooting = true; this.sel = 0; this.queue = Array.from({ length:this.total }, () => { const b = pick(BEAKS); return { b, f:pick(b.foods) }; }); this.active = []; this.spawnT = 1; this.done2 = 0; this.said = {}; this.fallPenalty = false; }
  setup(){
    setSky('#4f8f5a', '#dcefc8', '#8fbf8a', 60, 200);
    this.B(0, -0.5, 0, 44, 1, 44, '#3f7d3a');
    for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2; treePine(this.group, [], AO.x + Math.cos(a) * 24, AO.y, AO.z + Math.sin(a) * 24, 1.4); }
    this.spawn = this.W(0, 0.05, 14);
    this.bar();
  }
  bar(){
    ammoBar(BEAKS.map((b, i) => `<button class="beak ${i === this.sel ? 'on' : ''}" data-beak="${i}" type="button"><kbd>${i + 1}</kbd><b>${esc(b.name)}</b><small>${esc(b.beakShort)}</small></button>`).join(''));
    $$('[data-beak]').forEach(x => x.onclick = e => { e.stopPropagation(); this.sel = +x.dataset.beak; SFX.click(); this.bar(); });
    banner(`Schnabel: <b>${esc(BEAKS[this.sel].art + ' ' + BEAKS[this.sel].name)}</b> · ${esc(BEAKS[this.sel].beakName)}`, 'Wähle mit 1–6 den Schnabel, der zum Futter passt, und schieß!');
  }
  tracerCol(){ return BEAKS[this.sel].col.beak; }
  onKey(e){ const m = e.code.match(/^(Digit|Numpad)([1-6])$/); if (m){ this.sel = +m[2] - 1; SFX.click(); this.bar(); return true; } return false; }
  onWheel(dy){ this.sel = (this.sel + (dy > 0 ? 1 : 5)) % 6; this.bar(); }
  update(dt){
    this.baseUpdate(dt);
    this.spawnT -= dt;
    if (this.queue.length && this.spawnT <= 0 && this.active.length < 2){
      const it = this.queue.shift();
      const sp = textSprite(`${it.f.e} ${it.f.n}`, { size:0.9, color:'#fff', bg:'rgba(20,30,20,.75)' });
      it.g = new THREE.Group(); it.g.add(sp); this.group.add(it.g);
      it.x0 = -18 + Math.random() * 36; it.x1 = -18 + Math.random() * 36; it.t = 0; it.dur = Math.max(5, 8 - this.done2 * 0.15);
      registerShootable(it.g, () => this.hit(it), this.shoot);
      this.active.push(it); this.spawnT = Math.max(1.6, 3.4 - this.done2 * 0.1);
    }
    for (const it of this.active){
      it.t += dt / it.dur; const u = it.t;
      it.g.position.set(AO.x + lerp(it.x0, it.x1, u), AO.y + 2.5 + Math.sin(Math.PI * u) * 6, AO.z + lerp(-20, 8, u));
      if (u >= 1 && !it.res){ it.res = true; this.done2++; SFX.bad(); popText(it.g.position.clone(), `Verpasst: ${it.f.e} → ${esc(it.b.name)}`, 'bad'); }
    }
    this.active = this.active.filter(it => { if (it.res){ this.group.remove(it.g); disposeTree(it.g); this.shoot = this.shoot.filter(s => s.obj !== it.g); return false; } return true; });
    if (!this.queue.length && !this.active.length && !this._done){ SFX.win(); this.finish({ correct:this.correct, total:this.total, delay:400 }); }
    astat(`⏱ ${hudTime(this.t)} · Gefangen ${this.correct}/${this.total}`);
  }
  hit(it){
    if (it.res) return; it.res = true; this.done2++;
    const pos = it.g.position.clone();
    if (BEAKS[this.sel] === it.b){
      this.correct++; onAnswer('right', { id:it.b.id }); SFX.boom(); burst(pos, '#a6ff4d', 24, 9);
      const s = beakSentence(it.b); popText(pos, `✔ ${it.f.e}`);
      banner(esc(s), esc(it.b.es)); if (!this.said[it.b.id]){ this.said[it.b.id] = 1; speak(s); }
    } else {
      onAnswer('wrong', { id:it.b.id }); SFX.bad(); popText(pos, '✘ falscher Schnabel', 'bad');
      banner(`✘ ${it.f.e} ${esc(it.f.n)} frisst <b>${esc(it.b.art.toLowerCase() + ' ' + it.b.name)}</b> (Taste ${BEAKS.indexOf(it.b) + 1})`, `${esc(it.b.beakName)} — ${esc(it.b.es)}`);
    }
  }
}

/* ============ MERKMAL-JAGD ============ */
class Collector extends Activity {
  constructor(){ super(); this.total = 12; this.shooting = true; this.hits = 0; this.got = 0; this.scrolls = []; this.ghosts = []; this.fallPenalty = false; }
  setup(){
    setSky('#9cc8ee', '#f4f9ff', '#dfeaf5', 50, 190);
    this.B(0, -0.5, 0, 52, 1, 46, '#eef3f7');
    [[-26, 0, 1, 46], [26, 0, 1, 46], [0, -23, 52, 1], [0, 23, 52, 1]].forEach(([x, z, sx, sz]) => this.B(x, 1.5, z, sx, 3, sz, '#b9c3cf'));
    for (let i = 0; i < 8; i++) rock(this.group, this.cols, AO.x - 20 + Math.random() * 40, AO.y, AO.z - 16 + Math.random() * 30, 1.3, '#9aa4b1');
    MERKMALE.forEach((m, i) => {
      let x, z, t = 0; do { x = -21 + Math.random() * 42; z = -19 + Math.random() * 34; t++; } while (t < 300 && (this.scrolls.some(s => Math.hypot(s.x - x, s.z - z) < 7) || Math.hypot(x, z - 18) < 6));
      const g = new THREE.Group();
      mesh(G('cyl', 0.35, 0.35, 1.4, 8), M('#ffd66b', { em:'#ffb31a', emi:0.5 }), 0, 0, 0, g).rotation.z = Math.PI / 2;
      const sp = textSprite(m.short, { size:0.5, color:'#fff', bg:'rgba(120,80,0,.85)', maxW:520 }); sp.position.set(0, 1.3, 0); g.add(sp);
      this.put(g, x, 1.2, z); this.scrolls.push({ m, g, x, z, got:false });
    });
    sample(FAKES, 4).forEach((f, i) => {
      const g = new THREE.Group();
      mesh(G('sph', 0.9, 12, 10), M('#7b4bb3', { opacity:0.75, flat:false }), 0, 0, 0, g);
      [-1, 1].forEach(s => mesh(G('sph', 0.18, 8, 6), M('#ffffff', { em:'#ffffff', emi:0.5 }), s * 0.3, 0.2, 0.75, g, false));
      const sp = textSprite('Vögel ' + f.de, { size:0.42, color:'#ffd6ff', bg:'rgba(50,10,70,.8)', maxW:520 }); sp.position.set(0, 1.5, 0); g.add(sp);
      const gh = { f, g, stun:0, x:(i % 2 ? 1 : -1) * 15, z:-15 + i * 4 };
      this.put(g, gh.x, 1.6, gh.z); registerShootable(g, () => { gh.stun = 4; SFX.hit(); burst(g.getWorldPosition(new V3()), '#b26bff', 16, 8); popText(g.getWorldPosition(new V3()), `Lüge! ${esc(f.es)}`); }, this.shoot);
      this.ghosts.push(gh);
    });
    this.spawn = this.W(0, 0.05, 18);
    banner('Sammle die 10 echten Merkmale der Vögel', 'Die lila Geister erzählen Lügen: ausweichen oder abschießen!');
  }
  update(dt){
    this.baseUpdate(dt);
    this.scrolls.forEach((s, i) => { if (s.got) return; s.g.position.y = AO.y + 1.2 + Math.sin(this.t * 2 + i) * 0.25; s.g.rotation.y += dt;
      if (Math.hypot(P.pos.x - s.g.position.x, P.pos.z - s.g.position.z) < 1.8 && P.pos.y < AO.y + 3){
        s.got = true; s.g.visible = false; this.got++; SFX.pick(); speak(s.m.de); addFeathers(2); popText(s.g.position.clone(), '✔ ' + esc(s.m.short));
        banner(`✔ ${esc(s.m.de)}`, esc(s.m.es));
        if (this.got === MERKMALE.length) this.part2();
      } });
    this.ghosts.forEach(gh => {
      const g = gh.g; gh.stun = Math.max(0, gh.stun - dt);
      g.children[0].material = gh.stun > 0 ? M('#8a8a9a', { opacity:0.6, flat:false }) : M('#7b4bb3', { opacity:0.75, flat:false });
      if (gh.stun <= 0 && !this.p2){
        const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, d = Math.hypot(dx, dz) || 1, sp = 3.3 + this.got * 0.15;
        g.position.x += dx / d * sp * dt; g.position.z += dz / d * sp * dt; g.position.y = AO.y + 1.6 + Math.sin(this.t * 3) * 0.3;
        if (d < 1.5 && P.inv <= 0){
          P.inv = 1.2; this.hits++; hurt(1); banner(`✘ „Vögel ${esc(gh.f.de)}“ ist eine Lüge!`, esc(gh.f.es));
          P.vel.x = dx / d * 16; P.vel.z = dz / d * 16; P.vel.y = 7;
          if (S.hearts <= 0 && !this._done){ this.fail(); }
        }
      }
    });
    astat(`⏱ ${hudTime(this.t)} · Merkmale ${this.got}/10 · Lügen-Treffer ${this.hits}`);
  }
  async part2(){
    this.p2 = true; P.frozen = true; SFX.win();
    let pts = 0;
    const qs = [qMerkmalFly(), qMerkmalFly(), { type:'mc', prompt:'Warum können der Strauß, der Emu, der Pinguin und der Kiwi nicht fliegen?', options:shuffle([
      { html:'Sie sind zu schwer.', val:'ok' }, { html:'Sie haben keine Flügel.', val:'a' }, { html:'Sie haben keine Federn.', val:'b' }, { html:'Sie sind wechselwarm.', val:'c' }]), correct:'ok',
      answerHTML:'Sie sind zu schwer.', explainEs:'Son demasiado pesados (zu schwer). ¡Sí tienen alas y plumas!', es:'¿Por qué no pueden volar?', sayAfter:'Sie sind zu schwer.' }];
    openModal(`<div class="series-head"><h2>Bonus-Fragen</h2></div><div id="qmount"></div>`);
    for (const q of qs){ const r = await askQ(q, $('#qmount')); if (r.result === 'right') pts++; }
    closeModal(); P.frozen = false;
    this.correct = 10 * 10 / (10 + this.hits) * 0.9 + pts * (3 / 3); this.total = 12;
    this.finish();
  }
}
function qMerkmalFly(){
  const fl = WMAP[pick(FLIGHTLESS)]; const ys = sample(FLYERS, 3).map(id => WMAP[id]);
  return { type:'mc', id:fl.id, prompt:'Welcher Vogel kann <b>nicht</b> fliegen?', options:mcWords(fl, ys, x => wordHTML(x)), correct:fl.id, answerHTML:wordHTML(fl),
    explainEs:'No pueden volar: avestruz, emú, pingüino y kiwi (son demasiado pesados).', es:'¿Qué ave NO puede volar?', sayAfter:nounLabel(fl) };
}

/* ============ BOSS ============ */
function wq(ids, kinds){ return qFromWord(pick(pickWords(ids, 5)), kinds); }
function qFix(item){
  return { type:'mc', prompt:`Welches Wort ist richtig?<div class="def">„${esc(item.s)}“</div>`, options:shuffle(item.o.map(o => ({ html:esc(o), val:o }))), correct:item.a,
    answerHTML:`<b>${esc(item.a)}</b>`, explain:esc(item.s.replace('___', item.a)), explainEs:esc(item.es), es:'¿Qué palabra es correcta?', sayAfter:item.s.replace('___', item.a) };
}
function bossQ(z, phase){
  const r = Math.random();
  if (z <= 3){
    const key = ZONES[z].topic, ids = topicIds(key), tf = TF.filter(x => x.t === key);
    if (phase === 0) return r < 0.35 ? qLabel(key) : wq(ids, ['es2de', 'de2es', 'art', 'def']);
    if (phase === 1) return r < 0.4 ? qLabel(key) : r < 0.7 ? qTF(pick(tf)) : wq(ids, ['art', 'ex', 'audio']);
    return r < 0.5 ? qLabelType(key) : wq(ids, ['type']);
  }
  if (z === 4){
    const ids = topicIds('schnabel');
    if (phase === 0) return qBeak();
    if (phase === 1) return r < 0.5 ? qBeak() : qTF(pick(TF.filter(x => x.t === 'schnabel')));
    return r < 0.45 ? wq(ids.filter(id => WMAP[id].art), ['type']) : r < 0.75 ? qFix(pick(BEAK_FIX)) : qBeak();
  }
  const ids = topicIds('merkmale');
  if (phase === 0) return qMerkmal();
  if (phase === 1) return r < 0.55 ? qTF(pick(TF.filter(x => x.t === 'merkmale'))) : qMerkmal();
  return r < 0.5 ? wq(ids, ['type']) : qMerkmal();
}
class BossFight extends Activity {
  constructor(z){ super(); this.z = z; this.Bdef = BOSSES[z]; this.hp = this.Bdef.hp; this.max = this.Bdef.hp; this.shooting = true; this.qCool = 3; this.volT = 3; this.waveT = 9; this.answers = []; this.q = null; this.waves = []; }
  setup(){
    const sk = ISL[this.z].sky; setSky(shadeHex(sk[0], -40), sk[1], sk[1], 60, 220);
    const pl = lavaPlane(this.group, 0, '#ff6a1a'); pl.position.set(AO.x, AO.y - 16, AO.z);
    this.B(0, -1, 0, 50, 2, 50, shadeHex(ISL[this.z].side, 10));
    mesh(G('box', 50.2, 0.2, 50.2), M(ISL[this.z].top), AO.x, AO.y - 0.05, AO.z, this.group, false);
    [[-14, -6], [14, -6], [-14, 10], [14, 10]].forEach(([x, z]) => this.B(x, 2, z, 2.4, 4, 2.4, '#5a6272'));
    this.boss = bossModel(this.Bdef.kind); this.put(this.boss.root, 0, 0, -17);
    registerShootable(this.boss.root, p => { popText(p, 'Nur richtige Antworten verletzen mich!', 'bad'); }, this.shoot);
    this.spawn = this.W(0, 0.05, 16);
    banner(`${esc(this.Bdef.name)}: „${esc(this.Bdef.intro[0])}“`, esc(this.Bdef.intro[1])); speak(this.Bdef.intro[0]);
  }
  phase(){ const f = this.hp / this.max; return f > 0.66 ? 0 : f > 0.33 ? 1 : 2; }
  cleanup(){ this.answers.forEach(a => this.group.remove(a.g)); }
  update(dt){
    this.baseUpdate(dt);
    const ph = this.phase(), b = this.boss.root;
    this.boss.update(this.t);
    b.position.x = AO.x + Math.sin(this.t * 0.45) * 9;
    b.rotation.y = Math.atan2(P.pos.x - b.position.x, P.pos.z - b.position.z);
    if (this.hitFlash > 0){ this.hitFlash -= dt; b.scale.setScalar(1 + this.hitFlash * 0.3); } else b.scale.setScalar(1);
    const mouth = b.position.clone().add(new V3(0, 6, 3));
    if (!this.typing){
      this.volT -= dt;
      if (this.volT <= 0){ const n = 1 + ph; for (let i = 0; i < n; i++) setTimeout(() => !this._done && !this.typing && fireOrb(mouth.clone(), P.pos.clone().add(new V3((i - n / 2) * 1.5, 1.4, 0)), 9.5 + ph * 1.5), i * 260); this.volT = 4.6 - ph * 0.6; }
      if (ph >= 1){ this.waveT -= dt; if (this.waveT <= 0){ this.wave(); this.waveT = 10 - ph; } }
    }
    for (let i = this.waves.length - 1; i >= 0; i--){
      const w = this.waves[i]; w.r += dt * 11; w.m.scale.set(w.r, w.r, 1); w.m.material.opacity = Math.max(0, 0.8 - w.r / 40);
      const d = Math.hypot(P.pos.x - w.c.x, P.pos.z - w.c.z);
      if (!w.hit && Math.abs(d - w.r) < 0.9 && P.pos.y - AO.y < 0.7 && P.inv <= 0){ w.hit = true; P.inv = 1; hurt(1); P.vel.y = 8; }
      if (w.r > 40){ this.group.remove(w.m); this.waves.splice(i, 1); }
    }
    if (!this.q && !this.typing){ this.qCool -= dt; if (this.qCool <= 0) this.ask(); }
    this.answers.forEach((a, i) => { a.g.position.y = AO.y + a.y + Math.sin(this.t * 2 + i) * 0.3; a.g.rotation.y += dt; if (a.hl) a.g.scale.setScalar(1.2 + Math.sin(this.t * 10) * 0.12); });
    if (this.hp <= 0 && !this._done){ SFX.win(); burst(b.position.clone().add(new V3(0, 5, 0)), '#ffc83d', 80, 16); this.finish({ won:true, delay:1500 }); b.visible = false; }
    if (S.hearts <= 0 && !this._done){ this.finish({ won:false, delay:600 }); }
    const hpPct = Math.max(0, this.hp / this.max * 100);
    astat(`<div class="bossbar"><span>${esc(this.Bdef.name)}</span><div class="bar"><i style="width:${hpPct}%"></i></div><small>Phase ${ph + 1}/3</small></div>`);
  }
  wave(){
    const m = new THREE.Mesh(G('ring', 0.93, 1, 48), new THREE.MeshBasicMaterial({ color:lin('#ff5d6c'), transparent:true, opacity:0.8, side:THREE.DoubleSide }));
    m.userData.ownMat = true; m.rotation.x = -Math.PI / 2; const c = this.boss.root.position.clone(); m.position.set(c.x, AO.y + 0.2, c.z); this.group.add(m);
    this.waves.push({ m, r:1, c, hit:false }); SFX.boss();
    popText(c.clone().add(new V3(0, 3, 0)), 'Schockwelle — SPRING!', 'bad');
  }
  async ask(){
    const q = bossQ(this.z, this.phase());
    if (q.type === 'type'){
      this.typing = true; P.frozen = true; clearOrbs();
      openModal(`<div class="series-head"><h2>⚡ Schwachstelle! Schreib die Antwort</h2></div><p class="sub">Richtig = doppelter Schaden. Falsch = der Boss trifft dich.</p><div id="qmount"></div>`, 'wide');
      const r = await askQ(q, $('#qmount'), { timeLimit:30 });
      closeModal(); P.frozen = false; this.typing = false; this.qCool = 2;
      if (r.result === 'right') this.damage(2, true); else if (r.result === 'close') this.damage(1, false); else { hurt(1); }
      return;
    }
    let opts = q.options.map(o => ({ text:stripTags(o.html), color:artColorOf(o.html), ok:o.val === q.correct, art:(/art-(der|die|das)/.exec(o.html) || [])[1] || (q.type === 'art' ? o.val : null) }));
    const right = opts.filter(o => o.ok).slice(0, 1), wrong = shuffle(opts.filter(o => !o.ok)).slice(0, q.type === 'tf' ? 1 : 2);
    opts = shuffle([...right, ...wrong]);
    const spots = opts.length === 2 ? shuffle([[-8, 3], [8, 3]]) : shuffle([[-12, 3], [0, 1], [12, 3]]);
    this.answers = opts.map((o, i) => {
      const g = new THREE.Group(); const col = o.art ? ART_HEX[o.art] : ['#3de0ff', '#a6ff4d', '#ffc83d'][i % 3];
      mesh(G('ico', 1.1, 1), M(col, { em:col, emi:0.5, rough:0.3 }), 0, 0, 0, g);
      const sp = textSprite(o.text, { size:0.5, color:'#fff', bg:'rgba(8,12,26,.85)', maxW:560 }); sp.position.set(0, 1.9, 0); g.add(sp);
      const a = { g, o, y:2.8 + Math.random() * 1.2 }; this.put(g, spots[i][0], a.y, spots[i][1]);
      registerShootable(g, () => this.answerHit(a), this.shoot); return a;
    });
    banner(`${q.media ? `<span class="b-media">${q.media}</span>` : ''}${q.prompt}`, 'Schieß auf die richtige Antwort!');
    if (q.say) speak(q.say);
    this.q = { q, t0:this.t, tries:0 };
  }
  answerHit(a){
    if (!this.q || !this.answers.includes(a)) return;
    const pos = a.g.getWorldPosition(new V3());
    if (a.o.ok){
      const first = this.q.tries === 0, fast = first && this.t - this.q.t0 < 7;
      if (first) onAnswer('right', this.q.q); else if (this.q.q.id) grade(this.q.q.id, 'close');
      if (this.q.q.sayAfter) speak(this.q.q.sayAfter);
      this.clearAnswers(); this.damage(first ? (fast ? 2 : 1) : 0.5, fast);
      this.q = null; this.qCool = 1.6;
    } else {
      this.q.tries++; if (this.q.tries === 1) onAnswer('wrong', this.q.q);
      SFX.bad(); burst(pos, '#ff5d6c', 20, 9); this.group.remove(a.g); this.answers = this.answers.filter(x => x !== a);
      const good = this.answers.find(x => x.o.ok); if (good) good.hl = true;
      banner(`✘ Richtig ist: <b>${esc(stripTags(this.q.q.answerHTML || ''))}</b>`, this.q.q.explainEs || '');
      const m = this.boss.root.position.clone().add(new V3(0, 6, 3));
      for (let i = 0; i < 3; i++) setTimeout(() => !this._done && fireOrb(m.clone(), P.pos.clone().add(new V3((i - 1) * 1.6, 1.4, 0)), 12), i * 200);
    }
  }
  clearAnswers(){ this.answers.forEach(a => this.group.remove(a.g)); this.shoot = this.shoot.filter(s => !this.answers.some(a => a.g === s.obj)); this.answers = []; }
  damage(n, crit){
    this.hp = Math.max(0, this.hp - n); this.hitFlash = 0.4; SFX.boom();
    const p = this.boss.root.position.clone().add(new V3(0, 7, 0)); burst(p, crit ? '#ffc83d' : '#ffffff', crit ? 40 : 20, 12);
    popText(p, `${crit ? 'KRITISCH! ' : ''}-${n}`, crit ? 'crit' : '');
    banner(crit ? '💥 Kritischer Treffer!' : '✔ Treffer!', '');
  }
}

/* ============ QUESTION SETS FOR DOOR RUNS ============ */
function foodRunQs(){
  const path = ['schnabel', 'kropf', 'druesenmagen', 'kaumagen', 'darm', 'kloake'];
  const organs = ['kropf', 'druesenmagen', 'kaumagen', 'darm', 'kloake', 'niere', 'lunge', 'luftroehre'];
  const lab = id => id === 'luftsack' ? 'die Luftsäcke' : nounLabel(WMAP[id]);
  const qs = [];
  for (let i = 1; i < path.length; i++){
    const id = path[i], prev = path.slice(0, i).map(x => WMAP[x].de).join(' → ');
    const wrong = sample(organs.filter(o => o !== id && !path.slice(0, i).includes(o)), 2);
    qs.push({ prompt:`Weg der Nahrung: ${esc(prev)} → <b>?</b>`, opts:shuffle([{ text:lab(id), color:ART_TXT[WMAP[id].art], ok:true }, ...wrong.map(w => ({ text:lab(w), color:ART_TXT[WMAP[w].art], ok:false }))]),
      id, answer:lab(id), explainEs:wordTip(WMAP[id]) || WMAP[id].es, sayAfter:lab(id) });
  }
  const air = [['Die Luft kommt von außen zuerst in …', 'luftroehre', ['kropf', 'darm']], ['Die Luftröhre bringt die Luft zur …', 'lunge', ['niere', 'kaumagen']], ['Die Lunge hat mehrere …', 'luftsack', ['druesenmagen', 'niere']]];
  air.forEach(([p, id, wr]) => qs.push({ prompt:esc(p), opts:shuffle([{ text:lab(id), color:ART_TXT[id === 'luftsack' ? 'die' : WMAP[id].art], ok:true }, ...wr.map(w => ({ text:lab(w), color:ART_TXT[WMAP[w].art], ok:false }))]),
    id, answer:lab(id), explainEs:WMAP[id].es, sayAfter:lab(id) }));
  return qs;
}
function beakRunQs(){ return [...Array.from({ length:8 }, () => doorQ(qBeak())), ...sample(BEAK_FIX, 3).map(f => doorQ(qFix(f)))]; }
function tfRunQs(){
  return shuffle([...sample(TF.filter(t => t.t === 'merkmale'), 6), ...sample(TF.filter(t => t.t !== 'merkmale'), 6)]).map(t => ({
    prompt:`Richtig oder falsch? „${esc(t.s)}“`, opts:[{ text:'✔ Richtig', color:'#a6ff4d', ok:t.a }, { text:'✘ Falsch', color:'#ff9aa3', ok:!t.a }],
    answer:t.a ? 'Richtig' : 'Falsch' + (t.why ? ' — ' + t.why : ''), explainEs:t.es, sayAfter:t.a ? t.s : t.why }));
}
function dailyQs(){
  const ids = unlockedTopics().flatMap(t => topicIds(t));
  return pickWords(ids, 10).map(id => doorQ(qFromWord(id, ['es2de', 'de2es', 'art', 'def', 'ex', 'audio'])));
}
function weakIds(){
  const ts = unlockedTopics();
  const seen = WORDS.filter(w => ts.includes(w.t) && S.words[w.id] && S.words[w.id].b > 0 && S.words[w.id].b <= 2).map(w => w.id);
  return seen.length >= 8 ? seen : ts.flatMap(t => topicIds(t));
}

/* ============ CODE-TERMINAL (typing) ============ */
async function terminalStation(z, def){
  const ids = pickWords(topicIds(def.arg, w => !w.po), 6);
  const qs = ids.map((id, k) => (k % 2 && hasVoice(nounLabel(WMAP[id])) ? MAKERS.dictation : MAKERS.type)(WMAP[id]));
  let correct = 0, total = 0;
  const locks = n => `<div class="locks">${Array.from({ length:qs.length }, (_, i) => `<span class="${i < n ? 'open' : ''}">${i < n ? '🔓' : '🔒'}</span>`).join('')}</div>`;
  for (let i = 0; i < qs.length; i++){
    openModal(`<div class="term-head"><span>CODE-TERMINAL // ${esc(ZONES[z].name.toUpperCase())}</span>${locks(i)}</div><div id="qmount"></div>`, 'wide terminal');
    const r = await askQ(qs[i], $('#qmount'), { timeLimit:30 });
    total++; if (r.result === 'right') correct++; else if (r.result === 'close') correct += 0.5;
  }
  if (def.cloze){ const r = await clozePart(def.cloze); correct += r.c; total += r.n; }
  if (z === 4){ const r = await sentenceParts(3); correct += r.c; total += r.n; }
  closeModal();
  return { correct, total };
}
function parseCloze(text){
  const out = []; const re = /\[\[(.+?)\]\]/g; let last = 0, m;
  while ((m = re.exec(text))){ if (m.index > last) out.push({ t:text.slice(last, m.index) }); const [shown, id] = m[1].split('|'); out.push({ blank:true, shown, id:id || idOf(shown) }); last = re.lastIndex; }
  if (last < text.length) out.push({ t:text.slice(last) });
  return out;
}
function clozePart(key){
  const C = CLOZE[key], text = pick(C.parts), toks = parseCloze(text), blanks = toks.filter(t => t.blank);
  const topic = WMAP[blanks[0].id] ? WMAP[blanks[0].id].t : 'aussen';
  const extra = sample(WORDS.filter(w => w.t === topic && !blanks.some(b => b.shown === w.de) && w.art), 2).map(w => w.de);
  const bank = shuffle([...blanks.map(b => ({ text:b.shown })), ...extra.map(t => ({ text:t }))]);
  const fill = new Array(blanks.length).fill(null); let sel = 0, checked = false; const res = { c:0, n:blanks.length };
  return new Promise(done => {
    const render = () => {
      let bi = 0;
      const body = toks.map(t => { if (!t.blank) return esc(t.t); const k = bi++, f = fill[k];
        const cls = checked ? (f != null && bank[f].text === blanks[k].shown ? 'ok' : 'bad') : (k === sel ? 'sel' : '');
        return `<button class="gap ${cls}" type="button" data-k="${k}">${f != null ? esc(bank[f].text) : '&nbsp;'}</button>${checked && cls === 'bad' ? `<span class="fix">${esc(blanks[k].shown)}</span>` : ''}`; }).join('');
      const used = new Set(fill.filter(x => x != null));
      openModal(`<div class="term-head"><span>ENTSCHLÜSSELN // ${esc(C.title.toUpperCase())} (${esc(C.src)})</span></div>
        <p class="sub">Der Text aus deinem Arbeitsblatt ist beschädigt. Klicke eine Lücke und dann ein Wort. <span class="es-inline">Haz clic en un hueco y luego en una palabra.</span></p>
        <div class="cloze">${body}</div><div class="chips">${bank.map((b, i) => `<button class="chip" type="button" data-i="${i}" ${used.has(i) || checked ? 'disabled' : ''}>${esc(b.text)}</button>`).join('')}</div>
        <div class="fb-actions">${checked ? `<span class="score-note">✔ ${res.c} / ${blanks.length}</span><button class="btn" id="cz-next" type="button">Weiter ⏎</button>` : `<button class="btn ghost" id="cz-clear" type="button">Leeren</button><button class="btn" id="cz-check" type="button" ${fill.includes(null) ? 'disabled' : ''}>Prüfen</button>`}</div>`, 'wide terminal');
      $$('.gap', sheet).forEach(b => b.onclick = () => { if (checked) return; const k = +b.dataset.k; fill[k] = null; sel = k; render(); });
      $$('.chip', sheet).forEach(b => b.onclick = () => { if (checked) return; const i = +b.dataset.i; fill[sel] = i; SFX.click(); speak(bank[i].text); const nx = fill.findIndex(x => x == null); sel = nx >= 0 ? nx : sel; render(); });
      if (checked) $('#cz-next').onclick = () => { pop(); done(res); };
      else { $('#cz-check').onclick = check; $('#cz-clear').onclick = () => { fill.fill(null); sel = 0; render(); }; }
    };
    const check = () => { checked = true; blanks.forEach((b, k) => { const ok = fill[k] != null && bank[fill[k]].text === b.shown; if (ok) res.c++; if (b.id) onAnswer(ok ? 'right' : 'wrong', { id:b.id }); }); res.c === blanks.length ? SFX.win() : SFX.bad(); render(); };
    const pop = pushKeys(e => { if (e.code === 'Enter'){ if (checked){ pop(); done(res); } else if (!fill.includes(null)) check(); return true; } return false; });
    render();
  });
}
async function sentenceParts(n){
  let score = 0; const birds = sample(BEAKS, n);
  for (const b of birds){
    const target = [`${b.art} ${b.name}`, 'hat', 'einen', b.adj, b.noun, 'um', b.foodTile, 'zu fressen.'];
    const base = b.adj.replace(/en$/, ''), other = pick(BEAKS.filter(x => x !== b));
    const bank = shuffle([...target, base + 'er', base, other.foodTile, 'für']);
    let pos = 0, mistakes = 0; const used = new Set();
    const m = await new Promise(done => {
      const render = () => {
        openModal(`<div class="term-head"><span>SATZ-CODE // ${esc(b.art + ' ' + b.name).toUpperCase()}</span></div>
          <p class="sub">Baue den Satz wie im Test: Welcher Schnabel, und wozu? <span class="es-inline">(${esc(WMAP[b.id].es)}: ${esc(b.es)})</span></p>
          <div class="sent-line">${target.slice(0, pos).map(t => `<span class="tok ok">${esc(t)}</span>`).join(' ')} ${pos < target.length ? '<span class="tok cursor">▌</span>' : ' ✔'}</div>
          <div class="chips">${bank.map((t, i) => `<button class="chip" type="button" data-i="${i}" ${used.has(i) ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>
          ${mistakes >= 2 && pos < target.length ? `<p class="es">Pista: la palabra siguiente es «${esc(target[pos])}».</p>` : ''}`, 'wide terminal');
        $$('.chip', sheet).forEach(btn => btn.onclick = () => {
          const i = +btn.dataset.i;
          if (bank[i] === target[pos]){ used.add(i); pos++; SFX.click(); if (pos === target.length){ const s = target.join(' '); speak(s); SFX.ok(); render(); setTimeout(() => done(mistakes), 1600); return; } render(); }
          else { mistakes++; SFX.bad(); btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 400); if (mistakes === 2) render(); }
        });
      };
      render();
    });
    const pts = m === 0 ? 1 : m === 1 ? 0.5 : 0; score += pts; onAnswer(pts === 1 ? 'right' : pts ? 'close' : 'wrong', { id:b.id });
  }
  return { c:score, n:birds.length };
}

/* ============ STATIONS, BOSSES, DAILY, ARENA ============ */
async function startStation(z, i){
  const def = STATIONS[z][i], key = z + '-' + i, info = STATION_INFO[def.kind];
  const go = await new Promise(res => {
    const st = S.stations[key] || 0;
    openModal(`<div class="st-intro"><div class="st-icon">${def.icon}</div><h2>${esc(def.name)}</h2><p class="stars-row">${starStr(st)}</p>
      <p class="lead">${esc(info.de)} ${speakBtn(info.de)}</p><p class="es">${esc(info.es)}</p><p class="how">🎮 ${esc(info.how)}</p>
      <div class="fb-actions center-actions"><button class="btn ghost" id="st-no" type="button">Zurück</button><button class="btn" id="st-go" type="button">Start ⏎</button></div></div>`);
    const pop = pushKeys(e => { if (e.code === 'Enter'){ pop(); res(true); return true; } if (e.code === 'Escape'){ pop(); res(false); return true; } return false; });
    $('#st-go').onclick = () => { pop(); res(true); }; $('#st-no').onclick = () => { pop(); res(false); };
  });
  closeModal(); if (!go) return;
  S.hearts = S.maxHearts; hud();
  let r;
  switch (def.kind){
    case 'obby': r = await runActivity(new Obby(def.arg)); break;
    case 'drones': r = await runActivity(new DroneHunt(topicIds(def.arg), { n:12 })); break;
    case 'raid': r = await runActivity(new LabelRaid(def.arg)); break;
    case 'terminal': r = await terminalStation(z, def); break;
    case 'foodrun': r = await runActivity(new DoorRun('Verdauungs-Run', foodRunQs(), { sky:['#3a1020', '#c7607a'] })); break;
    case 'beakblaster': r = await runActivity(new BeakBlaster()); break;
    case 'beakrun': r = await runActivity(new DoorRun('Schnabel-Türen', beakRunQs(), { sky:['#1f4a2a', '#9fd3a8'] })); break;
    case 'collector': r = await runActivity(new Collector()); break;
    case 'tfrun': r = await runActivity(new DoorRun('Wahr oder Falsch', tfRunQs(), { sky:['#2a3a6a', '#bcd6f0'] })); break;
  }
  if (S.hearts <= 0){ S.hearts = S.maxHearts; hud(); }
  if (!r) return;
  const pct = r.total ? r.correct / r.total : 0;
  const stars = r.failed ? 0 : pct >= 0.95 ? 3 : pct >= 0.8 ? 2 : pct >= 0.6 ? 1 : 0;
  const prev = S.stations[key] || 0;
  if (stars > prev) S.stations[key] = stars;
  const bonus = stars * 10 + (stars > prev ? 15 : 0);
  if (bonus) addFeathers(bonus);
  let all = true; for (let zz = 1; zz <= 5; zz++) for (let ii = 0; ii < 4; ii++) if ((S.stations[zz + '-' + ii] || 0) < 3) all = false;
  if (all) badge('stars');
  save(); refreshObjective();
  const msg = r.failed ? ['Game over!', '¡Se acabaron los corazones! Inténtalo otra vez.'] : stars === 3 ? ['PERFEKT!', '¡Perfecto!'] : stars === 2 ? ['Stark!', '¡Muy bien!'] : stars === 1 ? ['Geschafft!', '¡Lo lograste!'] : ['Noch nicht …', 'Todavía no: ¡otra vez!'];
  const bossOpen = stationsDone(z) >= 3 && !S.bosses[z];
  openModal(`<div class="center"><h2 class="big-title">${msg[0]}</h2><p class="es">${msg[1]}</p><p class="stars-big">${'<span class="on">★</span>'.repeat(stars)}${'<span>★</span>'.repeat(3 - stars)}</p>
    <p><b>${Math.round(r.correct * 10) / 10} / ${r.total}</b> richtig (${Math.round(pct * 100)} %) ${bonus ? `· +${bonus} 🪶` : ''}</p>
    ${stars < 3 ? '<p class="muted">60 % = ★ · 80 % = ★★ · 95 % = ★★★</p>' : ''}
    ${bossOpen ? `<p class="gold-note">🔓 Der Boss <b>${esc(BOSSES[z].name)}</b> ist jetzt offen!</p>` : ''}
    <div class="fb-actions center-actions"><button class="btn ghost" id="rs-again" type="button">Nochmal</button><button class="btn" id="rs-ok" type="button">Weiter ⏎</button></div></div>`);
  const pop = pushKeys(e => { if (e.code === 'Enter'){ pop(); closeModal(); return true; } return false; });
  $('#rs-ok').onclick = () => { pop(); closeModal(); };
  $('#rs-again').onclick = () => { pop(); closeModal(); setTimeout(() => startStation(z, i), 50); };
}
async function startBoss(z){
  S.hearts = S.maxHearts; hud(); SFX.boss();
  const r = await runActivity(new BossFight(z));
  const B = BOSSES[z];
  if (r && r.won){
    const first = !S.bosses[z];
    S.bosses[z] = true; if (first){ S.zone = Math.max(S.zone, z + 1); addFeathers(100); badge('boss' + z); }
    save(); refreshObjective(); speak(B.win[0]);
    const next = z < 5 ? `Neue Zone offen: <b>${ZONES[z + 1].name}</b>!` : 'Der <b>Prüfungsturm</b> ist offen!';
    openModal(`<div class="center"><div class="big-emoji">${BADGES['boss' + z].i}</div><h2 class="big-title">${esc(B.name)} besiegt!</h2><p class="quote">„${esc(B.win[0])}“</p><p class="es">${esc(B.win[1])}</p>
      ${first ? `<p>+100 🪶 · ${next}</p>` : '<p>Starke Revanche!</p>'}<div class="fb-actions center-actions"><button class="btn" id="bw-ok" type="button">Weiter</button></div></div>`);
    $('#bw-ok').onclick = closeModal;
  } else {
    S.hearts = S.maxHearts; hud(); save();
    openModal(`<div class="center"><h2 class="big-title">K.O.</h2><p>Der Boss war diesmal stärker. Trainiere an den Portalen und versuch es nochmal!</p><p class="es">El jefe fue más fuerte esta vez. Entrena en los portales y vuelve a intentarlo.</p><div class="fb-actions center-actions"><button class="btn" id="bl-ok" type="button">Okay</button></div></div>`);
    $('#bl-ok').onclick = closeModal;
  }
}
async function startDaily(){
  const first = S.lastDaily !== todayStr(), due = dueCount();
  const go = await new Promise(res => {
    openModal(`<div class="center"><div class="big-emoji">🚪</div><h2 class="big-title">Tages-Run</h2><p>10 Türen mit den Wörtern, die du gerade wiederholen solltest. ${due ? `<b>${due}</b> Wörter sind fällig.` : ''}</p>
      <p class="es">10 puertas con las palabras que te toca repasar hoy. Así no se te olvidan.</p>${first ? '<p class="gold-note">Tagesbonus: +40 🪶 · Streak ' + (S.dailyDays + 1) + '</p>' : '<p class="muted">Heute schon gemacht – Training geht immer.</p>'}
      <div class="fb-actions center-actions"><button class="btn ghost" id="dy-no" type="button">Später</button><button class="btn" id="dy-go" type="button">Los!</button></div></div>`);
    $('#dy-go').onclick = () => res(true); $('#dy-no').onclick = () => res(false);
  });
  closeModal(); if (!go) return;
  S.hearts = S.maxHearts; hud();
  const r = await runActivity(new DoorRun('Tages-Run', dailyQs(), { sky:['#2a1a5a', '#ffb36b'] }));
  if (S.hearts <= 0){ S.hearts = S.maxHearts; hud(); }
  if (first && r && !r.failed){ S.lastDaily = todayStr(); S.dailyDays++; addFeathers(40); if (S.dailyDays >= 3) badge('daily3'); }
  S.stats.days[todayStr()] = (S.stats.days[todayStr()] || 0) + 1; save();
  openModal(`<div class="center"><h2 class="big-title">${r && r.failed ? 'Game over' : 'Run geschafft!'}</h2><p class="score-big">${r ? Math.round(r.correct) : 0} / ${r ? r.total : 10}</p><p class="es">Vuelve mañana para mantener la racha.</p><div class="fb-actions center-actions"><button class="btn" id="dy-ok" type="button">Weiter</button></div></div>`);
  $('#dy-ok').onclick = closeModal;
}
async function startArena(){
  const keep = S.maxHearts; S.hearts = 3; hud();
  const act = new DroneHunt(weakIds(), { endless:true });
  const r = await runActivity(act);
  const score = act.k, best = score > S.arenaBest; if (best) S.arenaBest = score;
  S.hearts = keep; hud(); addFeathers(score * 3); save();
  openModal(`<div class="center"><h2 class="big-title">Arena</h2><p class="score-big">${score}</p><p>Treffer ${best ? '· <b>Neuer Rekord!</b> 🏆' : `· Rekord: ${S.arenaBest}`} · +${score * 3} 🪶</p><p class="es">En la Arena salen las palabras que todavía te cuestan.</p><div class="fb-actions center-actions"><button class="btn" id="ar-ok" type="button">Weiter</button></div></div>`);
  $('#ar-ok').onclick = closeModal;
}
