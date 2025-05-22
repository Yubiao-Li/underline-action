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
          {
            format: 'umd',
            name: 'UnderlineAction', // 指定全局变量名
            dir: 'dist',
            entryFileNames: '[name].umd.js', // 单独命名UMD文件
            globals: {
              // 如果有外部依赖，在这里配置全局变量名
              // 例如: 'vue': 'Vue'
            }
          }
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
