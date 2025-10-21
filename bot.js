require('dotenv').config();
const express = require('express');
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { translate } = require("@vitalets/google-translate-api");
const pLimit = require('p-limit').default;

// Express 应用设置
const app = express();
const PORT = process.env.PORT || 3000;

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'telegram-ru-zh-bot',
    timestamp: new Date().toISOString(),
    bot: 'running'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Telegram RU↔ZH Translate Bot is running',
    status: 'active',
    features: ['russian-chinese-translation', 'voice-support-planned']
  });
});

// 创建一个Bot类的实例，并将之前创建好的 bot token传给它
const bot = new Bot(process.env.BOT_TOKEN);

// 设置自动重试
bot.api.config.use(autoRetry());

// 限制并发翻译请求
const limit = pLimit(3);

// 允许私聊和群组消息（便于测试）
bot.use((ctx, next) => {
  if (ctx.chat?.type === 'private' || ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') {
    return next();
  }
});

// 处理 /start 命令
bot.command("start", (ctx) => ctx.reply("欢迎使用 我们之间的翻译 bot. 我会自动翻译俄语和中文之间的消息。"));

// 处理文本消息的自动翻译
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text?.trim();
  if (!text) return;

  try {
    // 使用限制器避免过多并发请求
    await limit(async () => {
      // 检测语言并翻译
      const result = await translate(text, { 
        to: 'zh'
      });

      // 如果检测到的语言是俄语，翻译成中文
      if (result.raw.src === 'ru') {
        await ctx.reply(`🇷🇺→🇨🇳 ${result.text}`);
      } 
      // 如果检测到的语言是中文，翻译成俄语
      else if (result.raw.src === 'zh' || result.raw.src === 'zh-CN') {
        const ruResult = await translate(text, { 
          to: 'ru'
        });
        await ctx.reply(`🇨🇳→🇷🇺 ${ruResult.text}`);
      }
      // 其他语言不处理
    });
  } catch (error) {
    console.error('Translation error:', error);
    // 静默处理错误，避免spam
  }
});

// 处理语音消息
bot.on(["message:voice", "message:audio"], async (ctx) => {
  try {
    await ctx.reply("🎤 语音消息已收到！语音翻译功能正在开发中，请先发送文字消息进行翻译。");
    
    // TODO: 实现语音转文字功能
    // 1. 下载语音文件
    // 2. 转换为WAV格式
    // 3. 使用语音识别API
    // 4. 翻译识别结果
    // 5. 发送翻译结果
    
  } catch (error) {
    console.error('Voice handling error:', error);
    await ctx.reply("处理语音消息时出错，请重试。");
  }
});

// 错误处理
bot.catch((err) => {
  console.error('Bot error:', err);
});

// 启动 HTTP 服务器
app.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

// 启动 bot
console.log('🤖 Telegram RU↔ZH Translate Bot 启动中...');
console.log('Environment:', process.env.NODE_ENV || 'development');
bot.start();
console.log('✅ Bot 已启动，等待消息...');