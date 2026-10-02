
import {
    COLS,
    ROWS,
    SIZE,
    INITIAL_DROP_INTERVAL,
    MIN_DROP_INTERVAL,
    SPEED_PER_LEVEL
} from "./constants.js";

import {
    createBoard,
    drawBoard,
    drawCell,
    clearLines
} from "./board.js";

import { randomPiece } from "./pieces.js";

import {
    collision,
    movePlayer,
    rotatePlayer,
    mergePiece
} from "./player.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");


let fastDrop = false;

let board;
let player;
let score = 0;
let level = 1;
let gameOver = false;

let dropInterval = INITIAL_DROP_INTERVAL;
let lastTime = 0;
let dropCounter = 0;
let animationId = null;

function updateInfo() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
}

function draw() {
    drawBoard(ctx, board);

    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawCell(
                    ctx,
                    player.x + x,
                    player.y + y,
                    value
                );
            }
        });
    });

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "bold 26px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, 280);

        ctx.font = "16px Arial";
        ctx.fillText(
            `Điểm: ${score}`,
            canvas.width / 2,
            315
        );
    }
}

function spawn() {
    player = randomPiece();

    if (collision(board, player)) {
        gameOver = true;
    }
}

function updateScore(lines) {
    const points = [0, 100, 300, 500, 800];

    if (lines > 0) {
        score += (points[lines] || lines * 200) * level;

        level = Math.floor(score / 1000) + 1;

        dropInterval = Math.max(
            MIN_DROP_INTERVAL,
            INITIAL_DROP_INTERVAL - (level - 1) * SPEED_PER_LEVEL
        );

        updateInfo();
    }
}

export function move(direction) {
    if (gameOver) return;
    movePlayer(board, player, direction);
}

export function rotate() {
    if (gameOver) return;
    rotatePlayer(board, player);
}

export function drop() {
    if (gameOver) return;

    player.y++;

    if (collision(board, player)) {
        player.y--;

        mergePiece(board, player);
        updateScore(clearLines(board));
        spawn();
    }

    dropCounter = 0;
}


export function hardDrop() {
    if (gameOver) return;

    while (true) {
        player.y++;

        if (collision(board, player)) {
            player.y--;
            break;
        }
    }

    mergePiece(board, player);
    updateScore(clearLines(board));
    spawn();

    dropCounter = 0;
}


export function setFastDrop(active) {
    fastDrop = active;
}


function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    const currentInterval = fastDrop ? 45 : dropInterval;

    if (!gameOver && dropCounter >= currentInterval) {
        drop();
    }

    draw();
    animationId = requestAnimationFrame(update);
}

export function restart() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    board = createBoard();
    score = 0;
    level = 1;
    gameOver = false;

    dropInterval = INITIAL_DROP_INTERVAL;
    dropCounter = 0;
    lastTime = 0;

    updateInfo();
    spawn();
    draw();

    animationId = requestAnimationFrame(update);
}