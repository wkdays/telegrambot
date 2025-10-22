# Telegram RU-ZH 翻译机器人部署指南

## 概述

这是一个支持俄语和中文自动翻译的 Telegram 机器人，使用 DeepL API 提供高质量的翻译服务，支持多种部署方式。

## 部署方案

### 方案一：Docker 部署（推荐）

#### 前置要求
- Docker 和 docker-compose
- 云服务器（Ubuntu/CentOS/Debian）

#### 部署步骤

1. **上传代码到服务器**
```bash
# 将项目文件上传到服务器
scp -r . user@your-server:/opt/telegram-bot/
```

2. **配置环境变量**
```bash
cd /opt/telegram-bot
cp env.example .env
nano .env  # 编辑并设置 BOT_TOKEN
```

3. **运行部署脚本**
```bash
chmod +x deploy.sh
./deploy.sh docker
```

4. **验证部署**
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试健康检查
curl http://localhost:3000/health
```

#### 管理命令
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 更新代码
git pull
docker-compose build
docker-compose up -d
```

### 方案二：systemd 部署

#### 前置要求
- Node.js 18+
- 云服务器（Ubuntu/CentOS/Debian）

#### 部署步骤

1. **安装 Node.js**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

2. **运行部署脚本**
```bash
chmod +x deploy.sh
./deploy.sh systemd
```

3. **配置环境变量**
```bash
sudo nano /opt/telegram-bot/.env
# 设置 BOT_TOKEN
```

4. **启动服务**
```bash
sudo systemctl start telegram-bot
sudo systemctl enable telegram-bot
```

#### 管理命令
```bash
# 查看状态
sudo systemctl status telegram-bot

# 启动服务
sudo systemctl start telegram-bot

# 停止服务
sudo systemctl stop telegram-bot

# 重启服务
sudo systemctl restart telegram-bot

# 查看日志
sudo journalctl -u telegram-bot -f

# 更新代码
cd /opt/telegram-bot
git pull
sudo systemctl restart telegram-bot
```

## 配置 Nginx 反向代理（可选）

### 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 配置反向代理
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/telegram-bot

# 创建软链接
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 环境变量配置

### 必需配置
- `BOT_TOKEN`: Telegram Bot Token（从 @BotFather 获取）
- `DEEPL_API_KEY`: DeepL API Key（从 DeepL 官网获取）

### 可选配置
- `NODE_ENV`: 环境模式（production/development）
- `PORT`: 服务端口（默认 3000）
- `LOG_LEVEL`: 日志级别
- `CACHE_DURATION`: 翻译缓存时间
- `CONCURRENT_LIMIT`: 并发限制

## 监控和维护

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

### 性能监控
```bash
# 查看资源使用情况
docker stats  # Docker 方式
htop          # systemd 方式
```

## 故障排除

### 常见问题

1. **Bot 无法启动**
   - 检查 BOT_TOKEN 是否正确
   - 检查网络连接
   - 查看错误日志

2. **翻译服务不可用**
   - 检查网络连接
   - 检查 API 限制
   - 查看重试机制是否生效

3. **内存使用过高**
   - 调整并发限制
   - 检查缓存设置
   - 监控翻译请求量

### 调试模式
```bash
# 启用调试日志
export DEBUG=true
export LOG_LEVEL=debug

# 重启服务
docker-compose restart  # Docker 方式
sudo systemctl restart telegram-bot  # systemd 方式
```

## 安全建议

1. **使用非 root 用户运行**
2. **配置防火墙规则**
3. **定期更新依赖**
4. **监控异常请求**
5. **备份配置文件**

## 更新部署

### 代码更新
```bash
# 拉取最新代码
git pull

# 重新构建（Docker 方式）
docker-compose build
docker-compose up -d

# 重启服务（systemd 方式）
sudo systemctl restart telegram-bot
```

### 配置更新
```bash
# 修改配置后重启服务
sudo systemctl restart telegram-bot  # systemd 方式
docker-compose restart  # Docker 方式
```

## 支持

如有问题，请检查：
1. 日志文件
2. 系统资源使用情况
3. 网络连接
4. 环境变量配置
