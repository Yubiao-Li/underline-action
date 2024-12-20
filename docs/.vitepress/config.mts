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
        text: 'Examples',
        items: [{ text: 'Underline Action', link: '/underline-action' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Yubiao-Li/underline-action' }],
  },
});
