# 快速部署指南

## 当前模式：本地模式（无需后端）

本项目已配置为完全本地运行模式，所有数据存储在浏览器中，无需服务器和数据库。

### 部署到 Netlify（推荐 - 5分钟完成）

1. **注册/登录 Netlify**
   - 访问 https://netlify.com

2. **上传 dist 文件夹**
   ```bash
   # 构建项目
   pnpm build
   
   # 将 dist 文件夹拖拽到 Netlify 的部署区域
   ```

3. **完成！** 🎉
   - Netlify 会自动配置 SSL 证书
   - 提供免费自定义域名

### 部署到 Vercel（推荐 - 5分钟完成）

1. **注册/登录 Vercel**
   - 访问 https://vercel.com

2. **导入项目**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel
   
   # 登录
   vercel login
   
   # 部署
   vercel --prod
   ```

3. **完成！** 🎉

### 部署到 GitHub Pages（免费 - 10分钟）

1. **创建 GitHub 仓库**
   - 推送代码到 GitHub

2. **启用 GitHub Pages**
   - 进入仓库 Settings > Pages
   - Source: Deploy from branch
   - Branch: gh-pages

3. **配置构建**
   - 添加 GitHub Action `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GH_TOKEN }}
             publish_dir: ./dist
   ```

4. **完成！** 🎉

### 部署到阿里云 OSS（国内访问快）

1. **创建 OSS Bucket**
   - 登录阿里云控制台
   - 进入对象存储 OSS
   - 创建 Bucket（公共读）

2. **上传文件**
   ```bash
   # 安装 ossutil
   # 配置凭证
   
   # 上传
   ossutil cp -r dist/ oss://your-bucket-name/
   ```

3. **配置静态网站托管**
   - Bucket > 基础设置 > 静态网站托管
   - 设置默认首页：index.html

4. **完成！** 🎉

### 部署到本地服务器（Nginx）

1. **构建项目**
   ```bash
   pnpm build
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/reading-notes/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 可选：配置 SSL
       # listen 443 ssl;
       # ssl_certificate /path/to/cert.pem;
       # ssl_certificate_key /path/to/key.pem;
   }
   ```

3. **启动服务**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **完成！** 🎉

## 快速部署命令汇总

```bash
# 1. 安装依赖（首次）
pnpm install

# 2. 构建生产版本
pnpm build

# 3. 预览构建结果
pnpm preview

# 4. 部署到 Netlify（需要安装 netlify-cli）
netlify deploy --prod --dir=dist

# 5. 部署到 Vercel（需要安装 vercel-cli）
vercel --prod
```

## 注意事项

### ⚠️ 重要提醒
1. **数据存储位置**：所有数据存储在用户的浏览器 localStorage 中
2. **数据备份**：定期导出数据（JSON/CSV 格式）
3. **多设备同步**：当前版本不支持，需要升级到生产模式

### 📋 部署检查清单
- [x] 已运行 `pnpm build` 无错误
- [x] 已测试所有核心功能
- [x] 已确认 base 路径配置正确
- [x] 已配置自定义域名（可选）
- [x] 已启用 HTTPS（Netlify/Vercel 自动配置）

## 遇到问题？

查看 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 获取详细的故障排除指南。

---

**祝部署成功！** 🚀
