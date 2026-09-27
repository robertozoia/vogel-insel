/* ============================================================
   PRÜFUNGSTURM — mock test in the real exam format (all German)
   ============================================================ */
const NOTEN = [[92, '1', 'sehr gut'], [81, '2', 'gut'], [67, '3', 'befriedigend'], [50, '4', 'ausreichend'], [30, '5', 'mangelhaft'], [0, '6', 'ungenügend']];
function noteOf(pct){ return NOTEN.find(n => pct >= n[0]); }

async function startExam(){
  await dialogLines('Der Vergess-Geier', GEIER.intro, 'geier');
  const E = { got:0, max:55, idx:0, rows:[] };
  const sections = [
    () => secLabel(E, 'skelett', 'Beschrifte die Abbildung 2. Nenne den Fachbegriff mit Artikel.', 'Rotula la figura 2 (el esqueleto). Escribe el término técnico con su artículo.'),
    () => secLabel(E, 'organe', 'Beschrifte die Abbildung 3. Nenne den Fachbegriff mit Artikel.', 'Rotula la figura 3 (los órganos). Escribe el término técnico con su artículo.'),
    () => secMerkmale(E),
    () => secText(E, 'Was ist eine Kloake? Erkläre in einem Satz.', 'Explica en una frase qué es la cloaca.', 3,
      t => { let p = 0; const n = [/kot/, /urin|harn/, /\beier?\b/, /sperma|samen/].filter(r => r.test(t)).length; if (/oeffnung|ausgang|loch|ausfuehr|verlass|raus|heraus|ausgeschieden/.test(t)) p++; if (n >= 2) p++; if (n >= 3) p++; return p; },
      'Die Kloake ist eine gemeinsame Körperöffnung. Durch sie verlassen Kot, Urin und Eier (beim Männchen die Spermazellen) den Körper.'),
    () => secText(E, 'Welche Vögel können nicht fliegen? Begründe.', 'Nombra las aves que no pueden volar y explica por qué (con «weil»).', 3,
      t => { let p = 0; ['strauss', 'emu', 'pinguin', 'kiwi'].forEach(k => { if (t.includes(k)) p += 0.5; }); if (/schwer/.test(t)) p += 1; return p; },
      'Der Strauß, der Emu, der Pinguin und der Kiwi können nicht fliegen, weil sie zu schwer sind.'),
    () => secBeaks(E),
    () => secSentences(E),
    () => secOrder(E),
    () => secArticles(E),
  ];
  for (let k = 0; k < sections.length; k++){ E.idx = k + 1; await sections[k](); }
  const pct = Math.round(E.got / E.max * 100), N = noteOf(pct), won = pct >= 60;
  S.exams.push({ date:todayStr(), pct, note:N[1] }); if (pct >= 80) badge('exam80');
  if (won) addFeathers(200); else addFeathers(40);
  save();
  if (won) SFX.win(); else SFX.bad();
  await new Promise(res => {
    openModal(`<div class="center"><div class="big-emoji">${won ? '🏆' : '🌫️'}</div><h2>${won ? 'Der Vergess-Geier ist besiegt!' : 'Der Vergess-Geier ist noch da …'}</h2>
      <p class="score-big">${pct} %</p><p>${Math.round(E.got * 10) / 10} von ${E.max} Punkten · Notenschätzung: <b>${N[1]} (${N[2]})</b></p>
      <p class="es">${won ? '¡Venciste al Buitre del Olvido! Las palabras vuelven a la isla.' : 'Todavía no. Repasa las tareas con menos puntos y vuelve a intentarlo.'}</p>
      <table class="res-table">${E.rows.map(r => `<tr><td>${esc(r.t)}</td><td>${Math.round(r.p * 10) / 10} / ${r.m}</td></tr>`).join('')}</table>
      <p class="muted">Die Note ist nur eine Schätzung. Deine Lehrerin oder dein Lehrer bewertet vielleicht anders.</p>
      <div class="fb-actions"><button class="btn" id="ex-end" type="button">Zurück zur Insel</button></div></div>`);
    $('#ex-end').onclick = () => { closeModal(); Overworld.refreshObjective(); res(); };
  });
}
function examFrame(E, title, task, taskEs, body){
  const hp = Math.max(0, 100 - E.got / E.max * 100 / 0.6);
  return `<div class="exam-head"><div class="geier"><span>Vergess-Geier</span><div class="bar"><i style="width:${hp}%"></i></div></div><div class="exam-meta">Aufgabe ${E.idx} / 9 · 🃏 ${S.jokers}</div></div>
    <h2>${title}</h2><p class="task">${task}</p><div class="task-es" hidden>${taskEs}</div>
    <button class="btn tiny joker" type="button" ${S.jokers ? '' : 'disabled'}>🃏 Joker: auf Spanisch</button>
    <div class="exam-body">${body}</div><div class="fb-actions" id="ex-actions"><button class="btn" id="ex-submit" type="button">Abgeben</button></div>`;
}
function wireFrame(onSubmit){
  const j = sheet.querySelector('.joker');
  if (j) j.onclick = () => { if (S.jokers <= 0) return; S.jokers--; save(); sheet.querySelector('.task-es').hidden = false; j.disabled = true; sheet.querySelector('.exam-meta').textContent = sheet.querySelector('.exam-meta').textContent.replace(/🃏 \d+/, '🃏 ' + S.jokers); };
  return new Promise(res => {
    $('#ex-submit').onclick = () => {
      const r = onSubmit();
      $('#ex-actions').innerHTML = `<span class="score-note">+${Math.round(r.p * 10) / 10} / ${r.m} Punkte</span><button class="btn" id="ex-next" type="button">Weiter</button>`;
      sheet.querySelectorAll('input, select, textarea').forEach(x => x.disabled = true);
      r.p > r.m / 2 ? SFX.hit() : SFX.bad();
      $('#ex-next').onclick = () => res(r);
    };
  });
}
async function runSection(E, title, r0){ const r = await r0; E.got += r.p; E.rows.push({ t:title, p:r.p, m:r.m }); }

function secLabel(E, key, task, taskEs){
  const D = DIAGRAMS[key];
  const body = `<div class="label-wrap"><div class="diag-box">${diagramSVG(key)}</div><ol class="slots exam">${D.labels.map(L => `<li><span class="num">${L.n}</span><input type="text" id="lb-${key}-${L.n}" autocomplete="off" spellcheck="false" aria-label="Nummer ${L.n}"><span class="fix"></span></li>`).join('')}</ol></div>${umlautBar()}`;
  openModal(examFrame(E, D.title, task, taskEs, body), 'wide exam');
  return runSection(E, D.title, wireFrame(() => {
    let p = 0;
    D.labels.forEach(L => {
      const inp = $(`#lb-${key}-${L.n}`), r = checkTyped(inp.value, labelAccepts(L)), pts = typedPoints(r); p += pts;
      if (WMAP[L.id]) grade(L.id, r.res);
      inp.classList.add(pts === 1 ? 'right' : pts > 0 ? 'close' : 'wrong');
      if (pts < 1) inp.nextElementSibling.innerHTML = labelHTML(L);
    });
    return { p, m:D.labels.length };
  }));
}
function secMerkmale(E){
  const body = `<div class="grid2">${Array.from({ length:10 }, (_, k) => `<input type="text" id="mm-${k}" placeholder="${k + 1}." autocomplete="off" aria-label="Merkmal ${k + 1}">`).join('')}</div>${umlautBar()}<div id="mm-sol"></div>`;
  openModal(examFrame(E, 'Die Merkmale der Vögel', 'Nenne die zehn verschiedenen Merkmale der Vögel.', 'Nombra las diez características distintas de las aves (basta con palabras clave).', body), 'wide exam');
  return runSection(E, 'Zehn Merkmale', wireFrame(() => {
    const used = new Set(); let p = 0, extra = false;
    for (let k = 0; k < 10; k++){
      const inp = $('#mm-' + k), t = fold(inp.value);
      if (!t.trim()){ inp.classList.add('wrong'); continue; }
      const i = MERKMALE.findIndex((m, j) => !used.has(j) && m.re.test(t));
      if (i >= 0){ used.add(i); p++; inp.classList.add('right'); }
      else if (!extra && MERKMAL_EXTRA.re.test(t)){ extra = true; p++; inp.classList.add('right'); }
      else inp.classList.add('wrong');
    }
    $('#mm-sol').innerHTML = `<p class="sol"><b>Musterlösung:</b> ${MERKMALE.map((m, j) => `<span class="${used.has(j) ? 'hit' : 'miss'}">${esc(m.short)}</span>`).join(' · ')} <span class="muted">(auch richtig: Wirbeltiere)</span></p>`;
    return { p:Math.min(10, p), m:10 };
  }));
}
function secText(E, task, taskEs, max, rubric, model){
  const body = `<textarea id="tx-a" rows="4" spellcheck="false" aria-label="Antwort"></textarea>${umlautBar()}<div id="tx-sol"></div>`;
  openModal(examFrame(E, 'Schreibaufgabe', task, taskEs, body), 'exam');
  setTimeout(() => $('#tx-a') && $('#tx-a').focus(), 50);
  return runSection(E, task, wireFrame(() => {
    const p = Math.min(max, rubric(fold($('#tx-a').value)));
    $('#tx-sol').innerHTML = `<p class="sol"><b>Musterlösung:</b> ${esc(model)} ${speakBtn(model)}</p>`;
    return { p, m:max };
  }));
}
function secBeaks(E){
  const beakOpts = shuffle(BEAKS.map(b => b.beakName)), foodOpts = shuffle(BEAKS.map(b => b.food));
  const sel = (id, opts) => `<select id="${id}"><option value="">– wählen –</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  const body = `<table class="beak-table"><tr><th>Vogel</th><th>Schnabelform</th><th>Nahrung</th></tr>${BEAKS.map((b, k) => `<tr><td>${birdHTML(b)}</td><td>${sel('bk-' + k, beakOpts)}</td><td>${sel('fd-' + k, foodOpts)}</td></tr>`).join('')}</table>`;
  openModal(examFrame(E, 'Der Schnabel verrät, was ein Vogel frisst', 'Ordne jedem Vogel die Schnabelform und die Nahrung zu.', 'Relaciona cada ave con su forma de pico y su alimento.', body), 'wide exam');
  return runSection(E, 'Schnabel & Nahrung', wireFrame(() => {
    let p = 0;
    BEAKS.forEach((b, k) => {
      const a = $('#bk-' + k), f = $('#fd-' + k);
      const okA = a.value === b.beakName, okF = f.value === b.food; p += (okA ? 0.5 : 0) + (okF ? 0.5 : 0);
      a.classList.add(okA ? 'right' : 'wrong'); f.classList.add(okF ? 'right' : 'wrong');
      grade(b.id, okA && okF ? 'right' : 'wrong');
      if (!okA || !okF) a.closest('tr').insertAdjacentHTML('afterend', `<tr class="fixrow"><td></td><td>${okA ? '' : '→ ' + esc(b.beakName)}</td><td>${okF ? '' : '→ ' + esc(b.food)}</td></tr>`);
    });
    return { p, m:6 };
  }));
}
function secSentences(E){
  const bs = sample(BEAKS, 2);
  const body = bs.map((b, k) => `<p class="task2">${k + 1}) Welchen Schnabel hat ${birdHTML(b)} und wozu? Schreibe einen ganzen Satz mit „um … zu“.</p><textarea id="ss-${k}" rows="2" spellcheck="false" aria-label="Satz ${k + 1}"></textarea><div id="ss-sol-${k}"></div>`).join('') + umlautBar();
  openModal(examFrame(E, 'Sätze schreiben', 'Beschreibe den Schnabel und die Nahrung der Vögel.', 'Describe el pico y el alimento de cada ave con una frase completa. Usa «um … zu» (= para …).', body), 'wide exam');
  return runSection(E, 'Sätze mit „um … zu“', wireFrame(() => {
    let p = 0;
    bs.forEach((b, k) => {
      const t = fold($('#ss-' + k).value); let q = 0;
      if (b.kwBeak.test(t)) q += 0.5; if (b.kwFood.test(t)) q += 1; if (/\bum\b.*\bzu\b/.test(t)) q += 0.5;
      p += q; grade(b.id, q >= 1.5 ? 'right' : 'wrong');
      $('#ss-sol-' + k).innerHTML = `<p class="sol">${q} / 2 · <b>Muster:</b> ${esc(beakSentence(b))} ${speakBtn(beakSentence(b))}</p>`;
    });
    return { p, m:4 };
  }));
}
function secOrder(E){
  const right = ['kropf', 'druesenmagen', 'kaumagen', 'darm', 'kloake'];
  const items = shuffle(right.slice()); const order = [];
  openModal(examFrame(E, 'Der Weg der Nahrung', 'Bringe die Organe in die richtige Reihenfolge. Die Nahrung kommt vom Schnabel …', 'Ordena los órganos: ¿por dónde pasa la comida después del pico?',
    `<div class="order-line" id="ord-line"></div><div class="chips" id="ord-chips"></div><button class="btn tiny ghost" id="ord-reset" type="button">Neu ordnen</button><div id="ord-sol"></div>`), 'exam');
  const render = () => {
    $('#ord-line').innerHTML = 'Schnabel → ' + (order.length ? order.map(id => `<b>${esc(WMAP[id].de)}</b>`).join(' → ') : '…');
    $('#ord-chips').innerHTML = items.filter(id => !order.includes(id)).map(id => `<button class="chip" type="button" data-id="${id}">${wordHTML(WMAP[id])}</button>`).join('');
    $$('#ord-chips .chip').forEach(b => b.onclick = () => { order.push(b.dataset.id); SFX.click(); render(); });
  };
  render();
  $('#ord-reset').onclick = () => { order.length = 0; render(); };
  return runSection(E, 'Weg der Nahrung', wireFrame(() => {
    const ok = right.filter((id, k) => order[k] === id).length;
    const p = ok === 5 ? 2 : ok >= 3 ? 1 : 0;
    $('#ord-chips').innerHTML = ''; $('#ord-reset').hidden = true;
    $('#ord-sol').innerHTML = `<p class="sol"><b>Richtig:</b> Schnabel → Kropf → Drüsenmagen → Kaumagen → Darm → Kloake</p>`;
    return { p, m:2 };
  }));
}
function secArticles(E){
  const ts = ['aussen', 'skelett', 'organe', 'schnabel', 'merkmale'];
  const ids = pickWords(WORDS.filter(w => w.art && !w.po && ts.includes(w.t)).map(w => w.id), 10);
  const body = `<div class="grid2">${ids.map((id, k) => `<label class="art-row"><select id="ar-${k}" aria-label="Artikel für ${esc(WMAP[id].de)}"><option value="">–</option><option>der</option><option>die</option><option>das</option></select> <b>${esc(WMAP[id].de)}</b><span class="fix"></span></label>`).join('')}</div>`;
  openModal(examFrame(E, 'Die Artikel', 'Ergänze den richtigen Artikel.', 'Completa con el artículo correcto (der, die, das).', body), 'wide exam');
  return runSection(E, 'Artikel', wireFrame(() => {
    let p = 0;
    ids.forEach((id, k) => {
      const s = $('#ar-' + k), ok = s.value === WMAP[id].art; if (ok) p += 0.5;
      s.classList.add(ok ? 'right' : 'wrong'); grade(id, ok ? 'right' : 'wrong');
      if (!ok) s.parentElement.querySelector('.fix').innerHTML = ' → ' + wordHTML(WMAP[id]);
    });
    return { p, m:5 };
  }));
}
