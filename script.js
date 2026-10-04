/* =========================================================
   NEXORA GAMING PORTAL
   PLAYABLE GAMES + MOBILE TOUCH CONTROLS
========================================================= */

"use strict";

/* =========================================================
   GAME DATABASE
========================================================= */

const games = [
  {
    title: "Neon Strike",
    category: "action",
    icon: "⚡",
    rating: "4.9",
    plays: "12.4K",
    cover: "cover-1",
    description: "Survive enemy waves and destroy incoming targets.",
    type: "shooter"
  },
  {
    title: "Street Rush",
    category: "racing",
    icon: "🏎️",
    rating: "4.8",
    plays: "9.8K",
    cover: "cover-2",
    description: "Avoid traffic and survive as long as possible.",
    type: "racing"
  },
  {
    title: "Mind Blocks",
    category: "puzzle",
    icon: "◇",
    rating: "4.7",
    plays: "8.2K",
    cover: "cover-3",
    description: "Match blocks and build your score.",
    type: "blocks"
  },
  {
    title: "Pixel Invaders",
    category: "arcade",
    icon: "✦",
    rating: "4.9",
    plays: "15.1K",
    cover: "cover-4",
    description: "Destroy incoming enemies in this arcade shooter.",
    type: "invaders"
  },
  {
    title: "Desert Rally",
    category: "racing",
    icon: "◈",
    rating: "4.6",
    plays: "6.7K",
    cover: "cover-5",
    description: "Drive through the desert and avoid obstacles.",
    type: "racing2"
  },
  {
    title: "Cyber Chess",
    category: "strategy",
    icon: "♟",
    rating: "4.8",
    plays: "5.9K",
    cover: "cover-6",
    description: "Play a simple chess-style strategy game.",
    type: "chess"
  },
  {
    title: "Jungle Dash",
    category: "action",
    icon: "✧",
    rating: "4.7",
    plays: "10.3K",
    cover: "cover-7",
    description: "Jump over obstacles and collect coins.",
    type: "runner"
  },
  {
    title: "Galaxy Quest",
    category: "arcade",
    icon: "◉",
    rating: "4.9",
    plays: "13.6K",
    cover: "cover-8",
    description: "Move through space and collect stars.",
    type: "galaxy"
  }
];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const grid = document.getElementById("gameGrid");
const search = document.getElementById("gameSearch");
const empty = document.getElementById("emptyState");
const filters = document.querySelectorAll(".filter");

const modal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const modalIcon = document.getElementById("modalIcon");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const modalRating = document.getElementById("modalRating");
const modalPlays = document.getElementById("modalPlays");

let currentGame = null;
let gameCanvas = null;
let gameCtx = null;

let gameAnimation = null;
let gameRunning = false;
let gamePaused = false;

let gameScore = 0;
let gameLives = 3;

let pressedKeys = {};

let touchState = {
  left: false,
  right: false,
  up: false,
  down: false,
  action: false
};


/* =========================================================
   RENDER GAMES
========================================================= */

function renderGames() {

  if (!grid) return;

  const active =
    document.querySelector(".filter.active")?.dataset.category || "all";

  const query =
    search?.value.trim().toLowerCase() || "";

  const result = games.filter(game => {

    const categoryMatch =
      active === "all" || game.category === active;

    const searchMatch =
      game.title.toLowerCase().includes(query) ||
      game.category.toLowerCase().includes(query);

    return categoryMatch && searchMatch;

  });


  grid.innerHTML = result.map((game, index) => `

    <article
      class="game-card"
      data-index="${games.indexOf(game)}"
      tabindex="0"
      style="animation-delay:${index * 45}ms"
    >

      <div class="game-cover ${game.cover}">

        <span class="game-badge">
          ${game.category.toUpperCase()}
        </span>

        <span class="game-icon">
          ${game.icon}
        </span>

      </div>

      <div class="game-info">

        <div class="game-title-row">

          <h3>${game.title}</h3>

          <span class="rating">
            ★ ${game.rating}
          </span>

        </div>

        <div class="game-meta">

          <span>
            ${game.category[0].toUpperCase() + game.category.slice(1)}
          </span>

          <span>
            ${game.plays} plays
          </span>

        </div>

        <div class="play-line">

          <span>
            Playable Game
          </span>

          <span class="play-link">
            PLAY ↗
          </span>

        </div>

      </div>

    </article>

  `).join("");


  empty.style.display =
    result.length ? "none" : "block";


  document.querySelectorAll(".game-card").forEach(card => {

    card.addEventListener("click", () => {

      openGame(
        games[Number(card.dataset.index)]
      );

    });


    card.addEventListener("keydown", event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openGame(
          games[Number(card.dataset.index)]
        );

      }

    });

  });

}


/* =========================================================
   OPEN GAME MODAL
========================================================= */

function openGame(game) {

  currentGame = game;

  if (modalTitle)
    modalTitle.textContent = game.title;

  if (modalIcon)
    modalIcon.textContent = game.icon;

  if (modalCategory)
    modalCategory.textContent =
      game.category.toUpperCase();

  if (modalDescription)
    modalDescription.textContent =
      game.description;

  if (modalRating)
    modalRating.textContent =
      game.rating;

  if (modalPlays)
    modalPlays.textContent =
      `${game.plays} plays`;


  if (modal) {

    modal.classList.add("show");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}


/* =========================================================
   CLOSE GAME
========================================================= */

function closeGame() {

  stopGame();

  if (modal) {

    modal.classList.remove("show");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

  }

}


/* =========================================================
   GAME LAUNCH
========================================================= */

function launchGame() {

  if (!currentGame) return;

  createGameScreen();

  switch (currentGame.type) {

    case "shooter":
      startShooter();
      break;

    case "racing":
      startRacing();
      break;

    case "blocks":
      startBlocks();
      break;

    case "invaders":
      startInvaders();
      break;

    case "racing2":
      startRacing();
      break;

    case "chess":
      startChess();
      break;

    case "runner":
      startRunner();
      break;

    case "galaxy":
      startGalaxy();
      break;

    default:
      startRunner();

  }

}


/* =========================================================
   CREATE GAME SCREEN
========================================================= */

function createGameScreen() {

  const old =
    document.getElementById("nexoraGameScreen");

  if (old) old.remove();


  const screen =
    document.createElement("div");

  screen.id =
    "nexoraGameScreen";

  screen.innerHTML = `

    <div class="nexora-game-window">

      <div class="nexora-game-header">

        <div>

          <strong id="runningGameTitle">
            ${currentGame.title}
          </strong>

          <span id="gameStatus">
            READY
          </span>

        </div>

        <button
          id="closeRunningGame"
          class="game-close-button"
          aria-label="Close game"
        >
          ✕
        </button>

      </div>


      <div class="nexora-game-info">

        <span>
          SCORE:
          <b id="gameScore">0</b>
        </span>

        <span>
          LIVES:
          <b id="gameLives">3</b>
        </span>

        <button id="pauseGame">
          ⏸ Pause
        </button>

        <button id="restartGame">
          ↻ Restart
        </button>

      </div>


      <div class="nexora-canvas-wrap">

        <canvas
          id="nexoraCanvas"
          width="900"
          height="520"
        ></canvas>


        <div
          id="gameMessage"
          class="nexora-game-message"
        ></div>

      </div>


      <div
        id="mobileControls"
        class="mobile-game-controls"
      >

        <div class="control-left">

          <button
            class="touch-btn"
            data-control="up"
          >
            ▲
          </button>

          <div>

            <button
              class="touch-btn"
              data-control="left"
            >
              ◀
            </button>

            <button
              class="touch-btn"
              data-control="down"
            >
              ▼
            </button>

            <button
              class="touch-btn"
              data-control="right"
            >
              ▶
            </button>

          </div>

        </div>


        <div class="control-action">

          <button
            class="touch-action"
            data-control="action"
          >
            ●
          </button>

        </div>

      </div>


      <div class="game-help-text">

        <span>
          ⌨️ Keyboard
        </span>

        <span>
          📱 Touch Controls
        </span>

        <span>
          🎮 Mobile Ready
        </span>

      </div>

    </div>

  `;


  document.body.appendChild(screen);


  gameCanvas =
    document.getElementById(
      "nexoraCanvas"
    );

  gameCtx =
    gameCanvas.getContext("2d");


  document
    .getElementById("closeRunningGame")
    .addEventListener(
      "click",
      stopGame
    );


  document
    .getElementById("pauseGame")
    .addEventListener(
      "click",
      togglePause
    );


  document
    .getElementById("restartGame")
    .addEventListener(
      "click",
      () => {

        stopGame();

        launchGame();

      }
    );


  setupTouchControls();


  gameScore = 0;
  gameLives = 3;

  updateGameUI();

}


/* =========================================================
   STOP GAME
========================================================= */

function stopGame() {

  gameRunning = false;

  gamePaused = false;

  if (gameAnimation) {

    cancelAnimationFrame(
      gameAnimation
    );

    gameAnimation = null;

  }

  pressedKeys = {};


  const screen =
    document.getElementById(
      "nexoraGameScreen"
    );

  if (screen) {

    screen.remove();

  }

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

  if (!gameRunning) return;

  gamePaused =
    !gamePaused;


  const status =
    document.getElementById(
      "gameStatus"
    );

  const button =
    document.getElementById(
      "pauseGame"
    );


  if (gamePaused) {

    if (status)
      status.textContent = "PAUSED";

    if (button)
      button.textContent = "▶ Resume";

  } else {

    if (status)
      status.textContent = "PLAYING";

    if (button)
      button.textContent = "⏸ Pause";

  }

}


/* =========================================================
   UI
========================================================= */

function updateGameUI() {

  const score =
    document.getElementById(
      "gameScore"
    );

  const lives =
    document.getElementById(
      "gameLives"
    );


  if (score)
    score.textContent =
      Math.floor(gameScore);

  if (lives)
    lives.textContent =
      Math.max(0, gameLives);

}


function gameOver(message = "GAME OVER") {

  gameRunning = false;

  const status =
    document.getElementById(
      "gameStatus"
    );

  if (status)
    status.textContent = "GAME OVER";


  const box =
    document.getElementById(
      "gameMessage"
    );

  if (box) {

    box.innerHTML = `

      <div>

        <strong>${message}</strong>

        <p>
          Score: ${Math.floor(gameScore)}
        </p>

        <button
          id="gameOverRestart"
          class="game-over-button"
        >
          ↻ PLAY AGAIN
        </button>

      </div>

    `;

    box.classList.add("show");


    document
      .getElementById("gameOverRestart")
      ?.addEventListener(
        "click",
        () => {

          stopGame();

          launchGame();

        }
      );

  }

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    pressedKeys[
      event.key.toLowerCase()
    ] = true;


    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " "
      ].includes(
        event.key.toLowerCase()
      )
    ) {

      event.preventDefault();

    }

  }
);


document.addEventListener(
  "keyup",
  event => {

    pressedKeys[
      event.key.toLowerCase()
    ] = false;

  }
);


function keyDown(...keys) {

  return keys.some(
    key =>
      pressedKeys[
        key.toLowerCase()
      ]
  );

}


/* =========================================================
   TOUCH CONTROLS
========================================================= */

function setupTouchControls() {

  document
    .querySelectorAll(
      ".touch-btn, .touch-action"
    )
    .forEach(button => {

      const control =
        button.dataset.control;


      const start = event => {

        event.preventDefault();

        touchState[control] =
          true;

        button.classList.add(
          "pressed"
        );

      };


      const end = event => {

        event.preventDefault();

        touchState[control] =
          false;

        button.classList.remove(
          "pressed"
        );

      };


      button.addEventListener(
        "touchstart",
        start,
        {
          passive: false
        }
      );


      button.addEventListener(
        "touchend",
        end,
        {
          passive: false
        }
      );


      button.addEventListener(
        "touchcancel",
        end,
        {
          passive: false
        }
      );


      button.addEventListener(
        "mousedown",
        start
      );


      button.addEventListener(
        "mouseup",
        end
      );


      button.addEventListener(
        "mouseleave",
        end
      );

    });

}


function controlPressed(name) {

  return touchState[name];

}


/* =========================================================
   RESET TOUCH
========================================================= */

function resetTouch() {

  touchState = {
    left: false,
    right: false,
    up: false,
    down: false,
    action: false
  };

}


/* =========================================================
   CANVAS HELPERS
========================================================= */

function clearCanvas() {

  gameCtx.fillStyle =
    "#070914";

  gameCtx.fillRect(
    0,
    0,
    gameCanvas.width,
    gameCanvas.height
  );

}


function random(min, max) {

  return Math.random() *
    (max - min) + min;

}


function circle(
  x,
  y,
  radius,
  color
) {

  gameCtx.beginPath();

  gameCtx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  gameCtx.fillStyle =
    color;

  gameCtx.fill();

}


function rectangle(
  x,
  y,
  width,
  height,
  color
) {

  gameCtx.fillStyle =
    color;

  gameCtx.fillRect(
    x,
    y,
    width,
    height
  );

}


/* =========================================================
   1. NEON STRIKE
========================================================= */

function startShooter() {

  gameRunning = true;

  const player = {

    x: 450,

    y: 450,

    width: 45,

    height: 25,

    speed: 7

  };


  let bullets = [];

  let enemies = [];

  let lastSpawn = 0;

  let lastShot = 0;


  function shoot(time) {

    if (time - lastShot < 180)
      return;

    lastShot = time;

    bullets.push({

      x: player.x,

      y: player.y - 15,

      speed: 10

    });

  }


  function spawnEnemy() {

    enemies.push({

      x: random(30, 870),

      y: -30,

      size: random(18, 30),

      speed: random(1.5, 3.5)

    });

  }


  function loop(time) {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    clearCanvas();


    /* PLAYER MOVEMENT */

    if (
      keyDown("arrowleft", "a") ||
      controlPressed("left")
    ) {

      player.x -= player.speed;

    }


    if (
      keyDown("arrowright", "d") ||
      controlPressed("right")
    ) {

      player.x += player.speed;

    }


    player.x =
      Math.max(
        25,
        Math.min(
          875,
          player.x
        )
      );


    if (
      keyDown(" ", "enter") ||
      controlPressed("action")
    ) {

      shoot(time);

    }


    /* SPAWN */

    if (
      time - lastSpawn > 650
    ) {

      spawnEnemy();

      lastSpawn = time;

    }


    /* BULLETS */

    bullets.forEach(
      bullet => {

        bullet.y -=
          bullet.speed;

      }
    );


    bullets =
      bullets.filter(
        bullet =>
          bullet.y > -20
      );


    /* ENEMIES */

    enemies.forEach(
      enemy => {

        enemy.y +=
          enemy.speed;

      }
    );


    /* COLLISION */

    bullets.forEach(
      bullet => {

        enemies.forEach(
          enemy => {

            const distance =
              Math.hypot(
                bullet.x - enemy.x,
                bullet.y - enemy.y
              );


            if (
              distance <
              enemy.size
            ) {

              enemy.dead = true;

              bullet.dead = true;

              gameScore += 10;

            }

          }
        );

      }
    );


    enemies.forEach(
      enemy => {

        if (
          enemy.y >
          520
        ) {

          enemy.dead = true;

          gameLives--;

          updateGameUI();

        }

      }
    );


    bullets =
      bullets.filter(
        bullet =>
          !bullet.dead
      );


    enemies =
      enemies.filter(
        enemy =>
          !enemy.dead
      );


    /* DRAW PLAYER */

    gameCtx.fillStyle =
      "#36f7ff";

    gameCtx.beginPath();

    gameCtx.moveTo(
      player.x,
      player.y - 20
    );

    gameCtx.lineTo(
      player.x - 25,
      player.y + 20
    );

    gameCtx.lineTo(
      player.x + 25,
      player.y + 20
    );

    gameCtx.closePath();

    gameCtx.fill();


    /* DRAW BULLETS */

    bullets.forEach(
      bullet => {

        rectangle(
          bullet.x - 3,
          bullet.y - 10,
          6,
          15,
          "#ffffff"
        );

      }
    );


    /* DRAW ENEMIES */

    enemies.forEach(
      enemy => {

        circle(
          enemy.x,
          enemy.y,
          enemy.size,
          "#ff3b81"
        );

      }
    );


    gameScore +=
      0.03;

    updateGameUI();


    if (gameLives <= 0) {

      gameOver();

    }

  }


  requestAnimationFrame(loop);

}


/* =========================================================
   2. RACING
========================================================= */

function startRacing() {

  gameRunning = true;

  const car = {

    x: 450,

    y: 420,

    width: 45,

    height: 75,

    speed: 7

  };


  let obstacles = [];

  let roadOffset = 0;

  let lastSpawn = 0;


  function loop(time) {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    clearCanvas();


    /* ROAD */

    rectangle(
      180,
      0,
      540,
      520,
      "#151b30"
    );


    /* ROAD SIDES */

    rectangle(
      180,
      0,
      8,
      520,
      "#ff315f"
    );

    rectangle(
      712,
      0,
      8,
      520,
      "#ff315f"
    );


    roadOffset += 6;


    for (
      let y = -40;
      y < 560;
      y += 80
    ) {

      rectangle(
        447,
        (y + roadOffset) % 80,
        8,
        40,
        "#ffffff"
      );

    }


    /* CAR */

    if (
      keyDown("arrowleft", "a") ||
      controlPressed("left")
    ) {

      car.x -=
        car.speed;

    }


    if (
      keyDown("arrowright", "d") ||
      controlPressed("right")
    ) {

      car.x +=
        car.speed;

    }


    car.x =
      Math.max(
        215,
        Math.min(
          655,
          car.x
        )
      );


    /* SPAWN */

    if (
      time - lastSpawn >
      700
    ) {

      obstacles.push({

        x:
          random(
            220,
            650
          ),

        y: -100,

        width: 45,

        height: 75,

        speed:
          random(
            4,
            7
          )

      });

      lastSpawn = time;

    }


    obstacles.forEach(
      obstacle => {

        obstacle.y +=
          obstacle.speed;

      }
    );


    /* COLLISION */

    obstacles.forEach(
      obstacle => {

        if (

          car.x <
            obstacle.x +
            obstacle.width &&

          car.x +
            car.width >
            obstacle.x &&

          car.y <
            obstacle.y +
            obstacle.height &&

          car.y +
            car.height >
            obstacle.y

        ) {

          obstacle.hit = true;

          gameLives--;

          updateGameUI();

        }

      }
    );


    obstacles =
      obstacles.filter(
        obstacle =>
          !obstacle.hit &&
          obstacle.y <
          560
      );


    /* PLAYER */

    rectangle(
      car.x,
      car.y,
      car.width,
      car.height,
      "#36f7ff"
    );


    rectangle(
      car.x + 8,
      car.y + 10,
      29,
      18,
      "#07101e"
    );


    /* ENEMIES */

    obstacles.forEach(
      obstacle => {

        rectangle(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height,
          "#ff3b81"
        );

      }
    );


    gameScore +=
      0.08;

    updateGameUI();


    if (
      gameLives <= 0
    ) {

      gameOver();

    }

  }


  requestAnimationFrame(loop);

}


/* =========================================================
   3. MIND BLOCKS
========================================================= */

function startBlocks() {

  gameRunning = true;

  const size = 6;

  const cell = 70;

  let board =
    Array.from(
      { length: size },
      () =>
        Array(size).fill(0)
    );


  let cursor = {
    x: 0,
    y: 0
  };


  function draw() {

    clearCanvas();


    const offsetX =
      (900 - size * cell) / 2;

    const offsetY =
      (520 - size * cell) / 2;


    for (
      let y = 0;
      y < size;
      y++
    ) {

      for (
        let x = 0;
        x < size;
        x++
      ) {

        rectangle(
          offsetX + x * cell + 3,
          offsetY + y * cell + 3,
          cell - 6,
          cell - 6,
          board[y][x]
            ? "#36f7ff"
            : "#151b30"
        );

      }

    }


    gameCtx.strokeStyle =
      "#ffffff";

    gameCtx.lineWidth = 4;

    gameCtx.strokeRect(
      offsetX +
        cursor.x * cell,
      offsetY +
        cursor.y * cell,
      cell,
      cell
    );

  }


  function select() {

    board[
      cursor.y
    ][
      cursor.x
    ] ^= 1;


    gameScore += 5;

    updateGameUI();


    let filled = 0;

    board.forEach(
      row =>
        row.forEach(
          cellValue => {

            if (cellValue)
              filled++;

          }
        )
    );


    if (
      filled ===
      size * size
    ) {

      gameScore += 100;

      board =
        Array.from(
          { length: size },
          () =>
            Array(size).fill(0)
        );

    }

  }


  function loop() {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    if (
      keyDown("arrowleft", "a") ||
      controlPressed("left")
    ) {

      cursor.x =
        Math.max(
          0,
          cursor.x - 1
        );

      pressedKeys["arrowleft"] = false;
      pressedKeys["a"] = false;

    }


    if (
      keyDown("arrowright", "d") ||
      controlPressed("right")
    ) {

      cursor.x =
        Math.min(
          size - 1,
          cursor.x + 1
        );

      pressedKeys["arrowright"] = false;
      pressedKeys["d"] = false;

    }


    if (
      keyDown("arrowup", "w") ||
      controlPressed("up")
    ) {

      cursor.y =
        Math.max(
          0,
          cursor.y - 1
        );

      pressedKeys["arrowup"] = false;
      pressedKeys["w"] = false;

    }


    if (
      keyDown("arrowdown", "s") ||
      controlPressed("down")
    ) {

      cursor.y =
        Math.min(
          size - 1,
          cursor.y + 1
        );

      pressedKeys["arrowdown"] = false;
      pressedKeys["s"] = false;

    }


    if (
      keyDown(" ", "enter") ||
      controlPressed("action")
    ) {

      select();

      pressedKeys[" "] = false;
      touchState.action = false;

    }


    draw();

  }


  draw();

  requestAnimationFrame(loop);

}


/* =========================================================
   4. PIXEL INVADERS
========================================================= */

function startInvaders() {

  gameRunning = true;

  const player = {

    x: 450,

    y: 450,

    speed: 7

  };


  let bullets = [];

  let enemies = [];

  let direction = 1;

  let lastShot = 0;


  for (
    let row = 0;
    row < 3;
    row++
  ) {

    for (
      let col = 0;
      col < 8;
      col++
    ) {

      enemies.push({

        x:
          210 + col * 70,

        y:
          70 + row * 55,

        size: 18

      });

    }

  }


  function shoot(time) {

    if (
      time - lastShot <
      250
    ) return;

    lastShot = time;

    bullets.push({

      x: player.x,

      y: player.y - 25,

      speed: 9

    });

  }


  function loop(time) {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    clearCanvas();


    if (
      keyDown("arrowleft", "a") ||
      controlPressed("left")
    )
      player.x -=
        player.speed;


    if (
      keyDown("arrowright", "d") ||
      controlPressed("right")
    )
      player.x +=
        player.speed;


    player.x =
      Math.max(
        210,
        Math.min(
          690,
          player.x
        )
      );


    if (
      keyDown(" ", "enter") ||
      controlPressed("action")
    ) {

      shoot(time);

    }


    let edge = false;


    enemies.forEach(
      enemy => {

        enemy.x +=
          direction * 0.7;

        if (
          enemy.x > 680 ||
          enemy.x < 220
        )
          edge = true;

      }
    );


    if (edge) {

      direction *= -1;

      enemies.forEach(
        enemy =>
          enemy.y += 20
      );

    }


    bullets.forEach(
      bullet =>
        bullet.y -=
          bullet.speed
    );


    bullets.forEach(
      bullet => {

        enemies.forEach(
          enemy => {

            if (
              Math.hypot(
                bullet.x - enemy.x,
                bullet.y - enemy.y
              ) <
              enemy.size
            ) {

              enemy.dead = true;

              bullet.dead = true;

              gameScore += 10;

            }

          }
        );

      }
    );


    bullets =
      bullets.filter(
        bullet =>
          !bullet.dead &&
          bullet.y > 0
      );


    enemies =
      enemies.filter(
        enemy =>
          !enemy.dead
      );


    /* DRAW */

    rectangle(
      player.x - 25,
      player.y - 10,
      50,
      25,
      "#36f7ff"
    );


    enemies.forEach(
      enemy => {

        circle(
          enemy.x,
          enemy.y,
          enemy.size,
          "#ff3b81"
        );

      }
    );


    bullets.forEach(
      bullet => {

        rectangle(
          bullet.x - 3,
          bullet.y,
          6,
          14,
          "#ffffff"
        );

      }
    );


    gameScore +=
      0.03;

    updateGameUI();


    if (!enemies.length) {

      gameOver(
        "YOU WIN!"
      );

    }

  }


  requestAnimationFrame(loop);

}


/* =========================================================
   5. CYBER CHESS
========================================================= */

function startChess() {

  gameRunning = true;

  const boardSize = 8;

  const cell = 55;

  let selected = null;

  let turn = "player";


  const pieces = [

    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],

    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],

    ["", "", "", "", "", "", "", ""],

    ["", "", "", "", "", "", "", ""],

    ["", "", "", "", "", "", "", ""],

    ["", "", "", "", "", "", "", ""],

    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],

    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]

  ];


  let cursor = {
    x: 0,
    y: 7
  };


  function draw() {

    clearCanvas();


    const offsetX =
      (900 -
        boardSize * cell) /
      2;

    const offsetY =
      (520 -
        boardSize * cell) /
      2;


    for (
      let y = 0;
      y < boardSize;
      y++
    ) {

      for (
        let x = 0;
        x < boardSize;
        x++
      ) {

        const light =
          (x + y) % 2 === 0;


        rectangle(
          offsetX + x * cell,
          offsetY + y * cell,
          cell,
          cell,
          light
            ? "#26314d"
            : "#11172a"
        );


        const piece =
          pieces[y][x];


        if (piece) {

          gameCtx.font =
            "38px Arial";

          gameCtx.textAlign =
            "center";

          gameCtx.textBaseline =
            "middle";

          gameCtx.fillStyle =
            "#ffffff";

          gameCtx.fillText(
            piece,
            offsetX +
              x * cell +
              cell / 2,
            offsetY +
              y * cell +
              cell / 2
          );

        }

      }

    }


    gameCtx.strokeStyle =
      "#36f7ff";

    gameCtx.lineWidth = 4;

    gameCtx.strokeRect(
      offsetX +
        cursor.x * cell,
      offsetY +
        cursor.y * cell,
      cell,
      cell
    );

  }


  function selectSquare() {

    if (!selected) {

      selected = {
        x: cursor.x,
        y: cursor.y
      };

      return;

    }


    pieces[
      cursor.y
    ][
      cursor.x
    ] =
      pieces[
        selected.y
      ][
        selected.x
      ];


    pieces[
      selected.y
    ][
      selected.x
    ] = "";


    selected = null;

    gameScore += 5;

    updateGameUI();

  }


  function loop() {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    if (
      keyDown("arrowleft", "a") ||
      controlPressed("left")
    ) {

      cursor.x =
        Math.max(
          0,
          cursor.x - 1
        );

      pressedKeys["arrowleft"] = false;
      pressedKeys["a"] = false;

    }


    if (
      keyDown("arrowright", "d") ||
      controlPressed("right")
    ) {

      cursor.x =
        Math.min(
          7,
          cursor.x + 1
        );

      pressedKeys["arrowright"] = false;
      pressedKeys["d"] = false;

    }


    if (
      keyDown("arrowup", "w") ||
      controlPressed("up")
    ) {

      cursor.y =
        Math.max(
          0,
          cursor.y - 1
        );

      pressedKeys["arrowup"] = false;
      pressedKeys["w"] = false;

    }


    if (
      keyDown("arrowdown", "s") ||
      controlPressed("down")
    ) {

      cursor.y =
        Math.min(
          7,
          cursor.y + 1
        );

      pressedKeys["arrowdown"] = false;
      pressedKeys["s"] = false;

    }


    if (
      keyDown(" ", "enter") ||
      controlPressed("action")
    ) {

      selectSquare();

      pressedKeys[" "] = false;

      touchState.action = false;

    }


    draw();

  }


  draw();

  requestAnimationFrame(loop);

}


/* =========================================================
   6. JUNGLE DASH / RUNNER
========================================================= */

function startRunner() {

  gameRunning = true;

  const player = {

    x: 150,

    y: 400,

    width: 45,

    height: 60,

    velocityY: 0,

    jumping: false

  };


  let obstacles = [];

  let coins = [];

  let lastObstacle = 0;

  let lastCoin = 0;


  function jump() {

    if (
      !player.jumping
    ) {

      player.velocityY =
        -14;

      player.jumping =
        true;

    }

  }


  function loop(time) {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    clearCanvas();


    /* GROUND */

    rectangle(
      0,
      460,
      900,
      60,
      "#10192c"
    );


    /* JUMP */

    if (
      keyDown(
        "arrowup",
        "w",
        " "
      ) ||
      controlPressed("up") ||
      controlPressed("action")
    ) {

      jump();

      pressedKeys["arrowup"] = false;
      pressedKeys["w"] = false;
      pressedKeys[" "] = false;

      touchState.up = false;
      touchState.action = false;

    }


    player.velocityY +=
      0.7;

    player.y +=
      player.velocityY;


    if (
      player.y >= 400
    ) {

      player.y = 400;

      player.velocityY = 0;

      player.jumping =
        false;

    }


    /* OBSTACLES */

    if (
      time - lastObstacle >
      1000
    ) {

      obstacles.push({

        x: 920,

        y: 420,

        width: 35,

        height: 40,

        speed: 7

      });

      lastObstacle = time;

    }


    obstacles.forEach(
      obstacle =>
        obstacle.x -=
          obstacle.speed
    );


    /* COINS */

    if (
      time - lastCoin >
      800
    ) {

      coins.push({

        x: 920,

        y:
          random(
            300,
            390
          ),

        radius: 12,

        speed: 6

      });

      lastCoin = time;

    }


    coins.forEach(
      coin =>
        coin.x -=
          coin.speed
    );


    /* COLLISION */

    obstacles.forEach(
      obstacle => {

        if (

          player.x <
            obstacle.x +
            obstacle.width &&

          player.x +
            player.width >
            obstacle.x &&

          player.y <
            obstacle.y +
            obstacle.height &&

          player.y +
            player.height >
            obstacle.y

        ) {

          obstacle.dead = true;

          gameLives--;

          updateGameUI();

        }

      }
    );


    coins.forEach(
      coin => {

        if (
          Math.hypot(
            player.x + 20 -
              coin.x,
            player.y + 25 -
              coin.y
          ) < 35
        ) {

          coin.dead = true;

          gameScore += 25;

        }

      }
    );


    obstacles =
      obstacles.filter(
        obstacle =>
          !obstacle.dead &&
          obstacle.x > -100
      );


    coins =
      coins.filter(
        coin =>
          !coin.dead &&
          coin.x > -50
      );


    /* PLAYER */

    rectangle(
      player.x,
      player.y,
      player.width,
      player.height,
      "#36f7ff"
    );


    /* OBSTACLES */

    obstacles.forEach(
      obstacle => {

        rectangle(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height,
          "#ff3b81"
        );

      }
    );


    /* COINS */

    coins.forEach(
      coin => {

        circle(
          coin.x,
          coin.y,
          coin.radius,
          "#ffe45e"
        );

      }
    );


    gameScore +=
      0.04;

    updateGameUI();


    if (
      gameLives <= 0
    ) {

      gameOver();

    }

  }


  requestAnimationFrame(loop);

}


/* =========================================================
   7. GALAXY QUEST
========================================================= */

function startGalaxy() {

  gameRunning = true;

  const player = {

    x: 450,

    y: 400,

    speed: 6

  };


  let stars = [];

  let enemies = [];

  let lastStar = 0;

  let lastEnemy = 0;


  function loop(time) {

    if (!gameRunning) return;

    gameAnimation =
      requestAnimationFrame(loop);


    if (gamePaused) return;


    clearCanvas();


    /* STAR FIELD */

    for (
      let i = 0;
      i < 50;
      i++
    ) {

      const x =
        (i * 127) %
        900;

      const y =
        (i * 71 +
          time * 0.03) %
        520;

      circle(
        x,
        y,
        1.5,
        "#ffffff"
      );

    }


    /* MOVEMENT */

    if (
      keyDown("arrowleft", "a") ||
      controlPressed("left")
    )
      player.x -=
        player.speed;


    if (
      keyDown("arrowright", "d") ||
      controlPressed("right")
    )
      player.x +=
        player.speed;


    if (
      keyDown("arrowup", "w") ||
      controlPressed("up")
    )
      player.y -=
        player.speed;


    if (
      keyDown("arrowdown", "s") ||
      controlPressed("down")
    )
      player.y +=
        player.speed;


    player.x =
      Math.max(
        20,
        Math.min(
          880,
          player.x
        )
      );


    player.y =
      Math.max(
        30,
        Math.min(
          490,
          player.y
        )
      );


    /* STARS */

    if (
      time - lastStar >
      600
    ) {

      stars.push({

        x: random(30, 870),

        y: -20,

        speed:
          random(2, 4)

      });

      lastStar = time;

    }


    stars.forEach(
      star =>
        star.y +=
        star.speed
    );


    /* ENEMIES */

    if (
      time - lastEnemy >
      1200
    ) {

      enemies.push({

        x: random(30, 870),

        y: -30,

        size: 20,

        speed:
          random(2, 4)

      });

      lastEnemy = time;

    }


    enemies.forEach(
      enemy =>
        enemy.y +=
        enemy.speed
    );


    /* STAR COLLISION */

    stars.forEach(
      star => {

        if (
          Math.hypot(
            player.x -
              star.x,
            player.y -
              star.y
          ) < 28
        ) {

          star.dead = true;

          gameScore += 20;

        }

      }
    );


    /* ENEMY COLLISION */

    enemies.forEach(
      enemy => {

        if (
          Math.hypot(
            player.x -
              enemy.x,
            player.y -
              enemy.y
          ) <
          enemy.size + 15
        ) {

          enemy.dead = true;

          gameLives--;

          updateGameUI();

        }

      }
    );


    stars =
      stars.filter(
        star =>
          !star.dead &&
          star.y < 540
      );


    enemies =
      enemies.filter(
        enemy =>
          !enemy.dead &&
          enemy.y < 540
      );


    /* PLAYER */

    gameCtx.fillStyle =
      "#36f7ff";

    gameCtx.beginPath();

    gameCtx.moveTo(
      player.x,
      player.y - 25
    );

    gameCtx.lineTo(
      player.x - 20,
      player.y + 20
    );

    gameCtx.lineTo(
      player.x + 20,
      player.y + 20
    );

    gameCtx.closePath();

    gameCtx.fill();


    stars.forEach(
      star =>
        circle(
          star.x,
          star.y,
          9,
          "#ffe45e"
        )
    );


    enemies.forEach(
      enemy =>
        circle(
          enemy.x,
          enemy.y,
          enemy.size,
          "#ff3b81"
        )
    );


    gameScore +=
      0.03;

    updateGameUI();


    if (
      gameLives <= 0
    ) {

      gameOver();

    }

  }


  requestAnimationFrame(loop);

}


/* =========================================================
   FILTERS
========================================================= */

filters.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        filters.forEach(
          b =>
            b.classList.remove(
              "active"
            )
        );

        button.classList.add(
          "active"
        );

        renderGames();

      }
    );

  }
);


/* =========================================================
   SEARCH
========================================================= */

if (search) {

  search.addEventListener(
    "input",
    renderGames
  );

}


/* =========================================================
   GENRE BUTTONS
========================================================= */

document
  .querySelectorAll(".genre")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const genre =
            button.dataset.genre;


          filters.forEach(
            filter => {

              filter.classList.toggle(
                "active",
                filter.dataset.category ===
                  genre
              );

            }
          );


          renderGames();


          document
            .getElementById("games")
            ?.scrollIntoView({
              behavior: "smooth"
            });

        }
      );

    }
  );


/* =========================================================
   FEATURED PLAY BUTTON
========================================================= */

document
  .querySelector(".round-play")
  ?.addEventListener(
    "click",
    () =>
      openGame(games[0])
  );


/* =========================================================
   START GAME BUTTON
========================================================= */

document
  .getElementById("startGame")
  ?.addEventListener(
    "click",
    launchGame
  );


/* =========================================================
   MODAL CLOSE
========================================================= */

document
  .getElementById("modalClose")
  ?.addEventListener(
    "click",
    closeGame
  );


modal?.addEventListener(
  "click",
  event => {

    if (
      event.target === modal
    ) {

      closeGame();

    }

  }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeGame();

    }

  }
);


/* =========================================================
   MOBILE MENU
========================================================= */

const menu =
  document.getElementById(
    "desktopNav"
  );

document
  .getElementById(
    "menuToggle"
  )
  ?.addEventListener(
    "click",
    () => {

      menu?.classList.toggle(
        "open"
      );

    }
  );


menu
  ?.querySelectorAll("a")
  .forEach(
    link => {

      link.addEventListener(
        "click",
        () => {

          menu.classList.remove(
            "open"
          );

        }
      );

    }
  );


/* =========================================================
   SEARCH BUTTON
========================================================= */

document
  .getElementById(
    "searchToggle"
  )
  ?.addEventListener(
    "click",
    () => {

      document
        .getElementById("games")
        ?.scrollIntoView({
          behavior: "smooth"
        });


      setTimeout(
        () =>
          search?.focus(),
        450
      );

    }
  );


/* =========================================================
   CTRL + K SEARCH
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() ===
        "k"
    ) {

      event.preventDefault();

      document
        .getElementById(
          "searchToggle"
        )
        ?.click();

    }

  }
);


/* =========================================================
   NEWSLETTER
========================================================= */

document
  .getElementById(
    "newsletterForm"
  )
  ?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const message =
        document.getElementById(
          "formMessage"
        );

      if (message) {

        message.textContent =
          "You're subscribed — welcome to NEXORA.";

      }

      event.target.reset();

    }
  );


/* =========================================================
   YEAR
========================================================= */

const year =
  document.getElementById(
    "year"
  );

if (year) {

  year.textContent =
    new Date().getFullYear();

}


/* =========================================================
   START
========================================================= */

renderGames();
