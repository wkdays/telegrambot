#!/bin/bash

# Telegram Bot 部署脚本
# 使用方法: ./deploy.sh [docker|systemd]

set -e

DEPLOYMENT_TYPE=${1:-docker}
APP_NAME="telegram-ru-zh-bot"
APP_DIR="/opt/$APP_NAME"
SERVICE_USER="nodejs"

echo "🚀 开始部署 Telegram RU-ZH 翻译机器人..."

# 检查是否为 root 用户
if [[ $EUID -eq 0 ]]; then
   echo "❌ 请不要使用 root 用户运行此脚本"
   exit 1
fi

# 检查部署类型
if [[ "$DEPLOYMENT_TYPE" == "docker" ]]; then
    echo "📦 使用 Docker 部署..."
    deploy_docker
elif [[ "$DEPLOYMENT_TYPE" == "systemd" ]]; then
    echo "⚙️ 使用 systemd 部署..."
    deploy_systemd
else
    echo "❌ 无效的部署类型。请使用 'docker' 或 'systemd'"
    exit 1
fi

deploy_docker() {
    # 检查 Docker 是否安装
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi

    # 检查 docker-compose 是否安装
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ docker-compose 未安装，请先安装 docker-compose"
        exit 1
    fi

    # 创建 .env 文件（如果不存在）
    if [[ ! -f .env ]]; then
        echo "📝 创建 .env 文件..."
        cat > .env << EOF
# Telegram Bot Token
BOT_TOKEN=your_bot_token_here

# DeepL API Key
DEEPL_API_KEY=your_deepl_api_key_here

# 其他环境变量
NODE_ENV=production
EOF
        echo "⚠️  请编辑 .env 文件并设置正确的 BOT_TOKEN 和 DEEPL_API_KEY"
    fi

    # 构建并启动容器
    echo "🔨 构建 Docker 镜像..."
    docker-compose build

    echo "🚀 启动服务..."
    docker-compose up -d

    echo "✅ Docker 部署完成！"
    echo "📊 查看日志: docker-compose logs -f"
    echo "🛑 停止服务: docker-compose down"
}

deploy_systemd() {
    # 检查 Node.js 是否安装
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi

    # 创建应用目录
    echo "📁 创建应用目录..."
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $APP_DIR/logs

    # 创建服务用户
    if ! id "$SERVICE_USER" &>/dev/null; then
        echo "👤 创建服务用户..."
        sudo useradd -r -s /bin/false $SERVICE_USER
    fi

    # 复制应用文件
    echo "📋 复制应用文件..."
    sudo cp -r . $APP_DIR/
    sudo chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR

    # 安装依赖
    echo "📦 安装依赖..."
    cd $APP_DIR
    sudo -u $SERVICE_USER npm ci --only=production

    # 创建 .env 文件
    if [[ ! -f $APP_DIR/.env ]]; then
        echo "📝 创建 .env 文件..."
        sudo tee $APP_DIR/.env > /dev/null << EOF
# Telegram Bot Token
BOT_TOKEN=your_bot_token_here

# DeepL API Key
DEEPL_API_KEY=your_deepl_api_key_here

# 其他环境变量
NODE_ENV=production
EOF
        echo "⚠️  请编辑 $APP_DIR/.env 文件并设置正确的 BOT_TOKEN 和 DEEPL_API_KEY"
    fi

    # 安装 systemd 服务
    echo "⚙️ 安装 systemd 服务..."
    sudo cp telegram-bot.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable telegram-bot

    # 启动服务
    echo "🚀 启动服务..."
    sudo systemctl start telegram-bot

    echo "✅ systemd 部署完成！"
    echo "📊 查看状态: sudo systemctl status telegram-bot"
    echo "📋 查看日志: sudo journalctl -u telegram-bot -f"
    echo "🛑 停止服务: sudo systemctl stop telegram-bot"
}

echo "🎉 部署完成！"
