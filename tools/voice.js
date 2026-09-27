// Pre-records every German text of the game with a native macOS voice.
// Usage: node tools/voice.js [VoiceName]      (default: Anna; e.g. "Anna (Premium)" once installed)
// Needs macOS `say` and `lame`. Output: audio/voice-N.js packs (loaded by the game).
const fs = require('fs'), path = require('path'), os = require('os');
const { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(ROOT, 'src/content.js'), 'utf8') + ';global.__C={WORDS,WMAP,DIAGRAMS,CLOZE,TF,BEAKS,BEAK_FIX,MERKMALE,NPCS,BOSSES,GEIER,STATION_INFO};');
const C = global.__C;
const VOICE = process.argv[2] || 'Anna';
const norm = s => String(s).replace(/\s+/g, ' ').trim();
const texts = new Set();
const add = s => { if (s && /[A-Za-zÄÖÜäöüß]/.test(s)) texts.add(norm(s)); };
const nounLabel = w => w.art ? w.art + ' ' + w.de : w.de;
C.WORDS.forEach(w => { add(nounLabel(w)); add(w.de); if (w.ex) add(w.ex); });
Object.values(C.DIAGRAMS).forEach(D => D.labels.forEach(L => add(L.text || nounLabel(C.WMAP[L.id]))));
Object.values(C.CLOZE).forEach(c => c.parts.forEach(p => { const re = /\[\[(.+?)\]\]/g; let m; while ((m = re.exec(p))) add(m[1].split('|')[0]); }));
Object.values(C.NPCS).forEach(n => n.lines.forEach(l => add(l[0])));
Object.values(C.BOSSES).forEach(b => { add(b.intro[0]); add(b.win[0]); });
C.GEIER.intro.forEach(l => add(l[0]));
C.TF.forEach(t => { add(t.s); if (t.why) add(t.why); });
C.BEAKS.forEach(b => { add(`${b.art} ${b.name} hat ${b.beakAcc}, um ${b.foodAcc} zu fressen.`); add(b.name); });
C.BEAK_FIX.forEach(f => add(f.s.replace('___', f.a)));
C.MERKMALE.forEach(m => add(m.de));
Object.values(C.STATION_INFO).forEach(i => add(i.de));
['Der Schnabel. Die Kloake. Das Brustbein.', 'Sie sind zu schwer.', 'Der Buntspecht hat einen kräftigen Meißelschnabel, um Larven zu fressen.',
 'Die Kloake ist eine gemeinsame Körperöffnung. Durch sie verlassen Kot, Urin und Eier (beim Männchen die Spermazellen) den Körper.',
 'Der Strauß, der Emu, der Pinguin und der Kiwi können nicht fliegen, weil sie zu schwer sind.', 'Richtig!', 'Falsch!', 'der', 'die', 'das'].forEach(add);
const list = [...texts];
console.log(list.length, 'texts, voice:', VOICE);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-'));
const run = (cmd, args) => new Promise((res, rej) => execFile(cmd, args, err => err ? rej(err) : res()));
async function render(t, i){
  const aiff = path.join(tmp, i + '.aiff'), mp3 = path.join(tmp, i + '.mp3');
  // words alone are spoken a little slower
  const rate = t.split(' ').length <= 3 ? '150' : '165';
  await run('say', ['-v', VOICE, '-r', rate, '-o', aiff, t]);
  await run('lame', ['--quiet', '-m', 'm', '-b', '40', '--resample', '22.05', aiff, mp3]);
  return fs.readFileSync(mp3).toString('base64');
}
(async () => {
  const out = {}; let next = 0, done = 0;
  const worker = async () => { while (next < list.length){ const i = next++; out[list[i]] = await render(list[i], i); if (++done % 50 === 0) console.log(done, '/', list.length); } };
  await Promise.all(Array.from({ length:6 }, worker));
  fs.mkdirSync(path.join(ROOT, 'audio'), { recursive:true });
  fs.readdirSync(path.join(ROOT, 'audio')).filter(f => /^voice-\d+\.js$/.test(f)).forEach(f => fs.unlinkSync(path.join(ROOT, 'audio', f)));
  let pack = {}, size = 0, n = 0; const packs = [];
  const flush = () => { if (!size) return; const f = `voice-${n++}.js`; fs.writeFileSync(path.join(ROOT, 'audio', f), 'VOICE_ADD(' + JSON.stringify(pack) + ');\n'); packs.push(f); pack = {}; size = 0; };
  for (const t of list){ pack[t] = out[t]; size += out[t].length; if (size > 900000) flush(); }
  flush();
  fs.writeFileSync(path.join(ROOT, 'audio', 'packs.json'), JSON.stringify({ voice:VOICE, packs, count:list.length }));
  const total = packs.reduce((a, f) => a + fs.statSync(path.join(ROOT, 'audio', f)).size, 0);
  console.log('packs:', packs.length, 'total MB:', (total / 1e6).toFixed(2));
  fs.rmSync(tmp, { recursive:true, force:true });
})().catch(e => { console.error(e); process.exit(1); });
