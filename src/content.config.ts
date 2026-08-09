import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * 将 frontmatter 日期交给 YAML/JavaScript 默认规则解析。
 *
 * - CMS 保存的带偏移日期会保留其绝对时刻；
 * - 未设置时区的日期不追加或猜测 TIMEZONE；
 * - TIMEZONE 仅用于构建期归档、URL 和静态 HTML fallback。
 */
const dateField = z.coerce.date();

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
