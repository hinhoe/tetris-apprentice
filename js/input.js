import {
    move,
    rotate,
    drop,
    hardDrop,
    restart,
    setFastDrop
} from "./game.js";

import { COLS, ROWS } from "./constants.js";

export function setupControls() {
    const canvas = document.getElementById("game");

    // =====================================================
    // NÚT ĐIỀU KHIỂN
    // =====================================================

    const buttons = document.querySelectorAll("[data-action]");

    buttons.forEach(button => {
        let holdTimer = null;
        let repeatTimer = null;
        let isHolding = false;

        function performAction() {
            const action = button.dataset.action;

            switch (action) {
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
        }

        button.addEventListener("pointerdown", event => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            event.preventDefault();

            isHolding = true;

            // Thực hiện ngay lần đầu.
            performAction();

            // Sau một khoảng ngắn bắt đầu spam.
            holdTimer = setTimeout(() => {
                if (!isHolding) return;

                repeatTimer = setInterval(() => {
                    if (isHolding) {
                        performAction();
                    }
                }, 80);

            }, 180);

            try {
                button.setPointerCapture(event.pointerId);
            } catch {
                // Không làm gì nếu browser không hỗ trợ.
            }
        });

        function stopButton() {
            isHolding = false;

            clearTimeout(holdTimer);
            clearInterval(repeatTimer);

            holdTimer = null;
            repeatTimer = null;
        }

        button.addEventListener("pointerup", stopButton);
        button.addEventListener("pointercancel", stopButton);
        button.addEventListener("pointerleave", event => {
            // Chỉ dừng khi pointer không còn được giữ capture.
            if (!button.hasPointerCapture?.(event.pointerId)) {
                stopButton();
            }
        });
    });

    // Nút chơi lại
    document.getElementById("restart")
        .addEventListener("click", restart);


    // =====================================================
    // CẢM ỨNG TRÊN CANVAS
    // =====================================================

    const SWIPE_THRESHOLD = 5;

    // Phải giữ yên khoảng thời gian này
    // mới được xem là "đè".
    const HOLD_DELAY = 180;

    let pointerId = null;

    let startX = 0;
    let startY = 0;

    let lastStepX = 0;
    let lastStepY = 0;

    let moved = false;
    let horizontalGesture = false;
    let verticalGesture = false;

    let holdTimer = null;
    let fastDropActive = false;


    function getCellSize() {
        const rect = canvas.getBoundingClientRect();

        return {
            width: rect.width / COLS,
            height: rect.height / ROWS
        };
    }


    function getSteps(distance, cellSize) {
        const count = Math.abs(distance) / cellSize;

        const steps = Math.floor(count + 0.5);

        return distance < 0 ? -steps : steps;
    }


    // =====================================================
    // BẮT ĐẦU CHẠM
    // =====================================================

    canvas.addEventListener("pointerdown", event => {

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        event.preventDefault();

        if (pointerId !== null) {
            return;
        }

        pointerId = event.pointerId;

        startX = event.clientX;
        startY = event.clientY;

        lastStepX = 0;
        lastStepY = 0;

        moved = false;
        horizontalGesture = false;
        verticalGesture = false;

        // Không rơi nhanh ngay lập tức.
        // Chờ xem người dùng đang TAP hay HOLD.
        holdTimer = setTimeout(() => {

            // Nếu trong thời gian chờ người dùng
            // không di chuyển thì đây là HOLD.
            if (
                pointerId === event.pointerId &&
                !moved &&
                !horizontalGesture &&
                !verticalGesture
            ) {
                fastDropActive = true;
                setFastDrop(true);
            }

        }, HOLD_DELAY);


        try {
            canvas.setPointerCapture(event.pointerId);
        } catch {
            // Không làm gì.
        }
    });


    // =====================================================
    // DI CHUYỂN NGÓN TAY
    // =====================================================

    canvas.addEventListener("pointermove", event => {

        if (event.pointerId !== pointerId) {
            return;
        }

        event.preventDefault();

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        const distance = Math.max(
            Math.abs(dx),
            Math.abs(dy)
        );


        // Chưa xác định đây là TAP hay SWIPE
        if (
            !horizontalGesture &&
            !verticalGesture
        ) {

            if (distance < SWIPE_THRESHOLD) {
                return;
            }

            // Người dùng bắt đầu vuốt.
            moved = true;

            // QUAN TRỌNG:
            // Nếu đang chuẩn bị / đang rơi nhanh
            // thì vuốt sẽ hủy chế độ rơi nhanh.
            clearTimeout(holdTimer);
            holdTimer = null;

            if (fastDropActive) {
                fastDropActive = false;
                setFastDrop(false);
            }


            // Xác định hướng vuốt.
            if (Math.abs(dx) >= Math.abs(dy)) {
                horizontalGesture = true;
            } else {
                verticalGesture = true;
            }
        }


        // =================================================
        // VUỐT NGANG
        // =================================================

        if (horizontalGesture) {

            const cell = getCellSize();

            const currentStep =
                getSteps(dx, cell.width);

            const difference =
                currentStep - lastStepX;


            if (difference !== 0) {

                move(difference);

                lastStepX = currentStep;
            }

            return;
        }


        // =================================================
        // VUỐT DỌC
        // =================================================

        if (verticalGesture && dy > 0) {

            const cell = getCellSize();

            const currentStep =
                getSteps(dy, cell.height);

            const difference =
                currentStep - lastStepY;


            if (difference > 0) {

                for (let i = 0; i < difference; i++) {
                    drop();
                }

                lastStepY = currentStep;
            }
        }
    });


    // =====================================================
    // NHẢ NGÓN TAY
    // =====================================================

    function finishPointer(event) {

        if (event.pointerId !== pointerId) {
            return;
        }

        event.preventDefault();

        clearTimeout(holdTimer);
        holdTimer = null;


        // Nếu đang rơi nhanh do HOLD
        // thì dừng lại.
        if (fastDropActive) {

            fastDropActive = false;

            setFastDrop(false);
        }


        // Không di chuyển = TAP
        // => xoay.
        if (!moved) {
            rotate();
        }


        pointerId = null;

        moved = false;
        horizontalGesture = false;
        verticalGesture = false;
    }


    canvas.addEventListener(
        "pointerup",
        finishPointer
    );


    canvas.addEventListener(
        "pointercancel",
        event => {

            if (event.pointerId !== pointerId) {
                return;
            }

            clearTimeout(holdTimer);

            holdTimer = null;

            fastDropActive = false;

            setFastDrop(false);

            pointerId = null;

            moved = false;
            horizontalGesture = false;
            verticalGesture = false;
        }
    );


    // =====================================================
    // CHỐNG ZOOM / GESTURE TRÊN IOS
    // =====================================================

    canvas.addEventListener(
        "gesturestart",
        event => {
            event.preventDefault();
        }
    );


    // =====================================================
    // BÀN PHÍM
    // =====================================================

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

                if (!event.repeat) {
                    hardDrop();
                }

                break;
        }
    });


    // Khi chuyển tab/app thì hủy trạng thái HOLD.
    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                clearTimeout(holdTimer);

                holdTimer = null;

                fastDropActive = false;

                setFastDrop(false);

                pointerId = null;
            }
        }
    );
}