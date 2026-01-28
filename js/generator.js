/**
 * ========================================
 * 数独生成器模块
 * 功能：使用回溯算法生成数独，验证唯一解
 * ========================================
 */

const SudokuGenerator = (function() {
    'use strict';

    /**
     * 创建一个空的9x9数独数组
     * @returns {number[][]} 空的9x9二维数组，填充0
     */
    function createEmptyBoard() {
        return Array(9).fill(null).map(() => Array(9).fill(0));
    }

    /**
     * 检查在指定位置放置数字是否合法
     * @param {number[][]} board - 9x9数独数组
     * @param {number} row - 行索引 (0-8)
     * @param {number} col - 列索引 (0-8)
     * @param {number} num - 要放置的数字 (1-9)
     * @returns {boolean} 是否合法
     */
    function isValid(board, row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) {
                return false;
            }
        }

        // 检查列
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) {
                return false;
            }
        }

        // 检查3x3宫格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 使用回溯算法解决数独
     * @param {number[][]} board - 9x9数独数组
     * @returns {boolean} 是否有解
     */
    function solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // 找到空格子（值为0）
                if (board[row][col] === 0) {
                    // 尝试填入1-9的数字
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;

                            // 递归尝试解决剩余部分
                            if (solve(board)) {
                                return true;
                            }

                            // 如果失败，回溯（将格子重置为0）
                            board[row][col] = 0;
                        }
                    }
                    // 如果1-9都尝试失败，返回false
                    return false;
                }
            }
        }
        // 所有格子都已填充，找到解
        return true;
    }

    /**
     * 生成完整的数独解
     * @returns {number[][]} 完整的9x9数独数组
     */
    function generateFullBoard() {
        const board = createEmptyBoard();

        // 首先随机填充对角线上的三个3x3宫格
        // 这三个宫格相互独立，不会冲突
        for (let i = 0; i < 9; i = i + 3) {
            fillBox(board, i, i);
        }

        // 然后使用回溯算法填充剩余部分
        solve(board);

        return board;
    }

    /**
     * 填充一个3x3的宫格（随机填充）
     * @param {number[][]} board - 9x9数独数组
     * @param {number} row - 起始行
     * @param {number} col - 起始列
     */
    function fillBox(board, row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!isSafeInBox(board, row, col, num));

                board[row + i][col + j] = num;
            }
        }
    }

    /**
     * 检查在3x3宫格内放置数字是否安全
     * @param {number[][]} board - 9x9数独数组
     * @param {number} rowStart - 起始行
     * @param {number} colStart - 起始列
     * @param {number} num - 要放置的数字
     * @returns {boolean} 是否安全
     */
    function isSafeInBox(board, rowStart, colStart, num) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[rowStart + i][colStart + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 计算数独的解的数量（用于验证唯一解）
     * @param {number[][]} board - 9x9数独数组
     * @returns {number} 解的数量
     */
    function countSolutions(board) {
        let count = 0;

        function solveCount(b) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (b[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isValid(b, row, col, num)) {
                                b[row][col] = num;
                                solveCount(b);
                                b[row][col] = 0;

                                // 如果已经找到超过1个解，提前终止
                                if (count > 1) {
                                    return;
                                }
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        }

        solveCount(board);
        return count;
    }

    /**
     * 挖洞（移除数字）生成数独谜题
     * @param {number[][]} board - 完整的9x9数独数组
     * @param {number} difficulty - 难度等级 ('easy', 'medium', 'hard')
     * @returns {number[][]} 挖洞后的数独谜题
     */
    function pokeHoles(board, difficulty) {
        // 根据难度确定要保留的数字数量
        // 简单：保留35-40个数字
        // 中等：保留30-34个数字
        // 困难：保留25-29个数字
        let minNumbers, maxNumbers;

        switch (difficulty) {
            case 'easy':
                minNumbers = 35;
                maxNumbers = 40;
                break;
            case 'medium':
                minNumbers = 30;
                maxNumbers = 34;
                break;
            case 'hard':
                minNumbers = 25;
                maxNumbers = 29;
                break;
            default:
                minNumbers = 30;
                maxNumbers = 34;
        }

        // 随机决定保留多少个数字
        const numbersToKeep = Math.floor(Math.random() * (maxNumbers - minNumbers + 1)) + minNumbers;
        const holesToPoke = 81 - numbersToKeep;

        // 创建要挖洞的位置列表
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }

        // 随机打乱位置
        shuffleArray(positions);

        // 复制原始棋盘
        const puzzle = board.map(row => [...row]);

        // 开始挖洞
        let holesPoked = 0;
        for (const [row, col] of positions) {
            if (holesPoked >= holesToPoke) {
                break;
            }

            // 保存当前的值
            const backup = puzzle[row][col];

            // 挖洞（设置为0）
            puzzle[row][col] = 0;

            // 验证是否仍然有唯一解
            const solutions = countSolutions(puzzle.map(r => [...r]));

            if (solutions === 1) {
                // 保持挖洞
                holesPoked++;
            } else {
                // 恢复值（破坏了唯一解）
                puzzle[row][col] = backup;
            }
        }

        return puzzle;
    }

    /**
     * 随机打乱数组（Fisher-Yates洗牌算法）
     * @param {Array} array - 要打乱的数组
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * 生成一个新的数独游戏
     * @param {string} difficulty - 难度等级 ('easy', 'medium', 'hard')
     * @returns {Object} 包含谜题和解答的对象
     */
    function generate(difficulty) {
        // 生成完整的数独
        const solution = generateFullBoard();

        // 挖洞生成谜题
        const puzzle = pokeHoles(solution, difficulty);

        return {
            puzzle: puzzle,
            solution: solution,
            difficulty: difficulty
        };
    }

    /**
     * 将二维数组转换为一维数组（方便存储）
     * @param {number[][]} board - 9x9数独数组
     * @returns {number[]} 一维数组
     */
    function toFlatArray(board) {
        return board.flat();
    }

    /**
     * 将一维数组转换为二维数组
     * @param {number[]} flat - 一维数组（长度81）
     * @returns {number[][]} 9x9数独数组
     */
    function fromFlatArray(flat) {
        const board = [];
        for (let i = 0; i < 9; i++) {
            board.push(flat.slice(i * 9, (i + 1) * 9));
        }
        return board;
    }

    // 公开的API
    return {
        generate: generate,
        createEmptyBoard: createEmptyBoard,
        toFlatArray: toFlatArray,
        fromFlatArray: fromFlatArray,
        isValid: isValid
    };

})();
