import { resolvePath } from "@utils/path";

export interface SocialLink {
  ariaLabel: string;
  icon: string;
  url: string;
}

export interface FooterConfig {
  author: string;
  socialLinks: SocialLink[];
}

export const footerConfig: FooterConfig = {
  author: "PaperAir",
  socialLinks: [
    {
      ariaLabel: "Github Profile",
      icon: "ri:github-fill",
      url: "https://github.com",
    },
    {
      ariaLabel: "RSS Feed",
      icon: "ri:rss-fill",
      url: resolvePath("/rss.xml"),
    },
  ],
};
