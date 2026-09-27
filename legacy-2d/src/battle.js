/* ============================================================
   BATTLE — monster fights, boss fights, arena
   ============================================================ */
const ZONE_SKY = [['#f6d9a0', '#d8c28e'], ['#a9dcf0', '#86c45f'], ['#3b3548', '#6d6478'], ['#6f8a7a', '#5f7a4a'], ['#5f9f6a', '#3f7d3a'], ['#cfe3f2', '#dfe8ee']];
function wq(ids, kinds){ const cand = pickWords(ids, 5); return qFromWord(pick(cand), kinds); }
function monsterQ(z){
  const own = topicIds(ZONES[z].topic);
  const all = unlockedTopics().flatMap(t => topicIds(t));
  return wq(Math.random() < 0.7 ? own : all, ['es2de', 'de2es', 'art', 'def', 'ex', 'audio']);
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
    return r < 0.4 ? wq(ids.filter(id => WMAP[id].art), ['type']) : r < 0.7 ? qFix(pick(BEAK_FIX)) : qBeak();
  }
  const ids = topicIds('merkmale');
  if (phase === 0) return qMerkmal();
  if (phase === 1) return r < 0.55 ? qTF(pick(TF.filter(x => x.t === 'merkmale'))) : qMerkmal();
  return r < 0.5 ? wq(ids, ['type', 'art']) : qMerkmal();
}
function qFix(item){
  return { type:'mc', prompt:`Welches Wort ist richtig?<div class="def">„${esc(item.s)}“</div>`, options:shuffle(item.o.map(o => ({ html:esc(o), val:o }))), correct:item.a,
    answerHTML:`<b>${esc(item.a)}</b>`, explain:esc(item.s.replace('___', item.a)), explainEs:esc(item.es), es:'¿Qué palabra está bien escrita / es correcta?', sayAfter:item.s.replace('___', item.a) };
}

const Battle = {
  pauseOnModal:false,
  begin(cfg){
    this.cfg = cfg; this.t = 0; this.fx = []; this.texts = []; this.shake = 0; this.eHit = 0; this.pHit = 0; this.proj = []; this.over = false;
    this.lunge = 0;
    $('#quest').hidden = true;
    setScene(this);
    panel.hidden = false; panel.innerHTML = '';
    this.run();
  },
  hearts(){ return this.cfg.arena ? this.cfg.aHearts : S.hearts; },
  phase(){ const e = this.cfg.enemy; const f = e.hp / e.max; return f > 0.66 ? 0 : f > 0.33 ? 1 : 2; },
  async run(){
    const c = this.cfg;
    if (c.intro){ await speech(c.enemy.name, c.intro[0], c.intro[1]); }
    else await sleep(500);
    while (!this.over){
      if (c.enemy.hp <= 0){
        if (c.arena){ c.score++; this.boom(720, 240, '#b3abc8', 30); SFX.win(); addFeathers(8); this.float(`+1 · Punkte: ${c.score}`, 720, 150, '#ffe9a8'); await sleep(900); c.enemy = arenaEnemy(c.score); continue; }
        break;
      }
      if (this.hearts() <= 0) break;
      const q = c.qgen(this.phase());
      const r = await askQ(q, panel, { compact:true, autoNext:900 });
      if (r.result === 'right' || r.result === 'close'){
        let dmg = r.result === 'close' ? 0.5 : 1, crit = false;
        if (c.boss && r.result === 'right' && r.ms < 6000){ dmg = 2; crit = true; }
        this.attack(dmg, crit);
      } else {
        this.enemyAttack();
      }
      await sleep(650);
    }
    this.finish(c.enemy.hp <= 0);
  },
  attack(dmg, crit){
    const c = this.cfg; SFX.shoot();
    this.proj.push({ x:250, y:230, t:0, crit });
    setTimeout(() => {
      c.enemy.hp = Math.max(0, c.enemy.hp - dmg); this.eHit = 0.35; this.shake = crit ? 10 : 5; SFX.hit();
      this.boom(720, 220, crit ? '#f2b632' : '#fff', crit ? 26 : 14);
      this.float((crit ? 'KRITISCH! ' : '') + '-' + dmg, 720, 130, crit ? '#ffd66b' : '#fff');
    }, 260);
  },
  enemyAttack(){
    const c = this.cfg; this.lunge = 0.5;
    setTimeout(() => {
      if (c.arena) c.aHearts--; else { S.hearts = Math.max(0, S.hearts - 1); save(); }
      this.pHit = 0.4; this.shake = 8; SFX.hit(); hud();
      this.float('-♥', 240, 150, '#ff8a7e'); this.boom(240, 230, '#ff8a7e', 12);
    }, 220);
  },
  boom(x, y, col, n){ for (let i = 0; i < n; i++){ const a = Math.random() * TAU, s = 60 + Math.random() * 200; this.fx.push({ x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s - 60, life:0.7 + Math.random() * 0.4, col }); } },
  float(txt, x, y, col){ this.texts.push({ txt, x, y, col, life:1.3 }); },
  finish(won){
    this.over = true; panel.hidden = true; panel.innerHTML = '';
    const c = this.cfg;
    setTimeout(() => c.onEnd(won), won ? 500 : 300);
  },
  update(dt){
    this.t += dt; this.eHit = Math.max(0, this.eHit - dt); this.pHit = Math.max(0, this.pHit - dt); this.shake = Math.max(0, this.shake - dt * 30); this.lunge = Math.max(0, this.lunge - dt);
    for (const p of this.fx){ p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
    this.fx = this.fx.filter(p => p.life > 0);
    for (const t of this.texts){ t.y -= 30 * dt; t.life -= dt; }
    this.texts = this.texts.filter(t => t.life > 0);
    for (const p of this.proj) p.t += dt;
    this.proj = this.proj.filter(p => p.t < 0.3);
  },
  draw(g){
    const c = this.cfg, sky = ZONE_SKY[c.z] || ZONE_SKY[0];
    g.save();
    if (this.shake) g.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sky[0]); gr.addColorStop(0.55, sky[1]); gr.addColorStop(1, shade(sky[1], -40));
    g.fillStyle = gr; g.fillRect(-20, -20, W + 40, H + 40);
    g.fillStyle = 'rgba(0,0,0,.12)'; ell(g, 240, 262, 90, 20); ell(g, 720, 262, 120, 26);
    // enemy
    const e = c.enemy, lx = this.lunge > 0 ? -Math.sin(this.lunge / 0.5 * Math.PI) * 160 : 0;
    g.save(); if (this.eHit > 0 && Math.floor(this.t * 30) % 2) g.globalAlpha = 0.4;
    e.draw(g, 720 + lx, 200, this.t);
    g.restore();
    // player
    g.save(); if (this.pHit > 0 && Math.floor(this.t * 30) % 2) g.globalAlpha = 0.4;
    drawRanger(g, 240, 205, 2.6, 1, this.t, false, S.hat && (SHOP.find(s => s.id === S.hat) || {}).emoji);
    g.restore();
    for (const p of this.proj){ const f = p.t / 0.3; drawEmoji(g, '🪶', 260 + f * 440, 200 - Math.sin(f * Math.PI) * 60, p.crit ? 34 : 26); }
    for (const p of this.fx){ g.globalAlpha = clamp(p.life, 0, 1); g.fillStyle = p.col; circ(g, p.x, p.y, 3.5); }
    g.globalAlpha = 1;
    for (const t of this.texts){ g.globalAlpha = clamp(t.life, 0, 1); textOut(g, t.txt, t.x, t.y, '28px "Lilita One", sans-serif', t.col); }
    g.globalAlpha = 1;
    // enemy HP bar
    const bw = 260, bx = W - bw - 24, by = 64;
    g.fillStyle = 'rgba(15,32,38,.8)'; rrect(g, bx - 8, by - 8, bw + 16, 44, 10);
    textOut(g, e.name, bx, by + 6, '17px "Lilita One", sans-serif', '#ffe9a8', 'rgba(15,32,38,.9)', 'left');
    g.fillStyle = '#3a2b33'; rrect(g, bx, by + 18, bw, 10, 5);
    g.fillStyle = e.hp / e.max > 0.33 ? '#e2742f' : '#ff4b3a'; rrect(g, bx, by + 18, Math.max(0, bw * e.hp / e.max), 10, 5);
    if (c.arena){ textOut(g, `Arena · Punkte: ${c.score} · ${'♥'.repeat(Math.max(0, c.aHearts))}`, 24, 76, '18px "Lilita One", sans-serif', '#ffe9a8', 'rgba(15,32,38,.9)', 'left'); }
    else if (c.boss){ const ph = ['Phase 1: Auswählen', 'Phase 2: Bilder & Sätze', 'Phase 3: Schreiben!'][this.phase()]; textOut(g, ph, 24, 76, '17px "Lilita One", sans-serif', '#ffe9a8', 'rgba(15,32,38,.9)', 'left'); }
    g.restore();
  },
};
/* speech bubble in the battle panel */
function speech(name, de, es){
  return new Promise(res => {
    panel.innerHTML = `<div class="speech"><div class="who">${esc(name)}</div><p class="de">${esc(de)} ${speakBtn(de)}</p><p class="es">${esc(es)}</p><div class="fb-actions"><button class="btn" type="button" id="sp-go">Los geht's! ⏎</button></div></div>`;
    const done = () => { pop(); res(); };
    $('#sp-go').onclick = done;
    const pop = pushKeys(e => { if (e.code === 'Enter' || e.code === 'Space'){ done(); return true; } return false; });
    speak(de, 0.95);
  });
}

function startFight(mon){
  const z = mon.z;
  Battle.begin({ z, enemy:{ name:mon.name, hp:3, max:3, draw:(g, x, y, t) => drawMonster(g, x, y, 4.2, t, mon.seed) }, qgen:() => monsterQ(z),
    onEnd:won => {
      setScene(Overworld); player.inv = 2.5;
      if (won){
        mon.alive = false; mon.respawn = 75; addFeathers(15); badge('first');
        if (Math.random() < 0.35 && S.hearts < S.maxHearts){ S.hearts++; toast('♥ Das Monster hat ein Herz fallen lassen!'); }
        toast(`⚔️ ${esc(mon.name)} besiegt! +15 🪶`, 'ok');
      } else knockout();
      hud(); save();
    } });
}
function knockout(){
  S.hearts = S.maxHearts; player.x = PTS[0].spawn.x; player.y = PTS[0].spawn.y; player.zone = 0; player.inv = 3; hud(); save();
  openModal(`<h2>Ohnmacht! 💫</h2><p>Keine Herzen mehr. Professorin Eule hat dich ins Nest-Dorf gebracht. Deine Herzen sind wieder voll.</p><p class="es">Te quedaste sin corazones. La profesora Búho te llevó al pueblo. ¡Tus corazones están llenos otra vez!</p><p>Tipp: Lies im <b>Lexikon</b> nach oder öffne im Menü die <b>Lernkarten</b>.</p><div class="fb-actions"><button class="btn" id="ko-ok" type="button">Weiter</button></div>`);
  $('#ko-ok').onclick = closeModal;
}
function startBoss(z){
  const B = BOSSES[z];
  SFX.boss();
  Battle.begin({ z, boss:true, intro:B.intro, enemy:{ name:B.name, hp:B.hp, max:B.hp, draw:(g, x, y, t) => drawBoss(g, B.kind, x, y + 20, 4, t) }, qgen:ph => bossQ(z, ph),
    onEnd:won => {
      setScene(Overworld); player.inv = 2.5;
      if (won){
        const first = !S.bosses[z];
        S.bosses[z] = true; if (first){ S.zone = Math.max(S.zone, z + 1); addFeathers(100); badge('boss' + z); }
        SFX.win(); save();
        const next = z < 5 ? `Die nächste Zone ist offen: <b>${ZONES[z + 1].name}</b>!` : 'Der <b>Prüfungsturm</b> in der Mitte des Dorfes ist jetzt offen!';
        const nextEs = z < 5 ? `¡Se abrió la siguiente zona: ${ZONES[z + 1].es}!` : '¡La Torre del Examen en el centro del pueblo ya está abierta!';
        openModal(`<div class="center"><div class="big-emoji">${BADGES['boss' + z].i}</div><h2>${esc(B.name)} ist besiegt!</h2><p class="quote">„${esc(B.win[0])}“</p><p class="es">${esc(B.win[1])}</p>${first ? `<p>+100 🪶 · ${next}</p><p class="es">${nextEs}</p>` : '<p>Gute Revanche! Übung macht den Meister.</p>'}<div class="fb-actions"><button class="btn" id="bw-ok" type="button">Super!</button></div></div>`);
        $('#bw-ok').onclick = () => { closeModal(); Overworld.refreshObjective(); };
      } else {
        S.hearts = S.maxHearts; player.x = PTS[z].npc.x + 30; player.y = PTS[z].npc.y + 30; hud(); save();
        openModal(`<h2>Der Boss war zu stark!</h2><p>Übe noch an den Schreinen oder im Lexikon und versuch es nochmal. Deine Herzen sind wieder voll.</p><p class="es">El jefe fue demasiado fuerte. Practica un poco más en los santuarios o en el Lexikon y vuelve a intentarlo.</p><div class="fb-actions"><button class="btn" id="bl-ok" type="button">Okay</button></div>`);
        $('#bl-ok').onclick = closeModal;
      }
    } });
}
function weakIds(){
  const ts = unlockedTopics();
  const seen = WORDS.filter(w => ts.includes(w.t) && S.words[w.id] && S.words[w.id].b > 0 && S.words[w.id].b <= 2).map(w => w.id);
  return seen.length >= 6 ? seen : ts.flatMap(t => topicIds(t));
}
function arenaEnemy(n){ const seed = Math.random() * 9; return { name:`Nebel-Monster #${n + 1}`, hp:3, max:3, draw:(g, x, y, t) => drawMonster(g, x, y, 4.2 + Math.min(1.5, n * 0.1), t, seed) }; }
function startArena(){
  const cfg = { z:0, arena:true, aHearts:3, score:0, enemy:arenaEnemy(0), qgen:() => wq(weakIds(), ['es2de', 'de2es', 'art', 'def', 'ex', 'audio', 'type']),
    onEnd:() => {
      setScene(Overworld); player.inv = 2;
      const best = cfg.score > S.arenaBest; if (best) S.arenaBest = cfg.score; save();
      openModal(`<div class="center"><h2>Arena beendet</h2><p class="score-big">${cfg.score}</p><p>besiegte Monster ${best ? '· <b>Neuer Rekord!</b> 🏆' : `· Rekord: ${S.arenaBest}`}</p><p class="es">En la Arena salen sobre todo las palabras que todavía te cuestan.</p><div class="fb-actions"><button class="btn" id="ar-ok" type="button">Zurück</button></div></div>`);
      $('#ar-ok').onclick = closeModal;
    } };
  Battle.begin(cfg);
}
