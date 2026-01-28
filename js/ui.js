/**
 * ========================================
 * UI交互模块
 * 功能：界面渲染、事件监听、动画效果、键盘快捷键
 * ========================================
 */

const UI = (function() {
    'use strict';

    // DOM元素引用
    let elements = {};

    // 计时器相关
    let timerInterval = null;
    let seconds = 0;

    /**
     * 初始化UI模块
     */
    function init() {
        // 获取DOM元素引用
        elements = {
            board: document.getElementById('sudokuBoard'),
            timer: document.getElementById('timer'),
            difficulty: document.getElementById('currentDifficulty'),
            noteModeBtn: document.getElementById('noteModeBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            undoBtn: document.getElementById('undoBtn'),
            redoBtn: document.getElementById('redoBtn'),
            statusMessage: document.getElementById('statusMessage'),
            // 模态框
            newGameModal: document.getElementById('newGameModal'),
            settingsModal: document.getElementById('settingsModal'),
            historyModal: document.getElementById('historyModal'),
            victoryModal: document.getElementById('victoryModal'),
            // 按钮
            newGameBtn: document.getElementById('newGameBtn'),
            hintBtn: document.getElementById('hintBtn'),
            checkBtn: document.getElementById('checkBtn'),
            saveBtn: document.getElementById('saveBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            historyBtn: document.getElementById('historyBtn'),
            themeToggle: document.getElementById('themeToggle')
        };

        // 绑定事件监听器
        bindEventListeners();

        // 绑定键盘快捷键
        bindKeyboardShortcuts();
    }

    /**
     * 绑定事件监听器
     */
    function bindEventListeners() {
        // 新游戏按钮
        elements.newGameBtn.addEventListener('click', showNewGameModal);

        // 难度选择按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                startNewGame(difficulty);
            });
        });

        // 取消新游戏
        document.getElementById('cancelNewGame').addEventListener('click', hideNewGameModal);

        // 暂停按钮
        elements.pauseBtn.addEventListener('click', togglePause);

        // 提示按钮
        elements.hintBtn.addEventListener('click', useHint);

        // 检查按钮
        elements.checkBtn.addEventListener('click', checkCurrentBoard);

        // 保存按钮
        elements.saveBtn.addEventListener('click', saveCurrentGame);

        // 撤销/重做按钮
        elements.undoBtn.addEventListener('click', undo);
        elements.redoBtn.addEventListener('click', redo);

        // 笔记模式按钮
        elements.noteModeBtn.addEventListener('click', toggleNoteMode);

        // 设置按钮
        elements.settingsBtn.addEventListener('click', showSettingsModal);

        // 设置关闭按钮
        const closeSettingsBtn = document.getElementById('closeSettings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                hideSettingsModal();
            });
        }

        // 历史记录按钮
        elements.historyBtn.addEventListener('click', showHistoryModal);
        document.getElementById('closeHistory').addEventListener('click', hideHistoryModal);

        // 清空历史记录按钮
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
                Storage.clearGameHistory();
                // 重新渲染历史记录
                showHistoryModal();
                showStatusMessage('历史记录已清空', 'success');
            }
        });

        // 清空最佳成绩按钮
        document.getElementById('clearBestScoresBtn').addEventListener('click', () => {
            if (confirm('确定要清空所有最佳成绩吗？此操作不可恢复！')) {
                Storage.clearBestScores();
                // 重新渲染历史记录
                showHistoryModal();
                showStatusMessage('最佳成绩已清空', 'success');
            }
        });

        // 主题切换
        elements.themeToggle.addEventListener('click', toggleTheme);

        // 胜利模态框按钮
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            hideVictoryModal();
            showNewGameModal();
        });
        document.getElementById('closeVictory').addEventListener('click', hideVictoryModal);

        // 数字按钮（移动端）
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = parseInt(e.target.dataset.num);
                if (num === 0) {
                    deleteNumber();
                } else {
                    fillNumber(num);
                }
            });
        });

        // 点击模态框背景关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    // 如果是设置模态框，需要先保存设置
                    if (modal.id === 'settingsModal') {
                        hideSettingsModal();
                    } else {
                        modal.classList.remove('active');
                    }
                }
            });
        });
    }

    /**
     * 绑定键盘快捷键
     */
    function bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 如果模态框打开，不处理快捷键
            if (document.querySelector('.modal.active')) {
                return;
            }

            // 如果在输入框中，不处理快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moveSelection(-1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moveSelection(1, 0);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moveSelection(0, -1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moveSelection(0, 1);
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    fillNumber(parseInt(e.key));
                    break;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    deleteNumber();
                    break;
                case 'n':
                case 'N':
                    e.preventDefault();
                    toggleNoteMode();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    useHint();
                    break;
                case 'z':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        undo();
                    }
                    break;
                case 'y':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        redo();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    togglePause();
                    break;
                case 'Escape':
                    e.preventDefault();
                    Game.deselectCell();
                    renderBoard();
                    break;
            }
        });
    }

    /**
     * 渲染数独棋盘
     */
    function renderBoard() {
        const board = elements.board;
        board.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // 获取格子的值
                const value = Game.getCellValue(row, col);

                // 如果有值，显示数字
                if (value !== 0) {
                    cell.textContent = value;

                    // 如果是固定数字，添加样式
                    if (Game.isFixedCell(row, col)) {
                        cell.classList.add('fixed');
                    }
                } else {
                    // 如果没有值，显示笔记
                    const notes = Game.getCellNotes(row, col);

                    if (notes.length > 0) {
                        const noteContainer = document.createElement('div');
                        noteContainer.className = 'note-numbers';

                        for (let i = 1; i <= 9; i++) {
                            const noteNum = document.createElement('span');
                            noteNum.className = 'note-number';
                            noteNum.textContent = notes.includes(i) ? i : '';
                            noteContainer.appendChild(noteNum);
                        }

                        cell.appendChild(noteContainer);
                    }
                }

                // 如果是选中格子，添加样式
                if (Game.selectedCell && Game.selectedCell.row === row && Game.selectedCell.col === col) {
                    cell.classList.add('selected');
                }

                // 点击事件
                cell.addEventListener('click', () => {
                    Game.selectCell(row, col);
                    renderBoard();
                });

                board.appendChild(cell);
            }
        }

        // 所有格子创建完成后，统一添加高亮样式
        if (Game.selectedCell) {
            const settings = Settings.getSettings();
            // 只在开启高亮时显示相关格子
            if (settings.highlightRelated) {
                const { row, col } = Game.selectedCell;
                const relatedCells = Game.getRelatedCells(row, col);
                relatedCells.forEach(({ row: r, col: c }) => {
                    const relatedCell = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (relatedCell) {
                        relatedCell.classList.add('related');
                    }
                });
            }
        }

        // 更新撤销/重做按钮状态
        elements.undoBtn.disabled = !Game.canUndo;
        elements.redoBtn.disabled = !Game.canRedo;

        // 更新笔记模式按钮样式
        if (Game.noteMode) {
            elements.noteModeBtn.classList.add('primary-btn');
        } else {
            elements.noteModeBtn.classList.remove('primary-btn');
        }
    }

    /**
     * 更新难度显示
     */
    function updateDifficultyDisplay() {
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        elements.difficulty.textContent = difficultyMap[Game.difficulty];
    }

    /**
     * 开始新游戏
     */
    function startNewGame(difficulty) {
        Game.initGame(difficulty);
        hideNewGameModal();
        renderBoard();
        updateDifficultyDisplay();
        startTimer();
        showStatusMessage('新游戏开始！', 'info');
    }

    /**
     * 显示新游戏模态框
     */
    function showNewGameModal() {
        elements.newGameModal.classList.add('active');
    }

    /**
     * 隐藏新游戏模态框
     */
    function hideNewGameModal() {
        elements.newGameModal.classList.remove('active');
    }

    /**
     * 显示设置模态框
     */
    function showSettingsModal() {
        // 加载当前设置
        const settings = Settings.getSettings();
        document.getElementById('errorCheckMode').value = settings.errorCheckMode;
        document.getElementById('highlightRelated').value = settings.highlightRelated.toString();

        elements.settingsModal.classList.add('active');
    }

    /**
     * 隐藏设置模态框
     */
    function hideSettingsModal() {
        try {
            // 保存设置
            const errorCheckModeSelect = document.getElementById('errorCheckMode');
            const highlightRelatedSelect = document.getElementById('highlightRelated');

            if (errorCheckModeSelect && highlightRelatedSelect) {
                const errorCheckMode = errorCheckModeSelect.value;
                const highlightRelated = highlightRelatedSelect.value === 'true';

                Settings.updateSettings({ errorCheckMode, highlightRelated });
            }

            // 只有在游戏已经开始时才重新渲染棋盘
            if (Game.isGameInitialized()) {
                renderBoard();
            }
        } catch (error) {
            console.error('保存设置时出错:', error);
        }

        // 关闭模态框
        elements.settingsModal.classList.remove('active');
    }

    /**
     * 显示历史记录模态框
     */
    function showHistoryModal() {
        const history = Storage.getGameHistory();
        const bestScores = Storage.getBestScores();

        // 渲染历史记录
        const historyList = document.getElementById('historyList');
        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无历史记录</p>';
        } else {
            historyList.innerHTML = history.map(game => `
                <div class="history-item">
                    <div class="info">
                        <div class="difficulty">${game.difficulty === 'easy' ? '简单' : game.difficulty === 'medium' ? '中等' : '困难'}</div>
                        <div class="date">${new Date(game.date).toLocaleString('zh-CN')}</div>
                    </div>
                    <div class="time">${formatTime(game.timeSpent)}</div>
                </div>
            `).join('');
        }

        // 渲染最佳成绩
        document.getElementById('bestEasy').textContent = bestScores.easy ? formatTime(bestScores.easy) : '--:--';
        document.getElementById('bestMedium').textContent = bestScores.medium ? formatTime(bestScores.medium) : '--:--';
        document.getElementById('bestHard').textContent = bestScores.hard ? formatTime(bestScores.hard) : '--:--';

        elements.historyModal.classList.add('active');
    }

    /**
     * 隐藏历史记录模态框
     */
    function hideHistoryModal() {
        elements.historyModal.classList.remove('active');
    }

    /**
     * 显示胜利模态框
     */
    function showVictoryModal() {
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };

        document.getElementById('victoryDifficulty').textContent = difficultyMap[Game.difficulty];
        document.getElementById('victoryTime').textContent = formatTime(seconds);

        elements.victoryModal.classList.add('active');
    }

    /**
     * 隐藏胜利模态框
     */
    function hideVictoryModal() {
        elements.victoryModal.classList.remove('active');
    }

    /**
     * 切换暂停
     */
    function togglePause() {
        Game.togglePause();

        if (Game.isPaused) {
            elements.pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
            stopTimer();
            showStatusMessage('游戏已暂停', 'info');

            // 添加暂停覆盖层
            elements.board.classList.add('paused');
            const overlay = document.createElement('div');
            overlay.className = 'paused-overlay';
            overlay.textContent = '已暂停';
            elements.board.appendChild(overlay);
        } else {
            elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            resumeTimer();
            showStatusMessage('游戏继续', 'info');

            // 移除暂停覆盖层
            elements.board.classList.remove('paused');
            const overlay = elements.board.querySelector('.paused-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    /**
     * 开始计时器（重置为0）
     */
    function startTimer() {
        stopTimer();
        seconds = 0;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }

    /**
     * 恢复计时器（从暂停处继续）
     */
    function resumeTimer() {
        if (timerInterval) {
            return; // 计时器已在运行
        }
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }

    /**
     * 使用提示
     */
    function useHint() {
        const hintCell = Game.hint();
        if (hintCell) {
            renderBoard();
            showStatusMessage('已填入一个正确数字', 'success');

            // 添加提示动画
            const cell = elements.board.querySelector(`[data-row="${hintCell.row}"][data-col="${hintCell.col}"]`);
            if (cell) {
                cell.classList.add('hint');
                setTimeout(() => {
                    cell.classList.remove('hint');
                }, 1000);
            }
        }
    }

    /**
     * 检查当前棋盘
     */
    function checkCurrentBoard() {
        const result = Game.checkAnswer();

        if (result.isCorrect) {
            showStatusMessage('全部正确！', 'success');
        } else {
            showStatusMessage(`发现 ${result.errorCells.length} 个错误`, 'error');

            // 标记错误格子
            result.errorCells.forEach(({ row, col }) => {
                const cell = elements.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('error');
                    setTimeout(() => {
                        cell.classList.remove('error');
                    }, 2000);
                }
            });
        }
    }

    /**
     * 保存当前游戏
     */
    function saveCurrentGame() {
        const gameState = Game.getGameState();
        gameState.timeSpent = seconds;
        Storage.saveGame(gameState);
        showStatusMessage('游戏已保存', 'success');
    }

    /**
     * 撤销
     */
    function undo() {
        Game.undo();
        renderBoard();
        showStatusMessage('已撤销', 'info');
    }

    /**
     * 重做
     */
    function redo() {
        Game.redo();
        renderBoard();
        showStatusMessage('已重做', 'info');
    }

    /**
     * 填入数字
     */
    function fillNumber(num) {
        Game.fillNumber(num);
        renderBoard();

        // 检查是否完成
        if (Game.isCompleted) {
            onGameCompleted();
        } else {
            // 如果是实时检查模式，检查当前格子
            const settings = Settings.getSettings();
            if (settings.errorCheckMode === 'realtime' && Game.selectedCell) {
                const { row, col } = Game.selectedCell;
                if (!Game.checkCell(row, col)) {
                    const cell = elements.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        cell.classList.add('error');
                    }
                }
            }
        }
    }

    /**
     * 删除数字
     */
    function deleteNumber() {
        Game.deleteNumber();
        renderBoard();
    }

    /**
     * 切换笔记模式
     */
    function toggleNoteMode() {
        Game.toggleNoteMode();
        renderBoard();

        if (Game.noteMode) {
            showStatusMessage('笔记模式已开启', 'info');
        } else {
            showStatusMessage('笔记模式已关闭', 'info');
        }
    }

    /**
     * 移动选中格子
     */
    function moveSelection(rowDelta, colDelta) {
        if (!Game.selectedCell) {
            // 如果没有选中，默认选中第一个格子
            Game.selectCell(0, 0);
        } else {
            const { row, col } = Game.selectedCell;
            const newRow = Math.max(0, Math.min(8, row + rowDelta));
            const newCol = Math.max(0, Math.min(8, col + colDelta));
            Game.selectCell(newRow, newCol);
        }
        renderBoard();
    }

    /**
     * 游戏完成时的处理
     */
    function onGameCompleted() {
        stopTimer();

        // 保存到历史记录
        Storage.saveGameHistory({
            difficulty: Game.difficulty,
            timeSpent: seconds,
            date: new Date().toISOString()
        });

        // 更新最佳成绩
        Storage.updateBestScore(Game.difficulty, seconds);

        showVictoryModal();
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        elements.themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        // 保存主题设置
        Settings.updateSettings({ darkMode: isDark });
    }

    /**
     * 加载保存的主题
     */
    function loadTheme() {
        const settings = Settings.getSettings();
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    /**
     * 停止计时器
     */
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    /**
     * 更新计时器显示
     */
    function updateTimerDisplay() {
        elements.timer.textContent = formatTime(seconds);
    }

    /**
     * 格式化时间
     */
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * 显示状态消息
     */
    function showStatusMessage(message, type = 'info') {
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = `status-message ${type} show`;

        setTimeout(() => {
            elements.statusMessage.classList.remove('show');
        }, 3000);
    }

    // 公开的API
    return {
        init: init,
        renderBoard: renderBoard,
        updateDifficultyDisplay: updateDifficultyDisplay,
        startNewGame: startNewGame,
        loadTheme: loadTheme,
        showStatusMessage: showStatusMessage
    };

})();
