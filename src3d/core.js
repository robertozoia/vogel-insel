/* ============================================================
   CORE — utilities, save, spaced repetition, voice, sfx, input, UI shell
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function shuffle(a){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function sample(a, n){ return shuffle(a.slice()).slice(0, n); }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t){ return a + (b - a) * t; }
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function stripTags(s){ return String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(); }
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
function idOf(display){ const s = slug(display); if (WMAP[s]) return s; if (PLMAP[display]) return PLMAP[display]; return null; }

/* ---------- save ---------- */
const SAVE_KEY = 'vogelinsel3d.v1';
function defaultState(){
  return { v:1, name:'Ranger', feathers:0, xp:0, hearts:5, maxHearts:5, jokers:2, zone:1, met:{}, bosses:{}, stations:{}, words:{}, badges:{},
    skin:{ shirt:'#2f6fed', pants:'#1f2a44', hat:'cap', trail:null }, owned:{ 'shirt-#2f6fed':1, 'pants-#1f2a44':1, 'hat-cap':1, 'hat-none':1 },
    settings:{ sound:true, tts:true, es:false, sens:1 }, stats:{ ms:0, days:{}, topic:{} }, exams:[], lastDaily:'', dailyDays:0,
    arenaBest:0, artRight:0, bestCombo:0, pos:null, started:false, unlockAll:false };
}
function mergeState(o){
  const d = defaultState();
  return Object.assign(d, o, { settings:Object.assign(d.settings, o.settings || {}), stats:Object.assign(d.stats, o.stats || {}), skin:Object.assign(d.skin, o.skin || {}), owned:Object.assign(d.owned, o.owned || {}) });
}
function loadState(){ try { const raw = localStorage.getItem(SAVE_KEY); if (raw){ const o = JSON.parse(raw); if (o && o.v === 1) return mergeState(o); } } catch (e) {} return defaultState(); }
let S = loadState();
let saveTimer = null;
function save(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 400); }
function saveNow(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function exportCode(){ return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function importCode(c){ const o = JSON.parse(decodeURIComponent(escape(atob(c.trim())))); if (!o || o.v !== 1) throw new Error('bad'); S = mergeState(o); saveNow(); }
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
  if (result === 'right'){ s.r++; ts.r++; if (s.b === 0) s.b = 1; if (now >= s.d || s.b <= 1) s.b = Math.min(5, s.b + 1); s.d = now + BOX_MS[s.b]; }
  else if (result === 'wrong'){ s.w++; ts.w++; s.b = 1; s.d = now; }
  else { s.r++; if (s.b === 0) s.b = 1; s.d = now + 60e3; }
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
function tone(f, dur, type = 'square', vol = 0.05, when = 0, slide = 0){
  if (!S.settings.sound) return; const a = ac(); if (!a) return;
  const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.08, freq = 1200){
  if (!S.settings.sound) return; const a = ac(); if (!a) return;
  const b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
  s.buffer = b; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
}
const SFX = {
  ok(){ tone(740, .07, 'square', .04); tone(1110, .12, 'square', .04, .06); },
  bad(){ tone(200, .22, 'sawtooth', .05, 0, -110); },
  hit(){ noise(.15, .12, 900); tone(140, .12, 'square', .04, 0, -70); },
  boom(){ noise(.45, .16, 500); tone(90, .35, 'sawtooth', .05, 0, -50); },
  pick(){ tone(1320, .05, 'triangle', .05); tone(1760, .08, 'triangle', .04, .05); },
  jump(){ tone(420, .08, 'square', .025, 0, 260); },
  land(){ noise(.05, .04, 400); },
  shoot(){ tone(1400, .07, 'square', .025, 0, -1000); noise(.05, .03, 3000); },
  lvl(){ [523, 659, 784, 1046].forEach((f, i) => tone(f, .16, 'square', .05, i * .1)); },
  win(){ [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .11)); },
  boss(){ tone(110, .6, 'sawtooth', .06, 0, -40); tone(82, .7, 'square', .04, .15); },
  click(){ tone(620, .03, 'triangle', .03); },
  portal(){ tone(300, .5, 'sine', .05, 0, 600); tone(450, .5, 'sine', .04, .05, 700); },
  fall(){ tone(600, .5, 'sine', .05, 0, -520); },
  coin(){ tone(988, .06, 'square', .03); tone(1319, .1, 'square', .03, .06); },
};

/* ---------- German voice: pre-recorded clips (native voice), TTS only as fallback ---------- */
const VOICE = {};
const voiceUrl = {};
let voicePacks = 0;
function VOICE_ADD(o){ Object.assign(VOICE, o); voicePacks++; }
function vnorm(s){ return String(s).replace(/\s+/g, ' ').trim(); }
let curAudio = null, deVoice = null;
const HAS_TTS = 'speechSynthesis' in window;
function loadVoices(){ if (!HAS_TTS) return; const vs = speechSynthesis.getVoices(); deVoice = vs.find(v => /^de[-_]DE/i.test(v.lang) && /Anna|Helena|Google|Petra|Markus/i.test(v.name)) || vs.find(v => /^de[-_]/i.test(v.lang)) || null; }
if (HAS_TTS){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function hasVoice(text){ return !!VOICE[vnorm(text)] || !!deVoice; }
function speak(text){
  if (!S.settings.tts || !text) return;
  const k = vnorm(text);
  if (VOICE[k]){
    if (!voiceUrl[k]){ const bin = atob(VOICE[k]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); voiceUrl[k] = URL.createObjectURL(new Blob([u8], { type:'audio/mpeg' })); }
    try { if (curAudio){ curAudio.pause(); } if (HAS_TTS) speechSynthesis.cancel(); curAudio = new Audio(voiceUrl[k]); curAudio.play().catch(() => {}); } catch (e) {}
    return;
  }
  // Fallback: only with a real German voice, never with an English one reading German.
  if (!HAS_TTS || !deVoice) return;
  try { if (curAudio) curAudio.pause(); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = deVoice.lang; u.voice = deVoice; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {}
}
function speakBtn(text){ return `<button class="say" type="button" data-say="${esc(text)}" title="Anhören" aria-label="Anhören: ${esc(text)}">🔊</button>`; }
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b){ e.preventDefault(); speak(b.dataset.say); } });

/* ---------- input ---------- */
const keys = {};
const keyStack = [];
function pushKeys(fn){ keyStack.push(fn); return () => { const i = keyStack.indexOf(fn); if (i >= 0) keyStack.splice(i, 1); }; }
function isField(el){ return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'); }
let gameKey = null; // set by the engine
addEventListener('keydown', e => {
  const typing = isField(e.target);
  if (!typing){ keys[e.code] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault(); }
  if (keyStack.length && modal.hidden && panel.hidden) keyStack.length = 0;
  const top = keyStack[keyStack.length - 1];
  if (top){ if (top(e, typing)) e.preventDefault(); return; }
  if (modalOpen()){ if (e.code === 'Escape' && modal.dataset.closable === '1') closeModal(); return; }
  if (typing) return;
  if (gameKey) gameKey(e);
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function down(...codes){ return codes.some(c => keys[c]); }

/* ---------- modal, panel, toast ---------- */
const modal = $('#modal'), sheet = $('#sheet'), panel = $('#panel');
let onModalChange = null;
function openModal(html, cls = '', o = {}){ sheet.className = 'sheet ' + cls; sheet.innerHTML = html; modal.hidden = false; modal.dataset.closable = o.closable ? '1' : ''; sheet.scrollTop = 0; if (onModalChange) onModalChange(true); return sheet; }
function closeModal(){ modal.hidden = true; modal.dataset.closable = ''; sheet.innerHTML = ''; sheet.className = 'sheet'; if (onModalChange) onModalChange(false); }
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
  if (after > before){ SFX.lvl(); S.hearts = S.maxHearts; toast(`⬆️ <b>Level ${after + 1}: ${LEVELS[after][1]}</b> — Herzen voll!`, 'gold'); }
  hud(); save();
}
function badge(k){ if (S.badges[k]) return; S.badges[k] = Date.now(); const b = BADGES[k]; SFX.win(); toast(`${b.i} Abzeichen: <b>${b.n}</b>`, 'gold'); save(); }
function onAnswer(result, q){
  if (q && q.id) grade(q.id, result);
  if (result === 'right'){
    combo++; if (combo > S.bestCombo) S.bestCombo = combo; if (combo >= 10) badge('combo10');
    if (q && q.type === 'art'){ S.artRight++; if (S.artRight >= 30) badge('art30'); }
    addFeathers(Math.round(5 * mult()));
  } else if (result === 'wrong'){ combo = 0; }
  hud();
}
function hurt(n = 1){
  S.hearts = Math.max(0, S.hearts - n); combo = 0; SFX.hit(); hud(); save();
  const f = $('#hurt'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
}

/* ---------- HUD ---------- */
function hud(){
  const L = levelOf(S.xp), next = LEVELS[L + 1];
  const pct = next ? (S.xp - LEVELS[L][0]) / (next[0] - LEVELS[L][0]) * 100 : 100;
  let hearts = '';
  for (let i = 0; i < S.maxHearts; i++) hearts += `<span class="${i < S.hearts ? '' : 'empty'}">♥</span>`;
  $('#h-hearts').innerHTML = hearts;
  $('#h-feathers').textContent = S.feathers;
  $('#h-level').textContent = `LV ${L + 1}`;
  $('#h-title').textContent = LEVELS[L][1];
  $('#h-xp').style.width = pct + '%';
  const c = $('#h-combo');
  if (combo >= 3){ c.hidden = false; c.textContent = `🔥 ${combo}  x${mult()}`; } else c.hidden = true;
  $('#b-sound').textContent = S.settings.sound ? '🔊' : '🔇';
  $('#b-tts').classList.toggle('off', !S.settings.tts);
}
