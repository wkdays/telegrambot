require('dotenv').config();
const express = require('express');
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const deepl = require('deepl-node');
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

// 初始化 DeepL 翻译器
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

// 限制并发翻译请求
const limit = pLimit(1); // 减少并发数

// 翻译请求缓存
const translationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 语言检测函数
async function detectLanguage(text) {
  try {
    // 使用 DeepL 检测语言
    const result = await translator.translateText(text, null, 'en-US');
    return result.detectedSourceLang;
  } catch (error) {
    console.error('Language detection failed:', error);
    // 简单的启发式检测
    if (/[\u4e00-\u9fff]/.test(text)) {
      return 'zh';
    } else if (/[а-яё]/i.test(text)) {
      return 'ru';
    }
    return 'auto';
  }
}

// 备用翻译服务（LibreTranslate）
async function fallbackTranslate(text, targetLang) {
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang === 'ru' ? 'ru' : 'zh',
        format: 'text'
      })
    });
    
    const data = await response.json();
    return {
      text: data.translatedText,
      detectedSourceLang: 'auto'
    };
  } catch (error) {
    console.error('Fallback translation failed:', error);
    throw error;
  }
}

// DeepL 翻译函数
async function translateWithDeepL(text, targetLang, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 检查缓存
      const cacheKey = `${text}_${targetLang}`;
      const cached = translationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.result;
      }

      // 添加延迟避免频率限制
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * i));
      }

      // 使用 DeepL 翻译
      const result = await translator.translateText(text, null, targetLang);
      
      const translationResult = {
        text: result.text,
        detectedSourceLang: result.detectedSourceLang
      };
      
      // 缓存结果
      translationCache.set(cacheKey, {
        result: translationResult,
        timestamp: Date.now()
      });
      
      return translationResult;
    } catch (error) {
      console.error(`DeepL translation attempt ${i + 1} failed:`, error.message);
      
      // 如果是配额限制，等待更长时间
      if (error.message.includes('quota') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 10000 * (i + 1)));
        continue;
      }
      
      // 如果是其他错误，尝试备用服务
      if (i === maxRetries - 1) {
        console.log('Trying fallback translation service...');
        try {
          return await fallbackTranslate(text, targetLang);
        } catch (fallbackError) {
          console.error('Fallback translation also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }
}

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
      // 检测语言
      const detectedLang = await detectLanguage(text);
      
      // 如果检测到的语言是俄语，翻译成中文
      if (detectedLang === 'ru') {
        const result = await translateWithDeepL(text, 'zh');
        await ctx.reply(`🇷🇺→🇨🇳 ${result.text}`);
      } 
      // 如果检测到的语言是中文，翻译成俄语
      else if (detectedLang === 'zh') {
        const result = await translateWithDeepL(text, 'ru');
        await ctx.reply(`🇨🇳→🇷🇺 ${result.text}`);
      }
      // 其他语言不处理
    });
  } catch (error) {
    console.error('Translation error:', error);
    
    // 如果是配额限制错误，发送友好提示
    if (error.message.includes('quota') || error.message.includes('Too Many Requests')) {
      await ctx.reply('⏳ sever is busy ,try again later!');
    } else {
      // 其他错误静默处理
      console.error('Translation failed:', error.message);
    }
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