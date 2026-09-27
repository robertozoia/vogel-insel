/* ============================================================
   CORE — utilities, save, spaced repetition, audio, input, UI shell
   ============================================================ */
const W = 960, H = 600;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function shuffle(a){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function sample(a, n){ return shuffle(a.slice()).slice(0, n); }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function todayStr(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- words ---------- */
function nounLabel(w){ return w.art ? w.art + ' ' + w.de : w.de; }
function artClass(a){ return a ? 'art-' + a.toLowerCase() : ''; }
function wordHTML(w, withPl){
  const lab = w.art ? `<b class="${artClass(w.art)}">${esc(nounLabel(w))}</b>` : `<b>${esc(w.de)}</b>`;
  const pl = withPl && w.pl ? ` <span class="muted">(Pl. die ${esc(w.pl)})</span>` : (withPl && w.po ? ' <span class="muted">(nur Plural)</span>' : '');
  return lab + pl;
}
function idOf(display){
  const s = slug(display);
  if (WMAP[s]) return s;
  if (PLMAP[display]) return PLMAP[display];
  return null;
}

/* ---------- save ---------- */
const SAVE_KEY = 'vogelinsel.v1';
function defaultState(){
  return { v:1, name:'Ranger', feathers:0, xp:0, hearts:5, maxHearts:5, jokers:2, zone:1, met:{}, bosses:{}, stations:{}, words:{}, badges:{},
    hat:null, owned:{}, settings:{ sound:true, tts:true, es:false }, stats:{ ms:0, days:{}, topic:{} }, exams:[], lastDaily:'', dailyDays:0,
    arenaBest:0, artRight:0, bestCombo:0, pos:null, started:false };
}
function loadState(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw){ const o = JSON.parse(raw); if (o && o.v === 1){ const d = defaultState(); return Object.assign(d, o, { settings:Object.assign(d.settings, o.settings || {}), stats:Object.assign(d.stats, o.stats || {}) }); } }
  } catch (e) {}
  return defaultState();
}
let S = loadState();
let saveTimer = null;
function save(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 400); }
function saveNow(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function exportCode(){ return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function importCode(c){
  const o = JSON.parse(decodeURIComponent(escape(atob(c.trim()))));
  if (!o || o.v !== 1) throw new Error('bad');
  const d = defaultState();
  S = Object.assign(d, o, { settings:Object.assign(d.settings, o.settings || {}), stats:Object.assign(d.stats, o.stats || {}) });
  saveNow();
}
addEventListener('beforeunload', saveNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });

/* ---------- spaced repetition (Leitner, 5 boxes) ---------- */
const BOX_MS = [0, 0, 5 * 60e3, 30 * 60e3, 4 * 3600e3, 20 * 3600e3];
function ws(id){ return S.words[id] || (S.words[id] = { b:0, d:0, r:0, w:0 }); }
function tier(id){ const w = S.words[id]; if (!w || w.b === 0) return 0; if (w.b <= 2) return 1; if (w.b <= 4) return 2; return 3; }
const TIER_NAME = ['neu', 'Bronze', 'Silber', 'Gold'];
function grade(id, result){
  const w = WMAP[id]; if (!w) return;
  const s = ws(id), now = Date.now();
  const ts = S.stats.topic[w.t] || (S.stats.topic[w.t] = { r:0, w:0 });
  if (result === 'right'){
    s.r++; ts.r++;
    if (s.b === 0) s.b = 1;
    if (now >= s.d || s.b <= 1) s.b = Math.min(5, s.b + 1);
    s.d = now + BOX_MS[s.b];
  } else if (result === 'wrong'){
    s.w++; ts.w++; s.b = 1; s.d = now;
  } else { // close
    s.r++; if (s.b === 0) s.b = 1; s.d = now + 60e3;
  }
  if (Object.values(S.words).filter(x => x.b >= 5).length >= 20) badge('gold20');
  save();
}
function pickWords(ids, n){
  const now = Date.now();
  return ids.map(id => {
    const s = S.words[id]; let sc;
    if (!s || s.b === 0) sc = 5 + Math.random() * 2;
    else if (s.d <= now) sc = 10 - s.b + Math.random() * 1.5 + (s.w > s.r ? 1 : 0);
    else sc = Math.random() * 3 - s.b * 0.5;
    return [sc, id];
  }).sort((a, b) => b[0] - a[0]).slice(0, n).map(x => x[1]);
}
function topicIds(t, filter){ return WORDS.filter(w => (t === 'all' || w.t === t) && (!filter || filter(w))).map(w => w.id); }
function unlockedTopics(){ const t = []; for (let z = 1; z <= 5; z++) if (z <= S.zone) t.push(ZONES[z].topic); if (S.zone >= 5) t.push('op'); return t; }
function dueCount(){ const now = Date.now(); const ts = unlockedTopics(); return WORDS.filter(w => ts.includes(w.t) && S.words[w.id] && S.words[w.id].b > 0 && S.words[w.id].d <= now).length; }

/* ---------- sound effects (Web Audio synth) ---------- */
let AC = null;
function ac(){ if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, dur, type = 'square', vol = 0.06, when = 0, slide = 0){
  if (!S.settings.sound) return; const a = ac(); if (!a) return;
  const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.08){
  if (!S.settings.sound) return; const a = ac(); if (!a) return;
  const b = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), g = a.createGain(); g.gain.value = vol; s.buffer = b; s.connect(g); g.connect(a.destination); s.start();
}
const SFX = {
  ok(){ tone(660, .08, 'square', .05); tone(990, .14, 'square', .05, .07); },
  bad(){ tone(220, .22, 'sawtooth', .05, 0, -120); },
  hit(){ noise(.12, .09); tone(160, .1, 'square', .05, 0, -80); },
  pick(){ tone(1320, .06, 'triangle', .05); tone(1760, .08, 'triangle', .04, .05); },
  step(){ tone(90, .03, 'triangle', .02); },
  lvl(){ [523, 659, 784, 1046].forEach((f, i) => tone(f, .16, 'square', .05, i * .1)); },
  win(){ [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .11)); },
  boss(){ tone(110, .5, 'sawtooth', .06, 0, -40); tone(82, .6, 'square', .04, .15); },
  click(){ tone(520, .03, 'triangle', .03); },
  shoot(){ tone(900, .08, 'square', .03, 0, -600); },
};

/* ---------- German text-to-speech ---------- */
let deVoice = null;
const HAS_TTS = 'speechSynthesis' in window;
function loadVoices(){
  if (!HAS_TTS) return;
  const vs = speechSynthesis.getVoices();
  deVoice = vs.find(v => /^de[-_]DE/i.test(v.lang) && /Anna|Helena|Google|Markus|Petra/i.test(v.name)) || vs.find(v => /^de[-_]DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null;
}
if (HAS_TTS){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function speak(text, rate = 0.85){
  if (!S.settings.tts || !HAS_TTS || !text) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; if (deVoice) u.voice = deVoice; u.rate = rate; speechSynthesis.speak(u); } catch (e) {}
}
function speakBtn(text){ return `<button class="say" type="button" data-say="${esc(text)}" title="Anhören" aria-label="Anhören: ${esc(text)}">🔊</button>`; }
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b){ e.preventDefault(); speak(b.dataset.say); } });

/* ---------- input ---------- */
const keys = {};
const keyStack = [];
function pushKeys(fn){ keyStack.push(fn); return () => { const i = keyStack.indexOf(fn); if (i >= 0) keyStack.splice(i, 1); }; }
function isField(el){ return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'); }
addEventListener('keydown', e => {
  const typing = isField(e.target);
  if (!typing){
    keys[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  }
  if (keyStack.length && modal.hidden && panel.hidden) keyStack.length = 0; // handlers belong to a closed sheet
  const top = keyStack[keyStack.length - 1];
  if (top){ if (top(e, typing)) e.preventDefault(); return; }
  if (modalOpen()){ if (e.code === 'Escape' && modal.dataset.closable === '1') closeModal(); return; }
  if (typing) return;
  if (scene && scene.key) scene.key(e);
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function down(...codes){ return codes.some(c => keys[c]); }

/* ---------- stage, canvas ---------- */
const stage = $('#stage'), cv = $('#cv'), ctx = cv.getContext('2d');
let K = 1, stageScale = 1;
function resize(){
  const s = Math.min((innerWidth - 32) / W, (innerHeight - 32) / H);
  stageScale = clamp(s, 0.25, 1.8);
  stage.style.transform = `translate(-50%, -50%) scale(${stageScale})`;
  const dpr = window.devicePixelRatio || 1;
  K = Math.min(3, dpr * stageScale);
  cv.width = Math.round(W * K); cv.height = Math.round(H * K);
}
addEventListener('resize', resize); resize();
function canvasPos(e){ const r = cv.getBoundingClientRect(); return { x:(e.clientX - r.left) / r.width * W, y:(e.clientY - r.top) / r.height * H }; }
cv.addEventListener('pointerdown', e => { if (modalOpen()) return; const p = canvasPos(e); if (scene && scene.click) scene.click(p.x, p.y); });

/* ---------- scene loop ---------- */
let scene = null;
function setScene(s){ if (scene && scene.exit) scene.exit(); scene = s; if (s && s.enter) s.enter(); }
let lastT = performance.now();
function frame(t){
  const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t;
  if (S.started) S.stats.ms += dt * 1000;
  if (scene){
    if (!(modalOpen() && scene.pauseOnModal !== false)) scene.update(dt);
    ctx.setTransform(K, 0, 0, K, 0, 0);
    scene.draw(ctx);
  }
  requestAnimationFrame(frame);
}

/* ---------- modal, panel, toast ---------- */
const modal = $('#modal'), sheet = $('#sheet'), panel = $('#panel');
function openModal(html, cls = '', o = {}){ sheet.className = 'sheet ' + cls; sheet.innerHTML = html; modal.hidden = false; modal.dataset.closable = o.closable ? '1' : ''; sheet.scrollTop = 0; return sheet; }
function closeModal(){ modal.hidden = true; modal.dataset.closable = ''; sheet.innerHTML = ''; sheet.className = 'sheet'; }
function modalOpen(){ return !modal.hidden; }
function toast(html, kind = ''){
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = html;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
}

/* ---------- rewards, levels, badges ---------- */
let combo = 0;
function mult(){ return 1 + Math.min(4, Math.floor(combo / 3)) * 0.5; }
function levelOf(xp){ let i = 0; for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k][0]) i = k; return i; }
function addFeathers(n){
  const before = levelOf(S.xp);
  S.feathers += n; S.xp += n;
  const after = levelOf(S.xp);
  if (after > before){ SFX.lvl(); S.hearts = S.maxHearts; toast(`⬆️ <b>Level ${after + 1}: ${LEVELS[after][1]}</b> <span class="es-inline">(${LEVELS[after][2]})</span> — Herzen voll!`, 'gold'); }
  hud(); save();
}
function badge(k){
  if (S.badges[k]) return; S.badges[k] = Date.now();
  const b = BADGES[k]; SFX.win(); toast(`${b.i} Abzeichen: <b>${b.n}</b>`, 'gold'); save();
}
function onAnswer(result, q){
  if (q && q.id) grade(q.id, result);
  if (result === 'right'){
    combo++; if (combo > S.bestCombo) S.bestCombo = combo; if (combo >= 10) badge('combo10');
    if (q && q.type === 'art'){ S.artRight++; if (S.artRight >= 30) badge('art30'); }
    addFeathers(Math.round(5 * mult()));
  } else if (result === 'wrong'){ combo = 0; }
  hud();
}

/* ---------- HUD ---------- */
function hud(){
  const L = levelOf(S.xp), next = LEVELS[L + 1];
  const pct = next ? (S.xp - LEVELS[L][0]) / (next[0] - LEVELS[L][0]) * 100 : 100;
  let hearts = '';
  for (let i = 0; i < S.maxHearts; i++) hearts += `<span class="${i < S.hearts ? '' : 'empty'}">♥</span>`;
  $('#h-hearts').innerHTML = hearts;
  $('#h-feathers').textContent = S.feathers;
  $('#h-level').innerHTML = `Lv ${L + 1} · ${LEVELS[L][1]}`;
  $('#h-xp').style.width = pct + '%';
  const c = $('#h-combo');
  if (combo >= 3){ c.hidden = false; c.textContent = `🔥 ${combo} · x${mult()}`; } else c.hidden = true;
  $('#b-sound').textContent = S.settings.sound ? '🔔' : '🔕';
  $('#b-sound').setAttribute('aria-label', S.settings.sound ? 'Geräusche aus' : 'Geräusche an');
  $('#b-tts').classList.toggle('off', !S.settings.tts);
}
