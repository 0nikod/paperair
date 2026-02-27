import { defineCollection, z } from "astro:content";
import { TIMEZONE } from "@consts";
import { glob } from "astro/loaders";

/**
 * 根据 IANA 时区名称获取 UTC 偏移字符串（如 "+08:00"）。
 * 在模块加载时计算一次，适用于无 DST 时区（如 Asia/Shanghai）。
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
 * 将 frontmatter 中的日期值解析为 Date。
 *
 * YAML 解析器（js-yaml）会将无时区的日期字符串当作 UTC 自动转为 Date，
 * 导致时间偏移。此函数将 UTC 各分量视为 TIMEZONE 本地时间重新解析，
 * 从而还原用户在 frontmatter 中填写的实际时间。
 *
 * 若传入的是字符串且已携带时区信息（Z 或 ±HH:MM），则原样解析。
 */
function parseDateWithTimezone(val: unknown): Date {
  if (val instanceof Date) {
    // YAML 解析器已将无时区日期按 UTC 解析为 Date。
    // 取出 UTC 分量并视为 TIMEZONE 本地时间重新构造。
    const iso = val.toISOString(); // "2026-02-26T11:45:14.000Z"
    return new Date(iso.replace("Z", TZ_OFFSET));
  }
  const str = String(val);
  if (/Z$|[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }
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
      /** 发布日期 */
      pubDate: dateField,
      /** 图片列表 */
      images: z.array(image()).optional(),
    }),
});

export const collections = { blog, moments };
