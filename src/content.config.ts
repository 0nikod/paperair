import { defineCollection, z } from "astro:content";
import { TIMEZONE } from "@consts";
import { glob } from "astro/loaders";

/**
 * 在模块加载时计算一次 TIMEZONE 对应的 UTC 偏移字符串（如 "+08:00"）。
 * 适用于无 DST 时区（如 Asia/Shanghai）。
 */
function getTimezoneOffset(timezone: string): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  }).format(new Date());
  const match = formatted.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
  if (!match?.[1]) return "+00:00";
  const raw = match[1];
  const colonIdx = raw.indexOf(":");
  const h = colonIdx >= 0 ? raw.slice(0, colonIdx) : raw;
  const m = colonIdx >= 0 ? raw.slice(colonIdx + 1) : "00";
  const sign = h.startsWith("-") ? "-" : "+";
  return `${sign}${Math.abs(Number(h)).toString().padStart(2, "0")}:${m.padStart(2, "0")}`;
}

const TZ_OFFSET = getTimezoneOffset(TIMEZONE);

/**
 * 将 frontmatter 中的日期值安全解析为 Date。
 *
 * 正常路径（CMS 写入，含时区）：
 *   字符串 "2026-02-27T21:00:00+08:00" → 直接 new Date()，精确。
 *
 * 兜底路径（手写 frontmatter，无时区）：
 *   js-yaml 会将 "2026-02-27T21:00:00" 按 UTC 解析为 Date 对象（提前 8 小时）。
 *   此函数取出其 UTC 分量，重新拼接 TZ_OFFSET 来还原意图中的本地时间。
 */
function parseDateWithTimezone(val: unknown): Date {
  if (val instanceof Date) {
    // js-yaml 将无时区字符串按 UTC 自动解析成了 Date，在此纠正。
    const iso = val.toISOString(); // "2026-02-27T13:00:00.000Z"（错误）
    return new Date(iso.replace("Z", TZ_OFFSET)); // 还原为本地时间
  }
  const str = String(val);
  // 已携带时区信息（CMS 标准输出）：直接解析。
  if (/Z$|[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }
  // 纯字符串无时区：拼接默认时区。
  return new Date(`${str}${TZ_OFFSET}`);
}

const dateField = z
  .union([z.string(), z.date()])
  .transform(parseDateWithTimezone);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      /** 文章标题 */
      title: z.string(),
      /** 文章描述 */
      description: z.string().optional(),
      /** 发布日期 */
      pubDate: dateField,
      /** 更新日期 */
      updatedDate: dateField.optional(),
      /** 标签列表 */
      tags: z.array(z.string()).default([]),
      /** 封面图 */
      heroImage: image().optional(),
      /** 文章分类 */
      category: z.string().optional(),
      /** 作者名称 */
      author: z.string().optional(),
    }),
});

const moments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/moments" }),
  schema: ({ image }) =>
    z.object({
      /** 标题 */
      title: z.string(),
      /** 发布日期 */
      pubDate: dateField,
      /** 图片列表 */
      images: z.array(image()).optional(),
    }),
});

export const collections = { blog, moments };
