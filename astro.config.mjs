// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

import icon from "astro-icon";
import pagefind from "astro-pagefind";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
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
