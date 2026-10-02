import {
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

let board;
let player;

let score = 0;
let level = 1;
let gameOver = false;

// ================================
// TỐC ĐỘ RƠI
// ================================

let dropInterval = INITIAL_DROP_INTERVAL;
let fastDrop = false;

// ================================
// GAME LOOP
// ================================

let lastTime = 0;
let dropCounter = 0;
let animationId = null;


// ================================
// CẬP NHẬT ĐIỂM / LEVEL
// ================================

function updateInfo() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
}


// ================================
// VẼ GAME
// ================================

function draw() {
    drawBoard(ctx, board);

    // Vẽ khối đang rơi
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

    // ================================
    // GAME OVER
    // ================================

    if (gameOver) {

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "#fff";

        ctx.textAlign = "center";

        ctx.font = "bold 26px Arial";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            280
        );

        ctx.font = "16px Arial";

        ctx.fillText(
            `Điểm: ${score}`,
            canvas.width / 2,
            315
        );
    }
}


// ================================
// TẠO KHỐI MỚI
// ================================

function spawn() {

    player = randomPiece();

    if (collision(board, player)) {

        gameOver = true;

        // Đảm bảo không còn rơi nhanh
        fastDrop = false;
    }
}


// ================================
// TÍNH ĐIỂM
// ================================

function updateScore(lines) {

    if (lines <= 0) {
        return;
    }

    const points = [
        0,
        100,
        300,
        500,
        800
    ];

    score += (
        points[lines] || lines * 200
    ) * level;


    // Mỗi 1000 điểm tăng 1 level
    level = Math.floor(score / 1000) + 1;


    // Tăng tốc độ
    dropInterval = Math.max(
        MIN_DROP_INTERVAL,
        INITIAL_DROP_INTERVAL -
        (level - 1) * SPEED_PER_LEVEL
    );


    updateInfo();
}


// ================================
// DI CHUYỂN
// ================================

export function move(direction) {

    if (gameOver) {
        return;
    }

    movePlayer(
        board,
        player,
        direction
    );
}


// ================================
// XOAY
// ================================

export function rotate() {

    if (gameOver) {
        return;
    }

    rotatePlayer(
        board,
        player
    );
}


// ================================
// RƠI 1 Ô
// ================================

export function drop() {

    if (gameOver) {
        return;
    }

    player.y++;


    // Nếu đụng vật cản
    if (collision(board, player)) {

        // Quay lại vị trí cũ
        player.y--;

        // Gắn khối vào board
        mergePiece(
            board,
            player
        );

        // Xóa dòng
        const lines = clearLines(board);

        // Tính điểm
        updateScore(lines);

        // Tạo khối mới
        spawn();
    }


    dropCounter = 0;
}


// ================================
// HARD DROP
// SPACE TRÊN PC
// ================================

export function hardDrop() {

    if (gameOver) {
        return;
    }


    while (true) {

        player.y++;

        if (collision(board, player)) {

            player.y--;

            break;
        }
    }


    mergePiece(
        board,
        player
    );


    const lines = clearLines(board);

    updateScore(lines);

    spawn();

    dropCounter = 0;
}


// ================================
// BẬT / TẮT RƠI NHANH
// MOBILE HOLD
// ================================

export function setFastDrop(value) {

    fastDrop = Boolean(value);

    // Khi bắt đầu rơi nhanh,
    // reset counter để phản hồi nhanh.
    if (fastDrop) {
        dropCounter = 0;
    }
}


// ================================
// GAME LOOP
// ================================

function update(time = 0) {

    const delta = time - lastTime;

    lastTime = time;

    dropCounter += delta;


    // =====================================
    // TỐC ĐỘ BÌNH THƯỜNG / RƠI NHANH
    // =====================================

    const currentInterval = fastDrop
        ? 45
        : dropInterval;


    if (
        !gameOver &&
        dropCounter >= currentInterval
    ) {

        drop();
    }


    draw();


    animationId =
        requestAnimationFrame(update);
}


// ================================
// RESTART
// ================================

export function restart() {

    // Hủy animation cũ
    if (animationId !== null) {

        cancelAnimationFrame(
            animationId
        );
    }


    // Tạo board mới
    board = createBoard();


    // Reset game
    score = 0;
    level = 1;

    gameOver = false;

    fastDrop = false;


    // Reset tốc độ
    dropInterval =
        INITIAL_DROP_INTERVAL;


    dropCounter = 0;
    lastTime = 0;


    updateInfo();


    // Tạo khối đầu tiên
    spawn();


    // Vẽ ngay
    draw();


    // Bắt đầu game loop
    animationId =
        requestAnimationFrame(update);
}