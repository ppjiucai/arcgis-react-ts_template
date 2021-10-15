


const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
//   app.use(createProxyMiddleware('/api', {
//     target: 'http://localhost:3000',
//     secure: false,
//     changeOrigin: true,
//     pathRewrite: {
//       "^/api": ""
//     }
//   }))  
  app.use(createProxyMiddleware('/interface', {
    target: 'http://api.celou.vip/',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/interface": "/interface"
    }
  }))
}