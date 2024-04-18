const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
    entry: {
        index: "./src/index.tsx",
        contentScript: "./src/contentScript/index.tsx",
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        }
                    }],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: "../manifest.json" },
                { from: "background.js", to: "background.js" }
            ],
        }),
        ...getHtmlPlugins(["index", "contentScript"]),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            chunks(chunk) {
                return chunk.name !== "contentScript";
            },
        },
    },
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HTMLPlugin({
                title: "Narrow Focus: New Tab Todo List",
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}