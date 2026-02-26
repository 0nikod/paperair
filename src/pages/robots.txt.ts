import { SITE_URL } from "@consts";
import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: string) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL}`;

export const GET: APIRoute = () => {
  const sitemapURL = new URL("sitemap-index.xml", SITE_URL).href;
  return new Response(getRobotsTxt(sitemapURL));
};
