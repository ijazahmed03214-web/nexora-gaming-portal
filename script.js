/* =========================================================
   NEXORA GAMING PORTAL
   38 PLAYABLE GAMES
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


/* =========================================================
   HELPERS
   ========================================================= */

function setScore(value) {
  scoreEl.textContent = value;
}

function setInstruction(text) {
  instructionEl.textContent = text;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function html(content) {
  stage.innerHTML = content;
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function canvasSetup(width, height) {
  stage.innerHTML = `
    <div class="game-ui">
      <canvas class="canvas-game" width="${width}" height="${height}"></canvas>
    </div>
  `;

  return stage.querySelector("canvas");
}

function endGame(message) {
  setInstruction(message);
}


/* =========================================================
   TIC TAC TOE
   ========================================================= */

function gameTicTacToe() {

  html(`
    <div class="game-ui">
      <h3>❌ Neon Tic Tac Toe</h3>
      <div class="game-message" id="gameMsg">
        Your turn — you are X
      </div>
      <div class="ttt-board" id="tttBoard"></div>
    </div>
  `);

  const boardEl = document.getElementById("tttBoard");

  let board = Array(9).fill("");
  let active = true;
  let aiTimer;

  const wins = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ];

  function winner(player) {
    return wins.some(combo =>
      combo.every(i => board[i] === player)
    );
  }

  function draw() {
    boardEl.innerHTML = "";

    board.forEach((value, i) => {

      const cell = document.createElement("button");
      cell.className = "ttt-cell";
      cell.textContent = value;

      cell.onclick = () => {

        if (!active || board[i]) return;

        board[i] = "X";
        render();

        if (winner("X")) {
          active = false;
          setScore(1);
          document.getElementById("gameMsg").textContent =
            "🎉 You won!";
          return;
        }

        if (!board.includes("")) {
          active = false;
          document.getElementById("gameMsg").textContent =
            "Draw!";
          return;
        }

        aiTimer = setTimeout(aiMove, 350);
      };

      boardEl.appendChild(cell);
    });
  }

  function render() {
    draw();
  }

  function aiMove() {

    if (!active) return;

    const empty = board
      .map((v,i) => v ? null : i)
      .filter(v => v !== null);

    if (!empty.length) return;

    let move = empty.includes(4)
      ? 4
      : randomItem(empty);

    board[move] = "O";

    render();

    if (winner("O")) {
      active = false;
      document.getElementById("gameMsg").textContent =
        "Computer wins. Try again!";
    }
    else if (!board.includes("")) {
      active = false;
      document.getElementById("gameMsg").textContent =
        "Draw!";
    }
  }

  render();

  return () => {
    clearTimeout(aiTimer);
  };
}


/* =========================================================
   MEMORY
   ========================================================= */

function gameMemory() {

  const emojis = [
    "🚀","🎮","🔥","⭐",
    "⚡","👾","🎯","💎"
  ];

  let cards = [...emojis,...emojis]
    .sort(() => Math.random() - .5);

  html(`
    <div class="game-ui">
      <h3>🧠 Memory Match</h3>
      <div class="game-message" id="memoryMsg">
        Find all pairs.
      </div>
      <div class="memory-grid" id="memoryGrid"></div>
    </div>
  `);

  const grid = document.getElementById("memoryGrid");

  let first = null;
  let second = null;
  let lock = false;
  let matches = 0;
  let timer;

  cards.forEach((emoji,index) => {

    const card = document.createElement("button");

    card.className = "memory-card";
    card.textContent = "?";

    card.onclick = () => {

      if (lock || card.classList.contains("matched")) return;

      card.classList.add("flipped");
      card.textContent = emoji;

      if (first === null) {
        first = {card,emoji};
        return;
      }

      second = {card,emoji};
      lock = true;

      if (first.emoji === second.emoji) {

        first.card.classList.add("matched");
        second.card.classList.add("matched");

        matches++;
        setScore(matches);

        first = null;
        second = null;
        lock = false;

        if (matches === emojis.length) {
          document.getElementById("memoryMsg").textContent =
            "🎉 All pairs found!";
        }

      } else {

        timer = setTimeout(() => {

          first.card.classList.remove("flipped");
          second.card.classList.remove("flipped");

          first.card.textContent = "?";
          second.card.textContent = "?";

          first = null;
          second = null;
          lock = false;

        },700);
      }
    };

    grid.appendChild(card);
  });

  return () => clearTimeout(timer);
}


/* =========================================================
   GUESS NUMBER
   ========================================================= */

function gameGuess() {

  const secret = randomNumber(1,100);
  let attempts = 0;

  html(`
    <div class="game-ui">
      <h3>🔢 Number Hunter</h3>
      <div class="game-message" id="guessMsg">
        Guess a number between 1 and 100.
      </div>

      <input
        id="guessInput"
        class="game-input"
        type="number"
        min="1"
        max="100"
        placeholder="Enter your guess"
      >

      <button class="game-btn" id="guessBtn">
        CHECK NUMBER
      </button>
    </div>
  `);

  const input = document.getElementById("guessInput");
  const btn = document.getElementById("guessBtn");
  const msg = document.getElementById("guessMsg");

  function check() {

    const value = Number(input.value);

    if (!value) return;

    attempts++;

    if (value === secret) {

      setScore(Math.max(1,101-attempts));

      msg.textContent =
        `🎉 Correct! You found it in ${attempts} attempts.`;

      btn.disabled = true;

    } else if (value < secret) {

      msg.textContent = "⬆️ Try a higher number.";

    } else {

      msg.textContent = "⬇️ Try a lower number.";

    }
  }

  btn.onclick = check;

  input.onkeydown = e => {
    if (e.key === "Enter") check();
  };

  return () => {};
}


/* =========================================================
   ROCK PAPER SCISSORS
   ========================================================= */

function gameRPS() {

  let playerScore = 0;
  let computerScore = 0;

  html(`
    <div class="game-ui">
      <h3>✊ RPS Arena</h3>

      <div class="game-message" id="rpsMsg">
        Choose your move.
      </div>

      <div class="choice-row">

        <button class="choice-btn" data-rps="rock">
          ✊
        </button>

        <button class="choice-btn" data-rps="paper">
          ✋
        </button>

        <button class="choice-btn" data-rps="scissors">
          ✌️
        </button>

      </div>
    </div>
  `);

  const msg = document.getElementById("rpsMsg");

  document.querySelectorAll("[data-rps]").forEach(btn => {

    btn.onclick = () => {

      const player = btn.dataset.rps;
      const computer = randomItem([
        "rock",
        "paper",
        "scissors"
      ]);

      if (player === computer) {
        msg.textContent =
          `Draw! Computer chose ${computer}.`;
        return;
      }

      const win =
        (player === "rock" && computer === "scissors") ||
        (player === "paper" && computer === "rock") ||
        (player === "scissors" && computer === "paper");

      if (win) {
        playerScore++;
        setScore(playerScore);
        msg.textContent =
          `🎉 You win! Computer chose ${computer}.`;
      } else {
        computerScore++;
        msg.textContent =
          `Computer wins. It chose ${computer}.`;
      }
    };
  });

  return () => {};
}


/* =========================================================
   CLICK RUSH
   ========================================================= */

function gameClicker() {

  let score = 0;
  let time = 10;
  let running = false;
  let interval;

  html(`
    <div class="game-ui">
      <h3>👆 Click Rush</h3>

      <div class="game-message" id="clickMsg">
        Press START and click the button!
      </div>

      <button class="game-btn" id="clickStart">
        START 10 SECONDS
      </button>

      <div style="margin-top:25px">
        <button
          id="bigClick"
          class="choice-btn"
          style="font-size:45px;width:170px;height:170px"
        >
          👆
        </button>
      </div>
    </div>
  `);

  const start = document.getElementById("clickStart");
  const target = document.getElementById("bigClick");
  const msg = document.getElementById("clickMsg");

  target.onclick = () => {

    if (!running) return;

    score++;
    setScore(score);

    target.style.transform =
      `scale(${0.9 + Math.random()*.2})`;
  };

  start.onclick = () => {

    if (running) return;

    running = true;
    score = 0;
    time = 10;

    setScore(0);

    start.disabled = true;

    interval = setInterval(() => {

      time--;

      msg.textContent =
        `Time remaining: ${time}s`;

      if (time <= 0) {

        clearInterval(interval);
        running = false;
        start.disabled = false;

        msg.textContent =
          `⏱️ Time up! Your score is ${score}.`;
      }

    },1000);
  };

  return () => clearInterval(interval);
}


/* =========================================================
   SNAKE
   ========================================================= */

function gameSnake() {

  const canvas = canvasSetup(360,360);
  const ctx = canvas.getContext("2d");

  let snake = [
    {x:10,y:10},
    {x:9,y:10},
    {x:8,y:10}
  ];

  let dir = {x:1,y:0};
  let nextDir = {...dir};

  let food = {
    x:randomNumber(1,18),
    y:randomNumber(1,18)
  };

  let score = 0;
  let running = true;
  let timer;

  setInstruction("Use Arrow Keys or WASD.");

  function draw() {

    ctx.fillStyle = "#050711";
    ctx.fillRect(0,0,360,360);

    ctx.strokeStyle = "rgba(255,255,255,.04)";

    for(let i=0;i<=20;i++){

      ctx.beginPath();
      ctx.moveTo(i*18,0);
      ctx.lineTo(i*18,360);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0,i*18);
      ctx.lineTo(360,i*18);
      ctx.stroke();
    }

    ctx.fillStyle = "#ff4ecd";
    ctx.fillRect(food.x*18+3,food.y*18+3,12,12);

    snake.forEach((part,index) => {

      ctx.fillStyle =
        index === 0 ? "#00e5ff" : "#7c5cff";

      ctx.fillRect(
        part.x*18+2,
        part.y*18+2,
        14,
        14
      );
    });
  }

  function update() {

    dir = nextDir;

    const head = {
      x:snake[0].x + dir.x,
      y:snake[0].y + dir.y
    };

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= 20 ||
      head.y >= 20 ||
      snake.some(p => p.x === head.x && p.y === head.y)
    ) {

      running = false;
      endGame(`Game over! Score: ${score}`);
      return;
    }

    snake.unshift(head);

    if (
      head.x === food.x &&
      head.y === food.y
    ) {

      score++;
      setScore(score);

      food = {
        x:randomNumber(0,19),
        y:randomNumber(0,19)
      };

    } else {

      snake.pop();
    }

    draw();
  }

  function key(e) {

    const k = e.key.toLowerCase();

    if ((k==="arrowup" || k==="w") && dir.y !== 1)
      nextDir = {x:0,y:-1};

    if ((k==="arrowdown" || k==="s") && dir.y !== -1)
      nextDir = {x:0,y:1};

    if ((k==="arrowleft" || k==="a") && dir.x !== 1)
      nextDir = {x:-1,y:0};

    if ((k==="arrowright" || k==="d") && dir.x !== -1)
      nextDir = {x:1,y:0};
  }

  document.addEventListener("keydown",key);

  draw();

  timer = setInterval(() => {

    if (running) update();

  },120);

  return () => {

    clearInterval(timer);
    document.removeEventListener("keydown",key);
  };
}


/* =========================================================
   WHACK ATTACK
   ========================================================= */

function gameWhack() {

  let score = 0;
  let time = 20;
  let active = -1;
  let moveTimer;
  let clock;

  html(`
    <div class="game-ui">

      <h3>🔨 Whack Attack</h3>

      <div class="game-message" id="whackMsg">
        Hit the target!
      </div>

      <div class="whack-grid" id="whackGrid"></div>

    </div>
  `);

  const grid = document.getElementById("whackGrid");
  const msg = document.getElementById("whackMsg");

  const holes = [];

  for(let i=0;i<9;i++){

    const btn = document.createElement("button");

    btn.className = "whack-hole";
    btn.textContent = "•";

    btn.onclick = () => {

      if (i !== active) return;

      score++;
      setScore(score);

      active = -1;
      render();
    };

    holes.push(btn);
    grid.appendChild(btn);
  }

  function render() {

    holes.forEach((btn,i) => {

      btn.classList.toggle(
        "active",
        i === active
      );

      btn.textContent =
        i === active ? "🎯" : "•";
    });
  }

  moveTimer = setInterval(() => {

    active = randomNumber(0,8);
    render();

  },600);

  clock = setInterval(() => {

    time--;

    msg.textContent =
      `Time remaining: ${time}s`;

    if(time <= 0){

      clearInterval(moveTimer);
      clearInterval(clock);

      active = -1;
      render();

      msg.textContent =
        `⏱️ Finished! Score: ${score}`;
    }

  },1000);

  return () => {

    clearInterval(moveTimer);
    clearInterval(clock);
  };
}


/* =========================================================
   REACTION
   ========================================================= */

function gameReaction() {

  let ready = false;
  let waiting = false;
  let timeout;
  let startTime;

  html(`
    <div class="game-ui">

      <h3>⚡ Reaction Rush</h3>

      <div
        id="reactionBox"
        style="
          width:min(420px,100%);
          height:230px;
          margin:auto;
          display:grid;
          place-items:center;
          border-radius:20px;
          background:#171d31;
          font-size:25px;
          font-weight:900;
          cursor:pointer;
        "
      >
        CLICK START
      </div>

    </div>
  `);

  const box = document.getElementById("reactionBox");

  box.onclick = () => {

    if (ready) {

      const reaction =
        Date.now() - startTime;

      setScore(reaction + " ms");

      box.textContent =
        `${reaction} ms — Try again!`;

      box.style.background =
        "#176b5d";

      ready = false;
      waiting = false;

      return;
    }

    if (waiting) {

      clearTimeout(timeout);
      waiting = false;

      box.textContent =
        "❌ Too early! Click to try again.";

      return;
    }

    waiting = true;

    box.textContent =
      "WAIT FOR GREEN...";

    timeout = setTimeout(() => {

      ready = true;
      waiting = false;
      startTime = Date.now();

      box.textContent =
        "🟢 CLICK NOW!";

      box.style.background =
        "#13795b";

    },randomNumber(1500,4500));
  };

  return () => clearTimeout(timeout);
}


/* =========================================================
   MATH
   ========================================================= */

function gameMath() {

  let score = 0;
  let time = 30;
  let answer;
  let clock;

  html(`
    <div class="game-ui">

      <h3>➗ Math Sprint</h3>

      <div class="game-message" id="mathQuestion"></div>

      <input
        class="game-input"
        id="mathInput"
        type="number"
        placeholder="Your answer"
      >

      <button class="game-btn" id="mathBtn">
        SUBMIT
      </button>

    </div>
  `);

  const question = document.getElementById("mathQuestion");
  const input = document.getElementById("mathInput");
  const btn = document.getElementById("mathBtn");

  function newQuestion() {

    const a = randomNumber(1,20);
    const b = randomNumber(1,20);
    const type = randomNumber(1,3);

    if(type === 1){

      answer = a+b;
      question.textContent = `${a} + ${b} = ?`;

    } else if(type === 2){

      answer = a-b;
      question.textContent = `${a} - ${b} = ?`;

    } else {

      const x = randomNumber(2,10);
      const y = randomNumber(2,10);

      answer = x*y;
      question.textContent = `${x} × ${y} = ?`;
    }

    input.value = "";
    input.focus();
  }

  function submit() {

    if(Number(input.value) === answer){

      score++;
      setScore(score);
      newQuestion();

    } else {

      question.textContent += " ❌";
    }
  }

  btn.onclick = submit;

  input.onkeydown = e => {

    if(e.key === "Enter") submit();
  };

  newQuestion();

  clock = setInterval(() => {

    time--;

    setInstruction(`Time remaining: ${time}s`);

    if(time <= 0){

      clearInterval(clock);
      btn.disabled = true;
      input.disabled = true;

      question.textContent =
        `Time up! Final score: ${score}`;
    }

  },1000);

  return () => clearInterval(clock);
}


/* =========================================================
   BREAKOUT
   ========================================================= */

function gameBreakout() {

  const canvas = canvasSetup(560,360);
  const ctx = canvas.getContext("2d");

  let paddle = {
    x:240,
    y:335,
    w:80,
    h:10
  };

  let ball = {
    x:280,
    y:260,
    dx:3,
    dy:-3,
    r:7
  };

  const bricks = [];

  for(let row=0;row<5;row++){

    for(let col=0;col<9;col++){

      bricks.push({
        x:25 + col*58,
        y:35 + row*24,
        w:50,
        h:15,
        alive:true
      });
    }
  }

  let keys = {};
  let animation;

  function keyDown(e){
    keys[e.key.toLowerCase()] = true;
  }

  function keyUp(e){
    keys[e.key.toLowerCase()] = false;
  }

  document.addEventListener("keydown",keyDown);
  document.addEventListener("keyup",keyUp);

  function draw(){

    ctx.fillStyle="#050711";
    ctx.fillRect(0,0,560,360);

    bricks.forEach((b,i)=>{

      if(!b.alive)return;

      ctx.fillStyle =
        i%2 ? "#7c5cff" : "#00e5ff";

      ctx.fillRect(
        b.x,
        b.y,
        b.w,
        b.h
      );
    });

    ctx.fillStyle="#ffffff";

    ctx.fillRect(
      paddle.x,
      paddle.y,
      paddle.w,
      paddle.h
    );

    ctx.beginPath();

    ctx.arc(
      ball.x,
      ball.y,
      ball.r,
      0,
      Math.PI*2
    );

    ctx.fill();
  }

  function update(){

    if(keys["arrowleft"] || keys["a"])
      paddle.x -= 7;

    if(keys["arrowright"] || keys["d"])
      paddle.x += 7;

    paddle.x =
      Math.max(
        0,
        Math.min(560-paddle.w,paddle.x)
      );

    ball.x += ball.dx;
    ball.y += ball.dy;

    if(ball.x < ball.r || ball.x > 560-ball.r)
      ball.dx *= -1;

    if(ball.y < ball.r)
      ball.dy *= -1;

    if(
      ball.y + ball.r > paddle.y &&
      ball.x > paddle.x &&
      ball.x < paddle.x+paddle.w
    ){
      ball.dy = -Math.abs(ball.dy);
    }

    bricks.forEach(b=>{

      if(!b.alive)return;

      if(
        ball.x > b.x &&
        ball.x < b.x+b.w &&
        ball.y > b.y &&
        ball.y < b.y+b.h
      ){

        b.alive=false;
        ball.dy *= -1;

        setScore(
          Number(scoreEl.textContent || 0) + 1
        );
      }
    });

    if(ball.y > 360){

      endGame("Game over! Press Restart.");
      return false;
    }

    if(!bricks.some(b=>b.alive)){

      endGame("🎉 You destroyed every brick!");
      return false;
    }

    return true;
  }

  function loop(){

    if(update() === false)return;

    draw();

    animation =
      requestAnimationFrame(loop);
  }

  draw();
  loop();

  setInstruction(
    "Use Arrow Keys or A/D to move the paddle."
  );

  return () => {

    cancelAnimationFrame(animation);

    document.removeEventListener(
      "keydown",
      keyDown
    );

    document.removeEventListener(
      "keyup",
      keyUp
    );
  };
}


/* =========================================================
   PONG
   ========================================================= */

function gamePong() {

  const canvas = canvasSetup(560,340);
  const ctx = canvas.getContext("2d");

  let playerY=140;
  let aiY=140;

  let ball={
    x:280,
    y:170,
    dx:4,
    dy:3
  };

  let playerScore=0;
  let aiScore=0;
  let keys={};
  let animation;

  function down(e){
    keys[e.key.toLowerCase()]=true;
  }

  function up(e){
    keys[e.key.toLowerCase()]=false;
  }

  document.addEventListener("keydown",down);
  document.addEventListener("keyup",up);

  function resetBall(direction){

    ball={
      x:280,
      y:170,
      dx:4*direction,
      dy:randomNumber(-3,3) || 2
    };
  }

  function update(){

    if(keys["arrowup"] || keys["w"])
      playerY-=6;

    if(keys["arrowdown"] || keys["s"])
      playerY+=6;

    playerY=Math.max(0,Math.min(280,playerY));

    aiY +=
      (ball.y-(aiY+30))*.06;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if(ball.y<5 || ball.y>335)
      ball.dy*=-1;

    if(
      ball.x<25 &&
      ball.y>playerY &&
      ball.y<playerY+60
    ){
      ball.dx=Math.abs(ball.dx);
    }

    if(
      ball.x>535 &&
      ball.y>aiY &&
      ball.y<aiY+60
    ){
      ball.dx=-Math.abs(ball.dx);
    }

    if(ball.x<0){

      aiScore++;
      resetBall(1);
    }

    if(ball.x>560){

      playerScore++;
      setScore(playerScore);

      resetBall(-1);

      if(playerScore>=5){

        endGame("🎉 You won the Pong match!");
        return false;
      }
    }

    return true;
  }

  function draw(){

    ctx.fillStyle="#050711";
    ctx.fillRect(0,0,560,340);

    ctx.setLineDash([8,10]);
    ctx.strokeStyle="rgba(255,255,255,.2)";
    ctx.beginPath();
    ctx.moveTo(280,0);
    ctx.lineTo(280,340);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle="#00e5ff";
    ctx.fillRect(15,playerY,10,60);

    ctx.fillStyle="#ff4ecd";
    ctx.fillRect(535,aiY,10,60);

    ctx.fillStyle="#fff";

    ctx.beginPath();
    ctx.arc(ball.x,ball.y,7,0,Math.PI*2);
    ctx.fill();
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction("Use W/S or Arrow Keys. First to 5 wins.");

  loop();

  return ()=>{

    cancelAnimationFrame(animation);

    document.removeEventListener("keydown",down);
    document.removeEventListener("keyup",up);
  };
}


/* =========================================================
   CATCH COIN
   ========================================================= */

function gameCatch() {

  const canvas=canvasSetup(500,350);
  const ctx=canvas.getContext("2d");

  let basketX=220;
  let coin={
    x:randomNumber(20,480),
    y:0
  };

  let score=0;
  let keys={};
  let animation;

  function down(e){
    keys[e.key.toLowerCase()]=true;
  }

  function up(e){
    keys[e.key.toLowerCase()]=false;
  }

  document.addEventListener("keydown",down);
  document.addEventListener("keyup",up);

  function update(){

    if(keys["arrowleft"] || keys["a"])
      basketX-=7;

    if(keys["arrowright"] || keys["d"])
      basketX+=7;

    basketX=Math.max(0,Math.min(440,basketX));

    coin.y+=4;

    if(
      coin.y>315 &&
      coin.x>basketX &&
      coin.x<basketX+60
    ){

      score++;
      setScore(score);

      coin={
        x:randomNumber(20,480),
        y:0
      };
    }

    if(coin.y>350){

      coin={
        x:randomNumber(20,480),
        y:0
      };
    }
  }

  function draw(){

    ctx.fillStyle="#050711";
    ctx.fillRect(0,0,500,350);

    ctx.fillStyle="#00e5ff";
    ctx.fillRect(
      basketX,
      320,
      60,
      12
    );

    ctx.fillStyle="#ffd43b";

    ctx.beginPath();
    ctx.arc(coin.x,coin.y,10,0,Math.PI*2);
    ctx.fill();
  }

  function loop(){

    update();
    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction("Use Arrow Keys or A/D.");

  loop();

  return ()=>{

    cancelAnimationFrame(animation);
    document.removeEventListener("keydown",down);
    document.removeEventListener("keyup",up);
  };
}


/* =========================================================
   NEON RACER
   ========================================================= */

function gameRacer() {

  const canvas=canvasSetup(420,520);
  const ctx=canvas.getContext("2d");

  let playerX=185;
  let obstacles=[];
  let score=0;
  let speed=4;
  let keys={};
  let animation;

  function down(e){
    keys[e.key.toLowerCase()]=true;
  }

  function up(e){
    keys[e.key.toLowerCase()]=false;
  }

  document.addEventListener("keydown",down);
  document.addEventListener("keyup",up);

  function spawn(){

    obstacles.push({
      x:randomNumber(50,330),
      y:-80,
      w:45,
      h:75
    });
  }

  let spawnTimer=setInterval(spawn,900);

  function update(){

    if(keys["arrowleft"] || keys["a"])
      playerX-=6;

    if(keys["arrowright"] || keys["d"])
      playerX+=6;

    playerX=Math.max(30,Math.min(345,playerX));

    obstacles.forEach(o=>o.y+=speed);

    obstacles=obstacles.filter(o=>{

      if(o.y>530){

        score++;
        setScore(score);

        return false;
      }

      return true;
    });

    for(const o of obstacles){

      if(
        playerX<o.x+o.w &&
        playerX+40>o.x &&
        430<o.y+o.h &&
        480>o.y
      ){

        endGame(`💥 Crash! Score: ${score}`);
        return false;
      }
    }

    speed=Math.min(10,4+score*.03);

    return true;
  }

  function draw(){

    ctx.fillStyle="#060712";
    ctx.fillRect(0,0,420,520);

    ctx.fillStyle="#171b2c";
    ctx.fillRect(40,0,340,520);

    ctx.strokeStyle="rgba(255,255,255,.18)";
    ctx.setLineDash([25,25]);

    for(let x=125;x<380;x+=100){

      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x,520);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    ctx.fillStyle="#00e5ff";
    ctx.fillRect(playerX,430,40,55);

    ctx.fillStyle="#ff4ecd";

    obstacles.forEach(o=>{
      ctx.fillRect(o.x,o.y,o.w,o.h);
    });
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction("Avoid traffic using Arrow Keys or A/D.");

  loop();

  return ()=>{

    clearInterval(spawnTimer);
    cancelAnimationFrame(animation);

    document.removeEventListener("keydown",down);
    document.removeEventListener("keyup",up);
  };
}


/* =========================================================
   TETRIS
   ========================================================= */

function gameTetris() {

  const canvas=canvasSetup(300,500);
  const ctx=canvas.getContext("2d");

  const cols=10;
  const rows=20;
  const size=25;

  let board=Array.from(
    {length:rows},
    ()=>Array(cols).fill(0)
  );

  let piece={
    x:4,
    y:0,
    shape:[
      [1,1,1],
      [0,1,0]
    ]
  };

  let score=0;
  let keys={};
  let timer;

  function collide(px=piece.x,py=piece.y,shape=piece.shape){

    return shape.some((row,y)=>
      row.some((v,x)=>{

        if(!v)return false;

        const nx=px+x;
        const ny=py+y;

        return (
          nx<0 ||
          nx>=cols ||
          ny>=rows ||
          (ny>=0 && board[ny][nx])
        );
      })
    );
  }

  function merge(){

    piece.shape.forEach((row,y)=>{

      row.forEach((v,x)=>{

        if(v && piece.y+y>=0)
          board[piece.y+y][piece.x+x]=1;
      });
    });
  }

  function clearLines(){

    for(let y=rows-1;y>=0;y--){

      if(board[y].every(Boolean)){

        board.splice(y,1);
        board.unshift(Array(cols).fill(0));

        score+=10;
        setScore(score);

        y++;
      }
    }
  }

  function newPiece(){

    piece={
      x:4,
      y:0,
      shape:randomItem([
        [[1,1,1,1]],
        [[1,1],[1,1]],
        [[1,1,1],[1,0,0]],
        [[1,1,1],[0,0,1]],
        [[0,1,1],[1,1,0]]
      ])
    };

    if(collide()){

      endGame(`Game over! Score: ${score}`);
      clearInterval(timer);
    }
  }

  function rotate(){

    const rotated=
      piece.shape[0].map(
        (_,i)=>
          piece.shape.map(row=>row[i]).reverse()
      );

    if(!collide(piece.x,piece.y,rotated))
      piece.shape=rotated;
  }

  function drop(){

    if(!collide(piece.x,piece.y+1)){

      piece.y++;

    }else{

      merge();
      clearLines();
      newPiece();
    }
  }

  function draw(){

    ctx.fillStyle="#050711";
    ctx.fillRect(0,0,300,500);

    board.forEach((row,y)=>{

      row.forEach((v,x)=>{

        if(v){

          ctx.fillStyle="#7c5cff";

          ctx.fillRect(
            x*size+1,
            y*size+1,
            size-2,
            size-2
          );
        }
      });
    });

    piece.shape.forEach((row,y)=>{

      row.forEach((v,x)=>{

        if(v){

          ctx.fillStyle="#00e5ff";

          ctx.fillRect(
            (piece.x+x)*size+1,
            (piece.y+y)*size+1,
            size-2,
            size-2
          );
        }
      });
    });
  }

  function key(e){

    if(e.key==="ArrowLeft"){

      if(!collide(piece.x-1,piece.y))
        piece.x--;

    }else if(e.key==="ArrowRight"){

      if(!collide(piece.x+1,piece.y))
        piece.x++;

    }else if(e.key==="ArrowDown"){

      drop();

    }else if(e.key==="ArrowUp"){

      rotate();
    }

    draw();
  }

  document.addEventListener("keydown",key);

  timer=setInterval(drop,550);

  setInstruction(
    "Arrow Left/Right = move • Up = rotate • Down = drop"
  );

  draw();

  return ()=>{

    clearInterval(timer);
    document.removeEventListener("keydown",key);
  };
}


/* =========================================================
   FLAPPY SKY
   ========================================================= */

function gameFlappy() {

  const canvas=canvasSetup(500,400);
  const ctx=canvas.getContext("2d");

  let bird={
    x:100,
    y:200,
    vy:0
  };

  let pipes=[];
  let score=0;
  let frame=0;
  let animation;

  function flap(){

    bird.vy=-7;
  }

  document.addEventListener("keydown",e=>{
    if(e.code==="Space") flap();
  });

  canvas.addEventListener("click",flap);

  function update(){

    bird.vy+=.35;
    bird.y+=bird.vy;

    frame++;

    if(frame%100===0){

      const gap=130;
      const top=randomNumber(50,260);

      pipes.push({
        x:500,
        top,
        bottom:top+gap,
        passed:false
      });
    }

    pipes.forEach(p=>p.x-=3);

    pipes.forEach(p=>{

      if(!p.passed && p.x<bird.x){

        p.passed=true;
        score++;
        setScore(score);
      }
    });

    pipes=pipes.filter(p=>p.x>-80);

    if(
      bird.y<0 ||
      bird.y>400
    ){

      endGame(`Game over! Score: ${score}`);
      return false;
    }

    for(const p of pipes){

      if(
        bird.x+14>p.x &&
        bird.x-14<p.x+55 &&
        (
          bird.y-14<p.top ||
          bird.y+14>p.bottom
        )
      ){

        endGame(`💥 Game over! Score: ${score}`);
        return false;
      }
    }

    return true;
  }

  function draw(){

    ctx.fillStyle="#071729";
    ctx.fillRect(0,0,500,400);

    ctx.fillStyle="#ffd43b";

    ctx.beginPath();
    ctx.arc(
      bird.x,
      bird.y,
      14,
      0,
      Math.PI*2
    );
    ctx.fill();

    pipes.forEach(p=>{

      ctx.fillStyle="#34e89e";

      ctx.fillRect(
        p.x,
        0,
        55,
        p.top
      );

      ctx.fillRect(
        p.x,
        p.bottom,
        55,
        400-p.bottom
      );
    });
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction(
    "Press SPACE or click the game to fly."
  );

  loop();

  return ()=>{
    cancelAnimationFrame(animation);
  };
}


/* =========================================================
   2048
   ========================================================= */

function game2048() {

  let board=Array(16).fill(0);
  let score=0;

  html(`
    <div class="game-ui">

      <h3>🔢 2048 Master</h3>

      <div class="game-message">
        Use Arrow Keys to combine tiles.
      </div>

      <div class="board-2048" id="board2048"></div>

    </div>
  `);

  const boardEl=document.getElementById("board2048");

  function addTile(){

    const empty=board
      .map((v,i)=>v===0?i:null)
      .filter(v=>v!==null);

    if(!empty.length)return;

    board[randomItem(empty)]=Math.random()<.9?2:4;
  }

  function draw(){

    boardEl.innerHTML="";

    board.forEach(v=>{

      const tile=document.createElement("div");

      tile.className="tile-2048";
      tile.textContent=v||"";

      boardEl.appendChild(tile);
    });
  }

  function move(dir){

    let old=board.join(",");

    let rows=[];

    for(let y=0;y<4;y++)
      rows.push(board.slice(y*4,y*4+4));

    if(dir==="left" || dir==="right"){

      rows=rows.map(row=>{

        if(dir==="right")row.reverse();

        row=row.filter(Boolean);

        for(let i=0;i<row.length-1;i++){

          if(row[i]===row[i+1]){

            row[i]*=2;
            score+=row[i];
            row[i+1]=0;
          }
        }

        row=row.filter(Boolean);

        while(row.length<4)row.push(0);

        if(dir==="right")row.reverse();

        return row;
      });

    }else{

      let cols=[];

      for(let x=0;x<4;x++){

        let col=[];

        for(let y=0;y<4;y++)
          col.push(rows[y][x]);

        if(dir==="down")col.reverse();

        col=col.filter(Boolean);

        for(let i=0;i<col.length-1;i++){

          if(col[i]===col[i+1]){

            col[i]*=2;
            score+=col[i];
            col[i+1]=0;
          }
        }

        col=col.filter(Boolean);

        while(col.length<4)col.push(0);

        if(dir==="down")col.reverse();

        cols.push(col);
      }

      for(let y=0;y<4;y++)
        for(let x=0;x<4;x++)
          rows[y][x]=cols[x][y];
    }

    board=rows.flat();

    if(board.join(",")!==old){

      addTile();
      setScore(score);
      draw();
    }

    if(board.includes(2048))
      endGame("🎉 You reached 2048!");

  }

  function key(e){

    const keys={
      ArrowLeft:"left",
      ArrowRight:"right",
      ArrowUp:"up",
      ArrowDown:"down"
    };

    if(keys[e.key])
      move(keys[e.key]);
  }

  document.addEventListener("keydown",key);

  addTile();
  addTile();
  draw();

  return ()=>{
    document.removeEventListener("keydown",key);
  };
}


/* =========================================================
   MINESWEEPER
   ========================================================= */

function gameMinesweeper() {

  const size=8;
  const mines=10;

  let cells=Array(size*size).fill(0);
  let revealed=Array(size*size).fill(false);
  let score=0;

  const mineIndexes=[];

  while(mineIndexes.length<mines){

    const n=randomNumber(0,cells.length-1);

    if(!mineIndexes.includes(n))
      mineIndexes.push(n);
  }

  mineIndexes.forEach(i=>cells[i]=-1);

  function neighbors(i){

    const x=i%size;
    const y=Math.floor(i/size);
    const result=[];

    for(let dy=-1;dy<=1;dy++){

      for(let dx=-1;dx<=1;dx++){

        if(!dx && !dy)continue;

        const nx=x+dx;
        const ny=y+dy;

        if(
          nx>=0 &&
          nx<size &&
          ny>=0 &&
          ny<size
        ){

          result.push(ny*size+nx);
        }
      }
    }

    return result;
  }

  cells=cells.map((v,i)=>{

    if(v===-1)return -1;

    return neighbors(i)
      .filter(n=>cells[n]===-1)
      .length;
  });

  html(`
    <div class="game-ui">

      <h3>💣 Minesweeper</h3>

      <div class="game-message" id="mineMsg">
        Find the safe squares.
      </div>

      <div
        id="mineBoard"
        style="
          width:min(420px,100%);
          display:grid;
          grid-template-columns:repeat(8,1fr);
          gap:4px;
          margin:auto;
        "
      ></div>

    </div>
  `);

  const board=document.getElementById("mineBoard");
  const msg=document.getElementById("mineMsg");

  function render(){

    board.innerHTML="";

    cells.forEach((value,i)=>{

      const btn=document.createElement("button");

      btn.style.aspectRatio="1";
      btn.style.border="0";
      btn.style.borderRadius="5px";
      btn.style.background=
        revealed[i] ? "#27304a" : "#151d35";
      btn.style.color="white";
      btn.style.fontWeight="900";

      if(revealed[i])
        btn.textContent=value===0?"":value;

      btn.onclick=()=>{

        if(revealed[i])return;

        if(value===-1){

          btn.textContent="💣";
          btn.style.background="#8e2944";

          msg.textContent=
            "💥 Mine found! Restart to play again.";

          revealed.fill(true);
          render();
          return;
        }

        reveal(i);
        render();

        if(revealed.every((v,i)=>
          v || cells[i]===-1
        )){

          msg.textContent=
            "🎉 You cleared the board!";

          setScore(1);
        }
      };

      board.appendChild(btn);
    });
  }

  function reveal(i){

    if(revealed[i] || cells[i]===-1)return;

    revealed[i]=true;
    score++;
    setScore(score);

    if(cells[i]===0){

      neighbors(i).forEach(reveal);
    }
  }

  render();

  return ()=>{};
}


/* =========================================================
   CONNECT FOUR
   ========================================================= */

function gameConnect4() {

  const rows=6;
  const cols=7;

  let board=Array(rows*cols).fill(0);
  let player=1;
  let active=true;

  html(`
    <div class="game-ui">

      <h3>🔴 Connect Four</h3>

      <div class="game-message" id="connectMsg">
        Your turn.
      </div>

      <div class="connect-board" id="connectBoard"></div>

    </div>
  `);

  const boardEl=document.getElementById("connectBoard");
  const msg=document.getElementById("connectMsg");

  function checkWin(p){

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        const i=r*cols+c;

        if(
          c<4 &&
          board[i]===p &&
          board[i+1]===p &&
          board[i+2]===p &&
          board[i+3]===p
        )return true;

        if(
          r<3 &&
          board[i]===p &&
          board[i+cols]===p &&
          board[i+cols*2]===p &&
          board[i+cols*3]===p
        )return true;

        if(
          r<3 &&
          c<4 &&
          board[i]===p &&
          board[i+cols+1]===p &&
          board[i+(cols+1)*2]===p &&
          board[i+(cols+1)*3]===p
        )return true;

        if(
          r<3 &&
          c>=3 &&
          board[i]===p &&
          board[i+cols-1]===p &&
          board[i+(cols-1)*2]===p &&
          board[i+(cols-1)*3]===p
        )return true;
      }
    }

    return false;
  }

  function draw(){

    boardEl.innerHTML="";

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        const i=r*cols+c;
        const cell=document.createElement("button");

        cell.className="connect-cell";

        if(board[i]===1)
          cell.classList.add("red");

        if(board[i]===2)
          cell.classList.add("yellow");

        cell.onclick=()=>{

          if(!active)return;

          for(let y=rows-1;y>=0;y--){

            const index=y*cols+c;

            if(board[index]===0){

              board[index]=1;

              if(checkWin(1)){

                active=false;
                setScore(1);
                msg.textContent="🎉 You win!";
                draw();
                return;
              }

              computerMove();
              draw();
              return;
            }
          }
        };

        boardEl.appendChild(cell);
      }
    }
  }

  function computerMove(){

    const available=[];

    for(let c=0;c<cols;c++){

      for(let r=rows-1;r>=0;r--){

        const i=r*cols+c;

        if(board[i]===0){

          available.push(i);
          break;
        }
      }
    }

    if(!available.length){

      active=false;
      msg.textContent="Draw!";
      return;
    }

    const index=randomItem(available);

    board[index]=2;

    if(checkWin(2)){

      active=false;
      msg.textContent=
        "Computer wins. Try again!";
    }
  }

  draw();

  return ()=>{};
}


/* =========================================================
   AIR HOCKEY
   ========================================================= */

function gameAirHockey() {

  const canvas=canvasSetup(560,360);
  const ctx=canvas.getContext("2d");

  let playerX=280;
  let puck={
    x:280,
    y:180,
    dx:4,
    dy:3
  };

  let score=0;
  let animation;

  canvas.addEventListener("mousemove",e=>{

    const rect=canvas.getBoundingClientRect();

    playerX=
      (e.clientX-rect.left) /
      rect.width *
      560;

  });

  function update(){

    puck.x+=puck.dx;
    puck.y+=puck.dy;

    if(puck.x<10 || puck.x>550)
      puck.dx*=-1;

    if(puck.y<10)
      puck.dy*=-1;

    const aiX=280;

    if(
      puck.y>320 &&
      Math.abs(puck.x-playerX)<70
    ){

      puck.dy=-Math.abs(puck.dy);
      score++;
      setScore(score);
    }

    if(
      puck.y<40 &&
      Math.abs(puck.x-aiX)<70
    ){

      puck.dy=Math.abs(puck.dy);
    }

    if(puck.y>360){

      endGame(`Game over! Score: ${score}`);
      return false;
    }

    return true;
  }

  function draw(){

    ctx.fillStyle="#071624";
    ctx.fillRect(0,0,560,360);

    ctx.strokeStyle="rgba(255,255,255,.2)";
    ctx.strokeRect(10,10,540,340);

    ctx.beginPath();
    ctx.moveTo(10,180);
    ctx.lineTo(550,180);
    ctx.stroke();

    ctx.fillStyle="#00e5ff";

    ctx.beginPath();
    ctx.arc(playerX,330,35,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#ff4ecd";

    ctx.beginPath();
    ctx.arc(280,30,35,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="white";

    ctx.beginPath();
    ctx.arc(puck.x,puck.y,10,0,Math.PI*2);
    ctx.fill();
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction("Move your mouse to control the paddle.");

  loop();

  return ()=>{
    cancelAnimationFrame(animation);
  };
}


/* =========================================================
   TARGET SHOOTER
   ========================================================= */

function gameTarget() {

  const canvas=canvasSetup(500,400);
  const ctx=canvas.getContext("2d");

  let target={
    x:100,
    y:100,
    r:25,
    dx:3,
    dy:2
  };

  let score=0;
  let time=20;
  let animation;
  let clock;

  canvas.onclick=e=>{

    const rect=canvas.getBoundingClientRect();

    const x=
      (e.clientX-rect.left)/
      rect.width*500;

    const y=
      (e.clientY-rect.top)/
      rect.height*400;

    const distance=Math.hypot(
      x-target.x,
      y-target.y
    );

    if(distance<target.r){

      score++;
      setScore(score);

      target.x=randomNumber(40,460);
      target.y=randomNumber(40,360);
    }
  };

  clock=setInterval(()=>{

    time--;

    setInstruction(
      `Hit targets • ${time}s remaining`
    );

    if(time<=0){

      clearInterval(clock);
      endGame(`Time up! Score: ${score}`);
      cancelAnimationFrame(animation);
    }

  },1000);

  function update(){

    target.x+=target.dx;
    target.y+=target.dy;

    if(
      target.x<target.r ||
      target.x>500-target.r
    )
      target.dx*=-1;

    if(
      target.y<target.r ||
      target.y>400-target.r
    )
      target.dy*=-1;
  }

  function draw(){

    ctx.fillStyle="#050711";
    ctx.fillRect(0,0,500,400);

    ctx.fillStyle="#ff3d6e";

    ctx.beginPath();
    ctx.arc(
      target.x,
      target.y,
      target.r,
      0,
      Math.PI*2
    );
    ctx.fill();

    ctx.strokeStyle="white";
    ctx.lineWidth=3;

    ctx.beginPath();
    ctx.arc(
      target.x,
      target.y,
      target.r-8,
      0,
      Math.PI*2
    );
    ctx.stroke();
  }

  function loop(){

    update();
    draw();

    animation=requestAnimationFrame(loop);
  }

  loop();

  return ()=>{

    clearInterval(clock);
    cancelAnimationFrame(animation);
  };
}


/* =========================================================
   JUMP RUNNER
   ========================================================= */

function gameRunner() {

  const canvas=canvasSetup(600,300);
  const ctx=canvas.getContext("2d");

  let player={
    x:70,
    y:240,
    w:35,
    h:50,
    vy:0
  };

  let obstacles=[];
  let score=0;
  let frame=0;
  let animation;

  function jump(){

    if(player.y>=240)
      player.vy=-10;
  }

  document.addEventListener("keydown",e=>{

    if(e.code==="Space" || e.key==="ArrowUp")
      jump();
  });

  canvas.onclick=jump;

  function update(){

    player.vy+=.5;
    player.y+=player.vy;

    if(player.y>240){

      player.y=240;
      player.vy=0;
    }

    frame++;

    if(frame%100===0){

      obstacles.push({
        x:600,
        y:255,
        w:30,
        h:35
      });
    }

    obstacles.forEach(o=>o.x-=5);

    obstacles=obstacles.filter(o=>{

      if(o.x<0){

        score++;
        setScore(score);

        return false;
      }

      return true;
    });

    for(const o of obstacles){

      if(
        player.x<o.x+o.w &&
        player.x+player.w>o.x &&
        player.y<o.y+o.h &&
        player.y+player.h>o.y
      ){

        endGame(`💥 Game over! Score: ${score}`);
        return false;
      }
    }

    return true;
  }

  function draw(){

    ctx.fillStyle="#071016";
    ctx.fillRect(0,0,600,300);

    ctx.fillStyle="#263043";
    ctx.fillRect(0,290,600,10);

    ctx.fillStyle="#00e5ff";

    ctx.fillRect(
      player.x,
      player.y,
      player.w,
      player.h
    );

    ctx.fillStyle="#ff4ecd";

    obstacles.forEach(o=>{
      ctx.fillRect(o.x,o.y,o.w,o.h);
    });
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction(
    "Press SPACE / Arrow Up or click to jump."
  );

  loop();

  return ()=>{
    cancelAnimationFrame(animation);
  };
}


/* =========================================================
   SPACE INVADERS
   ========================================================= */

function gameSpace() {

  const canvas=canvasSetup(600,400);
  const ctx=canvas.getContext("2d");

  let playerX=280;
  let bullets=[];
  let enemies=[];

  let keys={};
  let score=0;
  let animation;

  for(let r=0;r<3;r++){

    for(let c=0;c<8;c++){

      enemies.push({
        x:80+c*60,
        y:50+r*40,
        w:35,
        h:25
      });
    }
  }

  function down(e){

    keys[e.key.toLowerCase()]=true;

    if(e.code==="Space"){

      bullets.push({
        x:playerX+15,
        y:350
      });
    }
  }

  function up(e){
    keys[e.key.toLowerCase()]=false;
  }

  document.addEventListener("keydown",down);
  document.addEventListener("keyup",up);

  let direction=1;

  function update(){

    if(keys["arrowleft"] || keys["a"])
      playerX-=6;

    if(keys["arrowright"] || keys["d"])
      playerX+=6;

    playerX=Math.max(0,Math.min(570,playerX));

    bullets.forEach(b=>b.y-=7);

    enemies.forEach(e=>e.x+=direction*.4);

    if(
      enemies.some(e=>e.x<20 || e.x>545)
    ){

      direction*=-1;

      enemies.forEach(e=>e.y+=12);
    }

    bullets.forEach(b=>{

      enemies.forEach(e=>{

        if(
          b.x>e.x &&
          b.x<e.x+e.w &&
          b.y>e.y &&
          b.y<e.y+e.h
        ){

          e.dead=true;
          b.dead=true;

          score++;
          setScore(score);
        }
      });
    });

    bullets=bullets.filter(b=>!b.dead && b.y>0);
    enemies=enemies.filter(e=>!e.dead);

    if(!enemies.length){

      endGame("🎉 All invaders defeated!");
      return false;
    }

    if(
      enemies.some(e=>e.y>320)
    ){

      endGame("👾 Invaders reached you!");
      return false;
    }

    return true;
  }

  function draw(){

    ctx.fillStyle="#03050d";
    ctx.fillRect(0,0,600,400);

    ctx.fillStyle="#00e5ff";

    ctx.fillRect(
      playerX,
      360,
      35,
      20
    );

    ctx.fillStyle="#ff4ecd";

    bullets.forEach(b=>{
      ctx.fillRect(b.x,b.y,4,12);
    });

    ctx.fillStyle="#7c5cff";

    enemies.forEach(e=>{
      ctx.fillRect(e.x,e.y,e.w,e.h);
    });
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction(
    "Use Arrow Keys / A-D to move. SPACE to shoot."
  );

  loop();

  return ()=>{

    cancelAnimationFrame(animation);

    document.removeEventListener("keydown",down);
    document.removeEventListener("keyup",up);
  };
}


/* =========================================================
   SIMON MEMORY
   ========================================================= */

function gameSimon() {

  let sequence=[];
  let playerIndex=0;
  let accepting=false;
  let score=0;
  let timers=[];

  html(`
    <div class="game-ui">

      <h3>🧠 Simon Memory</h3>

      <div class="game-message" id="simonMsg">
        Watch the sequence.
      </div>

      <div class="simon-grid">

        <button class="simon-btn simon-0" data-simon="0"></button>
        <button class="simon-btn simon-1" data-simon="1"></button>
        <button class="simon-btn simon-2" data-simon="2"></button>
        <button class="simon-btn simon-3" data-simon="3"></button>

      </div>

      <br>

      <button class="game-btn" id="simonStart">
        START
      </button>

    </div>
  `);

  const buttons=[
    ...document.querySelectorAll("[data-simon]")
  ];

  const msg=document.getElementById("simonMsg");
  const start=document.getElementById("simonStart");

  function flash(index){

    const btn=buttons[index];

    btn.classList.add("active");

    timers.push(
      setTimeout(()=>{
        btn.classList.remove("active");
      },350)
    );
  }

  function playSequence(){

    accepting=false;
    playerIndex=0;

    msg.textContent="Watch carefully...";

    sequence.forEach((n,i)=>{

      timers.push(
        setTimeout(()=>{
          flash(n);
        },i*550)
      );
    });

    timers.push(
      setTimeout(()=>{

        accepting=true;
        msg.textContent="Your turn!";

      },sequence.length*550+100)
    );
  }

  function nextRound(){

    sequence.push(
      randomNumber(0,3)
    );

    playSequence();
  }

  buttons.forEach(btn=>{

    btn.onclick=()=>{

      if(!accepting)return;

      const value=Number(btn.dataset.simon);

      flash(value);

      if(value!==sequence[playerIndex]){

        accepting=false;

        msg.textContent=
          `❌ Wrong! Score: ${score}`;

        return;
      }

      playerIndex++;

      if(playerIndex===sequence.length){

        score++;
        setScore(score);

        accepting=false;

        msg.textContent=
          "Correct! Next round...";

        timers.push(
          setTimeout(nextRound,700)
        );
      }
    };
  });

  start.onclick=()=>{

    start.disabled=true;
    sequence=[];
    score=0;
    setScore(0);

    nextRound();
  };

  return ()=>{

    timers.forEach(clearTimeout);
  };
}


/* =========================================================
   WORD SCRAMBLE
   ========================================================= */

function gameWord() {

  const words=[
    "javascript",
    "computer",
    "website",
    "gaming",
    "browser",
    "developer",
    "keyboard",
    "internet",
    "programming",
    "portal"
  ];

  let score=0;
  let word="";

  html(`
    <div class="game-ui">

      <h3>🔤 Word Scramble</h3>

      <div class="word-display" id="wordDisplay"></div>

      <input
        id="wordInput"
        class="game-input"
        placeholder="Unscramble the word"
      >

      <button class="game-btn" id="wordBtn">
        CHECK
      </button>

      <div class="game-message" id="wordMsg"></div>

    </div>
  `);

  const display=document.getElementById("wordDisplay");
  const input=document.getElementById("wordInput");
  const btn=document.getElementById("wordBtn");
  const msg=document.getElementById("wordMsg");

  function newWord(){

    word=randomItem(words);

    let scrambled=
      word
      .split("")
      .sort(()=>Math.random()-.5)
      .join("");

    if(scrambled===word)
      scrambled=word.split("").reverse().join("");

    display.textContent=scrambled;
    input.value="";
    input.focus();
  }

  btn.onclick=()=>{

    if(
      input.value
      .trim()
      .toLowerCase()===word
    ){

      score++;
      setScore(score);

      msg.textContent="🎉 Correct!";
      newWord();

    }else{

      msg.textContent="❌ Try again.";
    }
  };

  input.onkeydown=e=>{

    if(e.key==="Enter")
      btn.click();
  };

  newWord();

  return ()=>{};
}


/* =========================================================
   COIN COLLECTOR
   ========================================================= */

function gameCollector() {

  const canvas=canvasSetup(500,400);
  const ctx=canvas.getContext("2d");

  let player={
    x:230,
    y:330
  };

  let coins=[];
  let keys={};
  let score=0;
  let animation;
  let frame=0;

  function down(e){
    keys[e.key.toLowerCase()]=true;
  }

  function up(e){
    keys[e.key.toLowerCase()]=false;
  }

  document.addEventListener("keydown",down);
  document.addEventListener("keyup",up);

  function update(){

    if(keys["arrowleft"] || keys["a"])
      player.x-=6;

    if(keys["arrowright"] || keys["d"])
      player.x+=6;

    player.x=Math.max(0,Math.min(460,player.x));

    frame++;

    if(frame%45===0){

      coins.push({
        x:randomNumber(15,485),
        y:-10
      });
    }

    coins.forEach(c=>c.y+=4);

    coins=coins.filter(c=>{

      if(
        Math.abs(c.x-player.x)<30 &&
        Math.abs(c.y-player.y)<30
      ){

        score++;
        setScore(score);

        return false;
      }

      return c.y<420;
    });
  }

  function draw(){

    ctx.fillStyle="#070a16";
    ctx.fillRect(0,0,500,400);

    ctx.fillStyle="#00e5ff";

    ctx.fillRect(
      player.x,
      player.y,
      40,
      40
    );

    ctx.fillStyle="#ffd43b";

    coins.forEach(c=>{

      ctx.beginPath();
      ctx.arc(c.x,c.y,9,0,Math.PI*2);
      ctx.fill();
    });
  }

  function loop(){

    update();
    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction(
    "Move with Arrow Keys or A/D and collect coins."
  );

  loop();

  return ()=>{

    cancelAnimationFrame(animation);

    document.removeEventListener("keydown",down);
    document.removeEventListener("keyup",up);
  };
}


/* =========================================================
   AVOID BLOCKS
   ========================================================= */

function gameAvoid() {

  const canvas=canvasSetup(500,400);
  const ctx=canvas.getContext("2d");

  let player={
    x:235,
    y:350,
    w:30,
    h:30
  };

  let blocks=[];
  let keys={};
  let score=0;
  let frame=0;
  let animation;

  function down(e){
    keys[e.key.toLowerCase()]=true;
  }

  function up(e){
    keys[e.key.toLowerCase()]=false;
  }

  document.addEventListener("keydown",down);
  document.addEventListener("keyup",up);

  function update(){

    if(keys["arrowleft"] || keys["a"])
      player.x-=6;

    if(keys["arrowright"] || keys["d"])
      player.x+=6;

    player.x=Math.max(0,Math.min(470,player.x));

    frame++;

    if(frame%35===0){

      blocks.push({
        x:randomNumber(0,470),
        y:-30,
        w:30,
        h:30,
        speed:randomNumber(3,7)
      });
    }

    blocks.forEach(b=>b.y+=b.speed);

    blocks=blocks.filter(b=>{

      if(b.y>400){

        score++;
        setScore(score);

        return false;
      }

      return true;
    });

    for(const b of blocks){

      if(
        player.x<b.x+b.w &&
        player.x+player.w>b.x &&
        player.y<b.y+b.h &&
        player.y+player.h>b.y
      ){

        endGame(
          `💥 Hit! Survival score: ${score}`
        );

        return false;
      }
    }

    return true;
  }

  function draw(){

    ctx.fillStyle="#060712";
    ctx.fillRect(0,0,500,400);

    ctx.fillStyle="#00e5ff";

    ctx.fillRect(
      player.x,
      player.y,
      player.w,
      player.h
    );

    ctx.fillStyle="#ff3d6e";

    blocks.forEach(b=>{
      ctx.fillRect(
        b.x,
        b.y,
        b.w,
        b.h
      );
    });
  }

  function loop(){

    if(update()===false)return;

    draw();

    animation=requestAnimationFrame(loop);
  }

  setInstruction(
    "Use Arrow Keys or A/D to avoid the blocks."
  );

  loop();

  return ()=>{

    cancelAnimationFrame(animation);

    document.removeEventListener("keydown",down);
    document.removeEventListener("keyup",up);
  };
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
   OPEN GAME
   ========================================================= */

function launchGame(gameKey, gameTitle) {

  if(!games[gameKey]){

    showToast("Game could not be loaded.");
    return;
  }

  cleanupGame();

  currentGame=gameKey;
  currentTitle=gameTitle;

  titleEl.textContent=gameTitle;
  setScore(0);

  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");

  document.body.style.overflow="hidden";

  cleanupGame=games[gameKey]();

}


/* =========================================================
   CLOSE GAME
   ========================================================= */

function closeGame() {

  cleanupGame();
  cleanupGame=()=>{};

  stage.innerHTML="";

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");

  document.body.style.overflow="";

  currentGame=null;
}


/* =========================================================
   PLAY BUTTONS
   ========================================================= */

document.querySelectorAll(".play-btn").forEach(button=>{

  button.addEventListener("click",e=>{

    e.stopPropagation();

    const card=button.closest(".game-card");

    launchGame(
      card.dataset.game,
      card.dataset.title
    );
  });

});


/* Make entire card clickable */

document.querySelectorAll(".game-card").forEach(card=>{

  card.addEventListener("click",()=>{

    launchGame(
      card.dataset.game,
      card.dataset.title
    );

  });

});


/* =========================================================
   CLOSE EVENTS
   ========================================================= */

closeBtn.addEventListener("click",closeGame);

modal.addEventListener("click",e=>{

  if(e.target===modal)
    closeGame();

});

document.addEventListener("keydown",e=>{

  if(e.key==="Escape" && modal.classList.contains("open"))
    closeGame();

});


/* =========================================================
   RESTART
   ========================================================= */

restartBtn.addEventListener("click",()=>{

  if(currentGame){

    launchGame(
      currentGame,
      currentTitle
    );
  }

});


/* =========================================================
   SEARCH + FILTER
   ========================================================= */

const cards=[
  ...document.querySelectorAll(".game-card")
];

let activeCategory="all";

function filterGames(){

  const query=
    searchInput.value
      .trim()
      .toLowerCase();

  let count=0;

  cards.forEach(card=>{

    const title=
      card.dataset.title.toLowerCase();

    const category=
      card.dataset.category.toLowerCase();

    const matchesSearch=
      title.includes(query);

    const matchesCategory=
      activeCategory==="all" ||
      category===activeCategory;

    const show=
      matchesSearch &&
      matchesCategory;

    card.classList.toggle(
      "hidden",
      !show
    );

    if(show)
      count++;
  });

  visibleCount.textContent=count;

  noResults.classList.toggle(
    "show",
    count===0
  );
}

searchInput.addEventListener(
  "input",
  filterGames
);


document.querySelectorAll(".category-btn")
.forEach(button=>{

  button.addEventListener("click",()=>{

    document
      .querySelectorAll(".category-btn")
      .forEach(btn=>
        btn.classList.remove("active")
      );

    button.classList.add("active");

    activeCategory=
      button.dataset.category;

    filterGames();
  });

});


/* =========================================================
   INITIALIZE
   ========================================================= */

filterGames();

console.log(
  "NEXORA Gaming Portal loaded successfully. 38 games available."
);