'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Element Admin'

const port = process.env.port || process.env.npm_config_port || 9527

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    // Suppress ResizeObserver loop warning
    setupMiddlewares: (middlewares, devServer) => {
      const originalConsoleError = console.error
      console.error = (...args) => {
        if (/ResizeObserver loop/.test(args[0])) return
        originalConsoleError(...args)
      }
      return middlewares
    },
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        pathRewrite: {
          '^/dev-api': ''
        },
        logLevel: 'debug'
      },
      '/admin': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  },
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      },
      fallback: {
        path: false
      }
    },
    plugins: []
  },
  chainWebpack(config) {
    config.plugins.delete('prefetch')

    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        spriteFilename: 'icon-[name].svg'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial'
                },
                elementUI: {
                  name: 'chunk-elementUI',
                  priority: 20,
                  test: /[\\/]node_modules[\\/]_?element-plus(.*)/
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'),
                  minChunks: 3,
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
