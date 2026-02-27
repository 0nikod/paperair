# PaperAir

一个基于 [Astro](https://astro.build/) 构建的个人博客与动态站点模板。

## 功能特性

- **博客系统** -- 支持 Markdown 撰写，含标题、描述、封面图、标签、分类、草稿等丰富 Frontmatter 字段
- **动态 (Moments)** -- 类似微博/说说的短内容发布，支持图片组，按年月归档并以时间线方式展示
- **全文搜索** -- 集成 [Pagefind](https://pagefind.app/)，实现静态站点客户端搜索
- **深/浅色主题切换** -- 基于 DaisyUI 主题系统，支持用户手动切换并持久化偏好
- **CMS 管理** -- 集成 [Decap CMS](https://decapcms.org/)，通过 Web UI 管理博客文章和动态内容
- **RSS 订阅** -- 自动生成 RSS Feed (`/rss.xml`)
- **Sitemap** -- 自动生成站点地图，利于搜索引擎收录
- **SEO 友好** -- 语义化 HTML 标签、meta 信息、robots.txt 等
- **响应式布局** -- 适配桌面端与移动端

## 技术栈

| 类别 | 技术 |
| :--- | :--- |
| 框架 | [Astro](https://astro.build/) 5 |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) 4 + [DaisyUI](https://daisyui.com/) 5 |
| 排版 | [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| 图标 | [astro-icon](https://github.com/natemoo-re/astro-icon) + [Remix Icon](https://remixicon.com/) |
| 搜索 | [Pagefind](https://pagefind.app/) |
| CMS | [Decap CMS](https://decapcms.org/) |
| 代码质量 | [Biome](https://biomejs.dev/) (Linter + Formatter) |
| Git Hooks | [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) |
| CI | GitHub Actions |
| 包管理 | [pnpm](https://pnpm.io/) |
| 语言 | TypeScript (strict) |

## 项目结构

```text
/
├── public/
│   ├── admin/            # Decap CMS 配置
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── assets/           # 图片等静态资源
│   ├── components/       # Astro 组件
│   │   ├── ArticleCard       # 文章卡片
│   │   ├── MomentTimelineItem # 动态时间线条目
│   │   ├── MomentsFilter      # 动态归档筛选器
│   │   ├── Navbar / NavLinks  # 导航栏
│   │   ├── SearchBar          # 搜索栏
│   │   ├── ThemeToggle        # 主题切换
│   │   └── ...
│   ├── content/          # 内容集合 (Markdown)
│   │   ├── blog/             # 博客文章
│   │   └── moments/          # 动态
│   ├── layouts/          # 页面布局
│   │   ├── BaseLayout        # 全局基础布局
│   │   ├── BlogLayout        # 文章详情布局
│   │   └── MomentsIndexLayout # 动态列表布局
│   ├── pages/            # 路由页面
│   │   ├── index.astro       # 首页
│   │   ├── blog/             # 博客列表与详情
│   │   ├── moments/          # 动态列表 (按年/月归档)
│   │   ├── rss.xml.ts        # RSS Feed
│   │   └── robots.txt.ts     # robots.txt
│   ├── settings/         # 站点配置 (页脚社交链接等)
│   ├── styles/           # 全局样式
│   └── utils/            # 工具函数 (内容查询, Pagefind 封装)
├── consts.ts             # 全局常量 (站名、导航、时区等)
├── astro.config.mjs      # Astro 配置
├── biome.json            # Biome Linter/Formatter 配置
├── tsconfig.json         # TypeScript 配置 (路径别名)
└── package.json
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/0nikod/paperair.git
cd paperair

# 安装依赖
pnpm install

# 启动开发服务器 (默认 http://localhost:4321)
pnpm dev
```

## 常用命令

| 命令 | 说明 |
| :--- | :--- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 构建生产环境产物至 `./dist/` |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm check` | 运行 Astro 类型检查 + Biome 代码检查 |
| `pnpm check:astro` | 仅运行 Astro 类型检查 |
| `pnpm check:biome` | 仅运行 Biome 代码检查 |
| `pnpm sync-content` | 同步内容仓库（submodule）并生成 CMS 配置 |

## 自定义配置

### 站点信息

编辑根目录下的 `consts.ts` 来修改站点名称、描述、导航链接和默认时区。

### 页脚与社交链接

编辑 `src/settings/footer.ts` 来配置作者名称和社交媒体链接。

### CMS

Decap CMS 配置模板位于 `public/admin/config.template.yml`。每次 `dev` / `build` 前会由 `sync-content` 脚本自动生成 `public/admin/config.yml`，无需手动编辑。

当启用外部内容仓库时，CMS 的 `backend.repo` 会自动指向内容仓库；未启用时指向主仓库。

### 内容仓库拆分

项目支持将 `src/content` 拆分到独立 Git 仓库，通过 git submodule 可选引入。

编辑 `consts.ts` 中的 `CONTENT_REPO` 配置：

```ts
export const CONTENT_REPO = {
  enabled: true,
  url: "https://github.com/you/paperair-content.git",
  repo: "you/paperair-content",
  branch: "main",
};
```

| 字段 | 说明 |
| :--- | :--- |
| `enabled` | 是否启用外部内容仓库，默认 `false` |
| `url` | submodule 远端 URL |
| `repo` | Decap CMS 使用的 `owner/repo` 格式 |
| `branch` | 内容仓库分支名 |

**启用步骤**：

1. 在 Git 托管平台创建内容仓库，将 `blog/` 和 `moments/` 推送到仓库根目录
2. 在 `consts.ts` 中填入仓库信息并设置 `enabled: true`
3. 运行 `pnpm sync-content`，脚本会自动添加 submodule 并生成 CMS 配置

**不启用时**：`src/content` 作为普通目录保留在主仓库中，行为与拆分前完全一致。

## 部署

### GitHub Pages

1. 在 `consts.ts` 中设置 `SITE_URL` (例如 `https://<username>.github.io`)。
2. 在 `consts.ts` 中设置 `BASE_PATH`。部署到子路径需要设置 `BASE_PATH`，否则设为 `/`。
3. 在仓库 **Settings > Pages** 中，将 **Source** 设置为 **GitHub Actions**。
4. 推送代码到 `master` 分支。

现在部署应该会自动运行，可能要在 `Actions` 中启用。

### Cloudflare Pages

1. 在 `consts.ts` 中设置 `SITE_URL`。
2. 在 `consts.ts` 中设置 `BASE_PATH`。部署到子路径需要设置 `BASE_PATH`，否则设为 `/`。
3. 在仓库 **Settings > Secrets and variables > Actions** 中添加 `CLOUDFLARE_API_TOKEN` 机密（必需）。可能需要添加 `CLOUDFLARE_ACCOUNT_ID`。
4. 可以通过改变机密 `CLOUDFLARE_PROJECT_NAME` 来指定项目名称，或者让它自动从 `wrangler.toml` 中读取。
5. 推送代码到 `master` 分支。

现在部署应该会自动运行，可能要在 `Actions` 中启用。

## 许可证

[GPL-3.0](LICENSE)
