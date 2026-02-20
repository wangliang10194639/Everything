// 俄罗斯方块游戏逻辑

// 游戏配置常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#00f0f0', // I - 青色
    '#0000f0', // J - 蓝色
    '#f0a000', // L - 橙色
    '#f0f000', // O - 黄色
    '#00f000', // S - 绿色
    '#a000f0', // T - 紫色
    '#f00000'  // Z - 红色
];

// 方块形状定义
const SHAPES = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

// 游戏状态
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// 获取DOM元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const gameOverModal = document.getElementById('game-over');
const pauseModal = document.getElementById('pause-modal');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// 初始化游戏棋盘
function initBoard() {
    board = [];
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = 0;
        }
    }
}

// 创建新方块
function createPiece(type) {
    return {
        type: type,
        shape: SHAPES[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

// 随机获取方块类型
function randomPiece() {
    return Math.floor(Math.random() * 7) + 1;
}

// 绘制单个方块
function drawBlock(context, x, y, colorIndex) {
    const colors = [
        '#0a0a1a', // 背景色
        '#00f0f0', // I - 青色
        '#0000f0', // J - 蓝色
        '#f0a000', // L - 橙色
        '#f0f000', // O - 黄色
        '#00f000', // S - 绿色
        '#a000f0', // T - 紫色
        '#f00000'  // Z - 红色
    ];
    
    context.fillStyle = colors[colorIndex];
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 添加方块边框效果
    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 2;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 添加高光效果
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 4);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 4, BLOCK_SIZE);
}

// 绘制游戏棋盘
function drawBoard() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * BLOCK_SIZE);
        ctx.lineTo(canvas.width, row * BLOCK_SIZE);
        ctx.stroke();
    }
    
    for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(col * BLOCK_SIZE, 0);
        ctx.lineTo(col * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // 绘制已固定的方块
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(ctx, col, row, board[row][col]);
            }
        }
    }
}

// 绘制当前方块
function drawPiece() {
    if (!currentPiece) return;
    
    const shape = currentPiece.shape;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                drawBlock(ctx, currentPiece.x + col, currentPiece.y + row, currentPiece.type);
            }
        }
    }
}

// 绘制下一个方块预览
function drawNextPiece() {
    nextCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (!nextPiece) return;
    
    const shape = nextPiece.shape;
    const blockSize = 25;
    const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                nextCtx.fillStyle = COLORS[nextPiece.type];
                nextCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize);
                
                nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                nextCtx.lineWidth = 2;
                nextCtx.strokeRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize);
            }
        }
    }
}

// 检查碰撞
function collide(arena, piece) {
    const shape = piece.shape;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = piece.x + col;
                const newY = piece.y + row;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && arena[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 合并方块到棋盘
function merge(arena, piece) {
    const shape = piece.shape;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                arena[piece.y + row][piece.x + col] = piece.type;
            }
        }
    }
}

// 旋转方块
function rotate(piece) {
    const shape = piece.shape;
    const N = shape.length;
    const rotated = [];
    
    for (let i = 0; i < N; i++) {
        rotated[i] = [];
        for (let j = 0; j < N; j++) {
            rotated[i][j] = shape[N - 1 - j][i];
        }
    }
    
    const originalShape = piece.shape;
    piece.shape = rotated;
    
    // 如果旋转后发生碰撞，则回退
    if (collide(board, piece)) {
        piece.shape = originalShape;
        return false;
    }
    
    return true;
}

// 移动方块
function movePiece(dir) {
    if (isPaused || isGameOver) return;
    
    currentPiece.x += dir;
    
    if (collide(board, currentPiece)) {
        currentPiece.x -= dir;
        return false;
    }
    
    return true;
}

// 方块下落
function dropPiece() {
    if (isPaused || isGameOver) return;
    
    currentPiece.y++;
    
    if (collide(board, currentPiece)) {
        currentPiece.y--;
        merge(board, currentPiece);
        clearLines();
        spawnPiece();
    }
    
    dropCounter = 0;
}

// 硬降（直接落到底）
function hardDrop() {
    if (isPaused || isGameOver) return;
    
    while (!collide(board, currentPiece)) {
        currentPiece.y++;
    }
    
    currentPiece.y--;
    merge(board, currentPiece);
    clearLines();
    spawnPiece();
    dropCounter = 0;
}

// 清除满行
function clearLines() {
    let linesCleared = 0;
    
    outer: for (let row = ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < COLS; col++) {
            if (!board[row][col]) {
                continue outer;
            }
        }
        
        // 移除满行
        const line = board.splice(row, 1)[0].fill(0);
        board.unshift(line);
        row++;
        linesCleared++;
    }
    
    if (linesCleared > 0) {
        // 计算得分
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        lines += linesCleared;
        
        // 升级
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
        
        updateUI();
    }
}

// 生成新方块
function spawnPiece() {
    currentPiece = nextPiece || createPiece(randomPiece());
    nextPiece = createPiece(randomPiece());
    drawNextPiece();
    
    // 检查游戏是否结束
    if (collide(board, currentPiece)) {
        gameOver();
    }
}

// 更新UI显示
function updateUI() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// 游戏主循环
function update(time = 0) {
    if (isPaused || isGameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        dropPiece();
    }
    
    draw();
    gameLoop = requestAnimationFrame(update);
}

// 绘制游戏画面
function draw() {
    drawBoard();
    drawPiece();
}

// 开始游戏
function startGame() {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    dropCounter = 0;
    isPaused = false;
    isGameOver = false;
    
    spawnPiece();
    updateUI();
    
    gameOverModal.classList.add('hidden');
    pauseModal.classList.add('hidden');
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoop = requestAnimationFrame(update);
}

// 暂停/继续游戏
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        cancelAnimationFrame(gameLoop);
        pauseModal.classList.remove('hidden');
        pauseBtn.textContent = '继续';
    } else {
        pauseModal.classList.add('hidden');
        pauseBtn.textContent = '暂停';
        lastTime = performance.now();
        gameLoop = requestAnimationFrame(update);
    }
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoop);
    
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove('hidden');
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (isGameOver && event.key !== 'Enter') return;
    
    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1);
            break;
        case 'ArrowRight':
            movePiece(1);
            break;
        case 'ArrowDown':
            dropPiece();
            break;
        case 'ArrowUp':
            if (!isPaused && !isGameOver) {
                rotate(currentPiece);
            }
            break;
        case ' ':
            event.preventDefault();
            hardDrop();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
        case 'Enter':
            if (isGameOver) {
                startGame();
            }
            break;
    }
    
    if (!isPaused && !isGameOver) {
        draw();
    }
});

// 按钮事件
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// 初始化显示
initBoard();
drawBoard();
