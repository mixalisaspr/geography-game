// Ζωγραφική με canvas: φόντο με parallax (ουρανός, βουνά, θάλασσα, αξιοθέατα, λόφοι),
// έδαφος, εμπόδια, checkpoints, μηχανή και σωματίδια. Όλα διαδικαστικά – χωρίς εικόνες.

import { CFG } from './physics.js';

const TAU = Math.PI * 2;

// ---------- βοηθητικά ----------
function hash1(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function noise1(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash1(i) * (1 - u) + hash1(i + 1) * u;
}
function fbm(x) {
  return noise1(x) * 0.6 + noise1(x * 2.13 + 7.1) * 0.28 + noise1(x * 4.37 + 3.3) * 0.12;
}
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}
export function shade(c, amt) {
  return amt >= 0 ? mix(c, '#ffffff', amt) : mix(c, '#000000', -amt);
}

function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
}

// ---------- αξιοθέατα (τοπικές μονάδες: (0,0) = κάτω κέντρο, y προς τα κάτω) ----------
const STONE = '#d9ccb4';
const MARBLE = '#f2ebdc';

function crenels(ctx, x0, x1, y, h, w = 10) {
  for (let x = x0; x < x1 - 1; x += w * 2) ctx.fillRect(x, y - h, Math.min(w, x1 - x), h);
}
function windowsGrid(ctx, x0, y0, cols, rows, dx, dy, w, h) {
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) ctx.fillRect(x0 + i * dx, y0 + j * dy, w, h);
}
function hillBase(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w, 10);
  ctx.bezierCurveTo(-w * 0.6, -h, w * 0.6, -h, w, 10);
  ctx.closePath();
  ctx.fill();
}

export const LANDMARKS = {
  parthenon(ctx, t, th) {
    hillBase(ctx, 230, 70, shade(th.far, -0.05));
    ctx.translate(0, -48);
    ctx.fillStyle = shade(MARBLE, -0.08);
    ctx.fillRect(-112, -8, 224, 8);
    ctx.fillStyle = MARBLE;
    ctx.fillRect(-106, -16, 212, 8);
    for (let i = 0; i < 8; i++) {
      const x = -98 + i * 27;
      ctx.fillStyle = MARBLE;
      ctx.fillRect(x, -86, 13, 70);
      ctx.fillStyle = shade(MARBLE, -0.12);
      ctx.fillRect(x + 9, -86, 4, 70);
    }
    ctx.fillStyle = MARBLE;
    ctx.fillRect(-108, -100, 216, 14);
    ctx.fillStyle = shade(MARBLE, -0.1);
    ctx.fillRect(-108, -90, 216, 3);
    ctx.fillStyle = MARBLE;
    poly(ctx, [-112, -100, 0, -124, 112, -100]);
    ctx.fill();
    ctx.fillStyle = shade(MARBLE, -0.15);
    poly(ctx, [-90, -102, 0, -119, 90, -102]);
    ctx.fill();
  },
  whiteTower(ctx) {
    const c = '#f4f0e6';
    const g = ctx.createLinearGradient(-42, 0, 42, 0);
    g.addColorStop(0, shade(c, -0.18));
    g.addColorStop(0.45, c);
    g.addColorStop(1, shade(c, -0.25));
    ctx.fillStyle = shade(c, -0.3);
    ctx.fillRect(-90, -8, 180, 8);
    ctx.fillStyle = g;
    ctx.fillRect(-40, -176, 80, 170);
    ctx.fillRect(-44, -184, 88, 10);
    crenels(ctx, -44, 44, -184, 9, 8);
    ctx.fillRect(-18, -212, 36, 30);
    crenels(ctx, -18, 18, -212, 7, 6);
    ctx.fillStyle = '#4b5563';
    for (const [x, y] of [
      [-22, -150],
      [6, -150],
      [-8, -110],
      [-22, -70],
      [6, -70],
    ])
      ctx.fillRect(x, y, 6, 12);
    ctx.fillStyle = '#7d5a3a';
    ctx.beginPath();
    ctx.arc(0, -8, 10, Math.PI, 0);
    ctx.fill();
  },
  fortress(ctx, t, th) {
    hillBase(ctx, 200, 50, shade(th.far, -0.08));
    ctx.translate(0, -30);
    const c = STONE;
    ctx.fillStyle = c;
    ctx.fillRect(-150, -70, 300, 72);
    crenels(ctx, -150, 150, -70, 10, 10);
    ctx.fillStyle = shade(c, -0.08);
    ctx.fillRect(-170, -112, 46, 114);
    ctx.fillRect(124, -112, 46, 114);
    ctx.fillRect(-30, -128, 60, 130);
    ctx.fillStyle = c;
    crenels(ctx, -170, -124, -112, 10, 8);
    crenels(ctx, 124, 170, -112, 10, 8);
    crenels(ctx, -30, 30, -128, 10, 8);
    ctx.fillStyle = '#3f3a33';
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.lineTo(-14, -30);
    ctx.arc(0, -30, 14, Math.PI, 0);
    ctx.lineTo(14, 2);
    ctx.fill();
    ctx.fillRect(-152, -90, 6, 14);
    ctx.fillRect(146, -90, 6, 14);
    ctx.fillRect(-4, -110, 8, 14);
    // σημαία
    ctx.fillStyle = '#5b4a3a';
    ctx.fillRect(-1, -168, 2, 40);
    ctx.fillStyle = th._flag || '#c0392b';
    ctx.beginPath();
    ctx.moveTo(1, -168);
    ctx.quadraticCurveTo(14, -164 + Math.sin(t * 4) * 3, 26, -162);
    ctx.lineTo(26, -150);
    ctx.quadraticCurveTo(14, -152 + Math.sin(t * 4) * 3, 1, -156);
    ctx.fill();
  },
  windmill(ctx, t) {
    ctx.fillStyle = '#f4efe3';
    poly(ctx, [-26, 0, -20, -90, 20, -90, 26, 0]);
    ctx.fill();
    ctx.fillStyle = '#8a5a3c';
    poly(ctx, [-24, -88, 0, -116, 24, -88]);
    ctx.fill();
    ctx.fillStyle = '#5a4636';
    ctx.fillRect(-7, -22, 14, 22);
    ctx.save();
    ctx.translate(0, -96);
    ctx.rotate(t * 1.4);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(TAU / 8);
      ctx.strokeStyle = '#6b5644';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -70);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      poly(ctx, [0, -14, 0, -68, 18, -30]);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#6b5644';
    ctx.beginPath();
    ctx.arc(0, -96, 5, 0, TAU);
    ctx.fill();
  },
  clocktower(ctx, t) {
    const c = '#d8c7a6';
    ctx.fillStyle = shade(c, -0.1);
    ctx.fillRect(-26, -12, 52, 12);
    ctx.fillStyle = c;
    ctx.fillRect(-20, -200, 40, 190);
    ctx.fillStyle = shade(c, -0.12);
    ctx.fillRect(10, -200, 10, 190);
    ctx.fillStyle = shade(c, 0.1);
    ctx.fillRect(-24, -206, 48, 10);
    ctx.fillStyle = '#6e7f80';
    poly(ctx, [-24, -206, 0, -246, 24, -206]);
    ctx.fill();
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(0, -176, 14, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const m = t * 0.6;
    ctx.moveTo(0, -176);
    ctx.lineTo(Math.sin(m) * 11, -176 - Math.cos(m) * 11);
    ctx.moveTo(0, -176);
    ctx.lineTo(Math.sin(m / 12) * 7, -176 - Math.cos(m / 12) * 7);
    ctx.stroke();
    ctx.fillStyle = '#4a4036';
    ctx.fillRect(-5, -130, 10, 16);
    ctx.fillRect(-5, -80, 10, 16);
  },
  mosque(ctx) {
    const c = '#ebe3d4';
    const dome = '#8d99a6';
    ctx.fillStyle = c;
    ctx.fillRect(-110, -70, 220, 70);
    ctx.fillStyle = dome;
    for (const [x, r] of [
      [-70, 26],
      [70, 26],
    ]) {
      ctx.beginPath();
      ctx.arc(x, -70, r, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = c;
    ctx.fillRect(-56, -104, 112, 36);
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.arc(0, -104, 56, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = shade(dome, 0.2);
    ctx.beginPath();
    ctx.arc(-12, -112, 30, Math.PI * 1.1, Math.PI * 1.55);
    ctx.lineTo(-12, -112);
    ctx.fill();
    ctx.fillStyle = '#c9a646';
    ctx.fillRect(-1.5, -176, 3, 18);
    for (const x of [-150, 150]) {
      ctx.fillStyle = c;
      ctx.fillRect(x - 7, -210, 14, 210);
      ctx.fillRect(x - 10, -150, 20, 6);
      ctx.fillRect(x - 10, -190, 20, 5);
      ctx.fillStyle = dome;
      poly(ctx, [x - 7, -210, x, -250, x + 7, -210]);
      ctx.fill();
    }
    ctx.fillStyle = '#5b5145';
    for (let i = 0; i < 5; i++) {
      const x = -88 + i * 40;
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.lineTo(x, -40);
      ctx.arc(x + 8, -40, 8, Math.PI, 0);
      ctx.lineTo(x + 16, -10);
      ctx.fill();
    }
  },
  lighthouse(ctx, t) {
    ctx.fillStyle = '#6f6a62';
    poly(ctx, [-60, 6, -40, -16, 40, -16, 60, 6]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    poly(ctx, [-20, -16, -12, -150, 12, -150, 20, -16]);
    ctx.fill();
    ctx.fillStyle = '#d0393b';
    for (let i = 0; i < 3; i++) {
      const y0 = -40 - i * 40;
      const w0 = 20 - ((-16 - y0) / 134) * 8;
      const w1 = 20 - ((-16 - (y0 - 18)) / 134) * 8;
      poly(ctx, [-w0, y0, -w1, y0 - 18, w1, y0 - 18, w0, y0]);
      ctx.fill();
    }
    ctx.fillStyle = '#333';
    ctx.fillRect(-16, -156, 32, 6);
    ctx.fillStyle = '#ffe680';
    ctx.fillRect(-10, -176, 20, 20);
    ctx.fillStyle = '#d0393b';
    poly(ctx, [-14, -176, 0, -192, 14, -176]);
    ctx.fill();
    const a = Math.sin(t * 1.5);
    ctx.fillStyle = 'rgba(255,240,170,0.28)';
    poly(ctx, [0, -166, 260 * a, -200, 260 * a, -136]);
    ctx.fill();
  },
  bridge(ctx, t, th) {
    const c = '#cdbfa6';
    ctx.fillStyle = shade(th.far, -0.1);
    poly(ctx, [-220, 10, -200, -40, -120, -46, -110, 10]);
    ctx.fill();
    poly(ctx, [220, 10, 200, -40, 120, -46, 110, 10]);
    ctx.fill();
    ctx.fillStyle = th.waterColor || '#3a8ab5';
    ctx.fillRect(-120, -8, 240, 18);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-150, -40);
    ctx.quadraticCurveTo(0, -150, 150, -40);
    ctx.lineTo(150, -28);
    ctx.lineTo(112, -28);
    ctx.quadraticCurveTo(0, -114, -112, -28);
    ctx.lineTo(-150, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shade(c, -0.25);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-150, -46);
    ctx.quadraticCurveTo(0, -156, 150, -46);
    ctx.stroke();
    ctx.fillStyle = shade(c, -0.08);
    ctx.fillRect(-160, -60, 24, 32);
    ctx.fillRect(136, -60, 24, 32);
    ctx.fillRect(-160, -78, 16, 18);
    ctx.fillRect(144, -78, 16, 18);
  },
  cliffChurch(ctx, t, th) {
    ctx.fillStyle = shade(th.far, -0.15);
    poly(ctx, [-160, 10, -120, -40, -60, -70, 40, -78, 110, -60, 150, 10]);
    ctx.fill();
    ctx.translate(-10, -74);
    const brick = '#c58a5a';
    ctx.fillStyle = brick;
    ctx.fillRect(-50, -40, 100, 40);
    ctx.fillStyle = '#a8492f';
    poly(ctx, [-56, -40, 0, -62, 56, -40]);
    ctx.fill();
    ctx.fillStyle = brick;
    ctx.fillRect(-16, -78, 32, 30);
    ctx.fillStyle = '#a8492f';
    poly(ctx, [-20, -78, 0, -96, 20, -78]);
    ctx.fill();
    ctx.fillStyle = '#7a3a26';
    for (const x of [-34, -12, 10, 30]) {
      ctx.beginPath();
      ctx.moveTo(x, -6);
      ctx.lineTo(x, -22);
      ctx.arc(x + 3, -22, 3, Math.PI, 0);
      ctx.lineTo(x + 6, -6);
      ctx.fill();
    }
    ctx.fillStyle = '#4b3424';
    ctx.fillRect(-1.5, -108, 3, 14);
    ctx.fillRect(-6, -104, 12, 3);
  },
  theater(ctx, t, th) {
    ctx.fillStyle = shade(th.far, -0.1);
    poly(ctx, [-220, 8, -180, -90, 180, -90, 220, 8]);
    ctx.fill();
    const c = '#e2d6c0';
    for (let i = 0; i < 9; i++) {
      const y = -10 - i * 10;
      const w = 120 + i * 11;
      ctx.fillStyle = i % 2 ? c : shade(c, -0.1);
      ctx.beginPath();
      ctx.ellipse(0, y, w, 10, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = shade(c, 0.05);
    ctx.fillRect(-120, -10, 240, 14);
    ctx.fillStyle = MARBLE;
    for (let i = 0; i < 7; i++) ctx.fillRect(-108 + i * 34, -52, 8, 42);
    ctx.fillRect(-114, -58, 228, 8);
  },
  cathedral(ctx, t, th) {
    const c = '#ece4d2';
    const gold = '#d6a63a';
    const green = '#5f8f7a';
    ctx.fillStyle = c;
    ctx.fillRect(-120, -70, 240, 70);
    ctx.fillRect(-60, -110, 120, 42);
    ctx.fillRect(-26, -150, 52, 42);
    for (const [x, y, r, col] of [
      [-90, -70, 20, green],
      [90, -70, 20, green],
      [-44, -110, 18, green],
      [44, -110, 18, green],
      [0, -150, 26, gold],
    ]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 0);
      ctx.quadraticCurveTo(x, y - r * 1.5, x, y - r * 1.7);
      ctx.quadraticCurveTo(x, y - r * 1.5, x - r, y);
      ctx.fill();
      ctx.fillStyle = gold;
      ctx.fillRect(x - 1, y - r * 1.7 - 12, 2, 12);
      ctx.fillRect(x - 4, y - r * 1.7 - 9, 8, 2);
    }
    ctx.fillStyle = '#6d6352';
    for (let i = 0; i < 6; i++) {
      const x = -100 + i * 38;
      ctx.beginPath();
      ctx.moveTo(x, -8);
      ctx.lineTo(x, -36);
      ctx.arc(x + 7, -36, 7, Math.PI, 0);
      ctx.lineTo(x + 14, -8);
      ctx.fill();
    }
  },
  chimneys(ctx, t) {
    const cols = ['#e3c39a', '#d6b088', '#ecd2ab', '#cfa47a'];
    const list = [
      [-170, 110, 34],
      [-110, 160, 40],
      [-50, 120, 30],
      [10, 190, 44],
      [80, 130, 34],
      [140, 170, 38],
      [200, 100, 30],
    ];
    list.forEach(([x, h, w], i) => {
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.moveTo(x - w, 4);
      ctx.quadraticCurveTo(x - w * 0.45, -h * 0.5, x - w * 0.25, -h);
      ctx.lineTo(x + w * 0.25, -h);
      ctx.quadraticCurveTo(x + w * 0.45, -h * 0.5, x + w, 4);
      ctx.fill();
      ctx.fillStyle = '#8d6a4f';
      ctx.beginPath();
      ctx.ellipse(x, -h - 6, w * 0.42, 9, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#5c4535';
      if (i % 2 === 0) {
        ctx.fillRect(x - 5, -h * 0.45, 9, 12);
        ctx.fillRect(x - 3, -h * 0.7, 6, 7);
      }
    });
  },
  palace(ctx) {
    const c = '#efe7d9';
    ctx.fillStyle = c;
    ctx.fillRect(-200, -70, 400, 70);
    ctx.fillRect(-150, -110, 300, 42);
    ctx.fillRect(-80, -150, 160, 42);
    ctx.fillRect(-30, -190, 60, 42);
    ctx.fillStyle = shade(c, -0.1);
    ctx.fillRect(-200, -74, 400, 6);
    ctx.fillRect(-150, -114, 300, 6);
    ctx.fillRect(-80, -154, 160, 6);
    ctx.fillStyle = '#7f8794';
    windowsGrid(ctx, -192, -60, 20, 2, 19.6, 26, 9, 14);
    windowsGrid(ctx, -142, -102, 15, 1, 19.6, 0, 9, 16);
    windowsGrid(ctx, -72, -142, 8, 1, 19.6, 0, 9, 16);
    windowsGrid(ctx, -22, -182, 3, 1, 19, 0, 8, 16);
  },
  arch(ctx) {
    const c = '#e6dccb';
    ctx.fillStyle = c;
    ctx.fillRect(-70, -150, 140, 150);
    ctx.fillStyle = shade(c, -0.12);
    ctx.fillRect(-76, -160, 152, 14);
    ctx.fillRect(-60, -180, 120, 20);
    ctx.fillStyle = '#556';
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(-28, -80);
    ctx.arc(0, -80, 28, Math.PI, 0);
    ctx.lineTo(28, 0);
    ctx.fill();
    ctx.fillStyle = shade(c, -0.08);
    for (const x of [-60, 46]) ctx.fillRect(x, -140, 14, 140);
  },
  castle(ctx, t, th) {
    ctx.fillStyle = shade(th.far, -0.15);
    poly(ctx, [-160, 10, -110, -60, -40, -84, 60, -80, 120, -50, 170, 10]);
    ctx.fill();
    ctx.translate(0, -78);
    const w = '#f2ece0';
    const roof = '#b5482c';
    const tower = (x, y, tw, h, rh) => {
      ctx.fillStyle = w;
      ctx.fillRect(x - tw / 2, y - h, tw, h);
      ctx.fillStyle = roof;
      poly(ctx, [x - tw / 2 - 4, y - h, x, y - h - rh, x + tw / 2 + 4, y - h]);
      ctx.fill();
      ctx.fillStyle = '#5a4a40';
      ctx.fillRect(x - 3, y - h + 12, 6, 10);
    };
    ctx.fillStyle = w;
    ctx.fillRect(-70, -60, 140, 60);
    ctx.fillStyle = roof;
    poly(ctx, [-76, -60, -50, -84, 50, -84, 76, -60]);
    ctx.fill();
    tower(-74, 0, 30, 96, 44);
    tower(70, 0, 34, 110, 52);
    tower(0, -60, 26, 46, 40);
    ctx.fillStyle = '#5a4a40';
    windowsGrid(ctx, -50, -46, 5, 1, 22, 0, 7, 12);
  },
  church(ctx, t, th) {
    // απλή εκκλησία με καμπαναριό
    const c = '#f1ebdc';
    const roof = '#9c3b2e';
    ctx.fillStyle = c;
    ctx.fillRect(-60, -56, 120, 56);
    ctx.fillStyle = roof;
    poly(ctx, [-68, -56, 0, -98, 68, -56]);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.fillRect(56, -150, 32, 150);
    ctx.fillStyle = '#4f5d6b';
    poly(ctx, [52, -150, 72, -205, 92, -150]);
    ctx.fill();
    ctx.fillStyle = '#c9a646';
    ctx.fillRect(71, -222, 2, 18);
    ctx.fillRect(66, -216, 12, 2);
    ctx.fillStyle = '#4a4036';
    ctx.fillRect(66, -130, 12, 20);
    ctx.fillRect(-10, -34, 20, 34);
    for (const x of [-44, 28]) ctx.fillRect(x, -40, 10, 16);
  },
  stMark(ctx) {
    const c = '#f1ebdc';
    ctx.fillStyle = c;
    ctx.fillRect(-70, -60, 140, 60);
    // πολύχρωμη στέγη με «καρό»
    ctx.save();
    poly(ctx, [-78, -60, -40, -120, 40, -120, 78, -60]);
    ctx.clip();
    for (let i = 0; i < 18; i++)
      for (let j = 0; j < 8; j++) {
        ctx.fillStyle = (i + j) % 2 ? '#c8352f' : '#f3f0ea';
        if (i > 3 && i < 8 && j > 1 && j < 6) ctx.fillStyle = (i + j) % 2 ? '#2e4f9c' : '#f3f0ea';
        if (i > 10 && i < 15 && j > 1 && j < 6) ctx.fillStyle = (i + j) % 2 ? '#c8352f' : '#2e4f9c';
        ctx.fillRect(-80 + i * 9, -122 + j * 8, 9, 8);
      }
    ctx.restore();
    ctx.fillStyle = c;
    ctx.fillRect(64, -150, 30, 150);
    ctx.fillStyle = '#5c6b5d';
    poly(ctx, [60, -150, 79, -196, 98, -150]);
    ctx.fill();
    ctx.fillStyle = '#4a4036';
    ctx.fillRect(74, -130, 10, 18);
    ctx.fillRect(-10, -36, 20, 36);
  },
  gothic(ctx) {
    const c = '#cf9f7f';
    ctx.fillStyle = c;
    ctx.fillRect(-90, -110, 180, 110);
    poly(ctx, [-90, -110, 0, -150, 90, -110]);
    ctx.fill();
    for (const x of [-72, 72]) {
      ctx.fillStyle = c;
      ctx.fillRect(x - 20, -210, 40, 210);
      ctx.fillStyle = '#5b6a6a';
      poly(ctx, [x - 22, -210, x, -290, x + 22, -210]);
      ctx.fill();
      ctx.fillStyle = '#4a3b33';
      ctx.fillRect(x - 5, -190, 10, 22);
      ctx.fillRect(x - 5, -140, 10, 22);
    }
    ctx.fillStyle = '#4a3b33';
    ctx.beginPath();
    ctx.arc(0, -92, 18, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#e0c07a';
    ctx.beginPath();
    ctx.arc(0, -92, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#4a3b33';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-16, -40);
    ctx.lineTo(0, -60);
    ctx.lineTo(16, -40);
    ctx.lineTo(16, 0);
    ctx.fill();
  },
  parliament(ctx) {
    const c = '#efe4d0';
    const roof = '#a9443b';
    ctx.fillStyle = c;
    ctx.fillRect(-240, -70, 480, 70);
    ctx.fillStyle = roof;
    ctx.fillRect(-240, -84, 480, 14);
    for (let i = 0; i < 13; i++) {
      const x = -232 + i * 38.6;
      ctx.fillStyle = c;
      ctx.fillRect(x, -100, 10, 30);
      ctx.fillStyle = roof;
      poly(ctx, [x - 2, -100, x + 5, -124, x + 12, -100]);
      ctx.fill();
    }
    ctx.fillStyle = c;
    ctx.fillRect(-50, -130, 100, 60);
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.ellipse(0, -130, 52, 60, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = c;
    poly(ctx, [-6, -186, 0, -236, 6, -186]);
    ctx.fill();
    ctx.fillStyle = '#7d7a73';
    windowsGrid(ctx, -230, -58, 24, 2, 19.5, 24, 8, 14);
  },
  eiffel(ctx) {
    const c = '#6b5a4a';
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-70, 0);
    ctx.quadraticCurveTo(-30, -60, -12, -170);
    ctx.lineTo(-4, -260);
    ctx.lineTo(4, -260);
    ctx.lineTo(12, -170);
    ctx.quadraticCurveTo(30, -60, 70, 0);
    ctx.lineTo(42, 0);
    ctx.quadraticCurveTo(0, -60, -42, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-46, -66, 92, 8);
    ctx.fillRect(-24, -150, 48, 6);
    ctx.fillRect(-1.5, -285, 3, 26);
  },
  bigben(ctx) {
    const c = '#c9a86a';
    ctx.fillStyle = c;
    ctx.fillRect(-20, -220, 40, 220);
    ctx.fillStyle = shade(c, -0.15);
    ctx.fillRect(10, -220, 10, 220);
    ctx.fillStyle = '#3d4a4f';
    poly(ctx, [-24, -220, 0, -290, 24, -220]);
    ctx.fill();
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath();
    ctx.arc(0, -190, 15, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -190);
    ctx.lineTo(0, -201);
    ctx.moveTo(0, -190);
    ctx.lineTo(8, -190);
    ctx.stroke();
    ctx.fillStyle = shade(c, -0.05);
    ctx.fillRect(20, -70, 180, 70);
    ctx.fillStyle = '#3d4a4f';
    for (let i = 0; i < 9; i++) poly(ctx, [24 + i * 20, -70, 30 + i * 20, -86, 36 + i * 20, -70]), ctx.fill();
  },
  colosseum(ctx) {
    const c = '#d7b98e';
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-170, 0);
    ctx.lineTo(-170, -110);
    ctx.quadraticCurveTo(0, -140, 150, -120);
    ctx.lineTo(150, -60);
    ctx.lineTo(120, -40);
    ctx.lineTo(120, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a5f45';
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 9; i++) {
        const x = -158 + i * 30;
        const y = -14 - r * 34;
        if (x > 110 && r > 0) continue;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 16);
        ctx.arc(x + 8, y - 16, 8, Math.PI, 0);
        ctx.lineTo(x + 16, y);
        ctx.fill();
      }
  },
  gate(ctx) {
    const c = '#e2d6bd';
    ctx.fillStyle = c;
    ctx.fillRect(-120, -26, 240, 26);
    for (let i = 0; i < 6; i++) ctx.fillRect(-112 + i * 42, -120, 16, 96);
    ctx.fillRect(-126, -146, 252, 28);
    ctx.fillRect(-60, -164, 120, 20);
    ctx.fillStyle = '#4b6b55';
    ctx.fillRect(-22, -196, 44, 32);
    ctx.fillRect(-34, -204, 68, 10);
  },
  dutchMill(ctx, t) {
    ctx.fillStyle = '#7b5a43';
    poly(ctx, [-30, 0, -20, -110, 20, -110, 30, 0]);
    ctx.fill();
    ctx.fillStyle = '#4e3a2c';
    poly(ctx, [-24, -108, 0, -136, 24, -108]);
    ctx.fill();
    ctx.save();
    ctx.translate(0, -112);
    ctx.rotate(t * 0.8);
    ctx.fillStyle = 'rgba(245,240,230,0.95)';
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(3, -90, 16, 80);
      ctx.strokeRect(3, -90, 16, 80);
    }
    ctx.restore();
    ctx.fillStyle = '#f4d35e';
    for (let i = 0; i < 9; i++) ctx.fillRect(-150 + i * 34, -4, 22, 6);
  },
};

// ---------- δέντρα ----------
const TREES = {
  olive(ctx) {
    ctx.fillStyle = '#6d5540';
    ctx.fillRect(-3, -22, 6, 22);
    ctx.fillStyle = '#7f9160';
    for (const [x, y, r] of [
      [-10, -28, 12],
      [8, -30, 13],
      [0, -40, 12],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
  },
  cypress(ctx) {
    ctx.fillStyle = '#2f5a3d';
    ctx.beginPath();
    ctx.moveTo(0, -88);
    ctx.quadraticCurveTo(14, -40, 7, 0);
    ctx.lineTo(-7, 0);
    ctx.quadraticCurveTo(-14, -40, 0, -88);
    ctx.fill();
  },
  pine(ctx) {
    ctx.fillStyle = '#5b4535';
    ctx.fillRect(-3, -14, 6, 14);
    ctx.fillStyle = '#2f6b48';
    for (let i = 0; i < 3; i++) {
      const y = -12 - i * 16;
      const w = 22 - i * 5;
      poly(ctx, [-w, y, 0, y - 26, w, y]);
      ctx.fill();
    }
  },
  palm(ctx) {
    ctx.strokeStyle = '#8a6a48';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -40, 2, -76);
    ctx.stroke();
    ctx.strokeStyle = '#3f8a47';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.55;
      ctx.beginPath();
      ctx.moveTo(2, -76);
      ctx.quadraticCurveTo(2 + Math.cos(a) * 22, -76 + Math.sin(a) * 22 - 8, 2 + Math.cos(a) * 34, -76 + Math.sin(a) * 30 + 10);
      ctx.stroke();
    }
  },
  birch(ctx) {
    ctx.fillStyle = '#f0eee8';
    ctx.fillRect(-2.5, -40, 5, 40);
    ctx.fillStyle = '#333';
    ctx.fillRect(-2.5, -30, 3, 2);
    ctx.fillRect(-0.5, -16, 3, 2);
    ctx.fillStyle = '#86b05a';
    ctx.beginPath();
    ctx.ellipse(0, -52, 15, 22, 0, 0, TAU);
    ctx.fill();
  },
};

// ---------- εμπόδια (σε συντεταγμένες κόσμου) ----------
function drawObstacle(ctx, o, th, t) {
  const pts = o.poly;
  // ανάχωμα
  if (o.moundL) {
    ctx.fillStyle = th.ground;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y + 2);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y + 2);
    ctx.fill();
    ctx.strokeStyle = th.top;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 3; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.moveTo(pts[pts.length - 3].x, pts[pts.length - 3].y);
    for (let i = pts.length - 2; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }
  const x = o.x;
  const y = o.y;
  switch (o.type) {
    case 'column': {
      const r = o.r;
      const cy = y - r;
      ctx.fillStyle = MARBLE;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * TAU;
        const rr = r + (i % 2 ? -1.4 : 0.6);
        ctx.lineTo(x + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.fill();
      ctx.strokeStyle = shade(MARBLE, -0.25);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = shade(MARBLE, -0.1);
      ctx.beginPath();
      ctx.arc(x, cy, r * 0.55, 0, TAU);
      ctx.fill();
      break;
    }
    case 'barrel': {
      const r = o.r;
      const cy = y - r;
      ctx.fillStyle = '#9a6233';
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#4a3a2c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, cy, r - 1, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, cy, r * 0.55, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#c28650';
      ctx.beginPath();
      ctx.arc(x, cy, r * 0.5, 0, TAU);
      ctx.fill();
      break;
    }
    case 'log': {
      const r = o.r;
      const cy = y - r;
      ctx.fillStyle = '#6b4a2f';
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#d9b27c';
      ctx.beginPath();
      ctx.arc(x, cy, r - 2.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#a77d4c';
      ctx.lineWidth = 1;
      for (const k of [0.25, 0.5, 0.75]) {
        ctx.beginPath();
        ctx.arc(x, cy, (r - 2.5) * k, 0, TAU);
        ctx.stroke();
      }
      break;
    }
    case 'hay': {
      const r = o.r;
      const cy = y - r;
      ctx.fillStyle = '#e1bc5a';
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#b48d34';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let a = 0; a < TAU * 3; a += 0.2) {
        const rr = (a / (TAU * 3)) * (r - 2);
        ctx.lineTo(x + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.stroke();
      break;
    }
    case 'block': {
      const left = x - o.w / 2;
      if (o.material === 'stone') {
        // πέτρινος όγκος από λαξευτές πέτρες
        const STONE = '#a8a39a';
        ctx.fillStyle = STONE;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y + 2);
        for (const p of pts) ctx.lineTo(p.x, p.y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y + 2);
        ctx.fill();
        ctx.strokeStyle = shade(STONE, -0.3);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1.5;
        const rows = Math.max(2, Math.round(o.h / 16));
        for (let r = 1; r < rows; r++) {
          const ry = y - (o.h * r) / rows;
          ctx.beginPath();
          ctx.moveTo(left + 2, ry);
          ctx.lineTo(x + o.w / 2 - 4, ry);
          ctx.stroke();
        }
        for (let r = 0; r < rows; r++) {
          const y0 = y - (o.h * r) / rows;
          const y1 = y - (o.h * (r + 1)) / rows;
          for (let gx = left + (r % 2 ? 18 : 34); gx < x + o.w / 2 - 10; gx += 32) {
            ctx.beginPath();
            ctx.moveTo(gx, y0);
            ctx.lineTo(gx, y1);
            ctx.stroke();
          }
        }
        break;
      }
      // μεγάλος μαρμάρινος όγκος με ράβδωση κίονα
      ctx.fillStyle = MARBLE;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y + 2);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y + 2);
      ctx.fill();
      ctx.strokeStyle = shade(MARBLE, -0.28);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = shade(MARBLE, -0.14);
      ctx.lineWidth = 1.5;
      for (let gx = left + 14; gx < x + o.w / 2 - 8; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, y - o.h + 6);
        ctx.lineTo(gx, y - 2);
        ctx.stroke();
      }
      ctx.fillStyle = shade(MARBLE, 0.12);
      ctx.fillRect(left + 4, y - o.h, o.w - 10, 5);
      break;
    }
    case 'amphora': {
      const cy = y - o.ry;
      ctx.save();
      ctx.translate(x, cy);
      if (o.k && o.k !== 1) ctx.scale(o.k, o.k);
      ctx.fillStyle = '#c46a3a';
      ctx.beginPath();
      ctx.ellipse(-2, 0, 18, 10, 0, 0, TAU);
      ctx.fill();
      poly(ctx, [-20, -4, -30, 0, -20, 4]);
      ctx.fill();
      ctx.fillRect(14, -4, 10, 8);
      ctx.fillRect(22, -6, 3, 12);
      ctx.strokeStyle = '#c46a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(14, -7, 4, Math.PI, 0);
      ctx.arc(14, 7, 4, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#2a1d16';
      ctx.fillRect(-12, -3, 20, 6);
      ctx.fillStyle = '#c46a3a';
      for (let i = 0; i < 4; i++) ctx.fillRect(-10 + i * 5, -1, 2, 2);
      ctx.restore();
      break;
    }
    case 'rock': {
      ctx.fillStyle = '#8c8a86';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y + 2);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y + 2);
      ctx.fill();
      ctx.fillStyle = '#a9a6a0';
      poly(ctx, [pts[1].x, pts[1].y, pts[2].x, pts[2].y, pts[2].x - 4, pts[2].y + 8, pts[1].x + 6, pts[1].y + 6]);
      ctx.fill();
      break;
    }
    case 'crate': {
      const s = o.s;
      ctx.strokeStyle = '#8a6440';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.moveTo(pts[2].x, pts[2].y);
      ctx.lineTo(pts[3].x, pts[3].y);
      ctx.stroke();
      ctx.fillStyle = '#c08a4e';
      ctx.fillRect(x - s / 2, y - s, s, s);
      ctx.strokeStyle = '#7a5530';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - s / 2 + 1, y - s + 1, s - 2, s - 2);
      ctx.beginPath();
      ctx.moveTo(x - s / 2 + 2, y - s + 2);
      ctx.lineTo(x + s / 2 - 2, y - 2);
      ctx.moveTo(x + s / 2 - 2, y - s + 2);
      ctx.lineTo(x - s / 2 + 2, y - 2);
      ctx.stroke();
      break;
    }
  }
}

// ---------- μηχανή ----------
function drawBike(ctx, bike, look) {
  const [R, F] = bike.p;
  const mx = (R.x + F.x) / 2;
  const my = (R.y + F.y) / 2;
  const a = bike.angle;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(a);
  const half = CFG.wheelBase / 2;
  const L = look.lean || 0;
  const body = look.bikeColor || '#f25c05';

  // εξάτμιση, ψαλίδι
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#8b8f96';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-30, -12);
  ctx.stroke();
  ctx.strokeStyle = '#3b3f46';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-half, 0);
  ctx.lineTo(-4, -12);
  ctx.stroke();
  // πιρούνι
  ctx.strokeStyle = '#c9ccd1';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(17, -32);
  ctx.stroke();

  // τροχοί
  for (let i = 0; i < 2; i++) {
    const wx = i ? half : -half;
    ctx.save();
    ctx.translate(wx, 0);
    ctx.rotate(bike.wheelAngle[i]);
    ctx.strokeStyle = '#1b1c1f';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, CFG.wheelR - 2.2, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = '#a7adb5';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, CFG.wheelR - 5, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const s = (k / 6) * TAU;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(s) * (CFG.wheelR - 5), Math.sin(s) * (CFG.wheelR - 5));
    }
    ctx.stroke();
    ctx.fillStyle = '#555a61';
    ctx.beginPath();
    ctx.arc(0, 0, 2.8, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // φτερά
  ctx.strokeStyle = body;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(half, 0, CFG.wheelR + 2.5, -2.5, -1.0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-half - 8, -12);
  ctx.lineTo(-half + 8, -20);
  ctx.stroke();

  // κινητήρας & ρεζερβουάρ
  ctx.fillStyle = '#2d3036';
  ctx.fillRect(-12, -16, 18, 12);
  ctx.fillStyle = '#6c7078';
  ctx.fillRect(-9, -13, 4, 7);
  ctx.fillRect(-3, -13, 4, 7);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-12, -20);
  ctx.lineTo(4, -29);
  ctx.lineTo(18, -31);
  ctx.lineTo(16, -20);
  ctx.lineTo(4, -15);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(body, 0.35);
  ctx.beginPath();
  ctx.moveTo(-4, -23);
  ctx.lineTo(6, -27);
  ctx.lineTo(10, -25);
  ctx.lineTo(0, -21);
  ctx.fill();
  // σέλα
  ctx.strokeStyle = '#17181b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-26, -22);
  ctx.lineTo(-8, -23);
  ctx.stroke();
  // τιμόνι
  ctx.strokeStyle = '#2a2c30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(17, -32);
  ctx.lineTo(13, -38);
  ctx.stroke();

  // αναβάτης
  const hip = { x: -14 + L * 3, y: -27 };
  const sh = { x: -2 + L * 9, y: -45 + Math.abs(L) * 3 };
  const head = { x: 3 + L * 10, y: -53 + Math.abs(L) * 3 };
  const hand = { x: 13, y: -37 };
  const knee = { x: 0 + L * 2, y: -20 };
  const foot = { x: -6, y: -8 };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2b3a55';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(knee.x, knee.y);
  ctx.lineTo(foot.x, foot.y);
  ctx.stroke();
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(foot.x - 3, foot.y - 2, 9, 5);
  ctx.strokeStyle = look.jacket || '#1f4e79';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(sh.x, sh.y);
  ctx.stroke();
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(sh.x, sh.y);
  ctx.lineTo((sh.x + hand.x) / 2 + 1, (sh.y + hand.y) / 2 + 4);
  ctx.lineTo(hand.x, hand.y);
  ctx.stroke();
  ctx.fillStyle = look.helmet || '#0d5eaf';
  ctx.beginPath();
  ctx.arc(head.x, head.y, 7.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = shade(look.helmet || '#0d5eaf', 0.45);
  ctx.fillRect(head.x - 6, head.y - 6, 5, 2);
  ctx.fillStyle = '#1d2430';
  ctx.beginPath();
  ctx.moveTo(head.x + 1, head.y - 2);
  ctx.lineTo(head.x + 8, head.y - 1);
  ctx.lineTo(head.x + 7, head.y + 3);
  ctx.lineTo(head.x + 1, head.y + 3);
  ctx.fill();
  ctx.restore();
}

// ---------- Renderer ----------
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cam = { x: 0, y: 0 };
    this.particles = [];
    this.floaters = [];
    this.time = 0;
    this.lean = 0;
    this.shake = 0;
    this.level = null;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.dpr = dpr;
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    // ορατό ύψος κόσμου ~460 μονάδες, πλάτος τουλάχιστον ~430
    this.z = Math.min(this.H / 460, this.W / 430);
  }

  setLevel(level) {
    // level: { track, theme, country, city, look }
    this.level = level;
    level.theme._flag = level.country?.colors?.[0];
    this.particles = [];
    this.floaters = [];
    this.flash = 0;
  }

  snapCamera(bike) {
    const c = bike.center;
    this.cam.x = c.x + 60;
    this.cam.y = c.y - 40;
  }

  get ax() {
    return this.W * 0.36;
  }
  get ay() {
    return this.H * 0.6;
  }

  update(dt, sim, input) {
    this.time += dt;
    const bike = sim.bike;
    const c = bike.center;
    const v = bike.velocity;
    const tx = c.x + Math.max(-60, Math.min(160, v.x * 0.3)) + 40;
    const ty = c.y - 40 + Math.max(-40, Math.min(60, v.y * 0.12));
    const k = 1 - Math.exp(-dt * 4.5);
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * (1 - Math.exp(-dt * 3.5));
    const targetLean = sim.state === 'running' ? (input.gas ? -1 : 0) + (input.brake ? 1 : 0) : 0;
    this.lean += (targetLean - this.lean) * (1 - Math.exp(-dt * 8));
    this.shake = Math.max(0, this.shake - dt * 2);

    // σκόνη από τον πίσω τροχό
    if (sim.state === 'running' && bike.contact[0] && input.gas && Math.random() < 0.5) {
      const r = bike.p[0];
      this.particles.push({
        x: r.x - 10,
        y: r.y + CFG.wheelR - 3,
        vx: -40 - Math.random() * 60,
        vy: -30 - Math.random() * 40,
        life: 0.6,
        max: 0.6,
        size: 3 + Math.random() * 4,
        color: this.level?.theme.surface === 'snow' ? '#ffffff' : shade(this.level?.theme.ground || '#9c7349', 0.3),
        g: 60,
      });
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += (p.g ?? 300) * dt;
      if (p.drag) {
        const k = Math.exp(-p.drag * dt);
        p.vx *= k;
        p.vy *= k;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.grow) p.size += p.grow * dt;
      if (p.vr) p.rot += p.vr * dt;
      // συντρίμμια και τροχοί αναπηδούν στο έδαφος
      if (p.bounce) {
        const gy = sim.world.groundY(p.x) - p.size;
        if (p.y > gy && !sim.world.gapAt(p.x)) {
          p.y = gy;
          p.vy *= -p.bounce;
          p.vx *= 0.75;
          p.vr *= 0.7;
        }
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    this.flash = Math.max(0, (this.flash || 0) - dt * 3);
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 30 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  burst(x, y, color, n = 24, speed = 220, g = 300, emojis = null) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - speed * 0.4,
        life: 0.9 + Math.random() * 0.4,
        max: 1.3,
        size: 3 + Math.random() * 4,
        color,
        g,
        emoji: emojis ? emojis[i % emojis.length] : null,
      });
    }
  }

  floatText(x, y, text, color = '#fff', size = 26) {
    this.floaters.push({ x, y, text, color, size, life: 1.4 });
  }

  /** Κινούμενη έκρηξη (καρτουνίστικη): λάμψη, κύμα, φωτιά, καπνός, συντρίμμια και οι δύο τροχοί. */
  explode(x, y, bike) {
    this.flash = 1;
    this.shake = 1.2;
    const P = this.particles;
    P.push({ kind: 'ring', x, y, vx: 0, vy: 0, g: 0, size: 10, grow: 420, life: 0.45, max: 0.45 });
    const fire = ['#fff3b0', '#ffd23f', '#ff9f1c', '#ff5400', '#e63946'];
    for (let i = 0; i < 34; i++) {
      const a = Math.random() * TAU;
      const sp = 60 + Math.random() * 260;
      P.push({
        kind: 'fire',
        x: x + Math.cos(a) * 6,
        y: y + Math.sin(a) * 6,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        g: -120,
        drag: 3.5,
        size: 7 + Math.random() * 10,
        grow: 26,
        color: fire[Math.floor(Math.random() * fire.length)],
        life: 0.5 + Math.random() * 0.45,
        max: 0.95,
      });
    }
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * TAU;
      const sp = 30 + Math.random() * 90;
      P.push({
        kind: 'smoke',
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        g: -70,
        drag: 1.5,
        size: 10 + Math.random() * 10,
        grow: 34,
        color: Math.random() < 0.5 ? '#4b4b4b' : '#6b6b6b',
        life: 1.1 + Math.random() * 0.6,
        max: 1.7,
      });
    }
    const debrisCol = [this.level?.look?.bikeColor || '#f25c05', '#2d3036', '#8b8f96', this.level?.look?.helmet || '#0d5eaf'];
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const sp = 180 + Math.random() * 260;
      P.push({
        kind: 'debris',
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 700,
        size: 3 + Math.random() * 4,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 30,
        bounce: 0.4,
        color: debrisCol[i % debrisCol.length],
        life: 1.7,
        max: 1.7,
      });
    }
    // οι τροχοί φεύγουν προς τα πάνω και αναπηδούν
    if (bike) {
      bike.p.slice(0, 2).forEach((w, i) => {
        P.push({
          kind: 'wheel',
          x: w.x,
          y: w.y,
          vx: (i ? 1 : -1) * (90 + Math.random() * 80) + bike.velocity.x * 0.3,
          vy: -320 - Math.random() * 120,
          g: 760,
          size: CFG.wheelR,
          rot: bike.wheelAngle[i],
          vr: (i ? 1 : -1) * 18,
          bounce: 0.45,
          life: 1.75,
          max: 1.75,
        });
      });
    }
  }

  drawParticle(p) {
    const { ctx } = this;
    const a = Math.max(0, p.life / p.max);
    switch (p.kind) {
      case 'ring':
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#fff6d5';
        ctx.lineWidth = 6 * a + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.stroke();
        return;
      case 'fire':
      case 'smoke': {
        ctx.globalAlpha = p.kind === 'fire' ? Math.min(1, a * 1.6) : a * 0.55;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
        return;
      }
      case 'debris':
        ctx.globalAlpha = Math.min(1, a * 2);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
        ctx.restore();
        return;
      case 'wheel': {
        ctx.globalAlpha = Math.min(1, a * 2.5);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.strokeStyle = '#1b1c1f';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.size - 2.2, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = '#a7adb5';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const s = (k / 6) * TAU;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(s) * (p.size - 5), Math.sin(s) * (p.size - 5));
        }
        ctx.stroke();
        ctx.restore();
        return;
      }
    }
    ctx.globalAlpha = Math.min(1, a * 1.5);
    if (p.emoji) {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.emoji, p.x, p.y);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
  }

  // ---- βοηθητικά μετασχηματισμού για parallax ----
  lx(u, f) {
    return (u - this.cam.x * f) * this.z + this.ax;
  }
  ly(v, f) {
    return (v - this.cam.y * f) * this.z + this.ay;
  }

  draw(sim) {
    const { ctx, W, H } = this;
    const L = this.level;
    if (!L) return;
    const th = L.theme;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.drawSky(th);
    this.drawFar(th);
    if (th.water === 'sea' || th.water === 'lake') this.drawSea(th);
    this.drawLandmarks(th);
    this.drawMid(th);

    // κόσμος
    ctx.save();
    const sh = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 10 : 0;
    ctx.translate(this.ax + sh, this.ay + sh);
    ctx.scale(this.z, this.z);
    ctx.translate(-this.cam.x, -this.cam.y);
    const x0 = this.cam.x - this.ax / this.z - 80;
    const x1 = this.cam.x + (W - this.ax) / this.z + 80;
    const yBottom = this.cam.y + (H - this.ay) / this.z + 40;

    this.drawStartSign(L);
    this.drawJumpSigns(sim, L, x0, x1);
    this.drawGround(L.track, th, x0, x1, yBottom);
    for (const o of L.track.obstacles) {
      if (o.x > x0 - 60 && o.x < x1 + 60) drawObstacle(ctx, o, th, this.time);
    }
    this.drawSavepoints(sim, L, x0, x1);
    this.drawCheckpoints(sim, L, x0, x1);
    this.drawFinish(sim, L);
    // μετά από έκρηξη η μηχανή «εξαφανίζεται» μέχρι να ξαναβγεί στο checkpoint
    const exploded = sim && sim.state === 'crashed' && sim.crashReason !== 'water';
    if (sim && !exploded) drawBike(ctx, sim.bike, { ...L.look, lean: this.lean });

    for (const p of this.particles) this.drawParticle(p);
    ctx.globalAlpha = 1;
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.font = `900 ${f.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 236, 190, ${this.flash * 0.55})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawSky(th) {
    const { ctx, W, H } = this;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.sky[0]);
    g.addColorStop(1, th.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // ήλιος
    const sx = W * 0.8;
    const sy = H * 0.17;
    const sr = 26 * this.z + 8;
    const glow = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 3);
    glow.addColorStop(0, 'rgba(255,245,200,0.65)');
    glow.addColorStop(1, 'rgba(255,245,200,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - sr * 3, sy - sr * 3, sr * 6, sr * 6);
    ctx.fillStyle = '#fff6cf';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
    // σύννεφα
    const f = 0.06;
    const P = 520;
    const u0 = this.cam.x * f - this.ax / this.z - 200;
    const u1 = this.cam.x * f + (W - this.ax) / this.z + 200;
    for (let k = Math.floor(u0 / P); k <= Math.ceil(u1 / P); k++) {
      const u = k * P + hash1(k) * 300 + this.time * 6;
      const v = -130 - hash1(k + 9) * 170;
      const x = this.lx(u, f);
      const y = this.ly(v, 0.03);
      const s = this.z * (0.7 + hash1(k + 3) * 0.6);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.ellipse(x, y, 50 * s, 16 * s, 0, 0, TAU);
      ctx.ellipse(x - 26 * s, y + 4 * s, 26 * s, 12 * s, 0, 0, TAU);
      ctx.ellipse(x + 22 * s, y - 8 * s, 30 * s, 16 * s, 0, 0, TAU);
      ctx.fill();
    }
    if (th.balloons) {
      const fb = 0.1;
      const PB = 260;
      const b0 = this.cam.x * fb - this.ax / this.z - 100;
      const b1 = this.cam.x * fb + (W - this.ax) / this.z + 100;
      const cols = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#8e44ad', '#457b9d'];
      for (let k = Math.floor(b0 / PB); k <= Math.ceil(b1 / PB); k++) {
        const u = k * PB + hash1(k * 3) * 160;
        const v = -150 - hash1(k + 1) * 220 + Math.sin(this.time * 0.6 + k) * 8;
        const x = this.lx(u, fb);
        const y = this.ly(v, 0.05);
        const s = this.z * (0.5 + hash1(k + 7) * 0.5);
        const c1 = cols[k & 3 ? (k * 7) % cols.length : 0] || cols[0];
        const c2 = cols[(Math.abs(k) * 5 + 2) % cols.length];
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(s, s);
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(0, 0, 22, Math.PI * 0.85, Math.PI * 2.15);
        ctx.lineTo(0, 34);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.ellipse(0, 2, 8, 24, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#5b4636';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, 30);
        ctx.lineTo(-5, 40);
        ctx.moveTo(6, 30);
        ctx.lineTo(5, 40);
        ctx.stroke();
        ctx.fillStyle = '#8a6440';
        ctx.fillRect(-6, 40, 12, 8);
        ctx.restore();
      }
    }
  }

  ridge(f, baseV, amp, freq, color, seed, opts = {}) {
    const { ctx, W, H } = this;
    const pts = [];
    const step = 6;
    for (let sx = -step; sx <= W + step; sx += step) {
      const u = (sx - this.ax) / this.z + this.cam.x * f;
      let n = fbm(u * freq + seed);
      if (opts.islands) n = Math.max(0, n - 0.48) * 2.2;
      const v = baseV - n * amp;
      pts.push(sx, this.ly(v, f));
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-step, H);
    for (let i = 0; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.lineTo(W + step, H);
    ctx.closePath();
    ctx.fill();
    if (opts.snow) {
      ctx.save();
      ctx.clip();
      const snowLine = this.ly(baseV - amp * 0.62, f);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillRect(0, 0, W, snowLine);
      ctx.restore();
    }
    return pts;
  }

  drawFar(th) {
    const water = th.water === 'sea' || th.water === 'lake';
    const haze = mix(th.far, th.sky[1], 0.35);
    if (water) {
      this.ridge(0.08, 0, 150 * th.hills, 0.0022, haze, 11, { islands: true });
    } else {
      this.ridge(0.08, 40, 230 * Math.min(1.3, th.hills), 0.0018, haze, 11, { snow: th.snow });
      this.ridge(0.14, 60, 170 * Math.min(1.3, th.hills), 0.0026, th.far, 37, { snow: th.snow });
    }
  }

  drawSea(th) {
    const { ctx, W, H } = this;
    const hy = this.ly(0, 0.08);
    const g = ctx.createLinearGradient(0, hy, 0, H);
    g.addColorStop(0, mix(th.waterColor, th.sky[1], 0.35));
    g.addColorStop(1, shade(th.waterColor, -0.15));
    ctx.fillStyle = g;
    ctx.fillRect(0, hy, W, H - hy);
    // γραμμές κυμάτων
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const y = hy + 6 + i * i * 4 * this.z;
      if (y > H) break;
      const off = (this.time * (10 + i * 4) - this.cam.x * (0.08 + i * 0.03) * this.z) % 120;
      ctx.beginPath();
      for (let x = -120 + off; x < W; x += 120) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 30 + i * 4, y);
      }
      ctx.stroke();
    }
    // ιστιοφόρα
    if (th.water === 'sea') {
      const f = 0.12;
      const P = 900;
      const u0 = this.cam.x * f - this.ax / this.z - 100;
      const u1 = this.cam.x * f + (W - this.ax) / this.z + 100;
      for (let k = Math.floor(u0 / P); k <= Math.ceil(u1 / P); k++) {
        const u = k * P + hash1(k + 40) * 500 + this.time * 8;
        const x = this.lx(u, f);
        const y = hy + 10 * this.z;
        const s = this.z * 0.8;
        ctx.save();
        ctx.translate(x, y + Math.sin(this.time * 2 + k) * 1.5);
        ctx.scale(s, s);
        ctx.fillStyle = '#5a4636';
        poly(ctx, [-18, -4, 18, -4, 12, 4, -12, 4]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        poly(ctx, [0, -6, 0, -40, 16, -6]);
        ctx.fill();
        ctx.fillStyle = '#f0f0f0';
        poly(ctx, [-2, -6, -2, -32, -14, -6]);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  drawLandmarks(th) {
    const list = th.landmarks;
    if (!list || !list.length) return;
    const { ctx, W } = this;
    const f = 0.3;
    const P = 1150;
    const u0 = this.cam.x * f - this.ax / this.z - 400;
    const u1 = this.cam.x * f + (W - this.ax) / this.z + 400;
    const water = th.water === 'sea' || th.water === 'lake';
    for (let k = Math.floor(u0 / P); k <= Math.ceil(u1 / P); k++) {
      const name = list[((k % list.length) + list.length) % list.length];
      const draw = LANDMARKS[name];
      if (!draw) continue;
      const u = k * P + 300;
      const v = water ? 40 : 70;
      const x = this.lx(u, f);
      const y = this.ly(v, f);
      const s = this.z * 0.85;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      if (water) {
        ctx.fillStyle = shade(th.mid, -0.1);
        ctx.beginPath();
        ctx.ellipse(0, 8, 260, 24, 0, Math.PI, 0);
        ctx.fill();
      }
      draw(ctx, this.time, th);
      ctx.restore();
    }
  }

  drawMid(th) {
    const { ctx, W } = this;
    const water = th.water === 'sea' || th.water === 'lake';
    const f = 0.5;
    const baseV = water ? 150 : 110;
    const amp = (water ? 55 : 100) * th.hills;
    const freq = 0.0042;
    const color = mix(th.mid, th.sky[1], 0.12);
    this.ridge(f, baseV, amp, freq, color, 71);
    // δέντρα
    const trees = th.deco || [];
    if (!trees.length) return;
    const P = 120;
    const u0 = this.cam.x * f - this.ax / this.z - 60;
    const u1 = this.cam.x * f + (W - this.ax) / this.z + 60;
    for (let k = Math.floor(u0 / P); k <= Math.ceil(u1 / P); k++) {
      const h = hash1(k * 1.7 + 5);
      if (h < 0.35) continue;
      const u = k * P + hash1(k + 2) * 70;
      const v = baseV - fbm(u * freq + 71) * amp + 4;
      const x = this.lx(u, f);
      const y = this.ly(v, f);
      const s = this.z * (0.65 + hash1(k + 11) * 0.35);
      const tree = TREES[trees[Math.floor(hash1(k + 13) * trees.length)]];
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.globalAlpha = 0.92;
      tree(ctx);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  drawGround(track, th, x0, x1, yBottom) {
    const { ctx } = this;
    const pts = track.points;
    let i0 = 0;
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (pts[m].x < x0) lo = m;
      else hi = m;
    }
    i0 = lo;
    let i1 = i0;
    while (i1 < pts.length - 1 && pts[i1].x < x1) i1++;

    // νερό στα κενά (πίσω από το έδαφος)
    for (const g of track.gaps) {
      if (g.x1 < x0 || g.x0 > x1) continue;
      if (g.pit) {
        // γκρεμός: σκοτεινό χάσμα
        const grd = ctx.createLinearGradient(0, g.topY, 0, g.topY + 260);
        grd.addColorStop(0, shade(th.ground, -0.45));
        grd.addColorStop(1, '#120d0a');
        ctx.fillStyle = grd;
        ctx.fillRect(g.x0, g.topY + 6, g.x1 - g.x0, yBottom - g.topY + 10);
        continue;
      }
      const wc = th.waterColor || '#2b8fd8';
      const grd = ctx.createLinearGradient(0, g.waterY, 0, g.waterY + 200);
      grd.addColorStop(0, shade(wc, 0.1));
      grd.addColorStop(1, shade(wc, -0.35));
      ctx.fillStyle = grd;
      ctx.fillRect(g.x0, g.waterY, g.x1 - g.x0, yBottom - g.waterY + 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = g.x0; x <= g.x1; x += 4) {
        const y = g.waterY + Math.sin(x * 0.08 + this.time * 3) * 2;
        if (x === g.x0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const fillGrad = ctx.createLinearGradient(0, track.minY, 0, track.maxY + 400);
    fillGrad.addColorStop(0, th.ground);
    fillGrad.addColorStop(1, shade(th.ground, -0.35));
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.moveTo(pts[i0].x, yBottom + 400);
    for (let i = i0; i <= i1; i++) ctx.lineTo(pts[i].x, Math.min(pts[i].y, yBottom + 400));
    ctx.lineTo(pts[i1].x, yBottom + 400);
    ctx.closePath();
    ctx.fill();

    // επιφάνεια (χορτάρι / δρόμος / άμμος / λιθόστρωτο) – χωρίς τα τοιχώματα των κενών
    const isGapPt = (p) => track.gaps.some((g) => p.x > g.x0 + 0.5 && p.x < g.x1 - 0.5);
    const runs = [];
    let cur = [];
    for (let i = i0; i <= i1; i++) {
      const p = pts[i];
      if (isGapPt(p)) {
        if (cur.length > 1) runs.push(cur);
        cur = [];
      } else cur.push(p);
    }
    if (cur.length > 1) runs.push(cur);
    const strokeRuns = (w, color, dash = null, offset = 0) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'butt';
      ctx.setLineDash(dash || []);
      for (const r of runs) {
        ctx.beginPath();
        r.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y + offset) : ctx.moveTo(p.x, p.y + offset)));
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };
    // στρώσεις χώματος
    strokeRuns(22, 'rgba(0,0,0,0.07)', null, 40);
    strokeRuns(14, 'rgba(255,255,255,0.05)', null, 78);
    const s = th.surface;
    if (s === 'road') {
      strokeRuns(18, shade(th.top, -0.25), null, 6);
      strokeRuns(14, th.top, null, 5);
      strokeRuns(2, 'rgba(255,255,255,0.85)', [22, 18], 5);
    } else if (s === 'cobble') {
      strokeRuns(16, shade(th.top, -0.25), null, 6);
      strokeRuns(12, th.top, null, 5);
      strokeRuns(12, shade(th.top, -0.18), [2, 9], 5);
    } else if (s === 'sand') {
      strokeRuns(14, th.top, null, 5);
      strokeRuns(3, shade(th.top, 0.25), null, 0);
    } else if (s === 'snow') {
      strokeRuns(14, '#ffffff', null, 5);
    } else {
      strokeRuns(14, shade(th.top, -0.2), null, 6);
      strokeRuns(10, th.top, null, 4);
      strokeRuns(4, shade(th.top, 0.25), [3, 7], 0);
    }
  }

  drawStartSign(L) {
    const { ctx } = this;
    const x = 120;
    const y = 0;
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(x - 2, y - 70, 4, 70);
    const name = L.city.name.toLocaleUpperCase('el-GR').replace(/[ΆΈΉΊΌΎΏ]/g, (c) => 'ΑΕΗΙΟΥΩ'['ΆΈΉΊΌΎΏ'.indexOf(c)]);
    ctx.font = 'bold 13px system-ui, sans-serif';
    const w = Math.max(70, ctx.measureText(name).width + 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - w / 2, y - 100, w, 32);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - w / 2 + 3, y - 97, w - 6, 26);
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, y - 84);
    ctx.textBaseline = 'alphabetic';
  }

  /** Πινακίδες ⚠️ πριν από κάθε άλμα: εδώ πρέπει να αφήσεις το γκάζι στον αέρα. */
  drawJumpSigns(sim, L, x0, x1) {
    const { ctx } = this;
    for (const j of L.track.jumps || []) {
      if (j.x < x0 - 60 || j.x > x1 + 60) continue;
      const gy = sim.world.groundY(j.x);
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(j.x - 2, gy - 62, 4, 62);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(j.x, gy - 92);
      ctx.lineTo(j.x + 19, gy - 60);
      ctx.lineTo(j.x - 19, gy - 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1f2937';
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(j.water ? '≈' : j.pit ? '⇡' : '!', j.x, gy - 65);
      if (L.showTips) {
        ctx.font = 'bold 11px system-ui, sans-serif';
        const text = !L.rider
          ? 'Άσε το γκάζι στον αέρα!'
          : j.pit
            ? 'Φουλ γκάζι – γκρεμός!'
            : j.water
              ? 'Φουλ γκάζι – νερό!'
              : 'Ίσιωσε τη μηχανή στον αέρα!';
        const w = ctx.measureText(text).width + 12;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fillRect(j.x - w / 2, gy - 54, w, 18);
        ctx.fillStyle = '#b91c1c';
        ctx.fillText(text, j.x, gy - 41);
      }
    }
  }

  /** Μικρά σημαιάκια επαναφοράς: αν πέσεις, ξαναξεκινάς από εδώ. */
  drawSavepoints(sim, L, x0, x1) {
    const { ctx } = this;
    for (const sp of L.track.savepoints || []) {
      if (sp < x0 - 40 || sp > x1 + 40) continue;
      const gy = sim.world.groundY(sp);
      const passed = sim.savedX >= sp;
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(sp - 1.5, gy - 48, 3, 48);
      ctx.fillStyle = passed ? '#22c55e' : '#ffffff';
      ctx.strokeStyle = passed ? '#15803d' : '#9ca3af';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sp + 1.5, gy - 48);
      ctx.lineTo(sp + 22, gy - 41 + Math.sin(this.time * 6 + sp) * 1.5);
      ctx.lineTo(sp + 1.5, gy - 34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  drawCheckpoints(sim, L, x0, x1) {
    const { ctx } = this;
    const cps = L.track.checkpoints;
    const reached = sim ? sim.reached : -1;
    cps.forEach((cx, i) => {
      if (cx < x0 - 100 || cx > x1 + 100) return;
      const gy = sim.world.groundY(cx);
      const done = i <= reached;
      // κοντάρι + σημαία στα χρώματα της χώρας
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(cx - 2, gy - 96, 4, 96);
      const flagY = done ? gy - 40 : gy - 94;
      const cols = L.country.colors;
      const wave = Math.sin(this.time * 5 + i) * 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx + 2, flagY);
      ctx.quadraticCurveTo(cx + 18, flagY + wave, cx + 36, flagY);
      ctx.lineTo(cx + 36, flagY + 24);
      ctx.quadraticCurveTo(cx + 18, flagY + 24 + wave, cx + 2, flagY + 24);
      ctx.closePath();
      ctx.clip();
      cols.forEach((c, k) => {
        ctx.fillStyle = c;
        ctx.fillRect(cx + 2, flagY + (k * 24) / cols.length, 36, 24 / cols.length + 1);
      });
      ctx.restore();
      // αντικείμενο που περιμένει
      const label = L.checkpointLabels[i];
      if (!done) {
        const by = gy - 130 + Math.sin(this.time * 3 + i) * 5;
        const glow = ctx.createRadialGradient(cx, by, 4, cx, by, 34);
        glow.addColorStop(0, 'rgba(255,255,255,0.95)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, by, 34, 0, TAU);
        ctx.fill();
        ctx.font = '30px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, by);
        ctx.textBaseline = 'alphabetic';
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cx, gy - 110, 11, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 5, gy - 110);
        ctx.lineTo(cx - 1, gy - 105);
        ctx.lineTo(cx + 6, gy - 115);
        ctx.stroke();
      }
    });
  }

  drawFinish(sim, L) {
    const { ctx } = this;
    const fx = L.track.finishX;
    const gy = sim.world.groundY(fx);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(fx - 4, gy - 120, 5, 120);
    ctx.fillRect(fx + 95, gy - 120, 5, 120);
    const sq = 10;
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 3; j++) {
        ctx.fillStyle = (i + j) % 2 ? '#111' : '#fff';
        ctx.fillRect(fx + i * sq, gy - 124 + j * sq, sq, sq);
      }
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ΤΕΡΜΑ', fx + 48, gy - 132);
  }
}
