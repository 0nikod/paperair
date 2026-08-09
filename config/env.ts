/**
 * 读取并清理构建环境变量。
 *
 * 空字符串和仅包含空白字符的值会被视为未配置，并返回 fallback。
 * 这里读取的变量仅用于 Node.js/Astro 构建阶段，不会自动暴露到浏览器。
 */
export function env(name: string, fallback = ""): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

/**
 * 读取布尔环境变量。
 *
 * 支持的真值（忽略大小写）：1、true、yes、on；
 * 未配置时返回 fallback，其他非空值均视为 false。
 */
export function envFlag(name: string, fallback = false): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value);
}
