/* ============================================================
   QUIZ — question generation, answer checking, question UI
   ============================================================ */
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function fold(s){ return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'); }
function normT(s){ return s.replace(/[.,!?;:„“"'»«()]/g, ' ').replace(/\s+/g, ' ').trim(); }
function parseArt(s){ const m = s.match(/^(der|die|das)\s+(.+)$/i); return m ? { art:m[1].toLowerCase(), rest:m[2] } : { art:null, rest:s }; }
function lev(a, b){
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length:n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++){
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function checkTyped(input, accepts){
  const inp = normT(input || '');
  if (!inp) return { res:'wrong', score:0, msg:'Keine Antwort.', target:accepts[0] };
  const pi = parseArt(inp);
  let best = null;
  for (const a of accepts){
    const pa = parseArt(normT(a));
    const needArt = !!pa.art;
    const exact = pi.rest === pa.rest, ci = pi.rest.toLowerCase() === pa.rest.toLowerCase(), fo = fold(pi.rest) === fold(pa.rest);
    const dist = lev(fold(pi.rest), fold(pa.rest));
    const close = pa.rest.length > 3 && dist <= (pa.rest.length > 8 ? 2 : 1);
    const artOk = !needArt || pi.art === pa.art;
    let res, score, msg = '';
    if ((exact || ci) && artOk){ res = 'right'; score = 5; if (!exact) msg = /^[A-ZÄÖÜ]/.test(pa.rest) ? 'Tipp: Nomen schreibt man groß!' : 'Tipp: Dieses Wort schreibt man klein.'; }
    else if (fo && artOk){ res = 'right'; score = 4; msg = 'Achte auf die Umlaute: ä, ö, ü, ß.'; }
    else if ((ci || fo) && !artOk){ res = 'wrong'; score = 3; msg = pi.art ? `Richtiges Wort, aber falscher Artikel! Es heißt <b class="${artClass(pa.art)}">${pa.art}</b>.` : `Der Artikel fehlt! Es heißt <b class="${artClass(pa.art)}">${pa.art} ${esc(pa.rest)}</b>.`; }
    else if (close && artOk){ res = 'close'; score = 2; msg = 'Fast! Nur ein kleiner Schreibfehler.'; }
    else if (close){ res = 'wrong'; score = 1; msg = 'Schreibfehler und falscher Artikel.'; }
    else { res = 'wrong'; score = 0; }
    if (!best || score > best.score) best = { res, score, msg, target:a, artOk, near: ci || fo || close };
  }
  return best;
}
function typedPoints(r){ return r.res === 'right' ? 1 : r.res === 'close' ? 0.75 : r.score === 3 ? 0.5 : r.score === 1 ? 0.25 : 0; }

/* ---------- helpers for words ---------- */
function wordExplain(w){ return `${wordHTML(w, true)} = <i>${esc(w.es)}</i>` + (w.ex ? `<div class="ex">„${esc(w.ex)}“ ${speakBtn(w.ex)}</div>` : ''); }
function wordTip(w){ return w.tip ? '💡 ' + esc(w.tip) : ''; }
function distractors(w, n){
  const cls = x => !!x.art === !!w.art;
  const same = WORDS.filter(x => x.id !== w.id && cls(x) && x.t === w.t && x.es !== w.es && x.de !== w.de);
  let d = sample(same, n);
  if (d.length < n) d = d.concat(sample(WORDS.filter(x => x.id !== w.id && cls(x) && x.t !== w.t && !d.includes(x)), n - d.length));
  return d;
}
function exForm(w){
  if (!w.ex) return null;
  for (const f of [w.de, w.pl].filter(Boolean)){
    const re = new RegExp('(^|[^A-Za-zÄÖÜäöüß])(' + escRe(f) + ')(?=$|[^A-Za-zÄÖÜäöüß])');
    if (re.test(w.ex)) return { form:f, isPl: f === w.pl && f !== w.de, blank: w.ex.replace(re, (all, pre) => pre + '<span class="blank">_____</span>') };
  }
  return null;
}
function mcWords(w, ds, htmlFn){ return shuffle([w, ...ds]).map(x => ({ html:htmlFn(x), val:x.id })); }

const MAKERS = {
  es2de(w){ return { type:'mc', id:w.id, prompt:`Wie heißt das auf Deutsch?<div class="big-es">${esc(w.es)}</div>`, options:mcWords(w, distractors(w, 3), x => wordHTML(x)), correct:w.id,
    answerHTML:wordHTML(w), explain:wordExplain(w), explainEs:wordTip(w), es:`¿Cómo se dice en alemán «${esc(w.es)}»?`, sayAfter:nounLabel(w) }; },
  de2es(w){ return { type:'mc', id:w.id, prompt:`Was bedeutet ${wordHTML(w)}? ${speakBtn(nounLabel(w))}`, options:mcWords(w, distractors(w, 3), x => esc(x.es)), correct:w.id,
    answerHTML:esc(w.es), explain:wordExplain(w), explainEs:wordTip(w), es:`¿Qué significa «${esc(nounLabel(w))}»? Elige la traducción.`, sayAfter:nounLabel(w) }; },
  art(w){ return { type:'art', id:w.id, prompt:`Welcher Artikel?<div class="big">${esc(w.de)}${w.po ? ' <small>(Plural)</small>' : ''}</div>`,
    options:['der', 'die', 'das'].map((a, i) => ({ html:a, val:a, key:'JKL'[i], cls:'art-btn ' + artClass(a) })), correct:w.art,
    answerHTML:wordHTML(w), explain:wordExplain(w), explainEs:wordTip(w), es:`¿Qué artículo lleva? (${esc(w.es)}) — der = masculino, die = femenino o plural, das = neutro.`, sayAfter:nounLabel(w) }; },
  def(w){ return { type:'mc', id:w.id, prompt:`Welches Wort passt?<div class="def">„${esc(w.def)}“</div>`, options:mcWords(w, distractors(w, 3), x => wordHTML(x)), correct:w.id,
    answerHTML:wordHTML(w), explain:wordExplain(w), explainEs:wordTip(w), es:`¿Qué palabra corresponde a la definición? Pista: significa «${esc(w.es)}».`, sayAfter:nounLabel(w) }; },
  ex(w){
    const f = exForm(w); const ds = distractors(w, 3);
    const opts = shuffle([{ html:esc(f.form), val:w.id }, ...ds.map(x => ({ html:esc(f.isPl ? (x.pl || x.de) : x.de), val:x.id }))]);
    return { type:'mc', id:w.id, prompt:`Ergänze den Satz:<div class="def">„${f.blank}“</div>`, options:opts, correct:w.id,
      answerHTML:esc(f.form), explain:wordExplain(w), explainEs:wordTip(w), es:`Completa la frase. Pista: la palabra significa «${esc(w.es)}».`, sayAfter:w.ex };
  },
  audio(w){ return { type:'mc', id:w.id, prompt:`Hör genau zu! Welches Wort hörst du? ${speakBtn(nounLabel(w))}`, say:nounLabel(w), options:mcWords(w, distractors(w, 3), x => wordHTML(x)), correct:w.id,
    answerHTML:wordHTML(w), explain:wordExplain(w), explainEs:wordTip(w), es:'Escucha (🔊) y elige la palabra que oyes.' }; },
  type(w){ return { type:'type', id:w.id, prompt:`Schreib auf Deutsch${w.art ? ' – <b>mit Artikel</b>' : ''}:<div class="big-es">${esc(w.es)}</div>`, accept:[nounLabel(w), ...(w.alt || [])],
    answerHTML:wordHTML(w), explain:wordExplain(w), explainEs:wordTip(w), es:`Escribe la palabra en alemán${w.art ? ' con su artículo (der / die / das)' : ''}.`, sayAfter:nounLabel(w), placeholder: w.art ? 'der / die / das + Wort' : 'Wort' }; },
  dictation(w){ return { type:'type', id:w.id, prompt:`Hör zu und schreib das Wort${w.art ? ' <b>mit Artikel</b>' : ''}! ${speakBtn(nounLabel(w))}<div class="muted">(${esc(w.es)})</div>`, say:nounLabel(w), accept:[nounLabel(w), ...(w.alt || [])],
    answerHTML:wordHTML(w), explain:wordExplain(w), explainEs:wordTip(w), es:'Escucha (🔊) y escribe la palabra que oyes.', sayAfter:nounLabel(w), placeholder: w.art ? 'der / die / das + Wort' : 'Wort' }; },
};
function qFromWord(id, kinds){
  const w = WMAP[id];
  const valid = (kinds || ['es2de', 'de2es', 'art', 'def', 'ex', 'audio']).filter(k => {
    if (k === 'art') return !!w.art;
    if (k === 'def') return !!w.def;
    if (k === 'ex') return !!exForm(w);
    if (k === 'audio' || k === 'dictation') return HAS_TTS && S.settings.tts;
    return true;
  });
  return MAKERS[pick(valid.length ? valid : ['es2de'])](w);
}

/* ---------- diagram questions ---------- */
function labelText(L){ return L.text || nounLabel(WMAP[L.id]); }
function labelHTML(L){ const t = labelText(L); return `<b class="${artClass(t.split(' ')[0])}">${esc(t)}</b>`; }
function labelAccepts(L){ const w = WMAP[L.id]; return [labelText(L), nounLabel(w), ...(w.alt || []), ...(L.accept || [])]; }
function diagramSVG(key, o = {}){
  const D = DIAGRAMS[key];
  let s = `<svg viewBox="0 0 420 300" class="diag" role="img" aria-label="${esc(D.title)}"><rect width="420" height="300" fill="#fbf4e2"/>` + D.base();
  for (const L of D.labels){
    if (o.only && !o.only.includes(L.n)) continue;
    const st = (o.state && o.state[L.n]) || '';
    s += `<line x1="${L.x}" y1="${L.y}" x2="${L.mx}" y2="${L.my}" class="lead"/><circle cx="${L.x}" cy="${L.y}" r="3" class="dot"/>`;
    s += `<g class="mk ${st} ${o.hi === L.n ? 'hi' : ''}" data-n="${L.n}"><circle cx="${L.mx}" cy="${L.my}" r="12"/><text x="${L.mx}" y="${L.my + 4.5}" text-anchor="middle">${L.n}</text></g>`;
  }
  return s + '</svg>';
}
function qLabel(key){
  const D = DIAGRAMS[key]; const L = pick(D.labels);
  const opts = shuffle([L, ...sample(D.labels.filter(l => l !== L), 3)]).map(l => ({ html:labelHTML(l), val:l.n }));
  return { type:'mc', id:L.id, prompt:`Was zeigt die Nummer <b>${L.n}</b>?`, media:diagramSVG(key, { hi:L.n, only:[L.n] }), options:opts, correct:L.n,
    answerHTML:labelHTML(L), explain:wordExplain(WMAP[L.id]), explainEs:wordTip(WMAP[L.id]), es:`¿Qué parte muestra el número ${L.n}?`, sayAfter:labelText(L) };
}
function qLabelType(key){
  const D = DIAGRAMS[key]; const L = pick(D.labels);
  return { type:'type', id:L.id, prompt:`Beschrifte: Was ist Nummer <b>${L.n}</b>? (mit Artikel)`, media:diagramSVG(key, { hi:L.n, only:[L.n] }), accept:labelAccepts(L),
    answerHTML:labelHTML(L), explain:wordExplain(WMAP[L.id]), explainEs:wordTip(WMAP[L.id]), es:`Escribe el nombre del número ${L.n} con su artículo.`, sayAfter:labelText(L), placeholder:'der / die / das + Wort' };
}

/* ---------- content-specific questions ---------- */
function qTF(item){
  return { type:'tf', prompt:`Richtig oder falsch?<div class="def">„${esc(item.s)}“</div>`, options:[{ html:'Richtig', val:true, key:'R', cls:'tf-r' }, { html:'Falsch', val:false, key:'F', cls:'tf-f' }],
    correct:item.a, answerHTML:item.a ? 'Richtig' : 'Falsch', explain:item.why ? '👉 ' + esc(item.why) : '', explainEs:esc(item.es), es:'¿La frase es verdadera (Richtig) o falsa (Falsch)?', sayAfter:item.a ? item.s : item.why };
}
function beakSentence(b){ return `${b.art} ${b.name} hat ${b.beakAcc}, um ${b.foodAcc} zu fressen.`; }
function birdHTML(b){ return `<b class="${artClass(b.art)}">${b.art.toLowerCase()} ${esc(b.name)}</b>`; }
function qBeak(){
  const b = pick(BEAKS); const kind = pick(['beak', 'food', 'bird']);
  const others = sample(BEAKS.filter(x => x !== b), 3);
  const base = { type:'mc', id:b.id, correct:b.id, explain:esc(beakSentence(b)) + ' ' + speakBtn(beakSentence(b)), explainEs:esc(b.es), sayAfter:beakSentence(b) };
  if (kind === 'beak') return Object.assign(base, { prompt:`Welchen Schnabel hat ${birdHTML(b)}?`, options:shuffle([b, ...others]).map(x => ({ html:esc(x.beakName), val:x.id })), answerHTML:esc(b.beakName), es:`¿Qué pico tiene ${esc(WMAP[b.id].es)}?` });
  if (kind === 'food'){ const f = pick(b.foods); return Object.assign(base, { prompt:`Wer frisst das? <span class="emoji-big">${f.e}</span> <b>${esc(f.n)}</b>`, options:shuffle([b, ...others]).map(x => ({ html:birdHTML(x), val:x.id })), answerHTML:birdHTML(b), es:'¿Qué ave come esto?' }); }
  return Object.assign(base, { prompt:`Wer hat diesen Schnabel?<div class="def">${esc(b.beakName)}</div>`, options:shuffle([b, ...others]).map(x => ({ html:birdHTML(x), val:x.id })), answerHTML:birdHTML(b), es:'¿Qué ave tiene este pico?' });
}
function qMerkmal(){
  if (Math.random() < 0.6){
    const m = pick(MERKMALE); const fs = sample(FAKES, 3);
    return { type:'mc', prompt:'Welcher Satz stimmt? Das ist ein Merkmal der Vögel:', options:shuffle([{ html:esc(m.de), val:'ok' }, ...fs.map((f, i) => ({ html:'Vögel ' + esc(f.de) + '.', val:'f' + i }))]),
      correct:'ok', answerHTML:esc(m.de), explain:'Die 10 Merkmale: ' + MERKMALE.map(x => esc(x.short)).join(' · '), explainEs:esc(m.es), es:'¿Qué frase es una característica VERDADERA de las aves?', sayAfter:m.de };
  }
  const fl = WMAP[pick(FLIGHTLESS)]; const ys = sample(FLYERS, 3).map(id => WMAP[id]);
  return { type:'mc', id:fl.id, prompt:'Welcher Vogel kann <b>nicht</b> fliegen?', options:mcWords(fl, ys, x => wordHTML(x)), correct:fl.id, answerHTML:wordHTML(fl),
    explain:'Flugunfähig: der Strauß, der Emu, der Pinguin und der Kiwi – sie sind zu schwer.', explainEs:'No pueden volar: avestruz, emú, pingüino y kiwi (son demasiado pesados).', es:'¿Qué ave NO puede volar?', sayAfter:nounLabel(fl) };
}

/* ---------- umlaut helper ---------- */
function umlautBar(){ return `<div class="umlauts" aria-label="Sonderzeichen">${['ä','ö','ü','ß','Ä','Ö','Ü'].map(c => `<button type="button" class="uml" data-ch="${c}" tabindex="-1">${c}</button>`).join('')}</div>`; }
let lastField = null;
document.addEventListener('focusin', e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') lastField = e.target; });
document.addEventListener('pointerdown', e => { if (e.target.closest('.uml')) e.preventDefault(); });
document.addEventListener('click', e => {
  const b = e.target.closest('.uml'); if (!b) return;
  const scope = b.closest('.q, .sheet'); let f = scope && scope.contains(lastField) ? lastField : (scope && scope.querySelector('input.answer, input[type=text], textarea'));
  if (!f) return;
  const s = f.selectionStart ?? f.value.length, en = f.selectionEnd ?? f.value.length;
  f.value = f.value.slice(0, s) + b.dataset.ch + f.value.slice(en);
  f.focus(); f.setSelectionRange(s + 1, s + 1);
});

/* ---------- ask one question ---------- */
let qUid = 0;
function askQ(q, mount, o = {}){
  return new Promise(resolve => {
    const uid = ++qUid, t0 = performance.now();
    let done = false, usedHelp = false, timer = null, autoT = null;
    const helpOn = q.es && !o.noHelp;
    let h = `<div class="q ${o.compact ? 'compact' : ''}"><div class="q-head"><div class="q-prompt">${q.prompt}</div>`;
    if (helpOn) h += `<button class="btn tiny help" type="button">🇪🇸 Ayuda</button>`;
    h += `</div>`;
    if (helpOn) h += `<div class="q-help" ${S.settings.es ? '' : 'hidden'}>${q.es}</div>`;
    h += `<div class="q-body">${q.media ? `<div class="q-media">${q.media}</div>` : ''}<div class="q-main">`;
    if (q.type === 'type') h += `<div class="typerow"><input class="answer" id="ans-${uid}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(q.placeholder || '')}" aria-label="Antwort"><button class="btn go" type="button">Prüfen ⏎</button></div>${umlautBar()}`;
    else h += `<div class="opts ${q.type}">` + q.options.map((op, i) => `<button class="opt ${op.cls || ''}" type="button" data-i="${i}"><kbd>${op.key || i + 1}</kbd><span>${op.html}</span></button>`).join('') + `</div>`;
    h += `</div></div>`;
    if (o.timeLimit) h += `<div class="timer"><i></i></div>`;
    h += `<div class="fb" hidden></div></div>`;
    mount.innerHTML = h;
    const root = mount.querySelector('.q');
    if (q.say) setTimeout(() => speak(q.say), 250);
    const helpBtn = root.querySelector('.help');
    if (helpBtn) helpBtn.onclick = () => { usedHelp = true; root.querySelector('.q-help').hidden = false; helpBtn.disabled = true; };
    const input = root.querySelector('input.answer');
    if (input) setTimeout(() => input.focus(), 30);
    if (o.timeLimit){
      const bar = root.querySelector('.timer i');
      requestAnimationFrame(() => { bar.style.transition = `width ${o.timeLimit}s linear`; bar.style.width = '0%'; });
      timer = setTimeout(() => answer(null, true), o.timeLimit * 1000);
    }
    root.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.i));
    const go = root.querySelector('.go'); if (go) go.onclick = () => answer(input.value);
    const popKeys = pushKeys((e, typing) => {
      if (done){
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter'){ next(); return true; }
        return false;
      }
      if (q.type === 'type'){ if (e.code === 'Enter' || e.code === 'NumpadEnter'){ answer(input.value); return true; } return false; }
      if (typing) return false;
      let i = -1;
      if (/^Digit[1-9]$/.test(e.code)) i = +e.code.slice(5) - 1;
      else if (/^Numpad[1-9]$/.test(e.code)) i = +e.code.slice(6) - 1;
      else { const k = e.key && e.key.toUpperCase(); i = q.options.findIndex(op => op.key && op.key === k); }
      if (i >= 0 && i < q.options.length){ answer(i); return true; }
      return false;
    });
    function answer(val, timeout){
      if (done) return; done = true; clearTimeout(timer);
      const ms = performance.now() - t0;
      let res, msg = '';
      if (q.type === 'type'){
        const r = checkTyped(val || '', q.accept); res = r.res; msg = r.msg; input.disabled = true;
        input.classList.add(res === 'right' ? 'right' : res === 'close' ? 'close' : 'wrong');
      } else {
        const op = val == null ? null : q.options[val];
        res = op && op.val === q.correct ? 'right' : 'wrong';
        root.querySelectorAll('.opt').forEach((b, i) => { b.disabled = true; const v = q.options[i].val; if (v === q.correct) b.classList.add('right'); else if (i === val) b.classList.add('wrong'); });
      }
      if (timeout) msg = 'Die Zeit ist um!';
      if (!o.noReward) onAnswer(res, q);
      res === 'right' ? SFX.ok() : SFX.bad();
      if (q.sayAfter && (res !== 'right' || o.sayRight !== false)) setTimeout(() => speak(q.sayAfter), 150);
      const fb = root.querySelector('.fb');
      let f = res === 'right' ? `<div class="fb-title ok">✔ Richtig!${combo >= 3 && !o.noReward ? ` <span class="combo">🔥 ${combo}</span>` : ''}</div>`
        : res === 'close' ? `<div class="fb-title warn">≈ Fast richtig!</div><div>Richtig geschrieben: ${q.answerHTML}</div>`
        : `<div class="fb-title bad">✘ ${timeout ? 'Zeit ist um!' : 'Leider falsch.'}</div><div>Richtig ist: ${q.answerHTML}</div>`;
      if (msg && !timeout) f += `<div class="fb-msg">${msg}</div>`;
      if (q.explain) f += `<div class="fb-ex">${q.explain}</div>`;
      if (q.explainEs && (res !== 'right' || S.settings.es)) f += `<div class="es">${q.explainEs}</div>`;
      f += `<div class="fb-actions"><button class="btn go-next" type="button">Weiter ⏎</button></div>`;
      fb.innerHTML = f; fb.hidden = false; fb.className = 'fb ' + res;
      fb.querySelector('.go-next').onclick = next;
      if (res === 'right' && o.autoNext !== false) autoT = setTimeout(next, o.autoNext || 1300);
      result = { result:res, ms, help:usedHelp, timeout:!!timeout };
      if (o.onResult) o.onResult(result);
    }
    let result = null, finished = false;
    function next(){ if (finished) return; finished = true; clearTimeout(autoT); popKeys(); resolve(result); }
  });
}

/* ---------- a series of questions in the modal ---------- */
async function runSeries(title, qs, o = {}){
  let correct = 0;
  openModal(`<div class="series"><div class="series-head"><h2>${title}</h2><div class="prog" id="s-prog"></div></div>${o.sub ? `<p class="sub">${o.sub}</p>` : ''}<div id="qmount"></div></div>`, o.cls || '');
  for (let i = 0; i < qs.length; i++){
    $('#s-prog').textContent = `${i + 1} / ${qs.length} · ✔ ${correct}`;
    const r = await askQ(qs[i], $('#qmount'), o);
    if (r.result === 'right') correct++;
    else if (r.result === 'close') correct += 0.5;
  }
  return { correct, total:qs.length };
}
