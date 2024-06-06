const ROWS = 10;
const elTable = document.querySelector('.table');

let mineMap = [];

function createMap(quantity) {
    mineMap = [];

    for (let i = 0; i < quantity; i++) {
        const row = new Array(quantity).fill(0);
        mineMap.push(row);
    }

    placeBombs(quantity);
}

function placeBombs(quantity) {
    for (let i = 0; i < quantity; i++) {
        placeBombRandomly();
    }
}

function placeBombRandomly() {
    let randRow = Math.floor(Math.random() * mineMap.length);
    let randCol = Math.floor(Math.random() * mineMap.length);
    if (mineMap[randRow][randCol] !== -1) {
        placeBomb(randRow, randCol);
    } else {
        placeBombRandomly();
    }
}

function placeBomb(i, j) {
    mineMap[i][j] = -1;
}

function countBombsAround(i, j) {
    if (mineMap[i][j] === -1) {
        return -1;
    }

    let count = 0;

    if (i > 0) {
        if (mineMap[i - 1][j - 1] === -1) {
            count++;
        }
        if (mineMap[i - 1][j] === -1) {
            count++;
        }
        if (mineMap[i - 1][j + 1] === -1) {
            count++;
        }
    }

    if (j >= 0 && mineMap[i][j - 1] === -1) {
        count++;
    }
    if (j < mineMap.length && mineMap[i][j + 1] === -1) {
        count++;
    }

    if (i + 1 < mineMap.length) {
        if (mineMap[i + 1][j - 1] === -1) {
            count++;
        }
        if (mineMap[i + 1][j] === -1) {
            count++;
        }
        if (mineMap[i + 1][j + 1] === -1) {
            count++;
        }
    }

    return count;
}

function addRowElements(quantity) {
    for (let i = 0; i < quantity; i++) {
        const elRow = document.createElement('div');
        elRow.id = `${i}`;
        elRow.classList.add('row');

        addBoxElements(elRow, quantity);

        elTable.appendChild(elRow);
    }
}

function addBoxElements(elRow, quantity) {
    for (let j = 0; j < quantity; j++) {
        const elBox = document.createElement('div');
        elBox.id = `${elRow.id}-${j}`;
        elBox.classList.add('box');
        elBox.classList.add('hidden');

        elBox.addEventListener('click', function (e) {
            const elBox = e.target;

            const coords = getBoxElementCoordinates(elBox);
            const [i, j] = coords;

            if (mineMap[i][j] === -1) {
                handleGameOver();
            } else {
                revealBox(elBox);
            }
        });
        elBox.addEventListener('contextmenu', placeFlag);
        elRow.appendChild(elBox);
    }
}

function getBoxElementCoordinates(elBox) {
    const coords = elBox.id.split('-');
    const i = Number.parseInt(coords[0]);
    const j = Number.parseInt(coords[1]);
    return [i, j];
}

function updateBoxElement(elBox) {
    elBox.classList.remove("hidden");
    elBox.classList.remove("flagged");

    const coords = getBoxElementCoordinates(elBox);
    const [i, j] = coords;
    const bombsAround = countBombsAround(i, j);
    mineMap[i][j] = bombsAround;

    _updateBoxElementInnerText(elBox, bombsAround);
    _updateBoxElementColor(elBox, bombsAround);
}

function _updateBoxElementInnerText(elBox, bombsAround) {
    elBox.innerText = bombsAround !== 0 ? bombsAround : '';
}

function _updateBoxElementColor(elBox, bombsAround) {
    if (bombsAround === 0) {
        elBox.classList.add('gray');
    }
    if (bombsAround === 1) {
        elBox.classList.add('green');
    }
    else if (bombsAround === 2) {
        elBox.classList.add('blue');
    }
    else if (bombsAround === 3) {
        elBox.classList.add('red');
    }
    else if (bombsAround === 4) {
        elBox.classList.add('purple');
    }
    else if (bombsAround > 5) {
        elBox.classList.add('orange');
    }
}

function revealBox(elBox) {
    if (!elBox || !elBox.classList.contains('hidden') || elBox.classList.contains('flagged')) {
        return;
    }

    const coords = getBoxElementCoordinates(elBox);
    const [i, j] = coords;

    updateBoxElement(elBox);

    console.log('value', mineMap[i][j]);

    if (mineMap[i][j] === 0) {
        console.log('call checkBoxes');
        checkEmptyBoxesAround(i, j);
    }
}

function placeFlag(event) {
    event.preventDefault();
    const elBox = event.target;
    elBox.classList.toggle('flagged');

    if (elBox.classList.contains('flagged')) {
        elBox.innerText = -2;
    } else {
        elBox.innerText = '';
    }
}

function handleGameOver() {
    const elRows = elTable.getElementsByClassName('row');

    Array.from(elRows).forEach(elRow => {
        const elBoxes = elRow.getElementsByClassName('box');
        Array.from(elBoxes).forEach(elBox => {
            updateBoxElement(elBox);
        });
    });
}

function checkEmptyBoxesAround(i, j) {
    let adjacentBoxTop = getBoxByCoordinates(i + 1, j);
    let adjacentBoxBottom = getBoxByCoordinates(i - 1, j);
    let adjacentBoxLeft = getBoxByCoordinates(i, j - 1);
    let adjacentBoxRight = getBoxByCoordinates(i, j + 1);

    revealBox(adjacentBoxTop);
    revealBox(adjacentBoxBottom);
    revealBox(adjacentBoxLeft);
    revealBox(adjacentBoxRight);
}

function getBoxByCoordinates(i, j) {
    const id = `${i}-${j}`;
    return document.getElementById(id);
}

function boxExist(i, j) {
    return i >= 0 && i < mineMap.length && j >= 0 && j < mineMap.length;
}

function clearTable() {
    elTable.innerHTML = '';
}

function init() {
    clearTable();
    createMap(ROWS);
    addRowElements(ROWS);
}


init();

