/**
 * 路径解析工具函数
 * 将 BASE_URL 与给定的路径进行健壮的拼接，确保中间有且仅有一个斜杠。
 *
 * @param path 相对路径 (例如 "/blog", "about", "/")
 * @returns 完整的解析后路径 (例如 "/paperair/blog")
 */
export function resolvePath(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // 如果路径是根路径且 base 不为空，返回 base
  if (normalizedPath === "/" && base !== "") {
    return `${base}/`;
  }
  return `${base}${normalizedPath}`;
}
