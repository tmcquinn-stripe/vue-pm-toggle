const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
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