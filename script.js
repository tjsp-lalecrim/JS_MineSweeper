const SIZE = 10;

const elTable = document.querySelector('.table');
const elCountdown = document.getElementById('countdown');
const elBombs = document.getElementById('bombs');
const elFlags = document.getElementById('flags');
const elRestartBtn = document.querySelector('.restart');

let mineMap;
let bombs = 10;
let flags = 10;
let countdown;
let interval;
let hiddenBoxes;

function init() {
    clearTable();
    createMap(SIZE);
    addRowElements(SIZE);

    interval = null;
    remainingFlags = flags;
    countdown = 100;
    hiddenBoxes = SIZE * SIZE;

    updateCountdown();
    updateElBombs();
    updateElFlags();
    startCountdown();
}

function startCountdown() {
    interval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (countdown === 0) {
        handleGameOver();
        clearInterval(interval);
        return;
    }

    countdown--;
    elCountdown.innerText = countdown;
}

function updateElBombs() {
    elBombs.innerHTML = bombs;
}

function updateElFlags() {
    elFlags.innerHTML = remainingFlags;
}

function clearTable() {
    elTable.innerHTML = '';
}

function createMap(size) {
    mineMap = Array.from({ length: size }, () => Array(size).fill(0));
    placeBombs(bombs);
}

function placeBombs(quantity) {
    for (let i = 0; i < quantity; i++) {
        placeBombRandomly();
    }
}

function placeBombRandomly() {
    let randRow, randCol;
    do {
        randRow = Math.floor(Math.random() * mineMap.length);
        randCol = Math.floor(Math.random() * mineMap.length);
    } while (mineMap[randRow][randCol] === -1);
    mineMap[randRow][randCol] = -1;
}

function countBombsAround(i, j) {
    if (mineMap[i][j] === -1) return -1;
    let count = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue;
            const ni = i + x, nj = j + y;
            if (boxExist(ni, nj) && mineMap[ni][nj] === -1) count++;
        }
    }
    return count;
}

function addRowElements(size) {
    for (let i = 0; i < size; i++) {
        const elRow = document.createElement('div');
        elRow.id = `${i}`;
        elRow.classList.add('row');
        addBoxElements(elRow, size);
        elTable.appendChild(elRow);
    }
}

function addBoxElements(elRow, size) {
    for (let j = 0; j < size; j++) {
        const elBox = document.createElement('div');
        elBox.id = `${elRow.id}-${j}`;
        elBox.classList.add('box', 'hidden');
        elBox.addEventListener('click', handleBoxClick);
        elBox.addEventListener('contextmenu', placeFlag);
        elRow.appendChild(elBox);
    }
}

function handleBoxClick(e) {
    const elBox = e.target;
    const [i, j] = getBoxElementCoordinates(elBox);
    if (mineMap[i][j] === -1) {
        handleGameOver();
    } else {
        revealBox(elBox);
        updateHiddenBoxes();

        if (hiddenBoxes === bombs) {
            handleGameWin();
        }
    }
}

// Function to update the flag status of the box
function toggleFlag(elBox) {
    elBox.classList.toggle('flagged');
    elBox.innerText = elBox.classList.contains('flagged') ? '🚩' : '';
}

// Function to handle flagging logic
function handleFlagging(elBox) {
    if (elBox.classList.contains('flagged')) {
        remainingFlags++;
    } else {
        if (remainingFlags === 0) {
            return false; // No flags left to place
        }
        remainingFlags--;
    }
    return true;
}

// Main function to place or remove a flag
function placeFlag(event) {
    event.preventDefault();

    const elBox = event.target;

    if (handleFlagging(elBox)) {
        toggleFlag(elBox);
        updateElFlags();
    }
}


function getBoxElementCoordinates(elBox) {
    return elBox.id.split('-').map(Number);
}

function updateBoxElement(elBox) {
    const [i, j] = getBoxElementCoordinates(elBox);
    const bombsAround = countBombsAround(i, j);
    mineMap[i][j] = bombsAround;
    elBox.classList.remove('hidden', 'flagged');

    elBox.innerText = bombsAround === -1 ? '💣' : bombsAround !== 0 ? bombsAround : '';
    elBox.className = 'box ' + getColorClass(bombsAround);
}

function getColorClass(bombsAround) {
    switch (bombsAround) {
        case 1: return 'green';
        case 2: return 'blue';
        case 3: return 'red';
        case 4: return 'purple';
        case 5: return 'orange'
        default: return 'gray';
    }
}

function revealBox(elBox) {
    if (!elBox || !elBox.classList.contains('hidden') || elBox.classList.contains('flagged')) return;
    updateBoxElement(elBox);
    const [i, j] = getBoxElementCoordinates(elBox);
    if (mineMap[i][j] === 0) {
        checkEmptyBoxesAround(i, j);
    }
}

function checkEmptyBoxesAround(i, j) {
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    directions.forEach(([dx, dy]) => {
        const ni = i + dx, nj = j + dy;
        if (boxExist(ni, nj)) revealBox(getBoxByCoordinates(ni, nj));
    });
}

function getBoxByCoordinates(i, j) {
    return document.getElementById(`${i}-${j}`);
}

function boxExist(i, j) {
    return i >= 0 && i < mineMap.length && j >= 0 && j < mineMap.length;
}

function handleGameOver() {
    clearInterval(interval);
    document.querySelectorAll('.box').forEach(updateBoxElement);
    elRestartBtn.classList.remove('hide');
}

function handleGameWin() {
    clearInterval(interval);
}

function updateHiddenBoxes() {
    let countHiddenBoxes = 0;
    document.querySelectorAll('.box').forEach(b => { if (b.innerHTML === '') countHiddenBoxes++; });
    hiddenBoxes = countHiddenBoxes;
}

elRestartBtn.addEventListener('click', init);

init();
