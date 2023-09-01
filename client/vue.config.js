const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:4242",
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
      }
      },
    },
  },
})