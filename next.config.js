const fs = require("fs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

// Monkeypatch preact package.json
const preactConfig = __dirname + "/node_modules/preact/package.json";
const preactPackage = JSON.parse(fs.readFileSync(preactConfig));
preactPackage.exports = Object.assign({}, preactPackage.exports, {
    "./compat/jsx-runtime.js": preactPackage.exports["./jsx-runtime"],
});
console.info("Monkeypatching preact");
fs.writeFileSync(preactConfig, JSON.stringify(preactPackage, null, 4));

module.exports = withBundleAnalyzer({
    reactStrictMode: true,
    eslint: {
        dirs: ["pages", "components", "lib"],
    },
    images: {
        domains: ["i.ytimg.com", "p.ihateani.me", "p.n4o.xyz", "naotimes-og.glitch.me", "ttvthumb.glitch.me"],
    },
    productionBrowserSourceMaps: true,
    swcLoader: true,
    swcMinify: true,
    webpack: (config, { dev, isServer }) => {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|mp4)$/i,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        publicPath: "/_next",
                        name: "static/media/[name].[hash].[ext]",
                    },
                },
            ],
        });

        if (!dev && !isServer) {
            // Replace React with Preact only in client production build
            Object.assign(config.resolve.alias, {
                react: "preact/compat",
                "react-dom/test-utils": "preact/test-utils",
                "react-dom": "preact/compat",
                "react/jsx-runtime": "preact/jsx-runtime",
            });
        }

        // console.info(config);

        return config;
    },
    async rewrites() {
        return {
            afterFiles: [
                {
                    source: "/js/kryptonite.js",
                    destination: "https://tr.n4o.xyz/js/plausible.js",
                },
                {
                    source: "/api/event",
                    destination: "https://tr.n4o.xyz/api/event",
                },
            ],
        };
    },
});
