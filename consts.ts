export const SITE_URL = "https://example.com";

export const SITE_TITLE = "PaperAir";
export const SITE_DESCRIPTION = "Welcome!";

export const NAV_LINKS = [
  { href: "/", text: "首页" },
  { href: "/blog", text: "博客" },
  { href: "/moments", text: "动态" },
];

export const TIMEZONE = "Asia/Shanghai"; // 默认的发布时区

/**
 * 外部内容仓库配置（git submodule）。
 * enabled 为 false 时使用本地 src/content，不做任何操作。
 */
export const CONTENT_REPO = {
  enabled: false,
  /** submodule 远端 URL，如 "https://github.com/you/paperair-content.git" */
  url: "",
  /** Decap CMS 使用的 owner/repo 格式，如 "you/paperair-content" */
  repo: "",
  /** 分支名 */
  branch: "main",
};
