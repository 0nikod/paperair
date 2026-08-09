import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** ISO 日期字符串必须显式包含 UTC 标记或数字时区偏移。 */
const TIMEZONE_SUFFIX_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * 将 frontmatter 日期规范化为表示绝对时刻的 Date。
 *
 * CMS 使用 `picker_utc: false` 按编辑者浏览器本地时区显示和编辑，并通过
 * `YYYY-MM-DDTHH:mm:ssZ` 保存明确的时区偏移。YAML loader 可能已将该值解析为
 * Date，此时必须直接保留，不能再按站点 TIMEZONE 二次补偿。
 *
 * 字符串形式的无时区日期会被拒绝；若 YAML 已将无时区值解析为 Date，则无法再
 * 识别其来源，因此内容必须统一保存明确偏移。构建期 TIMEZONE 只用于归档、URL
 * 和静态 HTML fallback，不用于猜测内容时间。
 */
function parseAbsoluteDate(value: unknown): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.valueOf())) {
      throw new RangeError("日期值无效");
    }
    return value;
  }

  const source = String(value).trim();
  if (!TIMEZONE_SUFFIX_PATTERN.test(source)) {
    throw new RangeError(
      `日期必须包含时区，例如 2026-02-27T21:00:00+08:00：${source}`,
    );
  }

  const date = new Date(source);
  if (Number.isNaN(date.valueOf())) {
    throw new RangeError(`日期值无效：${source}`);
  }
  return date;
}

const dateField = z.union([z.string(), z.date()]).transform(parseAbsoluteDate);

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
