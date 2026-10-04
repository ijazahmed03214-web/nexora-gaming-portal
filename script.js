/* =========================================================
   NEXORA GAMING PORTAL
   UNIVERSAL CONTROLS EDITION

   Computer:
   - Keyboard
   - Mouse

   Mobile:
   - Touch
   - On-screen controls

   Tablet:
   - Touch
   - On-screen controls
   - Keyboard if available
   ========================================================= */

"use strict";


/* =========================================================
   DOM
   ========================================================= */

const modal = document.getElementById("gameModal");
const stage = document.getElementById("gameStage");
const titleEl = document.getElementById("gameTitle");
const scoreEl = document.getElementById("gameScore");
const instructionEl = document.getElementById("gameInstructions");
const closeBtn = document.getElementById("closeGame");
const restartBtn = document.getElementById("restartGame");
const searchInput = document.getElementById("searchInput");
const visibleCount = document.getElementById("visibleCount");
const noResults = document.getElementById("noResults");

let currentGame = null;
let currentTitle = "";
let cleanupGame = () => {};

let controlCleanups = [];
let gameTimers = [];
let gameAnimationFrames = [];


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function setScore(value) {
  if (scoreEl) scoreEl.textContent = String(value);
}

function setInstruction(text) {
  if (instructionEl) instructionEl.textContent = text;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function html(content) {
  stage.innerHTML = content;
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}


/* =========================================================
   SAFE TIMER / RAF TRACKING
   ========================================================= */

function gameSetTimeout(fn, ms) {
  const id = setTimeout(fn, ms);
  gameTimers.push(id);
  return id;
}

function gameSetInterval(fn, ms) {
  const id = setInterval(fn, ms);
  gameTimers.push(id);
  return id;
}

function gameRAF(fn) {
  const id = requestAnimationFrame(fn);
  gameAnimationFrames.push(id);
  return id;
}

function clearGameResources() {

  gameTimers.forEach(id => {
    clearTimeout(id);
    clearInterval(id);
  });

  gameAnimationFrames.forEach(id => {
    cancelAnimationFrame(id);
  });

  gameTimers = [];
  gameAnimationFrames = [];
}


/* =========================================================
   CLEANUP
   ========================================================= */

function registerCleanup(fn) {
  if (typeof fn === "function") {
    controlCleanups.push(fn);
  }
}

function clearControlCleanups() {

  controlCleanups.forEach(fn => {
    try {
      fn();
    } catch (error) {
      console.warn("Control cleanup error:", error);
    }
  });

  controlCleanups = [];
}

function cleanupEverything() {

  clearGameResources();
  clearControlCleanups();

  try {
    cleanupGame();
  } catch (error) {
    console.warn("Game cleanup error:", error);
  }

  cleanupGame = () => {};
}


/* =========================================================
   CANVAS
   ========================================================= */

function canvasSetup(width, height) {

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  canvas.className = "canvas-game";

  canvas.style.maxWidth = "100%";
  canvas.style.height = "auto";
  canvas.style.touchAction = "none";

  stage.appendChild(canvas);

  return {
    canvas,
    ctx: canvas.getContext("2d")
  };
}


function canvasPoint(canvas, event) {

  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) *
      (canvas.width / rect.width),

    y: (event.clientY - rect.top) *
      (canvas.height / rect.height)
  };
}


function addCanvasPointer(canvas, callback) {

  const handler = event => {

    event.preventDefault();

    const point = canvasPoint(canvas, event);

    callback(point, event);
  };

  canvas.addEventListener("pointerdown", handler, {
    passive: false
  });

  registerCleanup(() => {
    canvas.removeEventListener("pointerdown", handler);
  });
}


function addCanvasMove(canvas, callback) {

  const handler = event => {

    event.preventDefault();

    const point = canvasPoint(canvas, event);

    callback(point, event);
  };

  canvas.addEventListener("pointermove", handler, {
    passive: false
  });

  registerCleanup(() => {
    canvas.removeEventListener("pointermove", handler);
  });
}


/* =========================================================
   MOBILE CONTROL BUTTON
   ========================================================= */

function createButton(label, action, options = {}) {

  const button = document.createElement("button");

  button.type = "button";
  button.className =
    "nexora-control-btn" +
    (options.wide ? " wide" : "") +
    (options.action ? " action" : "");

  button.textContent = label;

  const down = event => {

    event.preventDefault();
    event.stopPropagation();

    button.classList.add("pressed");

    if (options.hold) {
      action(true);

      button._holdTimer = setInterval(() => {
        action(true);
      }, options.interval || 80);
    } else {
      action();
    }

    if (button.setPointerCapture) {
      try {
        button.setPointerCapture(event.pointerId);
      } catch {}
    }
  };

  const up = event => {

    event.preventDefault();
    event.stopPropagation();

    button.classList.remove("pressed");

    if (button._holdTimer) {
      clearInterval(button._holdTimer);
      button._holdTimer = null;
    }

    if (options.release) {
      options.release();
    }
  };

  button.addEventListener("pointerdown", down, {
    passive: false
  });

  button.addEventListener("pointerup", up, {
    passive: false
  });

  button.addEventListener("pointercancel", up, {
    passive: false
  });

  button.addEventListener("pointerleave", event => {
    if (event.buttons === 0) {
      up(event);
    }
  });

  return button;
}


/* =========================================================
   TOUCH CONTROL CONTAINERS
   ========================================================= */

function createControls() {

  const controls = document.createElement("div");

  controls.className = "nexora-touch-controls";

  stage.appendChild(controls);

  registerCleanup(() => {
    controls.remove();
  });

  return controls;
}


function addDPad(onDirection) {

  const controls = createControls();

  const upRow = document.createElement("div");
  const middleRow = document.createElement("div");
  const bottomRow = document.createElement("div");

  upRow.className = "nexora-control-row";
  middleRow.className = "nexora-control-row";
  bottomRow.className = "nexora-control-row";

  const up = createButton("▲", () => onDirection("up"));
  const left = createButton("◀", () => onDirection("left"));
  const down = createButton("▼", () => onDirection("down"));
  const right = createButton("▶", () => onDirection("right"));

  upRow.appendChild(up);

  middleRow.appendChild(left);
  middleRow.appendChild(createSpacer());
  middleRow.appendChild(right);

  bottomRow.appendChild(down);

  controls.appendChild(upRow);
  controls.appendChild(middleRow);
  controls.appendChild(bottomRow);

  return controls;
}


function createSpacer() {

  const spacer = document.createElement("div");

  spacer.className = "nexora-control-spacer";

  return spacer;
}


function addHorizontalControls(leftAction, rightAction) {

  const controls = createControls();

  const row = document.createElement("div");

  row.className = "nexora-control-row";

  const left = createButton(
    "◀",
    leftAction,
    {
      hold: true,
      interval: 55
    }
  );

  const right = createButton(
    "▶",
    rightAction,
    {
      hold: true,
      interval: 55
    }
  );

  row.appendChild(left);
  row.appendChild(right);

  controls.appendChild(row);

  return controls;
}


function addActionControl(label, action) {

  const controls = createControls();

  const row = document.createElement("div");

  row.className = "nexora-control-row";

  const button = createButton(
    label,
    action,
    {
      wide: true,
      action: true
    }
  );

  row.appendChild(button);

  controls.appendChild(row);

  return controls;
}


function addDualActionControls(
  leftLabel,
  leftAction,
  rightLabel,
  rightAction
) {

  const controls = createControls();

  const row = document.createElement("div");

  row.className = "nexora-control-row";

  row.appendChild(
    createButton(
      leftLabel,
      leftAction,
      {
        wide: true,
        action: true
      }
    )
  );

  row.appendChild(
    createButton(
      rightLabel,
      rightAction,
      {
        wide: true,
        action: true
      }
    )
  );

  controls.appendChild(row);

  return controls;
}


/* =========================================================
   UNIVERSAL KEYBOARD SCROLL PREVENTION
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (!modal || !modal.classList.contains("open")) {
      return;
    }

    const active = document.activeElement;

    if (
      active &&
      (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA"
      )
    ) {
      return;
    }

    const blocked = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "Spacebar",
      "w",
      "W",
      "a",
      "A",
      "s",
      "S",
      "d",
      "D"
    ];

    if (
      blocked.includes(event.key) ||
      event.code === "Space"
    ) {
      event.preventDefault();
    }
  },
  {
    passive: false
  }
);


/* =========================================================
   END GAME
   ========================================================= */

function endGame(message) {

  setInstruction(message);

  showToast(message);
}


/* =========================================================
   1. TIC TAC TOE
   ========================================================= */

function gameTicTacToe() {

  html(`
    <div class="game-ui">
      <h3>❌ Neon Tic Tac Toe</h3>
      <div class="game-message" id="tttMessage">
        Your turn
      </div>

      <div class="ttt-board" id="tttBoard">
        ${Array(9).fill(0).map((_, i) =>
          `<button class="ttt-cell" data-index="${i}"></button>`
        ).join("")}
      </div>
    </div>
  `);

  let board = Array(9).fill("");
  let gameOver = false;

  const cells = [...document.querySelectorAll(".ttt-cell")];
  const message = document.getElementById("tttMessage");

  function winner(b) {

    const lines = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6]
    ];

    for (const [a,b1,c] of lines) {

      if (
        b[a] &&
        b[a] === b[b1] &&
        b[a] === b[c]
      ) {
        return b[a];
      }
    }

    return null;
  }

  function aiMove() {

    if (gameOver) return;

    const empty = board
      .map((v, i) => v ? null : i)
      .filter(v => v !== null);

    if (!empty.length) return;

    const move = randomItem(empty);

    board[move] = "O";

    cells[move].textContent = "O";

    const result = winner(board);

    if (result) {
      gameOver = true;
      message.textContent = "Computer wins!";
      return;
    }

    if (!board.includes("")) {
      gameOver = true;
      message.textContent = "Draw!";
      return;
    }

    message.textContent = "Your turn";
  }

  function play(index) {

    if (gameOver || board[index]) return;

    board[index] = "X";
    cells[index].textContent = "X";

    const result = winner(board);

    if (result) {
      gameOver = true;
      message.textContent = "You win!";
      setScore(1);
      return;
    }

    if (!board.includes("")) {
      gameOver = true;
      message.textContent = "Draw!";
      return;
    }

    message.textContent = "Computer thinking...";

    gameSetTimeout(aiMove, 350);
  }

  cells.forEach(cell => {

    cell.addEventListener("click", () => {
      play(Number(cell.dataset.index));
    });
  });

  setInstruction("Click/tap a square. Computer plays O.");

  return () => {};
}


/* =========================================================
   2. MEMORY
   ========================================================= */

function gameMemory() {

  const emojis = [
    "🎮",
    "🚀",
    "🐍",
    "⚡",
    "👾",
    "🏎️",
    "🎯",
    "🧠"
  ];

  const cards = [...emojis, ...emojis]
    .sort(() => Math.random() - .5);

  html(`
    <div class="game-ui">
      <h3>🧠 Memory Match</h3>

      <div class="game-message" id="memoryMessage">
        Find all pairs
      </div>

      <div class="memory-grid" id="memoryGrid">
        ${cards.map((_, i) =>
          `<button class="memory-card"
             data-index="${i}">
             ?
           </button>`
        ).join("")}
      </div>
    </div>
  `);

  const buttons = [
    ...document.querySelectorAll(".memory-card")
  ];

  let first = null;
  let lock = false;
  let matched = 0;
  let score = 0;

  buttons.forEach((button, index) => {

    button.addEventListener("click", () => {

      if (
        lock ||
        button.classList.contains("matched") ||
        button === first
      ) {
        return;
      }

      button.textContent = cards[index];
      button.classList.add("flipped");

      if (first === null) {
        first = button;
        first._index = index;
        return;
      }

      lock = true;

      const second = button;

      if (
        cards[first._index] === cards[index]
      ) {

        first.classList.add("matched");
        second.classList.add("matched");

        matched += 2;
        score += 10;

        setScore(score);

        first = null;
        lock = false;

        if (matched === cards.length) {
          endGame("🎉 You matched every pair!");
        }

      } else {

        gameSetTimeout(() => {

          first.textContent = "?";
          second.textContent = "?";

          first.classList.remove("flipped");
          second.classList.remove("flipped");

          first = null;
          lock = false;

        }, 650);
      }
    });
  });

  setInstruction("Tap cards to find matching pairs.");

  return () => {};
}


/* =========================================================
   3. NUMBER GUESS
   ========================================================= */

function gameGuess() {

  const secret = randomNumber(1, 100);

  html(`
    <div class="game-ui">

      <h3>🔢 Number Hunter</h3>

      <div class="game-message" id="guessMessage">
        Guess a number from 1 to 100.
      </div>

      <input
        id="guessInput"
        class="game-input"
        type="number"
        min="1"
        max="100"
        placeholder="Enter number"
      >

      <button
        id="guessButton"
        class="game-btn">
        GUESS
      </button>

    </div>
  `);

  const input = document.getElementById("guessInput");
  const button = document.getElementById("guessButton");
  const message = document.getElementById("guessMessage");

  let attempts = 0;

  function check() {

    const value = Number(input.value);

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 100
    ) {
      message.textContent =
        "Enter a number between 1 and 100.";
      return;
    }

    attempts++;

    if (value === secret) {

      setScore(Math.max(1, 110 - attempts * 10));

      message.textContent =
        `🎉 Correct! The number was ${secret}.`;

      input.disabled = true;
      button.disabled = true;

    } else if (value < secret) {

      message.textContent = "📈 Too low.";

    } else {

      message.textContent = "📉 Too high.";
    }
  }

  button.addEventListener("click", check);

  input.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      check();
    }
  });

  setInstruction("Enter your guess and press GUESS.");

  gameSetTimeout(() => input.focus(), 100);

  return () => {};
}


/* =========================================================
   4. ROCK PAPER SCISSORS
   ========================================================= */

function gameRPS() {

  html(`
    <div class="game-ui">

      <h3>✊ RPS Arena</h3>

      <div class="game-message" id="rpsMessage">
        Choose your move
      </div>

      <div class="choice-row">

        <button class="choice-btn" data-choice="rock">
          ✊
        </button>

        <button class="choice-btn" data-choice="paper">
          ✋
        </button>

        <button class="choice-btn" data-choice="scissors">
          ✌️
        </button>

      </div>

    </div>
  `);

  const message = document.getElementById("rpsMessage");

  const choices = [
    "rock",
    "paper",
    "scissors"
  ];

  document.querySelectorAll(".choice-btn")
    .forEach(button => {

      button.addEventListener("click", () => {

        const player = button.dataset.choice;
        const computer = randomItem(choices);

        let result = "";

        if (player === computer) {
          result = "Draw!";
        } else if (
          (
            player === "rock" &&
            computer === "scissors"
          ) ||
          (
            player === "paper" &&
            computer === "rock"
          ) ||
          (
            player === "scissors" &&
            computer === "paper"
          )
        ) {
          result = "🎉 You win!";
          setScore(Number(scoreEl.textContent) + 1);
        } else {
          result = "Computer wins!";
        }

        message.textContent =
          `You: ${player} | Computer: ${computer} — ${result}`;
      });
    });

  setInstruction("Tap your choice.");

  return () => {};
}


/* =========================================================
   5. CLICK RUSH
   ========================================================= */

function gameClicker() {

  html(`
    <div class="game-ui">

      <h3>👆 Click Rush</h3>

      <div class="game-message" id="clickMessage">
        Press START
      </div>

      <button
        class="game-btn"
        id="clickStart">
        START
      </button>

      <div
        id="clickTarget"
        style="
          display:none;
          margin:30px auto;
          width:130px;
          height:130px;
          border-radius:50%;
          background:linear-gradient(135deg,#7c5cff,#00e5ff);
          place-items:center;
          font-size:25px;
          font-weight:900;
          user-select:none;
          touch-action:none;
        ">
        TAP!
      </div>

    </div>
  `);

  const start = document.getElementById("clickStart");
  const target = document.getElementById("clickTarget");
  const message = document.getElementById("clickMessage");

  let score = 0;
  let running = false;
  let timeLeft = 10;

  function hit() {

    if (!running) return;

    score++;
    setScore(score);

    target.style.transform =
      `scale(${randomNumber(90,110) / 100})`;
  }

  target.addEventListener("pointerdown", event => {
    event.preventDefault();
    hit();
  });

  start.addEventListener("click", () => {

    if (running) return;

    running = true;
    score = 0;
    timeLeft = 10;

    setScore(0);

    target.style.display = "grid";
    start.disabled = true;

    message.textContent =
      "Tap as fast as you can!";

    const timer = gameSetInterval(() => {

      timeLeft--;

      message.textContent =
        `Time: ${timeLeft}s`;

      if (timeLeft <= 0) {

        clearInterval(timer);

        running = false;
        target.style.display = "none";
        start.disabled = false;

        message.textContent =
          `Finished! Score: ${score}`;
      }

    }, 1000);
  });

  setInstruction("Tap the target as quickly as possible.");

  return () => {};
}


/* =========================================================
   6. SNAKE
   ========================================================= */

function gameSnake() {

  const { canvas, ctx } = canvasSetup(360, 360);

  const size = 20;
  const cells = canvas.width / size;

  let snake = [
    {x: 9, y: 9},
    {x: 8, y: 9},
    {x: 7, y: 9}
  ];

  let direction = {
    x: 1,
    y: 0
  };

  let nextDirection = {
    x: 1,
    y: 0
  };

  let food = spawnFood();
  let score = 0;
  let over = false;

  function spawnFood() {

    let p;

    do {
      p = {
        x: randomNumber(0, cells - 1),
        y: randomNumber(0, cells - 1)
      };
    } while (
      snake.some(
        part =>
          part.x === p.x &&
          part.y === p.y
      )
    );

    return p;
  }

  function setDirection(dir) {

    const opposite =
      direction.x === -dir.x &&
      direction.y === -dir.y;

    if (!opposite) {
      nextDirection = dir;
    }
  }

  function draw() {

    ctx.fillStyle = "#050711";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#7c5cff";

    snake.forEach(part => {

      ctx.fillRect(
        part.x * size + 1,
        part.y * size + 1,
        size - 2,
        size - 2
      );
    });

    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(
      food.x * size + 3,
      food.y * size + 3,
      size - 6,
      size - 6
    );
  }

  function update() {

    if (over) return;

    direction = nextDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    if (
      head.x < 0 ||
      head.x >= cells ||
      head.y < 0 ||
      head.y >= cells ||
      snake.some(
        part =>
          part.x === head.x &&
          part.y === head.y
      )
    ) {
      over = true;
      endGame(`Game Over — Score: ${score}`);
      return;
    }

    snake.unshift(head);

    if (
      head.x === food.x &&
      head.y === food.y
    ) {

      score++;
      setScore(score);

      food = spawnFood();

    } else {

      snake.pop();
    }

    draw();
  }

  function key(event) {

    const map = {
      ArrowUp: {x:0,y:-1},
      w: {x:0,y:-1},
      W: {x:0,y:-1},

      ArrowDown: {x:0,y:1},
      s: {x:0,y:1},
      S: {x:0,y:1},

      ArrowLeft: {x:-1,y:0},
      a: {x:-1,y:0},
      A: {x:-1,y:0},

      ArrowRight: {x:1,y:0},
      d: {x:1,y:0},
      D: {x:1,y:0}
    };

    if (map[event.key]) {
      event.preventDefault();
      setDirection(map[event.key]);
    }
  }

  document.addEventListener("keydown", key);

  registerCleanup(() => {
    document.removeEventListener("keydown", key);
  });

  addDPad(dir => {

    const map = {
      up: {x:0,y:-1},
      down: {x:0,y:1},
      left: {x:-1,y:0},
      right: {x:1,y:0}
    };

    setDirection(map[dir]);
  });

  draw();

  gameSetInterval(update, 120);

  setInstruction(
    "Keyboard WASD/Arrows or use the mobile D-pad."
  );

  return () => {};
}


/* =========================================================
   7. WHACK ATTACK
   ========================================================= */

function gameWhack() {

  html(`
    <div class="game-ui">

      <h3>🔨 Whack Attack</h3>

      <div class="game-message" id="whackMessage">
        Hit the target!
      </div>

      <div class="whack-grid">
        ${Array(9).fill(0).map((_, i) =>
          `<button
             class="whack-hole"
             data-index="${i}">
           </button>`
        ).join("")}
      </div>

    </div>
  `);

  const holes = [
    ...document.querySelectorAll(".whack-hole")
  ];

  let active = -1;
  let score = 0;

  function move() {

    holes.forEach(h =>
      h.classList.remove("active")
    );

    active = randomNumber(0, 8);

    holes[active].classList.add("active");
  }

  holes.forEach((hole, index) => {

    hole.addEventListener("click", () => {

      if (index !== active) return;

      score++;
      setScore(score);

      move();
    });
  });

  move();

  gameSetInterval(move, 900);

  setInstruction("Tap the glowing target.");

  return () => {};
}


/* =========================================================
   8. REACTION RUSH
   ========================================================= */

function gameReaction() {

  html(`
    <div class="game-ui">

      <h3>⚡ Reaction Rush</h3>

      <div
        id="reactionBox"
        style="
          width:min(420px,100%);
          height:220px;
          margin:auto;
          border-radius:18px;
          display:grid;
          place-items:center;
          background:#3b1724;
          color:white;
          font-size:22px;
          font-weight:900;
          user-select:none;
          touch-action:none;
        ">
        WAIT...
      </div>

    </div>
  `);

  const box = document.getElementById("reactionBox");

  let ready = false;
  let startTime = 0;
  let finished = false;

  const delay = randomNumber(1800, 4500);

  box.addEventListener("pointerdown", event => {

    event.preventDefault();

    if (finished) return;

    if (!ready) {

      endGame("Too early! Restart the game.");

      finished = true;
      return;
    }

    const reaction =
      Math.round(performance.now() - startTime);

    setScore(reaction);

    box.textContent =
      `${reaction} ms`;

    finished = true;

    endGame(
      reaction < 300
        ? "🔥 Excellent reaction!"
        : "Good reaction!"
    );
  });

  gameSetTimeout(() => {

    if (finished) return;

    ready = true;
    startTime = performance.now();

    box.style.background =
      "#087d61";

    box.textContent =
      "TAP NOW!";

  }, delay);

  setInstruction("Wait for green, then tap immediately.");

  return () => {};
}


/* =========================================================
   9. MATH SPRINT
   ========================================================= */

function gameMath() {

  html(`
    <div class="game-ui">

      <h3>➗ Math Sprint</h3>

      <div
        class="game-message"
        id="mathQuestion">
      </div>

      <input
        class="game-input"
        id="mathInput"
        type="number"
        placeholder="Answer"
      >

      <button
        class="game-btn"
        id="mathButton">
        SUBMIT
      </button>

    </div>
  `);

  const question = document.getElementById("mathQuestion");
  const input = document.getElementById("mathInput");
  const button = document.getElementById("mathButton");

  let a;
  let b;
  let operator;
  let answer;
  let score = 0;
  let rounds = 0;

  function newQuestion() {

    a = randomNumber(2, 20);
    b = randomNumber(2, 20);

    operator = randomItem(["+", "-", "*"]);

    if (operator === "+") {
      answer = a + b;
    }

    if (operator === "-") {
      answer = a - b;
    }

    if (operator === "*") {
      answer = a * b;
    }

    question.textContent =
      `${a} ${operator} ${b} = ?`;

    input.value = "";
    input.focus();
  }

  function submit() {

    if (Number(input.value) === answer) {

      score += 10;
      setScore(score);

      rounds++;

      if (rounds >= 10) {

        endGame(`🎉 Finished! Score: ${score}`);

        input.disabled = true;
        button.disabled = true;

        return;
      }

      newQuestion();

    } else {

      endGame("Wrong answer. Try again.");
    }
  }

  button.addEventListener("click", submit);

  input.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      submit();
    }
  });

  newQuestion();

  setInstruction("Solve 10 calculations.");

  return () => {};
}


/* =========================================================
   CANVAS KEY STATE HELPER
   ========================================================= */

function keyboardState() {

  const keys = {};

  const down = event => {
    keys[event.key] = true;
    keys[event.code] = true;
  };

  const up = event => {
    keys[event.key] = false;
    keys[event.code] = false;
  };

  document.addEventListener("keydown", down);
  document.addEventListener("keyup", up);

  registerCleanup(() => {
    document.removeEventListener("keydown", down);
    document.removeEventListener("keyup", up);
  });

  return keys;
}


/* =========================================================
   10. BREAKOUT
   ========================================================= */

function gameBreakout() {

  const {canvas, ctx} = canvasSetup(560, 360);

  const keys = keyboardState();

  let paddleX = 230;

  const paddleWidth = 100;
  const paddleHeight = 12;

  let ball = {
    x: 280,
    y: 300,
    dx: 4,
    dy: -4,
    r: 7
  };

  const bricks = [];

  for (let row = 0; row < 5; row++) {

    for (let col = 0; col < 9; col++) {

      bricks.push({
        x: 15 + col * 60,
        y: 35 + row * 25,
        w: 50,
        h: 17,
        alive: true
      });
    }
  }

  let score = 0;
  let over = false;

  function movePaddle() {

    if (
      keys.ArrowLeft ||
      keys.a ||
      keys.A
    ) {
      paddleX -= 7;
    }

    if (
      keys.ArrowRight ||
      keys.d ||
      keys.D
    ) {
      paddleX += 7;
    }

    paddleX =
      Math.max(
        0,
        Math.min(
          canvas.width - paddleWidth,
          paddleX
        )
      );
  }

  function draw() {

    ctx.fillStyle = "#050711";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    bricks.forEach(brick => {

      if (!brick.alive) return;

      ctx.fillStyle = "#7c5cff";

      ctx.fillRect(
        brick.x,
        brick.y,
        brick.w,
        brick.h
      );
    });

    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(
      paddleX,
      canvas.height - 25,
      paddleWidth,
      paddleHeight
    );

    ctx.beginPath();
    ctx.arc(
      ball.x,
      ball.y,
      ball.r,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  function update() {

    if (over) return;

    movePaddle();

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (
      ball.x < ball.r ||
      ball.x > canvas.width - ball.r
    ) {
      ball.dx *= -1;
    }

    if (ball.y < ball.r) {
      ball.dy *= -1;
    }

    if (
      ball.y + ball.r >= canvas.height - 25 &&
      ball.x >= paddleX &&
      ball.x <= paddleX + paddleWidth &&
      ball.dy > 0
    ) {
      ball.dy *= -1;
    }

    for (const brick of bricks) {

      if (!brick.alive) continue;

      if (
        ball.x > brick.x &&
        ball.x < brick.x + brick.w &&
        ball.y > brick.y &&
        ball.y < brick.y + brick.h
      ) {

        brick.alive = false;
        ball.dy *= -1;

        score += 10;
        setScore(score);

        break;
      }
    }

    if (
      ball.y >
      canvas.height + ball.r
    ) {

      over = true;

      endGame(
        `Game Over — Score: ${score}`
      );

      return;
    }

    if (
      bricks.every(brick => !brick.alive)
    ) {

      over = true;

      endGame(
        `🎉 You cleared all blocks!`
      );
    }

    draw();

    if (!over) {
      gameRAF(update);
    }
  }

  addHorizontalControls(
    () => paddleX -= 12,
    () => paddleX += 12
  );

  draw();
  gameRAF(update);

  setInstruction(
    "Use Arrow/A-D keys or touch left/right."
  );

  return () => {};
}


/* =========================================================
   11. PONG
   ========================================================= */

function gamePong() {

  const {canvas, ctx} = canvasSetup(560, 340);

  const keys = keyboardState();

  let playerY = 135;
  let aiY = 135;

  const paddleW = 12;
  const paddleH = 70;

  let ball = {
    x: 280,
    y: 170,
    dx: 4,
    dy: 3
  };

  let playerScore = 0;
  let aiScore = 0;

  let over = false;

  function resetBall(direction) {

    ball = {
      x: 280,
      y: 170,
      dx: 4 * direction,
      dy: randomItem([-3,3])
    };
  }

  function draw() {

    ctx.fillStyle = "#050711";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.setLineDash([8,8]);
    ctx.strokeStyle = "#27304d";

    ctx.beginPath();
    ctx.moveTo(280,0);
    ctx.lineTo(280,340);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      15,
      playerY,
      paddleW,
      paddleH
    );

    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(
      canvas.width - 27,
      aiY,
      paddleW,
      paddleH
    );

    ctx.beginPath();
    ctx.arc(
      ball.x,
      ball.y,
      7,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.font = "bold 28px Arial";
    ctx.fillText(
      playerScore,
      220,
      40
    );

    ctx.fillText(
      aiScore,
      325,
      40
    );
  }

  function update() {

    if (over) return;

    if (
      keys.ArrowUp ||
      keys.w ||
      keys.W
    ) {
      playerY -= 6;
    }

    if (
      keys.ArrowDown ||
      keys.s ||
      keys.S
    ) {
      playerY += 6;
    }

    playerY =
      Math.max(
        0,
        Math.min(
          canvas.height - paddleH,
          playerY
        )
      );

    aiY +=
      (ball.y - (aiY + paddleH / 2)) * .055;

    aiY =
      Math.max(
        0,
        Math.min(
          canvas.height - paddleH,
          aiY
        )
      );

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (
      ball.y < 7 ||
      ball.y > canvas.height - 7
    ) {
      ball.dy *= -1;
    }

    if (
      ball.x < 27 &&
      ball.x > 15 &&
      ball.y > playerY &&
      ball.y < playerY + paddleH
    ) {
      ball.dx = Math.abs(ball.dx);
    }

    if (
      ball.x > canvas.width - 27 &&
      ball.x < canvas.width - 15 &&
      ball.y > aiY &&
      ball.y < aiY + paddleH
    ) {
      ball.dx = -Math.abs(ball.dx);
    }

    if (ball.x < -20) {

      aiScore++;

      resetBall(1);
    }

    if (ball.x > canvas.width + 20) {

      playerScore++;

      setScore(playerScore);

      resetBall(-1);
    }

    if (
      playerScore >= 5 ||
      aiScore >= 5
    ) {

      over = true;

      endGame(
        playerScore > aiScore
          ? "🎉 You won!"
          : "Computer wins!"
      );

      return;
    }

    draw();

    gameRAF(update);
  }

  addVerticalPongControls = null;

  const controls = createControls();

  const row1 = document.createElement("div");
  const row2 = document.createElement("div");

  row1.className = "nexora-control-row";
  row2.className = "nexora-control-row";

  row1.appendChild(
    createButton(
      "▲",
      () => playerY -= 15
    )
  );

  row2.appendChild(
    createButton(
      "▼",
      () => playerY += 15
    )
  );

  controls.appendChild(row1);
  controls.appendChild(row2);

  draw();
  gameRAF(update);

  setInstruction(
    "Use W/S or Arrow keys, or touch ▲/▼."
  );

  return () => {};
}


/* =========================================================
   12. CATCH THE COIN
   ========================================================= */

function gameCatch() {

  const {canvas, ctx} = canvasSetup(500,350);

  const keys = keyboardState();

  let playerX = 215;
  let score = 0;

  const coins = [];

  for (let i = 0; i < 4; i++) {
    coins.push({
      x: randomNumber(20,470),
      y: randomNumber(-300,0),
      speed: randomNumber(2,5)
    });
  }

  let over = false;

  function update() {

    if (over) return;

    if (
      keys.ArrowLeft ||
      keys.a ||
      keys.A
    ) {
      playerX -= 7;
    }

    if (
      keys.ArrowRight ||
      keys.d ||
      keys.D
    ) {
      playerX += 7;
    }

    playerX =
      Math.max(
        0,
        Math.min(
          canvas.width - 70,
          playerX
        )
      );

    ctx.fillStyle = "#050711";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      playerX,
      315,
      70,
      16
    );

    coins.forEach(coin => {

      coin.y += coin.speed;

      if (
        coin.y > 300 &&
        coin.x > playerX - 10 &&
        coin.x < playerX + 80
      ) {

        score++;
        setScore(score);

        coin.y = -20;
        coin.x = randomNumber(20,470);
      }

      if (coin.y > 360) {

        coin.y = -20;
        coin.x = randomNumber(20,470);
      }

      ctx.beginPath();

      ctx.arc(
        coin.x,
        coin.y,
        8,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#ffd43b";
      ctx.fill();
    });

    gameRAF(update);
  }

  addHorizontalControls(
    () => playerX -= 15,
    () => playerX += 15
  );

  gameRAF(update);

  setInstruction(
    "Move left/right and catch the coins."
  );

  return () => {};
}


/* =========================================================
   13. NEON RACER
   ========================================================= */

function gameRacer() {

  const {canvas,ctx} = canvasSetup(420,520);

  const keys = keyboardState();

  let playerX = 180;

  let enemies = [
    {
      x: 70,
      y: -100,
      speed: 4
    },
    {
      x: 280,
      y: -350,
      speed: 5
    }
  ];

  let score = 0;
  let over = false;

  function update() {

    if (over) return;

    if (
      keys.ArrowLeft ||
      keys.a ||
      keys.A
    ) {
      playerX -= 7;
    }

    if (
      keys.ArrowRight ||
      keys.d ||
      keys.D
    ) {
      playerX += 7;
    }

    playerX =
      Math.max(
        20,
        Math.min(
          canvas.width - 65,
          playerX
        )
      );

    ctx.fillStyle = "#050711";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#1a1e30";

    ctx.fillRect(
      30,
      0,
      360,
      canvas.height
    );

    ctx.strokeStyle = "#aaa";
    ctx.setLineDash([25,25]);

    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(140,0);
    ctx.lineTo(140,520);
    ctx.moveTo(280,0);
    ctx.lineTo(280,520);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      playerX,
      440,
      55,
      55
    );

    enemies.forEach(enemy => {

      enemy.y += enemy.speed;

      ctx.fillStyle = "#ff4ecd";

      ctx.fillRect(
        enemy.x,
        enemy.y,
        55,
        55
      );

      if (
        playerX < enemy.x + 55 &&
        playerX + 55 > enemy.x &&
        440 < enemy.y + 55 &&
        495 > enemy.y
      ) {

        over = true;

        endGame(
          `Crash! Score: ${score}`
        );
      }

      if (enemy.y > 540) {

        enemy.y = -80;

        enemy.x =
          randomNumber(45,320);

        enemy.speed =
          randomNumber(3,7);

        score++;

        setScore(score);
      }
    });

    if (!over) {
      gameRAF(update);
    }
  }

  addHorizontalControls(
    () => playerX -= 15,
    () => playerX += 15
  );

  gameRAF(update);

  setInstruction(
    "Use left/right or touch controls."
  );

  return () => {};
}


/* =========================================================
   14. TETRIS
   ========================================================= */

function gameTetris() {

  const {canvas,ctx} = canvasSetup(300,500);

  const cols = 10;
  const rows = 20;
  const size = 25;

  const board =
    Array.from(
      {length: rows},
      () => Array(cols).fill(0)
    );

  const shapes = [
    [[1,1,1,1]],

    [
      [1,1],
      [1,1]
    ],

    [
      [0,1,0],
      [1,1,1]
    ],

    [
      [1,1,0],
      [0,1,1]
    ],

    [
      [0,1,1],
      [1,1,0]
    ]
  ];

  let piece = {
    shape: randomItem(shapes).map(row => [...row]),
    x: 3,
    y: 0
  };

  let score = 0;
  let over = false;

  function collision(shape, x, y) {

    for (let r = 0; r < shape.length; r++) {

      for (let c = 0; c < shape[r].length; c++) {

        if (!shape[r][c]) continue;

        const nx = x + c;
        const ny = y + r;

        if (
          nx < 0 ||
          nx >= cols ||
          ny >= rows ||
          (ny >= 0 && board[ny][nx])
        ) {
          return true;
        }
      }
    }

    return false;
  }

  function rotate() {

    const old = piece.shape;

    const rotated =
      old[0].map(
        (_, index) =>
          old.map(row => row[index]).reverse()
      );

    if (
      !collision(
        rotated,
        piece.x,
        piece.y
      )
    ) {
      piece.shape = rotated;
    }
  }

  function merge() {

    piece.shape.forEach((row,r) => {

      row.forEach((value,c) => {

        if (value) {

          const y = piece.y + r;
          const x = piece.x + c;

          if (y >= 0) {
            board[y][x] = 1;
          }
        }
      });
    });
  }

  function clearLines() {

    for (let r = rows - 1; r >= 0; r--) {

      if (board[r].every(Boolean)) {

        board.splice(r,1);

        board.unshift(
          Array(cols).fill(0)
        );

        score += 100;

        setScore(score);

        r++;
      }
    }
  }

  function newPiece() {

    piece = {
      shape: randomItem(shapes).map(
        row => [...row]
      ),
      x: 3,
      y: 0
    };

    if (
      collision(
        piece.shape,
        piece.x,
        piece.y
      )
    ) {

      over = true;

      endGame(
        `Game Over — Score: ${score}`
      );
    }
  }

  function move(dx) {

    if (
      !collision(
        piece.shape,
        piece.x + dx,
        piece.y
      )
    ) {
      piece.x += dx;
    }
  }

  function drop() {

    if (
      !collision(
        piece.shape,
        piece.x,
        piece.y + 1
      )
    ) {

      piece.y++;

    } else {

      merge();
      clearLines();
      newPiece();
    }
  }

  function draw() {

    ctx.fillStyle = "#050711";
    ctx.fillRect(0,0,300,500);

    board.forEach((row,r) => {

      row.forEach((value,c) => {

        if (!value) return;

        ctx.fillStyle = "#7c5cff";

        ctx.fillRect(
          c * size + 1,
          r * size + 1,
          size - 2,
          size - 2
        );
      });
    });

    piece.shape.forEach((row,r) => {

      row.forEach((value,c) => {

        if (!value) return;

        ctx.fillStyle = "#00e5ff";

        ctx.fillRect(
          (piece.x + c) * size + 1,
          (piece.y + r) * size + 1,
          size - 2,
          size - 2
        );
      });
    });
  }

  function key(event) {

    if (event.key === "ArrowLeft" || event.key === "a") {
      move(-1);
    }

    if (event.key === "ArrowRight" || event.key === "d") {
      move(1);
    }

    if (event.key === "ArrowDown" || event.key === "s") {
      drop();
    }

    if (
      event.key === "ArrowUp" ||
      event.key === "w"
    ) {
      rotate();
    }

    draw();
  }

  document.addEventListener("keydown", key);

  registerCleanup(() => {
    document.removeEventListener("keydown", key);
  });

  const controls = createControls();

  const row1 = document.createElement("div");
  const row2 = document.createElement("div");

  row1.className = "nexora-control-row";
  row2.className = "nexora-control-row";

  row1.appendChild(
    createButton("↻", () => {
      rotate();
      draw();
    })
  );

  row2.appendChild(
    createButton("◀", () => {
      move(-1);
      draw();
    })
  );

  row2.appendChild(
    createButton("▼", () => {
      drop();
      draw();
    })
  );

  row2.appendChild(
    createButton("▶", () => {
      move(1);
      draw();
    })
  );

  controls.appendChild(row1);
  controls.appendChild(row2);

  draw();

  gameSetInterval(() => {

    if (!over) {
      drop();
      draw();
    }

  }, 650);

  setInstruction(
    "Arrow/WASD keys or touch buttons."
  );

  return () => {};
}


/* =========================================================
   15. FLAPPY SKY
   ========================================================= */

function gameFlappy() {

  const {canvas,ctx} = canvasSetup(500,400);

  let birdY = 190;
  let velocity = 0;

  const gravity = .45;
  const jump = -7;

  let pipes = [
    {
      x: 520,
      gapY: randomNumber(120,280)
    }
  ];

  let score = 0;
  let over = false;

  function flap() {

    if (over) return;

    velocity = jump;
  }

  function key(event) {

    if (
      event.code === "Space" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      flap();
    }
  }

  document.addEventListener("keydown", key);

  registerCleanup(() => {
    document.removeEventListener("keydown", key);
  });

  addCanvasPointer(canvas, () => {
    flap();
  });

  addActionControl("🐦 FLAP", flap);

  function update() {

    if (over) return;

    velocity += gravity;
    birdY += velocity;

    pipes.forEach(pipe => {
      pipe.x -= 3;
    });

    if (pipes[pipes.length - 1].x < 280) {

      pipes.push({
        x: 520,
        gapY: randomNumber(110,290)
      });
    }

    if (pipes[0].x < -70) {

      pipes.shift();

      score++;

      setScore(score);
    }

    for (const pipe of pipes) {

      const gap = 105;

      if (
        100 > pipe.x &&
        100 < pipe.x + 65
      ) {

        if (
          birdY < pipe.gapY - gap ||
          birdY > pipe.gapY + gap
        ) {

          over = true;

          endGame(
            `Game Over — Score: ${score}`
          );

          return;
        }
      }
    }

    if (
      birdY < 0 ||
      birdY > canvas.height - 20
    ) {

      over = true;

      endGame(
        `Game Over — Score: ${score}`
      );

      return;
    }

    ctx.fillStyle = "#071226";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    pipes.forEach(pipe => {

      const gap = 105;

      ctx.fillStyle = "#34e89e";

      ctx.fillRect(
        pipe.x,
        0,
        65,
        pipe.gapY - gap
      );

      ctx.fillRect(
        pipe.x,
        pipe.gapY + gap,
        65,
        canvas.height
      );
    });

    ctx.fillStyle = "#ffd43b";

    ctx.beginPath();

    ctx.arc(
      100,
      birdY,
      14,
      0,
      Math.PI * 2
    );

    ctx.fill();

    gameRAF(update);
  }

  gameRAF(update);

  setInstruction(
    "Tap/Space/ArrowUp or use FLAP."
  );

  return () => {};
}


/* =========================================================
   16. 2048
   ========================================================= */

function game2048() {

  html(`
    <div class="game-ui">

      <h3>🔢 2048 Master</h3>

      <div
        class="board-2048"
        id="board2048">
      </div>

    </div>
  `);

  const boardElement =
    document.getElementById("board2048");

  let board =
    Array(16).fill(0);

  let score = 0;

  function addTile() {

    const empty = board
      .map((v,i) => v === 0 ? i : null)
      .filter(v => v !== null);

    if (!empty.length) return;

    board[randomItem(empty)] =
      Math.random() < .9 ? 2 : 4;
  }

  function render() {

    boardElement.innerHTML =
      board.map(value =>
        `<div class="tile-2048">
          ${value || ""}
        </div>`
      ).join("");
  }

  function move(direction) {

    let changed = false;

    function slide(row) {

      const values =
        row.filter(Boolean);

      const result = [];

      for (let i = 0; i < values.length; i++) {

        if (
          values[i] === values[i + 1]
        ) {

          const merged =
            values[i] * 2;

          result.push(merged);

          score += merged;

          i++;

        } else {

          result.push(values[i]);
        }
      }

      while (result.length < 4) {
        result.push(0);
      }

      return result;
    }

    let rows =
      Array.from(
        {length:4},
        (_,r) =>
          board.slice(r * 4, r * 4 + 4)
      );

    if (direction === "left") {

      rows = rows.map(row => {

        const old = [...row];

        const result = slide(row);

        if (
          JSON.stringify(old) !==
          JSON.stringify(result)
        ) {
          changed = true;
        }

        return result;
      });
    }

    if (direction === "right") {

      rows = rows.map(row => {

        const old = [...row];

        const result =
          slide([...row].reverse())
          .reverse();

        if (
          JSON.stringify(old) !==
          JSON.stringify(result)
        ) {
          changed = true;
        }

        return result;
      });
    }

    if (
      direction === "up" ||
      direction === "down"
    ) {

      for (let c = 0; c < 4; c++) {

        let column = [
          board[c],
          board[c + 4],
          board[c + 8],
          board[c + 12]
        ];

        const old = [...column];

        if (direction === "down") {
          column =
            slide([...column].reverse())
            .reverse();
        } else {
          column = slide(column);
        }

        if (
          JSON.stringify(old) !==
          JSON.stringify(column)
        ) {
          changed = true;
        }

        for (let r = 0; r < 4; r++) {
          board[r * 4 + c] = column[r];
        }
      }
    }

    if (
      direction === "left" ||
      direction === "right"
    ) {

      board = rows.flat();
    }

    if (changed) {
      addTile();
      setScore(score);
      render();
    }
  }

  function key(event) {

    const map = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };

    if (map[event.key]) {

      event.preventDefault();

      move(map[event.key]);
    }
  }

  document.addEventListener("keydown", key);

  registerCleanup(() => {
    document.removeEventListener("keydown", key);
  });

  addDPad(move);

  addTile();
  addTile();

  render();

  let startX = 0;
  let startY = 0;

  const boardTouchStart = event => {

    const p = event.touches
      ? event.touches[0]
      : event;

    startX = p.clientX;
    startY = p.clientY;
  };

  const boardTouchEnd = event => {

    const p = event.changedTouches
      ? event.changedTouches[0]
      : event;

    const dx = p.clientX - startX;
    const dy = p.clientY - startY;

    if (
      Math.abs(dx) < 25 &&
      Math.abs(dy) < 25
    ) {
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? "right" : "left");
    } else {
      move(dy > 0 ? "down" : "up");
    }
  };

  boardElement.addEventListener(
    "touchstart",
    boardTouchStart,
    {passive:true}
  );

  boardElement.addEventListener(
    "touchend",
    boardTouchEnd,
    {passive:true}
  );

  registerCleanup(() => {

    boardElement.removeEventListener(
      "touchstart",
      boardTouchStart
    );

    boardElement.removeEventListener(
      "touchend",
      boardTouchEnd
    );
  });

  setInstruction(
    "Swipe, use arrows, or touch the D-pad."
  );

  return () => {};
}


/* =========================================================
   17. MINESWEEPER
   ========================================================= */

function gameMinesweeper() {

  const total = 64;
  const mineCount = 10;

  html(`
    <div class="game-ui">

      <h3>💣 Minesweeper</h3>

      <div
        id="mineGrid"
        style="
          width:min(420px,100%);
          margin:auto;
          display:grid;
          grid-template-columns:repeat(8,1fr);
          gap:4px;
        ">
      </div>

    </div>
  `);

  const grid =
    document.getElementById("mineGrid");

  const mines = new Set();

  while (mines.size < mineCount) {
    mines.add(randomNumber(0,total - 1));
  }

  const buttons = [];

  for (let i = 0; i < total; i++) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.style.aspectRatio = "1";
    button.style.border = "0";
    button.style.borderRadius = "5px";
    button.style.background = "#18213b";
    button.style.color = "#fff";
    button.style.fontWeight = "900";
    button.style.touchAction = "manipulation";

    button.textContent = "?";

    grid.appendChild(button);

    buttons.push(button);
  }

  let safe = 0;
  let gameOver = false;

  function nearby(index) {

    const x = index % 8;
    const y = Math.floor(index / 8);

    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {

      for (let dx = -1; dx <= 1; dx++) {

        if (!dx && !dy) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (
          nx >= 0 &&
          nx < 8 &&
          ny >= 0 &&
          ny < 8
        ) {

          const n = ny * 8 + nx;

          if (mines.has(n)) {
            count++;
          }
        }
      }
    }

    return count;
  }

  buttons.forEach((button,index) => {

    button.addEventListener("click", () => {

      if (gameOver || button.disabled) return;

      if (mines.has(index)) {

        button.textContent = "💣";
        gameOver = true;

        buttons.forEach((b,i) => {
          if (mines.has(i)) {
            b.textContent = "💣";
          }
        });

        endGame("💥 Mine hit! Game over.");

        return;
      }

      const count = nearby(index);

      button.disabled = true;
      button.textContent = count || "✓";
      button.style.background = "#27304d";

      safe++;

      setScore(safe);

      if (safe >= total - mineCount) {

        gameOver = true;

        endGame("🎉 You cleared the minefield!");
      }
    });
  });

  setInstruction(
    "Tap safe squares. Avoid the mines."
  );

  return () => {};
}


/* =========================================================
   18. CONNECT FOUR
   ========================================================= */

function gameConnect4() {

  html(`
    <div class="game-ui">

      <h3>🔴 Connect Four</h3>

      <div
        class="game-message"
        id="connectMessage">
        Your turn
      </div>

      <div
        class="connect-board"
        id="connectBoard">
      </div>

    </div>
  `);

  const boardElement =
    document.getElementById("connectBoard");

  const message =
    document.getElementById("connectMessage");

  const board =
    Array(42).fill(0);

  let player = 1;
  let over = false;

  function render() {

    boardElement.innerHTML =
      board.map((value,index) => {

        let cls = "connect-cell";

        if (value === 1) cls += " red";
        if (value === 2) cls += " yellow";

        return `
          <button
            class="${cls}"
            data-index="${index}">
          </button>
        `;
      }).join("");

    boardElement
      .querySelectorAll(".connect-cell")
      .forEach((cell,index) => {

        cell.addEventListener(
          "click",
          () => drop(index % 7)
        );
      });
  }

  function checkWin(playerNumber) {

    const directions = [
      [1,0],
      [0,1],
      [1,1],
      [1,-1]
    ];

    for (let index = 0; index < 42; index++) {

      if (board[index] !== playerNumber) {
        continue;
      }

      const x = index % 7;
      const y = Math.floor(index / 7);

      for (const [dx,dy] of directions) {

        let count = 1;

        for (let step = 1; step < 4; step++) {

          const nx = x + dx * step;
          const ny = y + dy * step;

          if (
            nx < 0 ||
            nx >= 7 ||
            ny < 0 ||
            ny >= 6
          ) break;

          if (
            board[ny * 7 + nx] === playerNumber
          ) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 4) return true;
      }
    }

    return false;
  }

  function drop(column) {

    if (over) return;

    for (let row = 5; row >= 0; row--) {

      const index = row * 7 + column;

      if (!board[index]) {

        board[index] = player;

        if (checkWin(player)) {

          over = true;

          message.textContent =
            player === 1
              ? "🎉 You win!"
              : "Computer wins!";

          if (player === 1) {
            setScore(1);
          }

          render();

          return;
        }

        if (board.every(Boolean)) {

          over = true;

          message.textContent = "Draw!";
          render();

          return;
        }

        player = 2;

        render();

        message.textContent =
          "Computer thinking...";

        gameSetTimeout(aiMove,350);

        return;
      }
    }
  }

  function aiMove() {

    if (over) return;

    const possible = [];

    for (let c = 0; c < 7; c++) {

      if (!board[c]) {
        possible.push(c);
      }
    }

    if (!possible.length) return;

    const column = randomItem(possible);

    for (let row = 5; row >= 0; row--) {

      const index = row * 7 + column;

      if (!board[index]) {

        board[index] = 2;

        break;
      }
    }

    if (checkWin(2)) {

      over = true;

      message.textContent =
        "Computer wins!";

      render();

      return;
    }

    player = 1;

    message.textContent =
      "Your turn";

    render();
  }

  render();

  setInstruction(
    "Tap a column to drop your piece."
  );

  return () => {};
}


/* =========================================================
   19. AIR HOCKEY
   ========================================================= */

function gameAirHockey() {

  const {canvas,ctx} = canvasSetup(560,340);

  let playerX = 280;
  let playerY = 285;

  let puck = {
    x: 280,
    y: 170,
    dx: 4,
    dy: 3
  };

  let score = 0;
  let over = false;

  function movePlayer(point) {

    playerX =
      Math.max(
        30,
        Math.min(
          canvas.width - 30,
          point.x
        )
      );

    playerY =
      Math.max(
        canvas.height / 2 + 20,
        Math.min(
          canvas.height - 30,
          point.y
        )
      );
  }

  addCanvasMove(canvas, movePlayer);

  addCanvasPointer(canvas, movePlayer);

  function update() {

    if (over) return;

    puck.x += puck.dx;
    puck.y += puck.dy;

    if (
      puck.x < 10 ||
      puck.x > canvas.width - 10
    ) {
      puck.dx *= -1;
    }

    if (puck.y < 10) {
      puck.dy *= -1;
    }

    const dx =
      puck.x - playerX;

    const dy =
      puck.y - playerY;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    if (distance < 35) {

      puck.dy = -Math.abs(puck.dy);
      puck.dx += dx * .08;
    }

    if (puck.y > canvas.height + 20) {

      over = true;

      endGame(
        `Goal! Score: ${score}`
      );

      return;
    }

    if (puck.y < -20) {

      score++;

      setScore(score);

      puck = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: randomItem([-4,4]),
        dy: 3
      };
    }

    ctx.fillStyle = "#06111e";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;

    ctx.strokeRect(
      5,
      5,
      canvas.width - 10,
      canvas.height - 10
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      canvas.height / 2
    );

    ctx.lineTo(
      canvas.width,
      canvas.height / 2
    );

    ctx.stroke();

    ctx.fillStyle = "#7c5cff";

    ctx.beginPath();

    ctx.arc(
      playerX,
      playerY,
      22,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#00e5ff";

    ctx.beginPath();

    ctx.arc(
      puck.x,
      puck.y,
      10,
      0,
      Math.PI * 2
    );

    ctx.fill();

    gameRAF(update);
  }

  gameRAF(update);

  setInstruction(
    "Drag your paddle with mouse or finger."
  );

  return () => {};
}


/* =========================================================
   20. TARGET SHOOTER
   ========================================================= */

function gameTarget() {

  const {canvas,ctx} = canvasSetup(500,400);

  let target = {
    x: 100,
    y: 100,
    r: 25,
    dx: 3,
    dy: 2
  };

  let score = 0;

  addCanvasPointer(canvas, point => {

    const distance =
      Math.hypot(
        point.x - target.x,
        point.y - target.y
      );

    if (distance <= target.r) {

      score++;

      setScore(score);

      target.x =
        randomNumber(40,460);

      target.y =
        randomNumber(40,360);

      target.dx =
        randomItem([-3,3]);

      target.dy =
        randomItem([-2,2]);
    }
  });

  function update() {

    target.x += target.dx;
    target.y += target.dy;

    if (
      target.x < target.r ||
      target.x > canvas.width - target.r
    ) {
      target.dx *= -1;
    }

    if (
      target.y < target.r ||
      target.y > canvas.height - target.r
    ) {
      target.dy *= -1;
    }

    ctx.fillStyle = "#050711";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.beginPath();

    ctx.arc(
      target.x,
      target.y,
      target.r,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#ff4ecd";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(
      target.x,
      target.y,
      target.r * .45,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#00e5ff";
    ctx.fill();

    gameRAF(update);
  }

  gameRAF(update);

  setInstruction(
    "Tap/click the moving target."
  );

  return () => {};
}


/* =========================================================
   21. JUMP RUNNER
   ========================================================= */

function gameRunner() {

  const {canvas,ctx} = canvasSetup(500,300);

  let playerY = 230;
  let velocity = 0;

  let obstacles = [
    {
      x: 520,
      y: 240,
      w: 30,
      h: 60
    }
  ];

  let score = 0;
  let over = false;

  function jump() {

    if (over) return;

    if (playerY >= 225) {
      velocity = -10;
    }
  }

  function key(event) {

    if (
      event.code === "Space" ||
      event.key === "ArrowUp"
    ) {

      event.preventDefault();

      jump();
    }
  }

  document.addEventListener("keydown", key);

  registerCleanup(() => {
    document.removeEventListener("keydown", key);
  });

  addCanvasPointer(canvas, jump);

  addActionControl("🏃 JUMP", jump);

  function update() {

    if (over) return;

    velocity += .55;

    playerY += velocity;

    if (playerY > 230) {
      playerY = 230;
      velocity = 0;
    }

    obstacles.forEach(obstacle => {
      obstacle.x -= 5;
    });

    if (
      obstacles[obstacles.length - 1].x < 300
    ) {

      obstacles.push({
        x: 520,
        y: randomNumber(220,245),
        w: 30,
        h: 60
      });
    }

    if (obstacles[0].x < -50) {

      obstacles.shift();

      score++;

      setScore(score);
    }

    for (const obstacle of obstacles) {

      if (
        80 < obstacle.x + obstacle.w &&
        80 + 40 > obstacle.x &&
        playerY + 40 > obstacle.y
      ) {

        over = true;

        endGame(
          `Game Over — Score: ${score}`
        );

        return;
      }
    }

    ctx.fillStyle = "#07111f";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#222c43";

    ctx.fillRect(
      0,
      270,
      canvas.width,
      30
    );

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      80,
      playerY,
      40,
      40
    );

    obstacles.forEach(obstacle => {

      ctx.fillStyle = "#ff4ecd";

      ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.w,
        obstacle.h
      );
    });

    gameRAF(update);
  }

  gameRAF(update);

  setInstruction(
    "Tap, Space, ArrowUp or JUMP."
  );

  return () => {};
}


/* =========================================================
   22. SPACE INVADERS
   ========================================================= */

function gameSpace() {

  const {canvas,ctx} = canvasSetup(500,400);

  const keys = keyboardState();

  let playerX = 230;

  let bullets = [];

  let enemies = [];

  for (let row = 0; row < 3; row++) {

    for (let col = 0; col < 8; col++) {

      enemies.push({
        x: 55 + col * 50,
        y: 40 + row * 35,
        alive: true
      });
    }
  }

  let score = 0;
  let over = false;
  let lastShot = 0;

  function shoot() {

    if (over) return;

    const now = Date.now();

    if (now - lastShot < 180) {
      return;
    }

    lastShot = now;

    bullets.push({
      x: playerX + 20,
      y: 350
    });
  }

  function key(event) {

    if (event.code === "Space") {
      event.preventDefault();
      shoot();
    }
  }

  document.addEventListener("keydown", key);

  registerCleanup(() => {
    document.removeEventListener("keydown", key);
  });

  addDualActionControls(
    "◀",
    () => playerX -= 15,
    "▶",
    () => playerX += 15
  );

  addActionControl("🚀 FIRE", shoot);

  function update() {

    if (over) return;

    if (
      keys.ArrowLeft ||
      keys.a ||
      keys.A
    ) {
      playerX -= 5;
    }

    if (
      keys.ArrowRight ||
      keys.d ||
      keys.D
    ) {
      playerX += 5;
    }

    playerX =
      Math.max(
        0,
        Math.min(
          canvas.width - 40,
          playerX
        )
      );

    bullets.forEach(bullet => {
      bullet.y -= 7;
    });

    bullets =
      bullets.filter(
        bullet => bullet.y > -10
      );

    bullets.forEach(bullet => {

      enemies.forEach(enemy => {

        if (!enemy.alive) return;

        if (
          bullet.x > enemy.x &&
          bullet.x < enemy.x + 30 &&
          bullet.y > enemy.y &&
          bullet.y < enemy.y + 20
        ) {

          enemy.alive = false;

          bullet.y = -100;

          score += 10;

          setScore(score);
        }
      });
    });

    const alive =
      enemies.filter(e => e.alive);

    alive.forEach(enemy => {
      enemy.y += .15;
    });

    if (
      alive.length === 0
    ) {

      over = true;

      endGame(
        `🎉 Victory! Score: ${score}`
      );

      return;
    }

    if (
      alive.some(
        enemy => enemy.y > 350
      )
    ) {

      over = true;

      endGame(
        `Invaders reached you!`
      );

      return;
    }

    ctx.fillStyle = "#030611";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    enemies.forEach(enemy => {

      if (!enemy.alive) return;

      ctx.fillStyle = "#34e89e";

      ctx.fillRect(
        enemy.x,
        enemy.y,
        30,
        20
      );
    });

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      playerX,
      365,
      40,
      15
    );

    ctx.fillStyle = "#fff";

    bullets.forEach(bullet => {

      ctx.fillRect(
        bullet.x,
        bullet.y,
        3,
        10
      );
    });

    gameRAF(update);
  }

  gameRAF(update);

  setInstruction(
    "Move with arrows/A-D and fire with Space or FIRE."
  );

  return () => {};
}


/* =========================================================
   23. SIMON MEMORY
   ========================================================= */

function gameSimon() {

  html(`
    <div class="game-ui">

      <h3>🧠 Simon Memory</h3>

      <div
        class="game-message"
        id="simonMessage">
        Watch the sequence
      </div>

      <div class="simon-grid">

        <button class="simon-btn simon-0"
          data-index="0"></button>

        <button class="simon-btn simon-1"
          data-index="1"></button>

        <button class="simon-btn simon-2"
          data-index="2"></button>

        <button class="simon-btn simon-3"
          data-index="3"></button>

      </div>

    </div>
  `);

  const buttons = [
    ...document.querySelectorAll(".simon-btn")
  ];

  const message =
    document.getElementById("simonMessage");

  let sequence = [];
  let playerIndex = 0;
  let locked = true;
  let round = 0;

  function flash(index) {

    const button = buttons[index];

    button.classList.add("active");

    gameSetTimeout(() => {
      button.classList.remove("active");
    }, 300);
  }

  function playSequence() {

    locked = true;

    message.textContent =
      "Watch carefully...";

    sequence.forEach((value,index) => {

      gameSetTimeout(() => {
        flash(value);
      }, 550 * (index + 1));
    });

    gameSetTimeout(() => {

      locked = false;
      playerIndex = 0;

      message.textContent =
        "Your turn!";

    }, 550 * sequence.length + 400);
  }

  function nextRound() {

    round++;

    sequence.push(
      randomNumber(0,3)
    );

    playSequence();
  }

  buttons.forEach((button,index) => {

    button.addEventListener("click", () => {

      if (locked) return;

      flash(index);

      if (
        index !== sequence[playerIndex]
      ) {

        locked = true;

        endGame(
          `Game Over — Round ${round}`
        );

        return;
      }

      playerIndex++;

      if (
        playerIndex === sequence.length
      ) {

        setScore(round);

        gameSetTimeout(
          nextRound,
          500
        );
      }
    });
  });

  nextRound();

  setInstruction(
    "Repeat the glowing color sequence."
  );

  return () => {};
}


/* =========================================================
   24. WORD SCRAMBLE
   ========================================================= */

function gameWord() {

  const words = [
    "GAMING",
    "NEXORA",
    "ROCKET",
    "PLAYER",
    "PUZZLE",
    "RACING",
    "ACTION",
    "BROWSER"
  ];

  const answer =
    randomItem(words);

  const scrambled =
    answer
      .split("")
      .sort(() => Math.random() - .5)
      .join("");

  html(`
    <div class="game-ui">

      <h3>🔤 Word Scramble</h3>

      <div class="word-display">
        ${scrambled}
      </div>

      <input
        class="game-input"
        id="wordInput"
        placeholder="Unscramble the word"
        autocomplete="off"
      >

      <button
        class="game-btn"
        id="wordButton">
        CHECK
      </button>

      <div
        class="game-message"
        id="wordMessage">
      </div>

    </div>
  `);

  const input =
    document.getElementById("wordInput");

  const button =
    document.getElementById("wordButton");

  const message =
    document.getElementById("wordMessage");

  function check() {

    if (
      input.value.trim().toUpperCase() ===
      answer
    ) {

      setScore(100);

      message.textContent =
        "🎉 Correct!";

      input.disabled = true;
      button.disabled = true;

    } else {

      message.textContent =
        "Try again.";
    }
  }

  button.addEventListener("click", check);

  input.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      check();
    }
  });

  setInstruction(
    "Type the correct word."
  );

  return () => {};
}


/* =========================================================
   25. COIN COLLECTOR
   ========================================================= */

function gameCollector() {

  const {canvas,ctx} = canvasSetup(500,400);

  const keys = keyboardState();

  let player = {
    x: 230,
    y: 180,
    size: 28
  };

  let coins = [];

  for (let i = 0; i < 6; i++) {

    coins.push({
      x: randomNumber(20,470),
      y: randomNumber(20,370)
    });
  }

  let score = 0;

  function update() {

    if (
      keys.ArrowLeft ||
      keys.a ||
      keys.A
    ) {
      player.x -= 5;
    }

    if (
      keys.ArrowRight ||
      keys.d ||
      keys.D
    ) {
      player.x += 5;
    }

    if (
      keys.ArrowUp ||
      keys.w ||
      keys.W
    ) {
      player.y -= 5;
    }

    if (
      keys.ArrowDown ||
      keys.s ||
      keys.S
    ) {
      player.y += 5;
    }

    player.x =
      Math.max(
        0,
        Math.min(
          canvas.width - player.size,
          player.x
        )
      );

    player.y =
      Math.max(
        0,
        Math.min(
          canvas.height - player.size,
          player.y
        )
      );

    coins = coins.filter(coin => {

      const hit =
        Math.hypot(
          player.x + player.size / 2 - coin.x,
          player.y + player.size / 2 - coin.y
        ) < 25;

      if (hit) {

        score++;

        setScore(score);

        return false;
      }

      return true;
    });

    if (!coins.length) {

      for (let i = 0; i < 6; i++) {

        coins.push({
          x: randomNumber(20,470),
          y: randomNumber(20,370)
        });
      }
    }

    ctx.fillStyle = "#050711";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    coins.forEach(coin => {

      ctx.beginPath();

      ctx.arc(
        coin.x,
        coin.y,
        10,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#ffd43b";

      ctx.fill();
    });

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      player.x,
      player.y,
      player.size,
      player.size
    );

    gameRAF(update);
  }

  addDPad(dir => {

    const amount = 18;

    if (dir === "left") player.x -= amount;
    if (dir === "right") player.x += amount;
    if (dir === "up") player.y -= amount;
    if (dir === "down") player.y += amount;
  });

  gameRAF(update);

  setInstruction(
    "Move with WASD/Arrows or the touch D-pad."
  );

  return () => {};
}


/* =========================================================
   26. AVOID THE BLOCKS
   ========================================================= */

function gameAvoid() {

  const {canvas,ctx} = canvasSetup(500,400);

  const keys = keyboardState();

  let playerX = 230;
  let playerY = 330;

  let blocks = [];

  for (let i = 0; i < 5; i++) {

    blocks.push({
      x: randomNumber(10,470),
      y: randomNumber(-400,0),
      size: 25,
      speed: randomNumber(2,5)
    });
  }

  let score = 0;
  let over = false;

  function update() {

    if (over) return;

    if (
      keys.ArrowLeft ||
      keys.a ||
      keys.A
    ) {
      playerX -= 5;
    }

    if (
      keys.ArrowRight ||
      keys.d ||
      keys.D
    ) {
      playerX += 5;
    }

    if (
      keys.ArrowUp ||
      keys.w ||
      keys.W
    ) {
      playerY -= 5;
    }

    if (
      keys.ArrowDown ||
      keys.s ||
      keys.S
    ) {
      playerY += 5;
    }

    playerX =
      Math.max(
        0,
        Math.min(
          canvas.width - 25,
          playerX
        )
      );

    playerY =
      Math.max(
        0,
        Math.min(
          canvas.height - 25,
          playerY
        )
      );

    blocks.forEach(block => {

      block.y += block.speed;

      if (block.y > canvas.height) {

        block.y = -30;

        block.x =
          randomNumber(0,470);

        score++;

        setScore(score);
      }

      if (
        playerX < block.x + block.size &&
        playerX + 25 > block.x &&
        playerY < block.y + block.size &&
        playerY + 25 > block.y
      ) {

        over = true;

        endGame(
          `Hit! Survived with score ${score}`
        );
      }
    });

    ctx.fillStyle = "#050711";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#7c5cff";

    ctx.fillRect(
      playerX,
      playerY,
      25,
      25
    );

    blocks.forEach(block => {

      ctx.fillStyle = "#ff4ecd";

      ctx.fillRect(
        block.x,
        block.y,
        block.size,
        block.size
      );
    });

    if (!over) {
      gameRAF(update);
    }
  }

  addDPad(dir => {

    const amount = 18;

    if (dir === "left") playerX -= amount;
    if (dir === "right") playerX += amount;
    if (dir === "up") playerY -= amount;
    if (dir === "down") playerY += amount;
  });

  gameRAF(update);

  setInstruction(
    "Avoid blocks using keyboard or touch D-pad."
  );

  return () => {};
}


/* =========================================================
   GAME REGISTRY
   ========================================================= */

const games = {

  tictactoe: gameTicTacToe,
  memory: gameMemory,
  guess: gameGuess,
  rps: gameRPS,
  clicker: gameClicker,
  snake: gameSnake,
  whack: gameWhack,
  reaction: gameReaction,
  math: gameMath,
  breakout: gameBreakout,
  pong: gamePong,
  catch: gameCatch,
  racer: gameRacer,
  tetris: gameTetris,
  flappy: gameFlappy,
  "2048": game2048,
  minesweeper: gameMinesweeper,
  connect4: gameConnect4,
  airhockey: gameAirHockey,
  target: gameTarget,
  runner: gameRunner,
  space: gameSpace,
  simon: gameSimon,
  word: gameWord,
  collector: gameCollector,
  avoid: gameAvoid
};


/* =========================================================
   LAUNCH GAME
   ========================================================= */

function launchGame(gameKey, title) {

  if (!games[gameKey]) {

    showToast(
      "Game is currently unavailable."
    );

    return;
  }

  cleanupEverything();

  currentGame = gameKey;
  currentTitle = title;

  titleEl.textContent = title;

  setScore(0);

  setInstruction(
    "Loading game..."
  );

  stage.innerHTML = "";

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  try {

    cleanupGame =
      games[gameKey]() || (() => {});

  } catch (error) {

    console.error(
      `NEXORA game error: ${gameKey}`,
      error
    );

    stage.innerHTML = `
      <div class="game-ui">
        <h3>Game Error</h3>
        <div class="game-message">
          This game could not start.
        </div>
        <button
          class="game-btn"
          onclick="location.reload()">
          RELOAD
        </button>
      </div>
    `;

    setInstruction(
      "Please restart the game."
    );
  }
}


/* =========================================================
   CLOSE GAME
   ========================================================= */

function closeGame() {

  cleanupEverything();

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  stage.innerHTML = "";

  document.body.style.overflow = "";

  currentGame = null;
  currentTitle = "";
}


/* =========================================================
   RESTART GAME
   ========================================================= */

function restartCurrentGame() {

  if (!currentGame) return;

  launchGame(
    currentGame,
    currentTitle
  );
}


/* =========================================================
   GAME CARD EVENTS
   ========================================================= */

document
  .querySelectorAll(".game-card")
  .forEach(card => {

    const gameKey =
      card.dataset.game;

    const title =
      card.dataset.title;

    card.addEventListener("click", event => {

      if (
        event.target.closest(".play-btn")
      ) {
        event.stopPropagation();
      }

      launchGame(
        gameKey,
        title
      );
    });

    const playButton =
      card.querySelector(".play-btn");

    if (playButton) {

      playButton.addEventListener(
        "click",
        event => {

          event.preventDefault();
          event.stopPropagation();

          launchGame(
            gameKey,
            title
          );
        }
      );
    }
  });


/* =========================================================
   MODAL EVENTS
   ========================================================= */

if (closeBtn) {
  closeBtn.addEventListener(
    "click",
    closeGame
  );
}

if (restartBtn) {
  restartBtn.addEventListener(
    "click",
    restartCurrentGame
  );
}

if (modal) {

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {
        closeGame();
      }
    }
  );
}


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal &&
      modal.classList.contains("open")
    ) {
      closeGame();
    }
  }
);


/* =========================================================
   SEARCH + CATEGORY FILTER
   ========================================================= */

let activeCategory = "all";

const gameCards =
  [...document.querySelectorAll(".game-card")];

function filterGames() {

  const search =
    (searchInput?.value || "")
      .trim()
      .toLowerCase();

  let visible = 0;

  gameCards.forEach(card => {

    const title =
      (
        card.dataset.title || ""
      ).toLowerCase();

    const category =
      (
        card.dataset.category || ""
      ).toLowerCase();

    const matchesSearch =
      !search ||
      title.includes(search);

    const matchesCategory =
      activeCategory === "all" ||
      category === activeCategory;

    const show =
      matchesSearch &&
      matchesCategory;

    card.classList.toggle(
      "hidden",
      !show
    );

    if (show) {
      visible++;
    }
  });

  if (visibleCount) {
    visibleCount.textContent =
      visible;
  }

  if (noResults) {

    noResults.classList.toggle(
      "show",
      visible === 0
    );
  }
}


if (searchInput) {

  searchInput.addEventListener(
    "input",
    filterGames
  );
}


document
  .querySelectorAll(".category-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".category-btn")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        button.classList.add("active");

        activeCategory =
          button.dataset.category || "all";

        filterGames();
      }
    );
  });


/* =========================================================
   INITIALIZE
   ========================================================= */

filterGames();

console.log(
  "NEXORA Gaming Portal loaded successfully."
);

console.log(
  `${gameCards.length} game cards available.`
);

console.log(
  "Universal controls: Keyboard + Mouse + Touch + Mobile D-Pad."
);
