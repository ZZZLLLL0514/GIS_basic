const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  lintOnSave: false,//禁用eslint
  transpileDependencies: true,
  devServer:{
    // proxy:{
    //   '/ajaxserver':{//请求路径（项目中get请求的路径,使用代理后只写路径不用写域名）
    //     target:"http://127.0.0.1:3000",
    //     changeOrigin:true,
    //     pathRewrite:{
    //       '^/ajaxserver':'/ajaxserver/aja'//将请求路径/ajaxserver替换成/ajaxserver/aja,也就是最后vue请求的是http://127.0.0.1:3000/ajaxserver/aja
    //     }
    //   }
    // },
    proxy:{
      '/geoserver':{//请求路径（一般是域名或者ip地址后面第一个路径下面）
        target:"http://127.0.0.1:8888",
        changeOrigin:true,
        pathRewrite:{//重写路径，就是将target值的路径替换成空字符
          '^/geoserver':'/geoserver/topp/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=topp%3Astates&maxFeatures=50&outputFormat=application%2Fjson'
        }
      }
    }
  }
})
