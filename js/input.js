
import {
    move,
    rotate,
    drop,
    hardDrop,
    restart,
    setFastDrop
} from "./game.js";

export function setupControls() {
    const canvas = document.getElementById("game");

    // ===== NÚT ĐIỀU KHIỂN =====
    document.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            switch (button.dataset.action) {
                case "left":
                    move(-1);
                    break;

                case "right":
                    move(1);
                    break;

                case "drop":
                    drop();
                    break;

                case "rotate":
                    rotate();
                    break;
            }
        });
    });

    document.getElementById("restart")
        .addEventListener("click", restart);

    // ===== CẢM ỨNG TRÊN CANVAS =====
    const SWIPE_THRESHOLD = 25;
    const DOUBLE_TAP_DELAY = 280;

    let startX = 0;
    let startY = 0;
    let pointerId = null;
    let moved = false;
    let isDoubleTap = false;
    let lastTapTime = 0;
    let fastDropPointer = null;

    canvas.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        event.preventDefault();

        // Không xử lý nhiều ngón cùng lúc.
        if (pointerId !== null) return;

        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        moved = false;

        const now = Date.now();

        isDoubleTap =
            now - lastTapTime <= DOUBLE_TAP_DELAY &&
            lastTapTime !== 0;

        // Chạm lần thứ hai và tiếp tục giữ:
        // bật chế độ rơi nhanh ngay lập tức.
        if (isDoubleTap) {
            fastDropPointer = event.pointerId;
            setFastDrop(true);
            lastTapTime = 0;
        }

        try {
            canvas.setPointerCapture(event.pointerId);
        } catch {
            // Tiếp tục hoạt động nếu capture không khả dụng.
        }
    });

    canvas.addEventListener("pointermove", event => {
        if (event.pointerId !== pointerId) return;

        event.preventDefault();

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (
            Math.abs(dx) > SWIPE_THRESHOLD ||
            Math.abs(dy) > SWIPE_THRESHOLD
        ) {
            moved = true;
        }
    });

    function finishPointer(event) {
        if (event.pointerId !== pointerId) return;

        event.preventDefault();

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        // Nhấc ngón tay: tắt rơi nhanh.
        if (fastDropPointer === event.pointerId) {
            setFastDrop(false);
            fastDropPointer = null;
            lastTapTime = 0;
        } else if (moved) {
            // Vuốt ngang: di chuyển theo hướng vuốt.
            if (Math.abs(dx) > Math.abs(dy)) {
                const steps = Math.max(
                    1,
                    Math.floor(Math.abs(dx) / 30)
                );

                for (let i = 0; i < steps; i++) {
                    move(dx < 0 ? -1 : 1);
                }
            } else if (dy > SWIPE_THRESHOLD) {
                // Vuốt xuống: thả nhanh theo độ dài vuốt.
                const steps = Math.max(
                    1,
                    Math.floor(dy / 30)
                );

                for (let i = 0; i < steps; i++) {
                    drop();
                }
            }

            lastTapTime = 0;
        } else if (!isDoubleTap) {
            // Chạm một lần: xoay khối.
            rotate();
            lastTapTime = Date.now();
        }

        pointerId = null;
        moved = false;
        isDoubleTap = false;
    }

    canvas.addEventListener("pointerup", finishPointer);

    canvas.addEventListener("pointercancel", event => {
        if (event.pointerId === pointerId) {
            setFastDrop(false);
            fastDropPointer = null;
            pointerId = null;
            moved = false;
            isDoubleTap = false;
            lastTapTime = 0;
        }
    });

    // Hạn chế cử chỉ phóng to của Safari trên vùng chơi.
    canvas.addEventListener("gesturestart", event => {
        event.preventDefault();
    });

    // ===== BÀN PHÍM MÁY TÍNH =====
    document.addEventListener("keydown", event => {
        switch (event.key) {
            case "ArrowLeft":
                event.preventDefault();
                move(-1);
                break;

            case "ArrowRight":
                event.preventDefault();
                move(1);
                break;

            case "ArrowDown":
                event.preventDefault();
                drop();
                break;

            case "ArrowUp":
                event.preventDefault();
                rotate();
                break;

            case " ":
                event.preventDefault();

                // Tránh thả liên tục khi giữ phím Space.
                if (!event.repeat) {
                    hardDrop();
                }
                break;
        }
    });
}