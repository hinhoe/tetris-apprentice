
import { COLS, ROWS, SIZE, COLORS } from "./constants.js";

export function createBoard() {
    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(0)
    );
}

export function drawCell(ctx, x, y, value) {
    ctx.fillStyle = COLORS[value];

    ctx.fillRect(
        x * SIZE,
        y * SIZE,
        SIZE,
        SIZE
    );

    ctx.strokeStyle = "#222";
    ctx.strokeRect(
        x * SIZE,
        y * SIZE,
        SIZE,
        SIZE
    );
}

export function drawBoard(ctx, board) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, COLS * SIZE, ROWS * SIZE);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawCell(ctx, x, y, board[y][x]);
            }
        }
    }
}

export function clearLines(board) {
    let lines = 0;

    outer:
    for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (!board[y][x]) {
                continue outer;
            }
        }

        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));

        lines++;
        y++;
    }

    return lines;
}