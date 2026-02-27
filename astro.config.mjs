// @ts-check

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { BASE_PATH, SITE_URL } from "./consts";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [icon(), pagefind(), sitemap()],

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Cascadia Code",
        cssVariable: "--font-cascadia-code",
      },
    ],
  },
});
