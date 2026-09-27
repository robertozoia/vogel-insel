/* ============================================================
   SPRITES — everything is drawn in code, no image files
   ============================================================ */
function shade(hex, amt){
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function ell(g, x, y, rx, ry, rot = 0){ g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); }
function circ(g, x, y, r){ g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function rrect(g, x, y, w, h, r){ g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.fill(); }
function shadowAt(g, x, y, rx, ry){ g.fillStyle = 'rgba(0,0,0,.22)'; ell(g, x, y, rx, ry); }

function drawBeak(g, shape, c){
  g.fillStyle = c; g.beginPath();
  switch (shape){
    case 'thin': g.moveTo(22, -11); g.quadraticCurveTo(32, -11, 37, -3); g.lineTo(35, -2.5); g.quadraticCurveTo(30, -8, 22, -7); break;
    case 'hook': g.moveTo(21, -13); g.quadraticCurveTo(33, -14, 31, -3); g.quadraticCurveTo(28, -8, 21, -6); break;
    case 'chisel': g.moveTo(22, -12); g.lineTo(37, -10.5); g.lineTo(37, -8.3); g.lineTo(22, -6.5); break;
    case 'long': g.moveTo(22, -11.5); g.lineTo(49, -8); g.lineTo(22, -6); break;
    case 'flat': g.moveTo(21, -12); g.lineTo(32, -11.5); g.quadraticCurveTo(37, -9, 32, -6.3); g.lineTo(21, -6.5); break;
    case 'pouch': g.moveTo(21, -12); g.lineTo(47, -10.5); g.lineTo(45, -8); g.quadraticCurveTo(34, 3, 22, -4); break;
    default: g.moveTo(22, -12); g.lineTo(31, -9); g.lineTo(22, -6);
  }
  g.closePath(); g.fill();
}
// A generic bird facing right in local space; o = { col:{body,belly,head,beak,extra,leg}, shape, dir, t, after(g) }
function drawBird(g, x, y, s, o){
  g.save(); g.translate(x, y); g.scale((o.dir || 1) * s, s);
  if (!o.noShadow) shadowAt(g, 0, 23, 16, 4);
  g.strokeStyle = o.col.leg || '#c98a3a'; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-3, 12); g.lineTo(-5, 22); g.moveTo(4, 12); g.lineTo(4, 22); g.stroke();
  const bob = o.t ? Math.sin(o.t * 5) * 1.2 : 0;
  g.translate(0, bob);
  g.fillStyle = shade(o.col.body, -22); g.beginPath(); g.moveTo(-14, 0); g.lineTo(-30, -7); g.lineTo(-29, 5); g.closePath(); g.fill();
  g.fillStyle = o.col.body; ell(g, 0, 3, 18, 13);
  g.fillStyle = o.col.belly; ell(g, 5, 8, 11, 7);
  if (o.col.extra){ g.fillStyle = o.col.extra; ell(g, -9, 11, 5, 3.5); }
  g.fillStyle = shade(o.col.body, -28); ell(g, -4, 1, 11, 7, -0.2);
  g.fillStyle = o.col.head; circ(g, 14, -9, 9);
  g.fillStyle = '#fff'; circ(g, 17, -11, 2.7); g.fillStyle = '#111'; circ(g, 17.7, -11, 1.4);
  drawBeak(g, o.shape, o.col.beak);
  if (o.after) o.after(g);
  g.restore();
}
function drawOwl(g, x, y, s, t){
  g.save(); g.translate(x, y + Math.sin(t * 2) * 1); g.scale(s, s);
  shadowAt(g, 0, 20, 14, 4);
  g.fillStyle = '#8a6440'; ell(g, 0, 4, 15, 17);
  g.fillStyle = '#d9bf93'; ell(g, 0, 8, 9, 11);
  g.fillStyle = '#8a6440'; g.beginPath(); g.moveTo(-12, -8); g.lineTo(-9, -20); g.lineTo(-4, -10); g.moveTo(12, -8); g.lineTo(9, -20); g.lineTo(4, -10); g.fill();
  g.fillStyle = '#f6e7c4'; circ(g, -5.5, -5, 5.5); circ(g, 5.5, -5, 5.5);
  g.fillStyle = '#f2a33a'; circ(g, -5.5, -5, 3.2); circ(g, 5.5, -5, 3.2);
  g.fillStyle = '#111'; circ(g, -5.5, -5, 1.6); circ(g, 5.5, -5, 1.6);
  g.strokeStyle = '#2a2119'; g.lineWidth = 1.2; g.beginPath(); g.arc(-5.5, -5, 6, 0, Math.PI * 2); g.moveTo(11.5, -5); g.arc(5.5, -5, 6, 0, Math.PI * 2); g.moveTo(-0.5, -5); g.lineTo(0.5, -5); g.stroke();
  g.fillStyle = '#e0a13a'; g.beginPath(); g.moveTo(-2, 0); g.lineTo(2, 0); g.lineTo(0, 4); g.fill();
  g.fillStyle = '#2a2119'; g.fillRect(-9, -21, 18, 3); g.beginPath(); g.moveTo(-12, -21); g.lineTo(0, -26); g.lineTo(12, -21); g.lineTo(0, -17); g.fill();
  g.restore();
}
function drawPenguin(g, x, y, s, t){
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 4) * 0.06); g.scale(s, s);
  shadowAt(g, 0, 20, 12, 4);
  g.fillStyle = '#e8903a'; ell(g, -5, 19, 5, 2.5); ell(g, 5, 19, 5, 2.5);
  g.fillStyle = '#1f2330'; ell(g, 0, 3, 13, 17);
  g.fillStyle = '#f6f4ee'; ell(g, 1, 6, 9, 13);
  g.fillStyle = '#1f2330'; ell(g, -12, 4, 3.5, 9, 0.3); ell(g, 12, 4, 3.5, 9, -0.3);
  circ(g, 0, -11, 9);
  g.fillStyle = '#fff'; circ(g, 3, -12, 2.5); g.fillStyle = '#111'; circ(g, 3.6, -12, 1.3);
  g.fillStyle = '#e8903a'; g.beginPath(); g.moveTo(7, -10); g.lineTo(14, -8); g.lineTo(7, -6); g.fill();
  g.restore();
}
const NPC_LOOK = {
  amsel:{ col:{ body:'#26262d', belly:'#34343c', head:'#26262d', beak:'#f2b632' }, shape:'short' },
  adler:{ col:{ body:'#5b3a22', belly:'#6d4a2e', head:'#f4efe4', beak:'#f2b632' }, shape:'hook' },
  pelikan:{ col:{ body:'#f2efe8', belly:'#ffffff', head:'#f2efe8', beak:'#f2c14e' }, shape:'pouch' },
  buntspecht:{ col:{ body:'#1f1f24', belly:'#f2efe8', head:'#1f1f24', beak:'#44444c', extra:'#d2322d' }, shape:'chisel', after:g => { g.fillStyle = '#d2322d'; circ(g, 10, -15, 3.5); } },
};
function drawNPC(g, kind, x, y, s, t, dir = 1){
  if (kind === 'eule') return drawOwl(g, x, y, s, t);
  if (kind === 'pinguin') return drawPenguin(g, x, y, s, t);
  const L = NPC_LOOK[kind]; drawBird(g, x, y, s, { col:L.col, shape:L.shape, t, dir, after:L.after });
}

function drawRanger(g, x, y, s, dir, t, moving, hat){
  g.save(); g.translate(x, y); g.scale(s, s);
  shadowAt(g, 0, 15, 11, 4);
  const st = moving ? Math.sin(t * 14) * 2.2 : 0;
  g.fillStyle = '#4b3a2a'; g.fillRect(-6, 5 + Math.max(0, st), 5, 10 - Math.abs(st) * 0.4); g.fillRect(1, 5 + Math.max(0, -st), 5, 10 - Math.abs(st) * 0.4);
  g.fillStyle = '#7a5a3a'; g.fillRect(dir > 0 ? -13 : 8, -7, 5, 12);
  g.fillStyle = '#c9a66b'; rrect(g, -9, -8, 18, 15, 5);
  g.fillStyle = '#d6453a'; g.fillRect(-9, -8, 18, 3.5);
  g.fillStyle = '#b18a52'; g.fillRect(dir > 0 ? 1 : -6, -2, 5, 4);
  g.fillStyle = '#f1c9a0'; circ(g, 0, -15, 8);
  g.fillStyle = '#2a2119'; circ(g, dir * 2 - 2.2, -15, 1.2); circ(g, dir * 2 + 2.2, -15, 1.2);
  g.fillStyle = '#d9826a'; circ(g, dir * 5, -12.5, 1.6);
  if (!hat){
    g.fillStyle = '#3f6d33'; ell(g, 0, -20, 12.5, 3.6);
    rrect(g, -6.5, -28, 13, 8.5, 3); g.fillStyle = '#26421d'; g.fillRect(-6.5, -22.5, 13, 2.2);
  } else {
    g.font = '17px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(hat, 0, -19);
  }
  g.restore();
}
function drawMonster(g, x, y, s, t, seed = 0){
  g.save(); g.translate(x, y); g.scale(s, s);
  shadowAt(g, 0, 16, 14, 4);
  const w = t * 3 + seed;
  g.globalAlpha = 0.9;
  g.fillStyle = '#8f86a8'; circ(g, -7 + Math.sin(w) * 1.5, 2, 10); circ(g, 7, 1 + Math.cos(w) * 1.5, 11); circ(g, 0, -6 + Math.sin(w * 1.3) * 1.5, 11);
  g.fillStyle = '#b3abc8'; circ(g, -3, -9, 5);
  g.globalAlpha = 1;
  g.fillStyle = '#fff'; circ(g, -4, -3, 3.6); circ(g, 5, -3, 3.6);
  g.fillStyle = '#2a1f3a'; circ(g, -3.4, -2.4, 1.8); circ(g, 5.6, -2.4, 1.8);
  g.strokeStyle = '#2a1f3a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-8, -8); g.lineTo(-1, -6); g.moveTo(9, -8); g.lineTo(2, -6); g.stroke();
  g.restore();
}
function drawBoss(g, kind, x, y, s, t){
  const bob = Math.sin(t * 2.2) * 2;
  if (kind === 'crow') return drawBird(g, x, y + bob, s, { col:{ body:'#1b1b22', belly:'#2a2a33', head:'#1b1b22', beak:'#4d4d57' }, shape:'short', dir:-1, t,
    after:g2 => { g2.fillStyle = '#f2b632'; g2.beginPath(); g2.moveTo(7, -16); g2.lineTo(8, -24); g2.lineTo(11.5, -19); g2.lineTo(14, -26); g2.lineTo(16.5, -19); g2.lineTo(20, -24); g2.lineTo(21, -16); g2.closePath(); g2.fill(); g2.fillStyle = '#ff4b3a'; circ(g2, 17.6, -11, 1.4); } });
  if (kind === 'bones'){
    g.save(); g.globalAlpha = 0.35; g.fillStyle = '#8b5cf6'; circ(g, x, y, 34 * s * 0.6 + Math.sin(t * 3) * 4); g.restore();
    return drawBird(g, x, y + bob, s, { col:{ body:'#e9e2cf', belly:'#e9e2cf', head:'#f4efe0', beak:'#cfc6ae', leg:'#e9e2cf' }, shape:'hook', dir:-1, t,
      after:g2 => { g2.strokeStyle = '#6b5a45'; g2.lineWidth = 1.4; for (let i = -8; i <= 8; i += 4){ g2.beginPath(); g2.moveTo(i, -6); g2.quadraticCurveTo(i - 3, 4, i, 12); g2.stroke(); } g2.fillStyle = '#2a1f3a'; circ(g2, 16, -10, 3.4); g2.fillStyle = '#a855f7'; circ(g2, 16, -10, 1.6); } });
  }
  if (kind === 'kraken'){
    g.save(); g.translate(x, y + bob); g.scale(s, s);
    shadowAt(g, 0, 26, 26, 5);
    g.strokeStyle = '#3f7a4c'; g.lineWidth = 5; g.lineCap = 'round';
    for (let i = 0; i < 6; i++){ const bx = -15 + i * 6; g.beginPath(); g.moveTo(bx, 8); g.quadraticCurveTo(bx + Math.sin(t * 3 + i) * 8, 18, bx + Math.sin(t * 2 + i) * 10, 26); g.stroke(); }
    g.fillStyle = '#4f8a5c'; ell(g, 0, -2, 22, 18); g.fillStyle = '#6aa874'; ell(g, -6, -9, 8, 5);
    g.fillStyle = '#fff'; circ(g, -7, -4, 4.5); circ(g, 7, -4, 4.5); g.fillStyle = '#1b2a1e'; circ(g, -6, -3, 2.2); circ(g, 8, -3, 2.2);
    g.fillStyle = '#e0a13a'; g.beginPath(); g.moveTo(-5, 5); g.lineTo(5, 5); g.lineTo(0, 12); g.fill();
    g.restore(); return;
  }
  if (kind === 'golem'){
    g.save(); g.translate(x, y + bob * 0.5); g.scale(s, s);
    shadowAt(g, 0, 26, 24, 5);
    g.fillStyle = '#6f7682'; rrect(g, -18, -6, 36, 30, 6); g.fillStyle = '#868e9b'; rrect(g, -14, -26, 28, 22, 5);
    g.fillStyle = '#5a616c'; g.fillRect(-26, -2, 9, 20); g.fillRect(17, -2, 9, 20);
    g.fillStyle = '#7fe3ff'; circ(g, -6, -16, 3); circ(g, 6, -16, 3);
    const open = (Math.sin(t * 4) + 1) * 2;
    g.fillStyle = '#3f444d'; g.beginPath(); g.moveTo(-12, -10); g.lineTo(-30, -9 - open); g.lineTo(-12, -6); g.fill(); g.beginPath(); g.moveTo(-12, -6); g.lineTo(-30, -4 + open); g.lineTo(-12, -2); g.fill();
    g.fillStyle = '#b8bec8'; [[-12, 4], [12, 4], [-12, 18], [12, 18]].forEach(p => circ(g, p[0], p[1], 2));
    g.restore(); return;
  }
  if (kind === 'liar') return drawBird(g, x, y + bob, s, { col:{ body:'#6b3fa3', belly:'#b48be0', head:'#6b3fa3', beak:'#ff8fb1' }, shape:'short', dir:-1, t,
    after:g2 => { g2.fillStyle = '#16111f'; g2.fillRect(8, -14, 14, 5); g2.fillStyle = '#fff'; circ(g2, 17, -11.5, 1.6); g2.fillStyle = '#f2b632'; g2.font = 'bold 12px sans-serif'; g2.fillText('?', -6 + Math.sin(t * 3) * 2, -22); } });
  if (kind === 'geier'){
    g.save(); g.globalAlpha = 0.3; g.fillStyle = '#6d5b8a';
    for (let i = 0; i < 5; i++) circ(g, x + Math.cos(t + i * 1.3) * 60 * s / 3, y + Math.sin(t * 1.2 + i) * 30 * s / 3, 22 * s / 3);
    g.restore();
    return drawBird(g, x, y + bob, s, { col:{ body:'#4a3426', belly:'#5b4331', head:'#e6a7a0', beak:'#d9cdb5' }, shape:'hook', dir:-1, t,
      after:g2 => { g2.fillStyle = '#f2ece0'; ell(g2, 8, -1, 7, 5); g2.fillStyle = '#ff4b3a'; circ(g2, 17.6, -11, 1.3); } });
  }
}
function drawScroll(g, x, y, text, col = '#f6ecd2', ink = '#2a2119'){
  g.save(); g.font = 'bold 13px "Atkinson Hyperlegible", sans-serif';
  const w = Math.max(70, g.measureText(text).width + 22);
  g.fillStyle = 'rgba(0,0,0,.25)'; rrect(g, x - w / 2 + 2, y - 13, w, 28, 6);
  g.fillStyle = col; rrect(g, x - w / 2, y - 15, w, 28, 6);
  g.fillStyle = shade(col, -35); g.fillRect(x - w / 2 - 3, y - 17, 6, 32); g.fillRect(x + w / 2 - 3, y - 17, 6, 32);
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y);
  g.restore();
}
function drawEmoji(g, e, x, y, size){ g.save(); g.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, x, y); g.restore(); }
function textOut(g, txt, x, y, font, fill = '#fff', stroke = 'rgba(15,32,38,.85)', align = 'center'){
  g.save(); g.font = font; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = stroke; g.strokeText(txt, x, y); g.fillStyle = fill; g.fillText(txt, x, y); g.restore();
}
const ART_CANVAS = { der:'#7fb0ff', die:'#ff8a7e', das:'#6fe09a' };
const ART_DARK = { der:'#2563c9', die:'#c93a2f', das:'#1f8a47' };
function textWrap(g, txt, x, y, maxW, font, fill = '#fff', stroke = 'rgba(15,32,38,.9)', lh = 22){
  g.save(); g.font = font; const words = txt.split(' '), lines = []; let cur = '';
  for (const w of words){ const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); g.restore();
  lines.forEach((l, i) => textOut(g, l, x, y + i * lh, font, fill, stroke));
}
