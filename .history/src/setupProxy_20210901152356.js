


const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',  
    createProxyMiddleware( {
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/api": ""
    }
  }))  
  app.use(
    '/interface',
    createProxyMiddleware( {
    target: 'http://api.celou.vip/',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/interface": "/interface"
    }
  }))
}