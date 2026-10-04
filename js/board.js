
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
    ctx.fillRect(0, 0, 300, 600);

    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawCell(ctx, x, y, value);
            }
        });
    });

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= 10; x++) {
        ctx.beginPath();
        ctx.moveTo(x * 30, 0);
        ctx.lineTo(x * 30, 600);
        ctx.stroke();
    }

    for (let y = 0; y <= 20; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * 30);
        ctx.lineTo(300, y * 30);
        ctx.stroke();
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