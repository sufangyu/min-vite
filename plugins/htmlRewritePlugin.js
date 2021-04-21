const { readBody } = require('./utils');

module.exports = function ({ app }) {
  const inject = `
    <script>
      window.process = {
        env: {
          NODE_ENV: 'development'
        }
      };
      function updateCss(css) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        document.head.appendChild(style);
      }
    </script>
  `;
  
  app.use(async (ctx, next) => {
    await next();
    if (ctx.response.is('html')) {
      const html = await readBody(ctx.body);
      ctx.body = html.replace(/<head>/, `$&${inject}`)
    }
  });
}