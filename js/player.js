
import { COLS, ROWS } from "./constants.js";
import { rotateMatrix } from "./pieces.js";

export function collision(board, player) {
    const matrix = player.matrix;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (!matrix[y][x]) continue;

            const newX = player.x + x;
            const newY = player.y + y;

            if (
                newX < 0 ||
                newX >= COLS ||
                newY >= ROWS ||
                (newY >= 0 && board[newY][newX])
            ) {
                return true;
            }
        }
    }

    return false;
}

export function movePlayer(board, player, direction) {
    player.x += direction;

    if (collision(board, player)) {
        player.x -= direction;
    }
}

export function rotatePlayer(board, player) {
    const oldMatrix = player.matrix;
    player.matrix = rotateMatrix(oldMatrix);

    if (collision(board, player)) {
        player.matrix = oldMatrix;
    }
}

export function mergePiece(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[player.y + y][player.x + x] = value;
            }
        });
    });
}