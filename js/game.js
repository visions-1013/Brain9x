/**
 * ========================================
 * 游戏核心逻辑模块
 * 功能：管理游戏状态、处理用户输入、笔记模式、撤销重做、提示功能
 * ========================================
 */

const Game = (function() {
    'use strict';

    // 游戏状态
    let gameState = {
        // 原始谜题（固定的数字）
        puzzle: [],
        // 当前玩家的棋盘状态
        playerBoard: [],
        // 完整的解答
        solution: [],
        // 当前难度
        difficulty: 'easy',
        // 是否暂停
        isPaused: false,
        // 是否完成
        isCompleted: false,
        // 笔记模式是否开启
        noteMode: false,
        // 当前选中的格子
        selectedCell: null,
        // 笔记数据（每个格子的候选数字）
        notes: [], // 9x9的数组，每个元素是数字集合 [1, 3, 5]
        // 撤销栈
        undoStack: [],
        // 重做栈
        redoStack: []
    };

    /**
     * 确保笔记数组正确初始化（内部辅助函数）
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     */
    function ensureNotesInitialized(row, col) {
        if (!gameState.notes[row]) {
            gameState.notes[row] = [];
        }
        if (!gameState.notes[row][col]) {
            gameState.notes[row][col] = [];
        }
    }

    /**
     * 初始化新游戏
     * @param {string} difficulty - 难度等级
     */
    function initGame(difficulty) {
        // 生成数独
        const data = SudokuGenerator.generate(difficulty);

        // 初始化游戏状态
        gameState = {
            puzzle: data.puzzle.map(row => [...row]),
            playerBoard: data.puzzle.map(row => [...row]),
            solution: data.solution,
            difficulty: difficulty,
            isPaused: false,
            isCompleted: false,
            noteMode: false,
            selectedCell: null,
            notes: Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])),
            undoStack: [],
            redoStack: []
        };
    }

    /**
     * 加载保存的游戏
     * @param {Object} savedGame - 保存的游戏数据
     */
    function loadGame(savedGame) {
        // 确保笔记数组正确初始化
        const savedNotes = savedGame.notes;
        const notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));

        if (savedNotes && Array.isArray(savedNotes)) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (savedNotes[row] && savedNotes[row][col]) {
                        // 过滤出有效的数字笔记
                        notes[row][col] = savedNotes[row][col].filter(n =>
                            typeof n === 'number' && n >= 1 && n <= 9
                        );
                    }
                }
            }
        }

        gameState = {
            puzzle: SudokuGenerator.fromFlatArray(savedGame.puzzle),
            playerBoard: SudokuGenerator.fromFlatArray(savedGame.playerBoard),
            solution: SudokuGenerator.fromFlatArray(savedGame.solution),
            difficulty: savedGame.difficulty,
            isPaused: false,
            isCompleted: false,
            noteMode: false,
            selectedCell: null,
            notes: notes,
            undoStack: [],
            redoStack: []
        };
    }

    /**
     * 选中格子
     * @param {number} row - 行索引 (0-8)
     * @param {number} col - 列索引 (0-8)
     */
    function selectCell(row, col) {
        // 如果游戏暂停或完成，不允许选中
        if (gameState.isPaused || gameState.isCompleted) {
            return;
        }

        gameState.selectedCell = { row, col };
    }

    /**
     * 取消选中
     */
    function deselectCell() {
        gameState.selectedCell = null;
    }

    /**
     * 在选中格子填入数字
     * @param {number} num - 数字 (1-9)
     */
    function fillNumber(num) {
        if (!gameState.selectedCell || gameState.isPaused || gameState.isCompleted) {
            return;
        }

        const { row, col } = gameState.selectedCell;

        // 如果是固定的数字，不允许修改
        if (gameState.puzzle[row][col] !== 0) {
            return;
        }

        // 确保笔记数组已正确初始化
        ensureNotesInitialized(row, col);

        // 笔记模式
        if (gameState.noteMode) {
            // 切换笔记数字
            const noteIndex = gameState.notes[row][col].indexOf(num);
            if (noteIndex === -1) {
                // 添加笔记
                gameState.notes[row][col].push(num);
            } else {
                // 移除笔记
                gameState.notes[row][col].splice(noteIndex, 1);
            }
        } else {
            // 普通模式：保存到撤销栈
            gameState.undoStack.push({
                type: 'fill',
                row: row,
                col: col,
                oldValue: gameState.playerBoard[row][col],
                newValue: num
            });

            // 清空重做栈
            gameState.redoStack = [];

            // 填入数字
            gameState.playerBoard[row][col] = num;

            // 清空该格子的笔记
            gameState.notes[row][col] = [];
        }
    }

    /**
     * 删除选中格子的数字
     */
    function deleteNumber() {
        if (!gameState.selectedCell || gameState.isPaused || gameState.isCompleted) {
            return;
        }

        const { row, col } = gameState.selectedCell;

        // 如果是固定的数字，不允许删除
        if (gameState.puzzle[row][col] !== 0) {
            return;
        }

        // 确保笔记数组已正确初始化
        ensureNotesInitialized(row, col);

        // 如果格子已经是空的，不需要操作
        if (gameState.playerBoard[row][col] === 0) {
            return;
        }

        // 笔记模式：清空笔记
        if (gameState.noteMode) {
            gameState.notes[row][col] = [];
        } else {
            // 普通模式：保存到撤销栈
            gameState.undoStack.push({
                type: 'delete',
                row: row,
                col: col,
                oldValue: gameState.playerBoard[row][col]
            });

            // 清空重做栈
            gameState.redoStack = [];

            // 删除数字
            gameState.playerBoard[row][col] = 0;
        }
    }

    /**
     * 切换笔记模式
     */
    function toggleNoteMode() {
        gameState.noteMode = !gameState.noteMode;
    }

    /**
     * 撤销操作
     */
    function undo() {
        if (gameState.undoStack.length === 0) {
            return;
        }

        const action = gameState.undoStack.pop();

        // 保存到重做栈
        gameState.redoStack.push(action);

        const { row, col } = action;

        // 确保笔记数组已正确初始化
        ensureNotesInitialized(row, col);

        // 执行撤销
        if (action.type === 'fill') {
            gameState.playerBoard[row][col] = action.oldValue || 0;
        } else if (action.type === 'delete') {
            gameState.playerBoard[row][col] = action.oldValue || 0;
        }
    }

    /**
     * 重做操作
     */
    function redo() {
        if (gameState.redoStack.length === 0) {
            return;
        }

        const action = gameState.redoStack.pop();

        // 保存到撤销栈
        gameState.undoStack.push(action);

        const { row, col } = action;

        // 确保笔记数组已正确初始化
        ensureNotesInitialized(row, col);

        // 执行重做
        if (action.type === 'fill') {
            gameState.playerBoard[row][col] = action.newValue;
        } else if (action.type === 'delete') {
            gameState.playerBoard[row][col] = 0;
        }
    }

    /**
     * 提示功能：随机填入一个正确的空格子
     */
    function hint() {
        if (gameState.isPaused || gameState.isCompleted) {
            return;
        }

        // 找出所有空格子
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameState.playerBoard[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) {
            return;
        }

        // 随机选择一个空格子
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];

        // 确保笔记数组已正确初始化
        ensureNotesInitialized(row, col);

        // 填入正确数字
        const correctNum = gameState.solution[row][col];

        // 保存到撤销栈
        gameState.undoStack.push({
            type: 'fill',
            row: row,
            col: col,
            oldValue: 0,
            newValue: correctNum
        });

        // 清空重做栈
        gameState.redoStack = [];

        // 填入数字
        gameState.playerBoard[row][col] = correctNum;

        // 清空该格子的笔记
        gameState.notes[row][col] = [];

        // 注意：不再自动检查是否完成，需要用户手动点击"检查"按钮

        // 返回提示的位置用于动画
        return { row, col };
    }

    /**
     * 检查答案（手动检查模式）
     * @returns {Object} 检查结果 { isCorrect: boolean, errorCells: Array }
     */
    function checkAnswer() {
        const errorCells = [];
        let isCorrect = true;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const playerNum = gameState.playerBoard[row][col];
                const correctNum = gameState.solution[row][col];

                // 检查已填入的数字是否正确
                if (playerNum !== 0 && playerNum !== correctNum) {
                    errorCells.push({ row, col });
                    isCorrect = false;
                }
            }
        }

        return {
            isCorrect: isCorrect,
            errorCells: errorCells
        };
    }

    /**
     * 实时检查单个格子
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 是否正确
     */
    function checkCell(row, col) {
        const playerNum = gameState.playerBoard[row][col];
        const correctNum = gameState.solution[row][col];

        return playerNum === 0 || playerNum === correctNum;
    }

    /**
     * 检查是否还有空格子
     * @returns {boolean} 是否有空格子
     */
    function hasEmptyCell() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const val = gameState.playerBoard[row][col];
                // 检查是否为空或无效值
                if (typeof val !== 'number' || val < 1 || val > 9) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 标记游戏为完成状态
     */
    function markAsCompleted() {
        gameState.isCompleted = true;
    }

    /**
     * 检查是否完成游戏
     */
    function checkCompletion() {
        // 检查是否所有格子都已填入
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameState.playerBoard[row][col] === 0) {
                    return false; // 还有空格子
                }
            }
        }

        // 检查是否所有数字都正确
        const checkResult = checkAnswer();
        if (checkResult.isCorrect) {
            gameState.isCompleted = true;
            return true;
        }

        return false;
    }

    /**
     * 暂停/继续游戏
     */
    function togglePause() {
        gameState.isPaused = !gameState.isPaused;
    }

    /**
     * 获取当前游戏状态（用于保存）
     * @returns {Object} 游戏状态数据
     */
    function getGameState() {
        return {
            puzzle: SudokuGenerator.toFlatArray(gameState.puzzle),
            playerBoard: SudokuGenerator.toFlatArray(gameState.playerBoard),
            solution: SudokuGenerator.toFlatArray(gameState.solution),
            difficulty: gameState.difficulty,
            notes: gameState.notes,
            isCompleted: gameState.isCompleted
        };
    }

    /**
     * 获取指定格子的值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 格子的值
     */
    function getCellValue(row, col) {
        if (!gameState.playerBoard[row]) {
            return 0;
        }
        const value = gameState.playerBoard[row][col];
        return (typeof value === 'number' && value >= 0 && value <= 9) ? value : 0;
    }

    /**
     * 判断格子是否为固定数字（题目给定的）
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 是否为固定数字
     */
    function isFixedCell(row, col) {
        if (!gameState.puzzle[row]) {
            return false;
        }
        const value = gameState.puzzle[row][col];
        return (typeof value === 'number' && value > 0 && value <= 9);
    }

    /**
     * 获取格子的笔记
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {Array} 笔记数字数组
     */
    function getCellNotes(row, col) {
        // 确保返回有效的数组
        if (!gameState.notes[row] || !gameState.notes[row][col]) {
            return [];
        }
        // 过滤出有效的数字笔记
        return gameState.notes[row][col].filter(n => typeof n === 'number' && n >= 1 && n <= 9);
    }

    /**
     * 获取相关格子（同行、同列、同宫格）
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {Array} 相关格子的坐标数组
     */
    function getRelatedCells(row, col) {
        const related = [];

        // 同行
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                related.push({ row: row, col: c });
            }
        }

        // 同列
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                related.push({ row: r, col: col });
            }
        }

        // 同宫格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (r !== row || c !== col) {
                    related.push({ row: r, col: c });
                }
            }
        }

        return related;
    }

    /**
     * 检查游戏是否已初始化
     * @returns {boolean} 游戏是否已初始化
     */
    function isGameInitialized() {
        return gameState.playerBoard.length > 0;
    }

    // 公开的API
    return {
        initGame: initGame,
        loadGame: loadGame,
        isGameInitialized: isGameInitialized,
        hasEmptyCell: hasEmptyCell,
        markAsCompleted: markAsCompleted,
        selectCell: selectCell,
        deselectCell: deselectCell,
        fillNumber: fillNumber,
        deleteNumber: deleteNumber,
        toggleNoteMode: toggleNoteMode,
        undo: undo,
        redo: redo,
        hint: hint,
        checkAnswer: checkAnswer,
        checkCell: checkCell,
        checkCompletion: checkCompletion,
        togglePause: togglePause,
        getGameState: getGameState,
        getCellValue: getCellValue,
        isFixedCell: isFixedCell,
        getCellNotes: getCellNotes,
        getRelatedCells: getRelatedCells,
        get isPaused() { return gameState.isPaused; },
        get isCompleted() { return gameState.isCompleted; },
        get noteMode() { return gameState.noteMode; },
        get difficulty() { return gameState.difficulty; },
        get selectedCell() { return gameState.selectedCell; },
        get canUndo() { return gameState.undoStack.length > 0; },
        get canRedo() { return gameState.redoStack.length > 0; }
    };

})();
