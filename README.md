# Telegram RU-ZH 翻译机器人

一个支持俄语和中文自动翻译的 Telegram 机器人，使用 DeepL API 提供高质量的翻译服务。

## ✨ 功能特性

- 🇷🇺🇨🇳 **双向翻译**: 俄语 ↔ 中文自动翻译
- 🤖 **智能检测**: 自动检测输入语言
- 🚀 **高质量翻译**: 使用 DeepL API 提供准确翻译
- 💾 **缓存机制**: 避免重复翻译，提高响应速度
- 🔄 **备用服务**: LibreTranslate 作为备用翻译服务
- 🛡️ **错误处理**: 完善的错误处理和重试机制
- 📊 **健康检查**: 内置健康检查端点
- 🎤 **语音支持**: 预留语音消息处理接口

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Telegram Bot Token
- DeepL API Key

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
nano .env
```

必需的环境变量：
```bash
BOT_TOKEN=your_telegram_bot_token
DEEPL_API_KEY=your_deepl_api_key
```

### 运行测试

```bash
# 测试 DeepL API 集成
node test-bot.js
```

### 启动机器人

```bash
# 开发模式
npm start

# 生产模式
NODE_ENV=production npm start
```

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/wkdays/telegrambot.git
cd telegrambot

# 配置环境变量
cp env.example .env
nano .env

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 使用部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh

# Docker 部署
./deploy.sh docker

# systemd 部署
./deploy.sh systemd
```

## ⚙️ 系统服务部署

### 使用 systemd

```bash
# 运行部署脚本
./deploy.sh systemd

# 管理服务
sudo systemctl start telegram-bot
sudo systemctl stop telegram-bot
sudo systemctl restart telegram-bot
sudo systemctl status telegram-bot

# 查看日志
sudo journalctl -u telegram-bot -f
```

## 🌐 Nginx 反向代理

```bash
# 复制 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/telegram-bot

# 启用配置
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 📊 监控和维护

### 健康检查

```bash
# HTTP 健康检查
curl http://localhost:3000/health

# 预期响应
{
  "status": "ok",
  "service": "telegram-ru-zh-bot",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "bot": "running"
}
```

### 日志监控

```bash
# Docker 方式
docker-compose logs -f

# systemd 方式
sudo journalctl -u telegram-bot -f
```

## 🔧 配置选项

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `BOT_TOKEN` | ✅ | - | Telegram Bot Token |
| `DEEPL_API_KEY` | ✅ | - | DeepL API Key |
| `NODE_ENV` | ❌ | `production` | 运行环境 |
| `PORT` | ❌ | `3000` | 服务端口 |
| `LOG_LEVEL` | ❌ | `info` | 日志级别 |
| `CACHE_DURATION` | ❌ | `300000` | 缓存时间（毫秒） |
| `CONCURRENT_LIMIT` | ❌ | `1` | 并发限制 |

### 高级配置

- **翻译缓存**: 5分钟缓存，减少 API 调用
- **并发控制**: 限制同时处理的翻译请求
- **重试机制**: 3次重试，指数退避
- **备用服务**: LibreTranslate 作为备用

## 🧪 测试

```bash
# 运行完整功能测试
node test-bot.js

# 测试特定功能
npm test
```

## 📁 项目结构

```
telegrambot/
├── bot.js                 # 主程序文件
├── package.json           # 项目配置
├── Dockerfile            # Docker 镜像配置
├── docker-compose.yml    # Docker 编排配置
├── deploy.sh             # 自动化部署脚本
├── telegram-bot.service  # systemd 服务配置
├── nginx.conf            # Nginx 配置
├── env.example           # 环境变量模板
├── test-bot.js           # 功能测试脚本
├── DEPLOYMENT.md         # 详细部署指南
├── CHANGELOG.md          # 更新日志
└── README.md             # 项目说明
```

## 🔑 API 密钥获取

### Telegram Bot Token

1. 联系 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 获取 Bot Token

### DeepL API Key

1. 访问 [DeepL Pro](https://www.deepl.com/pro-api)
2. 注册账户并选择订阅计划
3. 在账户设置中获取 API Key
4. 免费版每月 500,000 字符限制

## 🚨 故障排除

### 常见问题

1. **机器人无响应**
   - 检查 BOT_TOKEN 是否正确
   - 确认网络连接正常
   - 查看错误日志

2. **翻译失败**
   - 检查 DEEPL_API_KEY 是否有效
   - 确认 API 配额未用完
   - 查看重试机制是否生效

3. **部署问题**
   - 检查环境变量配置
   - 确认端口未被占用
   - 查看服务状态和日志

### 调试模式

```bash
# 启用详细日志
export DEBUG=true
export LOG_LEVEL=debug

# 重启服务
docker-compose restart  # Docker 方式
sudo systemctl restart telegram-bot  # systemd 方式
```

## 📈 性能优化

- **缓存策略**: 5分钟翻译缓存
- **并发控制**: 限制同时请求数
- **资源限制**: Docker 内存和 CPU 限制
- **健康检查**: 定期检查服务状态

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC License

## 🔗 相关链接

- [DeepL API 文档](https://www.deepl.com/docs-api)
- [Grammy.js 文档](https://grammy.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**注意**: 请确保遵守相关 API 的使用条款和限制。