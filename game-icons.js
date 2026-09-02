/* game-icons.js — the app-icon artwork, split out of app.js.

   These functions used to live in app.js, which meant the 52 icons on the home
   page could not be painted until all 313KB of it had downloaded and parsed —
   about two seconds on a slow connection, with the pre-rendered grid sitting
   there as labelled empty squares the whole time. At 46KB this arrives first,
   and the bootstrap at the bottom paints whatever canvases the HTML already
   ships with.

   app.js still calls drawGameIcon() itself: both files are classic scripts
   sharing one global scope, so nothing had to change on the calling side. It
   redraws after renderHome() replaces the grid, in the same task as the
   innerHTML write, so there is no blank frame in between.

   Keep this loaded BEFORE app.js. */

function shadeColor(hex, amt) {
  return "#" + [1, 3, 5].map(i => {
    const v = Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + amt));
    return v.toString(16).padStart(2, "0");
  }).join("");
}

function drawGameIcon(ctx, id, accent, S) {
  const c = S / 2;
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, accent);
  g.addColorStop(1, shadeColor(accent, -40));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, 0, S, S * 0.45);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawIconShape(ctx, id, c, S);
}

function drawIconShape(ctx, id, c, S) {
  switch (id) {
    case "neon-dodge":
      ctx.fillRect(c - S*0.14, c - S*0.14, S*0.28, S*0.28);
      ctx.fillStyle = "rgba(255,80,80,0.8)";
      ctx.fillRect(c + S*0.17, c - S*0.1, S*0.2, S*0.2);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = S*0.032;
      [-0.1, 0, 0.1].forEach(dy => {
        ctx.beginPath(); ctx.moveTo(c - S*0.4, c + dy*S); ctx.lineTo(c - S*0.18, c + dy*S); ctx.stroke();
      });
      break;

    case "zombie-survival":
      ctx.beginPath(); ctx.arc(c, c - S*0.14, S*0.16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(20,50,30,0.85)"; ctx.lineWidth = S*0.03;
      ctx.beginPath();
      ctx.moveTo(c - S*0.1, c - S*0.2); ctx.lineTo(c - S*0.04, c - S*0.14);
      ctx.moveTo(c - S*0.04, c - S*0.2); ctx.lineTo(c - S*0.1, c - S*0.14);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,50,30,0.85)";
      ctx.beginPath(); ctx.arc(c + S*0.06, c - S*0.16, S*0.03, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(c - S*0.05, c - S*0.05); ctx.lineTo(c + S*0.07, c - S*0.07); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = S*0.09;
      ctx.beginPath(); ctx.moveTo(c, c + S*0.04); ctx.lineTo(c, c + S*0.3); ctx.stroke();
      ctx.lineWidth = S*0.06;
      ctx.beginPath();
      ctx.moveTo(c, c + S*0.1); ctx.lineTo(c + S*0.24, c + S*0.1); ctx.lineTo(c + S*0.24, c + S*0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c, c + S*0.14); ctx.lineTo(c - S*0.22, c + S*0.14); ctx.lineTo(c - S*0.22, c + S*0.24);
      ctx.stroke();
      break;

    case "space-shooter":
      ctx.beginPath();
      ctx.moveTo(c, c - S*0.3);
      ctx.lineTo(c + S*0.18, c + S*0.16);
      ctx.lineTo(c + S*0.09, c + S*0.22);
      ctx.lineTo(c - S*0.09, c + S*0.22);
      ctx.lineTo(c - S*0.18, c + S*0.16);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,210,60,0.85)";
      ctx.beginPath();
      ctx.moveTo(c - S*0.07, c + S*0.22); ctx.lineTo(c + S*0.07, c + S*0.22);
      ctx.lineTo(c, c + S*0.36); ctx.closePath(); ctx.fill();
      break;

    case "ninja-dash":
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = S*0.035;
      [-0.02, 0.1, 0.22].forEach(dy => {
        ctx.beginPath(); ctx.moveTo(c - S*0.42, c + dy*S); ctx.lineTo(c - S*0.2, c + dy*S); ctx.stroke();
      });
      ctx.strokeStyle = "rgba(240,93,94,0.95)"; ctx.lineWidth = S*0.045;
      ctx.beginPath(); ctx.moveTo(c - S*0.06, c - S*0.18); ctx.lineTo(c - S*0.24, c - S*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c - S*0.05, c - S*0.15); ctx.lineTo(c - S*0.26, c - S*0.2); ctx.stroke();
      ctx.fillStyle = "rgba(30,34,44,0.95)";
      ctx.beginPath(); ctx.arc(c + S*0.08, c, S*0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(c - S*0.12, c - S*0.07, S*0.4, S*0.12);
      ctx.fillStyle = "rgba(30,34,44,0.95)";
      ctx.beginPath(); ctx.arc(c, c - S*0.01, S*0.035, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.16, c - S*0.01, S*0.035, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "project-synapse":
      // Kai's head with the energy blade sweeping behind him, plus scroll lines
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = S*0.035;
      [-0.2, -0.06, 0.08].forEach(dy => {
        ctx.beginPath(); ctx.moveTo(c - S*0.44, c + dy*S); ctx.lineTo(c - S*0.28, c + dy*S); ctx.stroke();
      });
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(150,255,247,0.5)"; ctx.lineWidth = S*0.13;
      ctx.beginPath();
      ctx.moveTo(c - S*0.36, c + S*0.28);
      ctx.quadraticCurveTo(c + S*0.08, c + S*0.04, c + S*0.4, c - S*0.32);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.97)"; ctx.lineWidth = S*0.05;
      ctx.beginPath();
      ctx.moveTo(c - S*0.36, c + S*0.28);
      ctx.quadraticCurveTo(c + S*0.08, c + S*0.04, c + S*0.4, c - S*0.32);
      ctx.stroke();
      ctx.lineCap = "butt";
      ctx.fillStyle = "rgba(24,30,42,0.97)";                   // jacket shoulders
      ctx.beginPath();
      ctx.moveTo(c - S*0.3, c + S*0.4);
      ctx.quadraticCurveTo(c - S*0.02, c + S*0.12, c + S*0.26, c + S*0.4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(43,209,196,0.95)";                 // neural interface glow
      ctx.fillRect(c - S*0.05, c + S*0.19, S*0.1, S*0.05);
      ctx.fillStyle = "rgba(238,205,178,0.98)";                // face
      ctx.beginPath(); ctx.arc(c - S*0.01, c - S*0.03, S*0.19, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(20,24,32,0.98)";                   // hair
      ctx.beginPath();
      ctx.arc(c - S*0.01, c - S*0.05, S*0.2, Math.PI * 1.02, Math.PI * 2.05);
      ctx.lineTo(c + S*0.19, c - S*0.02);
      ctx.quadraticCurveTo(c + S*0.06, c - S*0.12, c - S*0.2, c - S*0.02);
      ctx.closePath(); ctx.fill();
      [[-0.21, -0.13], [-0.06, -0.19], [0.09, -0.17]].forEach(([hx, hy]) => {
        ctx.beginPath();
        ctx.moveTo(c + hx*S, c + hy*S);
        ctx.lineTo(c + (hx + 0.07)*S, c + (hy - 0.1)*S);
        ctx.lineTo(c + (hx + 0.14)*S, c + (hy + 0.03)*S);
        ctx.closePath(); ctx.fill();
      });
      ctx.beginPath(); ctx.arc(c - S*0.08, c + S*0.01, S*0.028, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.07, c + S*0.01, S*0.028, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "robot-arena":
      ctx.lineWidth = S*0.065;
      ctx.strokeRect(c - S*0.22, c - S*0.19, S*0.44, S*0.36);
      ctx.beginPath(); ctx.moveTo(c, c - S*0.19); ctx.lineTo(c, c - S*0.34); ctx.stroke();
      ctx.beginPath(); ctx.arc(c, c - S*0.34, S*0.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c - S*0.1, c - S*0.07, S*0.065, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.1, c - S*0.07, S*0.065, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = S*0.05;
      ctx.beginPath(); ctx.moveTo(c - S*0.1, c + S*0.07); ctx.lineTo(c + S*0.1, c + S*0.07); ctx.stroke();
      break;

    case "arrow-dodge":
      ctx.lineWidth = S*0.088;
      ctx.beginPath(); ctx.moveTo(c + S*0.28, c); ctx.lineTo(c - S*0.1, c); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c - S*0.07, c - S*0.16); ctx.lineTo(c - S*0.26, c); ctx.lineTo(c - S*0.07, c + S*0.16);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(c + S*0.22, c - S*0.26, S*0.08, 0, Math.PI * 2); ctx.fill();
      break;

    case "monster-punch":
      ctx.fillStyle = "rgba(115,214,118,0.95)";
      ctx.beginPath();
      ctx.moveTo(c - S*0.26, c - S*0.2); ctx.lineTo(c - S*0.33, c - S*0.36); ctx.lineTo(c - S*0.16, c - S*0.27);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(c + S*0.02, c - S*0.2); ctx.lineTo(c + S*0.09, c - S*0.36); ctx.lineTo(c - S*0.08, c - S*0.27);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(c - S*0.12, c - S*0.1, S*0.19, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(20,50,30,0.85)"; ctx.lineWidth = S*0.028;
      [[-0.19, -0.13], [-0.05, -0.13]].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(c + ex*S - S*0.03, c + ey*S - S*0.03); ctx.lineTo(c + ex*S + S*0.03, c + ey*S + S*0.03);
        ctx.moveTo(c + ex*S + S*0.03, c + ey*S - S*0.03); ctx.lineTo(c + ex*S - S*0.03, c + ey*S + S*0.03);
        ctx.stroke();
      });
      ctx.strokeStyle = "rgba(247,184,75,0.95)"; ctx.lineWidth = S*0.035;
      ctx.beginPath(); ctx.moveTo(c + S*0.06, c + S*0.0); ctx.lineTo(c + S*0.13, c - S*0.09); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c + S*0.11, c + S*0.08); ctx.lineTo(c + S*0.22, c + S*0.04); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.roundRect(c + S*0.02, c + S*0.12, S*0.26, S*0.2, [S*0.08]); ctx.fill();
      ctx.fillRect(c + S*0.24, c + S*0.15, S*0.12, S*0.14);
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "car-smash":
      ctx.lineWidth = S*0.055;
      ctx.strokeRect(c - S*0.28, c - S*0.08, S*0.56, S*0.22);
      ctx.beginPath();
      ctx.moveTo(c - S*0.16, c - S*0.08);
      ctx.lineTo(c - S*0.06, c - S*0.22);
      ctx.lineTo(c + S*0.14, c - S*0.22);
      ctx.lineTo(c + S*0.23, c - S*0.08);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(c - S*0.18, c + S*0.16, S*0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.18, c + S*0.16, S*0.08, 0, Math.PI * 2); ctx.fill();
      break;

    case "laser-escape":
      [[0.22, 1], [0.44, 0.6], [0.66, 1]].forEach(([ry, alpha]) => {
        ctx.globalAlpha = alpha * 0.9;
        ctx.lineWidth = S*0.065;
        ctx.beginPath(); ctx.moveTo(0, S*ry); ctx.lineTo(S*0.68, S*ry); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.lineWidth = S*0.05;
      ctx.beginPath(); ctx.moveTo(S*0.78, S*0.26); ctx.lineTo(S*0.78, S*0.6); ctx.stroke();
      break;

    case "castle-defender":
      [-0.2, -0.04, 0.12, 0.28].forEach(dx =>
        ctx.fillRect(c + dx*S - S*0.13, c - S*0.24, S*0.12, S*0.2));
      ctx.fillRect(c - S*0.3, c - S*0.06, S*0.6, S*0.3);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.arc(c, c + S*0.1, S*0.1, Math.PI, 0); ctx.fill();
      ctx.fillRect(c - S*0.1, c + S*0.1, S*0.2, S*0.16);
      break;

    case "bomb-runner":
      ctx.beginPath(); ctx.arc(c, c + S*0.04, S*0.23, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.arc(c - S*0.06, c - S*0.01, S*0.08, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = S*0.042;
      ctx.beginPath();
      ctx.moveTo(c + S*0.15, c - S*0.17);
      ctx.quadraticCurveTo(c + S*0.28, c - S*0.28, c + S*0.21, c - S*0.36);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,200,60,0.9)";
      ctx.beginPath(); ctx.arc(c + S*0.21, c - S*0.36, S*0.06, 0, Math.PI * 2); ctx.fill();
      break;

    case "meteor-dodge":
      ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = S*0.035;
      ctx.beginPath(); ctx.moveTo(c + S*0.22, c - S*0.14); ctx.lineTo(c + S*0.36, c - S*0.32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c - S*0.18, c - S*0.14); ctx.lineTo(c - S*0.06, c - S*0.3); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(c + S*0.14, c - S*0.02, S*0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.arc(c + S*0.18, c - S*0.06, S*0.04, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.09, c + S*0.03, S*0.03, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath(); ctx.arc(c - S*0.24, c - S*0.04, S*0.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(247,184,75,0.95)";
      ctx.beginPath();
      ctx.moveTo(c - S*0.02, c + S*0.16); ctx.lineTo(c + S*0.1, c + S*0.36); ctx.lineTo(c - S*0.14, c + S*0.36);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "time-stop":
      ctx.lineWidth = S*0.065;
      ctx.beginPath(); ctx.arc(c, c, S*0.28, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(c, c, S*0.04, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = S*0.08;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c, c - S*0.2); ctx.stroke();
      ctx.lineWidth = S*0.055;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + S*0.15, c + S*0.09); ctx.stroke();
      break;

    case "pop-blitz":
      [[-0.18,-0.12,0.11],[0.12,-0.18,0.09],[0.18,0.1,0.1],[-0.05,0.18,0.08],[0.02,0.02,0.14]].forEach(([dx,dy,r]) => {
        ctx.beginPath(); ctx.arc(c + dx*S, c + dy*S, r*S, 0, Math.PI * 2); ctx.fill();
      });
      break;

    case "water-balloon-blitz":
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.ellipse(c, c, S*0.23, S*0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.arc(c - S*0.08, c - S*0.12, S*0.06, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      [-0.22, 0, 0.22].forEach(dx => {
        ctx.beginPath(); ctx.arc(c + dx*S, c + S*0.32, S*0.045, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      break;

    case "memory-grid":
      [[0,0,1],[1,0,0],[0,1,0],[1,1,1]].forEach(([col,row,lit]) => {
        ctx.globalAlpha = lit ? 0.95 : 0.28;
        const p = S*0.03;
        ctx.fillRect(c+(col*2-1)*S*0.16-S*0.13+p, c+(row*2-1)*S*0.16-S*0.13+p, S*0.26-p*2, S*0.26-p*2);
      });
      ctx.globalAlpha = 1;
      break;

    case "lane-rush":
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = S*0.035;
      ctx.setLineDash([S*0.07, S*0.07]);
      [-S*0.13, S*0.13].forEach(x => {
        ctx.beginPath(); ctx.moveTo(c+x, S*0.04); ctx.lineTo(c+x, S*0.96); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.roundRect(c - S*0.08, c + S*0.06, S*0.16, S*0.3, [S*0.05]); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(c - S*0.055, c + S*0.12, S*0.11, S*0.07);
      ctx.fillStyle = "rgba(240,93,94,0.92)";
      ctx.beginPath(); ctx.roundRect(c + S*0.17, c - S*0.36, S*0.16, S*0.28, [S*0.05]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "paint-race":
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.roundRect(c - S*0.3, c - S*0.3, S*0.6, S*0.6, [S*0.05]); ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.roundRect(c - S*0.3, c - S*0.3, S*0.6, S*0.6, [S*0.05]); ctx.clip();
      ctx.fillStyle = "rgba(22,104,232,0.95)";
      ctx.beginPath();
      ctx.moveTo(c - S*0.3, c - S*0.05);
      ctx.quadraticCurveTo(c - S*0.05, c - S*0.2, c + S*0.1, c + S*0.02);
      ctx.quadraticCurveTo(c + S*0.22, c + S*0.2, c + S*0.3, c + S*0.1);
      ctx.lineTo(c + S*0.3, c + S*0.3); ctx.lineTo(c - S*0.3, c + S*0.3);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,63,95,0.9)";
      ctx.beginPath(); ctx.arc(c + S*0.24, c - S*0.22, S*0.12, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      break;

    case "tile-link": {
      const tr = S*0.11;
      [[c-S*0.2, c-S*0.2],[c+S*0.2, c+S*0.2]].forEach(([tx,ty]) => {
        ctx.lineWidth = S*0.055;
        ctx.strokeRect(tx-tr, ty-tr, tr*2, tr*2);
      });
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = S*0.045;
      ctx.beginPath();
      ctx.moveTo(c-S*0.2, c-S*0.2); ctx.lineTo(c-S*0.2, c+S*0.2); ctx.lineTo(c+S*0.2, c+S*0.2);
      ctx.stroke();
      break;
    }

    case "crate-shift": {
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = S*0.025;
      for (let i = 0; i < 3; i++) {
        ctx.strokeRect(c - S*0.33 + i*S*0.22, c - S*0.33, S*0.22, S*0.22);
        ctx.strokeRect(c - S*0.33 + i*S*0.22, c - S*0.11, S*0.22, S*0.22);
        ctx.strokeRect(c - S*0.33 + i*S*0.22, c + S*0.11, S*0.22, S*0.22);
      }
      ctx.fillStyle = "rgba(43,209,196,0.75)";
      ctx.beginPath(); ctx.arc(c + S*0.22, c - S*0.22, S*0.075, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.22, c + S*0.22, S*0.075, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#f7b84b";
      ctx.fillRect(c - S*0.08, c - S*0.3, S*0.2, S*0.2);
      ctx.fillRect(c - S*0.08, c + S*0.14, S*0.2, S*0.2);
      ctx.strokeStyle = "rgba(27,18,5,0.42)";
      ctx.lineWidth = S*0.035;
      ctx.strokeRect(c - S*0.08, c - S*0.3, S*0.2, S*0.2);
      ctx.strokeRect(c - S*0.08, c + S*0.14, S*0.2, S*0.2);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(c - S*0.22, c, S*0.095, 0, Math.PI*2); ctx.fill();
      break;
    }

    case "marble-gate": {
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = S*0.022;
      for (let r = 0; r < 4; r++) {
        for (let cc = 0; cc < 4; cc++) {
          ctx.strokeRect(c - S*0.32 + cc*S*0.16, c - S*0.18 + r*S*0.16, S*0.16, S*0.16);
        }
      }
      ctx.fillStyle = "#f7b84b";
      [[0,0],[1,0],[3,0],[0,1],[2,1],[3,1],[0,2],[1,2],[3,2],[1,3],[2,3]].forEach(([cc,r]) => {
        ctx.fillRect(c - S*0.32 + cc*S*0.16 + S*0.02, c - S*0.18 + r*S*0.16 + S*0.02, S*0.12, S*0.12);
      });
      ctx.strokeStyle = "rgba(77,216,240,0.78)";
      ctx.lineWidth = S*0.04;
      ctx.beginPath();
      ctx.moveTo(c, c - S*0.38);
      ctx.lineTo(c, c - S*0.06);
      ctx.lineTo(c - S*0.16, c + S*0.1);
      ctx.lineTo(c - S*0.16, c + S*0.36);
      ctx.stroke();
      ctx.fillStyle = "#9eefff";
      ctx.beginPath();
      ctx.arc(c, c - S*0.38, S*0.1, 0, Math.PI*2);
      ctx.fill();
      break;
    }

    case "block-stacker": {
      const bs = S*0.2;
      [[0,1],[1,1],[-1,1],[0,0],[1,0]].forEach(([bx,by], i) => {
        ctx.globalAlpha = Math.max(0.35, 1 - i*0.08);
        ctx.fillRect(c+bx*(bs+S*0.02)-bs/2, c+by*(bs+S*0.02)-bs/2-S*0.06, bs-S*0.02, bs-S*0.02);
      });
      ctx.globalAlpha = 1;
      break;
    }

    case "puzzle-trap-scout": {
      ctx.lineWidth = S*0.038;
      ctx.strokeStyle = "rgba(255,255,255,0.38)";
      for (let r=0; r<3; r++) for (let cc=0; cc<3; cc++)
        ctx.strokeRect(c+(cc-1)*S*0.22-S*0.1, c+(r-1)*S*0.22-S*0.1, S*0.2, S*0.2);
      const [fx,fy] = [c+S*0.12, c-S*0.12];
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = S*0.045;
      ctx.beginPath(); ctx.moveTo(fx, fy-S*0.14); ctx.lineTo(fx, fy+S*0.08); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(fx, fy-S*0.14); ctx.lineTo(fx+S*0.15, fy-S*0.05); ctx.lineTo(fx, fy+S*0.02);
      ctx.closePath(); ctx.fill();
      break;
    }

    case "puzzle-sudoku": {
      ctx.lineWidth = S*0.034;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      for (let r=0; r<3; r++) for (let cc=0; cc<3; cc++)
        ctx.strokeRect(c+(cc-1)*S*0.22-S*0.1, c+(r-1)*S*0.22-S*0.1, S*0.2, S*0.2);
      ctx.font = `800 ${S*0.17}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      [["5",0,-1],["3",-1,0],["7",1,1]].forEach(([n,dc,dr]) =>
        ctx.fillText(n, c+dc*S*0.22, c+dr*S*0.22));
      break;
    }

    case "tap-sprint":
      // Speed lines
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = S*0.04;
      [-0.16, -0.04, 0.08].forEach(dy => {
        ctx.beginPath(); ctx.moveTo(c - S*0.4, c + dy*S); ctx.lineTo(c - S*0.14, c + dy*S); ctx.stroke();
      });
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      // Runner head
      ctx.beginPath(); ctx.arc(c + S*0.08, c - S*0.26, S*0.09, 0, Math.PI*2); ctx.fill();
      // Body
      ctx.lineWidth = S*0.07;
      ctx.beginPath(); ctx.moveTo(c + S*0.08, c - S*0.17); ctx.lineTo(c + S*0.08, c + S*0.05); ctx.stroke();
      // Arms
      ctx.lineWidth = S*0.055;
      ctx.beginPath(); ctx.moveTo(c + S*0.08, c - S*0.07); ctx.lineTo(c - S*0.1, c + S*0.04); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c + S*0.08, c - S*0.07); ctx.lineTo(c + S*0.26, c - S*0.01); ctx.stroke();
      // Legs mid-stride
      ctx.lineWidth = S*0.065;
      ctx.beginPath(); ctx.moveTo(c + S*0.08, c + S*0.05); ctx.lineTo(c - S*0.08, c + S*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c + S*0.08, c + S*0.05); ctx.lineTo(c + S*0.28, c + S*0.25); ctx.stroke();
      break;

    case "pendulum-hit":
      // Swing arc (ghosted)
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = S*0.04;
      ctx.beginPath(); ctx.arc(c, c - S*0.3, S*0.4, Math.PI*0.22, Math.PI*0.78); ctx.stroke();
      ctx.globalAlpha = 1;
      // Pivot
      ctx.beginPath(); ctx.arc(c, c - S*0.3, S*0.055, 0, Math.PI*2); ctx.fill();
      // Rod swung to right
      ctx.lineWidth = S*0.045;
      ctx.beginPath(); ctx.moveTo(c, c - S*0.3); ctx.lineTo(c + S*0.24, c + S*0.06); ctx.stroke();
      // Bob
      ctx.beginPath(); ctx.arc(c + S*0.24, c + S*0.06, S*0.11, 0, Math.PI*2); ctx.fill();
      // Target zone
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(c - S*0.34, c + S*0.16, S*0.15, S*0.09);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(c - S*0.3, c + S*0.18, S*0.06, S*0.05);
      break;

    case "window-wash":
      // Window frame
      ctx.lineWidth = S*0.055;
      ctx.strokeRect(c - S*0.27, c - S*0.27, S*0.54, S*0.54);
      // Window cross dividers
      ctx.lineWidth = S*0.035;
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath(); ctx.moveTo(c, c - S*0.27); ctx.lineTo(c, c + S*0.27); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c - S*0.27, c); ctx.lineTo(c + S*0.27, c); ctx.stroke();
      // Clean sweep area (top half lighter)
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(c - S*0.25, c - S*0.25, S*0.5, S*0.23);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      // Squeegee bar
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = S*0.075;
      ctx.beginPath(); ctx.moveTo(c - S*0.3, c - S*0.02); ctx.lineTo(c + S*0.3, c - S*0.02); ctx.stroke();
      // Squeegee handle
      ctx.lineWidth = S*0.045;
      ctx.beginPath(); ctx.moveTo(c + S*0.22, c - S*0.02); ctx.lineTo(c + S*0.22, c + S*0.22); ctx.stroke();
      break;

    case "maze-escape":
      // Outer border
      ctx.lineWidth = S*0.06;
      ctx.strokeRect(c - S*0.3, c - S*0.3, S*0.6, S*0.6);
      // Inner walls
      ctx.lineWidth = S*0.055;
      ctx.beginPath();
      // Horizontal walls
      ctx.moveTo(c - S*0.3, c - S*0.1); ctx.lineTo(c + S*0.12, c - S*0.1);
      ctx.moveTo(c - S*0.12, c + S*0.1); ctx.lineTo(c + S*0.3, c + S*0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c - S*0.12, c - S*0.3); ctx.lineTo(c - S*0.12, c + S*0.1);
      ctx.moveTo(c + S*0.12, c - S*0.1); ctx.lineTo(c + S*0.12, c + S*0.3);
      ctx.stroke();
      // Path dot (player)
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(c - S*0.19, c + S*0.19, S*0.07, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      // Exit arrow
      ctx.lineWidth = S*0.055;
      ctx.beginPath();
      ctx.moveTo(c + S*0.3, c + S*0.19); ctx.lineTo(c + S*0.44, c + S*0.19);
      ctx.moveTo(c + S*0.36, c + S*0.11); ctx.lineTo(c + S*0.44, c + S*0.19); ctx.lineTo(c + S*0.36, c + S*0.27);
      ctx.stroke();
      break;

    case "otter-pop":
      // Ground line
      ctx.lineWidth = S*0.055;
      ctx.beginPath(); ctx.moveTo(c - S*0.36, c + S*0.14); ctx.lineTo(c + S*0.36, c + S*0.14); ctx.stroke();
      // Three holes
      ctx.globalAlpha = 0.35;
      [-0.22, 0, 0.22].forEach(dx => {
        ctx.beginPath(); ctx.ellipse(c + dx*S, c + S*0.14, S*0.1, S*0.045, 0, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Otter head popping from middle hole
      ctx.beginPath(); ctx.arc(c, c - S*0.04, S*0.16, 0, Math.PI*2); ctx.fill();
      // Ears
      ctx.beginPath(); ctx.arc(c - S*0.13, c - S*0.16, S*0.055, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.13, c - S*0.16, S*0.055, 0, Math.PI*2); ctx.fill();
      // Eyes (dark)
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath(); ctx.arc(c - S*0.06, c - S*0.06, S*0.038, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(c + S*0.06, c - S*0.06, S*0.038, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      // Motion lines (popping up — small + sparks)
      ctx.strokeStyle = "rgba(255,255,255,0.48)";
      ctx.lineWidth = S*0.035;
      [[-0.28, -0.26], [0.28, -0.26]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(c + dx*S, c + dy*S); ctx.lineTo(c + dx*S, c + (dy - 0.1)*S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c + (dx - 0.05)*S, c + (dy - 0.05)*S); ctx.lineTo(c + (dx + 0.05)*S, c + (dy - 0.05)*S); ctx.stroke();
      });
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "shelf-snap": {
      // Shelf plank
      ctx.lineWidth = S*0.06;
      ctx.beginPath(); ctx.moveTo(c - S*0.33, c + S*0.1); ctx.lineTo(c + S*0.33, c + S*0.1); ctx.stroke();
      // Shelf supports
      ctx.lineWidth = S*0.04;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(c - S*0.3, c + S*0.1); ctx.lineTo(c - S*0.3, c + S*0.28);
      ctx.moveTo(c + S*0.3, c + S*0.1); ctx.lineTo(c + S*0.3, c + S*0.28);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      // Books standing on shelf
      const bw2 = S*0.1, bh2 = S*0.32;
      [-0.22, -0.1, 0.02].forEach(dx => {
        ctx.fillRect(c + dx*S, c + S*0.1 - bh2, bw2 - S*0.015, bh2);
      });
      // One book sliding out right (protruding past edge)
      ctx.globalAlpha = 0.8;
      ctx.fillRect(c + S*0.18, c + S*0.1 - bh2 + S*0.1, bw2, bh2 - S*0.1);
      ctx.globalAlpha = 1;
      // Arrow showing book sliding out
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = S*0.04;
      ctx.beginPath();
      ctx.moveTo(c + S*0.2, c - S*0.2); ctx.lineTo(c + S*0.34, c - S*0.2);
      ctx.moveTo(c + S*0.26, c - S*0.27); ctx.lineTo(c + S*0.34, c - S*0.2); ctx.lineTo(c + S*0.26, c - S*0.13);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "sample-clicker":
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = S*0.03;
      ctx.beginPath(); ctx.moveTo(c - S*0.1, c - S*0.24); ctx.lineTo(c - S*0.14, c - S*0.32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c + S*0.02, c - S*0.26); ctx.lineTo(c + S*0.06, c - S*0.34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c - S*0.22, c - S*0.2); ctx.lineTo(c - S*0.3, c - S*0.26); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.roundRect(c - S*0.28, c - S*0.14, S*0.4, S*0.26, [S*0.06]); ctx.fill();
      ctx.fillStyle = "rgba(90,60,180,0.9)";
      ctx.font = `800 ${S*0.15}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("+1", c - S*0.08, c);
      ctx.fillStyle = "rgba(30,34,44,0.95)";
      ctx.beginPath();
      ctx.moveTo(c + S*0.08, c + S*0.02);
      ctx.lineTo(c + S*0.08, c + S*0.34);
      ctx.lineTo(c + S*0.15, c + S*0.26);
      ctx.lineTo(c + S*0.22, c + S*0.36);
      ctx.lineTo(c + S*0.26, c + S*0.33);
      ctx.lineTo(c + S*0.19, c + S*0.23);
      ctx.lineTo(c + S*0.3, c + S*0.22);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;

    case "typing-rush": {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `900 ${S*0.38}px system-ui`;
      ctx.fillText("A", c - S*0.18, c - S*0.1);
      ctx.globalAlpha = 0.55;
      ctx.fillText("Z", c + S*0.18, c - S*0.1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(c - S*0.3, c + S*0.12, S*0.6, S*0.07);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(c - S*0.3, c + S*0.12, S*0.2, S*0.07);
      ctx.fillRect(c + S*0.12, c + S*0.28, S*0.04, S*0.14);
      break;
    }

    case "color-match": {
      ctx.fillStyle = "rgba(240,93,94,0.9)";
      ctx.beginPath(); ctx.arc(c, c - S*0.27, S*0.1, 0, Math.PI*2); ctx.fill();
      [[c-S*0.2,c,"rgba(43,209,196,0.85)"],[c,c+S*0.1,"rgba(240,93,94,0.88)"],[c+S*0.2,c-S*0.04,"rgba(247,184,75,0.8)"]].forEach(([bx,by,col]) => {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(bx, by, S*0.1, 0, Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = "rgba(240,93,94,0.7)";
      ctx.fillRect(c - S*0.24, c + S*0.26, S*0.48, S*0.07);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "snake-maze": {
      ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = S*0.018;
      for (let i = 1; i < 5; i++) {
        const p = c - S*0.3 + i * S*0.15;
        ctx.beginPath(); ctx.moveTo(p, c-S*0.3); ctx.lineTo(p, c+S*0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c-S*0.3, p); ctx.lineTo(c+S*0.3, p); ctx.stroke();
      }
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      [[1,0],[3,0],[0,2],[4,2],[1,4],[3,4]].forEach(([col,row]) =>
        ctx.fillRect(c - S*0.3 + col*S*0.15, c - S*0.3 + row*S*0.15, S*0.15, S*0.15));
      ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = S*0.1; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(c, c+S*0.3); ctx.lineTo(c, c+S*0.15); ctx.lineTo(c+S*0.15, c+S*0.15);
      ctx.lineTo(c+S*0.15, c-S*0.15); ctx.lineTo(c-S*0.15, c-S*0.15); ctx.lineTo(c-S*0.15, c-S*0.3);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.arc(c-S*0.15, c-S*0.3, S*0.075, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath(); ctx.arc(c-S*0.18, c-S*0.32, S*0.022, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(240,93,94,0.95)";
      ctx.beginPath(); ctx.arc(c-S*0.22, c+S*0.22, S*0.055, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "gravity-flip": {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(c-S*0.36, c-S*0.34, S*0.72, S*0.05);
      ctx.fillRect(c-S*0.36, c+S*0.29, S*0.72, S*0.05);
      ctx.fillStyle = "rgba(60,30,140,0.75)";
      ctx.fillRect(c+S*0.16, c+S*0.13, S*0.1, S*0.16);
      ctx.fillRect(c+S*0.02, c-S*0.29, S*0.1, S*0.14);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.roundRect(c-S*0.24, c-S*0.05, S*0.14, S*0.14, [S*0.03]); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = S*0.04;
      ctx.beginPath(); ctx.moveTo(c-S*0.17, c-S*0.09); ctx.lineTo(c-S*0.17, c-S*0.24); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c-S*0.22, c-S*0.19); ctx.lineTo(c-S*0.17, c-S*0.27); ctx.lineTo(c-S*0.12, c-S*0.19);
      ctx.stroke();
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(c-S*0.17, c+S*0.13); ctx.lineTo(c-S*0.17, c+S*0.24); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c-S*0.22, c+S*0.19); ctx.lineTo(c-S*0.17, c+S*0.27); ctx.lineTo(c-S*0.12, c+S*0.19);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "rhythm-tap": {
      const rC = ["rgba(240,93,94,0.82)","rgba(247,184,75,0.82)","rgba(43,209,196,0.82)","rgba(169,139,255,0.82)"];
      const rY = [c-S*0.04, c+S*0.12, c-S*0.2, c+S*0.0];
      rC.forEach((col, i) => {
        const lx = c - S*0.32 + i * S*0.21;
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(lx, c-S*0.38, S*0.16, S*0.76);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.roundRect(lx, rY[i], S*0.16, S*0.12, [3]); ctx.fill();
      });
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = S*0.04;
      ctx.beginPath(); ctx.moveTo(c-S*0.36, c+S*0.28); ctx.lineTo(c+S*0.36, c+S*0.28); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "number-crunch": {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `900 ${S*0.3}px system-ui`;
      ctx.fillText("7×8", c, c - S*0.1);
      ctx.font = `900 ${S*0.2}px system-ui`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("= ?", c, c + S*0.16);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.globalAlpha = 0.22;
      ctx.fillRect(c - S*0.22, c + S*0.06, S*0.44, S*0.2);
      ctx.globalAlpha = 1;
      break;
    }

    case "bubble-pop": {
      [[c-S*0.2,c-S*0.07,S*0.13,"rgba(240,93,94,0.85)"],[c+S*0.1,c-S*0.18,S*0.11,"rgba(43,209,196,0.85)"],
       [c+S*0.24,c+S*0.04,S*0.12,"rgba(247,184,75,0.8)"],[c-S*0.05,c+S*0.16,S*0.13,"rgba(169,139,255,0.85)"],
       [c+S*0.1,c+S*0.18,S*0.09,"rgba(115,214,118,0.8)"]].forEach(([bx,by,r,col]) => {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.beginPath(); ctx.arc(bx-r*0.3, by-r*0.28, r*0.32, 0, Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = S*0.04;
      [0,60,120,180,240,300].forEach(deg => {
        const a = deg * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(c-S*0.2+Math.cos(a)*S*0.13, c-S*0.07+Math.sin(a)*S*0.13);
        ctx.lineTo(c-S*0.2+Math.cos(a)*S*0.2, c-S*0.07+Math.sin(a)*S*0.2);
        ctx.stroke();
      });
      break;
    }

    case "ice-slide": {
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = S*0.018;
      for (let i = 0; i < 5; i++) {
        const p = c - S*0.36 + i*S*0.18;
        ctx.beginPath(); ctx.moveTo(p, c-S*0.3); ctx.lineTo(p, c+S*0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c-S*0.36, p); ctx.lineTo(c+S*0.36, p); ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(c-S*0.16, c-S*0.1, S*0.1, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(c-S*0.2, c-S*0.01, S*0.12, S*0.2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath(); ctx.arc(c-S*0.2, c-S*0.13, S*0.035, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(c-S*0.1, c-S*0.13, S*0.035, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(77,216,240,0.9)";
      ctx.strokeStyle = "rgba(77,216,240,0.9)"; ctx.lineWidth = S*0.05;
      ctx.beginPath(); ctx.moveTo(c+S*0.06, c+S*0.06); ctx.lineTo(c+S*0.34, c+S*0.06); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c+S*0.26,c-S*0.02); ctx.lineTo(c+S*0.36,c+S*0.06); ctx.lineTo(c+S*0.26,c+S*0.14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "card-flip": {
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.beginPath(); ctx.roundRect(c-S*0.34, c-S*0.28, S*0.24, S*0.36, [S*0.03]); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = S*0.03;
      ctx.beginPath(); ctx.roundRect(c-S*0.34, c-S*0.28, S*0.24, S*0.36, [S*0.03]); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = S*0.025;
      ctx.beginPath();
      ctx.moveTo(c-S*0.34,c-S*0.28); ctx.lineTo(c-S*0.1,c+S*0.08);
      ctx.moveTo(c-S*0.1,c-S*0.28); ctx.lineTo(c-S*0.34,c+S*0.08);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,32,42,0.95)";
      ctx.beginPath(); ctx.roundRect(c+S*0.1, c-S*0.28, S*0.24, S*0.36, [S*0.03]); ctx.fill();
      ctx.strokeStyle = "rgba(43,209,196,0.72)"; ctx.lineWidth = S*0.03;
      ctx.beginPath(); ctx.roundRect(c+S*0.1, c-S*0.28, S*0.24, S*0.36, [S*0.03]); ctx.stroke();
      ctx.font = `${S*0.2}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText("⭐", c+S*0.22, c-S*0.1);
      break;
    }

    case "tower-balance": {
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = S*0.025;
      ctx.beginPath(); ctx.moveTo(c+S*0.06, c-S*0.46); ctx.lineTo(c-S*0.02, c-S*0.2); ctx.stroke();
      ctx.fillStyle = "rgba(240,93,94,0.92)";
      ctx.beginPath(); ctx.roundRect(c-S*0.13, c-S*0.2, S*0.22, S*0.13, [S*0.02]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(c-S*0.13, c-S*0.02, S*0.24, S*0.115);
      ctx.fillRect(c-S*0.09, c+S*0.105, S*0.24, S*0.115);
      ctx.fillRect(c-S*0.12, c+S*0.23, S*0.24, S*0.115);
      break;
    }

    case "train-switcher": {
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = S*0.06;
      ctx.beginPath();
      ctx.moveTo(c, c+S*0.34); ctx.lineTo(c, c+S*0.02); ctx.lineTo(c-S*0.22, c-S*0.22);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c, c+S*0.02); ctx.lineTo(c+S*0.22, c-S*0.22); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = S*0.025;
      [0.28, 0.18, 0.08].forEach(t => {
        ctx.beginPath(); ctx.moveTo(c-S*0.07, c+S*t); ctx.lineTo(c+S*0.07, c+S*t); ctx.stroke();
      });
      ctx.fillStyle = "rgba(240,93,94,0.9)";
      ctx.beginPath(); ctx.arc(c-S*0.28, c-S*0.28, S*0.09, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(43,209,196,0.9)";
      ctx.beginPath(); ctx.arc(c+S*0.28, c-S*0.28, S*0.09, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.roundRect(c-S*0.07, c+S*0.18, S*0.14, S*0.17, [S*0.03]); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "signal-jam": {
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = S*0.03;
      ctx.beginPath(); ctx.moveTo(c-S*0.4, c+S*0.35); ctx.lineTo(c+S*0.4, c+S*0.35); ctx.stroke();
      ctx.fillStyle = "rgba(20,28,36,0.9)";
      ctx.beginPath(); ctx.roundRect(c-S*0.13, c-S*0.33, S*0.26, S*0.58, [S*0.06]); ctx.fill();
      ["rgba(240,93,94,0.95)", "rgba(247,184,75,0.95)", "rgba(115,214,118,0.95)"].forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(c, c-S*0.2 + i*S*0.16, S*0.06, 0, Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "circuit-repair": {
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = S*0.045;
      ctx.beginPath();
      ctx.moveTo(c-S*0.34, c-S*0.26); ctx.lineTo(c-S*0.06, c-S*0.26); ctx.lineTo(c-S*0.06, c-S*0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c+S*0.34, c+S*0.28); ctx.lineTo(c+S*0.06, c+S*0.28); ctx.lineTo(c+S*0.06, c+S*0.1);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(c-S*0.34, c-S*0.26, S*0.05, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(c+S*0.34, c+S*0.28, S*0.05, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(20,32,42,0.92)";
      ctx.beginPath(); ctx.roundRect(c-S*0.15, c-S*0.13, S*0.3, S*0.26, [S*0.04]); ctx.fill();
      ctx.fillStyle = "rgba(247,184,75,0.95)";
      ctx.beginPath(); ctx.arc(c, c, S*0.055, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "potion-lab": {
      ctx.fillStyle = "rgba(115,214,118,0.9)";
      ctx.beginPath();
      ctx.moveTo(c-S*0.15, c+S*0.06); ctx.lineTo(c+S*0.15, c+S*0.06);
      ctx.lineTo(c+S*0.24, c+S*0.25); ctx.lineTo(c-S*0.24, c+S*0.25);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = S*0.045;
      ctx.beginPath();
      ctx.moveTo(c-S*0.08, c-S*0.32); ctx.lineTo(c-S*0.08, c-S*0.08);
      ctx.lineTo(c-S*0.26, c+S*0.26); ctx.lineTo(c+S*0.26, c+S*0.26);
      ctx.lineTo(c+S*0.08, c-S*0.08); ctx.lineTo(c+S*0.08, c-S*0.32);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath(); ctx.arc(c-S*0.04, c-S*0.02, S*0.035, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(c+S*0.06, c-S*0.14, S*0.028, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "harbor-sort": {
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = S*0.05;
      ctx.beginPath();
      ctx.moveTo(c-S*0.34, c+S*0.36); ctx.lineTo(c-S*0.34, c-S*0.28); ctx.lineTo(c+S*0.3, c-S*0.28);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = S*0.025;
      ctx.beginPath(); ctx.moveTo(c+S*0.12, c-S*0.28); ctx.lineTo(c+S*0.12, c-S*0.06); ctx.stroke();
      ctx.fillStyle = "rgba(240,93,94,0.9)";
      ctx.fillRect(c, c-S*0.06, S*0.24, S*0.14);
      ctx.fillStyle = "rgba(247,184,75,0.9)";
      ctx.fillRect(c-S*0.1, c+S*0.22, S*0.24, S*0.14);
      ctx.fillStyle = "rgba(43,209,196,0.9)";
      ctx.fillRect(c+S*0.16, c+S*0.22, S*0.24, S*0.14);
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "cloud-catcher": {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(c-S*0.12, c-S*0.12, S*0.12, 0, Math.PI*2);
      ctx.arc(c+S*0.02, c-S*0.18, S*0.14, 0, Math.PI*2);
      ctx.arc(c+S*0.15, c-S*0.1, S*0.11, 0, Math.PI*2);
      ctx.fill();
      ctx.fillRect(c-S*0.2, c-S*0.12, S*0.44, S*0.1);
      ctx.strokeStyle = "rgba(16,52,80,0.55)"; ctx.lineWidth = S*0.035;
      [-0.12, 0.02, 0.16].forEach(dx => {
        ctx.beginPath(); ctx.moveTo(c+dx*S, c+S*0.04); ctx.lineTo(c+dx*S-S*0.04, c+S*0.15); ctx.stroke();
      });
      ctx.fillStyle = "rgba(115,214,118,0.9)";
      ctx.beginPath(); ctx.roundRect(c-S*0.28, c+S*0.23, S*0.56, S*0.12, [S*0.03]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "library-rush": {
      ctx.fillStyle = "rgba(240,93,94,0.92)";
      ctx.fillRect(c-S*0.28, c-S*0.22, S*0.11, S*0.44);
      ctx.fillStyle = "rgba(43,209,196,0.92)";
      ctx.fillRect(c-S*0.13, c-S*0.26, S*0.11, S*0.48);
      ctx.fillStyle = "rgba(247,184,75,0.92)";
      ctx.save();
      ctx.translate(c+S*0.14, c+S*0.22); ctx.rotate(-0.28);
      ctx.fillRect(0, -S*0.44, S*0.11, S*0.44);
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(c-S*0.34, c+S*0.22, S*0.68, S*0.05);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "power-grid": {
      const gridNodes = [[-0.3, -0.28], [0.3, -0.24], [0.26, 0.3], [-0.28, 0.26]];
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = S*0.035;
      gridNodes.forEach(([nx, ny]) => {
        ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c+nx*S, c+ny*S); ctx.stroke();
      });
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      gridNodes.forEach(([nx, ny]) => {
        ctx.beginPath(); ctx.arc(c+nx*S, c+ny*S, S*0.055, 0, Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = "rgba(20,32,42,0.9)";
      ctx.beginPath(); ctx.arc(c, c, S*0.15, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(247,184,75,0.95)";
      ctx.beginPath();
      ctx.moveTo(c+S*0.03, c-S*0.1); ctx.lineTo(c-S*0.06, c+S*0.02); ctx.lineTo(c, c+S*0.02);
      ctx.lineTo(c-S*0.03, c+S*0.1); ctx.lineTo(c+S*0.06, c-S*0.02); ctx.lineTo(c, c-S*0.02);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "bakery-balance": {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.moveTo(c-S*0.2, c+S*0.02); ctx.lineTo(c+S*0.2, c+S*0.02);
      ctx.lineTo(c+S*0.13, c+S*0.3); ctx.lineTo(c-S*0.13, c+S*0.3);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = S*0.02;
      [-0.08, 0, 0.08].forEach(dx => {
        ctx.beginPath(); ctx.moveTo(c+dx*S, c+S*0.04); ctx.lineTo(c+dx*S*0.7, c+S*0.28); ctx.stroke();
      });
      ctx.fillStyle = "rgba(255,238,196,0.95)";
      ctx.beginPath();
      ctx.arc(c-S*0.11, c-S*0.02, S*0.09, 0, Math.PI*2);
      ctx.arc(c, c-S*0.1, S*0.11, 0, Math.PI*2);
      ctx.arc(c+S*0.11, c-S*0.02, S*0.09, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = "rgba(240,93,94,0.95)";
      ctx.beginPath(); ctx.arc(c, c-S*0.25, S*0.055, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    case "lighthouse-sweep": {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(c, c-S*0.21); ctx.lineTo(c+S*0.44, c-S*0.4); ctx.lineTo(c+S*0.44, c-S*0.06);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.moveTo(c-S*0.09, c-S*0.16); ctx.lineTo(c+S*0.09, c-S*0.16);
      ctx.lineTo(c+S*0.14, c+S*0.32); ctx.lineTo(c-S*0.14, c+S*0.32);
      ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(c-S*0.09, c-S*0.16); ctx.lineTo(c+S*0.09, c-S*0.16);
      ctx.lineTo(c+S*0.14, c+S*0.32); ctx.lineTo(c-S*0.14, c+S*0.32);
      ctx.closePath(); ctx.clip();
      ctx.fillStyle = "rgba(240,93,94,0.9)";
      ctx.fillRect(c-S*0.2, c-S*0.04, S*0.4, S*0.09);
      ctx.fillRect(c-S*0.2, c+S*0.16, S*0.4, S*0.09);
      ctx.restore();
      ctx.fillStyle = "rgba(20,32,42,0.9)";
      ctx.fillRect(c-S*0.08, c-S*0.26, S*0.16, S*0.1);
      ctx.fillStyle = "rgba(247,184,75,0.95)";
      ctx.beginPath(); ctx.arc(c, c-S*0.21, S*0.04, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = S*0.03;
      ctx.beginPath(); ctx.moveTo(c-S*0.4, c+S*0.37); ctx.lineTo(c+S*0.4, c+S*0.37); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(255,255,255,0.92)";
      break;
    }

    default: {
      const pts = 5, outerR = S*0.28, innerR = S*0.12;
      ctx.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const a = (i * Math.PI) / pts - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        i === 0 ? ctx.moveTo(c + Math.cos(a)*r, c + Math.sin(a)*r)
                : ctx.lineTo(c + Math.cos(a)*r, c + Math.sin(a)*r);
      }
      ctx.closePath(); ctx.fill();
      break;
    }
  }
}

/* Paint the pre-rendered grid as soon as this file lands, without waiting for
   app.js. Re-running on a canvas app.js has already drawn is harmless — the
   drawing is deterministic and fully covers the bitmap. */
(function paintPrerenderedIcons() {
  const draw = () => document.querySelectorAll(".app-icon canvas[data-id]").forEach((canvas) => {
    drawGameIcon(canvas.getContext("2d"), canvas.dataset.id, canvas.dataset.accent, 120);
  });

  // Draw straight away rather than on DOMContentLoaded. This tag sits after the
  // pre-rendered grid, so those canvases are already parsed — and waiting for
  // DOMContentLoaded would mean waiting for app.js below to finish downloading,
  // which is the delay this split exists to remove.
  draw();

  // Safety net for a canvas parsed after this point, e.g. if the tag is ever
  // moved above the grid.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", draw, { once: true });
  }
})();
