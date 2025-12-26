// 游戏常量
const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;
const MAX_SPEED = 50;
const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

// 游戏状态
let canvas = document.getElementById('gameBoard');
let scoreElement = document.getElementById('score');
let speedLevelElement = document.getElementById('speedLevel');
let highScoreElement = document.getElementById('highScore');
let finalScoreElement = document.getElementById('finalScore');
let displayHighScoreElement = document.getElementById('displayHighScore');
let gameOverElement = document.getElementById('gameOver');
let restartBtn = document.getElementById('restartBtn');
let startBtn = document.getElementById('startBtn');
let pauseBtn = document.getElementById('pauseBtn');
let matrixRain = document.getElementById('matrixRain');

let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let speed = INITIAL_SPEED;
let speedLevel = 1;
let gameLoop = null;
let isGameOver = false;
let isPaused = true;

// 初始化游戏
function initGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    speed = INITIAL_SPEED;
    speedLevel = 1;
    isGameOver = false;
    isPaused = true;
    
    scoreElement.textContent = score;
    speedLevelElement.textContent = speedLevel;
    highScoreElement.textContent = highScore;
    gameOverElement.style.display = 'none';
    
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    drawGame();
}

// 开始游戏
function startGame() {
    if (isGameOver || !isPaused) return;
    
    isPaused = false;
    gameLoop = setInterval(updateGame, speed);
}

// 暂停游戏
function pauseGame() {
    if (isGameOver || isPaused) return;
    
    isPaused = true;
    clearInterval(gameLoop);
}

// 计算速度等级
function calculateSpeedLevel() {
    const speedDiff = INITIAL_SPEED - speed;
    speedLevel = Math.floor(speedDiff / SPEED_INCREASE) + 1;
    speedLevelElement.textContent = speedLevel;
}

// 更新游戏状态
function updateGame() {
    direction = nextDirection;
    
    // 移动蛇头
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 检查碰撞
    if (checkCollision(head)) {
        endGame();
        return;
    }
    
    // 添加新头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        
        // 增加速度
        speed = Math.max(MAX_SPEED, speed - SPEED_INCREASE);
        calculateSpeedLevel();
        
        // 更新游戏循环速度
        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, speed);
        
        food = generateFood();
    } else {
        // 移除尾巴
        snake.pop();
    }
    
    // 绘制游戏
    drawGame();
}

// 检查碰撞
function checkCollision(head) {
    // 检查边界
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 检查撞到自己
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    canvas.innerHTML = '';
    
    // 绘制蛇
    for (let segment of snake) {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y + 1;
        snakeElement.style.gridColumnStart = segment.x + 1;
        snakeElement.classList.add('snake');
        canvas.appendChild(snakeElement);
    }
    
    // 绘制食物
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.style.gridColumnStart = food.x + 1;
    foodElement.classList.add('food');
    canvas.appendChild(foodElement);
}

// 结束游戏
function endGame() {
    isGameOver = true;
    isPaused = true;
    clearInterval(gameLoop);
    
    // 更新最好成绩
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore.toString());
    }
    
    // 更新游戏结束界面
    finalScoreElement.textContent = score;
    displayHighScoreElement.textContent = highScore;
    highScoreElement.textContent = highScore;
    
    gameOverElement.style.display = 'block';
}

// 控制方向
function handleKeyPress(e) {
    const key = e.key;
    
    if (key === 'ArrowUp' && direction.y === 0) {
        nextDirection = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && direction.y === 0) {
        nextDirection = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && direction.x === 0) {
        nextDirection = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && direction.x === 0) {
        nextDirection = { x: 1, y: 0 };
    }
}

// 生成矩阵雨效果
function createMatrixRain() {
    const numChars = 100;
    
    for (let i = 0; i < numChars; i++) {
        createMatrixChar();
    }
    
    // 定期添加新字符
    setInterval(createMatrixChar, 100);
}

// 创建单个矩阵字符
function createMatrixChar() {
    const charElement = document.createElement('div');
    charElement.className = 'matrix-char';
    charElement.textContent = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    
    // 随机位置和速度
    const x = Math.random() * 100;
    const duration = 3 + Math.random() * 7;
    const fontSize = 8 + Math.random() * 12;
    
    charElement.style.left = `${x}%`;
    charElement.style.animationDuration = `${duration}s`;
    charElement.style.fontSize = `${fontSize}px`;
    charElement.style.opacity = 0.3 + Math.random() * 0.7;
    
    matrixRain.appendChild(charElement);
    
    // 动画结束后移除字符
    charElement.addEventListener('animationend', () => {
        matrixRain.removeChild(charElement);
    });
}

// 添加装饰线条
function addDecorationLines() {
    const decorations = document.querySelectorAll('.game-decoration');
    
    decorations.forEach(decoration => {
        // 清空现有线条
        decoration.innerHTML = '';
        
        // 添加10条装饰线条
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'decoration-line';
            decoration.appendChild(line);
        }
    });
}

// 事件监听
window.addEventListener('keydown', handleKeyPress);
restartBtn.addEventListener('click', initGame);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);

// 初始化游戏和效果
window.addEventListener('DOMContentLoaded', () => {
    addDecorationLines();
    createMatrixRain();
    initGame();
});