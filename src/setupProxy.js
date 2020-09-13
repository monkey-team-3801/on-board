const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        createProxyMiddleware("/filehandler/**", {
            target: "http://localhost:5000",
        })
    );
};
