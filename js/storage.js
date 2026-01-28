/**
 * ========================================
 * 本地存储模块
 * 功能：保存游戏进度、加载游戏、历史记录、最佳成绩
 * ========================================
 */

const Storage = (function() {
    'use strict';

    // localStorage的键名
    const KEYS = {
        SAVED_GAME: 'brain9x_saved_game',
        GAME_HISTORY: 'brain9x_game_history',
        BEST_SCORES: 'brain9x_best_scores'
    };

    /**
     * 保存当前游戏进度
     * @param {Object} gameState - 游戏状态数据
     */
    function saveGame(gameState) {
        try {
            // 添加保存时间戳
            gameState.savedAt = new Date().toISOString();

            // 保存到localStorage
            localStorage.setItem(KEYS.SAVED_GAME, JSON.stringify(gameState));

            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            return false;
        }
    }

    /**
     * 加载保存的游戏
     * @returns {Object|null} 游戏状态数据，如果没有保存则返回null
     */
    function loadGame() {
        try {
            const savedGameJSON = localStorage.getItem(KEYS.SAVED_GAME);

            if (!savedGameJSON) {
                return null;
            }

            const savedGame = JSON.parse(savedGameJSON);

            // 检查保存的游戏是否过期（7天）
            const savedAt = new Date(savedGame.savedAt);
            const now = new Date();
            const daysDiff = (now - savedAt) / (1000 * 60 * 60 * 24);

            if (daysDiff > 7) {
                // 超过7天，删除保存
                deleteSavedGame();
                return null;
            }

            return savedGame;
        } catch (error) {
            console.error('加载游戏失败:', error);
            return null;
        }
    }

    /**
     * 删除保存的游戏
     */
    function deleteSavedGame() {
        try {
            localStorage.removeItem(KEYS.SAVED_GAME);
            return true;
        } catch (error) {
            console.error('删除保存失败:', error);
            return false;
        }
    }

    /**
     * 检查是否有保存的游戏
     * @returns {boolean} 是否有保存的游戏
     */
    function hasSavedGame() {
        return localStorage.getItem(KEYS.SAVED_GAME) !== null;
    }

    /**
     * 保存游戏历史记录
     * @param {Object} gameData - 游戏数据 { difficulty, timeSpent, date }
     */
    function saveGameHistory(gameData) {
        try {
            // 获取现有的历史记录
            let history = getGameHistory();

            // 添加新记录
            history.push(gameData);

            // 按日期倒序排序
            history.sort((a, b) => new Date(b.date) - new Date(a.date));

            // 最多保留50条记录
            if (history.length > 50) {
                history = history.slice(0, 50);
            }

            // 保存到localStorage
            localStorage.setItem(KEYS.GAME_HISTORY, JSON.stringify(history));

            return true;
        } catch (error) {
            console.error('保存历史记录失败:', error);
            return false;
        }
    }

    /**
     * 获取游戏历史记录
     * @returns {Array} 历史记录数组
     */
    function getGameHistory() {
        try {
            const historyJSON = localStorage.getItem(KEYS.GAME_HISTORY);

            if (!historyJSON) {
                return [];
            }

            return JSON.parse(historyJSON);
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    }

    /**
     * 清空游戏历史记录
     */
    function clearGameHistory() {
        try {
            localStorage.removeItem(KEYS.GAME_HISTORY);
            return true;
        } catch (error) {
            console.error('清空历史记录失败:', error);
            return false;
        }
    }

    /**
     * 更新最佳成绩
     * @param {string} difficulty - 难度等级
     * @param {number} timeSpent - 用时（秒）
     */
    function updateBestScore(difficulty, timeSpent) {
        try {
            // 获取现有的最佳成绩
            const bestScores = getBestScores();

            // 如果该难度还没有记录，或者新成绩更好，则更新
            if (!bestScores[difficulty] || timeSpent < bestScores[difficulty]) {
                bestScores[difficulty] = timeSpent;

                // 保存到localStorage
                localStorage.setItem(KEYS.BEST_SCORES, JSON.stringify(bestScores));

                return true;
            }

            return false;
        } catch (error) {
            console.error('更新最佳成绩失败:', error);
            return false;
        }
    }

    /**
     * 获取最佳成绩
     * @returns {Object} 最佳成绩对象 { easy: 秒数, medium: 秒数, hard: 秒数 }
     */
    function getBestScores() {
        try {
            const bestScoresJSON = localStorage.getItem(KEYS.BEST_SCORES);

            if (!bestScoresJSON) {
                return { easy: null, medium: null, hard: null };
            }

            return JSON.parse(bestScoresJSON);
        } catch (error) {
            console.error('获取最佳成绩失败:', error);
            return { easy: null, medium: null, hard: null };
        }
    }

    /**
     * 清空最佳成绩
     */
    function clearBestScores() {
        try {
            localStorage.removeItem(KEYS.BEST_SCORES);
            return true;
        } catch (error) {
            console.error('清空最佳成绩失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据（保存的游戏、历史记录、最佳成绩）
     */
    function clearAllData() {
        deleteSavedGame();
        clearGameHistory();
        clearBestScores();
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储信息 { hasSavedGame, historyCount, hasBestScores }
     */
    function getStorageInfo() {
        const history = getGameHistory();
        const bestScores = getBestScores();

        return {
            hasSavedGame: hasSavedGame(),
            historyCount: history.length,
            hasBestScores: {
                easy: bestScores.easy !== null,
                medium: bestScores.medium !== null,
                hard: bestScores.hard !== null
            }
        };
    }

    // 公开的API
    return {
        saveGame: saveGame,
        loadGame: loadGame,
        deleteSavedGame: deleteSavedGame,
        hasSavedGame: hasSavedGame,
        saveGameHistory: saveGameHistory,
        getGameHistory: getGameHistory,
        clearGameHistory: clearGameHistory,
        updateBestScore: updateBestScore,
        getBestScores: getBestScores,
        clearBestScores: clearBestScores,
        clearAllData: clearAllData,
        getStorageInfo: getStorageInfo
    };

})();
