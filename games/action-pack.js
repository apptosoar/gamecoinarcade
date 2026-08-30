(() => {
  const config = window.ACTION_GAME_CONFIG;
  const GAME_I18N = {
    ko: { score: "점수", restart: "다시 시작", gameOver: "게임 종료" },
    en: { score: "Score", restart: "Restart", gameOver: "Game Over" },
    es: { score: "Puntuación", restart: "Reiniciar", gameOver: "Fin del juego" },
    zh: { score: "分数", restart: "重新开始", gameOver: "游戏结束" },
    "zh-TW": { score: "分數", restart: "重新開始", gameOver: "遊戲結束" },
    ja: { score: "スコア", restart: "再開", gameOver: "ゲームオーバー" },
    de: { score: "Punkte", restart: "Neu starten", gameOver: "Spiel vorbei" },
    fr: { score: "Score", restart: "Recommencer", gameOver: "Partie terminée" },
    hi: { score: "स्कोर", restart: "फिर शुरू करें", gameOver: "खेल समाप्त" },
    pt: { score: "Pontuação", restart: "Reiniciar", gameOver: "Fim de jogo" },
    ru: { score: "Счет", restart: "Начать заново", gameOver: "Игра окончена" },
    id: { score: "Skor", restart: "Mulai ulang", gameOver: "Game over" },
    it: { score: "Punteggio", restart: "Riavvia", gameOver: "Fine partita" },
    tr: { score: "Skor", restart: "Yeniden başlat", gameOver: "Oyun bitti" },
    th: { score: "คะแนน", restart: "เริ่มใหม่", gameOver: "จบเกม" },
    he: { score: "ניקוד", restart: "התחל מחדש", gameOver: "המשחק נגמר" },
    ur: { score: "اسکور", restart: "دوبارہ شروع کریں", gameOver: "گیم ختم" },
  };
  const currentLocale = detectLocale();
  const copy = GAME_I18N[currentLocale] || GAME_I18N.en;
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.querySelector("#score");
  const stageEl = document.querySelector("#stageNum");
  const healthEl = document.querySelector("#health");
  const healthBarEl = document.querySelector("#healthBar");
  const bombsEl = document.querySelector("#bombs");
  const powerEl = document.querySelector("#power");
  const restart = document.querySelector("#restart");
  const titleEl = document.querySelector("#title");
  const action = document.querySelector("#action");

  const state = {
    w: 0,
    h: 0,
    t: 0,
    score: 0,
    health: config.health || 3,
    over: false,
    keys: new Set(),
    player: { x: 0, y: 0, r: 16, vx: 0, vy: 0, lane: 1, facing: 1, jumps: 0 },
    items: [],
    shots: [],
    effects: [],
    cooldown: 0,
    autoAttack: 0,
    spawn: 0,
    second: 0,
    hitFlash: 0,
    spriteScale: 1,
    manualAttackCd: 0,
    shieldTimer: 0,
    shieldCd: 0,
    stage: 0,
    prevStage: 0,
    stageFade: 0,
    stageBanner: 0,
    scroll: 0,
    stageScrollStart: 0,
    prevScrollFreeze: 0,
    foeShots: [],
    bombs: (config.bombs || {}).start || 0,
    weapon: 1,
    powerNote: null,
    bombFlash: 0,
    pickupTimer: 0,
    boss: null,
    bossCleared: [],
    invuln: 0,
  };

  const palette = {
    bg: "#0b0c0f",
    panel: "#151820",
    text: "#f4f2ea",
    muted: "#b8bec9",
    amber: "#f7b84b",
    teal: "#2bd1c4",
    red: "#f05d5e",
    violet: "#a98bff",
    green: "#73d676",
  };

  function loadImage(src) {
    const img = new Image();
    img.addEventListener("error", () => {
      // one retry past the http cache: a truncated copy cached during a deploy would
      // otherwise keep failing to decode on every visit and take the asset out for good
      if (img.retried) return;
      img.retried = true;
      img.src = src + (src.includes("?") ? "&" : "?") + "reload=" + Date.now();
    });
    img.src = src;
    return img;
  }

  const playerSprite = config.playerSprite ? loadImage(config.playerSprite) : null;
  const playerRunSprites = (config.playerRunSprites || []).map(loadImage);
  const playerJumpSprite = config.playerJumpSprite ? loadImage(config.playerJumpSprite) : null;
  const enemySprites = (config.enemySprites || []).map(loadImage);
  const bgImage = config.bgImage ? loadImage(config.bgImage) : null;
  const hazardSprite = config.hazardSprite ? loadImage(config.hazardSprite) : null;
  // stage backdrops are full-screen art, so only fetch the one in play plus the next
  const bgStages = new Array((config.bgStages || []).length).fill(null);
  const bossSprites = new Array((config.bosses || []).length).fill(null);
  function loadStage(i) {
    if (i < 0 || i >= bgStages.length) return;
    if (!bgStages[i]) bgStages[i] = loadImage(config.bgStages[i]);
    // the boss waits at the end of its stage, so it has a whole stage of flying time to
    // arrive - fetching it with the backdrop keeps it off the critical path either way
    const boss = (config.bosses || [])[i];
    if (boss && !bossSprites[i]) bossSprites[i] = loadImage(boss.sprite);
  }
  loadStage(0);
  loadStage(1);
  if (stageEl && bgStages.length) stageEl.textContent = (config.stageCodes || [])[0] || "1";

  document.documentElement.lang = currentLocale;
  document.documentElement.dir = ["he", "ur"].includes(currentLocale) ? "rtl" : "ltr";
  titleEl.textContent = config.title;
  restart.textContent = config.restartLabel || copy.restart;
  document.querySelectorAll(".hud span").forEach((node) => {
    const first = node.firstChild;
    if (first?.nodeType === Node.TEXT_NODE) first.textContent = first.textContent.replace(/\bScore\b/i, copy.score);
  });
  restart.addEventListener("click", () => location.reload());
  // with auto-fire on there is nothing left for a fire button to do, so the one control
  // the game still needs a thumb for - the bomb - takes it over
  const autoFire = Boolean(config.autoFire) && config.type === "shooter";
  const bombButtons = Boolean(autoFire && config.bombs);
  if (action) {
    if (bombButtons) action.textContent = config.actionLabel || "Bomb";
    action.addEventListener("click", () => (bombButtons ? useBomb() : performAction()));
  }

  addEventListener("keydown", (event) => {
    state.keys.add(event.key);
    if (event.key === " ") event.preventDefault();
    if (event.repeat) return;
    if (event.key === " ") {
      performAction();
    } else if (event.key === "b" || event.key === "B" || event.key === "Shift") {
      useBomb();
    } else if (event.key === "ArrowUp" && (config.type === "runner" || config.type === "shooter" || config.type === "defender")) {
      performAction();
    }
  });
  addEventListener("keyup", (event) => state.keys.delete(event.key));

  function performAction() {
    if (config.type === "click") punchNearest();
    if (config.type === "shooter") fire();
    if (config.type === "defender") fireNearest();
    if (config.type === "runner") jump();
    if (config.type === "arena") manualAttack();
    if (config.type === "dodge") activateShield();
  }

  buildArcadeControls();

  function buildArcadeControls() {
    const controls = document.createElement("div");
    controls.className = "controls";
    controls.innerHTML = `
      <div class="joystick" id="joystick"><div class="joystick-stick" id="joystickStick"></div></div>
      <div class="dpad" id="dpad">
        <button type="button" class="dpad-btn" aria-label="Action"></button>
        <button type="button" class="dpad-btn" aria-label="Action"></button>
        <button type="button" class="dpad-btn" aria-label="Action"></button>
        <button type="button" class="dpad-btn" aria-label="Action"></button>
      </div>
    `;
    canvas.insertAdjacentElement("afterend", controls);

    const joystick = controls.querySelector("#joystick");
    const stick = controls.querySelector("#joystickStick");
    const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    let joystickPointerId = null;

    function updateJoystick(clientX, clientY) {
      const rect = joystick.getBoundingClientRect();
      const radius = rect.width / 2;
      const dx = clientX - (rect.left + radius);
      const dy = clientY - (rect.top + radius);
      const dist = Math.min(Math.hypot(dx, dy), radius);
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * dist;
      const ny = Math.sin(angle) * dist;
      stick.style.transform = `translate(${nx}px, ${ny}px)`;
      const deadzone = radius * 0.3;
      ARROW_KEYS.forEach((key) => state.keys.delete(key));
      if (dist > deadzone) {
        if (nx < -deadzone) state.keys.add("ArrowLeft");
        if (nx > deadzone) state.keys.add("ArrowRight");
        if (ny < -deadzone) state.keys.add("ArrowUp");
        if (ny > deadzone) state.keys.add("ArrowDown");
      }
    }

    function resetJoystick() {
      stick.style.transform = "translate(0px, 0px)";
      ARROW_KEYS.forEach((key) => state.keys.delete(key));
    }

    joystick.addEventListener("pointerdown", (event) => {
      joystickPointerId = event.pointerId;
      joystick.setPointerCapture?.(joystickPointerId);
      updateJoystick(event.clientX, event.clientY);
    });
    joystick.addEventListener("pointermove", (event) => {
      if (event.pointerId !== joystickPointerId) return;
      updateJoystick(event.clientX, event.clientY);
    });
    const endJoystick = (event) => {
      if (event.pointerId !== joystickPointerId) return;
      joystickPointerId = null;
      resetJoystick();
    };
    joystick.addEventListener("pointerup", endJoystick);
    joystick.addEventListener("pointercancel", endJoystick);
    joystick.addEventListener("pointerleave", endJoystick);

    const dpadButtons = [...controls.querySelectorAll(".dpad-btn")];
    // the four pads are all "fire"; hand the last one to the bomb rather than adding a
    // control the thumb has to reach for
    if (config.bombs && dpadButtons.length) {
      // auto-fire leaves the other three pads with nothing to do, so hand them all to the bomb
      (bombButtons ? dpadButtons : dpadButtons.slice(-1)).forEach((bombBtn) => {
        bombBtn.dataset.role = "bomb";
        bombBtn.setAttribute("aria-label", "Bomb");
        bombBtn.textContent = "B";
      });
    }
    dpadButtons.forEach((btn) => {
      btn.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        btn.classList.add("active");
        if (btn.dataset.role === "bomb") useBomb();
        else performAction();
      });
      const release = () => btn.classList.remove("active");
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointercancel", release);
      btn.addEventListener("pointerleave", release);
    });
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const ratio = devicePixelRatio || 1;
    state.w = Math.max(320, box.width);
    state.h = Math.max(320, box.height);
    canvas.width = Math.floor(state.w * ratio);
    canvas.height = Math.floor(state.h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";   // resizing the canvas resets these
    state.spriteScale = clamp(state.w / 780, 0.45, 1);
    if (!state.t) resetPlayer();
  }

  function resetPlayer() {
    state.player.x = state.w * 0.5;
    state.player.y = config.type === "runner" ? state.h - 64 : state.h * 0.72;
    state.player.vy = 0;
    state.player.jumps = 0;
    if (config.type === "arena") state.player.y = state.h * 0.5;
    if (config.type === "dodge") state.player.y = state.h * 0.72;
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function step() {
    if (state.over) return;
    state.t += 1;
    state.cooldown = Math.max(0, state.cooldown - 1);
    state.spawn -= 1;
    state.second += 1;
    if (state.second >= 60) {
      state.second = 0;
      state.score += config.passiveScore || 1;
    }

    // the backdrop holds still for the length of a boss fight - the stage is not over yet
    if (!state.boss && (config.scrollBg || config.stageAdvance === "scroll")) {
      state.scroll += (config.bgScrollSpeed || 1.6) * state.spriteScale;
    }
    if (bgStages.length > 1) advanceStage();

    const healthBefore = state.health;
    movePlayer();
    // the trigger is held down for the player: every frame asks to fire, the cooldown decides
    if (autoFire) fire();
    // the boss is the encounter; trickling more fighters in just muddies its patterns
    if (state.spawn <= 0 && !state.boss) spawnItem();
    if (config.type === "arena") autoAttack();
    state.manualAttackCd = Math.max(0, state.manualAttackCd - 1);
    state.shieldTimer = Math.max(0, state.shieldTimer - 1);
    state.shieldCd = Math.max(0, state.shieldCd - 1);
    state.invuln = Math.max(0, state.invuln - 1);
    state.bombFlash = Math.max(0, state.bombFlash - 1);
    // pickups keep falling through boss fights - that is exactly when they are needed
    if (config.pickups) {
      state.pickupTimer -= 1;
      if (state.pickupTimer <= 0) {
        state.pickupTimer = Math.round((config.pickups.interval || 780) * rand(0.8, 1.25));
        spawnPickup();
      }
    }
    updateShots();
    updateBoss();
    updateItems();
    updateFoeShots();
    updateEffects();
    state.hitFlash = Math.max(0, state.hitFlash - 1);
    if (state.health < healthBefore) state.hitFlash = 18;
    scoreEl.textContent = state.score;
    healthEl.textContent = state.health;
    if (bombsEl) bombsEl.textContent = state.bombs;
    if (powerEl) powerEl.textContent = state.weapon;
    if (state.powerNote && (state.powerNote.life -= 1) <= 0) state.powerNote = null;
    if (healthBarEl) {
      const maxHealth = config.health || 3;
      if (healthBarEl.children.length !== maxHealth) {
        healthBarEl.innerHTML = "";
        for (let i = 0; i < maxHealth; i += 1) {
          const seg = document.createElement("span");
          seg.className = "hp-seg";
          healthBarEl.appendChild(seg);
        }
      }
      const segs = healthBarEl.children;
      for (let i = 0; i < segs.length; i += 1) {
        segs[i].classList.toggle("filled", i < state.health);
        segs[i].classList.toggle("just-lost", state.hitFlash > 0 && i === state.health);
      }
      const flashAlpha = state.hitFlash / 18;
      healthBarEl.style.boxShadow = flashAlpha > 0 ? `0 0 ${10 * flashAlpha}px ${2 * flashAlpha}px rgba(240,93,94,${flashAlpha})` : "none";
    }
  }

  function movePlayer() {
    const p = state.player;
    const speed = (config.speed || 5) * state.spriteScale;
    if (config.type === "runner") {
      p.vy += 0.8;
      p.y += p.vy;
      if (p.y > state.h - 64) {
        p.y = state.h - 64;
        p.vy = 0;
        p.jumps = 0;
      }
      if (state.keys.has("ArrowLeft") || state.keys.has("a")) p.x -= speed;
      if (state.keys.has("ArrowRight") || state.keys.has("d")) p.x += speed;
      p.x = clamp(p.x, 40, state.w - 40);
      return;
    }

    if (state.keys.has("ArrowLeft") || state.keys.has("a")) { p.x -= speed; p.facing = -1; }
    if (state.keys.has("ArrowRight") || state.keys.has("d")) { p.x += speed; p.facing = 1; }
    if (state.keys.has("ArrowUp") || state.keys.has("w")) p.y -= speed;
    if (state.keys.has("ArrowDown") || state.keys.has("s")) p.y += speed;
    p.x = clamp(p.x, 24, state.w - 24);
    p.y = clamp(p.y, 42, state.h - 36);
  }

  function jump() {
    const p = state.player;
    const maxJumps = config.maxJumps || 1;
    if (p.y >= state.h - 65) {
      p.jumps = 1;
      p.vy = -14;
    } else if (p.jumps < maxJumps) {
      p.jumps += 1;
      p.vy = -12.5;
    }
  }

  // ---- weapon power ---------------------------------------------------------------------
  // Level 1 is the gun the ship launches with; each "power" pickup adds a level and any hit
  // drops it straight back to 1, so a clean run keeps growing its gun and a sloppy one pays
  // for the hit twice.
  const WEAPON_LEVELS = (config.weapon || {}).levels || [
    { rate: 10, damage: 1, r: 5,   speed: 10,   barrels: [{ dx: 0, angle: 0 }] },
    { rate: 9,  damage: 1, r: 5,   speed: 10.5, barrels: [{ dx: -8, angle: 0 }, { dx: 8, angle: 0 }] },
    { rate: 8,  damage: 1, r: 5.5, speed: 11,   barrels: [{ dx: 0, angle: 0 }, { dx: -10, angle: -0.2 }, { dx: 10, angle: 0.2 }] },
    { rate: 7,  damage: 1, r: 6,   speed: 11.5, barrels: [{ dx: -6, angle: 0 }, { dx: 6, angle: 0 }, { dx: -13, angle: -0.28 }, { dx: 13, angle: 0.28 }] },
    { rate: 6,  damage: 1, r: 6.5, speed: 12,   color: "#f7b84b",
      barrels: [{ dx: 0, angle: 0 }, { dx: -8, angle: -0.15 }, { dx: 8, angle: 0.15 }, { dx: -15, angle: -0.34 }, { dx: 15, angle: 0.34 }] },
  ];
  const DEFAULT_WEAPON = { rate: config.fireRate || 14, damage: 1, r: 5, speed: 10, barrels: [{ dx: 0, angle: 0 }] };

  function weaponLevel() {
    if (!config.weapon) return DEFAULT_WEAPON;
    return WEAPON_LEVELS[clamp(state.weapon, 1, WEAPON_LEVELS.length) - 1];
  }

  function setWeapon(level, color) {
    state.weapon = clamp(level, 1, WEAPON_LEVELS.length);
    state.powerNote = { text: "POWER " + state.weapon, color, life: 52 };
  }

  function fire() {
    if (state.cooldown > 0) return;
    const gun = weaponLevel();
    state.cooldown = gun.rate;
    const scale = state.spriteScale;
    gun.barrels.forEach((barrel) => {
      state.shots.push({
        x: state.player.x + barrel.dx * scale,
        y: state.player.y - 18 * scale,
        vx: Math.sin(barrel.angle) * gun.speed * scale,
        vy: -Math.cos(barrel.angle) * gun.speed * scale,
        r: gun.r * scale,
        dmg: gun.damage,
        color: gun.color,
      });
    });
  }

  function fireNearest() {
    if (state.cooldown > 0) return;
    state.cooldown = config.fireRate || 12;
    const start = { x: 38, y: state.h * 0.5 };
    const target = state.items
      .filter((item) => item.kind === "enemy" && !item.dead)
      .sort((a, b) => distance(a, start) - distance(b, start))[0];
    const angle = target ? Math.atan2(target.y - start.y, target.x - start.x) : 0;
    state.shots.push({ x: start.x, y: start.y, vx: Math.cos(angle) * 9, vy: Math.sin(angle) * 9, r: 5 });
  }

  function autoAttack() {
    state.autoAttack = Math.max(0, state.autoAttack - 1);
    if (state.autoAttack > 0) return;
    const radius = (config.attackRadius || 68) * state.spriteScale;
    const nearest = state.items
      .filter((item) => item.kind === "enemy" && !item.dead && distance(item, state.player) <= radius)
      .sort((a, b) => distance(a, state.player) - distance(b, state.player))[0];
    if (!nearest) return;
    state.autoAttack = config.attackRate || 18;
    nearest.dead = true;
    state.score += config.hitScore || 5;
    pulse(nearest.x, nearest.y, palette.teal);
  }

  function manualAttack() {
    if (state.manualAttackCd > 0) return;
    state.manualAttackCd = 24;
    const radius = (config.attackRadius || 68) * state.spriteScale * 1.6;
    const nearest = state.items
      .filter((item) => item.kind === "enemy" && !item.dead && distance(item, state.player) <= radius)
      .sort((a, b) => distance(a, state.player) - distance(b, state.player))[0];
    if (!nearest) return;
    nearest.dead = true;
    state.score += config.hitScore || 5;
    pulse(nearest.x, nearest.y, palette.amber);
  }

  function activateShield() {
    if (state.shieldCd > 0) return;
    state.shieldTimer = 30;
    state.shieldCd = 90;
    pulse(state.player.x, state.player.y, palette.teal);
  }

  function punchNearest() {
    const nearest = state.items
      .filter((item) => item.kind === "enemy")
      .sort((a, b) => distance(a, state.player) - distance(b, state.player))[0];
    if (nearest) punchAt(nearest.x, nearest.y);
  }

  function punchAt(x, y) {
    const hit = state.items.find((item) => item.kind === "enemy" && distance(item, { x, y }) < item.r + 28);
    pulse(x, y, palette.amber);
    if (hit) {
      hit.dead = true;
      state.score += config.hitScore || 5;
      pulse(hit.x, hit.y, palette.red);
    }
  }

  // which of the enemySprites this one wears - every enemy needs it, not just the arena ones,
  // or a game with several enemy sprites silently shows only the first
  function pickEnemySprite() {
    return enemySprites.length ? Math.floor(Math.random() * enemySprites.length) : 0;
  }

  function spawnItem() {
    const rate = Math.max(18, (config.spawnRate || 64) - Math.floor(state.score / 30));
    state.spawn = rate;
    if (config.type === "shooter") {
      state.items.push({ kind: "enemy", x: rand(24, state.w - 24), y: -24, vx: rand(-0.8, 0.8), vy: rand(1.8, 3.8), r: 18, spriteIndex: pickEnemySprite() });
      return;
    }
    if (config.type === "defender") {
      state.items.push({ kind: "enemy", x: state.w + 24, y: rand(54, state.h - 42), vx: -rand(1.4, 3.2), vy: 0, r: 18, spriteIndex: pickEnemySprite() });
      return;
    }
    if (config.type === "runner") {
      const lanes = config.hazardLanes || [10];
      const laneIndex = Math.floor(Math.random() * lanes.length);
      // the top lane is cleared by staying grounded, so never stack it right behind a jump lane
      const headroom = laneIndex === lanes.length - 1 && state.lastLane !== laneIndex ? 130 : 0;
      state.lastLane = laneIndex;
      state.items.push({
        kind: "hazard",
        x: state.w + 24 + headroom,
        y: state.h - 64 - lanes[laneIndex],
        vx: -rand(4, 7),
        vy: 0,
        r: config.hazardRadius || rand(15, 24),
        spin: rand(0, 6.28),
      });
      return;
    }
    if (config.type === "arena") {
      const edge = Math.floor(Math.random() * 4);
      const point = [
        { x: -24, y: rand(40, state.h - 40) },
        { x: state.w + 24, y: rand(40, state.h - 40) },
        { x: rand(24, state.w - 24), y: -24 },
        { x: rand(24, state.w - 24), y: state.h + 24 },
      ][edge];
      state.items.push({ kind: "enemy", ...point, vx: 0, vy: 0, r: 18, spriteIndex: pickEnemySprite() });
      return;
    }
    if (config.type === "click") {
      state.items.push({ kind: "enemy", x: rand(40, state.w - 40), y: rand(72, state.h - 64), vx: rand(-1.2, 1.2), vy: rand(-1.2, 1.2), r: 22, life: 110 });
      return;
    }
    if (config.pattern === "laser") {
      const vertical = Math.random() > 0.5;
      state.items.push({ kind: "laser", x: vertical ? rand(60, state.w - 60) : -80, y: vertical ? -80 : rand(80, state.h - 80), vx: vertical ? 0 : rand(2.4, 4.2), vy: vertical ? rand(2.4, 4.2) : 0, r: 18, vertical });
      return;
    }
    const fromTop = config.pattern !== "arrows";
    state.items.push({ kind: "hazard", x: fromTop ? rand(28, state.w - 28) : state.w + 28, y: fromTop ? -28 : rand(54, state.h - 54), vx: fromTop ? rand(-0.8, 0.8) : -rand(3.2, 5.4), vy: fromTop ? rand(2.4, 5.2) : 0, r: rand(13, 24) });
  }

  // ---- hostile fire -------------------------------------------------------------------
  // Enemy and boss bullets live in their own list: they are checked against the player only,
  // never against each other or the enemies, so the player's own shots can pass through them.
  function foeShot(x, y, angle, speed, color) {
    const v = speed * state.spriteScale;
    state.foeShots.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      r: (config.foeShotRadius || 5) * state.spriteScale,
      color: color || config.foeShotColor || palette.red,
    });
  }

  // ---- pickups -------------------------------------------------------------------------
  function spawnPickup() {
    const cfg = config.pickups || {};
    // never drop something the player cannot use - watching a full-health heal fall past is
    // worse than no drop at all, and at max weapon another power crate is the same waste
    const pool = [
      ["heal", state.health < (config.health || 3) ? (cfg.healWeight == null ? 3 : cfg.healWeight) : 0],
      ["bomb", state.bombs < ((config.bombs || {}).max || 3) ? (cfg.bombWeight == null ? 2 : cfg.bombWeight) : 0],
      ["power", config.weapon && state.weapon < WEAPON_LEVELS.length ? (cfg.powerWeight == null ? 4 : cfg.powerWeight) : 0],
    ].filter((entry) => entry[1] > 0);
    if (!pool.length) return;
    let roll = Math.random() * pool.reduce((sum, entry) => sum + entry[1], 0);
    const power = (pool.find((entry) => (roll -= entry[1]) <= 0) || pool[0])[0];
    state.items.push({
      kind: "pickup", power,
      x: rand(46, state.w - 46), y: -22,
      vx: rand(-0.4, 0.4),
      vy: (cfg.speed || 1.7) * state.spriteScale,
      r: (cfg.radius || 13) * state.spriteScale,
    });
  }

  function collectPickup(item) {
    if (item.dead) return;
    item.dead = true;
    if (item.power === "heal") {
      state.health = Math.min(config.health || 3, state.health + 1);
      pulse(item.x, item.y, palette.green);
    } else if (item.power === "power") {
      setWeapon(state.weapon + 1, palette.violet);
      pulse(item.x, item.y, palette.violet);
    } else {
      state.bombs = Math.min((config.bombs || {}).max || 3, state.bombs + 1);
      pulse(item.x, item.y, palette.amber);
    }
    state.score += config.pickupScore || 10;
  }

  function useBomb() {
    if (state.over || state.bombs <= 0) return;
    const cfg = config.bombs || {};
    state.bombs -= 1;
    state.bombFlash = 26;
    state.foeShots = [];
    // a bomb is the panic button, so it has to also buy a moment to get clear of whatever
    // was about to land - otherwise the boss's next volley undoes it immediately
    state.invuln = Math.max(state.invuln, cfg.invuln || 45);
    state.items.forEach((item) => {
      if (item.kind !== "enemy" || item.dead) return;
      item.dead = true;
      state.score += config.hitScore || 5;
      pulse(item.x, item.y, palette.amber);
    });
    const boss = state.boss;
    if (boss && !boss.entering && !boss.dying) {
      boss.hp -= cfg.damage || 14;
      boss.hitFlash = 6;
      if (boss.hp <= 0) killBoss();
    }
  }

  function playerReach() {
    return config.playerCollisionRadius || spriteCollisionRadius(
      activePlayerSprite(),
      config.playerSpriteHeight && config.playerSpriteHeight * state.spriteScale,
      state.player.r,
    );
  }

  function updateFoeShots() {
    // the bullet hitbox is deliberately far smaller than the ship - grazing the wingtip has
    // to be survivable or dense patterns become unreadable rather than hard
    const reach = playerReach() * (config.playerBulletHitbox || 0.5);
    state.foeShots.forEach((shot) => {
      shot.x += shot.vx;
      shot.y += shot.vy;
      if (!shot.dead && playerOverlaps(shot, reach + shot.r)) {
        shot.dead = true;
        hurtPlayer(shot.x, shot.y);
      }
    });
    state.foeShots = state.foeShots.filter((shot) => !shot.dead
      && shot.x > -40 && shot.x < state.w + 40 && shot.y > -60 && shot.y < state.h + 60);
  }

  function updateShots() {
    state.shots.forEach((shot) => {
      shot.x += shot.vx;
      shot.y += shot.vy;
      const boss = state.boss;
      if (boss && !boss.entering && !boss.dying && !shot.dead && distance(shot, boss) < shot.r + boss.r) {
        shot.dead = true;
        boss.hp -= shot.dmg || 1;
        boss.hitFlash = 5;
        state.score += config.hitScore || 5;
        pulse(shot.x, shot.y, palette.amber);
        if (boss.hp <= 0) killBoss();
      }
      state.items.forEach((item) => {
        if (!item.dead && item.kind === "enemy" && distance(shot, item) < shot.r + item.r) {
          item.dead = true;
          shot.dead = true;
          state.score += config.hitScore || 5;
          pulse(item.x, item.y, palette.teal);
        }
      });
    });
    state.shots = state.shots.filter((shot) => !shot.dead && shot.x > -30 && shot.x < state.w + 30 && shot.y > -40 && shot.y < state.h + 40);
  }

  // ---- boss ---------------------------------------------------------------------------
  // Each pattern is a volley emitter plus how long it runs and how often it fires. The boss
  // walks its configured list in order, resting between them, so the fight reads as phases
  // rather than one continuous spray - the rests are where the player gets damage in.
  const BOSS_PATTERNS = {
    // wide fan straight down: punishes sitting directly under the boss
    fan: {
      duration: 150, interval: 30, rest: 45,
      fire(b) {
        const n = 7;
        const spread = 1.5;
        for (let i = 0; i < n; i += 1) {
          const a = Math.PI / 2 - spread / 2 + (spread * i) / (n - 1);
          foeShot(b.x, b.y + b.h * 0.22, a, 3.1);
        }
      },
    },
    // full ring: forces the player off the centre line entirely
    ring: {
      duration: 140, interval: 44, rest: 50,
      fire(b) {
        const n = 14;
        b.spin += 0.22;
        for (let i = 0; i < n; i += 1) foeShot(b.x, b.y, b.spin + (Math.PI * 2 * i) / n, 2.7);
      },
    },
    // three rounds aimed at where the player is standing - the one that actually chases
    aimed: {
      duration: 140, interval: 24, rest: 40,
      fire(b) {
        const base = Math.atan2(state.player.y - b.y, state.player.x - b.x);
        [-0.17, 0, 0.17].forEach((d) => foeShot(b.x, b.y + b.h * 0.18, base + d, 4, palette.amber));
      },
    },
    // slow twin spiral: the safe pockets drift, so standing still stops working
    spiral: {
      duration: 200, interval: 5, rest: 55,
      fire(b) {
        b.spin += 0.41;
        foeShot(b.x, b.y, b.spin, 2.6);
        foeShot(b.x, b.y, b.spin + Math.PI, 2.6);
      },
    },
    // a wall across the screen with one gap: read the gap, get to it
    sweep: {
      duration: 170, interval: 48, rest: 55,
      fire(b) {
        const cols = 9;
        const gap = Math.floor(rand(0, cols));
        for (let i = 0; i < cols; i += 1) {
          if (i === gap) continue;
          foeShot(22 + ((state.w - 44) * i) / (cols - 1), b.y, Math.PI / 2, 3.2, palette.violet);
        }
      },
    },
  };

  function bossConfig(stage) {
    return (config.bosses || [])[stage] || null;
  }

  function spawnBoss(stage) {
    const cfg = bossConfig(stage);
    const sprite = bossSprites[stage];
    const h = (cfg.height || 190) * state.spriteScale;
    const ratio = sprite && sprite.naturalWidth ? sprite.naturalWidth / sprite.naturalHeight : 1;
    const w = h * ratio;
    state.boss = {
      stage, cfg, sprite, w, h,
      x: state.w / 2,
      y: -h * 0.6,
      r: Math.min(w, h) * 0.38,
      hp: cfg.hp || 60,
      maxHp: cfg.hp || 60,
      entering: true,
      dying: 0,
      spin: rand(0, Math.PI * 2),
      drift: 0,
      pattern: 0,
      patternT: 0,
      shotT: 40,
      hitFlash: 0,
    };
    state.stageBanner = 130;
  }

  function updateBoss() {
    const b = state.boss;
    if (!b) return;
    b.hitFlash = Math.max(0, b.hitFlash - 1);

    if (b.dying > 0) {
      b.dying -= 1;
      if (b.dying % 4 === 0) {
        pulse(b.x + rand(-b.w * 0.4, b.w * 0.4), b.y + rand(-b.h * 0.4, b.h * 0.4),
          b.dying % 8 === 0 ? palette.amber : palette.red);
      }
      if (b.dying === 0) {
        state.bossCleared[b.stage] = true;
        state.boss = null;
      }
      return;
    }

    const restY = state.h * 0.24;
    if (b.entering) {
      b.y += 1.7 * state.spriteScale;
      if (b.y >= restY) { b.y = restY; b.entering = false; }
      return;
    }

    // a slow sweep across the arena, so the boss can never simply be parked under and held
    b.drift += 0.011;
    b.x = state.w / 2 + Math.sin(b.drift) * Math.max(0, state.w * 0.5 - b.w * 0.5 - 10);
    b.y = restY + Math.sin(b.drift * 1.7) * 14 * state.spriteScale;

    const names = b.cfg.patterns || ["fan", "aimed", "ring"];
    const pattern = BOSS_PATTERNS[names[b.pattern % names.length]] || BOSS_PATTERNS.fan;
    b.patternT += 1;
    b.shotT -= 1;
    if (b.shotT <= 0 && b.patternT <= pattern.duration) {
      b.shotT = pattern.interval;
      pattern.fire(b);
    }
    if (b.patternT >= pattern.duration + (pattern.rest || 45)) {
      b.pattern += 1;
      b.patternT = 0;
      b.shotT = 22;
    }

    if (playerOverlaps(b, b.r * 0.72 + playerReach())) hurtPlayer(state.player.x, state.player.y);
  }

  function killBoss() {
    const b = state.boss;
    b.dying = 56;
    state.score += b.cfg.score || 300;
    // clearing the screen on the kill is the genre convention, and without it the last
    // volley keeps killing the player through a fight they have already won
    state.foeShots = [];
  }

  function playerAirborne() {
    return config.type === "runner" && state.player.y < state.h - 65;
  }

  let lastDrawnFrame = null;

  function activePlayerSprite() {
    if (playerJumpSprite && playerAirborne() && playerJumpSprite.naturalWidth) return playerJumpSprite;
    if (playerRunSprites.length) {
      const rate = config.playerFrameRate || 7;
      const frame = playerRunSprites[Math.floor(state.t / rate) % playerRunSprites.length];
      // the frames arrive one at a time, so hold the last decoded one instead of dropping
      // to the vector fallback for the odd frame - alternating between the two read as a
      // second character flickering on top of the ninja
      if (frame.naturalWidth) lastDrawnFrame = frame;
      return lastDrawnFrame || frame;
    }
    return playerSprite;
  }

  function spriteCollisionRadius(sprite, targetHeight, fallbackR) {
    if (sprite && sprite.naturalWidth && targetHeight) {
      const drawW = targetHeight * (sprite.naturalWidth / sprite.naturalHeight);
      return Math.min(drawW, targetHeight) * 0.5;
    }
    return fallbackR;
  }

  function updateItems() {
    const playerCollisionR = config.playerCollisionRadius
      || spriteCollisionRadius(activePlayerSprite(), config.playerSpriteHeight && config.playerSpriteHeight * state.spriteScale, state.player.r);
    state.items.forEach((item) => {
      if (config.type === "arena" && item.kind === "enemy") {
        const angle = Math.atan2(state.player.y - item.y, state.player.x - item.x);
        item.vx = Math.cos(angle) * (config.enemySpeed || 1.7) * state.spriteScale;
        item.vy = Math.sin(angle) * (config.enemySpeed || 1.7) * state.spriteScale;
        if (Math.abs(item.vx) > 0.15) item.facing = item.vx < 0 ? -1 : 1;
      }
      item.x += item.vx;
      item.y += item.vy;
      item.life = item.life == null ? item.life : item.life - 1;
      if (item.kind === "enemy" && !item.dead) enemyFire(item);

      if (item.kind === "pickup") {
        if (playerOverlaps(item, item.r + playerCollisionR)) collectPickup(item);
      } else if (item.kind === "laser") {
        const hit = item.vertical
          ? Math.abs(state.player.x - item.x) < 16 && Math.abs(state.player.y - item.y) < 90
          : Math.abs(state.player.y - item.y) < 16 && Math.abs(state.player.x - item.x) < 90;
        if (hit) hurt(item);
      } else {
        const itemCollisionR = item.kind === "enemy" && enemySprites.length
          ? spriteCollisionRadius(enemySprites[item.spriteIndex || 0], config.enemySpriteHeight && config.enemySpriteHeight * state.spriteScale, item.r)
          : item.r;
        if (playerOverlaps(item, itemCollisionR + playerCollisionR)) hurt(item);
      }

      if (config.type === "defender" && item.x < 34) {
        hurt(item);
      }
    });
    state.items = state.items.filter((item) => !item.dead && item.life !== 0 && item.x > -120 && item.x < state.w + 140 && item.y > -140 && item.y < state.h + 140);
  }

  function enemyFire(item) {
    const cfg = config.enemyFire;
    // only shoot from on screen and from above the player's half, so nothing is hit by a
    // bullet whose source it never had a chance to see
    if (!cfg || item.y < 8 || item.y > state.h * 0.66) return;
    const rate = cfg.rate || 110;
    // stagger the first shot per enemy, or a wave that spawns together fires as one wall
    if (item.fireCd == null) item.fireCd = Math.floor(rand(rate * 0.35, rate));
    item.fireCd -= 1;
    if (item.fireCd > 0) return;
    item.fireCd = Math.round(rate * rand(0.8, 1.25));
    const angle = cfg.aim === false
      ? Math.PI / 2
      : Math.atan2(state.player.y - item.y, state.player.x - item.x) + rand(-0.09, 0.09);
    foeShot(item.x, item.y + item.r * 0.4, angle, cfg.speed || 3.2, cfg.color);
  }

  function playerOverlaps(item, reach) {
    const p = state.player;
    const bodyH = (config.playerBodyHeight || 0) * state.spriteScale;
    if (!bodyH) return distance(item, p) < reach;
    // measure against the whole standing body, not just a dot at the feet, so a hazard
    // at chest or head height is judged by where it actually passes the sprite
    const cy = Math.max(p.y - bodyH, Math.min(p.y, item.y));
    return Math.hypot(item.x - p.x, item.y - cy) < reach;
  }

  function updateEffects() {
    state.effects.forEach((effect) => (effect.life -= 1));
    state.effects = state.effects.filter((effect) => effect.life > 0);
  }

  function hurt(item) {
    if (item.dead) return;
    item.dead = true;
    hurtPlayer(item.x, item.y);
  }

  function hurtPlayer(x, y) {
    // without an invulnerability window a bullet stream or a boss body you are touching
    // drains the whole health bar in a handful of frames, with nothing the player can do
    if (state.invuln > 0) return;
    if (state.shieldTimer > 0) {
      pulse(x, y, palette.teal);
      return;
    }
    state.health -= 1;
    state.invuln = config.hitInvuln || 0;
    // a hit costs the whole gun, not a notch of it - that is what makes a powered-up run
    // worth protecting instead of something you drift back up to
    if (config.weapon && state.weapon > 1) setWeapon(1, palette.red);
    pulse(x, y, palette.red);
    if (state.health <= 0) state.over = true;
  }

  function draw() {
    ctx.clearRect(0, 0, state.w, state.h);
    drawBackground();
    if (config.type === "defender") drawCastle();
    state.items.forEach(drawItem);
    drawBoss();
    state.shots.forEach(drawShot);
    state.foeShots.forEach(drawFoeShot);
    drawPlayer();
    state.effects.forEach(drawEffect);
    if (state.bombFlash > 0) drawBombBlast();
    if (state.hitFlash > 0) {
      ctx.fillStyle = `rgba(240,50,50,${(state.hitFlash / 18) * 0.35})`;
      ctx.fillRect(0, 0, state.w, state.h);
    }
    if (state.powerNote) drawPowerNote();
    if (state.stageBanner > 0) drawStageBanner();
    drawBossBar();
    if (state.over) drawGameOver();
  }

  function stageCode(i) {
    return (config.stageCodes || [])[i] || String(i + 1);
  }

  function advanceStage() {
    if (config.stageAdvance === "scroll") {
      advanceStageByScroll();
      return;
    }
    const per = config.stageScore || 600;
    const next = Math.min(bgStages.length - 1, Math.floor(state.score / per));
    if (next !== state.stage) {
      state.prevStage = state.stage;
      state.stage = next;
      state.stageFade = 1;
      state.stageBanner = 110;
      loadStage(state.stage + 1);
      if (stageEl) stageEl.textContent = stageCode(state.stage);
    }
    // hold the cross-fade until the incoming art has actually decoded
    if (state.stageFade > 0 && spriteReady(bgStages[state.stage])) {
      state.stageFade = Math.max(0, state.stageFade - 0.016);
    }
    if (state.stageBanner > 0) state.stageBanner -= 1;
  }

  // how far a backdrop scrolls before the next scene takes over: the ship starts on the foot
  // of the art and hands over the moment its head reaches the top of the screen, so the whole
  // painting is flown through exactly once and the wrap-around seam is never on screen. A
  // backdrop no taller than the canvas has no travel to give, so it falls back to a full height
  function stageTravel(img) {
    const drawH = coverSize(img).drawH;
    return drawH > state.h ? drawH - state.h : drawH;
  }

  function advanceStageByScroll() {
    const cur = bgStages[state.stage];
    if (cur && cur.naturalWidth) {
      const travel = stageTravel(cur);
      if (state.scroll - state.stageScrollStart >= travel) {
        if (bossConfig(state.stage) && !state.bossCleared[state.stage]) {
          // the stage ends in a boss: hold here, with the backdrop parked on the head of the
          // art, until it is down. Beating it lets this same branch fall through next frame.
          // Snap the scroll back to the hand-off point first - a frame can overshoot it, and
          // whatever it overshoots by is the wrap seam left showing for the whole fight
          if (!state.boss) {
            state.scroll = state.stageScrollStart + travel;
            spawnBoss(state.stage);
          }
        } else if (state.stage < bgStages.length - 1) {
          handOffStage(travel);
        }
      }
    }
    if (state.stageFade > 0 && spriteReady(bgStages[state.stage])) {
      state.stageFade = Math.max(0, state.stageFade - 0.016);
    }
    if (state.stageBanner > 0) state.stageBanner -= 1;
  }

  function handOffStage(travel) {
    // the outgoing backdrop isn't a seamless tile, so freeze it on its final offset - the top
    // of the art - instead of letting it keep advancing. Past this point it would wrap round
    // to the foot of the art mid cross-fade, a visible jump-cut
    state.prevScrollFreeze = travel;
    state.stageScrollStart += travel;
    state.prevStage = state.stage;
    state.stage += 1;
    state.stageFade = 1;
    state.stageBanner = 110;
    loadStage(state.stage + 1);
    if (stageEl) stageEl.textContent = stageCode(state.stage);
  }

  function drawStageBackdrop() {
    const prev = bgStages[state.prevStage];
    const cur = bgStages[state.stage];
    const prevReady = spriteReady(prev);
    const curReady = spriteReady(cur);
    if (!prevReady && !curReady) {
      const grd = ctx.createLinearGradient(0, 0, state.w, state.h);
      grd.addColorStop(0, config.bgA || "#151820");
      grd.addColorStop(1, config.bgB || "#22262e");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, state.w, state.h);
    }
    // the outgoing (prev) backdrop uses a scroll position frozen at hand-off - it isn't a
    // seamless tile, so letting it keep scrolling here would wrap it from the bottom of the
    // art back to the top mid cross-fade
    const paint = (img, scrollOffset) => config.bgFit === "ground"
      ? drawBgImageGround(img)
      : drawBgImageCover(img, config.scrollBg ? scrollOffset : undefined);
    if (prevReady && (state.stageFade > 0 || !curReady)) paint(prev, state.prevScrollFreeze);
    if (curReady) {
      ctx.globalAlpha = prevReady ? 1 - state.stageFade : 1;
      paint(cur, state.scroll - state.stageScrollStart);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = config.bgTint || "rgba(8,9,12,.3)";
    ctx.fillRect(0, 0, state.w, state.h);
    if (config.type === "runner") {
      ctx.fillStyle = "rgba(6,7,10,.35)";
      ctx.fillRect(0, state.h - 58, state.w, 58);
      ctx.fillStyle = "rgba(255,255,255,.07)";
      ctx.fillRect(0, state.h - 60, state.w, 2);
    }
  }

  function drawStageBanner() {
    const alpha = Math.min(1, state.stageBanner / 26);
    if (state.boss) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.fillStyle = palette.red;
      ctx.font = "800 22px system-ui";
      ctx.fillText(config.bossLabel || "WARNING", state.w / 2, 96);
      ctx.fillStyle = palette.text;
      ctx.font = "600 14px system-ui";
      ctx.fillText(state.boss.cfg.name || "BOSS", state.w / 2, 118);
      ctx.restore();
      return;
    }
    const label = (config.stageNames || [])[state.stage];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.fillStyle = palette.amber;
    ctx.font = "800 22px system-ui";
    ctx.fillText(`${config.stageLabel || "Stage"} ${stageCode(state.stage)}`, state.w / 2, 96);
    if (label) {
      ctx.fillStyle = palette.text;
      ctx.font = "600 14px system-ui";
      ctx.fillText(label, state.w / 2, 118);
    }
    ctx.restore();
  }

  function drawBackground() {
    if (bgStages.length) {
      drawStageBackdrop();
      if (config.gridOverlay !== false) drawGridOverlay();
      return;
    }
    if (spriteReady(bgImage)) {
      drawBgImageCover(bgImage, config.scrollBg ? state.scroll : undefined);
      ctx.fillStyle = "rgba(8,9,12,.4)";
      ctx.fillRect(0, 0, state.w, state.h);
    } else {
      const grd = ctx.createLinearGradient(0, 0, state.w, state.h);
      grd.addColorStop(0, config.bgA || "#151820");
      grd.addColorStop(1, config.bgB || "#22262e");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, state.w, state.h);
      drawScene(sceneName());
    }
    if (config.gridOverlay !== false) drawGridOverlay();
  }

  function drawBgImageGround(img) {
    // fill the canvas edge to edge, cropping whatever overflows. Unlike a plain cover fit
    // the artwork is pinned to the bottom rather than centred, so the painted ground stays
    // on the runner's ground line however tall the screen gets - it is the sky that is lost
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const drawW = Math.max(state.w, state.h * imgRatio);
    const drawH = drawW / imgRatio;
    ctx.drawImage(img, (state.w - drawW) / 2, state.h - drawH, drawW, drawH);
  }

  function coverSize(img) {
    const canvasRatio = state.w / state.h;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    if (imgRatio > canvasRatio) return { drawW: state.h * imgRatio, drawH: state.h };
    return { drawW: state.w, drawH: state.w / imgRatio };
  }

  function drawBgImageCover(img, scrollOffset) {
    const { drawW, drawH } = coverSize(img);
    const x = (state.w - drawW) / 2;
    if (scrollOffset == null) {
      ctx.drawImage(img, x, (state.h - drawH) / 2, drawW, drawH);
      return;
    }
    // offset 0 parks the BOTTOM of the art on the bottom of the screen, so a stage opens on
    // the foot of its backdrop and the ship then "flies" up through it. Anchoring to the top
    // instead would open mid-artwork on a cropped slice and jump on the very next frame.
    // The art isn't a seamless tile, so it wraps once per drawH scrolled - stages hand over
    // before that (see stageTravel), so the seam only shows on the last stage, which runs on.
    const offset = ((scrollOffset % drawH) + drawH) % drawH;
    let y = state.h - drawH + offset;
    while (y > 0) y -= drawH;
    for (; y < state.h; y += drawH) ctx.drawImage(img, x, y, drawW, drawH);
  }

  function sceneName() {
    const title = (config.title || "").toLowerCase();
    if (title.includes("space")) return "space";
    if (title.includes("meteor")) return "meteor";
    if (title.includes("zombie")) return "ruinedCity";
    if (title.includes("ninja")) return "dojo";
    if (title.includes("robot")) return "factory";
    if (title.includes("arrow")) return "range";
    if (title.includes("monster")) return "cave";
    if (title.includes("laser")) return "lab";
    if (title.includes("castle")) return "castle";
    if (title.includes("bomb")) return "bomb";
    return config.pattern || config.type;
  }

  function drawScene(scene) {
    if (scene === "space" || scene === "meteor") drawSpaceScene(scene === "meteor");
    else if (scene === "ruinedCity") drawRuinedCityScene();
    else if (scene === "dojo") drawDojoScene();
    else if (scene === "factory") drawFactoryScene();
    else if (scene === "range") drawRangeScene();
    else if (scene === "cave") drawCaveScene();
    else if (scene === "lab") drawLabScene();
    else if (scene === "castle") drawCastleScene();
    else if (scene === "bomb") drawBombScene();
  }

  function drawGridOverlay() {
    ctx.strokeStyle = "rgba(255,255,255,.045)";
    for (let x = (state.t % 40) - 40; x < state.w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 80, state.h);
      ctx.stroke();
    }
  }

  function drawSpaceScene(withRocks) {
    ctx.fillStyle = "rgba(255,255,255,.72)";
    for (let i = 0; i < 46; i += 1) {
      const x = (i * 83 + state.t * (0.25 + (i % 4) * 0.08)) % state.w;
      const y = (i * 47 + state.t * (0.45 + (i % 5) * 0.06)) % state.h;
      circle(x, y, i % 7 === 0 ? 2.1 : 1.1);
    }
    ctx.fillStyle = "rgba(43,209,196,.12)";
    circle(state.w * 0.78, state.h * 0.18, Math.min(state.w, state.h) * 0.18);
    if (!withRocks) return;
    ctx.fillStyle = "rgba(247,184,75,.18)";
    for (let i = 0; i < 8; i += 1) {
      const x = (i * 137 - state.t * 0.8) % (state.w + 120);
      const y = (i * 61 + state.t * 0.5) % state.h;
      path([x, y - 12, x + 18, y - 4, x + 12, y + 16, x - 14, y + 9, x - 20, y - 6]);
    }
  }

  function drawRuinedCityScene() {
    drawGround("#17181b");

    ctx.fillStyle = "rgba(20,22,28,.6)";
    for (let x = -30; x < state.w + 60; x += 78) {
      const h = 46 + ((x / 78) % 4) * 16;
      ctx.fillRect(x, 0, 54, h);
    }
    ctx.fillStyle = "rgba(247,184,75,.09)";
    for (let x = -30; x < state.w + 60; x += 78) {
      const h = 46 + ((x / 78) % 4) * 16;
      for (let wy = 8; wy < h - 8; wy += 14) {
        for (let wx = x + 8; wx < x + 46; wx += 12) {
          if (Math.floor(wx + wy) % 5 !== 0) ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }

    ctx.strokeStyle = "rgba(244,242,234,.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, state.h - 30);
    for (let x = 0; x <= state.w; x += 30) ctx.lineTo(x, state.h - 30 + Math.sin(x * 0.12) * 5);
    ctx.stroke();

    [0.14, 0.5, 0.84].forEach((frac, i) => {
      ctx.save();
      ctx.translate(state.w * frac, state.h - 40);
      ctx.rotate(i % 2 === 0 ? -0.16 : 0.2);
      ctx.fillStyle = "rgba(90,44,40,.45)";
      roundRect(-24, -13, 48, 22, 6);
      ctx.fillStyle = "rgba(15,15,16,.5)";
      circle(-14, 9, 6);
      circle(14, 9, 6);
      ctx.restore();
    });

    ctx.fillStyle = "rgba(90,88,82,.3)";
    for (let i = 0; i < 9; i += 1) {
      const x = (i * 97 + 30) % state.w;
      const y = state.h - 18 - (i % 3) * 5;
      path([x, y - 5, x + 9, y - 2, x + 4, y + 5, x - 7, y + 3]);
    }

    ctx.fillStyle = "rgba(240,93,94,.14)";
    circle(state.w * 0.24, state.h * 0.6, 42);
    ctx.fillStyle = "rgba(247,184,75,.1)";
    circle(state.w * 0.78, state.h * 0.42, 34);
  }

  function drawDojoScene() {
    drawGround("#1c1812");
    ctx.fillStyle = "rgba(247,184,75,.1)";
    for (let x = -40; x < state.w; x += 86) {
      ctx.fillRect(x, 72, 26, state.h - 128);
    }
    ctx.strokeStyle = "rgba(240,93,94,.22)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, state.h * 0.34);
    ctx.lineTo(state.w, state.h * 0.28);
    ctx.stroke();
  }

  function drawFactoryScene() {
    drawGround("#171a20");
    ctx.fillStyle = "rgba(169,139,255,.14)";
    for (let x = 28; x < state.w; x += 104) {
      roundRect(x, state.h - 178, 54, 118, 5);
      ctx.fillRect(x + 18, state.h - 224, 18, 46);
    }
    ctx.strokeStyle = "rgba(43,209,196,.18)";
    ctx.lineWidth = 2;
    for (let y = 70; y < state.h - 70; y += 54) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y + Math.sin((state.t + y) * 0.015) * 18);
      ctx.stroke();
    }
  }

  function drawRangeScene() {
    drawGround("#24181a");
    ctx.strokeStyle = "rgba(247,184,75,.18)";
    ctx.lineWidth = 3;
    for (let y = 70; y < state.h - 50; y += 70) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y - 30);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(240,93,94,.12)";
    for (let x = state.w - 80; x > 0; x -= 150) {
      circle(x, state.h * 0.5, 34);
      ctx.fillStyle = "rgba(244,242,234,.12)";
      circle(x, state.h * 0.5, 18);
      ctx.fillStyle = "rgba(240,93,94,.12)";
    }
  }

  function drawCaveScene() {
    drawGround("#1f1420");
    ctx.fillStyle = "rgba(0,0,0,.18)";
    for (let x = 0; x < state.w; x += 74) {
      path([x, 0, x + 28, 0, x + 16, 56 + (x % 4) * 12]);
      path([x + 18, state.h, x + 54, state.h, x + 38, state.h - 68 - (x % 5) * 9]);
    }
    ctx.fillStyle = "rgba(240,93,94,.14)";
    circle(state.w * 0.2, state.h * 0.24, 42);
  }

  function drawLabScene() {
    drawGround("#071c22");
    ctx.strokeStyle = "rgba(43,209,196,.18)";
    ctx.lineWidth = 2;
    for (let x = 40; x < state.w; x += 82) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x + Math.sin((state.t + x) * 0.02) * 24, state.h - 58);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(115,214,118,.1)";
    for (let x = 68; x < state.w; x += 160) roundRect(x, 78, 54, 90, 10);
  }

  function drawCastleScene() {
    drawGround("#1c2117");
    ctx.fillStyle = "rgba(244,242,234,.1)";
    for (let x = 74; x < state.w; x += 118) {
      roundRect(x, state.h - 170, 62, 110, 8);
      ctx.fillRect(x - 8, state.h - 186, 16, 22);
      ctx.fillRect(x + 23, state.h - 190, 16, 26);
      ctx.fillRect(x + 52, state.h - 186, 16, 22);
    }
    ctx.fillStyle = "rgba(247,184,75,.12)";
    circle(state.w * 0.72, state.h * 0.18, 44);
  }

  function drawBombScene() {
    drawGround("#261b10");
    ctx.fillStyle = "rgba(247,184,75,.13)";
    for (let x = 24; x < state.w; x += 86) {
      ctx.fillRect(x - ((state.t * 2) % 86), state.h - 82, 42, 10);
      ctx.fillRect(x + 22 - ((state.t * 2) % 86), state.h - 62, 42, 10);
    }
    ctx.fillStyle = "rgba(240,93,94,.16)";
    for (let x = 80; x < state.w; x += 180) circle(x, state.h - 92, 18);
  }

  function drawGround(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, state.h - 58, state.w, 58);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fillRect(0, state.h - 60, state.w, 2);
  }

  // Sprites sit on painted backdrops that swing from near-black interiors to bright fire and
  // pale sky, so no single outline colour separates them everywhere - a light rim vanishes on
  // the sky, a dark one vanishes at night. Each sprite gets both: a light rim for the dark
  // ground, and a soft dark halo outside it for the bright. Opt in with config.spriteOutline.
  const RIM_RING = [[1,0],[-1,0],[0,1],[0,-1],[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]];
  const outlineCache = new Map();

  // An <img> reports naturalWidth the moment the PNG header lands - seconds before the pixels
  // do on a slow connection - so it says the size is known, NOT that the art can be drawn.
  // complete is the real signal. Drawing too early is only a blank frame, but *baking* too
  // early and caching the result leaves that sprite invisible for the whole session.
  function spriteReady(img) {
    return !!(img && img.complete && img.naturalWidth);
  }

  // cheap "did anything land on this canvas" test: squash it to 16x16 and look for any alpha
  function canvasIsEmpty(source) {
    const probe = document.createElement("canvas");
    probe.width = 16;
    probe.height = 16;
    const g = probe.getContext("2d");
    g.drawImage(source, 0, 0, 16, 16);
    const { data } = g.getImageData(0, 0, 16, 16);
    for (let i = 3; i < data.length; i += 4) if (data[i]) return false;
    return true;
  }

  const silhouetteCache = new Map();
  function silhouette(img, color) {
    const key = `${img.src}|${color}`;
    const hit = silhouetteCache.get(key);
    if (hit) return hit;
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    silhouetteCache.set(key, c);
    return c;
  }

  // rim + halo + art baked into one canvas, so the per-frame cost stays a single drawImage
  // rather than nine plus a shadow blur. Keyed by draw height because the rim is specified in
  // screen pixels and has to be pre-scaled into the source image's own resolution.
  function outlinedSprite(img, drawH) {
    const key = `${img.src}|${Math.round(drawH)}`;
    const hit = outlineCache.get(key);
    if (hit) return hit;
    if (!spriteReady(img)) return null;
    const toSource = img.naturalHeight / drawH;
    const rim = (config.spriteOutline || 0) * toSource;
    const blur = (config.spriteHalo == null ? 7 : config.spriteHalo) * toSource;
    const pad = Math.ceil(rim + blur) + 1;
    const c = document.createElement("canvas");
    c.width = img.naturalWidth + pad * 2;
    c.height = img.naturalHeight + pad * 2;
    const g = c.getContext("2d");
    const dark = silhouette(img, "#000");
    if (blur > 0) {
      g.save();
      g.shadowColor = config.spriteHaloColor || "rgba(0,0,0,.8)";
      g.shadowBlur = blur;
      // repeated passes so the halo builds to a readable density against bright art
      for (let i = 0; i < 3; i += 1) g.drawImage(dark, pad, pad);
      g.restore();
    }
    if (rim > 0) {
      const light = silhouette(img, config.spriteOutlineColor || "#f4f2ea");
      RIM_RING.forEach(([dx, dy]) => g.drawImage(light, pad + dx * rim, pad + dy * rim));
    }
    g.drawImage(img, pad, pad);
    // never cache a bake that came out blank - retrying next frame costs one frame, caching
    // it costs the rest of the session
    if (canvasIsEmpty(c)) return null;
    const out = { canvas: c, pad };
    outlineCache.set(key, out);
    return out;
  }

  // call only with a spriteReady image. outlinedSprite still declines on a blank bake, and
  // the plain draw below is the correct output in that case, not a degraded one
  function drawSprite(img, x, y, w, h) {
    const baked = config.spriteOutline ? outlinedSprite(img, h) : null;
    if (!baked) {
      ctx.drawImage(img, x, y, w, h);
      return;
    }
    const px = baked.pad * (w / img.naturalWidth);
    const py = baked.pad * (h / img.naturalHeight);
    ctx.drawImage(baked.canvas, x - px, y - py, w + px * 2, h + py * 2);
  }

  function drawPlayer() {
    const p = state.player;
    // blink through the invulnerability window so the player can see the grace period is on
    if (state.invuln > 0 && Math.floor(state.t / 4) % 2 === 0) return;
    if (state.shieldTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(43,209,196,.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (config.playerSpriteHeight ? config.playerSpriteHeight * 0.4 : p.r + 10) * state.spriteScale + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    const sprite = activePlayerSprite();
    if (spriteReady(sprite)) {
      const drawH = (config.playerSpriteHeight || p.r * 3.6) * state.spriteScale;
      const drawW = drawH * (sprite.naturalWidth / sprite.naturalHeight);
      const artFacesRight = config.playerSpriteFacesRight ? -1 : 1;
      ctx.scale(p.facing === 1 ? -artFacesRight : artFacesRight, 1);
      drawSprite(sprite, -drawW / 2, -drawH * (config.playerSpriteAnchor || 0.62), drawW, drawH);
      ctx.restore();
      return;
    }
    ctx.fillStyle = config.playerColor || palette.teal;
    if (config.playerShape === "ship") {
      path([0, -22, 16, 18, 0, 10, -16, 18]);
    } else if (config.playerShape === "ninja") {
      ctx.fillRect(-14, -22, 28, 34);
      ctx.fillStyle = palette.text;
      ctx.fillRect(-10, -14, 20, 5);
    } else if (config.playerShape === "car") {
      roundRect(-16, -24, 32, 48, 7);
    } else {
      circle(0, 0, p.r);
    }
    ctx.restore();
  }

  function drawItem(item) {
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.kind === "laser") {
      ctx.fillStyle = palette.red;
      if (item.vertical) roundRect(-8, -88, 16, 176, 8);
      else roundRect(-88, -8, 176, 16, 8);
      ctx.restore();
      return;
    }
    if (item.kind === "hazard" && spriteReady(hazardSprite)) {
      const size = config.hazardSpriteSize || item.r * 2.4;
      ctx.rotate(state.t * (config.hazardSpin || 0.22) + (item.spin || 0));
      ctx.drawImage(hazardSprite, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }
    if (item.kind === "pickup") {
      const r = item.r;
      const beat = 1 + Math.sin(state.t * 0.12) * 0.07;
      const tone = item.power === "heal" ? palette.green : item.power === "power" ? palette.violet : palette.amber;
      const ring = item.power === "heal" ? "rgba(115,214,118,.5)"
        : item.power === "power" ? "rgba(169,139,255,.55)" : "rgba(247,184,75,.5)";
      // a ring that breathes: a pickup has to read as "collect me" at a glance, against art
      // that is already full of round bright shapes
      ctx.strokeStyle = ring;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * beat + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(6,7,12,.6)";
      circle(0, 0, r + 2.5);
      ctx.fillStyle = tone;
      circle(0, 0, r);
      ctx.fillStyle = "#0b0c0f";
      if (item.power === "heal") {
        ctx.fillRect(-r * 0.52, -r * 0.17, r * 1.04, r * 0.34);
        ctx.fillRect(-r * 0.17, -r * 0.52, r * 0.34, r * 1.04);
      } else if (item.power === "power") {
        // an arrow pointing up: the gun getting bigger, not another life and not another bomb
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.64);
        ctx.lineTo(r * 0.62, r * 0.06);
        ctx.lineTo(r * 0.26, r * 0.06);
        ctx.lineTo(r * 0.26, r * 0.6);
        ctx.lineTo(-r * 0.26, r * 0.6);
        ctx.lineTo(-r * 0.26, r * 0.06);
        ctx.lineTo(-r * 0.62, r * 0.06);
        ctx.closePath();
        ctx.fill();
      } else {
        circle(0, r * 0.14, r * 0.44);
        ctx.fillRect(-r * 0.09, -r * 0.66, r * 0.18, r * 0.46);
      }
      ctx.restore();
      return;
    }
    if (item.kind === "enemy" && enemySprites.length) {
      const sprite = enemySprites[item.spriteIndex || 0];
      if (spriteReady(sprite)) {
        const drawH = (config.enemySpriteHeight || item.r * 3.4) * state.spriteScale;
        const drawW = drawH * (sprite.naturalWidth / sprite.naturalHeight);
        ctx.scale(item.facing === 1 ? -1 : 1, 1);
        drawSprite(sprite, -drawW / 2, -drawH * 0.62, drawW, drawH);
        ctx.restore();
        return;
      }
    }
    ctx.fillStyle = item.kind === "enemy" ? config.enemyColor || palette.red : config.hazardColor || palette.amber;
    if (config.enemyShape === "zombie") {
      circle(0, 0, item.r);
      ctx.fillStyle = palette.green;
      ctx.fillRect(-12, -4, 24, 8);
    } else if (config.enemyShape === "robot") {
      roundRect(-item.r, -item.r, item.r * 2, item.r * 2, 5);
      ctx.fillStyle = palette.text;
      ctx.fillRect(-8, -4, 16, 5);
    } else if (config.enemyShape === "meteor") {
      path([0, -item.r, item.r, -4, item.r * 0.5, item.r, -item.r * 0.8, item.r * 0.6, -item.r, -item.r * 0.4]);
    } else if (config.enemyShape === "arrow") {
      const direction = item.vx < 0 ? -1 : 1;
      ctx.scale(direction, 1);
      path([item.r, 0, -item.r, -8, -item.r * 0.4, 0, -item.r, 8]);
    } else if (config.enemyShape === "bomb") {
      circle(0, 0, item.r);
      ctx.fillStyle = palette.red;
      ctx.fillRect(-3, -item.r - 8, 6, 10);
    } else {
      circle(0, 0, item.r);
    }
    ctx.restore();
  }

  function drawShot(shot) {
    // a dark collar first - over the fires and floodlights in the backdrops a plain bright
    // dot disappears exactly when the screen is busiest
    ctx.fillStyle = "rgba(6,7,12,.45)";
    circle(shot.x, shot.y, shot.r + 2);
    ctx.fillStyle = shot.color || palette.teal;
    circle(shot.x, shot.y, shot.r);
  }

  // the power level changing is the one number the player must not miss, and the HUD sits off
  // the canvas - so say it once, over the ship, in the colour of what just happened
  function drawPowerNote() {
    const note = state.powerNote;
    ctx.save();
    ctx.globalAlpha = Math.min(1, note.life / 22);
    ctx.textAlign = "center";
    ctx.font = "700 17px system-ui, sans-serif";
    const y = state.player.y - 54 * state.spriteScale - (52 - note.life) * 0.35;
    ctx.fillStyle = "rgba(6,7,12,.65)";
    ctx.fillText(note.text, state.player.x, y + 1.5);
    ctx.fillStyle = note.color;
    ctx.fillText(note.text, state.player.x, y);
    ctx.restore();
  }

  function drawBombBlast() {
    const t = state.bombFlash / 26;
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${t * 0.45})`;
    ctx.fillRect(0, 0, state.w, state.h);
    ctx.strokeStyle = `rgba(247,184,75,${t})`;
    ctx.lineWidth = 3 + 7 * t;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, (1 - t) * Math.hypot(state.w, state.h) * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawFoeShot(shot) {
    // dark collar first: over the bright fire in the backdrops a plain coloured dot vanishes,
    // and an unreadable bullet is an unfair one
    ctx.fillStyle = "rgba(6,7,12,.5)";
    circle(shot.x, shot.y, shot.r + 2.5);
    ctx.fillStyle = shot.color;
    circle(shot.x, shot.y, shot.r);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    circle(shot.x, shot.y, shot.r * 0.4);
  }

  function drawBoss() {
    const b = state.boss;
    if (!b) return;
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.dying > 0) {
      ctx.translate(rand(-4, 4), rand(-4, 4));
      ctx.globalAlpha = Math.max(0.2, b.dying / 56);
    }
    if (spriteReady(b.sprite)) {
      drawSprite(b.sprite, -b.w / 2, -b.h / 2, b.w, b.h);
      if (b.hitFlash > 0) {
        ctx.globalAlpha *= 0.55 * (b.hitFlash / 5);
        ctx.drawImage(silhouette(b.sprite, "#fff"), -b.w / 2, -b.h / 2, b.w, b.h);
      }
    } else {
      ctx.fillStyle = palette.violet;
      circle(0, 0, b.r);
    }
    ctx.restore();
  }

  function drawBossBar() {
    const b = state.boss;
    if (!b || b.entering) return;
    const pad = 16;
    const w = state.w - pad * 2;
    const frac = Math.max(0, b.hp / b.maxHp);
    ctx.fillStyle = "rgba(6,7,12,.62)";
    roundRect(pad, 12, w, 10, 5);
    if (frac > 0) {
      ctx.fillStyle = frac > 0.35 ? palette.red : palette.amber;
      roundRect(pad, 12, w * frac, 10, 5);
    }
    ctx.fillStyle = palette.text;
    ctx.textAlign = "left";
    ctx.font = "700 11px system-ui";
    ctx.fillText(b.cfg.name || "BOSS", pad + 1, 36);
    ctx.textAlign = "center";
  }

  function drawCastle() {
    ctx.fillStyle = "rgba(244,242,234,.12)";
    roundRect(10, state.h * 0.5 - 64, 48, 128, 8);
    ctx.fillStyle = palette.amber;
    ctx.fillRect(20, state.h * 0.5 - 80, 10, 18);
    ctx.fillRect(38, state.h * 0.5 - 80, 10, 18);
  }

  function drawEffect(effect) {
    ctx.globalAlpha = effect.life / 18;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.r + (18 - effect.life) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,.62)";
    ctx.fillRect(0, 0, state.w, state.h);
    ctx.fillStyle = palette.text;
    ctx.textAlign = "center";
    ctx.font = "800 34px system-ui";
    ctx.fillText(config.gameOverLabel || copy.gameOver, state.w / 2, state.h / 2 - 8);
    ctx.font = "700 18px system-ui";
    ctx.fillText(`${config.scoreLabel || copy.score} ${state.score}`, state.w / 2, state.h / 2 + 28);
  }

  function pulse(x, y, color) {
    state.effects.push({ x, y, r: 12, color, life: 18 });
  }

  function path(points) {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
    ctx.fill();
  }

  function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function detectLocale() {
    const params = new URLSearchParams(location.search);
    const direct = normalizeLocale(params.get("locale") || params.get("lang"));
    if (direct) {
      localStorage.setItem("locale", direct);
      return direct;
    }
    const saved = normalizeLocale(localStorage.getItem("locale"));
    if (saved) return saved;
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
    for (const language of languages) {
      const locale = normalizeLocale(language);
      if (locale) return locale;
    }
    return "en";
  }

  function normalizeLocale(value) {
    if (!value) return "";
    const code = String(value).trim().replace("_", "-").toLowerCase();
    if (code === "zh-tw" || code === "zh-hk" || code === "zh-mo" || code.startsWith("zh-hant")) return "zh-TW";
    if (code.startsWith("zh")) return "zh";
    if (code.startsWith("he") || code.startsWith("iw")) return "he";
    return Object.keys(GAME_I18N).find((locale) => code === locale.toLowerCase() || code.startsWith(`${locale.toLowerCase()}-`)) || "";
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  loop();
})();
