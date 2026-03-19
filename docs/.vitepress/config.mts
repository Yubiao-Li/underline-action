import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'My Awesome Project',
  description: 'A VitePress Site',
  markdown: {
    cache: false,
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag === 'mp-common-product'
      }
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Playground',
        items: [
          { text: '基础划线', link: '/underline-action' },
          { text: '自定义', link: '/custom' },
          { text: '特殊场景', link: '/special' },
          { text: '换行验证', link: '/need-wrap' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Yubiao-Li/underline-action' }],
  },
});
