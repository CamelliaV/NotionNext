/* eslint-disable react/no-unknown-property */
import { siteConfig } from '@/lib/config'
import CONFIG from './config'

/**
 * 这里的css样式只对当前主题生效
 * 主题客制化css
 * @returns
 */
const Style = () => {
  // 从配置中获取主题色，如果没有配置则使用默认值 #928CEE
  const themeColor = siteConfig('HEXO_THEME_COLOR', '#928CEE', CONFIG)

  return (
    <style jsx global>{`
      :root {
        --theme-color: ${themeColor};
      }

      // 底色
      #theme-hexo body {
        background-color: #f5f5f5;
      }
      .dark #theme-hexo body {
        background-color: black;
      }

      /*  菜单下划线动画 */
      #theme-hexo .menu-link {
        text-decoration: none;
        background-image: linear-gradient(
          var(--theme-color),
          var(--theme-color)
        );
        background-repeat: no-repeat;
        background-position: bottom center;
        background-size: 0 2px;
        transition: background-size 100ms ease-in-out;
      }

      #theme-hexo .menu-link:hover {
        background-size: 100% 2px;
        color: var(--theme-color);
      }

      /* 文章列表中标题行悬浮时的文字颜色 */
      #theme-hexo h2:hover .menu-link {
        color: var(--theme-color) !important;
      }
      .dark #theme-hexo h2:hover .menu-link {
        color: var(--theme-color) !important;
      }

      /* 下拉菜单悬浮背景色 */
      #theme-hexo li[class*='hover:bg-indigo-500']:hover {
        background-color: var(--theme-color) !important;
      }

      /* tag标签悬浮背景色 */
      #theme-hexo a[class*='hover:bg-indigo-400']:hover {
        background-color: var(--theme-color) !important;
      }

      /* 社交按钮悬浮颜色 */
      #theme-hexo i[class*='hover:text-indigo-600']:hover {
        color: var(--theme-color) !important;
      }
      .dark #theme-hexo i[class*='dark:hover:text-indigo-400']:hover {
        color: var(--theme-color) !important;
      }

      /* MenuGroup 悬浮颜色 */
      #theme-hexo #nav div[class*='hover:text-indigo-600']:hover {
        color: var(--theme-color) !important;
      }
      .dark #theme-hexo #nav div[class*='dark:hover:text-indigo-400']:hover {
        color: var(--theme-color) !important;
      }

      /* 最新发布文章悬浮颜色 */
      #theme-hexo div[class*='hover:text-indigo-600']:hover,
      #theme-hexo div[class*='hover:text-indigo-400']:hover {
        color: var(--theme-color) !important;
      }

      /* 分页组件颜色 */
      #theme-hexo .text-indigo-400 {
        color: var(--theme-color) !important;
      }
      #theme-hexo .border-indigo-400 {
        border-color: var(--theme-color) !important;
      }
      #theme-hexo a[class*='hover:bg-indigo-400']:hover {
        background-color: var(--theme-color) !important;
        color: white !important;
      }
      /* 移动设备下，搜索组件中选中分类的高亮背景色 */
      #theme-hexo div[class*='hover:bg-indigo-400']:hover {
        background-color: var(--theme-color) !important;
      }
      #theme-hexo .hover\:bg-indigo-400:hover {
        background-color: var(--theme-color) !important;
      }
      #theme-hexo .bg-indigo-400 {
        background-color: var(--theme-color) !important;
      }
      #theme-hexo a[class*='hover:bg-indigo-600']:hover {
        background-color: var(--theme-color) !important;
        color: white !important;
      }

      /* 右下角悬浮按钮背景色 */
      #theme-hexo .bg-indigo-500 {
        background-color: var(--theme-color) !important;
      }
      .dark #theme-hexo .dark\:bg-indigo-500 {
        background-color: var(--theme-color) !important;
      }

      // 移动设备菜单栏选中背景色
      #theme-hexo div[class*='hover:bg-indigo-500']:hover {
        background-color: var(--theme-color) !important;
      }

      /* 文章浏览进度条颜色 */
      #theme-hexo .bg-indigo-600 {
        background-color: var(--theme-color) !important;
      }
      /* 当前浏览位置标题高亮颜色 */
      #theme-hexo .border-indigo-800 {
        border-color: var(--theme-color) !important;
      }
      #theme-hexo .text-indigo-800 {
        color: var(--theme-color) !important;
      }
      .dark #theme-hexo .dark\:text-indigo-400 {
        color: var(--theme-color) !important;
      }
      .dark #theme-hexo .dark\:border-indigo-400 {
        border-color: var(--theme-color) !important;
      }
      .dark #theme-hexo .dark\:border-white {
        border-color: var(--theme-color) !important;
      }
      /* 目录项悬浮时的字体颜色 */
      #theme-hexo a[class*='hover:text-indigo-800']:hover {
        color: var(--theme-color) !important;
      }
      /* 深色模式下目录项的默认文字颜色和边框线颜色 */
      .dark #theme-hexo .catalog-item {
        color: white !important;
        border-color: white !important;
      }
      .dark #theme-hexo .catalog-item:hover {
        color: var(--theme-color) !important;
      }
      /* 深色模式下当前高亮标题的边框线颜色 */
      .dark #theme-hexo .catalog-item.font-bold {
        border-color: var(--theme-color) !important;
      }

      /* 文章底部版权声明组件左侧边框线颜色 */
      #theme-hexo .border-indigo-500 {
        border-color: var(--theme-color) !important;
      }

      /* 归档页面文章列表项悬浮时左侧边框线颜色 */
      #theme-hexo li[class*='hover:border-indigo-500']:hover {
        border-color: var(--theme-color) !important;
      }

      /* 自定义右键菜单悬浮高亮颜色 */
      #theme-hexo .hover\:bg-blue-600:hover {
        background-color: var(--theme-color) !important;
      }
      .dark #theme-hexo li[class*='dark:hover:border-indigo-300']:hover {
        border-color: var(--theme-color) !important;
      }
      /* 深色模式下，归档页面文章列表项默认状态左侧边框线颜色 */
      .dark #theme-hexo li[class*='dark:border-indigo-400'] {
        border-color: var(--theme-color) !important;
      }
      /* 深色模式下，归档页面文章标题悬浮时的文字颜色 */
      .dark #theme-hexo a[class*='dark:hover:text-indigo-300']:hover {
        color: var(--theme-color) !important;
      }

      /* 设置了从上到下的渐变黑色 */
      #theme-hexo .header-cover::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.5) 0%,
          rgba(0, 0, 0, 0.2) 10%,
          rgba(0, 0, 0, 0) 25%,
          rgba(0, 0, 0, 0.2) 75%,
          rgba(0, 0, 0, 0.5) 100%
        );
      }

      #theme-hexo .hexo-hero-shell {
        --hero-dx: 0;
        --hero-dy: 0;
        --hero-scroll: 0;
        --hero-intensity: 1;
        perspective: 1200px;
        isolation: isolate;
        contain: layout paint style;
      }

      #theme-hexo .hexo-hero-shell[data-hero-intensity='compact'] {
        --hero-intensity: 1.1;
      }

      #theme-hexo .hexo-hero-shell[data-hero-intensity='ultra'] {
        --hero-intensity: 1.2;
      }

      #theme-hexo .hexo-hero-cover {
        position: absolute;
        inset: 0;
        transform:
          scale(calc(1.06 + (var(--hero-intensity) - 1) * 0.04 - var(--hero-scroll) * 0.05))
          translate3d(
            calc(var(--hero-dx) * -16px * var(--hero-intensity)),
            calc(var(--hero-dy) * -14px * var(--hero-intensity) + var(--hero-scroll) * 16px),
            0
          );
        filter: brightness(0.52) saturate(1.06) contrast(1.03);
        transition: transform 90ms linear;
        will-change: transform;
        backface-visibility: hidden;
      }

      #theme-hexo .hexo-hero-cover.fixed {
        position: fixed;
      }

      #theme-hexo .hexo-hero-scrim {
        background:
          linear-gradient(
            180deg,
            rgba(4, 5, 10, 0.32) 0%,
            rgba(3, 4, 8, 0.16) 22%,
            rgba(2, 3, 8, 0.52) 72%,
            rgba(1, 2, 6, 0.82) 100%
          );
        z-index: 1;
      }

      #theme-hexo .hexo-hero-grid {
        z-index: 2;
        opacity: 0.12;
        background-image:
          linear-gradient(
            rgba(255, 255, 255, 0.08) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.08) 1px,
            transparent 1px
          );
        background-size: 72px 72px;
        mask-image: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.7),
          rgba(0, 0, 0, 0.08) 65%,
          transparent
        );
        transform:
          perspective(900px)
          rotateX(74deg)
          translate3d(
            calc(var(--hero-dx) * -8px),
            calc(10% + var(--hero-scroll) * 12px),
            0
          );
        transform-origin: center top;
        transition: transform 90ms linear;
        will-change: transform;
      }

      #theme-hexo .hexo-hero-aurora {
        z-index: 2;
        opacity: 0.42;
        background:
          radial-gradient(
            circle at 50% 40%,
            color-mix(in srgb, var(--theme-color) 40%, transparent) 0%,
            transparent 56%
          ),
          radial-gradient(
            circle at 22% 22%,
            rgba(255, 255, 255, 0.12) 0%,
            transparent 24%
          ),
          radial-gradient(
            circle at 74% 28%,
            rgba(115, 231, 255, 0.14) 0%,
            transparent 18%
          );
        transform: translate3d(
          calc(var(--hero-dx) * -18px * var(--hero-intensity)),
          calc(var(--hero-dy) * -14px * var(--hero-intensity)),
          0
        ) scale(1.02);
        transition: transform 90ms linear;
        will-change: transform;
      }

      #theme-hexo .hexo-hero-vignette {
        z-index: 3;
        background:
          radial-gradient(
            circle at center,
            transparent 34%,
            rgba(0, 0, 0, 0.16) 64%,
            rgba(0, 0, 0, 0.64) 100%
          );
      }

      #theme-hexo .hexo-hero-content {
        z-index: 4;
        padding: 6.5rem 1.5rem 7rem;
      }

      #theme-hexo .hexo-hero-copy {
        position: relative;
        width: min(90vw, 960px);
        margin: 0 auto;
        padding: 2rem 0 1.2rem;
      }

      #theme-hexo .hexo-hero-copy::before {
        content: '';
        position: absolute;
        pointer-events: none;
        z-index: -1;
        top: 56%;
        left: 50%;
        width: min(86vw, 760px);
        height: 1px;
        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.12) 22%,
            color-mix(in srgb, var(--theme-color) 48%, transparent) 50%,
            rgba(255, 255, 255, 0.12) 78%,
            transparent
          );
        transform:
          translateX(-50%)
          translate3d(
            calc(var(--hero-dx) * 12px),
            calc(var(--hero-dy) * 8px),
            0
          );
        transition: transform 90ms linear;
        will-change: transform;
      }

      #theme-hexo .pretext-hero-block {
        width: 100%;
      }

      #theme-hexo .hexo-hero-repel {
        --repel-x: 0px;
        --repel-y: 0px;
        --repel-scale: 1;
        --button-cut: 0px;
        --button-shear: 0px;
        --button-ridge: 0;
      }

      #theme-hexo .pretext-hero-line {
        display: block;
        position: relative;
        white-space: pre-wrap;
      }

      #theme-hexo .pretext-hero-line-inner {
        display: inline-block;
        position: relative;
      }

      #theme-hexo .pretext-hero-space {
        white-space: pre;
      }

      #theme-hexo .hexo-hero-title {
        max-width: min(92vw, 1040px);
        margin: 0 auto;
      }

      #theme-hexo .hexo-hero-title .pretext-hero-line {
        font-size: clamp(4rem, calc(10vw * var(--hero-intensity)), 8.6rem);
        font-weight: 900;
        line-height: 0.84;
        letter-spacing: -0.09em;
        padding: 0 0.025em;
        margin-left: calc((var(--line-index) - 1) * 0.12em);
        text-shadow: 0 10px 24px rgba(0, 0, 0, 0.34);
        -webkit-text-stroke: 1px rgba(255, 255, 255, 0.06);
        transform:
          translate3d(
            calc(var(--hero-dx) * 14px * var(--line-depth) * var(--hero-intensity) + var(--repel-x)),
            calc((var(--line-index) - 1) * -0.12em + var(--hero-dy) * 12px * var(--line-depth) + var(--hero-scroll) * 12px + var(--repel-y)),
            0
          )
          scale(var(--repel-scale));
        transition: transform 90ms linear;
        animation: hexoHeroLineIn 540ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        animation-delay: calc(var(--line-index) * 90ms);
        will-change: transform;
      }

      #theme-hexo .hexo-hero-title .pretext-hero-line::before {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        color: color-mix(in srgb, var(--theme-color) 58%, white);
        opacity: 0.18;
        transform: translate3d(
          calc(-0.06em - var(--hero-dx) * 10px * var(--line-depth)),
          calc(0.09em - var(--hero-dy) * 8px * var(--line-depth)),
          0
        );
      }

      #theme-hexo .hexo-hero-title .pretext-hero-token {
        display: inline-block;
        white-space: pre;
        transform: translate3d(
          calc(var(--token-rest-x) + var(--hero-dx) * (10px + var(--token-depth) * 10px) + var(--repel-x)),
          calc(var(--token-rest-y) + var(--hero-dy) * (7px + var(--token-depth) * 8px) + var(--repel-y)),
          0
        ) rotate(var(--token-tilt, 0deg)) scale(var(--repel-scale));
        transform-origin: center 72%;
        transition: transform 90ms linear;
        will-change: transform;
        backface-visibility: hidden;
      }

      #theme-hexo .hexo-hero-title[data-density='compact'] {
        max-width: min(84vw, 860px);
      }

      #theme-hexo .hexo-hero-title[data-density='compact'] .pretext-hero-line {
        font-size: clamp(4.8rem, 12vw, 10rem);
      }

      #theme-hexo .hexo-hero-title[data-density='ultra'] {
        max-width: min(82vw, 780px);
      }

      #theme-hexo .hexo-hero-title[data-density='ultra'] .pretext-hero-line {
        font-size: clamp(5.5rem, 14vw, 11rem);
        letter-spacing: -0.115em;
        line-height: 0.78;
      }

      #theme-hexo .hexo-hero-greeting {
        max-width: min(76vw, 760px);
        margin: 1.3rem auto 0;
      }

      #theme-hexo .hexo-hero-greeting .pretext-hero-line {
        display: block;
        align-items: center;
        justify-content: center;
        width: fit-content;
        max-width: 100%;
        margin: 0 auto;
        padding: 0;
        font-size: clamp(1.05rem, 2.6vw, 1.7rem);
        font-weight: 650;
        line-height: 1.18;
        letter-spacing: -0.01em;
        color: rgba(255, 255, 255, 0.92);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        transform:
          translate3d(
            calc(var(--hero-dx) * 8px * var(--line-depth) + var(--repel-x)),
            calc(var(--hero-dy) * 6px * var(--line-depth) + var(--hero-scroll) * 6px + var(--repel-y)),
            0
          )
          scale(var(--repel-scale));
        transition: transform 90ms linear;
        animation: hexoHeroGreetingIn 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        animation-delay: calc(var(--line-index) * 70ms);
        will-change: transform;
      }

      #theme-hexo .hexo-hero-greeting .pretext-hero-line-inner {
        display: inline-block;
        max-width: 100%;
      }

      #theme-hexo .hexo-hero-greeting .pretext-hero-token {
        display: inline-block;
        white-space: pre;
        padding: 0 0.015em;
        transform: translate3d(
          calc(var(--token-rest-x) + var(--hero-dx) * (5px + var(--token-depth) * 6px) + var(--repel-x)),
          calc(var(--token-rest-y) + var(--hero-dy) * (3px + var(--token-depth) * 4px) + var(--repel-y)),
          0
        ) rotate(var(--token-tilt, 0deg)) scale(var(--repel-scale));
        transform-origin: center 72%;
        transition: transform 90ms linear;
        will-change: transform;
        backface-visibility: hidden;
      }

      #theme-hexo .hexo-hero-scroll {
        letter-spacing: 0.08em;
        transform: translateY(calc(var(--hero-scroll) * 10px));
        transition: transform 90ms linear;
      }

      #theme-hexo #home-nav-button {
        max-width: min(92vw, 920px);
        margin-top: 2rem;
      }

      #theme-hexo #home-nav-button a {
        position: relative;
        overflow: hidden;
        border-color: rgba(255, 255, 255, 0.32);
        background: rgba(10, 12, 22, 0.24);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
        transform: translate3d(var(--repel-x), var(--repel-y), 0) scale(var(--repel-scale));
        transition:
          transform 90ms linear,
          box-shadow 140ms ease,
          background-color 140ms ease,
          color 140ms ease;
        will-change: transform;
      }

      #theme-hexo #home-nav-button a:hover {
        box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
      }

      #theme-hexo .hexo-hero-button::after {
        content: '';
        position: absolute;
        top: 18%;
        bottom: 18%;
        left: 50%;
        width: 1px;
        pointer-events: none;
        background: linear-gradient(
          180deg,
          transparent,
          rgba(255, 255, 255, 0.9),
          transparent
        );
        opacity: var(--button-ridge);
        transform:
          translateX(-50%)
          scaleY(calc(0.6 + var(--button-ridge) * 0.9));
        transition:
          opacity 90ms linear,
          transform 90ms linear;
      }

      #theme-hexo .hexo-hero-button-text {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      #theme-hexo .hexo-hero-button-fallback {
        opacity: 0;
      }

      #theme-hexo .hexo-hero-button-split {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        transition: transform 90ms linear;
        will-change: transform;
      }

      #theme-hexo .hexo-hero-button-split-left {
        clip-path: inset(0 50% 0 0);
        transform: translate3d(
          calc(var(--button-cut) * -1 + var(--button-shear) * -1),
          0,
          0
        );
      }

      #theme-hexo .hexo-hero-button-split-right {
        clip-path: inset(0 0 0 50%);
        transform: translate3d(
          calc(var(--button-cut) + var(--button-shear)),
          0,
          0
        );
      }

      #theme-hexo .hexo-sortable-list {
        position: relative;
      }

      #theme-hexo
        .hexo-sortable-list[data-dragging='true']
        .hexo-sortable-slot[data-drag-state='idle']
        .hexo-sortable-card-shell {
        opacity: 0.84;
      }

      #theme-hexo
        .hexo-sortable-list[data-dragging='true']
        .hexo-sortable-slot[data-drag-state='idle']
        #blog-post-card {
        transform: scale(0.992);
        box-shadow:
          0 10px 22px rgba(15, 23, 42, 0.07),
          0 2px 8px rgba(15, 23, 42, 0.05);
      }

      #theme-hexo .hexo-sortable-slot {
        --sortable-flip-x: 0px;
        --sortable-flip-y: 0px;
        --sortable-preview-y: 0px;
        --sortable-placeholder-shift-y: 0px;
        position: relative;
        isolation: isolate;
        transform: translate3d(
          var(--sortable-flip-x),
          calc(var(--sortable-flip-y) + var(--sortable-preview-y)),
          0
        );
        transition: transform 165ms cubic-bezier(0.2, 0.82, 0.24, 1);
        will-change: transform;
      }

      #theme-hexo .hexo-sortable-slot::before {
        content: '';
        position: absolute;
        inset: 10px 8px;
        border-radius: 1.2rem;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.58),
            rgba(248, 250, 252, 0.34)
          );
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.42),
          inset 0 14px 28px rgba(255, 255, 255, 0.12);
        opacity: 0;
        transform:
          translate3d(0, var(--sortable-placeholder-shift-y), 0)
          scale(0.988);
        transition:
          opacity 120ms ease,
          transform 165ms cubic-bezier(0.2, 0.82, 0.24, 1),
          border-color 140ms ease;
        pointer-events: none;
      }

      #theme-hexo .hexo-sortable-card-shell {
        --sortable-drag-x: 0px;
        --sortable-drag-y: 0px;
        --sortable-tilt: 0deg;
        --sortable-scale: 1;
        --sortable-cut: 0px;
        --sortable-shear: 0px;
        --sortable-ridge: 0;
        position: relative;
        z-index: 1;
        transform:
          translate3d(var(--sortable-drag-x), var(--sortable-drag-y), 0)
          rotate(var(--sortable-tilt))
          scale(var(--sortable-scale));
        transform-origin: 50% 14%;
        transition:
          transform 260ms cubic-bezier(0.2, 0.82, 0.24, 1),
          opacity 180ms ease,
          filter 260ms ease,
          box-shadow 260ms ease;
        will-change: transform;
      }

      #theme-hexo .hexo-sortable-card-shell #blog-post-card {
        transition:
          transform 180ms ease,
          box-shadow 180ms ease,
          border-color 180ms ease,
          opacity 180ms ease;
      }

      #theme-hexo .hexo-sortable-card-shell::before {
        content: '';
        position: absolute;
        inset: 14px 18px;
        border-radius: 1.35rem;
        background:
          radial-gradient(
            circle at 50% 28%,
            color-mix(in srgb, var(--theme-color) 26%, rgba(255, 255, 255, 0.55))
              0%,
            transparent 70%
          );
        opacity: 0;
        filter: blur(18px);
        transition: opacity 180ms ease;
        pointer-events: none;
        z-index: -1;
      }

      #theme-hexo .hexo-sortable-seam {
        position: absolute;
        inset: 0;
        z-index: 3;
        border-radius: 1.35rem;
        overflow: hidden;
        pointer-events: none;
        opacity: 0;
        transition: opacity 220ms ease;
      }

      #theme-hexo .hexo-sortable-seam-half {
        position: absolute;
        inset: 0;
        opacity: 0.32;
        transition: transform 260ms cubic-bezier(0.2, 0.82, 0.24, 1);
        will-change: transform;
      }

      #theme-hexo .hexo-sortable-seam-half-left {
        clip-path: inset(0 50% 0 0 round 1.35rem);
        background:
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.14),
            rgba(255, 255, 255, 0.03)
          );
        transform: translate3d(
          calc(var(--sortable-cut) * -1 + var(--sortable-shear) * -1),
          0,
          0
        );
      }

      #theme-hexo .hexo-sortable-seam-half-right {
        clip-path: inset(0 0 0 50% round 1.35rem);
        background:
          linear-gradient(
            270deg,
            rgba(255, 255, 255, 0.14),
            rgba(255, 255, 255, 0.03)
          );
        transform: translate3d(
          calc(var(--sortable-cut) + var(--sortable-shear)),
          0,
          0
        );
      }

      #theme-hexo .hexo-sortable-seam-ridge {
        position: absolute;
        top: 11%;
        bottom: 11%;
        left: 50%;
        width: 2px;
        transform:
          translateX(-50%)
          scaleY(calc(0.72 + var(--sortable-ridge) * 0.58));
        transform-origin: center;
        opacity: var(--sortable-ridge);
        background:
          linear-gradient(
            180deg,
            transparent,
            rgba(255, 255, 255, 0.88),
            transparent
          );
        box-shadow:
          0 0 28px color-mix(in srgb, var(--theme-color) 36%, transparent),
          0 0 12px rgba(255, 255, 255, 0.58);
        transition:
          opacity 220ms ease,
          transform 260ms cubic-bezier(0.2, 0.82, 0.24, 1);
      }

      #theme-hexo .hexo-sortable-slot[data-drag-state='dragging'] {
        z-index: 16;
        transform: none;
        transition: none;
      }

      #theme-hexo .hexo-sortable-slot[data-drag-state='dragging']::before {
        opacity: 0.82;
        transform:
          translate3d(0, var(--sortable-placeholder-shift-y), 0)
          scale(1);
        border-color: color-mix(
          in srgb,
          var(--theme-color) 28%,
          rgba(148, 163, 184, 0.16)
        );
      }

      #theme-hexo
        .hexo-sortable-floating-shell {
        --sortable-card-radius: 0.75rem;
        --sortable-neon-alpha: 0.9;
        filter: saturate(1.03) contrast(1.01);
      }

      #theme-hexo
        .hexo-sortable-floating-shell::before {
        transform-origin: center;
        inset: 10px 14px;
        opacity: 0.82;
        animation: hexoSortableFloatAura 1.45s ease-in-out infinite alternate;
      }

      #theme-hexo
        .hexo-sortable-floating-card-base {
        position: relative;
        transform: scale(1.004);
        isolation: isolate;
        border-radius: var(--sortable-card-radius);
      }

      #theme-hexo
        .hexo-sortable-floating-ring {
        position: absolute;
        inset: -4px;
        width: calc(100% + 8px);
        height: calc(100% + 8px);
        overflow: visible;
        pointer-events: none;
        z-index: 4;
      }

      #theme-hexo
        .hexo-sortable-floating-ring-rail {
        fill: none;
        stroke: color-mix(
          in srgb,
          var(--theme-color) 26%,
          rgba(255, 255, 255, 0.22)
        );
        stroke-width: 1.2;
        opacity: 0.42;
      }

      #theme-hexo
        .hexo-sortable-floating-ring-glow {
        fill: none;
        stroke: color-mix(
          in srgb,
          var(--theme-color) 82%,
          rgba(255, 255, 255, 0.94)
        );
        stroke-width: 5.4;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 18 82;
        stroke-dashoffset: 0;
        opacity: 0.34;
        filter: blur(6px);
        animation: hexoSortableNeonTrace 2.1s linear infinite;
      }

      #theme-hexo
        .hexo-sortable-floating-ring-trace {
        fill: none;
        stroke: rgba(255, 255, 255, 0.98);
        stroke-width: 2.3;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 11 89;
        stroke-dashoffset: 0;
        opacity: var(--sortable-neon-alpha);
        filter:
          drop-shadow(
            0 0 6px
              color-mix(in srgb, var(--theme-color) 62%, rgba(255, 255, 255, 0.92))
          )
          drop-shadow(
            0 0 16px
              color-mix(in srgb, var(--theme-color) 48%, rgba(255, 255, 255, 0.62))
          );
        animation: hexoSortableNeonTrace 2.1s linear infinite,
          hexoSortableNeonPulse 1.6s ease-in-out infinite alternate;
      }

      #theme-hexo
        .hexo-sortable-floating-card-surface {
        position: relative;
        z-index: 2;
        border-radius: var(--sortable-card-radius);
      }

      #theme-hexo
        .hexo-sortable-floating-card-base
        #blog-post-card {
        position: relative;
        z-index: 2;
        transform: scale(1.008);
        border-radius: var(--sortable-card-radius);
        border-color: color-mix(
          in srgb,
          var(--theme-color) 24%,
          rgba(255, 255, 255, 0.18)
        );
        background-image:
          linear-gradient(
            180deg,
            color-mix(in srgb, var(--theme-color) 6%, rgba(255, 255, 255, 0.1)),
            transparent 22%
          );
        overflow: hidden;
        box-shadow:
          0 22px 52px rgba(15, 23, 42, 0.18),
          0 10px 24px color-mix(in srgb, var(--theme-color) 18%, transparent);
        animation: hexoSortableFloatShadow 1.7s ease-in-out infinite alternate;
      }

      #theme-hexo .hexo-sortable-floating-shell {
        position: fixed;
        z-index: 34;
        transition: filter 180ms ease, opacity 180ms ease;
        pointer-events: none;
      }

      #theme-hexo .hexo-sortable-handle-text {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.75rem;
      }

      #theme-hexo .hexo-sortable-handle-fallback {
        opacity: 0;
      }

      #theme-hexo .hexo-sortable-handle-split {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
      }

      #theme-hexo .hexo-sortable-handle-split-left {
        clip-path: inset(0 50% 0 0);
      }

      #theme-hexo .hexo-sortable-handle-split-right {
        clip-path: inset(0 0 0 50%);
      }

      @media (pointer: coarse) {
        #theme-hexo .hexo-sortable-handle {
          opacity: 1 !important;
        }
      }

      #theme-hexo
        .hexo-sortable-slot[data-drag-state='dragging']
        .hexo-sortable-handle-split-left {
        transform: translate3d(-4px, 0, 0);
      }

      #theme-hexo
        .hexo-sortable-slot[data-drag-state='dragging']
        .hexo-sortable-handle-split-right {
        transform: translate3d(4px, 0, 0);
      }

      @keyframes hexoSortableFloatAura {
        from {
          opacity: 0.78;
          transform: scale(0.94);
          filter: blur(18px);
        }

        to {
          opacity: 1;
          transform: scale(1.07);
          filter: blur(24px);
        }
      }

      @keyframes hexoSortableFloatShadow {
        from {
          box-shadow:
            0 18px 38px rgba(15, 23, 42, 0.14),
            0 6px 18px color-mix(in srgb, var(--theme-color) 11%, transparent);
        }

        to {
          box-shadow:
            0 24px 54px rgba(15, 23, 42, 0.18),
            0 10px 24px color-mix(in srgb, var(--theme-color) 16%, transparent);
        }
      }

      @keyframes hexoSortableNeonOrbit {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      @keyframes hexoSortableNeonGlow {
        from {
          opacity: 0.48;
          transform: scale(0.985);
        }

        to {
          opacity: 0.8;
          transform: scale(1.02);
        }
      }

      @keyframes hexoSortableNeonTrace {
        from {
          stroke-dashoffset: 0;
        }

        to {
          stroke-dashoffset: -100;
        }
      }

      @keyframes hexoSortableNeonPulse {
        from {
          opacity: 0.74;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes hexoHeroLineIn {
        from {
          opacity: 0;
          transform:
            translate3d(
              calc(var(--hero-dx) * 10px * var(--line-depth)),
              calc(22px + var(--hero-dy) * 12px * var(--line-depth)),
              0
            );
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes hexoHeroGreetingIn {
        from {
          opacity: 0;
          transform:
            translate3d(
              calc(var(--hero-dx) * 6px * var(--line-depth)),
              calc(14px + var(--hero-dy) * 6px * var(--line-depth)),
              0
            );
        }

        to {
          opacity: 1;
        }
      }

      @media (max-width: 767px) {
        #theme-hexo .hexo-hero-content {
          padding-top: 5rem;
          padding-bottom: 6rem;
        }

        #theme-hexo .hexo-hero-copy {
          width: min(92vw, 960px);
          padding-top: 1rem;
        }

        #theme-hexo .hexo-hero-copy::before {
          top: 52%;
          width: 92vw;
        }

        #theme-hexo .hexo-hero-greeting {
          max-width: 88vw;
        }

        #theme-hexo .hexo-hero-greeting .pretext-hero-line {
          padding-left: 0;
          padding-right: 0;
        }

        #theme-hexo #home-nav-button {
          margin-top: 1.5rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #theme-hexo .hexo-hero-cover,
        #theme-hexo .hexo-hero-aurora,
        #theme-hexo .hexo-hero-grid,
        #theme-hexo .hexo-hero-copy::before,
        #theme-hexo .hexo-hero-title .pretext-hero-line,
        #theme-hexo .hexo-hero-title .pretext-hero-token,
        #theme-hexo .hexo-hero-greeting .pretext-hero-line,
        #theme-hexo .hexo-hero-scroll {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }

      }

      /* Custem */
      .tk-footer {
        opacity: 0;
      }

      // 选中字体颜色
      ::selection {
        background: color-mix(in srgb, var(--theme-color) 30%, transparent);
      }

      // 自定义滚动条
      ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background-color: var(--theme-color);
      }

      * {
        scrollbar-width: thin;
        scrollbar-color: var(--theme-color) transparent;
      }
    `}</style>
  )
}

export { Style }
