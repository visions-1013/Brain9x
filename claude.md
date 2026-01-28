# Claude Code 项目指导

## 项目概述
Brain9x - 一个纯原生 JavaScript 开发的数独游戏。

## 📝 重要规则
**每次添加、修改或删除功能时，必须同步更新 README.md！**

更新 README 时请：
1. 在"功能特点"部分添加/修改对应功能
2. 如果新增了快捷键，更新"快捷键"表格
3. 如果新增了文件，更新"项目结构"

## 项目结构
```
Brain9x/
├── index.html       # 主页面
├── README.md        # ⚠️ 每次功能变动都要更新！
├── css/
│   └── style.css    # 样式文件
└── js/
    ├── main.js       # 入口
    ├── generator.js  # 数独生成（回溯算法）
    ├── game.js       # 游戏逻辑、笔记、撤销/重做
    ├── ui.js         # 界面渲染、事件处理
    ├── storage.js    # LocalStorage 数据管理
    └── settings.js   # 设置管理
```

## 核心技术栈
- 原生 HTML5/CSS3/JavaScript ES6+
- 模块化：每个文件使用 IIFE (立即执行函数) 封装
- LocalStorage：保存游戏进度、历史记录、最佳成绩、设置

## 常见问题处理

### NaN 显示问题
所有涉及笔记数组操作的地方都要确保：
1. 检查 `notes[row]` 是否存在
2. 检查 `notes[row][col]` 是否存在
3. 使用 `ensureNotesInitialized(row, col)` 辅助函数

### 计时器问题
- `startTimer()` - 新游戏开始时调用（重置为0）
- `resumeTimer()` - 暂停后继续时调用（不重置）
- `stopTimer()` - 暂停或游戏结束时调用

## 开发规范
- ✅ 函数必须添加注释
- ✅ 遵循现有代码风格
- ✅ 使用 const 和 let，避免 var
- ✅ 使用箭头函数
- ✅ 每个模块独立封装，避免全局污染

## 本地运行
```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# 访问 http://localhost:8000
```

## 浏览器测试
- Chrome/Edge（主要）
- Firefox
- Safari（iOS）
- 移动端响应式测试
