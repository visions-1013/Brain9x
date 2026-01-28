/**
 * ========================================
 * 设置管理模块
 * 功能：保存和加载游戏设置（错误检查模式、主题等）
 * ========================================
 */

const Settings = (function() {
    'use strict';

    // localStorage的键名
    const SETTINGS_KEY = 'brain9x_settings';

    // 默认设置
    const DEFAULT_SETTINGS = {
        // 错误检查模式：'manual'（提交检查）或 'realtime'（实时检查）
        errorCheckMode: 'manual',
        // 深色模式
        darkMode: false,
        // 高亮相关格子（同行、同列、同宫格）
        highlightRelated: true,
        // 音效（预留，后期可添加）
        soundEnabled: true,
        // 语言（预留，后期可添加多语言）
        language: 'zh-CN'
    };

    /**
     * 获取当前设置
     * @returns {Object} 设置对象
     */
    function getSettings() {
        try {
            const settingsJSON = localStorage.getItem(SETTINGS_KEY);

            if (!settingsJSON) {
                // 如果没有保存的设置，返回默认设置
                return { ...DEFAULT_SETTINGS };
            }

            // 合并默认设置和保存的设置（确保新增的设置项有默认值）
            const savedSettings = JSON.parse(settingsJSON);
            return { ...DEFAULT_SETTINGS, ...savedSettings };
        } catch (error) {
            console.error('获取设置失败:', error);
            return { ...DEFAULT_SETTINGS };
        }
    }

    /**
     * 更新设置
     * @param {Object} newSettings - 要更新的设置对象
     */
    function updateSettings(newSettings) {
        try {
            // 获取当前设置
            const currentSettings = getSettings();

            // 合并新设置
            const updatedSettings = { ...currentSettings, ...newSettings };

            // 保存到localStorage
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));

            return true;
        } catch (error) {
            console.error('更新设置失败:', error);
            return false;
        }
    }

    /**
     * 重置设置为默认值
     */
    function resetToDefault() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            return true;
        } catch (error) {
            console.error('重置设置失败:', error);
            return false;
        }
    }

    /**
     * 清除所有设置
     */
    function clearSettings() {
        try {
            localStorage.removeItem(SETTINGS_KEY);
            return true;
        } catch (error) {
            console.error('清除设置失败:', error);
            return false;
        }
    }

    /**
     * 获取错误检查模式
     * @returns {string} 'manual' 或 'realtime'
     */
    function getErrorCheckMode() {
        const settings = getSettings();
        return settings.errorCheckMode;
    }

    /**
     * 设置错误检查模式
     * @param {string} mode - 'manual' 或 'realtime'
     */
    function setErrorCheckMode(mode) {
        if (mode !== 'manual' && mode !== 'realtime') {
            console.error('无效的错误检查模式:', mode);
            return false;
        }

        return updateSettings({ errorCheckMode: mode });
    }

    /**
     * 切换错误检查模式
     */
    function toggleErrorCheckMode() {
        const currentMode = getErrorCheckMode();
        const newMode = currentMode === 'manual' ? 'realtime' : 'manual';
        return setErrorCheckMode(newMode);
    }

    /**
     * 获取深色模式设置
     * @returns {boolean} 是否启用深色模式
     */
    function getDarkMode() {
        const settings = getSettings();
        return settings.darkMode;
    }

    /**
     * 设置深色模式
     * @param {boolean} enabled - 是否启用深色模式
     */
    function setDarkMode(enabled) {
        return updateSettings({ darkMode: enabled });
    }

    /**
     * 切换深色模式
     */
    function toggleDarkMode() {
        const currentMode = getDarkMode();
        return setDarkMode(!currentMode);
    }

    /**
     * 获取高亮相关格子设置
     * @returns {boolean} 是否启用高亮相关格子
     */
    function getHighlightRelated() {
        const settings = getSettings();
        return settings.highlightRelated;
    }

    /**
     * 设置高亮相关格子
     * @param {boolean} enabled - 是否启用高亮相关格子
     */
    function setHighlightRelated(enabled) {
        return updateSettings({ highlightRelated: enabled });
    }

    /**
     * 切换高亮相关格子
     */
    function toggleHighlightRelated() {
        const current = getHighlightRelated();
        return setHighlightRelated(!current);
    }

    // 公开的API
    return {
        getSettings: getSettings,
        updateSettings: updateSettings,
        resetToDefault: resetToDefault,
        clearSettings: clearSettings,
        getErrorCheckMode: getErrorCheckMode,
        setErrorCheckMode: setErrorCheckMode,
        toggleErrorCheckMode: toggleErrorCheckMode,
        getDarkMode: getDarkMode,
        setDarkMode: setDarkMode,
        toggleDarkMode: toggleDarkMode,
        getHighlightRelated: getHighlightRelated,
        setHighlightRelated: setHighlightRelated,
        toggleHighlightRelated: toggleHighlightRelated
    };

})();
