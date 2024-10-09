import { OGImageRoute } from "astro-og-canvas";

const pages = await import.meta.glob("/src/pages/**/*.md", { eager: true });
console.log(pages);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_path, page) => ({
    title: page.frontmatter.title || "Default Title",
    description: page.frontmatter.subtitle || "Default Subtitle",
    dir: page.dir,
    logo: { path: "./src/amoses.png", size: [50] },
    border: { color: [240, 231, 216], width: 20, side: "inline-start" },
    bgGradient: [[27, 25, 25]],
    padding: 60,
    font: {
      title: {
        size: 78,
        families: ["Charter"],
        weight: "Bold",
        color: [240, 231, 216],
      },
      description: {
        size: 45,
        lineHeight: 1.25,
        families: ["Charter"],
        weight: "Normal",
        color: [240, 231, 216],
      },
    },
    fonts: [
      "https://cdn.jsdelivr.net/npm/charter-webfont@4/fonts/charter_regular.woff2",
      "https://cdn.jsdelivr.net/npm/charter-webfont@4/fonts/charter_bold.woff2",
      "https://cdn.jsdelivr.net/npm/charter-webfont@4/fonts/charter_italic.woff2",
      "https://cdn.jsdelivr.net/npm/charter-webfont@4/fonts/charter_bold_italic.woff2",
    ],
  }),
});
