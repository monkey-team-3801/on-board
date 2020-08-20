const paths = require("./paths");

process.env.BABEL_ENV = "production";

module.exports = function (webpackEnv) {
    return {
        mode: "production",
        // Chosen mode tells webpack to use its built-in optimizations accordingly.
        entry: "./src/server/server.ts", // string | object | array,
        output: {
            path: paths.appBuild,
            filename: "server.js",
        },
        resolve: {
            // This allows you to set a fallback for where webpack should look for modules.
            // We placed these paths second because we want `node_modules` to "win"
            // if there are any conflicts. This matches Node resolution mechanism.
            // https://github.com/facebook/create-react-app/issues/253
            modules: ["node_modules", paths.appNodeModules],
            extensions: [".ts", ".js"],
        },
        node: {
            __dirname: false,
        },
        target: "node",
        module: {
            rules: [
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    include: paths.appSrc,
                    loader: require.resolve("babel-loader"),
                    options: {
                        customize: require.resolve(
                            "babel-preset-react-app/webpack-overrides"
                        ),
                        // This is a feature of `babel-loader` for webpack (not Babel itself).
                        // It enables caching results in ./node_modules/.cache/babel-loader/
                        // directory for faster rebuilds.
                        cacheDirectory: true,
                        // See #6846 for context on why cacheCompression is disabled
                        cacheCompression: false,
                        compact: true,
                    },
                },
            ],
        },
    };
};
