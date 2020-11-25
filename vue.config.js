const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    publicPath: './',
    devServer: {
        host: '0.0.0.0',
        port: 8080
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                asar: true,
                win: {
                    icon: './public/logo.ico'
                },
                productName:'揽胜传媒富信执行端',
            }
        }
    }
};