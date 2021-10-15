const proxy = require('http-proxy-middleware')
module.exports = function ( app ) {
  // app.use( proxy(标识符,配置))
  app.use(proxy('/local',{
    target: '/',
    changeOrigin: true 
  }))
}