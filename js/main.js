/**
 * ========================================
 * 主入口文件
 * 功能：初始化游戏，协调各模块工作
 * ========================================
 */

(function() {
    'use strict';

    /**
     * 应用初始化
     */
    function init() {
        console.log('Brain9x - 大脑训练数独游戏启动中...');

        // 初始化UI模块
        UI.init();

        // 加载保存的主题
        UI.loadTheme();

        // 尝试加载保存的游戏
        const savedGame = Storage.loadGame();

        if (savedGame) {
            // 如果有保存的游戏，询问用户是否继续
            const continueGame = confirm(
                '发现未完成的游戏进度！\n' +
                `难度：${savedGame.difficulty === 'easy' ? '简单' : savedGame.difficulty === 'medium' ? '中等' : '困难'}\n` +
                `保存时间：${new Date(savedGame.savedAt).toLocaleString('zh-CN')}\n\n` +
                '是否继续游戏？\n\n' +
                '点击"确定"继续游戏，点击"取消"开始新游戏。'
            );

            if (continueGame) {
                // 加载保存的游戏
                Game.loadGame(savedGame);
                UI.renderBoard();
                UI.updateDifficultyDisplay();

                // 恢复计时器
                // 注意：这里只是简单实现，实际应该保存游戏时间并继续
                UI.showStatusMessage('已加载保存的游戏', 'success');
            } else {
                // 开始新游戏
                showNewGameDialog();
            }
        } else {
            // 没有保存的游戏，直接显示新游戏对话框
            showNewGameDialog();
        }

        console.log('Brain9x 初始化完成！');
    }

    /**
     * 显示新游戏对话框
     */
    function showNewGameDialog() {
        // 使用setTimeout确保DOM已完全加载
        setTimeout(() => {
            document.getElementById('newGameModal').classList.add('active');
        }, 100);
    }

    /**
     * 页面加载完成后初始化应用
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM已经加载完成
        init();
    }

    /**
     * 页面卸载前自动保存游戏
     */
    window.addEventListener('beforeunload', (e) => {
        // 如果游戏正在进行且未完成，自动保存
        if (!Game.isPaused && !Game.isCompleted && Game.selectedCell !== null) {
            const gameState = Game.getGameState();
            Storage.saveGame(gameState);
        }
    });

    /**
     * 防止意外关闭页面导致进度丢失
     * 注意：现代浏览器可能忽略自定义消息，但会显示默认提示
     */
    let saveInProgress = false;

    window.addEventListener('beforeunload', (e) => {
        // 如果游戏正在进行且未完成，提示用户
        if (!Game.isPaused && !Game.isCompleted && Game.selectedCell !== null && !saveInProgress) {
            // 自动保存
            saveInProgress = true;
            const gameState = Game.getGameState();
            Storage.saveGame(gameState);

            // 显示提示（注意：现代浏览器可能忽略自定义消息）
            e.preventDefault();
            e.returnValue = '游戏进度已自动保存，确定要离开吗？';
            saveInProgress = false;
        }
    });

})();
