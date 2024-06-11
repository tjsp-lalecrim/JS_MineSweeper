const GRID_SIZE = 10;
const TOTAL_BOMBS = 10;
const INITIAL_COUNTDOWN = 100;

const tableElement = document.querySelector('.table');
const countdownElement = document.getElementById('countdown');
const bombsElement = document.getElementById('bombs');
const flagsElement = document.getElementById('flags');
const restartButton = document.querySelector('.restart');

class Minesweeper {
    constructor(gridSize, totalBombs, initialCountdown) {
        this.gridSize = gridSize;
        this.totalBombs = totalBombs;
        this.initialCountdown = initialCountdown;
        this.remainingFlags = totalBombs;
        this.countdown = initialCountdown;
        this.interval = null;
        this.mineGrid = [];
        this.hiddenBoxesCount = 0;

        this.initializeGame();
    }

    initializeGame() {
        this.clearGrid();
        this.generateMineGrid();
        this.createGridElements();

        this.interval = null;
        this.remainingFlags = this.totalBombs;
        this.countdown = this.initialCountdown;
        this.hiddenBoxesCount = document.querySelectorAll('.box.hidden').length;

        this.updateCountdownDisplay();
        this.updateBombsDisplay();
        this.updateFlagsDisplay();
        this.startCountdown();

        restartButton.classList.add('hide');
    }

    startCountdown() {
        this.interval = setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        if (this.countdown === 0) {
            this.endGame();
            clearInterval(this.interval);
            return;
        }

        this.countdown--;
        this.updateCountdownDisplay();
    }

    updateCountdownDisplay(){
        countdownElement.innerText = this.countdown;
    }

    updateBombsDisplay() {
        bombsElement.innerHTML = this.totalBombs;
    }

    updateFlagsDisplay() {
        flagsElement.innerHTML = this.remainingFlags;
    }

    clearGrid() {
        tableElement.innerHTML = '';
    }

    generateMineGrid() {
        this.mineGrid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
        this.placeBombsRandomly(this.totalBombs);
    }

    placeBombsRandomly(quantity) {
        for (let i = 0; i < quantity; i++) {
            this.placeSingleBombRandomly();
        }
    }

    placeSingleBombRandomly() {
        let randomRow, randomCol;
        do {
            randomRow = Math.floor(Math.random() * this.gridSize);
            randomCol = Math.floor(Math.random() * this.gridSize);
        } while (this.mineGrid[randomRow][randomCol] === -1);
        this.mineGrid[randomRow][randomCol] = -1;
    }

    countAdjacentBombs(row, col) {
        if (this.mineGrid[row][col] === -1) return -1;
        let count = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x === 0 && y === 0) continue;
                const newRow = row + x, newCol = col + y;
                if (this.isValidBox(newRow, newCol) && this.mineGrid[newRow][newCol] === -1) count++;
            }
        }
        return count;
    }

    createGridElements() {
        for (let i = 0; i < this.gridSize; i++) {
            const rowElement = document.createElement('div');
            rowElement.id = `${i}`;
            rowElement.classList.add('row');
            this.createBoxElements(rowElement);
            tableElement.appendChild(rowElement);
        }
    }

    createBoxElements(rowElement) {
        for (let j = 0; j < this.gridSize; j++) {
            const boxElement = document.createElement('div');
            boxElement.id = `${rowElement.id}-${j}`;
            boxElement.classList.add('box', 'hidden');
            boxElement.addEventListener('click', (e) => this.handleBoxClick(e));
            boxElement.addEventListener('contextmenu', (e) => this.toggleFlag(e));
            rowElement.appendChild(boxElement);
        }
    }

    handleBoxClick(event) {
        const boxElement = event.target;
        const [row, col] = this.getBoxCoordinates(boxElement);
        if (this.mineGrid[row][col] === -1) {
            this.endGame();
        } else {
            this.revealBox(boxElement);
            this.updateHiddenBoxesCount();

            if (this.hiddenBoxesCount === this.totalBombs) {
                this.handleGameWin();
            }
        }
    }

    toggleFlagStatus(boxElement) {
        boxElement.classList.toggle('flagged');
        boxElement.innerText = boxElement.classList.contains('flagged') ? '🚩' : '';
    }

    manageFlagPlacement(boxElement) {
        if (boxElement.classList.contains('flagged')) {
            this.remainingFlags++;
        } else {
            if (this.remainingFlags === 0) {
                return false; // No flags left to place
            }
            this.remainingFlags--;
        }
        return true;
    }

    toggleFlag(event) {
        event.preventDefault();
        const boxElement = event.target;

        if (this.manageFlagPlacement(boxElement)) {
            this.toggleFlagStatus(boxElement);
            this.updateFlagsDisplay();
        }
    }

    getBoxCoordinates(boxElement) {
        return boxElement.id.split('-').map(Number);
    }

    updateBoxElement(boxElement) {
        const [row, col] = this.getBoxCoordinates(boxElement);
        const bombsAround = this.countAdjacentBombs(row, col);
        this.mineGrid[row][col] = bombsAround;
        boxElement.classList.remove('hidden', 'flagged');

        boxElement.innerText = bombsAround === -1 ? '💣' : bombsAround !== 0 ? bombsAround : '';
        boxElement.className = 'box ' + this.getColorClass(bombsAround);
    }

    getColorClass(bombsAround) {
        switch (bombsAround) {
            case 1: return 'green';
            case 2: return 'blue';
            case 3: return 'red';
            case 4: return 'purple';
            case 5: return 'orange';
            default: return 'gray';
        }
    }

    revealBox(boxElement) {
        if (!boxElement || !boxElement.classList.contains('hidden') || boxElement.classList.contains('flagged')) return;
        this.updateBoxElement(boxElement);
        const [row, col] = this.getBoxCoordinates(boxElement);
        if (this.mineGrid[row][col] === 0) {
            this.revealAdjacentEmptyBoxes(row, col);
        }
    }

    revealAdjacentEmptyBoxes(row, col) {
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx, newCol = col + dy;
            if (this.isValidBox(newRow, newCol)) this.revealBox(this.getBoxByCoordinates(newRow, newCol));
        });
    }

    getBoxByCoordinates(row, col) {
        return document.getElementById(`${row}-${col}`);
    }

    isValidBox(row, col) {
        return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
    }

    endGame() {
        clearInterval(this.interval);
        document.querySelectorAll('.box').forEach(boxElement => this.updateBoxElement(boxElement));
        restartButton.classList.remove('hide');
    }

    handleGameWin() {
        clearInterval(this.interval);
        alert('Congratulations! You win!');
    }

    updateHiddenBoxesCount() {
        this.hiddenBoxesCount = document.querySelectorAll('.box.hidden').length;
    }
}

const game = new Minesweeper(GRID_SIZE, TOTAL_BOMBS, INITIAL_COUNTDOWN);
restartButton.addEventListener('click', () => game.initializeGame());
