# 更新日志

## [2.0.0] - 2024-01-XX

### 🚀 重大更新
- **迁移到 DeepL API**: 将翻译服务从 Google Translate API 迁移到 DeepL API
- **提升翻译质量**: DeepL 提供更准确、更自然的翻译结果
- **更好的语言检测**: 使用 DeepL 的语言检测功能，提高检测准确性

### ✨ 新功能
- 支持 DeepL API 的所有语言对
- 改进的错误处理和重试机制
- 更详细的日志记录
- 配额监控和警告

### 🔧 技术改进
- 移除 Google Translate API 依赖
- 添加 `deepl-node` 官方客户端库
- 优化翻译缓存机制
- 改进语言检测逻辑

### 📦 依赖更新
- 添加: `deepl-node@^1.20.0`
- 移除: `@vitalets/google-translate-api@^9.2.1`

### 🔑 环境变量更新
- 新增必需环境变量: `DEEPL_API_KEY`
- 更新环境变量模板文件

### 🧪 测试
- 添加完整的功能测试脚本 (`test-bot.js`)
- 验证翻译质量和语言检测准确性
- 测试错误处理和重试机制

### 📚 文档更新
- 更新部署指南
- 添加 DeepL API 配置说明
- 更新环境变量配置文档

### 🚀 部署说明
1. 获取 DeepL API Key
2. 更新环境变量配置
3. 运行测试脚本验证功能
4. 使用现有部署脚本部署

---

## [1.0.0] - 初始版本

### ✨ 功能
- 基本的俄语-中文翻译功能
- Google Translate API 集成
- Telegram Bot 框架
- 健康检查端点
- Docker 和 systemd 部署支持
