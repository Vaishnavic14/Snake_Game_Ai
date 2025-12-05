const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

let snake = [
    { x: 10, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let gameSpeed = 100;
let gameLoop;

function drawGame() {
    clearCanvas();
    moveSnake();
    checkCollision();
    drawSnake();
    drawFood();
}

function clearCanvas() {
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#e94560' : '#0f3460';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Add a glow effect to the head
        if (index === 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#e94560';
        } else {
            ctx.shadowBlur = 0;
        }
    });
    ctx.shadowBlur = 0; // Reset shadow
}

function drawFood() {
    ctx.fillStyle = '#e94560';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#e94560';
    ctx.beginPath();
    ctx.arc((food.x * gridSize) + gridSize/2, (food.y * gridSize) + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        generateFood();
        // Increase speed slightly
        if (gameSpeed > 50) gameSpeed -= 1;
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // Check if food spawned on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        resetGame();
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            resetGame();
        }
    }
}

function resetGame() {
    alert('Game Over! Score: ' + score);
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 15 };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100;
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Start game
gameLoop = setInterval(drawGame, gameSpeed);
