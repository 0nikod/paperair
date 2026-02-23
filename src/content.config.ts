import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      /** 文章标题 */
      title: z.string(),
      /** 文章描述 */
      description: z.string().optional(),
      /** 发布日期 */
      pubDate: z.coerce.date(),
      /** 更新日期 */
      updatedDate: z.coerce.date().optional(),
      /** 标签列表 */
      tags: z.array(z.string()).default([]),
      /** 是否为草稿，设为 true 则在生产环境隐藏 */
      draft: z.boolean().default(false),
      /** 封面图 */
      heroImage: image().optional(),
      /** 文章分类 */
      category: z.string().optional(),
      /** 作者名称 */
      author: z.string().optional(),
      /** 是否为测试文章，设为 true 则在生产环境隐藏 */
      test: z.boolean().default(false),
    }),
});

const moments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/moments" }),
  schema: z.object({
    /** 发布日期 */
    pubDate: z.coerce.date(),
    /** 图片列表 */
    images: z.array(z.string()).optional(),
    /** 是否为测试动态，设为 true 则在生产环境隐藏 */
    test: z.boolean().default(false),
  }),
});

export const collections = { blog, moments };
