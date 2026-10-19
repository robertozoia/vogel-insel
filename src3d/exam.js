/* ============================================================
   PRÜFUNGSTURM — mock test in the real exam format (all German)
   ============================================================ */
const NOTEN = [[92, '1', 'sehr gut'], [81, '2', 'gut'], [67, '3', 'befriedigend'], [50, '4', 'ausreichend'], [30, '5', 'mangelhaft'], [0, '6', 'ungenügend']];
function noteOf(pct){ return NOTEN.find(n => pct >= n[0]); }

async function startExam(){
  await dialogLines('Der Vergess-Geier', GEIER.intro, 'geier');
  const E = { got:0, max:0, idx:0, n:0, rows:[] };
  // every section declares its maximum so the vulture's health bar is exact
  const sections = [
    { m:DIAGRAMS.skelett.labels.length, run:() => secLabel(E, 'skelett', 'Beschrifte die Abbildung 2. Nenne den Fachbegriff mit Artikel.', 'Rotula la figura 2 (el esqueleto). Escribe el término técnico con su artículo.') },
    { m:DIAGRAMS.organe.labels.length, run:() => secLabel(E, 'organe', 'Beschrifte die Abbildung 3. Nenne den Fachbegriff mit Artikel.', 'Rotula la figura 3 (los órganos). Escribe el término técnico con su artículo.') },
    { m:10, run:() => secMerkmale(E) },
    { m:PMAP['p-kloake'].max, run:() => secText(E, PMAP['p-kloake']) },
    { m:PMAP['p-flug'].max, run:() => secText(E, PMAP['p-flug']) },
    { m:6, run:() => secBeaks(E) },
    { m:4, run:() => secSentences(E) },
    { m:PMAP['p-nahrung'].max, run:() => secText(E, PMAP['p-nahrung']) },
    { m:5, run:() => secArticles(E) },
    { m:4, run:() => secCloze12(E) },
    { m:4, run:() => secNest(E) },
    { m:DIAGRAMS.ei.labels.length, run:() => secLabel(E, 'ei', 'Beschrifte den Aufbau eines Eis mit den angegebenen Begriffen. Nenne den Fachbegriff mit Artikel.', 'Rotula las partes del huevo con los términos dados, con su artículo.', DIAGRAMS.ei.labels.map(L => labelText(L).replace(/^(der|die|das) /, ''))) },
    { m:4, run:() => secBuild(E) },
    { m:PMAP['p-paarung'].max, run:() => secText(E, PMAP['p-paarung']) },
  ];
  E.max = sections.reduce((a, s) => a + s.m, 0); E.n = sections.length;
  for (let k = 0; k < sections.length; k++){ E.idx = k + 1; await sections[k].run(); }
  const pct = Math.round(E.got / E.max * 100), N = noteOf(pct), won = pct >= 60;
  S.exams.push({ date:todayStr(), pct, note:N[1] }); if (pct >= 80) badge('exam80');
  if (won) addFeathers(250); else addFeathers(50);
  save();
  if (won) SFX.win(); else SFX.bad();
  const weakest = E.rows.slice().sort((a, b) => a.p / a.m - b.p / b.m).slice(0, 3);
  await new Promise(res => {
    openModal(`<div class="center"><div class="big-emoji">${won ? '🏆' : '🌫️'}</div><h2>${won ? 'Der Vergess-Geier ist besiegt!' : 'Der Vergess-Geier ist noch da …'}</h2>
      <p class="score-big">${pct} %</p><p>${Math.round(E.got * 10) / 10} von ${E.max} Punkten · Notenschätzung: <b>${N[1]} (${N[2]})</b></p>
      <p class="es">${won ? '¡Venciste al Buitre del Olvido! Las palabras vuelven a la isla.' : 'Todavía no. Repasa las tareas con menos puntos y vuelve a intentarlo.'}</p>
      <table class="res-table">${E.rows.map(r => `<tr><td>${esc(r.t)}</td><td class="num">${Math.round(r.p * 10) / 10} / ${r.m}</td></tr>`).join('')}</table>
      <p class="gold-note">Üben: ${weakest.map(r => esc(r.t)).join(' · ')}</p>
      <p class="muted">Die Note ist nur eine Schätzung. Deine Lehrerin oder dein Lehrer bewertet vielleicht anders.</p>
      <div class="fb-actions"><button class="btn" id="ex-end" type="button">Zurück zur Insel</button></div></div>`);
    $('#ex-end').onclick = () => { closeModal(); refreshObjective(); res(); };
  });
}
function examFrame(E, title, task, taskEs, body){
  const hp = Math.max(0, 100 - E.got / E.max * 100 / 0.6);
  return `<div class="exam-head"><div class="geier"><span>Vergess-Geier</span><div class="bar"><i style="width:${hp}%"></i></div></div><div class="exam-meta">Aufgabe ${E.idx} / ${E.n} · 🃏 ${S.jokers}</div></div>
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

function secLabel(E, key, task, taskEs, bank){
  const D = DIAGRAMS[key];
  const body = `${bank ? `<p class="wordbank">${bank.map(b => `<span>${esc(b)}</span>`).join('')}</p>` : ''}<div class="label-wrap"><div class="diag-box">${diagramSVG(key)}</div><ol class="slots exam">${D.labels.map(L => `<li><span class="num">${L.n}</span><input type="text" id="lb-${key}-${L.n}" autocomplete="off" spellcheck="false" aria-label="Nummer ${L.n}"><span class="fix"></span></li>`).join('')}</ol></div>${umlautBar()}`;
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
// free-text explanation, scored with the rubric of a PROCESSES entry
function secText(E, P){
  const body = `<textarea id="tx-a" rows="4" spellcheck="false" aria-label="Antwort"></textarea>${umlautBar()}<div id="tx-sol"></div>`;
  openModal(examFrame(E, 'Erklären', P.q, P.es, body), 'exam');
  setTimeout(() => $('#tx-a') && $('#tx-a').focus(), 50);
  return runSection(E, P.q, wireFrame(() => {
    const r = scoreExplain($('#tx-a').value, P);
    grade(P.id, r.p >= r.max ? 'right' : r.p >= r.max / 2 ? 'close' : 'wrong');
    $('#tx-sol').innerHTML = `<div class="rubric">${r.hits.map(x => `<span class="rk hit">✔ ${esc(x)}</span>`).join('')}${r.misses.map(x => `<span class="rk miss">✘ fehlt: ${esc(x)}</span>`).join('')}</div><p class="sol"><b>Musterlösung:</b> ${esc(P.model)} ${speakBtn(P.model)}</p>`;
    return { p:r.p, m:r.max };
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
// generic "put the chips in order" widget (used by secBuild)
function orderWidget(lineId, chipsId, resetId, items, labelOf, prefix){
  const order = [];
  const render = () => {
    $('#' + lineId).innerHTML = (prefix || '') + (order.length ? order.map(i => `<b>${labelOf(i)}</b>`).join(' ') : '…');
    $('#' + chipsId).innerHTML = items.filter(i => !order.includes(i)).map(i => `<button class="chip" type="button" data-i="${i}">${labelOf(i)}</button>`).join('');
    $$('#' + chipsId + ' .chip').forEach(b => b.onclick = () => { order.push(+b.dataset.i); SFX.click(); render(); });
  };
  render();
  $('#' + resetId).onclick = () => { order.length = 0; render(); };
  return { order, lock(){ $('#' + chipsId).innerHTML = ''; $('#' + resetId).hidden = true; } };
}
function secArticles(E){
  const ts = ['aussen', 'skelett', 'organe', 'schnabel', 'merkmale', 'fortpflanzung'];
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
/* ---- Seite 12, Aufgabe 1: Lückentext Fortpflanzung (getippt) ---- */
function secCloze12(E){
  const gaps = [['innere'], ['Kloaken'], ['Kalk'], ['Dottersack']];
  const text = ['Bei den Vögeln findet eine ', ' Befruchtung statt. Dabei werden die ', ' der beiden Partner aufeinander gedrückt. Die von dem Weibchen gelegten Eier bestehen aus ', '. Der Embryo ernährt sich von Nährstoffen, welche sich im ', ' befinden.'];
  const body = `<p class="cloze-text">${text.map((t, i) => esc(t) + (i < gaps.length ? `<input type="text" class="gapin" id="cz-${i}" autocomplete="off" spellcheck="false" aria-label="Lücke ${i + 1}"><span class="fix"></span>` : '')).join('')}</p>${umlautBar()}`;
  openModal(examFrame(E, 'Die Fortpflanzung', 'Ergänze die Lücken mit den passenden Begriffen.', 'Completa los huecos con los términos correctos (sin artículo).', body), 'wide exam');
  setTimeout(() => $('#cz-0') && $('#cz-0').focus(), 50);
  return runSection(E, 'Lückentext Fortpflanzung', wireFrame(() => {
    let p = 0; const ids = ['innere-befruchtung', 'kloake', 'kalk', 'dottersack'];
    gaps.forEach((acc, i) => {
      const inp = $('#cz-' + i), r = checkTyped(inp.value, acc), pts = typedPoints(r); p += pts; grade(ids[i], r.res);
      inp.classList.add(pts === 1 ? 'right' : pts > 0 ? 'close' : 'wrong');
      if (pts < 1) inp.nextElementSibling.textContent = acc[0];
    });
    return { p, m:4 };
  }));
}
/* ---- Seite 12, Aufgabe 2: Nestflüchter / Nesthocker ---- */
function secNest(E){
  const row = (k, name) => `<div class="nest-row"><b>${name}:</b><input type="text" id="ne-${k}" placeholder="Erklärung" autocomplete="off" spellcheck="false" aria-label="${name} Erklärung"><span>Beispiel:</span><input type="text" id="nb-${k}" placeholder="Vogel" autocomplete="off" spellcheck="false" aria-label="${name} Beispiel"><div class="fix" id="nf-${k}"></div></div>`;
  openModal(examFrame(E, 'Die Fortpflanzung', 'Erkläre die Begriffe Nestflüchter und Nesthocker und nenne je ein Beispiel.', 'Explica los dos términos (¿qué hacen esos polluelos después de salir del huevo?) y da un ejemplo de ave para cada uno.', row(0, 'Nestflüchter') + row(1, 'Nesthocker') + umlautBar()), 'wide exam');
  return runSection(E, 'Nestflüchter / Nesthocker', wireFrame(() => {
    let p = 0;
    const checks = [
      { ex:/verlass|verlaess|schnell|weg|sofort|gleich/, bsp:/huhn|huehn|ente|hahn|henne|kueken|gans|strauss|kiwi/, fix:'Ein Vogel, der nach dem Schlüpfen schnell das Nest verlässt. Beispiel: Huhn, Ente.' },
      { ex:/bleib|lang|nest|federkleid|nicht entwickelt|federn/, bsp:/amsel|sing|taube|spatz|sperling|meise|adler|storch|specht|falke|elster/, fix:'Ein Vogel, der nach dem Schlüpfen im Nest bleibt, weil sein Federkleid noch nicht entwickelt ist. Beispiel: Amsel.' },
    ];
    checks.forEach((c, k) => {
      const e = $('#ne-' + k), b = $('#nb-' + k), okE = c.ex.test(fold(e.value)), okB = c.bsp.test(fold(b.value));
      p += (okE ? 1 : 0) + (okB ? 1 : 0); e.classList.add(okE ? 'right' : 'wrong'); b.classList.add(okB ? 'right' : 'wrong');
      if (!okE || !okB) $('#nf-' + k).textContent = c.fix;
    });
    grade('nestfluechter', p >= 3 ? 'right' : 'wrong'); grade('nesthocker', p >= 3 ? 'right' : 'wrong');
    return { p, m:4 };
  }));
}
/* ---- Blatt 6: Die Entwicklung im Hühnerei — Sätze aus den Wortgeländern bauen ---- */
function secBuild(E){
  const items = sample(SENTENCES.huehnerei, 2);
  const body = items.map((it, k) => `<p class="task2">${esc(it.title)}</p><div class="order-line" id="bl-${k}"></div><div class="chips" id="bc-${k}"></div><button class="btn tiny ghost" id="br-${k}" type="button">Neu ordnen</button><div id="bs-${k}"></div>`).join('');
  openModal(examFrame(E, 'Die Entwicklung im Hühnerei', 'Beschreibe die Bilder der Filmleiste mit Hilfe der angegebenen Wortgeländer. Der Anfang und das Ende eines Satzes sind jeweils gekennzeichnet.', 'Construye las frases con los bloques dados. El inicio lleva mayúscula y el final lleva punto.', body), 'wide exam');
  const ws = items.map((it, k) => orderWidget('bl-' + k, 'bc-' + k, 'br-' + k, shuffle(it.target.map((_, i) => i)), i => esc(it.target[i])));
  return runSection(E, 'Entwicklung im Hühnerei', wireFrame(() => {
    let p = 0;
    items.forEach((it, k) => {
      const ok = it.target.filter((_, i) => ws[k].order[i] === i).length, full = ok === it.target.length;
      const q = full ? 2 : ok >= Math.ceil(it.target.length / 2) ? 1 : 0; p += q; ws[k].lock();
      $('#bs-' + k).innerHTML = `<p class="sol">${q} / 2 · <b>Muster:</b> ${esc(it.target.join(' '))} ${speakBtn(it.target.join(' '))}</p>`;
    });
    return { p, m:4 };
  }));
}
