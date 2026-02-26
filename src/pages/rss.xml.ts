import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@consts";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? !data.draft && !data.test : true;
  });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
