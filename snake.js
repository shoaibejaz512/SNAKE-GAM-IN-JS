let boards = document.querySelector(".board");
let startBtn = document.querySelector("#startBtn");
let ScoreDiv = document.querySelector("#curr_score");
let HightScoreDiv = document.querySelector("#high_score");
let timediv = document.querySelector("#time_update")
let StartGameModal = document.querySelector(".text-container");
let gameOverModel = document.querySelector(".gameOverModel");
let snakeGameOverBtn = document.querySelector("#restartBtn");
let speedSelect = document.getElementById("speed");
let blockWidth = 40;
let blockHiehgt = 40;
let rows = Math.floor(boards.clientHeight / blockHiehgt);
let cols = Math.floor(boards.clientWidth / blockWidth);
let blocks = [];
let intveralId = null;
let direction = "down";
let speed = 800;
let count = 0;
let bonusTimeout = null;
//snake 
let snake = [
    {
        x: 1,
        y: 3
    }
];
//food
let food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
}

//bonus food
let bonus = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols)
}


//scores 
let score = 0;
let HightScore = JSON.parse(localStorage.getItem("score")) || 0;
let time = "00-00"

let timeInterval = null;
let min = 0;
let sec = 0;



HightScoreDiv.innerText = HightScore;
timediv.innerText = time;


//sounds
//backGround Sound
let backgroundStarted = false;
let BackgroundSound = new Howl({
    src: ["sounds/backgroundMusic.mp3"],
    volume: 1.0,
    loop: true
})


//snake Bite sound
let SnakeBiteSound = new Howl({
    src: ["sounds/snakeBite.wav"],
    volume: 1.0,
})

//gameOver sound
let gameOverSound = new Howl({
    src: ["sounds/gameOver.wav"],
    volume: 1.0
})



//generate grid layOuts
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        let block = document.createElement("div");
        block.classList.add("block");
        boards.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}


function render() {

    //create head and move head
    let head = null;
    if (direction == "left") {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    } else if (direction == "right") {
        head = { x: snake[0].x, y: snake[0].y + 1 }
    } else if (direction == "down") {
        head = { x: snake[0].x + 1, y: snake[0].y }
    } else if (direction == "up") {
        head = { x: snake[0].x - 1, y: snake[0].y }
    }


    //check when snake goes outside from the board
    if (head.x < 0 || head.y < 0 || head.x >= rows || head.y >= cols) {
        gameOverSound.play();
        clearInterval(intveralId);
        //remove classess from snake segmenst from the blocks

        snake.forEach((segments) => {
            let block = blocks[`${segments.x}-${segments.y}`];
            if (block) block.classList.remove("fill");
        })
        gameOverModel.style.display = "flex"
    }

    //self collision logic
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {

            //remove classess from snake segmenst from the blocks

            snake.forEach((segments) => {
                let block = blocks[`${segments.x}-${segments.y}`];
                if (block) block.classList.remove("fill");
            })
            gameOverSound.play();
            reStartGame();
            clearInterval(intveralId);
            gameOverModel.style.display = "flex";
            return;
        }
    }


    //check condition when food and snake head are equall
    if (head.x == food.x && head.y == food.y) {
        count += 1;
        SnakeBiteSound.play();
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols),
        }
        blocks[`${food.x}-${food.y}`].classList.add("food");
        snake.push(head);
        score += 10;
        if (score > HightScore) {
            localStorage.setItem("score", JSON.stringify(score));
            HightScore = score;
        }

        ScoreDiv.innerText = score;
    }


    // 1) Generate bonus only when 5 foods eaten
    if (count === 5) {

        // Agar pehle koi timeout chal raha hai to use clear karo
        if (bonusTimeout) clearTimeout(bonusTimeout);

        bonus = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols),
        };
        blocks[`${bonus.x}-${bonus.y}`].classList.add("bonus");
        count = 0;   // reset count

        bonusTimeout = setTimeout(() => {
            let b = blocks[`${bonus.x}-${bonus.y}`];
            if (b) b.classList.remove("bonus");
        }, 8000);
    }

    // 2) Bonus eat logic (NOT inside count == 5)
    if (head.x === bonus.x && head.y === bonus.y) {

        score += 50;
        SnakeBiteSound.play();

        // Remove old bonus
        let oldBlock = blocks[`${bonus.x}-${bonus.y}`];
        if (oldBlock) oldBlock.classList.remove("bonus");

        // DO NOT create new bonus immediately!
        // Only next time when count again reaches 5


        // Bonus eat hone par timeout cancel kar do
        if (bonusTimeout) {
            clearTimeout(bonusTimeout);
            bonusTimeout = null;
        }
    }

    //remove classess from snake segmenst from the blocks

    snake.forEach((segments) => {
        let block = blocks[`${segments.x}-${segments.y}`];
        if (block) block.classList.remove("fill");
    })


    //add head in snake array
    snake.unshift(head);
    snake.pop();

    //for food 
    blocks[`${food.x}-${food.y}`].classList.add("food");

    snake.forEach((segment) => {
        let block = blocks[`${segment.x}-${segment.y}`];
        if (block) block.classList.add("fill");
    });
}




speedSelect.addEventListener("change", () => {
    let currSpeed = speedSelect.value;

    switch (currSpeed) {
        case "2x": speed = 800; break;
        case "4x": speed = 700; break;
        case "6x": speed = 500; break;
        case "8x": speed = 400; break;
        case "10x": speed = 200; break;
    }

    // clear old interval
    if (intveralId) clearInterval(intveralId);

    // start new interval with updated speed
    intveralId = setInterval(() => {
        render();
    }, speed);

});


//start button and game
startBtn.addEventListener("click", () => {
    StartGameModal.style.display = "none";
    intveralId = setInterval(() => {
        render()
    }, speed);

    min = 0;
    sec = 0;
    timediv.innerText = "00:00";

    // clear old timer if any
    clearInterval(timeInterval);

    timeInterval = setInterval(() => {
        if (sec == 59) {
            min += 1;
            sec = 0
        } else {
            sec += 1
        }
        let m = min < 10 ? "0" + min : min;
        let s = sec < 10 ? "0" + sec : sec;
        timediv.innerText = `${m}:${s}`;

    }, 1000)
})



//game over and restart again
snakeGameOverBtn.addEventListener("click", reStartGame);



function reStartGame() {
    score = 0;
    // HightScore = JSON.parse(localStorage.getItem("score"));
    min = 0;
    sec = 0;
    HightScoreDiv.innerText = HightScore;
    ScoreDiv.innerText = 0;
    time = "00-00"
    timediv.innerText = "00:00"
    direction = "down";

    blocks[`${food.x}-${food.y}`].classList.remove("food");

    //regenrate food
    food = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
    }
    blocks[`${food.x}-${food.y}`].classList.add("food");



    clearInterval(intveralId);
    clearInterval(timeInterval)


    snake.forEach((segments) => {
        let block = blocks[`${segments.x}-${segments.y}`];
        if (block) block.classList.remove("fill");
    })

    snake = [{ x: 1, y: 3 }];

    snake.forEach((segments) => {
        blocks[`${segments.x}-${segments.y}`].classList.add("fill");
    })


    gameOverModel.style.display = "none";

    intveralId = setInterval(() => {
        render()
    }, 300)


    // restart timer
    timeInterval = setInterval(() => {
        if (sec === 59) {
            min++;
            sec = 0;
        } else {
            sec++;
        }

        let m = min < 10 ? "0" + min : min;
        let s = sec < 10 ? "0" + sec : sec;
        timediv.innerText = `${m}:${s}`;
    }, 1000);
}

document.addEventListener("keydown", (e) => {
    if (!backgroundStarted) {
        BackgroundSound.play();
        backgroundStarted = true;
    }
    switch (e.key) {
        case "ArrowUp":
            if (direction !== "down") direction = "up";
            break;
        case "ArrowDown":
            if (direction !== "up") direction = "down";
            break;
        case "ArrowRight":
            if (direction !== "left") direction = "right";
            break;
        case "ArrowLeft":
            if (direction !== "right") direction = "left";
            break;
    }

})