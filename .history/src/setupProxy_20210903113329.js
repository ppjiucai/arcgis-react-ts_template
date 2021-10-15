


const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  // app.use(
  //   '/api',  
  //   createProxyMiddleware( {
  //   target: 'http://localhost:3000',
  //   changeOrigin: true,
  //   pathRewrite: {
  //     "^/api": ""
  //   }
  // }));  
  app.use(
    '/interface',
    createProxyMiddleware( {
    target: 'http://api.celou.vip/',
    changeOrigin: true,
    pathRewrite: {
      "^/interface": "/interface"
    }
  }))
}