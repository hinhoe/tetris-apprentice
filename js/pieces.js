
import { COLS, PIECES } from "./constants.js";

export function randomPiece() {
    const type = Math.floor(Math.random() * 7) + 1;

    return {
        matrix: PIECES[type].map(row => [...row]),
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

export function rotateMatrix(matrix) {
    return matrix[0].map((_, index) =>
        matrix.map(row => row[index]).reverse()
    );
}