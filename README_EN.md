<div align="center">

<img src="https://github.com/user-attachments/assets/c111204d-2016-4343-92e4-83357cac4b19" width="96" height="96" alt="NotionNext Logo" />

# NotionNext

CamelliaV/NotionNext fork

This fork is based on upstream [notionnext-org/NotionNext](https://github.com/notionnext-org/NotionNext). It is currently maintained around the `endspace` theme, with a focus on the reading, navigation, and interaction experience of a personal blog.

<p>
  <a href="https://github.com/CamelliaV/NotionNext">Fork repository</a>
  ·
  <a href="https://github.com/notionnext-org/NotionNext">Upstream repository</a>
  ·
  <a href="https://preview.tangly1024.com/">Upstream theme preview</a>
  ·
  <a href="https://notionnext.tangly1024.com/">Upstream docs</a>
  ·
  <a href="https://github.com/notionnext-org/NotionNext/discussions">Upstream discussions</a>
</p>

<p>
  <a aria-label="GitHub commit activity" href="https://github.com/CamelliaV/NotionNext/commits/main" title="GitHub commit activity">
    <img src="https://img.shields.io/github/commit-activity/m/CamelliaV/NotionNext?style=for-the-badge"/>
  </a>
  <a aria-label="GitHub contributors" href="https://github.com/CamelliaV/NotionNext/graphs/contributors" title="GitHub contributors">
    <img src="https://img.shields.io/github/contributors/CamelliaV/NotionNext?color=orange&style=for-the-badge"/>
  </a>
  <a aria-label="Build status" href="#" title="Build status">
    <img src="https://img.shields.io/github/deployments/CamelliaV/NotionNext/Production?logo=Vercel&style=for-the-badge"/>
  </a>
  <a aria-label="Powered by Vercel" href="https://vercel.com?utm_source=Craigary&utm_campaign=oss" title="Powered by Vercel">
    <img src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg" height="28"/>
  </a>
</p>

[中文](./README.md) | English

</div>

---

## What Is NotionNext?

NotionNext is an open-source site system built with **Next.js + Notion API**. You keep managing posts, categories, tags, menus, and pages in Notion, while NotionNext publishes that content as an independent website.

It is useful for creators who want a long-term writing and publishing workflow: bloggers, indie developers, designers, photographers, course authors, open-source maintainers, and small teams building product sites or knowledge bases.

## What This Fork Changes

This fork keeps NotionNext's multi-theme foundation, but its current priority is a personal blog experience built around `endspace`.

- **`endspace` as the default theme**: local development uses `NEXT_PUBLIC_THEME=endspace` in `.env.local`.
- **Enhanced endspace post metadata**: post pages show reading time and word count; when only word count is available, reading time is estimated at 400 words per minute.
- **More direct navigation and search**: endspace has a standalone search entry plus refinements to post pages, top navigation, and mobile behavior.
- **Bottom-right floating controls**: dark mode toggle, TOC, Recent Logs, comment jump, and back-to-top are grouped in one compact control area.
- **Image loading experience**: image skeleton loading and endspace-specific Notion image handling make page loading feel steadier.
- **Music player adjustments**: the player keeps the blog atmosphere while fitting the current site behavior better.
- **Developer workflow improvements**: theme parsing and local cache cleanup reduce stale states when switching themes or debugging locally.

## Relationship With Upstream

- The upstream canonical repository is [notionnext-org/NotionNext](https://github.com/notionnext-org/NotionNext).
- This fork syncs upstream changes when needed, but it does not try to mirror every upstream commit immediately.
- Changes in this fork are biased toward a personal-site experience, especially the `endspace` theme, and may not all be suitable for upstream.
- For general installation, deployment, theme configuration, and community support, prefer the upstream documentation and discussions.

## Local Development

This repository requires Node `>=20 <25`. Node 20 from `.nvmrc` and Yarn 1 are recommended. If Yarn is not available, npm also works for local development.

```bash
# 1. Use Node 20
nvm use || nvm install

# 2. Recommended: install Yarn 1 and start locally
npm i -g yarn
yarn
yarn dev

# 3. If Yarn is not available, use npm
npm install
npm run dev
```

The local default theme comes from `.env.local`:

```bash
NEXT_PUBLIC_THEME=endspace
```

Common commands:

| Purpose | Yarn | npm |
| --- | --- | --- |
| Local development | `yarn dev` | `npm run dev` |
| Production build | `yarn build` | `npm run build` |
| Static export | `yarn export` | `npm run export` |
| Preview docs locally | `yarn docs:site:dev` | `npm run docs:site:dev` |
| Build docs site | `yarn docs:site:build` | `npm run docs:site:build` |

## Upstream Docs

| Content | Link |
| --- | --- |
| Docs site | [notionnext.tangly1024.com](https://notionnext.tangly1024.com) |
| Getting started | [Start here](https://notionnext.tangly1024.com/user-guide/start-here) |
| Theme catalog | [THEMES_CATALOG](https://notionnext.tangly1024.com/user-guide/themes/THEMES_CATALOG) |
| Source docs | [docs/](./docs/) |
| Discussions | [GitHub Discussions](https://github.com/notionnext-org/NotionNext/discussions) |

## Technologies

- **Framework**: [Next.js](https://nextjs.org)
- **Styles**: [Tailwind CSS](https://www.tailwindcss.cn/)
- **Rendering**: [react-notion-x](https://github.com/NotionX/react-notion-x)
- **Comments**: Twikoo, Giscus, Gitalk, Cusdis, Utterances
- **Deployment**: [Vercel](https://vercel.com)

## Acknowledgements

Thanks to Craig Hart for initiating the Nobelium project, and to the upstream NotionNext contributors for the foundation this fork builds on.

[![Contributors](https://contrib.rocks/image?repo=notionnext-org/NotionNext)](https://github.com/notionnext-org/NotionNext/graphs/contributors)

## License

The MIT License.
