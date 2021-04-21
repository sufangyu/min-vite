const Koa = require('koa');
const serveStaticPlugin = require('./plugins/serveStaticPlugin');
const rewriteModulePlugin = require('./plugins/rewriteModulePlugin');
const moduleResolvePlugin = require('./plugins/moduleResolvePlugin');
const vueServerPlugin = require('./plugins/vueServerPlugin');
const htmlRewritePlugin = require('./plugins/htmlRewritePlugin');

module.exports = function createServe() {
  const app = new Koa();
  const root = process.cwd(); // 进程当前工作目录
  const context = { app, root };

  // 插件
  const resolvePlugins = [
    htmlRewritePlugin,
    rewriteModulePlugin,
    vueServerPlugin,
    moduleResolvePlugin,
    serveStaticPlugin,
  ];
  resolvePlugins.forEach((plugin) => plugin(context));
  
  return app;
};
