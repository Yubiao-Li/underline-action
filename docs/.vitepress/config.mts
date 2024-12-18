import { defineConfig } from 'vitepress';
import vue from '@vitejs/plugin-vue';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'My Awesome Project',
  description: 'A VitePress Site',
  markdown: {
    cache: false,
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
