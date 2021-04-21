const path = require('path');
const fs = require('fs').promises;

function getCompilerPath(root) {
  const compilerPkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json');
  const compilerPkg = require(compilerPkgPath);
  // 通过package.json的main能够拿到相关模块的路径
  return path.join(path.dirname(compilerPkgPath), compilerPkg.main);
}

module.exports = function ({ app, root }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith('.vue')) {
      return next();
    }

    const filepath = path.join(root, ctx.path);
    const content = await fs.readFile(filepath, 'utf8');
    const { parse, compileTemplate } = require(getCompilerPath(root));
    const { descriptor } = parse(content); // 解析文件内容

    // 解析script、template、style相关数据并返回给客户端
    const defaultExportRE = /((?:^|\n|;)\s*)export default/;
    if (!ctx.query.type) {
      let code = '';
      if (descriptor.script) {
        let content = descriptor.script.content;
        let replaced = content.replace(defaultExportRE, '$1const __script = ');
        code += replaced;
      }
      // template处理
      if (descriptor.template) {
        const templateRequest = ctx.path + '?type=template';
        code += `\nimport { render as __render } from ${JSON.stringify(templateRequest)}`;
        code += `\n__script.render = __render`;
      }
      // 样式处理
      if (descriptor.styles.length) {
        descriptor.styles.forEach((item, index) => {
          code += `\nimport "${ctx.path}?type=style&index=${index}"\n`
        })
      }

      ctx.type = 'js';
      code += `\nexport default __script`;
      ctx.body = code;
    }

    if (ctx.query.type === 'template') {
      const content = descriptor.template.content;
      const { code } = compileTemplate({ source: content });
      ctx.type = 'js';
      ctx.body = code;
    }

    if (ctx.query.type === 'style') {
      const styleBlock = descriptor.styles[ctx.query.index];
      ctx.type = 'js';
      ctx.body = `
          \n const __css = ${JSON.stringify(styleBlock.content)}
          \n updateCss(__css)
          \n export default __css
      `
    }
  });
};
