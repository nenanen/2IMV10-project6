module.exports = {
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    }
}