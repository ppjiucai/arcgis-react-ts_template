const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(proxy(
        '/api', {
            target: 'http://192.168.1.144:8181' ,
            secure: false,
            changeOrigin: true,
            pathRewrite: {
                "^/api": "/"
            },
            // cookieDomainRewrite: "http://localhost:3000"
        }));
};