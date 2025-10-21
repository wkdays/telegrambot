# Telegram RU↔ZH Translate Bot

一个自动翻译俄语和中文之间消息的 Telegram 群组机器人。

## 功能

- ✅ 自动检测并翻译俄语→中文
- ✅ 自动检测并翻译中文→俄语  
- ✅ 支持私聊和群组
- ✅ 速率限制防止spam
- ✅ 错误处理和日志记录
- 🔄 语音翻译功能开发中（基础框架已就绪）

## 部署到 Render

### 环境变量设置

在 Render 中设置以下环境变量：
- `BOT_TOKEN`: 您的 Telegram Bot Token
- `NODE_ENV`: `production`

### 部署配置

1. 连接 GitHub 仓库
2. 选择 "Web Service"
3. 设置：
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: `20.x`

## 本地开发

### 1. 环境准备

```bash
# 激活conda环境
conda activate telegrambot

# 安装依赖
npm install
```

### 2. 配置

复制示例配置并填写：

```bash
cp .env.example .env
# 编辑 .env 填入真实 token 等
```

> 注意：`.env` 已在 `.gitignore` 中，不会被提交。

### 3. 运行

```bash
npm start
```

## 使用方法

1. 将机器人添加到群组或私聊
2. 发送 `/start` 命令初始化
3. 发送俄语或中文消息，机器人会自动翻译

## 技术栈

- **Bot框架**: grammy
- **翻译API**: @vitalets/google-translate-api (免费)
- **环境管理**: conda (本地) / Render (生产)
- **配置管理**: dotenv

## 注意事项

- 机器人支持私聊和群组
- 免费翻译API有配额限制
- 语音翻译功能正在开发中
- Render 部署需要设置环境变量