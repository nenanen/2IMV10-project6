module.exports = {
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: [/\.png$/, /\.svg$/],
                use: ["file-loader"]
            },
            {
                test: [/\.js$/],
                exclude: [/(node_modules|bower_components)/],
                use: ["babel-loader"],
            }
        ]
    },
};