/** 网站名称，用于页面标题、导航栏和 RSS。 */
export const SITE_TITLE = "PaperAir";

/** 网站默认描述，用于页面元信息和 RSS。 */
export const SITE_DESCRIPTION = "Welcome!";

/**
 * 主导航链接。
 * href 使用站点内的根相对路径，渲染时由路径工具自动拼接部署基础路径。
 */
export const NAV_LINKS = [
  { href: "/", text: "首页" },
  { href: "/blog", text: "博客" },
  { href: "/moments", text: "动态" },
];

/**
 * 构建期内容解析、归档分组和静态 HTML 日期 fallback 使用的时区。
 * 浏览器端日期显示及 CMS 日期编辑仍使用各自浏览器的本地时区。
 */
export const TIMEZONE = "Asia/Shanghai";
