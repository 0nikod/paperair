import { getCollection } from "astro:content";

/**
 * 获取已发布的博客文章
 * @param limit 可选，截取前 N 篇
 */
export async function getPublishedPosts(limit?: number) {
  const posts = await getCollection("blog");
  const filtered = posts
    .filter(
      (post) => !post.data.draft && (import.meta.env.DEV || !post.data.test),
    ) // 过滤草稿和生产环境下的测试文章
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * 获取已发布的动态 (Moments)
 * @param limit 可选，截取前 N 条
 */
export async function getPublishedMoments(limit?: number) {
  const moments = await getCollection("moments");
  const filtered = moments
    .filter((moment) => import.meta.env.DEV || !moment.data.test) // 生产环境去除 test=true
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return limit ? filtered.slice(0, limit) : filtered;
}
