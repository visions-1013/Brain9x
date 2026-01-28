# 🧠 Brain9x - 数独游戏

一个功能完整、设计精美的 Web 数独游戏，使用纯原生 HTML/CSS/JavaScript 开发。

![数独游戏](screenshots/main-game.png)

## ✨ 功能特点

- 🎮 **三种难度** - 简单、中等、困难
- 📝 **笔记模式** - 标记候选数字，辅助推理
- ↩️ **撤销/重做** - 支持多步操作
- 💡 **智能提示** - 随机填入正确数字
- ✅ **手动提交** - 完成后点击检查按钮验证答案
- ⏱️ **计时器** - 记录完成时间
- 💾 **自动保存** - 游戏进度自动保存
- 🏆 **最佳成绩** - 记录各难度最快完成时间
- 🌙 **深色模式** - 护眼深色主题
- 📱 **响应式设计** - 完美适配手机和电脑

## 🚀 如何运行

### 方法一：直接打开
1. 下载项目
2. 双击 `index.html` 在浏览器中打开

### 方法二：本地服务器
```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve

# 访问 http://localhost:8000
```

## ⌨️ 快捷键

| 按键 | 功能 |
|------|------|
| `方向键` | 移动格子 |
| `1-9` | 输入数字 |
| `Delete` | 删除 |
| `N` | 笔记模式 |
| `H` | 提示 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Space` | 暂停 |

## 🛠️ 技术栈

- HTML5
- CSS3（Grid、Flexbox、动画）
- JavaScript ES6+
- LocalStorage API

## 📂 项目结构

```
Brain9x/
├── index.html       # 主页面
├── css/
│   └── style.css    # 样式
└── js/
    ├── main.js       # 入口
    ├── generator.js  # 数独生成
    ├── game.js       # 游戏逻辑
    ├── ui.js         # 界面交互
    ├── storage.js    # 数据存储
    └── settings.js   # 设置管理
```

## 📸 游戏截图

![笔记模式](screenshots/note-mode.png)
![深色模式](screenshots/dark-mode.png)

## 📄 许可证

MIT License - 自由使用和修改
