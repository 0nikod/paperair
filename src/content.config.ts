import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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
