/* ============================================================
   UI — title, dialogues, study cards, inventory, shop, menu, parents, boot
   ============================================================ */
/* ---------- 3D portraits for dialogues ---------- */
const portraitCache = {};
let pRenderer = null;
function portraitURL(kind){
  if (portraitCache[kind]) return portraitCache[kind];
  try {
    if (!pRenderer){ pRenderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true }); pRenderer.setSize(220, 220); pRenderer.outputEncoding = THREE.sRGBEncoding; }
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(lin('#ffffff'), lin('#445'), 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(2, 4, 5); sc.add(dl);
    let m, h = 2.3, dist = 3.6;
    if (kind === 'geier' || BOSSES[kind]){ const B = bossModel(kind === 'geier' ? 'geier' : BOSSES[kind].kind); m = B.root; h = 6; dist = 11; }
    else m = npcModel(kind, 1);
    sc.add(m);
    const c = new THREE.PerspectiveCamera(35, 1, 0.1, 100); c.position.set(dist * 0.35, h + 0.2, dist); c.lookAt(0, h - 0.2, 0);
    pRenderer.render(sc, c);
    portraitCache[kind] = pRenderer.domElement.toDataURL();
  } catch (e) { portraitCache[kind] = ''; }
  return portraitCache[kind];
}
function faceImg(kind){ const u = portraitURL(kind); return u ? `<img src="${u}" alt="">` : ''; }

/* ---------- dialogues ---------- */
function dialogLines(name, lines, kind){
  return new Promise(res => {
    let k = 0;
    const render = () => {
      const [de, es] = lines[k];
      openModal(`<div class="dlg"><div class="dlg-face">${faceImg(kind)}</div><div class="dlg-body"><div class="who">${esc(name)}</div>
        <p class="de">${esc(de)} ${speakBtn(de)}</p><p class="es" ${S.settings.es ? '' : 'hidden'} id="dlg-es">${esc(es)}</p>
        <div class="fb-actions"><span class="dots">${lines.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</span>
        <button class="btn ghost tiny" id="dlg-es-b" type="button">🇪🇸 Español</button>
        ${k < lines.length - 1 ? '<button class="btn ghost tiny" id="dlg-skip" type="button">Überspringen</button>' : ''}
        <button class="btn" id="dlg-next" type="button">${k < lines.length - 1 ? 'Weiter ⏎' : 'Los geht’s ⏎'}</button></div></div></div>`);
      $('#dlg-es-b').onclick = () => { $('#dlg-es').hidden = !$('#dlg-es').hidden; };
      $('#dlg-next').onclick = next; const sk = $('#dlg-skip'); if (sk) sk.onclick = end;
      speak(de);
    };
    const next = () => { k++; if (k >= lines.length) end(); else render(); };
    const end = () => { pop(); if (curAudio) curAudio.pause(); closeModal(); res(); };
    const pop = pushKeys(e => { if (e.code === 'Enter' || e.code === 'Space'){ next(); return true; } if (e.code === 'Escape'){ end(); return true; } return false; });
    render();
  });
}
async function talkNPC(z){
  const N = NPCS[z];
  if (!S.met[z]){ await dialogLines(N.name, N.lines, N.kind); S.met[z] = true; save(); refreshObjective(); if (z > 0) toast('📘 Die Lernkarte dieser Zone findest du beim Vogel oder im Menü (M).'); return; }
  openModal(`<div class="dlg"><div class="dlg-face">${faceImg(N.kind)}</div><div class="dlg-body"><div class="who">${esc(N.name)}</div><p class="de">Was brauchst du?</p><p class="es">¿Qué necesitas?</p>
    <div class="menu-list">${z > 0 ? '<button class="btn" id="n-card" type="button">📘 Lernkarte</button>' : ''}<button class="btn alt" id="n-again" type="button">🔁 Nochmal erklären</button><button class="btn ghost" id="n-bye" type="button">Tschüss</button></div></div></div>`, '', { closable:true });
  if (z > 0) $('#n-card').onclick = () => openLernkarte(z);
  $('#n-again').onclick = async () => { closeModal(); await dialogLines(N.name, N.lines, N.kind); };
  $('#n-bye').onclick = closeModal;
}

/* ---------- study card ---------- */
function openLernkarte(z){
  const Z = ZONES[z], N = NPCS[z];
  const lines = N.lines.slice(0, -1).map(([de, es]) => `<li><span class="de">${esc(de)}</span> ${speakBtn(de)}<br><span class="es">${esc(es)}</span></li>`).join('');
  const terms = WORDS.filter(w => w.t === Z.topic).map(w => `<button class="term ${artClass(w.art)}" type="button" data-say="${esc(nounLabel(w))}">${esc(nounLabel(w))}<small>${esc(w.es)}</small></button>`).join('');
  let extra = '';
  if (z <= 3){ const D = DIAGRAMS[Z.topic]; extra = `<h3>${esc(D.title)}</h3><div class="label-wrap"><div>${diagramSVG(Z.topic)}</div><ol class="slots">${D.labels.map(L => `<li><span class="num">${L.n}</span> ${labelHTML(L)} ${speakBtn(labelText(L))}</li>`).join('')}</ol></div>`; }
  if (z === 3) extra += `<h3>Der Weg der Nahrung</h3><p class="path">Schnabel → <b class="art-der">der Kropf</b> → <b class="art-der">der Drüsenmagen</b> → <b class="art-der">der Kaumagen</b> → <b class="art-der">der Darm</b> → <b class="art-die">die Kloake</b></p><p class="es">pico → buche → proventrículo → molleja → intestino → cloaca</p>`;
  if (z === 4) extra = `<h3>Schnabel und Nahrung</h3><table class="beak-table"><tr><th>Vogel</th><th>Schnabelform</th><th>Nahrung</th></tr>${BEAKS.map(b => `<tr><td>${birdHTML(b)}<br><small class="muted">${esc(WMAP[b.id].es)}</small></td><td>${esc(b.beakName)}</td><td>${esc(b.food)}</td></tr>`).join('')}</table>
    <h3>So schreibst du den Satz</h3><p class="path">Der Buntspecht hat einen kräftig<b>en</b> Meißelschnabel, <b>um</b> Larven <b>zu</b> fressen. ${speakBtn('Der Buntspecht hat einen kräftigen Meißelschnabel, um Larven zu fressen.')}</p><p class="es">«einen» + adjetivo con <b>-en</b> + Schnabel. «um … zu» + infinitivo = «para …».</p>`;
  if (z === 5) extra = `<h3>Die 10 Merkmale der Vögel</h3><ol>${MERKMALE.map(m => `<li>${esc(m.de)} ${speakBtn(m.de)} <span class="es-inline">${esc(m.es)}</span></li>`).join('')}</ol><p><b>Flugunfähig:</b> der Strauß, der Emu, der Pinguin, der Kiwi – weil sie zu schwer sind.</p>
    <h3>Aufgaben-Wörter</h3><div class="terms">${WORDS.filter(w => w.t === 'op').map(w => `<button class="term" type="button" data-say="${esc(nounLabel(w))}">${esc(nounLabel(w))}<small>${esc(w.es)}</small></button>`).join('')}</div>`;
  openModal(`<div class="series-head"><h2>📘 ${esc(TOPICS[Z.topic])}</h2><div class="prog">${esc(Z.page)}</div></div><ul class="card-lines">${lines}</ul>${extra}
    <h3>Fachbegriffe <span class="muted">(klicken = anhören)</span></h3><div class="terms">${terms}</div><div class="fb-actions"><button class="btn" id="lk-ok" type="button">Schließen</button></div>`, 'wide', { closable:true });
  $('#lk-ok').onclick = closeModal;
}

/* ---------- inventory (Lexikon) ---------- */
let lexTab = 'aussen', lexQ = '';
function openLexikon(){
  const counts = [0, 0, 0, 0]; WORDS.forEach(w => counts[tier(w.id)]++);
  const render = () => {
    const q = fold(lexQ.trim());
    const list = WORDS.filter(w => q ? (fold(w.de).includes(q) || fold(w.es).includes(q)) : w.t === lexTab);
    const cards = list.map(w => { const tr = tier(w.id); return `<button class="lcard t${tr} ${artClass(w.art)}" type="button" data-say="${esc(nounLabel(w))}"><span class="tier">${['·', '🥉', '🥈', '🥇'][tr]}</span><b class="${artClass(w.art)}">${esc(nounLabel(w))}</b>${w.pl ? `<small>Pl.: die ${esc(w.pl)}</small>` : w.po ? '<small>nur Plural</small>' : ''}<span class="es">${esc(w.es)}</span></button>`; }).join('');
    openModal(`<div class="series-head"><h2>📖 Wort-Inventar</h2><div class="prog">🥇 ${counts[3]} · 🥈 ${counts[2]} · 🥉 ${counts[1]} / ${WORDS.length}</div></div>
      <p class="sub">Jedes Wort levelt auf: Bronze → Silber → Gold, wenn du es mehrmals mit Pausen richtig weißt. Klick = anhören. <span class="es-inline">Cada palabra sube de nivel cuando la aciertas varias veces.</span></p>
      <div class="tabs">${Object.keys(TOPICS).map(t => `<button class="tab ${t === lexTab && !lexQ ? 'on' : ''}" type="button" data-t="${t}">${esc(TOPICS[t])}</button>`).join('')}<input type="search" id="lex-q" placeholder="Suchen (Deutsch oder Spanisch)" value="${esc(lexQ)}" aria-label="Suchen"></div>
      <div class="lgrid">${cards || '<p>Nichts gefunden.</p>'}</div>
      <div class="fb-actions"><span class="score-note"><span class="art-der">der</span> · <span class="art-die">die</span> · <span class="art-das">das</span></span><button class="btn" id="lx-ok" type="button">Schließen</button></div>`, 'wide', { closable:true });
    $$('.tab', sheet).forEach(b => b.onclick = () => { lexTab = b.dataset.t; lexQ = ''; render(); });
    const qi = $('#lex-q'); qi.oninput = () => { lexQ = qi.value; const pos = qi.selectionStart; render(); const n = $('#lex-q'); n.focus(); n.setSelectionRange(pos, pos); };
    $('#lx-ok').onclick = closeModal;
  };
  render();
}

/* ---------- skin shop ---------- */
let shopTab = 'shirt';
function openShop(){
  const render = () => {
    const own = k => !!S.owned[k];
    let items = '';
    if (shopTab === 'shirt' || shopTab === 'pants'){
      const list = shopTab === 'shirt' ? SHIRTS : PANTS, price = shopTab === 'shirt' ? 40 : 30;
      items = list.map(c => { const k = shopTab + '-' + c, on = S.skin[shopTab] === c; return `<div class="shop-item ${on ? 'on' : ''}"><div class="swatch" style="background:${c}"></div>${on ? '<span class="muted">an</span>' : own(k) ? `<button class="btn tiny alt" data-eq="${k}" type="button">Anziehen</button>` : `<button class="btn tiny" data-buy="${k}" data-price="${price}" type="button" ${S.feathers < price ? 'disabled' : ''}>${price} 🪶</button>`}</div>`; }).join('');
    } else if (shopTab === 'hat'){
      items = Object.entries(HATS).map(([h, d]) => { const k = 'hat-' + h, on = S.skin.hat === h; return `<div class="shop-item ${on ? 'on' : ''}"><b>${esc(d.n)}</b>${on ? '<span class="muted">an</span>' : own(k) || !d.price ? `<button class="btn tiny alt" data-eq="${k}" type="button">Aufsetzen</button>` : `<button class="btn tiny" data-buy="${k}" data-price="${d.price}" type="button" ${S.feathers < d.price ? 'disabled' : ''}>${d.price} 🪶</button>`}</div>`; }).join('');
    } else {
      items = `<div class="shop-item"><b>❤️ Extra-Herz</b><small class="muted">jetzt ${S.maxHearts} / 8</small>${S.maxHearts >= 8 ? '<span class="muted">Maximum</span>' : `<button class="btn tiny" data-buy="heart" data-price="200" type="button" ${S.feathers < 200 ? 'disabled' : ''}>200 🪶</button>`}</div>
        <div class="shop-item"><b>🃏 Joker</b><small class="muted">für den Prüfungsturm · du hast ${S.jokers}</small><button class="btn tiny" data-buy="joker" data-price="80" type="button" ${S.feathers < 80 ? 'disabled' : ''}>80 🪶</button></div>`;
    }
    openModal(`<div class="series-head"><h2>🛒 Skin-Shop</h2><div class="prog">🪶 ${S.feathers}</div></div>
      <div class="tabs">${[['shirt', 'Shirts'], ['pants', 'Hosen'], ['hat', 'Hüte'], ['extra', 'Extras']].map(([k, n]) => `<button class="tab ${shopTab === k ? 'on' : ''}" data-tab="${k}" type="button">${n}</button>`).join('')}</div>
      <div class="shop-grid">${items}</div><div class="fb-actions"><button class="btn" id="sh-ok" type="button">Fertig</button></div>`, 'wide', { closable:true });
    $$('[data-tab]', sheet).forEach(b => b.onclick = () => { shopTab = b.dataset.tab; render(); });
    $$('[data-eq]', sheet).forEach(b => b.onclick = () => { const [t, ...v] = b.dataset.eq.split('-'); S.skin[t] = v.join('-'); save(); rebuildAvatar(); SFX.click(); render(); });
    $$('[data-buy]', sheet).forEach(b => b.onclick = () => {
      const k = b.dataset.buy, price = +b.dataset.price; if (S.feathers < price) return;
      S.feathers -= price; SFX.coin();
      if (k === 'heart'){ S.maxHearts++; S.hearts = S.maxHearts; }
      else if (k === 'joker') S.jokers++;
      else { S.owned[k] = 1; const [t, ...v] = k.split('-'); S.skin[t] = v.join('-'); rebuildAvatar(); }
      save(); hud(); render();
    });
    $('#sh-ok').onclick = closeModal;
  };
  render();
}

/* ---------- confirmations ---------- */
function bossConfirm(z){
  const B = BOSSES[z];
  openModal(`<div class="dlg"><div class="dlg-face">${faceImg(z)}</div><div class="dlg-body"><div class="who">${esc(B.name)} <span class="es-inline">${esc(B.es)}</span></div>
    <p><b>Bosskampf in 3 Phasen.</b> Schieß auf die Kugel mit der richtigen Antwort (schnell = kritischer Treffer). Weich den Geschossen aus und spring über die Schockwellen. In Phase 3 musst du schreiben!</p>
    <p class="es">Dispara a la esfera con la respuesta correcta (rápido = golpe crítico). Esquiva los disparos y salta las ondas. En la fase 3 hay que escribir.</p>
    <div class="fb-actions"><button class="btn ghost" id="bc-no" type="button">Noch nicht</button><button class="btn" id="bc-go" type="button">⚔️ Kämpfen!</button></div></div></div>`, '', { closable:true });
  $('#bc-no').onclick = closeModal; $('#bc-go').onclick = () => { closeModal(); startBoss(z); };
}
function arenaConfirm(){
  openModal(`<div class="center"><div class="big-emoji">⚔️</div><h2 class="big-title">Arena</h2><p>Endlos-Drohnen mit den Wörtern, die dir noch schwerfallen. 3 Herzen. Rekord: <b>${S.arenaBest}</b></p><p class="es">Drones sin fin con las palabras que aún te cuestan.</p>
    <div class="fb-actions center-actions"><button class="btn ghost" id="an-no" type="button">Zurück</button><button class="btn" id="an-go" type="button">Start!</button></div></div>`, '', { closable:true });
  $('#an-no').onclick = closeModal; $('#an-go').onclick = () => { closeModal(); startArena(); };
}

/* ---------- menu ---------- */
function openMenu(){
  const zs = [1, 2, 3, 4, 5].filter(z => z <= S.zone || S.met[z]);
  openModal(`<h2>Menü</h2><div class="menu-grid">
      <button class="btn" id="m-resume" type="button">▶ Weiter</button>
      ${activity ? '<button class="btn ghost" id="m-quit" type="button">🏳 Aufgeben</button>' : '<button class="btn alt" id="m-lex" type="button">📖 Wort-Inventar</button>'}
      <button class="btn alt" id="m-badges" type="button">🏅 Abzeichen</button>
      <button class="btn alt" id="m-settings" type="button">⚙️ Einstellungen</button>
      <button class="btn alt" id="m-help" type="button">🎮 Steuerung &amp; Plan</button>
      <button class="btn ghost hold" id="m-parents" type="button"><span class="fill"></span>👪 Eltern (gedrückt halten)</button></div>
    <h3>📘 Lernkarten</h3><div class="menu-grid">${zs.map(z => `<button class="btn ghost" data-lk="${z}" type="button">${esc(ZONES[z].name)} · ${esc(TOPICS[ZONES[z].topic])}</button>`).join('')}</div>`, '', { closable:true });
  $('#m-resume').onclick = closeModal;
  if (activity) $('#m-quit').onclick = () => { closeModal(); activity.fail(); }; else $('#m-lex').onclick = openLexikon;
  $('#m-badges').onclick = openBadges; $('#m-settings').onclick = openSettings; $('#m-help').onclick = openHelp;
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
    <p class="muted">Beste Serie: ${S.bestCombo} · Arena-Rekord: ${S.arenaBest} · Richtige Artikel: ${S.artRight} · Tages-Streak: ${S.dailyDays}</p><div class="fb-actions"><button class="btn" id="bd-ok" type="button">Zurück</button></div>`, '', { closable:true });
  $('#bd-ok').onclick = openMenu;
}
function openSettings(){
  const row = (id, label, on) => `<label class="set-row"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}> ${label}</label>`;
  openModal(`<h2>⚙️ Einstellungen</h2>
    ${row('st-sound', 'Soundeffekte', S.settings.sound)}
    ${row('st-tts', 'Deutsche Stimme (Wörter und Sätze vorlesen)', S.settings.tts)}
    ${row('st-es', 'Spanische Übersetzung in Dialogen immer zeigen', S.settings.es)}
    ${row('st-lock', 'Maus sperren beim Klick ins Spiel (wie bei Shootern)', S.settings.lock !== false)}
    <label class="set-row">Maus-Empfindlichkeit <input type="range" id="st-sens" min="0.4" max="2.2" step="0.1" value="${S.settings.sens || 1}"></label>
    <p class="muted">Stimme: ${voicePacks ? `aufgenommene deutsche Stimme (${Object.keys(VOICE).length} Clips)` : 'lädt …'} <button class="btn ghost tiny" type="button" data-say="Der Schnabel. Die Kloake. Das Brustbein.">🔊 Test</button></p>
    <label class="set-row">Name: <input type="text" id="st-name" value="${esc(S.name)}" maxlength="20"></label>
    <div class="fb-actions"><button class="btn" id="se-ok" type="button">Fertig</button></div>`, '', { closable:true });
  $('#st-sound').onchange = e => { S.settings.sound = e.target.checked; hud(); save(); };
  $('#st-tts').onchange = e => { S.settings.tts = e.target.checked; hud(); save(); };
  $('#st-es').onchange = e => { S.settings.es = e.target.checked; save(); };
  $('#st-lock').onchange = e => { S.settings.lock = e.target.checked; save(); };
  $('#st-sens').oninput = e => { S.settings.sens = +e.target.value; save(); };
  $('#st-name').onchange = e => { S.name = e.target.value.trim() || 'Ranger'; save(); };
  $('#se-ok').onclick = openMenu;
}
function controlsHTML(){
  return `<div class="controls"><kbd>W A S D</kbd><span>laufen · <kbd>Shift</kbd> sprinten</span><kbd>Leertaste</kbd><span>springen</span><kbd>Maus</kbd><span>Kamera (Klick ins Spiel sperrt die Maus)</span>
    <kbd>Klick / F</kbd><span>schießen</span><kbd>1 · 2 · 3</kbd><span>Munition: der · die · das</span><kbd>E</kbd><span>sprechen, Portal betreten</span><kbd>← →</kbd><span>Kamera drehen (ohne Maus)</span><kbd>B · M</kbd><span>Inventar · Menü</span></div>`;
}
function openHelp(){
  openModal(`<h2>🎮 Steuerung</h2>${controlsHTML()}
    <h3>Plan bis zum Test</h3><ol><li><b>Tag 1:</b> Federwiese + Knochenhöhle (Körper außen, Skelett).</li><li><b>Tag 2:</b> Tages-Run, dann Magen-Moor + Schnabel-Wald.</li><li><b>Tag 3:</b> Tages-Run, Merkmal-Gipfel, dann der Prüfungsturm. Danach: Arena, bis das Inventar golden ist.</li></ol>
    <p class="es">Día 1: cuerpo y esqueleto · día 2: órganos y picos · día 3: características y examen de prueba. Cada día empieza con el Tages-Run.</p>
    <p><b>Drohnen überall:</b> Wähle mit 1/2/3 die Munition <span class="art-der">der</span> / <span class="art-die">die</span> / <span class="art-das">das</span> und schieß die Drohnen mit dem richtigen Artikel ab.</p>
    <div class="fb-actions"><button class="btn" id="hp-ok" type="button">Zurück</button></div>`, 'wide', { closable:true });
  $('#hp-ok').onclick = openMenu;
}
function openParents(){
  const h = Math.floor(S.stats.ms / 3600000), m = Math.floor(S.stats.ms / 60000) % 60;
  const counts = [0, 0, 0, 0]; WORDS.forEach(w => counts[tier(w.id)]++);
  const topicRows = Object.keys(TOPICS).map(t => { const s = S.stats.topic[t] || { r:0, w:0 }, n = s.r + s.w, p = n ? Math.round(s.r / n * 100) : 0;
    return `<tr><td>${esc(TOPICS[t])}</td><td><div class="pbar"><i style="width:${p}%"></i></div></td><td class="num">${n ? p + ' %' : '–'}</td><td class="num muted">${n}</td></tr>`; }).join('');
  const weak = WORDS.filter(w => S.words[w.id] && S.words[w.id].w > 0).sort((a, b) => (S.words[b.id].w - S.words[b.id].r * 0.3) - (S.words[a.id].w - S.words[a.id].r * 0.3)).slice(0, 15);
  const st = [1, 2, 3, 4, 5].map(z => `<tr><td>${esc(ZONES[z].name)}</td>${[0, 1, 2, 3].map(i => `<td>${'★'.repeat(S.stations[z + '-' + i] || 0) || '·'}</td>`).join('')}<td>${S.bosses[z] ? '✔' : '–'}</td></tr>`).join('');
  openModal(`<div class="series-head"><h2>👪 Eltern-Bereich</h2><div class="prog">${esc(S.name)}</div></div>
    <p class="muted">Spielzeit: ${h} h ${m} min · Trainingstage: ${Object.keys(S.stats.days).length} (${Object.keys(S.stats.days).slice(-5).join(', ') || '–'}) · Inventar: 🥇 ${counts[3]} 🥈 ${counts[2]} 🥉 ${counts[1]} von ${WORDS.length}</p>
    <h3>Treffer pro Thema</h3><table class="res-table">${topicRows}</table>
    <h3>Schwierige Wörter</h3>${weak.length ? `<table class="res-table">${weak.map(w => `<tr><td>${wordHTML(w)}</td><td>${esc(w.es)}</td><td class="num">✘ ${S.words[w.id].w} / ✔ ${S.words[w.id].r}</td><td>${TIER_NAME[tier(w.id)]}</td></tr>`).join('')}</table>` : '<p class="muted">Noch keine Fehler gespeichert.</p>'}
    <h3>Portale und Bosse</h3><table class="res-table"><tr><th>Zone</th><th>1</th><th>2</th><th>3</th><th>4</th><th>Boss</th></tr>${st}</table>
    <h3>Prüfungsturm</h3><p>${S.exams.length ? S.exams.slice(-6).map(e => `${e.date}: <b>${e.pct} %</b> (Note ~${e.note})`).join(' · ') : '<span class="muted">Noch nicht gemacht.</span>'}</p>
    <h3>Werkzeuge</h3><div class="menu-grid"><button class="btn alt" id="pa-unlock" type="button">🔓 Alles freischalten</button><button class="btn alt" id="pa-export" type="button">💾 Spielstand sichern</button><button class="btn alt" id="pa-import" type="button">📥 Spielstand laden</button><button class="btn ghost" id="pa-reset" type="button">🗑 Alles zurücksetzen</button></div>
    <div id="pa-io"></div><div class="fb-actions"><button class="btn" id="pa-ok" type="button">Schließen</button></div>`, 'wide', { closable:true });
  $('#pa-ok').onclick = closeModal;
  $('#pa-unlock').onclick = () => { S.zone = 5; S.unlockAll = true; save(); refreshObjective(); toast('🔓 Alle Zonen und der Prüfungsturm sind offen.', 'ok'); };
  $('#pa-export').onclick = () => {
    const code = exportCode();
    $('#pa-io').innerHTML = `<p>Kopiere diesen Code und bewahre ihn auf. Damit lädst du den Spielstand auf einem anderen Gerät oder in der anderen Version (Datei / Link).</p><textarea id="pa-code" rows="4" readonly>${code}</textarea><button class="btn tiny" id="pa-copy" type="button">Kopieren</button>`;
    $('#pa-copy').onclick = () => { const ta = $('#pa-code'); navigator.clipboard.writeText(code).then(() => toast('Kopiert!', 'ok'), () => { ta.focus(); ta.select(); toast('Bitte mit Cmd/Strg+C kopieren.'); }); };
  };
  $('#pa-import').onclick = () => {
    $('#pa-io').innerHTML = `<p>Füge hier einen gesicherten Code ein:</p><textarea id="pa-in" rows="4"></textarea><button class="btn tiny" id="pa-load" type="button">Laden</button>`;
    $('#pa-load').onclick = () => { try { importCode($('#pa-in').value); location.reload(); } catch (e) { toast('Dieser Code ist ungültig. Bitte den ganzen Code einfügen.', 'bad'); } };
  };
  $('#pa-reset').onclick = () => {
    $('#pa-io').innerHTML = `<p><b>Wirklich alles löschen?</b> Sterne, Federn, Skins, Inventar und Statistik gehen verloren.</p><button class="btn tiny" id="pa-yes" type="button">Ja, alles löschen</button> <button class="btn tiny ghost" id="pa-no" type="button">Abbrechen</button>`;
    $('#pa-no').onclick = () => { $('#pa-io').innerHTML = ''; };
    $('#pa-yes').onclick = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S = defaultState(); saveNow(); location.reload(); };
  };
}

/* ---------- title ---------- */
function showTitle(){
  $('#hud').hidden = true; $('#quest').hidden = true; $('#crosshair').hidden = true; $('#ammo').hidden = true;
  openModal(`<div class="center"><p class="eyebrow">Biologie · Die Vögel</p><h1>Die Vogel-Insel</h1>
    <p>Fünf Inseln. Fünf Bosse. Ein Prüfungsturm. Alles auf Deutsch – wie im Test.</p>
    <p class="es">Cinco islas, cinco jefes y una torre de examen. Todo en alemán, como en la prueba.</p>
    <label class="name-row">Spielername <input type="text" id="t-name" value="${esc(S.name)}" maxlength="20"></label>
    ${controlsHTML()}
    <div class="fb-actions center-actions"><button class="btn big" id="t-go" type="button">${S.started ? 'Weiterspielen ▶' : 'Spielen ▶'}</button></div>
    <p class="muted" style="font-size:13px">Mit Ton spielen: Alle Wörter werden von einer deutschen Stimme vorgelesen.</p></div>`, 'wide');
  const go = () => {
    pop(); ac(); S.name = ($('#t-name').value || '').trim() || 'Ranger'; S.started = true; save(); closeModal();
    $('#hud').hidden = false; $('#quest').hidden = false; $('#crosshair').hidden = false; ammoBar('art');
    const p = S.pos && S.pos.z != null ? new V3(S.pos.x, S.pos.y + 0.5, S.pos.z) : HUB_SPAWN.clone();
    teleport(p, Math.PI); world.zone = -9; hud(); refreshObjective();
    $('#clickhint').hidden = false;
    if (!S.met[0]) setTimeout(() => talkNPC(0), 400);
    else if (S.lastDaily !== todayStr()) setTimeout(() => toast('🚪 Der Tages-Run wartet im Dorf! (+40 🪶)', 'gold'), 900);
  };
  const pop = pushKeys(e => { if (e.code === 'Enter' && !isField(e.target)){ go(); return true; } return false; });
  $('#t-go').onclick = go;
}

/* ---------- main loop ---------- */
let lastT = performance.now(), gtime = 0;
function step(dt){
  gtime += dt;
  if (!S.started){ demoCamera(gtime); for (const k in world.portals){ const v = world.portals[k]; (Array.isArray(v) ? v : [v]).forEach(p => p.userData.disc.rotation.z -= dt * 1.5); } for (const z in world.bossStatues) world.bossStatues[z].B.update(gtime); renderer.render(scene3, camera); return; }
  S.stats.ms += dt * 1000;
  if (!modalOpen()){
    playerUpdate(dt);
    if (activity) activity.update(dt); else { worldUpdate(dt); if (S.hearts <= 0){ S.hearts = S.maxHearts; hud(); teleport(HUB_SPAWN.clone(), Math.PI); toast('💫 K.O.! Zurück im Dorf – Herzen wieder voll.', 'bad'); } }
    fxUpdate(dt);
  }
  cameraUpdate(dt);
  sun.position.set(P.pos.x + 30, P.pos.y + 70, P.pos.z + 25); sun.target.position.copy(P.pos);
  renderer.render(scene3, camera);
}
function frame(t){ const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t; step(dt); requestAnimationFrame(frame); }
gameKey = e => {
  if (!S.started) return;
  if (activity && activity.onKey && activity.onKey(e)) return;
  if (e.code === 'KeyE' && !activity) interactNear();
  else if (e.code === 'KeyF') shoot();
  else if (/^Digit[1-3]$/.test(e.code) && (!activity || activity.ammo === 'art')){ ammo = ['der', 'die', 'das'][+e.code.slice(5) - 1]; SFX.click(); ammoBar('art'); }
  else if (e.code === 'KeyM' || e.code === 'Tab' || (e.code === 'Escape' && !cam.locked)) openMenu();
  else if (e.code === 'KeyB' && !activity) openLexikon();
};
function loadVoicePacks(){ (window.VOICE_PACKS || []).forEach(f => { const s = document.createElement('script'); s.src = f; s.async = true; document.body.appendChild(s); }); }
function boot(){
  initRenderer();
  setSky('#7cc4f0', '#e8f5ff', '#e8f5ff', 120, 420);
  buildWorld(); rebuildAvatar(); teleport(HUB_SPAWN.clone(), Math.PI);
  $('#b-sound').onclick = () => { S.settings.sound = !S.settings.sound; save(); hud(); };
  $('#b-tts').onclick = () => { S.settings.tts = !S.settings.tts; save(); hud(); toast(S.settings.tts ? '🗣 Stimme an' : '🗣 Stimme aus'); };
  $('#b-lex').onclick = () => { if (!modalOpen() && !activity) openLexikon(); };
  $('#b-menu').onclick = () => { if (!modalOpen()) openMenu(); };
  modal.addEventListener('pointerdown', e => { if (e.target === modal && modal.dataset.closable === '1') closeModal(); });
  hud(); loadVoicePacks();
  requestAnimationFrame(frame);
  showTitle();
}
boot();
