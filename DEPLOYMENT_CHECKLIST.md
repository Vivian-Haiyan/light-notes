# 拾光札记 - 部署检查清单

## 1. 环境配置检查 ✅

### 必需环境变量
- [x] `VITE_SUPABASE_URL` - Supabase 项目地址（使用真实后端时必需）
- [x] `VITE_SUPABASE_ANON_KEY` - Supabase 匿名密钥（使用真实后端时必需）
- [x] `VITE_USE_MOCK_AUTH` - 是否使用模拟认证（本地模式：true）
- [x] `VITE_USE_LOCAL_DATA` - 是否使用本地数据存储（本地模式：true）

### 本地模式 vs 生产模式
**本地模式（当前）：**
- `VITE_USE_MOCK_AUTH=true`
- `VITE_USE_LOCAL_DATA=true`
- 所有数据存储在浏览器 localStorage
- 无需后端服务器
- 适合：演示、个人使用、小规模部署

**生产模式（需要后端）：**
- `VITE_USE_MOCK_AUTH=false`
- `VITE_USE_LOCAL_DATA=false`
- 需要配置 Supabase 或其他后端服务
- 数据存储在云数据库
- 适合：多用户、长期数据持久化、需要分享功能

## 2. 构建配置 ✅

### Vite 配置
- [x] `base: '/'` - 适用于根路径部署
- [x] 如部署在子路径，需修改为 `/your-sub-path/`

### TypeScript 配置
- [x] 严格模式已启用
- [x] 无未使用变量（构建无警告）
- [x] 路径别名 `@/*` 已配置

## 3. 性能优化 ✅

### 代码分割
- [x] 所有页面组件使用 `React.lazy()` 懒加载
- [x] 每个页面有独立的骨架屏组件
- [x] 第三方库（antd、pdf-lib、recharts）单独打包

### 骨架屏实现
- [x] BooksPageSkeleton - 书架页
- [x] BookDetailPageSkeleton - 书籍详情页
- [x] TagsPageSkeleton - 标签页
- [x] InspirationsPageSkeleton - 灵感集锦页
- [x] HighlightsPageSkeleton - 书摘页
- [x] CollectionsPageSkeleton - 书单页
- [x] ReadingPlansPageSkeleton - 阅读计划页
- [x] SearchPageSkeleton - 搜索页
- [x] StatsPageSkeleton - 统计页
- [x] TrashPageSkeleton - 回收站页
- [x] NoteEditPageSkeleton - 笔记编辑页
- [x] ProfilePageSkeleton - 个人资料页

## 4. 已知问题 ⚠️

### 大文件 Chunk（可优化）
- `vendor-antd`: 878 KB (gzip: 275 KB)
- `vendor-pdf`: 435 KB (gzip: 180 KB)
- `vendor-recharts`: 388 KB (gzip: 113 KB)

**建议优化方案：**
1. 按需引入 antd 组件（配置 vite-plugin-import）
2. 延迟加载 PDF 生成功能
3. 考虑使用更轻量的图表库

### 网络请求（生产模式）
- 某些页面在首次加载时会尝试连接 Supabase
- 确保网络连接稳定或使用本地模式

## 5. 部署方式

### 方式一：静态托管（当前推荐）
适合本地模式，无需后端服务器

**部署步骤：**
```bash
# 1. 修改 .env.production 中的配置
# 2. 构建生产版本
pnpm build

# 3. 上传 dist 目录到托管服务
# 支持：Netlify、Vercel、GitHub Pages、阿里云 OSS、腾讯云 COS 等
```

### 方式二：传统服务器
适合生产模式，需要配置反向代理

**部署步骤：**
```bash
# 1. 修改 .env.production 配置（使用真实 Supabase）
# 2. 构建
pnpm build

# 3. 配置 Nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 6. 功能验证清单

### 登录与认证 ✅
- [x] 访客登录（本地模式）
- [x] 邮箱登录（本地模式）
- [x] 用户信息管理

### 书架管理 ✅
- [x] 显示书籍列表
- [x] 添加新书籍
- [x] 编辑书籍信息
- [x] 删除书籍
- [x] 按状态筛选
- [x] 导出书籍（JSON/CSV/PDF/图片）

### 笔记管理 ✅
- [x] 创建笔记
- [x] 编辑笔记
- [x] 删除笔记
- [x] 按标签筛选
- [x] 笔记分类（金句、感悟、书摘、灵感等）

### 书单管理 ✅
- [x] 创建书单
- [x] 编辑书单
- [x] 删除书单
- [x] 向书单添加书籍
- [x] 从书单移除书籍

### 标签系统 ✅
- [x] 动态标签导航
- [x] 标签筛选
- [x] 搜索笔记内容
- [x] 按使用频率排序

### 阅读计划 ✅
- [x] 创建阅读计划
- [x] 编辑计划
- [x] 跟踪进度
- [x] 完成/放弃计划

### 数据可视化 ✅
- [x] 阅读统计图表
- [x] 标签分布
- [x] 阅读趋势

### 其他功能 ✅
- [x] 主题切换（浅色/深色）
- [x] 回收站
- [x] 数据导入/导出
- [x] 个人资料管理
- [x] 设置页面

## 7. 浏览器兼容性

### 测试通过的浏览器
- [x] Chrome 90+
- [x] Firefox 88+
- [x] Safari 14+
- [x] Edge 90+

### 必需功能
- [x] ES2020 支持
- [x] CSS Grid/Flexbox
- [x] LocalStorage API
- [x] Clipboard API

## 8. 安全考虑

### 当前实现（本地模式）
- ✅ 数据存储在用户本地浏览器
- ✅ 无跨站请求风险
- ⚠️ 数据仅存在于单个浏览器
- ⚠️ 更换设备或清除浏览器数据会丢失数据

### 生产模式建议
- ⚠️ 配置 Supabase Row Level Security (RLS)
- ⚠️ 启用邮箱验证
- ⚠️ 配置 CORS 策略
- ⚠️ 定期备份数据库

## 9. 部署前检查

### 代码检查
```bash
# 1. 运行 TypeScript 类型检查
pnpm tsc --noEmit

# 2. 运行构建
pnpm build

# 3. 检查构建输出
ls -la dist/
```

### 功能测试
```bash
# 1. 启动预览服务器
pnpm preview

# 2. 测试所有核心功能
# - 登录/登出
# - 添加/编辑/删除书籍
# - 创建/编辑/删除笔记
# - 标签筛选
# - 导出功能
# - 主题切换
```

## 10. 故障排除

### 问题：构建失败
**解决方案：**
```bash
# 清理缓存
rm -rf node_modules/.vite
rm -rf dist

# 重新安装依赖
pnpm install

# 重新构建
pnpm build
```

### 问题：页面空白
**解决方案：**
1. 检查浏览器控制台错误
2. 确认 base 路径配置正确
3. 检查环境变量是否加载

### 问题：数据不显示
**解决方案：**
1. 确认使用正确的环境配置
2. 清除浏览器缓存和 localStorage
3. 重新登录

## 11. 下一步优化建议

### 短期（1-2天）
- [ ] 优化大文件 chunk（antd 按需引入）
- [ ] 添加 PWA 支持（离线访问）
- [ ] 添加键盘快捷键

### 中期（1周）
- [ ] 实现真正的后端认证系统
- [ ] 添加数据同步功能
- [ ] 优化移动端体验
- [ ] 添加国际化支持

### 长期（1个月）
- [ ] 实现多设备同步
- [ ] 添加数据导入/导出（从豆瓣、微信读书等）
- [ ] 添加社交分享功能
- [ ] 开发移动端 App

## 12. 联系与支持

如遇到部署问题，请提供：
1. 错误信息截图
2. 构建日志
3. 部署环境信息（操作系统、Web 服务器版本等）

---

**当前状态：** ✅ 可部署
**部署模式：** 本地模式（无需后端）
**推荐部署方式：** 静态托管（Netlify/Vercel/GitHub Pages）
