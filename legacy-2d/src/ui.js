/* ============================================================
   UI — title, dialogues, study cards, Lexikon, shop, menu, parents
   ============================================================ */
function portrait(kind){
  const c = document.createElement('canvas'); c.width = 240; c.height = 240; c.className = 'portrait';
  const g = c.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#e9dcbc'; g.beginPath(); g.arc(60, 60, 58, 0, TAU); g.fill();
  if (kind === 'geier') drawBoss(g, 'geier', 64, 60, 2.2, 0);
  else if (BOSSES[kind]) drawBoss(g, BOSSES[kind].kind, 64, 60, 2.2, 0);
  else drawNPC(g, kind, 58, 62, 2.4, 0, 1);
  return c;
}
function dialogLines(name, lines, kind){
  return new Promise(res => {
    let k = 0;
    const render = () => {
      const [de, es] = lines[k];
      openModal(`<div class="dlg"><div class="dlg-face"></div><div class="dlg-body"><div class="who">${esc(name)}</div>
        <p class="de">${esc(de)} ${speakBtn(de)}</p><p class="es" ${S.settings.es ? '' : 'hidden'} id="dlg-es">${esc(es)}</p>
        <div class="fb-actions"><span class="dots">${lines.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</span>
        <button class="btn tiny ghost" id="dlg-es-b" type="button">🇪🇸 Español</button>
        ${k < lines.length - 1 ? '<button class="btn tiny ghost" id="dlg-skip" type="button">Überspringen</button>' : ''}
        <button class="btn" id="dlg-next" type="button">${k < lines.length - 1 ? 'Weiter ⏎' : 'Okay! ⏎'}</button></div></div></div>`);
      sheet.querySelector('.dlg-face').appendChild(portrait(kind));
      $('#dlg-es-b').onclick = () => { $('#dlg-es').hidden = !$('#dlg-es').hidden; };
      $('#dlg-next').onclick = next;
      const sk = $('#dlg-skip'); if (sk) sk.onclick = end;
      speak(de, 0.9);
    };
    const next = () => { k++; if (k >= lines.length) end(); else render(); };
    const end = () => { pop(); if (HAS_TTS) speechSynthesis.cancel(); closeModal(); res(); };
    const pop = pushKeys(e => { if (e.code === 'Enter' || e.code === 'Space'){ next(); return true; } if (e.code === 'Escape'){ end(); return true; } return false; });
    render();
  });
}
async function talkNPC(z){
  const N = NPCS[z];
  if (!S.met[z]){
    await dialogLines(N.name, N.lines, N.kind);
    S.met[z] = true; save(); Overworld.refreshObjective();
    if (z > 0) toast('📘 Tipp: Die Lernkarte dieser Zone findest du im Menü (Esc) oder hier beim Vogel.');
    return;
  }
  openModal(`<div class="dlg"><div class="dlg-face"></div><div class="dlg-body"><div class="who">${esc(N.name)}</div><p class="de">Hallo! Was möchtest du?</p><p class="es">¡Hola! ¿Qué quieres hacer?</p>
    <div class="menu-list">${z > 0 ? '<button class="btn" id="n-card" type="button">📘 Lernkarte ansehen</button>' : ''}<button class="btn alt" id="n-again" type="button">🔁 Nochmal erklären</button><button class="btn ghost" id="n-bye" type="button">Tschüss!</button></div></div></div>`, '', { closable:true });
  sheet.querySelector('.dlg-face').appendChild(portrait(N.kind));
  if (z > 0) $('#n-card').onclick = () => openLernkarte(z);
  $('#n-again').onclick = async () => { closeModal(); await dialogLines(N.name, N.lines, N.kind); };
  $('#n-bye').onclick = closeModal;
}

/* ---------- study card per zone ---------- */
function openLernkarte(z){
  const Z = ZONES[z], N = NPCS[z];
  const lines = N.lines.slice(0, -1).map(([de, es]) => `<li><span class="de">${esc(de)}</span> ${speakBtn(de)}<br><span class="es">${esc(es)}</span></li>`).join('');
  const terms = WORDS.filter(w => w.t === Z.topic).map(w => `<button class="term ${artClass(w.art)}" type="button" data-say="${esc(nounLabel(w))}" title="${esc(w.es)}">${esc(nounLabel(w))}<small>${esc(w.es)}</small></button>`).join('');
  let extra = '';
  if (z <= 3){
    const key = Z.topic, D = DIAGRAMS[key];
    extra = `<h3>${esc(D.title)}</h3><div class="label-wrap"><div class="diag-box">${diagramSVG(key)}</div><ol class="slots">${D.labels.map(L => `<li><span class="num">${L.n}</span> ${labelHTML(L)} ${speakBtn(labelText(L))}</li>`).join('')}</ol></div>`;
  }
  if (z === 3) extra += `<h3>Der Weg der Nahrung</h3><p class="path">Schnabel → <b class="art-der">der Kropf</b> → <b class="art-der">der Drüsenmagen</b> → <b class="art-der">der Kaumagen</b> → <b class="art-der">der Darm</b> → <b class="art-die">die Kloake</b></p><p class="es">pico → buche → proventrículo → molleja → intestino → cloaca</p>`;
  if (z === 4) extra = `<h3>Schnabel und Nahrung (Seite 7)</h3><table class="beak-table"><tr><th>Vogel</th><th>Schnabelform</th><th>Nahrung</th></tr>${BEAKS.map(b => `<tr><td>${birdHTML(b)}<br><small class="muted">${esc(WMAP[b.id].es)}</small></td><td>${esc(b.beakName)}</td><td>${esc(b.food)}</td></tr>`).join('')}</table>
    <h3>So schreibst du den Satz</h3><p class="path">Der Buntspecht hat einen kräftig<b>en</b> Meißelschnabel, <b>um</b> Larven <b>zu</b> fressen. ${speakBtn('Der Buntspecht hat einen kräftigen Meißelschnabel, um Larven zu fressen.')}</p><p class="es">«einen» + adjetivo terminado en <b>-en</b> + Schnabel. «um … zu» + infinitivo = «para …».</p>`;
  if (z === 5) extra = `<h3>Die 10 Merkmale der Vögel</h3><ol class="merk">${MERKMALE.map(m => `<li>${esc(m.de)} ${speakBtn(m.de)} <span class="es-inline">${esc(m.es)}</span></li>`).join('')}</ol><p><b>Flugunfähig:</b> der Strauß, der Emu, der Pinguin, der Kiwi – weil sie zu schwer sind.</p>
    <h3>Aufgaben-Wörter</h3><div class="terms">${WORDS.filter(w => w.t === 'op').map(w => `<button class="term ${artClass(w.art)}" type="button" data-say="${esc(nounLabel(w))}">${esc(nounLabel(w))}<small>${esc(w.es)}</small></button>`).join('')}</div>`;
  openModal(`<div class="series-head"><h2>📘 Lernkarte: ${esc(TOPICS[Z.topic])}</h2><div class="prog">${esc(Z.page)}</div></div>
    <ul class="card-lines">${lines}</ul>${extra}<h3>Fachbegriffe <span class="muted">(klicken = anhören)</span></h3><div class="terms">${terms}</div>
    <div class="fb-actions"><button class="btn" id="lk-ok" type="button">Schließen</button></div>`, 'wide', { closable:true });
  $('#lk-ok').onclick = closeModal;
}

/* ---------- Lexikon ---------- */
let lexTab = 'aussen', lexQ = '';
function openLexikon(){
  const all = WORDS.length, counts = [0, 0, 0, 0]; WORDS.forEach(w => counts[tier(w.id)]++);
  const render = () => {
    const q = fold(lexQ.trim());
    const list = WORDS.filter(w => q ? (fold(w.de).includes(q) || fold(w.es).includes(q)) : w.t === lexTab);
    const cards = list.map(w => { const tr = tier(w.id); return `<button class="lcard t${tr} ${artClass(w.art)}" type="button" data-say="${esc(nounLabel(w))}">
      <span class="tier">${['○', '🥉', '🥈', '🥇'][tr]}</span><b>${esc(nounLabel(w))}</b>${w.pl ? `<small>Pl.: die ${esc(w.pl)}</small>` : w.po ? '<small>nur Plural</small>' : ''}<span class="es">${esc(w.es)}</span></button>`; }).join('');
    openModal(`<div class="series-head"><h2>📖 Vogel-Lexikon</h2><div class="prog">🥇 ${counts[3]} · 🥈 ${counts[2]} · 🥉 ${counts[1]} · ${Math.round((counts[1] + counts[2] * 2 + counts[3] * 3) / (all * 3) * 100)} %</div></div>
      <p class="sub">Jedes Wort wird Bronze → Silber → Gold, wenn du es mehrmals (mit Pausen) richtig weißt. Klicke eine Karte zum Anhören. <span class="es-inline">Cada palabra sube de bronce a oro cuando la aciertas varias veces.</span></p>
      <div class="tabs">${Object.keys(TOPICS).map(t => `<button class="tab ${t === lexTab && !lexQ ? 'on' : ''}" type="button" data-t="${t}">${esc(TOPICS[t])}</button>`).join('')}<input type="search" id="lex-q" placeholder="Suchen (Deutsch oder Spanisch)" value="${esc(lexQ)}" aria-label="Suchen"></div>
      <div class="lgrid">${cards || '<p>Nichts gefunden.</p>'}</div>
      <div class="legend"><span class="art-der">der = blau</span> · <span class="art-die">die = rot</span> · <span class="art-das">das = grün</span></div>
      <div class="fb-actions"><button class="btn" id="lx-ok" type="button">Schließen</button></div>`, 'wide', { closable:true });
    $$('.tab', sheet).forEach(b => b.onclick = () => { lexTab = b.dataset.t; lexQ = ''; render(); });
    const qi = $('#lex-q'); qi.oninput = () => { lexQ = qi.value; const pos = qi.selectionStart; render(); const n = $('#lex-q'); n.focus(); n.setSelectionRange(pos, pos); };
    $('#lx-ok').onclick = closeModal;
  };
  render();
}

/* ---------- shop ---------- */
function openShop(){
  const render = () => {
    const rows = SHOP.map(it => {
      let act;
      if (it.type === 'hat'){
        if (S.owned[it.id]) act = S.hat === it.id ? `<button class="btn tiny ghost" data-a="off" data-id="${it.id}" type="button">Absetzen</button>` : `<button class="btn tiny alt" data-a="on" data-id="${it.id}" type="button">Aufsetzen</button>`;
        else act = `<button class="btn tiny" data-a="buy" data-id="${it.id}" type="button" ${S.feathers < it.price ? 'disabled' : ''}>${it.price} 🪶</button>`;
      } else if (it.type === 'heart') act = S.maxHearts >= 8 ? '<span class="muted">Maximum</span>' : `<button class="btn tiny" data-a="buy" data-id="${it.id}" type="button" ${S.feathers < it.price ? 'disabled' : ''}>${it.price} 🪶</button>`;
      else act = `<button class="btn tiny" data-a="buy" data-id="${it.id}" type="button" ${S.feathers < it.price ? 'disabled' : ''}>${it.price} 🪶</button>`;
      return `<div class="shop-row"><span class="shop-ico">${it.emoji}</span><span class="shop-name">${esc(it.name)}${it.type === 'joker' ? ` <span class="muted">(du hast ${S.jokers})</span>` : it.type === 'heart' ? ` <span class="muted">(jetzt ${S.maxHearts})</span>` : ''}</span>${act}</div>`;
    }).join('');
    openModal(`<div class="series-head"><h2>🛒 Laden</h2><div class="prog">🪶 ${S.feathers}</div></div><p class="sub">Tausche deine Federn. <span class="es-inline">Cambia tus plumas por premios.</span></p>${rows}
      <div class="fb-actions"><button class="btn" id="sh-ok" type="button">Schließen</button></div>`, '', { closable:true });
    $$('[data-a]', sheet).forEach(b => b.onclick = () => {
      const it = SHOP.find(s => s.id === b.dataset.id), a = b.dataset.a;
      if (a === 'on') S.hat = it.id; else if (a === 'off') S.hat = null;
      else if (S.feathers >= it.price){
        S.feathers -= it.price; SFX.pick();
        if (it.type === 'hat'){ S.owned[it.id] = true; S.hat = it.id; }
        else if (it.type === 'heart'){ S.maxHearts++; S.hearts = S.maxHearts; }
        else S.jokers++;
        toast(`${it.emoji} ${esc(it.name)} gekauft!`, 'ok');
      }
      save(); hud(); render();
    });
    $('#sh-ok').onclick = closeModal;
  };
  render();
}

/* ---------- daily training ---------- */
async function startDaily(){
  const ids = unlockedTopics().flatMap(t => topicIds(t));
  const due = dueCount(), first = S.lastDaily !== todayStr();
  const go = await new Promise(res => {
    openModal(`<div class="center"><div class="big-emoji">🌅</div><h2>Morgen-Training</h2><p>10 Fragen zu Wörtern, die du bald vergessen würdest. ${due ? `<b>${due}</b> Wörter warten auf dich.` : ''}</p>
      <p class="es">10 preguntas con las palabras que toca repasar hoy. Es la mejor forma de no olvidarlas.</p>${first ? '<p class="gold-note">Tagesbonus: +40 🪶</p>' : '<p class="muted">Heute schon gemacht – du kannst trotzdem üben.</p>'}
      <div class="fb-actions"><button class="btn ghost" id="dy-no" type="button">Später</button><button class="btn" id="dy-go" type="button">Los! ⏎</button></div></div>`);
    const pop = pushKeys(e => { if (e.code === 'Enter'){ pop(); res(true); return true; } if (e.code === 'Escape'){ pop(); res(false); return true; } return false; });
    $('#dy-go').onclick = () => { pop(); res(true); }; $('#dy-no').onclick = () => { pop(); res(false); };
  });
  if (!go){ closeModal(); return; }
  const qs = pickWords(ids, 10).map(id => qFromWord(id, ['es2de', 'de2es', 'art', 'def', 'ex', 'audio', 'type', 'type']));
  const r = await runSeries('🌅 Morgen-Training', qs);
  if (first){ S.lastDaily = todayStr(); S.dailyDays++; addFeathers(40); if (S.dailyDays >= 3) badge('daily3'); }
  S.stats.days[todayStr()] = (S.stats.days[todayStr()] || 0) + 1; save();
  openModal(`<div class="center"><h2>Training fertig!</h2><p class="score-big">${r.correct} / ${r.total}</p><p class="es">¡Bien hecho! Vuelve mañana para el siguiente repaso.</p><div class="fb-actions"><button class="btn" id="dy-ok" type="button">Weiter</button></div></div>`);
  $('#dy-ok').onclick = closeModal;
}

/* ---------- interactions ---------- */
function interact(e){
  player.target = null; player.targetEnt = null;
  if (e.type === 'npc') return talkNPC(e.z);
  if (e.type === 'st') return startStation(e.z, e.i);
  if (e.type === 'boss'){
    if (!S.bosses[e.z] && stationsDone(e.z) < 3){ toast(`🔒 Spiele zuerst an 3 Schreinen (${stationsDone(e.z)}/3).`); return; }
    return bossConfirm(e.z);
  }
  if (e.type === 'bld'){ ({ lexikon:openLexikon, laden:openShop, altar:startDaily, arena:arenaConfirm })[e.kind](); return; }
  if (e.type === 'tower'){
    if (!(S.bosses[5] || S.unlockAll)){ toast('🔒 Der Prüfungsturm öffnet sich, wenn alle 5 Bosse besiegt sind.'); return; }
    startExam();
  }
}
function bossConfirm(z){
  const B = BOSSES[z];
  openModal(`<div class="dlg"><div class="dlg-face"></div><div class="dlg-body"><div class="who">${esc(B.name)} <span class="es-inline">${esc(B.es)}</span></div>
    <p>Bosskampf in drei Phasen: <b>Auswählen</b> → <b>Bilder &amp; Sätze</b> → <b>Schreiben</b>. Schnelle richtige Antworten (unter 6 Sekunden) sind kritische Treffer!</p>
    <p class="es">Combate en tres fases: elegir → imágenes y frases → escribir. ¡Las respuestas rápidas hacen daño doble! Tus corazones se rellenan antes del combate.</p>
    <div class="fb-actions"><button class="btn ghost" id="bc-no" type="button">Noch nicht</button><button class="btn" id="bc-go" type="button">Kämpfen! ⚔️</button></div></div></div>`, '', { closable:true });
  sheet.querySelector('.dlg-face').appendChild(portrait(z));
  $('#bc-no').onclick = closeModal;
  $('#bc-go').onclick = () => { closeModal(); S.hearts = S.maxHearts; hud(); startBoss(z); };
}
function arenaConfirm(){
  openModal(`<div class="center"><div class="big-emoji">⚔️</div><h2>Arena</h2><p>Endlos-Kampf mit den Wörtern, die dir noch schwerfallen. Du hast 3 Arena-Herzen. Rekord: <b>${S.arenaBest}</b></p>
    <p class="es">Combate sin fin con las palabras que aún te cuestan. Tienes 3 corazones de arena.</p>
    <div class="fb-actions"><button class="btn ghost" id="an-no" type="button">Zurück</button><button class="btn" id="an-go" type="button">Start!</button></div></div>`, '', { closable:true });
  $('#an-no').onclick = closeModal; $('#an-go').onclick = () => { closeModal(); startArena(); };
}

/* ---------- menu ---------- */
function openMenu(){
  const zs = [1, 2, 3, 4, 5].filter(z => z <= S.zone || S.met[z]);
  openModal(`<h2>Menü</h2><div class="menu-grid">
      <button class="btn" id="m-resume" type="button">▶ Weiterspielen</button>
      <button class="btn alt" id="m-lex" type="button">📖 Lexikon (B)</button>
      <button class="btn alt" id="m-badges" type="button">🏅 Abzeichen</button>
      <button class="btn alt" id="m-settings" type="button">⚙️ Einstellungen</button>
      <button class="btn alt" id="m-help" type="button">❓ Hilfe / Ayuda</button>
      <button class="btn ghost hold" id="m-parents" type="button"><span class="fill"></span>👪 Eltern-Bereich (gedrückt halten)</button>
    </div>
    <h3>📘 Lernkarten</h3><div class="menu-grid">${zs.map(z => `<button class="btn ghost" data-lk="${z}" type="button">${esc(ZONES[z].name)} · ${esc(TOPICS[ZONES[z].topic])}</button>`).join('')}</div>`, '', { closable:true });
  $('#m-resume').onclick = closeModal; $('#m-lex').onclick = openLexikon; $('#m-badges').onclick = openBadges; $('#m-settings').onclick = openSettings; $('#m-help').onclick = openHelp;
  $$('[data-lk]', sheet).forEach(b => b.onclick = () => openLernkarte(+b.dataset.lk));
  holdButton($('#m-parents'), openParents);
}
function holdButton(btn, fn){
  let t = null;
  const start = e => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(() => { btn.classList.remove('holding'); fn(); }, 1500); };
  const stop = () => { clearTimeout(t); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
}
function openBadges(){
  openModal(`<h2>🏅 Abzeichen</h2><div class="badges">${Object.entries(BADGES).map(([k, b]) => `<div class="badge ${S.badges[k] ? 'on' : ''}"><span class="bi">${b.i}</span><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`).join('')}</div>
    <p class="muted">Beste Serie: ${S.bestCombo} · Arena-Rekord: ${S.arenaBest} · Richtige Artikel: ${S.artRight}</p><div class="fb-actions"><button class="btn" id="bd-ok" type="button">Zurück</button></div>`, '', { closable:true });
  $('#bd-ok').onclick = openMenu;
}
function openSettings(){
  const row = (id, label, on) => `<label class="set-row"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}> ${label}</label>`;
  openModal(`<h2>⚙️ Einstellungen</h2>
    ${row('st-sound', 'Geräusche <span class="es-inline">sonidos</span>', S.settings.sound)}
    ${row('st-tts', 'Deutsche Stimme (Wörter vorlesen) <span class="es-inline">voz en alemán</span>', S.settings.tts)}
    ${row('st-es', 'Spanische Hilfe immer zeigen <span class="es-inline">mostrar siempre la ayuda en español</span>', S.settings.es)}
    <p class="muted">${HAS_TTS ? (deVoice ? `Stimme: ${esc(deVoice.name)}` : 'Keine deutsche Stimme gefunden. Tipp: In den Systemeinstellungen eine deutsche Stimme installieren.') : 'Dieser Browser kann nicht vorlesen.'} <button class="btn tiny ghost" type="button" data-say="Der Schnabel. Die Kloake. Das Brustbein.">🔊 Test</button></p>
    <label class="set-row">Name: <input type="text" id="st-name" value="${esc(S.name)}" maxlength="20"></label>
    <div class="fb-actions"><button class="btn" id="se-ok" type="button">Fertig</button></div>`, '', { closable:true });
  $('#st-sound').onchange = e => { S.settings.sound = e.target.checked; hud(); save(); };
  $('#st-tts').onchange = e => { S.settings.tts = e.target.checked; hud(); save(); };
  $('#st-es').onchange = e => { S.settings.es = e.target.checked; save(); };
  $('#st-name').onchange = e => { S.name = e.target.value.trim() || 'Ranger'; save(); };
  $('#se-ok').onclick = openMenu;
}
function openHelp(){
  openModal(`<h2>❓ So spielst du</h2>
    <table class="res-table help"><tr><td>WASD / Pfeiltasten</td><td>laufen · caminar</td></tr><tr><td>Mausklick</td><td>hinlaufen · ir al punto</td></tr><tr><td>E / Enter / Leertaste</td><td>sprechen, spielen · hablar, jugar</td></tr>
    <tr><td>1–4</td><td>Antwort wählen · elegir respuesta</td></tr><tr><td>J / K / L</td><td>der / die / das</td></tr><tr><td>R / F</td><td>richtig / falsch</td></tr><tr><td>B</td><td>Lexikon</td></tr><tr><td>Esc</td><td>Menü</td></tr></table>
    <h3>Der Plan für die Prüfung</h3><ol><li><b>Tag 1:</b> Federwiese + Knochenhöhle (Körper außen, Skelett).</li><li><b>Tag 2:</b> Morgen-Training, dann Magen-Moor + Schnabel-Wald.</li><li><b>Tag 3:</b> Morgen-Training, Merkmal-Gipfel, dann der Prüfungsturm. Danach: Arena und Lexikon, bis alles Gold ist.</li></ol>
    <p class="es">Plan: día 1 – cuerpo y esqueleto; día 2 – órganos y picos; día 3 – características y examen de prueba. Cada día empieza en el Altar de la Mañana.</p>
    <p><b>Farben:</b> <span class="art-der">der = blau</span> · <span class="art-die">die = rot</span> · <span class="art-das">das = grün</span>. <b>Sterne:</b> ab 60 % ★, ab 80 % ★★, ab 95 % ★★★.</p>
    <div class="fb-actions"><button class="btn" id="hp-ok" type="button">Zurück</button></div>`, 'wide', { closable:true });
  $('#hp-ok').onclick = openMenu;
}

/* ---------- parent area ---------- */
function openParents(){
  const h = Math.floor(S.stats.ms / 3600000), m = Math.floor(S.stats.ms / 60000) % 60;
  const counts = [0, 0, 0, 0]; WORDS.forEach(w => counts[tier(w.id)]++);
  const topicRows = Object.keys(TOPICS).map(t => { const s = S.stats.topic[t] || { r:0, w:0 }, n = s.r + s.w, p = n ? Math.round(s.r / n * 100) : 0;
    return `<tr><td>${esc(TOPICS[t])}</td><td><div class="pbar"><i style="width:${p}%"></i></div></td><td class="num">${n ? p + ' %' : '–'}</td><td class="num muted">${n}</td></tr>`; }).join('');
  const weak = WORDS.filter(w => S.words[w.id] && S.words[w.id].w > 0).sort((a, b) => (S.words[b.id].w - S.words[b.id].r * 0.3) - (S.words[a.id].w - S.words[a.id].r * 0.3)).slice(0, 15);
  const st = [1, 2, 3, 4, 5].map(z => `<tr><td>${esc(ZONES[z].name)}</td>${[0, 1, 2, 3].map(i => `<td>${'★'.repeat(S.stations[z + '-' + i] || 0) || '·'}</td>`).join('')}<td>${S.bosses[z] ? '✔' : '–'}</td></tr>`).join('');
  openModal(`<div class="series-head"><h2>👪 Eltern-Bereich</h2><div class="prog">${esc(S.name)}</div></div>
    <p class="muted">Spielzeit: ${h} h ${m} min · Tage mit Training: ${Object.keys(S.stats.days).length} (${Object.keys(S.stats.days).slice(-5).join(', ') || '–'}) · Lexikon: 🥇 ${counts[3]} 🥈 ${counts[2]} 🥉 ${counts[1]} von ${WORDS.length}</p>
    <h3>Treffer pro Thema</h3><table class="res-table">${topicRows}</table>
    <h3>Schwierige Wörter</h3>${weak.length ? `<table class="res-table">${weak.map(w => `<tr><td>${wordHTML(w)}</td><td>${esc(w.es)}</td><td class="num">✘ ${S.words[w.id].w} / ✔ ${S.words[w.id].r}</td><td>${TIER_NAME[tier(w.id)]}</td></tr>`).join('')}</table>` : '<p class="muted">Noch keine Fehler gespeichert.</p>'}
    <h3>Schreine und Bosse</h3><table class="res-table"><tr><th>Zone</th><th>1</th><th>2</th><th>3</th><th>4</th><th>Boss</th></tr>${st}</table>
    <h3>Prüfungsturm</h3><p>${S.exams.length ? S.exams.slice(-6).map(e => `${e.date}: <b>${e.pct} %</b> (Note ~${e.note})`).join(' · ') : '<span class="muted">Noch nicht gemacht.</span>'}</p>
    <h3>Werkzeuge</h3>
    <div class="menu-grid"><button class="btn alt" id="pa-unlock" type="button">🔓 Alle Zonen und den Turm öffnen</button><button class="btn alt" id="pa-export" type="button">💾 Spielstand sichern</button><button class="btn alt" id="pa-import" type="button">📥 Spielstand laden</button><button class="btn ghost" id="pa-reset" type="button">🗑 Alles zurücksetzen</button></div>
    <div id="pa-io"></div>
    <div class="fb-actions"><button class="btn" id="pa-ok" type="button">Schließen</button></div>`, 'wide', { closable:true });
  $('#pa-ok').onclick = closeModal;
  $('#pa-unlock').onclick = () => { S.zone = 5; S.unlockAll = true; save(); Overworld.refreshObjective(); toast('🔓 Alle Zonen und der Prüfungsturm sind offen.', 'ok'); };
  $('#pa-export').onclick = () => {
    const code = exportCode();
    $('#pa-io').innerHTML = `<p>Kopiere diesen Code und bewahre ihn auf (z. B. in einer Notiz). Damit kannst du den Spielstand auf einem anderen Gerät laden.</p><textarea id="pa-code" rows="4" readonly>${code}</textarea><button class="btn tiny" id="pa-copy" type="button">Kopieren</button>`;
    $('#pa-copy').onclick = () => { const ta = $('#pa-code'); navigator.clipboard.writeText(code).then(() => toast('Kopiert!', 'ok'), () => { ta.focus(); ta.select(); toast('Bitte mit Cmd/Strg+C kopieren.'); }); };
  };
  $('#pa-import').onclick = () => {
    $('#pa-io').innerHTML = `<p>Füge hier einen gesicherten Code ein:</p><textarea id="pa-in" rows="4"></textarea><button class="btn tiny" id="pa-load" type="button">Laden</button>`;
    $('#pa-load').onclick = () => { try { importCode($('#pa-in').value); location.reload(); } catch (e) { toast('Dieser Code ist ungültig. Bitte den ganzen Code einfügen.', 'bad'); } };
  };
  $('#pa-reset').onclick = () => {
    $('#pa-io').innerHTML = `<p><b>Wirklich alles löschen?</b> Sterne, Federn, Lexikon und Statistik gehen verloren.</p><button class="btn tiny" id="pa-yes" type="button">Ja, alles löschen</button> <button class="btn tiny ghost" id="pa-no" type="button">Abbrechen</button>`;
    $('#pa-no').onclick = () => { $('#pa-io').innerHTML = ''; };
    $('#pa-yes').onclick = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S = defaultState(); saveNow(); location.reload(); };
  };
}

/* ---------- title ---------- */
function showTitle(){
  $('#hud').hidden = true; $('#quest').hidden = true;
  const cont = S.started;
  openModal(`<div class="title-screen"><p class="eyebrow">Biologie · Die Vögel</p><h1>Die Vogel-Insel</h1>
    <p class="tagline">Ein Abenteuer über den Körperbau, das Skelett, die Organe, die Schnäbel und die Merkmale der Vögel.</p>
    <p class="es">Una aventura para aprender en alemán todo lo del examen de biología sobre las aves.</p>
    <label class="name-row">Dein Name: <input type="text" id="t-name" value="${esc(S.name)}" maxlength="20"></label>
    <div class="fb-actions center-actions"><button class="btn big" id="t-go" type="button">${cont ? 'Weiterspielen ▶' : 'Abenteuer starten ▶'}</button></div>
    <p class="muted small">Ton an! Die Wörter werden auf Deutsch vorgelesen. · WASD / Pfeiltasten · E · Esc</p></div>`, 'title');
  const go = () => {
    pop(); ac(); S.name = ($('#t-name').value || '').trim() || 'Ranger'; S.started = true; save(); closeModal();
    Overworld.demo = false;
    const p = S.pos && boxFree(S.pos.x, S.pos.y, 9) ? S.pos : PTS[0].spawn;
    player.x = p.x; player.y = p.y; player.zone = (() => { const i = tileAtPx(p.x, p.y); return i >= 0 ? zmap[i] : 0; })();
    cam.x = clamp(Math.round(player.x - W / 2), 0, MW * TS - W); cam.y = clamp(Math.round(player.y - H / 2), 0, MH * TS - H);
    setScene(Overworld);
    if (!S.met[0]) setTimeout(() => talkNPC(0), 300);
    else if (S.lastDaily !== todayStr()) setTimeout(() => toast('🌅 Das Morgen-Training wartet am Altar im Dorf! (+40 🪶)', 'gold'), 800);
  };
  const pop = pushKeys(e => { if (e.code === 'Enter' && !isField(e.target)){ go(); return true; } return false; });
  $('#t-go').onclick = go;
}

/* ---------- boot ---------- */
function boot(){
  genWorld(); renderWorld(); initEntities();
  $('#b-sound').onclick = () => { S.settings.sound = !S.settings.sound; save(); hud(); };
  $('#b-tts').onclick = () => { S.settings.tts = !S.settings.tts; save(); hud(); toast(S.settings.tts ? '🗣 Stimme an' : '🗣 Stimme aus'); };
  $('#b-lex').onclick = () => { if (!modalOpen() && scene === Overworld) openLexikon(); };
  $('#b-menu').onclick = () => { if (!modalOpen() && scene === Overworld) openMenu(); };
  modal.addEventListener('pointerdown', e => { if (e.target === modal && modal.dataset.closable === '1') closeModal(); });
  Overworld.demo = true; setScene(Overworld); hud();
  requestAnimationFrame(frame);
  showTitle();
}
boot();
