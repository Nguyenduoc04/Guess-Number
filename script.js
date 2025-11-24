let secret = [];
let attemptsLeft = 10;
const maxAttempts = 10;
let hardMode = false; // false = Normal, true = Hard

const attemptsEl = document.getElementById("attempts");
const boardEl = document.getElementById("board");
const messageEl = document.getElementById("message");
const modeLabelEl = document.getElementById("modeLabel");

const overlayInstructions = document.getElementById("instructionsOverlay");
const overlayHardMode = document.getElementById("hardModeOverlay");

const showHelpBtn = document.getElementById("showHelpBtn");
const closeInstructionsBtn = document.getElementById("closeInstructionsBtn");

const hardModeBtn = document.getElementById("hardModeBtn");
const closeHardModeOverlayBtn = document.getElementById("closeHardModeOverlayBtn");

const guessBtn = document.getElementById("guessBtn");
const resetBtn = document.getElementById("resetBtn");

const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.2;
bgMusic.play();

const toggleMusicBtn = document.getElementById("toggleMusic");
// Xử lý nút bật/tắt nhạc
toggleMusicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
        // Nếu nhạc đang tắt, bật nhạc và thay đổi văn bản nút
        bgMusic.play();
        toggleMusicBtn.textContent = "Tắt Nhạc";  // Đổi nút thành "Tắt Nhạc"
    } else {
        // Nếu nhạc đang bật, tắt nhạc và thay đổi văn bản nút
        bgMusic.pause();
        toggleMusicBtn.textContent = "Bật Nhạc";  // Đổi nút thành "Bật Nhạc"
    }
});
// ===== Logic game =====
function generateSecret() {
    secret = [];
    for (let i = 0; i < 5; i++) {
        const digit = Math.floor(Math.random() * 10);
        secret.push(digit);
    }
    console.log("Secret:", secret.join("")); // debug
}

function resetGame() {
    generateSecret();
    attemptsLeft = maxAttempts;
    attemptsEl.textContent = attemptsLeft;
    boardEl.innerHTML = "";
    messageEl.textContent = "";
    clearInputs();
    enableInputs(true);
}

function clearInputs() {
    for (let i = 0; i < 5; i++) {
        const input = document.getElementById("d" + i);
        input.value = "";
    }
    document.getElementById("d0").focus();
}

function enableInputs(enable) {
    for (let i = 0; i < 5; i++) {
        document.getElementById("d" + i).disabled = !enable;
    }
    guessBtn.disabled = !enable;
}

function getGuess() {
    let guess = [];
    for (let i = 0; i < 5; i++) {
        const val = document.getElementById("d" + i).value.trim();
        if (val === "" || isNaN(val)) {
            return null;
        }
        guess.push(parseInt(val));
    }
    return guess;
}

function handleGuess() {
    if (attemptsLeft <= 0) return;

    const guess = getGuess();
    if (!guess) {
        messageEl.textContent = "Vui lòng nhập đủ 5 số (0-9)!";
        return;
    }

    const secretCopy = [...secret];
    const result = new Array(5).fill("gray");

    // Bước 1: đúng số, đúng vị trí (green)
    for (let i = 0; i < 5; i++) {
        if (guess[i] === secretCopy[i]) {
            result[i] = "green";
            secretCopy[i] = null;
        }
    }

    let countRightValueWrongPos = 0;

    // Bước 2: đúng số sai vị trí
    for (let i = 0; i < 5; i++) {
        if (result[i] === "green") continue;
        const index = secretCopy.indexOf(guess[i]);
        if (index !== -1) {
            if (!hardMode) {
                result[i] = "red"; // chỉ tô đỏ ở Normal mode
            }
            countRightValueWrongPos++;
            secretCopy[index] = null;
        }
    }

    // Kiểm tra đã đoán đúng chưa (tất cả đều green)
    const isWin = result.every(color => color === "green");

    // Tạo wrapper cho lượt này
    const wrapper = document.createElement("div");
    wrapper.className = "guess-wrapper";

    // Hàng ô màu
    const row = document.createElement("div");
    row.className = "guess-row";
    for (let i = 0; i < 5; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", result[i]);
        cell.textContent = guess[i];
        row.appendChild(cell);
    }
    wrapper.appendChild(row);

    // Dòng thông báo:
    // - Hard Mode + CHƯA THẮNG -> hiện số ô đúng giá trị sai vị trí
    // - Hard Mode + ĐÃ THẮNG -> KHÔNG thêm dòng thông báo
    // - Normal Mode -> thêm spacer cho đều layout
    if (hardMode && !isWin) {
        const hint = document.createElement("div");
        hint.className = "hint";
        hint.textContent =
            "Có " + countRightValueWrongPos + " ô đúng giá trị nhưng sai vị trí.";
        wrapper.appendChild(hint);
    } else if (!hardMode) {
        const spacer = document.createElement("div");
        spacer.className = "hint spacer";
        spacer.textContent = "";
        wrapper.appendChild(spacer);
    }

    boardEl.appendChild(wrapper);

    attemptsLeft--;
    attemptsEl.textContent = attemptsLeft;
    clearInputs();

    if (isWin) {
        messageEl.textContent = "🎉 Bạn đã đoán đúng rồi!";
        enableInputs(false);
        alert("🎉 Chúc mừng! Bạn đã đoán đúng!");
        return;
    }

    if (attemptsLeft === 0) {
        messageEl.textContent =
            "Bạn đã hết lượt! Dãy đúng là: " + secret.join("");
        enableInputs(false);
        return;
    }

    messageEl.textContent = "";
}

// ===== Xử lý overlay & mode =====
showHelpBtn.addEventListener("click", () => {
    overlayInstructions.classList.remove("hidden");
});

closeInstructionsBtn.addEventListener("click", () => {
    overlayInstructions.classList.add("hidden");
});

// Nút Hard Mode: toggle giữa Normal <-> Hard + reset game
hardModeBtn.addEventListener("click", () => {
    if (!hardMode) {
        // Normal -> Hard
        hardMode = true;
        modeLabelEl.textContent = "Hard";
        hardModeBtn.textContent = "Normal Mode";
        resetGame();
        overlayHardMode.classList.remove("hidden");
    } else {
        // Hard -> Normal
        hardMode = false;
        modeLabelEl.textContent = "Normal";
        hardModeBtn.textContent = "Hard Mode";
        resetGame();
        overlayHardMode.classList.add("hidden");
    }
});

closeHardModeOverlayBtn.addEventListener("click", () => {
    overlayHardMode.classList.add("hidden");
});

// ===== Nút đoán & chơi lại =====
guessBtn.addEventListener("click", handleGuess);

resetBtn.addEventListener("click", () => {
    resetGame();
    messageEl.textContent = "";
});

// Enter để đoán
for (let i = 0; i < 5; i++) {
    document.getElementById("d" + i).addEventListener("keyup", function (e) {
        if (e.key === "Enter") {
            handleGuess();
        }
    });
}

// ===== Khởi tạo game =====
resetGame();
overlayInstructions.classList.remove("hidden");
modeLabelEl.textContent = "Normal";
