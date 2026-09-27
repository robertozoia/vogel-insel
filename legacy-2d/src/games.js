/* ============================================================
   GAMES — the 20 shrines (Schreine)
   ============================================================ */
const STATION_INFO = {
  label:{ de:'Beschrifte die Abbildung. Nenne den Fachbegriff mit Artikel.', es:'Rotula el dibujo: escribe el término técnico con su artículo.', how:'Teil 1: Klicke ein Wort und dann die passende Nummer im Bild. Teil 2: Schreibe fünf Wörter selbst – mit Artikel!' },
  blaster:{ de:'Schieß die Wörter mit dem richtigen Artikel ab!', es:'Dispara a cada palabra con su artículo correcto.', how:'J = der (blau) · K = die (rot) · L = das (grün). Du triffst immer das unterste Wort. Du kannst auch unten klicken.' },
  forge:{ de:'Schmiede die Wörter: Schreib sie richtig – mit Artikel.', es:'Forja las palabras: escríbelas bien y con su artículo.', how:'Tippe die Antwort und drücke Enter. Die Buttons ä ö ü ß helfen dir. Mit 🔊 hörst du das Wort.' },
  cloze:{ de:'Ergänze den Text aus deinem Arbeitsblatt.', es:'Completa el texto de tu hoja de trabajo.', how:'Klicke eine Lücke und dann das passende Wort unten. Dann „Prüfen“.' },
  tf:{ de:'Richtig oder falsch? Du hast 12 Sekunden pro Satz.', es:'¿Verdadero (richtig) o falso (falsch)? Tienes 12 segundos por frase.', how:'R = richtig · F = falsch' },
  race:{ de:'Führe das Futterkorn durch den Körper – in der richtigen Reihenfolge!', es:'Lleva el grano de comida por el cuerpo en el orden correcto.', how:'WASD / Pfeiltasten oder Maus. Weiche dem Magensaft aus!' },
  beakhunt:{ de:'Fang das Futter mit dem richtigen Schnabel!', es:'Atrapa la comida con el pico correcto.', how:'← → oder A / D: Spur wechseln · 1–6: Schnabel wählen (oder unten klicken).' },
  sentence:{ de:'Baue Sätze wie im Test: „Der … hat einen …schnabel, um … zu fressen.“', es:'Construye frases como en el examen: «Der … hat einen …schnabel, um … zu fressen.»', how:'Klicke die Wörter in der richtigen Reihenfolge.' },
  collector:{ de:'Sammle die 10 echten Merkmale der Vögel. Achtung: Die Lügen des Falsch-Vogels fliegen herum!', es:'Recoge las 10 características verdaderas de las aves. ¡Cuidado con las mentiras del Pájaro Mentiroso!', how:'WASD / Pfeiltasten oder Maus zum Laufen.' },
  mcq:{ de:'Wörter aus den Aufgaben: Was sollst du tun?', es:'Palabras de los enunciados: ¿qué te piden hacer?', how:'Wähle die richtige Antwort (1–4).' },
};
function playScene(sc){ return new Promise(res => { sc.done = res; setScene(sc); }); }

async function startStation(z, i){
  const def = STATIONS[z][i], key = z + '-' + i, info = STATION_INFO[def.kind];
  const go = await new Promise(res => {
    const st = S.stations[key] || 0;
    openModal(`<div class="st-intro"><div class="st-icon">${def.icon}</div><h2>${esc(def.name)}</h2><p class="stars-row">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</p>
      <p class="lead">${esc(info.de)} ${speakBtn(info.de)}</p><p class="es">${esc(info.es)}</p><p class="how">🎮 ${esc(info.how)}</p>
      <div class="fb-actions"><button class="btn ghost" id="st-no" type="button">Zurück</button><button class="btn" id="st-go" type="button">Start ⏎</button></div></div>`);
    const pop = pushKeys(e => { if (e.code === 'Enter'){ pop(); res(true); return true; } if (e.code === 'Escape'){ pop(); res(false); return true; } return false; });
    $('#st-go').onclick = () => { pop(); res(true); }; $('#st-no').onclick = () => { pop(); res(false); };
  });
  if (!go){ closeModal(); return; }
  closeModal();
  let r;
  switch (def.kind){
    case 'label': r = await gameLabel(def.arg); break;
    case 'blaster': r = await playScene(makeBlaster(def.arg, z)); break;
    case 'forge': r = await gameForge(def.arg); break;
    case 'cloze': r = await gameCloze(def.arg); break;
    case 'tf': r = await gameTF(); break;
    case 'race': r = await playScene(makeRace()); break;
    case 'beakhunt': r = await playScene(makeBeakHunt()); break;
    case 'sentence': r = await gameSentence(); break;
    case 'collector': r = await playScene(makeCollector()); if (r) r = await collectorPart2(r); break;
    case 'mcq': r = await gameMCQ(def.arg); break;
  }
  setScene(Overworld);
  if (!r){ closeModal(); return; }
  const pct = r.total ? r.correct / r.total : 0;
  const stars = pct >= 0.95 ? 3 : pct >= 0.8 ? 2 : pct >= 0.6 ? 1 : 0;
  const prev = S.stations[key] || 0;
  if (stars > prev) S.stations[key] = stars;
  const bonus = stars * 10 + (stars > prev ? 15 : 0);
  if (bonus) addFeathers(bonus);
  let all = true; for (let zz = 1; zz <= 5; zz++) for (let ii = 0; ii < 4; ii++) if ((S.stations[zz + '-' + ii] || 0) < 3) all = false;
  if (all) badge('stars');
  save(); Overworld.refreshObjective();
  const msg = stars === 3 ? ['Perfekt!', '¡Perfecto!'] : stars === 2 ? ['Sehr gut!', '¡Muy bien!'] : stars === 1 ? ['Geschafft!', '¡Lo lograste!'] : ['Noch nicht ganz …', 'Todavía no… ¡inténtalo otra vez!'];
  const bossOpen = stationsDone(z) >= 3 && !S.bosses[z];
  await new Promise(res => {
    openModal(`<div class="center"><h2>${msg[0]}</h2><p class="es">${msg[1]}</p><p class="stars-big">${'<span class="on">★</span>'.repeat(stars)}${'<span>★</span>'.repeat(3 - stars)}</p>
      <p><b>${Math.round(r.correct * 10) / 10} / ${r.total}</b> richtig (${Math.round(pct * 100)} %) ${bonus ? `· +${bonus} 🪶` : ''}</p>
      ${stars < 3 ? '<p class="muted">Ab 95 % gibt es drei Sterne.</p>' : ''}
      ${bossOpen ? `<p class="gold-note">🔓 Der Boss <b>${esc(BOSSES[z].name)}</b> ist jetzt offen!</p>` : ''}
      <div class="fb-actions"><button class="btn ghost" id="rs-again" type="button">Nochmal</button><button class="btn" id="rs-ok" type="button">Weiter ⏎</button></div></div>`);
    const pop = pushKeys(e => { if (e.code === 'Enter'){ pop(); closeModal(); res(); return true; } return false; });
    $('#rs-ok').onclick = () => { pop(); closeModal(); res(); };
    $('#rs-again').onclick = () => { pop(); closeModal(); res(); setTimeout(() => startStation(z, i), 50); };
  });
}

/* ---------- Beschriften ---------- */
async function gameLabel(key){
  const D = DIAGRAMS[key], state = {}, missed = {};
  let firstTry = 0, selected = null;
  await new Promise(done => {
    const render = () => {
      const left = D.labels.filter(L => state[L.n] !== 'ok');
      const chips = shuffleStable(left).map(L => `<button class="chip ${selected === L.n ? 'sel' : ''}" type="button" data-n="${L.n}">${labelHTML(L)}</button>`).join('');
      const slots = D.labels.map(L => `<li class="${state[L.n] === 'ok' ? 'ok' : ''}"><span class="num">${L.n}</span> ${state[L.n] === 'ok' ? labelHTML(L) : '<span class="blank">________</span>'}</li>`).join('');
      openModal(`<div class="series-head"><h2>${esc(D.title)}</h2><div class="prog">${D.labels.length - left.length} / ${D.labels.length}</div></div>
        <p class="sub">Teil 1: Klicke ein Wort – dann die Nummer im Bild. <span class="es-inline">Haz clic en una palabra y luego en su número.</span></p>
        <div class="label-wrap"><div class="diag-box">${diagramSVG(key, { state })}</div><ol class="slots">${slots}</ol></div>
        <div class="chips">${chips || '<b>Alles beschriftet! 🎉</b>'}</div>`, 'wide');
      $$('.chip', sheet).forEach(b => b.onclick = () => { selected = +b.dataset.n; SFX.click(); speak(labelText(D.labels.find(L => L.n === selected))); render(); });
      $$('.mk', sheet).forEach(m => m.onclick = () => place(+m.dataset.n));
    };
    const place = n => {
      if (selected == null){ toast('Wähle zuerst ein Wort unten.'); return; }
      if (state[n] === 'ok') return;
      const L = D.labels.find(l => l.n === selected);
      if (selected === n){
        state[n] = 'ok'; SFX.ok(); speak(labelText(L));
        if (!missed[n]){ firstTry++; onAnswer('right', { id:L.id }); } else grade(L.id, 'close');
        selected = null; render();
        if (D.labels.every(l => state[l.n] === 'ok')) setTimeout(done, 700);
      } else {
        missed[selected] = true; onAnswer('wrong', { id:L.id }); SFX.bad();
        const m = sheet.querySelector(`.mk[data-n="${n}"]`); if (m){ m.classList.add('bad'); setTimeout(() => m.classList.remove('bad'), 500); }
        toast(`Nicht Nummer ${n}. Tipp: ${esc(WMAP[L.id].es)}`, 'bad');
      }
    };
    render();
  });
  // Teil 2: typing
  const part2 = sample(D.labels, 5);
  let typed = 0;
  openModal(`<div class="series-head"><h2>${esc(D.title)} – Teil 2</h2><div class="prog" id="s-prog"></div></div><p class="sub">Schreibe den Fachbegriff <b>mit Artikel</b>. <span class="es-inline">Escribe el término con artículo.</span></p><div id="qmount"></div>`, 'wide');
  for (let k = 0; k < part2.length; k++){
    const L = part2[k];
    $('#s-prog').textContent = `${k + 1} / ${part2.length}`;
    const q = { type:'type', id:L.id, prompt:`Was ist Nummer <b>${L.n}</b>?`, media:diagramSVG(key, { hi:L.n, only:[L.n] }), accept:labelAccepts(L), answerHTML:labelHTML(L),
      explain:wordExplain(WMAP[L.id]), explainEs:wordTip(WMAP[L.id]), es:`Escribe el nombre del número ${L.n} con su artículo.`, sayAfter:labelText(L), placeholder:'der / die / das + Wort' };
    const r = await askQ(q, $('#qmount'));
    if (r.result === 'right') typed++; else if (r.result === 'close') typed += 0.5;
  }
  closeModal();
  return { correct:firstTry + typed, total:D.labels.length + part2.length };
}
const _stableOrder = {};
function shuffleStable(arr){ arr.forEach(x => { if (_stableOrder[x.n + x.id] == null) _stableOrder[x.n + x.id] = Math.random(); }); return arr.slice().sort((a, b) => _stableOrder[a.n + a.id] - _stableOrder[b.n + b.id]); }

/* ---------- Wort-Schmiede ---------- */
async function gameForge(topic){
  const ids = pickWords(topicIds(topic), 10);
  const tts = HAS_TTS && S.settings.tts;
  const qs = ids.map((id, k) => (tts && k % 2 ? MAKERS.dictation : MAKERS.type)(WMAP[id]));
  const r = await runSeries('🔨 Wort-Schmiede', qs, { sub:'Schreib das Wort richtig. Nomen immer mit Artikel!' });
  closeModal(); return r;
}
/* ---------- Richtig / Falsch ---------- */
async function gameTF(){
  const qs = shuffle([...sample(TF.filter(t => t.t === 'merkmale'), 6), ...sample(TF.filter(t => t.t !== 'merkmale'), 6)]).map(qTF);
  const r = await runSeries('⚡ Richtig/Falsch-Sprint', qs, { timeLimit:12, autoNext:1000 });
  closeModal(); return r;
}
/* ---------- Aufgaben-Wörter ---------- */
async function gameMCQ(topic){
  const qs = sample(topicIds(topic), 10).map(id => qFromWord(id, ['de2es', 'es2de', 'ex']));
  const r = await runSeries('📝 Aufgaben-Wörter', qs, { sub:'Im Test stehen die Aufgaben auf Deutsch. Diese Wörter musst du verstehen!' });
  closeModal(); return r;
}

/* ---------- Lückentext ---------- */
function parseCloze(text){
  const out = []; const re = /\[\[(.+?)\]\]/g; let last = 0, m;
  while ((m = re.exec(text))){
    if (m.index > last) out.push({ t:text.slice(last, m.index) });
    const [shown, id] = m[1].split('|');
    out.push({ blank:true, shown, id:id || idOf(shown) });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t:text.slice(last) });
  return out;
}
async function gameCloze(key){
  const C = CLOZE[key]; let correct = 0, total = 0;
  for (let p = 0; p < C.parts.length; p++){
    const toks = parseCloze(C.parts[p]);
    const blanks = toks.filter(t => t.blank);
    const topic = WMAP[blanks[0].id] ? WMAP[blanks[0].id].t : 'aussen';
    const extra = sample(WORDS.filter(w => w.t === topic && !blanks.some(b => b.shown === w.de) && w.art), 2).map(w => w.de);
    const bank = shuffle([...blanks.map((b, k) => ({ text:b.shown, k })), ...extra.map(t => ({ text:t, k:-1 }))]);
    const fill = new Array(blanks.length).fill(null);
    let sel = 0, checked = false;
    const res = await new Promise(done => {
      const render = () => {
        let bi = 0;
        const body = toks.map(t => {
          if (!t.blank) return esc(t.t);
          const k = bi++, f = fill[k];
          const cls = checked ? (f != null && bank[f].text === blanks[k].shown ? 'ok' : 'bad') : (k === sel ? 'sel' : '');
          const txt = f != null ? esc(bank[f].text) : '&nbsp;';
          const fix = checked && cls === 'bad' ? `<span class="fix">${esc(blanks[k].shown)}</span>` : '';
          return `<button class="gap ${cls}" type="button" data-k="${k}">${txt}</button>${fix}`;
        }).join('');
        const used = new Set(fill.filter(x => x != null));
        const chips = bank.map((b, i) => `<button class="chip ${used.has(i) ? 'used' : ''}" type="button" data-i="${i}" ${used.has(i) || checked ? 'disabled' : ''}>${esc(b.text)}</button>`).join('');
        openModal(`<div class="series-head"><h2>📜 ${esc(C.title)}</h2><div class="prog">Teil ${p + 1} / ${C.parts.length}</div></div>
          <p class="sub">Aus deinem Arbeitsblatt (${esc(C.src)}). Klicke eine Lücke und dann ein Wort. <span class="es-inline">Haz clic en un hueco y luego en una palabra.</span></p>
          <div class="cloze">${body}</div><div class="chips">${chips}</div>
          <div class="fb-actions">${checked ? `<span class="score-note">✔ ${res0.c} / ${blanks.length}</span><button class="btn" id="cz-next" type="button">Weiter ⏎</button>` : `<button class="btn ghost" id="cz-clear" type="button">Leeren</button><button class="btn" id="cz-check" type="button" ${fill.includes(null) ? 'disabled' : ''}>Prüfen</button>`}</div>`, 'wide');
        $$('.gap', sheet).forEach(b => b.onclick = () => { if (checked) return; const k = +b.dataset.k; if (fill[k] != null){ fill[k] = null; } sel = k; render(); });
        $$('.chip', sheet).forEach(b => b.onclick = () => {
          if (checked) return; const i = +b.dataset.i; fill[sel] = i; SFX.click(); speak(bank[i].text);
          const nx = fill.findIndex(x => x == null); sel = nx >= 0 ? nx : sel; render();
        });
        if (checked) $('#cz-next').onclick = () => { pop(); done(res0); };
        else { $('#cz-check').onclick = check; $('#cz-clear').onclick = () => { fill.fill(null); sel = 0; render(); }; }
      };
      const res0 = { c:0 };
      const check = () => {
        checked = true;
        blanks.forEach((b, k) => { const ok = fill[k] != null && bank[fill[k]].text === b.shown; if (ok) res0.c++; if (b.id) onAnswer(ok ? 'right' : 'wrong', { id:b.id }); });
        res0.c === blanks.length ? SFX.win() : SFX.bad();
        render();
      };
      const pop = pushKeys(e => { if (e.code === 'Enter'){ if (checked){ pop(); done(res0); } else if (!fill.includes(null)) check(); return true; } return false; });
      render();
    });
    correct += res.c; total += blanks.length;
  }
  closeModal();
  return { correct, total };
}

/* ---------- Satz-Werkstatt ---------- */
async function gameSentence(){
  let score = 0;
  const birds = shuffle(BEAKS.slice());
  for (let k = 0; k < birds.length; k++){
    const b = birds[k];
    const target = [`${b.art} ${b.name}`, 'hat', 'einen', b.adj, b.noun, 'um', b.foodTile, 'zu fressen.'];
    const base = b.adj.replace(/en$/, '');
    const other = pick(BEAKS.filter(x => x !== b));
    const bank = shuffle([...target, base + 'er', base, other.foodTile, 'für']);
    let pos = 0, mistakes = 0;
    const used = new Set();
    const m = await new Promise(done => {
      const render = () => {
        openModal(`<div class="series-head"><h2>🧩 Satz-Werkstatt</h2><div class="prog">${k + 1} / ${birds.length}</div></div>
          <p class="sub">Baue den Satz: Welchen Schnabel hat der Vogel – und warum? <span class="es-inline">Construye la frase: ¿qué pico tiene y para qué?</span></p>
          <div class="sent-bird"><canvas id="sb-cv" width="140" height="100"></canvas><div><b class="${artClass(b.art)}">${esc(b.art + ' ' + b.name)}</b> <span class="muted">(${esc(WMAP[b.id].es)})</span><br><span class="muted">${esc(b.beakName)} · ${esc(b.food)}</span></div></div>
          <div class="sent-line">${target.slice(0, pos).map(t => `<span class="tok ok">${esc(t)}</span>`).join(' ')} ${pos < target.length ? '<span class="tok cursor">…</span>' : ' ✔'}</div>
          <div class="chips">${bank.map((t, i) => `<button class="chip" type="button" data-i="${i}" ${used.has(i) ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>
          ${mistakes >= 2 ? `<p class="es">Pista: la palabra siguiente es «${esc(target[pos])}».</p>` : ''}`, 'wide');
        const c = $('#sb-cv').getContext('2d'); c.scale(1, 1); drawBird(c, 60, 50, 1.8, { col:b.col, shape:b.shape, dir:1 });
        $$('.chip', sheet).forEach(btn => btn.onclick = () => {
          const i = +btn.dataset.i;
          if (bank[i] === target[pos]){
            used.add(i); pos++; SFX.click();
            if (pos === target.length){ const s = target.join(' ').replace(' ,', ','); speak(s); SFX.ok(); render(); setTimeout(() => done(mistakes), 1500); return; }
            render();
          } else {
            mistakes++; SFX.bad(); btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 400);
            if (mistakes === 2) render();
          }
        });
      };
      render();
    });
    const pts = m === 0 ? 1 : m === 1 ? 0.5 : 0;
    score += pts; onAnswer(pts === 1 ? 'right' : pts ? 'close' : 'wrong', { id:b.id });
  }
  const qs = sample(BEAK_FIX, 4).map(qFix);
  openModal(`<div class="series-head"><h2>🧩 Fehler finden</h2><div class="prog" id="s-prog"></div></div><p class="sub">Diese Sätze kommen aus deinem Heft (Seite 9). Welches Wort ist richtig?</p><div id="qmount"></div>`, 'wide');
  let c2 = 0;
  for (let k = 0; k < qs.length; k++){ $('#s-prog').textContent = `${k + 1} / ${qs.length}`; const r = await askQ(qs[k], $('#qmount')); if (r.result === 'right') c2++; }
  closeModal();
  return { correct:score + c2, total:birds.length + qs.length };
}

/* ---------- Artikel-Blaster (canvas) ---------- */
function makeBlaster(topic, z){
  const ids = pickWords(topicIds(topic, w => !!w.art), 15);
  const sky = ZONE_SKY[z] || ZONE_SKY[1];
  return {
    pauseOnModal:true, queue:ids.slice(), total:ids.length, bubbles:[], shots:[], fx:[], texts:[], shields:5, correct:0, processed:0, t:0, spawnT:0.6, endT:0, ended:false,
    enter(){ $('#quest').hidden = true; },
    update(dt){
      this.t += dt; this.spawnT -= dt;
      if (this.queue.length && this.bubbles.length < 3 && this.spawnT <= 0 && this.shields > 0){
        const id = this.queue.shift(), w = WMAP[id];
        this.bubbles.push({ id, x:200 + Math.random() * 560, y:110, vy:30 + this.processed * 2.2, text:w.po ? w.de + ' (Pl.)' : w.de, wob:Math.random() * 6 });
        this.spawnT = Math.max(1.5, 3 - this.processed * 0.1);
      }
      for (const b of this.bubbles){ b.y += b.vy * dt; if (b.y > 430 && !b.dead){ b.dead = true; this.resolve(b, null); } }
      this.bubbles = this.bubbles.filter(b => !b.dead);
      for (const s of this.shots){ s.t += dt; if (s.t >= 0.18 && !s.done){ s.done = true; if (!s.b.dead){ s.b.dead = true; this.resolve(s.b, s.art); } } }
      this.shots = this.shots.filter(s => s.t < 0.25);
      this.bubbles = this.bubbles.filter(b => !b.dead);
      for (const p of this.fx){ p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.life -= dt; }
      this.fx = this.fx.filter(p => p.life > 0);
      for (const t of this.texts){ t.y -= 22 * dt; t.life -= dt; }
      this.texts = this.texts.filter(t => t.life > 0);
      if (!this.ended && ((this.processed >= this.total) || this.shields <= 0) && !this.bubbles.length && !this.shots.length){ this.ended = true; this.endT = 1.6; }
      if (this.ended){ this.endT -= dt; if (this.endT <= 0 && this.done){ const d = this.done; this.done = null; d({ correct:this.correct, total:this.total }); } }
    },
    fire(art){
      const tg = this.bubbles.filter(b => !b.targeted).sort((a, b) => b.y - a.y)[0];
      if (!tg) return; tg.targeted = true; SFX.shoot();
      this.shots.push({ art, b:tg, t:0 });
    },
    resolve(b, art){
      const w = WMAP[b.id]; this.processed++;
      if (art === w.art){
        this.correct++; onAnswer('right', { id:b.id, type:'art' });
        for (let i = 0; i < 18; i++){ const a = Math.random() * TAU, s = 60 + Math.random() * 160; this.fx.push({ x:b.x, y:b.y, vx:Math.cos(a) * s, vy:Math.sin(a) * s, life:0.8, col:ART_CANVAS[w.art] }); }
        this.texts.push({ txt:nounLabel(w), x:clamp(b.x, 160, 800), y:Math.max(b.y, 140), col:ART_CANVAS[w.art], life:1.2 });
        speak(nounLabel(w), 1);
      } else {
        this.shields--; onAnswer('wrong', { id:b.id, type:'art' });
        this.texts.push({ txt:(art ? '✘ ' : 'Verpasst: ') + nounLabel(w), x:clamp(b.x, 180, 780), y:clamp(b.y, 150, 400), col:ART_CANVAS[w.art], life:2.4, big:true });
        speak(nounLabel(w), 1);
      }
    },
    key(e){
      const m = { KeyJ:'der', Digit1:'der', KeyK:'die', Digit2:'die', KeyL:'das', Digit3:'das' }[e.code];
      if (m) this.fire(m);
      if (e.code === 'Escape' && this.done){ const d = this.done; this.done = null; d(null); }
    },
    click(x, y){ if (y > 510){ const i = Math.floor((x - 180) / 200); if (i >= 0 && i < 3) this.fire(['der', 'die', 'das'][i]); } },
    draw(g){
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 5; k++){ const cx = ((k * 230 + this.t * 12) % 1160) - 100; ell(g, cx, 110 + k * 30, 70, 16); }
      g.strokeStyle = 'rgba(200,40,40,.5)'; g.setLineDash([10, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 440); g.lineTo(W, 440); g.stroke(); g.setLineDash([]);
      g.fillStyle = shade(sky[1], -30); g.fillRect(0, 450, W, 150);
      drawRanger(g, 480, 470, 2.2, 1, this.t, false, S.hat && (SHOP.find(s => s.id === S.hat) || {}).emoji);
      for (const b of this.bubbles){
        const x = b.x + Math.sin(this.t * 2 + b.wob) * 8;
        g.font = 'bold 22px "Atkinson Hyperlegible", sans-serif'; const hw = Math.max(60, g.measureText(b.text).width / 2 + 22);
        g.save(); g.globalAlpha = 0.92; g.fillStyle = '#d9d3ea'; circ(g, x - hw * 0.55, b.y + 4, 22); circ(g, x + hw * 0.55, b.y + 4, 22); circ(g, x, b.y - 6, 30); ell(g, x, b.y + 8, hw, 20); g.restore();
        textOut(g, b.text, x, b.y + 2, 'bold 22px "Atkinson Hyperlegible", sans-serif', '#2a2119', 'rgba(255,255,255,.8)');
        if (b.targeted){ g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(x, b.y, 44, 0, TAU); g.stroke(); }
      }
      for (const s of this.shots){ const f = Math.min(1, s.t / 0.18); g.fillStyle = ART_CANVAS[s.art]; circ(g, 480 + (s.b.x - 480) * f, 440 + (s.b.y - 440) * f, 10); }
      for (const p of this.fx){ g.globalAlpha = clamp(p.life, 0, 1); g.fillStyle = p.col; circ(g, p.x, p.y, 4); }
      g.globalAlpha = 1;
      for (const t of this.texts){ g.globalAlpha = clamp(t.life, 0, 1); textOut(g, t.txt, t.x, t.y, (t.big ? '30px' : '24px') + ' "Lilita One", sans-serif', t.col); }
      g.globalAlpha = 1;
      ['der', 'die', 'das'].forEach((a, i) => {
        const x = 180 + i * 200; g.fillStyle = ART_DARK[a]; rrect(g, x, 520, 180, 56, 12); g.fillStyle = shade(ART_DARK[a], 30); rrect(g, x + 4, 522, 172, 20, 10);
        textOut(g, `${'JKL'[i]}  ·  ${a}`, x + 90, 548, '26px "Lilita One", sans-serif', '#fff', 'rgba(0,0,0,.3)');
      });
      textOut(g, `Artikel-Blaster · ${this.correct} / ${this.total} · 🛡 ${'■'.repeat(Math.max(0, this.shields))}`, 24, 76, '18px "Lilita One", sans-serif', '#fff', 'rgba(15,32,38,.85)', 'left');
      if (this.ended) textOut(g, this.shields > 0 ? 'Geschafft!' : 'Schild kaputt!', W / 2, 280, '54px "Lilita One", sans-serif', '#ffe9a8');
    },
  };
}

/* ---------- Verdauungs-Rennen (canvas) ---------- */
function makeRace(){
  const ROUNDS = [
    { title:'Weg der Nahrung', es:'El camino de la comida', path:['schnabel', 'kropf', 'druesenmagen', 'kaumagen', 'darm', 'kloake'], extra:['niere', 'lunge'] },
    { title:'Weg der Luft', es:'El camino del aire', path:['luftroehre', 'lunge', 'luftsack'], extra:['kropf', 'niere', 'darm'] },
  ];
  const lab = id => id === 'luftsack' ? 'die Luftsäcke' : nounLabel(WMAP[id]);
  const S0 = {
    pauseOnModal:true, wait:0, round:0, step:0, mistakes:0, time:0, t:0, gates:[], drops:[], p:{ x:480, y:540 }, cool:0, msg:'', msgT:0, target:null, steps:0, ended:false, endT:0,
    enter(){ $('#quest').hidden = true; this.setup(); },
    setup(){
      const R = ROUNDS[this.round]; const ids = shuffle([...R.path, ...R.extra]);
      this.gates = []; this.step = 0;
      for (const id of ids){
        let x, y, tries = 0;
        do { x = 90 + Math.random() * 780; y = 190 + Math.random() * 300; tries++; } while (tries < 300 && (this.gates.some(gt => Math.hypot(gt.x - x, gt.y - y) < 150) || Math.hypot(x - 480, y - 540) < 120));
        this.gates.push({ id, x, y, done:false, flash:0 });
      }
      this.drops = Array.from({ length:2 + this.round }, () => ({ x:100 + Math.random() * 760, y:160 + Math.random() * 300, vx:(Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 60), vy:(Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 60) }));
      this.p = { x:480, y:545 };
      this.msg = `${R.title}: Womit fängt es an?`; this.msgT = 3;
    },
    update(dt){
      this.t += dt; if (!this.ended) this.time += dt; this.cool -= dt; this.msgT -= dt;
      if (this.wait > 0){ this.wait -= dt; if (this.wait <= 0) this.setup(); return; }
      if (this.ended){ this.endT -= dt; if (this.endT <= 0 && this.done){ const d = this.done; this.done = null; const tot = this.steps; d({ correct:tot * tot / (tot + this.mistakes), total:tot }); } return; }
      let dx = (down('KeyD', 'ArrowRight') ? 1 : 0) - (down('KeyA', 'ArrowLeft') ? 1 : 0), dy = (down('KeyS', 'ArrowDown') ? 1 : 0) - (down('KeyW', 'ArrowUp') ? 1 : 0);
      if (dx || dy) this.target = null;
      else if (this.target){ const vx = this.target.x - this.p.x, vy = this.target.y - this.p.y, d = Math.hypot(vx, vy); if (d < 5) this.target = null; else { dx = vx / d; dy = vy / d; } }
      const l = Math.hypot(dx, dy); if (l){ this.p.x = clamp(this.p.x + dx / l * 230 * dt, 20, W - 20); this.p.y = clamp(this.p.y + dy / l * 230 * dt, 110, H - 20); }
      for (const d of this.drops){ d.x += d.vx * dt; d.y += d.vy * dt; if (d.x < 30 || d.x > W - 30) d.vx *= -1; if (d.y < 120 || d.y > H - 30) d.vy *= -1;
        if (Math.hypot(d.x - this.p.x, d.y - this.p.y) < 26 && this.cool <= 0){ this.cool = 0.8; this.time += 2; SFX.hit(); const a = Math.atan2(this.p.y - d.y, this.p.x - d.x); this.p.x = clamp(this.p.x + Math.cos(a) * 60, 20, W - 20); this.p.y = clamp(this.p.y + Math.sin(a) * 60, 110, H - 20); this.msg = 'Magensaft! +2 Sekunden'; this.msgT = 1.5; } }
      const R = ROUNDS[this.round];
      for (const gt of this.gates){
        gt.flash = Math.max(0, gt.flash - dt);
        if (gt.done || Math.hypot(gt.x - this.p.x, gt.y - this.p.y) > 44 || this.cool > 0) continue;
        if (gt.id === R.path[this.step]){
          gt.done = true; this.step++; this.steps++; SFX.ok(); speak(lab(gt.id), 1); onAnswer('right', { id:gt.id });
          if (this.step >= R.path.length){
            if (this.round + 1 < ROUNDS.length){ this.round++; this.msg = 'Super! Jetzt der Weg der Luft …'; this.msgT = 2.5; this.wait = 1; return; }
            else { this.ended = true; this.endT = 2.2; SFX.win(); }
          } else { this.msg = 'Richtig! Und dann?'; this.msgT = 1.5; }
        } else {
          this.mistakes++; this.cool = 0.9; gt.flash = 0.6; SFX.bad(); onAnswer('wrong', { id:R.path[this.step] });
          const a = Math.atan2(this.p.y - gt.y, this.p.x - gt.x); this.p.x = clamp(gt.x + Math.cos(a) * 90, 20, W - 20); this.p.y = clamp(gt.y + Math.sin(a) * 90, 110, H - 20);
          this.msg = `Nein, das ist ${lab(gt.id)}. Tipp: ${WMAP[R.path[this.step]].es}`; this.msgT = 3;
        }
      }
    },
    key(e){ if (e.code === 'Escape' && this.done){ const d = this.done; this.done = null; d(null); } },
    click(x, y){ this.target = { x, y }; },
    draw(g){
      const R = ROUNDS[this.round];
      const gr = g.createRadialGradient(480, 330, 60, 480, 330, 560); gr.addColorStop(0, '#f3c7b4'); gr.addColorStop(1, '#b8645a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(120,40,40,.18)'; g.lineWidth = 3; for (let k = 0; k < 8; k++){ g.beginPath(); g.arc(480, 330, 80 + k * 70, 0, TAU); g.stroke(); }
      for (const gt of this.gates){
        g.save(); if (gt.flash > 0) g.translate(Math.sin(this.t * 60) * 4, 0);
        g.fillStyle = gt.done ? '#6fd08a' : gt.flash > 0 ? '#ff7a6e' : '#fff6e6'; circ(g, gt.x, gt.y, 40);
        g.lineWidth = 4; g.strokeStyle = gt.done ? '#2f9e55' : '#7a3a2a'; g.beginPath(); g.arc(gt.x, gt.y, 40, 0, TAU); g.stroke();
        const L = lab(gt.id), a = L.split(' ')[0];
        textOut(g, L.split(' ').slice(1).join(' '), gt.x, gt.y + 2, 'bold 15px "Atkinson Hyperlegible", sans-serif', '#2a2119', 'rgba(255,255,255,.7)');
        textOut(g, a, gt.x, gt.y - 18, 'bold 12px "Atkinson Hyperlegible", sans-serif', ART_DARK[a] || '#2a2119', 'rgba(255,255,255,.7)');
        if (gt.done) textOut(g, '✔', gt.x, gt.y + 22, 'bold 16px sans-serif', '#1f6b3a', 'rgba(255,255,255,.7)');
        g.restore();
      }
      for (const d of this.drops){ g.fillStyle = '#b5d33a'; circ(g, d.x, d.y, 14); g.fillStyle = '#e4f58a'; circ(g, d.x - 4, d.y - 4, 4); }
      g.save(); if (this.cool > 0 && Math.floor(this.t * 20) % 2) g.globalAlpha = 0.5;
      g.fillStyle = '#c98a3a'; ell(g, this.p.x, this.p.y, 13, 10, 0.4); g.fillStyle = '#e8b86a'; ell(g, this.p.x - 3, this.p.y - 3, 5, 3, 0.4); g.restore();
      g.fillStyle = 'rgba(15,32,38,.85)'; g.fillRect(0, 56, W, 44);
      const parts = R.path.map((id, k) => k < this.step ? lab(id).split(' ').slice(1).join(' ') : '?');
      textOut(g, `${R.title}:  ${parts.join('  →  ')}`, 20, 78, '18px "Lilita One", sans-serif', '#ffe9a8', 'rgba(0,0,0,0)', 'left');
      textOut(g, `⏱ ${this.time.toFixed(1)} s · Fehler: ${this.mistakes}`, W - 20, 78, '16px "Lilita One", sans-serif', '#fff', 'rgba(0,0,0,0)', 'right');
      if (this.msgT > 0) textWrap(g, this.msg, W / 2, 128, 900, 'bold 19px "Atkinson Hyperlegible", sans-serif', '#fff', 'rgba(60,20,20,.85)');
      if (this.ended){
        textOut(g, 'Geschafft!', W / 2, 280, '54px "Lilita One", sans-serif', '#ffe9a8');
        textOut(g, 'Kropf → Drüsenmagen → Kaumagen → Darm → Kloake', W / 2, 340, 'bold 22px "Atkinson Hyperlegible", sans-serif', '#fff');
      }
    },
  };
  return S0;
}

/* ---------- Schnabel-Jagd (canvas) ---------- */
function makeBeakHunt(){
  const LANES = [260, 480, 700], TOTAL = 18;
  const items = Array.from({ length:TOTAL }, () => { const b = pick(BEAKS); return { b, f:pick(b.foods), lane:Math.floor(Math.random() * 3) }; });
  const said = {};
  return {
    pauseOnModal:true, lane:1, beak:0, t:0, queue:items, active:[], caught:0, processed:0, spawnT:0.8, ticker:'Wähle mit 1–6 den Schnabel!', tickerT:4, fx:[], ended:false, endT:0,
    enter(){ $('#quest').hidden = true; },
    update(dt){
      this.t += dt; this.spawnT -= dt; this.tickerT -= dt;
      if (this.ended){ this.endT -= dt; if (this.endT <= 0 && this.done){ const d = this.done; this.done = null; d({ correct:this.caught, total:TOTAL }); } return; }
      const sp = 100 + this.processed * 6;
      if (this.queue.length && this.spawnT <= 0 && this.active.length < 2){ const it = this.queue.shift(); it.y = 110; this.active.push(it); this.spawnT = Math.max(1.6, 3.2 - this.processed * 0.1); }
      for (const it of this.active){
        it.y += sp * dt;
        if (it.y >= 445 && !it.res){
          it.res = true; this.processed++;
          if (it.lane === this.lane){
            if (BEAKS[this.beak] === it.b){
              this.caught++; SFX.ok(); onAnswer('right', { id:it.b.id });
              this.ticker = beakSentence(it.b); this.tickerT = 3.5;
              if (!said[it.b.id]){ said[it.b.id] = 1; speak(this.ticker, 0.95); }
              for (let i = 0; i < 14; i++){ const a = Math.random() * TAU; this.fx.push({ x:LANES[it.lane], y:440, vx:Math.cos(a) * 150, vy:Math.sin(a) * 150, life:0.7 }); }
            } else { SFX.bad(); onAnswer('wrong', { id:it.b.id }); this.ticker = `✘ Falscher Schnabel! ${it.f.e} ${it.f.n} → ${it.b.art} ${it.b.name} (${it.b.beakShort}), Taste ${BEAKS.indexOf(it.b) + 1}`; this.tickerT = 3.5; }
          } else { SFX.bad(); this.ticker = `Verpasst! ${it.f.e} ${it.f.n} → ${it.b.art} ${it.b.name}`; this.tickerT = 2.5; }
        }
      }
      this.active = this.active.filter(it => it.y < 470);
      for (const p of this.fx){ p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } this.fx = this.fx.filter(p => p.life > 0);
      if (this.processed >= TOTAL && !this.active.length){ this.ended = true; this.endT = 1.8; SFX.win(); }
    },
    key(e){
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.lane = Math.max(0, this.lane - 1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.lane = Math.min(2, this.lane + 1);
      const m = e.code.match(/^(Digit|Numpad)([1-6])$/); if (m){ this.beak = +m[2] - 1; SFX.click(); }
      if (e.code === 'Escape' && this.done){ const d = this.done; this.done = null; d(null); }
    },
    click(x, y){
      if (y > 505){ const i = Math.floor((x - 12) / 156); if (i >= 0 && i < 6){ this.beak = i; SFX.click(); } return; }
      this.lane = x < 370 ? 0 : x < 590 ? 1 : 2;
    },
    draw(g){
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#9fd3a8'); gr.addColorStop(1, '#3f7d3a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 7; k++){ g.fillStyle = k % 2 ? '#2e6a2e' : '#3c7d36'; circ(g, k * 160 + 20, 470, 60); }
      LANES.forEach((x, i) => { g.fillStyle = i === this.lane ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.07)'; g.fillRect(x - 70, 100, 140, 400); });
      for (const it of this.active){ g.fillStyle = 'rgba(255,250,235,.9)'; circ(g, LANES[it.lane], it.y, 32); drawEmoji(g, it.f.e, LANES[it.lane], it.y, 42); textOut(g, it.f.n, LANES[it.lane], it.y + 34, 'bold 14px "Atkinson Hyperlegible", sans-serif', '#fff'); }
      const B = BEAKS[this.beak];
      drawBird(g, LANES[this.lane], 450, 2.3, { col:B.col, shape:B.shape, dir:1, t:this.t });
      textOut(g, `${B.art} ${B.name}`, LANES[this.lane], 405, 'bold 15px "Atkinson Hyperlegible", sans-serif', '#ffe9a8');
      for (const p of this.fx){ g.globalAlpha = clamp(p.life, 0, 1); g.fillStyle = '#ffe9a8'; circ(g, p.x, p.y, 4); } g.globalAlpha = 1;
      BEAKS.forEach((b, i) => {
        const x = 12 + i * 156, on = i === this.beak;
        g.fillStyle = on ? '#f6ecd2' : 'rgba(15,32,38,.8)'; rrect(g, x, 510, 148, 80, 10);
        if (on){ g.strokeStyle = '#e2742f'; g.lineWidth = 3; g.beginPath(); g.roundRect ? g.roundRect(x, 510, 148, 80, 10) : g.rect(x, 510, 148, 80); g.stroke(); }
        textOut(g, `${i + 1}`, x + 16, 530, '18px "Lilita One", sans-serif', on ? '#e2742f' : '#ffe9a8', 'rgba(0,0,0,0)');
        drawBird(g, x + 110, 540, 0.8, { col:b.col, shape:b.shape, dir:1, noShadow:true });
        textOut(g, b.name, x + 74, 566, 'bold 13px "Atkinson Hyperlegible", sans-serif', on ? '#2a2119' : '#fff', 'rgba(0,0,0,0)');
        textOut(g, b.beakShort, x + 74, 582, '12px "Atkinson Hyperlegible", sans-serif', on ? '#5c4d3c' : '#cfd8d2', 'rgba(0,0,0,0)');
      });
      g.fillStyle = 'rgba(15,32,38,.85)'; g.fillRect(0, 56, W, 40);
      textOut(g, `Schnabel-Jagd · ${this.caught} / ${TOTAL}`, 20, 76, '18px "Lilita One", sans-serif', '#ffe9a8', 'rgba(0,0,0,0)', 'left');
      if (this.tickerT > 0) textWrap(g, this.ticker, W / 2, 120, 880, 'bold 17px "Atkinson Hyperlegible", sans-serif');
      if (this.ended) textOut(g, 'Geschafft!', W / 2, 280, '54px "Lilita One", sans-serif', '#ffe9a8');
    },
  };
}

/* ---------- Merkmal-Sammler (canvas) ---------- */
function makeCollector(){
  const scrolls = [], fakes = [];
  const free = (x, y) => scrolls.every(s => Math.abs(s.x - x) > 250 || Math.abs(s.y - y) > 46) && Math.hypot(x - 360, y - 540) > 90;
  MERKMALE.forEach(m => { let x, y, k = 0; do { x = 130 + Math.random() * 470; y = 150 + Math.random() * 410; k++; } while (!free(x, y) && k < 2000); scrolls.push({ m, x, y, got:false }); });
  sample(FAKES, 4).forEach(f => fakes.push({ f, x:80 + Math.random() * 580, y:140 + Math.random() * 300, vx:(Math.random() < 0.5 ? -1 : 1) * (55 + Math.random() * 40), vy:(Math.random() < 0.5 ? -1 : 1) * (45 + Math.random() * 40) }));
  return {
    pauseOnModal:true, p:{ x:360, y:545 }, t:0, got:0, hits:0, cool:0, msg:'', msgT:0, target:null, ended:false, endT:0, dir:1,
    enter(){ $('#quest').hidden = true; },
    update(dt){
      this.t += dt; this.cool -= dt; this.msgT -= dt;
      if (this.ended){ this.endT -= dt; if (this.endT <= 0 && this.done){ const d = this.done; this.done = null; d({ hits:this.hits }); } return; }
      let dx = (down('KeyD', 'ArrowRight') ? 1 : 0) - (down('KeyA', 'ArrowLeft') ? 1 : 0), dy = (down('KeyS', 'ArrowDown') ? 1 : 0) - (down('KeyW', 'ArrowUp') ? 1 : 0);
      if (dx || dy) this.target = null;
      else if (this.target){ const vx = this.target.x - this.p.x, vy = this.target.y - this.p.y, d = Math.hypot(vx, vy); if (d < 5) this.target = null; else { dx = vx / d; dy = vy / d; } }
      const l = Math.hypot(dx, dy); this.moving = !!l;
      if (l){ if (dx) this.dir = dx > 0 ? 1 : -1; this.p.x = clamp(this.p.x + dx / l * 200 * dt, 30, 700); this.p.y = clamp(this.p.y + dy / l * 200 * dt, 120, H - 25); }
      for (const s of scrolls){ if (!s.got && Math.hypot(s.x - this.p.x, s.y - this.p.y) < 40){ s.got = true; this.got++; SFX.pick(); speak(s.m.de, 1); addFeathers(2); this.msg = '✔ ' + s.m.de; this.msgT = 2.2; if (this.got === MERKMALE.length){ this.ended = true; this.endT = 1.8; SFX.win(); } } }
      for (const f of fakes){
        f.x += f.vx * dt; f.y += f.vy * dt; if (f.x < 70 || f.x > 660) f.vx *= -1; if (f.y < 130 || f.y > H - 40) f.vy *= -1;
        if (this.cool <= 0 && Math.hypot(f.x - this.p.x, f.y - this.p.y) < 36){
          this.hits++; this.cool = 1.2; SFX.bad(); this.msg = `✘ „Vögel ${f.f.de}“ ist eine Lüge! ${f.f.es}`; this.msgT = 3.5;
          const a = Math.atan2(this.p.y - f.y, this.p.x - f.x); this.p.x = clamp(this.p.x + Math.cos(a) * 70, 30, 700); this.p.y = clamp(this.p.y + Math.sin(a) * 70, 120, H - 25);
        }
      }
    },
    key(e){ if (e.code === 'Escape' && this.done){ const d = this.done; this.done = null; d(null); } },
    click(x, y){ if (x < 720) this.target = { x, y }; },
    draw(g){
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#bcd6ea'); gr.addColorStop(1, '#eef3f6'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = '#9aa6b3'; g.beginPath(); g.moveTo(0, 200); g.lineTo(120, 120); g.lineTo(260, 190); g.lineTo(400, 110); g.lineTo(560, 200); g.lineTo(720, 130); g.lineTo(720, 230); g.lineTo(0, 260); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(90, 140); g.lineTo(120, 120); g.lineTo(150, 138); g.fill(); g.beginPath(); g.moveTo(370, 128); g.lineTo(400, 110); g.lineTo(432, 130); g.fill();
      for (const s of scrolls) if (!s.got) drawScroll(g, s.x, s.y + Math.sin(this.t * 2 + s.x) * 2, s.m.short);
      for (const f of fakes){ drawScroll(g, f.x, f.y, 'Vögel ' + f.f.de, '#5b3f86', '#fff'); drawEmoji(g, '🎭', f.x, f.y - 26, 16); }
      g.save(); if (this.cool > 0 && Math.floor(this.t * 20) % 2) g.globalAlpha = 0.5;
      drawRanger(g, this.p.x, this.p.y, 1.6, this.dir, this.t, this.moving, S.hat && (SHOP.find(s => s.id === S.hat) || {}).emoji); g.restore();
      g.fillStyle = 'rgba(15,32,38,.88)'; rrect(g, 728, 104, 222, 486, 12);
      textOut(g, `Merkmale ${this.got} / 10`, 839, 126, '19px "Lilita One", sans-serif', '#ffe9a8', 'rgba(0,0,0,0)');
      scrolls.forEach((s, i) => textOut(g, (s.got ? '✔ ' : '□ ') + (s.got ? s.m.short : '? ? ?'), 742, 158 + i * 42, `${s.got ? 'bold ' : ''}14px "Atkinson Hyperlegible", sans-serif`, s.got ? '#bff0c8' : '#8fa0a8', 'rgba(0,0,0,0)', 'left'));
      g.fillStyle = 'rgba(15,32,38,.85)'; g.fillRect(0, 56, 720, 40);
      textOut(g, `Merkmal-Sammler · Lügen getroffen: ${this.hits}`, 20, 76, '18px "Lilita One", sans-serif', '#ffe9a8', 'rgba(0,0,0,0)', 'left');
      if (this.msgT > 0) textWrap(g, this.msg, 360, 115, 680, 'bold 15px "Atkinson Hyperlegible", sans-serif', '#fff', 'rgba(15,32,38,.92)', 20);
      if (this.ended) textOut(g, 'Alle 10 Merkmale!', 360, 300, '48px "Lilita One", sans-serif', '#2f6f8a', '#fff');
    },
  };
}
async function collectorPart2(r){
  const opts = shuffle([...FLIGHTLESS, ...sample(FLYERS, 4)]);
  const chosen = new Set();
  const p2 = await new Promise(done => {
    const render = () => {
      openModal(`<h2>Welche Vögel können nicht fliegen?</h2><p class="sub">Wähle <b>vier</b> Vögel. <span class="es-inline">Elige las cuatro aves que no pueden volar.</span></p>
        <div class="chips">${opts.map(id => `<button class="chip ${chosen.has(id) ? 'sel' : ''}" type="button" data-id="${id}">${wordHTML(WMAP[id])}</button>`).join('')}</div>
        <div class="fb-actions"><button class="btn" id="fl-ok" type="button" ${chosen.size === 4 ? '' : 'disabled'}>Prüfen</button></div>`);
      $$('.chip', sheet).forEach(b => b.onclick = () => { const id = b.dataset.id; chosen.has(id) ? chosen.delete(id) : chosen.size < 4 && chosen.add(id); SFX.click(); render(); });
      $('#fl-ok').onclick = () => { const good = [...chosen].filter(id => FLIGHTLESS.includes(id)).length; FLIGHTLESS.forEach(id => onAnswer(chosen.has(id) ? 'right' : 'wrong', { id })); done(good); };
    };
    render();
  });
  const why = { type:'mc', prompt:'Warum können der Strauß, der Emu, der Pinguin und der Kiwi nicht fliegen?', options:shuffle([
    { html:'Sie sind zu schwer.', val:'ok' }, { html:'Sie haben keine Flügel.', val:'a' }, { html:'Sie haben keine Federn.', val:'b' }, { html:'Sie sind wechselwarm.', val:'c' }]), correct:'ok',
    answerHTML:'Sie sind zu schwer.', explain:`${p2} von 4 Vögeln richtig gewählt. Flugunfähig: der Strauß, der Emu, der Pinguin, der Kiwi.`, explainEs:'Son demasiado pesados (zu schwer). ¡Sí tienen alas y plumas!', es:'¿Por qué no pueden volar?', sayAfter:'Sie sind zu schwer.' };
  openModal(`<h2>Und warum?</h2><div id="qmount"></div>`);
  const w = await askQ(why, $('#qmount'), { autoNext:false });
  closeModal();
  const part1 = 10 * 10 / (10 + r.hits);
  return { correct:part1 + p2 * 0.5 + (w.result === 'right' ? 1 : 0), total:13 };
}
