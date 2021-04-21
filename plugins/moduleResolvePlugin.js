const fs = require('fs');
const path = require('path');
const moduleReg = /^\/@modules\//;

function resolveVue(root) {
  // 首先明确一点，vue3几个比较核心的包有：runtime-core、runtime-dom、reactivity、shared
  // 其次我们还需要用到 compiler-sfc 进行后端编译.vue文件
  const compilerPkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json');
  // 通过package.json的main能够拿到相关模块的路径
  const compilerPkg = require(compilerPkgPath);
  const compilerPath = path.join(path.dirname(compilerPkgPath), compilerPkg.main);
  // 用于解析其他模块路径的函数
  const resolvePath = (name) => {
    return path.join(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`);
  };
  const runtimeCorePath = resolvePath('runtime-core');
  const runtimeDomPath = resolvePath('runtime-dom');
  const reactivityPath = resolvePath('reactivity');
  const sharedPath = resolvePath('shared');

  return {
    compiler: compilerPath,
    '@vue/runtime-dom': runtimeDomPath,
    '@vue/runtime-core': runtimeCorePath,
    '@vue/reactivity': reactivityPath,
    '@vue/shared': sharedPath,
    vue: runtimeDomPath
  }
}

module.exports = function ({ app, root }) {
  const vueResolved = resolveVue(root); // 解析出所有 vue 相关模块
  console.log(vueResolved);
  app.use(async (ctx, next) => {
    // 不是依赖模块, 直接加载
    if (!moduleReg.test(ctx.path)) {
      return next();
    }

    // 去除 /@modules/, 拿到相关模块的内容
    const id = ctx.path.replace(moduleReg, '');
    ctx.type = 'js';
    const content = await fs.readFileSync(vueResolved[id], 'utf8');
    ctx.body = content;
  });
};