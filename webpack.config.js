const config = {
    entry: {
        'main': ['./src/index.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader"
            },
        ]
    }
}

module.exports = config