
export const COLS = 10;
export const ROWS = 20;
export const SIZE = 30;

export const COLORS = [
    null,
    "#00ffff", // I
    "#ffff00", // O
    "#aa00ff", // T
    "#00ff00", // S
    "#ff0000", // Z
    "#0000ff", // J
    "#ff8800"  // L
];

export const PIECES = [
    [],
    [[1, 1, 1, 1]],

    [[2, 2],
     [2, 2]],

    [[0, 3, 0],
     [3, 3, 3]],

    [[0, 4, 4],
     [4, 4, 0]],

    [[5, 5, 0],
     [0, 5, 5]],

    [[6, 0, 0],
     [6, 6, 6]],

    [[0, 0, 7],
     [7, 7, 7]]
];

export const INITIAL_DROP_INTERVAL = 700;
export const MIN_DROP_INTERVAL = 100;
export const SPEED_PER_LEVEL = 60;