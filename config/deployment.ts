import { env, envFlag } from "./env";

/**
 * 规范化 Astro 的 base 路径。
 * 根路径保持为 `/`；其他路径会被整理为 `/paperair` 形式，不保留末尾斜杠。
 */
function normalizeBasePath(path: string): string {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

/**
 * 规范化站点绝对地址，并在地址本身没有路径时补充 basePath。
 * 已显式包含路径的 SITE_URL 会保持原样。
 */
function normalizeSiteUrl(site: string, basePath: string): string {
  const url = new URL(site);
  if (basePath !== "/" && (url.pathname === "/" || url.pathname === "")) {
    url.pathname = `${basePath}/`;
  }
  return url.href;
}

/**
 * Astro 的部署基础路径，对应 astro.config.mjs 中的 `base`。
 *
 * GitHub Pages 项目站点通常使用仓库名作为路径，例如 `/paperair`；
 * 用户站点、自定义域名或部署到域名根目录时应设置为 `/`。
 * 环境变量：BASE_PATH
 */
export const BASE_PATH = normalizeBasePath(env("BASE_PATH", "/paperair"));

/**
 * 站点公开访问地址，对应 astro.config.mjs 中的 `site`。
 * 用于生成 Sitemap、RSS、robots.txt 及其他绝对 URL。
 * 环境变量：SITE_URL
 */
export const SITE_URL = normalizeSiteUrl(
  env("SITE_URL", "https://0nikod.github.io"),
  BASE_PATH,
);

/**
 * Decap CMS 默认写入的 GitHub 仓库，格式为 `owner/repo`。
 * 启用外部内容仓库时，CMS 将改用 CONTENT_REPO.repo。
 *
 * 优先级：CMS_REPO > GITHUB_REPOSITORY > 项目默认值。
 */
export const SITE_REPO = env(
  "CMS_REPO",
  env("GITHUB_REPOSITORY", "0nikod/paperair"),
);

/**
 * Decap CMS 写入主站点仓库时使用的分支。
 * GitHub Actions 会将仓库默认分支传入 CMS_BRANCH；本地默认使用 master。
 */
export const SITE_BRANCH = env("CMS_BRANCH", "master");

/**
 * 外部内容仓库配置（Git submodule）。
 *
 * 未启用时使用主仓库中的 `src/content`，Decap CMS 写入 SITE_REPO。
 * 启用时，`src/content` 必须作为 Git submodule 注册，Decap CMS 写入这里
 * 配置的外部仓库和分支；生产构建使用主仓库锁定的 submodule commit。
 */
export const CONTENT_REPO = {
  /** 是否启用外部内容仓库。环境变量：CONTENT_REPO_ENABLED */
  enabled: envFlag("CONTENT_REPO_ENABLED", false),

  /** Git submodule 远端 URL。环境变量：CONTENT_REPO_URL */
  url: env("CONTENT_REPO_URL"),

  /** Decap CMS 使用的 `owner/repo` 仓库名称。环境变量：CONTENT_REPO_NAME */
  repo: env("CONTENT_REPO_NAME"),

  /** 外部内容仓库的目标分支。环境变量：CONTENT_REPO_BRANCH */
  branch: env("CONTENT_REPO_BRANCH", "main"),
};
