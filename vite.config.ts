import { defineConfig } from 'vite';
// import { babel } from '@rollup/plugin-babel';

export default defineConfig(({ command }) => {
  return {
    mode: 'production',
    root: command === 'serve' ? './demo' : '',
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    build: {
      sourcemap: true,
      minify: false, // 方便debug
      //压缩
      rollupOptions: {
        //忽略打包vue文件
        output: [
          {
            format: 'es',
            //配置打包根目录
            dir: 'dist',
            //打包后文件名
            entryFileNames: '[name].js',
            //让打包目录和我们目录对应
            // preserveModules: true,
            exports: 'named',
          },
        ],
      },
      lib: {
        entry: {
          index: 'src/index.js',
        },
      },
    },
  };
});
