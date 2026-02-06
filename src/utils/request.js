import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  timeout: 10000, // request timeout
  withCredentials: true,
  crossDomain: true
})
// 默认使用form-data格式，特定接口可以覆盖
service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
service.defaults.withCredentials = true
service.defaults.transformRequest = [function(data, headers) {
  // 如果Content-Type是application/json，直接返回JSON字符串
  if (headers && headers['Content-Type'] === 'application/json') {
    return JSON.stringify(data)
  }
  // 否则转换为form-data格式
  let ret = ''
  for (const it in data) {
    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
  }
  return ret
}]
// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    if (store.getters.token) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      config.headers['token'] = getToken()
    } else {
      const token = getToken()
      if (token) {
        // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
        config.headers['token'] = token
      }
    }
    console.log('Request config:', config.method, config.url, config.data)
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    console.log('Response:', res)
    // console.log(JSON.stringify("233:"+res))

    // 兼容两种响应格式：
    // 1. { success: true/false, msg: "...", data: {...} }
    // 2. 直接返回数据对象 { data: {...} } 或 { list: [], total: 0 }

    // 如果有success字段，检查是否成功
    if (Object.prototype.hasOwnProperty.call(res, 'success')) {
      if (!res.success) {
        if (res.errcode === '000001' || res.errcode === '000002') {
          store.dispatch('user/LogOut').then(() => {
            const hrefStr = window.location.href
            if (hrefStr.indexOf('token=') !== -1) {
              window.location.href = hrefStr.split('?')[0]
            }
            location.reload()
          })
        } else {
          ElMessage({
            message: res.msg || '请求失败',
            type: 'error',
            duration: 5 * 1000
          })
        }
        return Promise.reject(res.msg)
      }
    }

    // 如果没有success字段或者success为true，直接返回数据
    return res
  },
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过 xmlhttprequest 来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
  // response => {
  //   const res = response.data
  //   if (res.code !== 20000) {
  //     ElMessage({
  //       message: res.message,
  //       type: 'error',
  //       duration: 5 * 1000
  //     })
  //     // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
  //     if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
  //       // 请自行在引入 ElMessageBox
      //       // import { ElMessage, ElMessageBox } from 'element-plus'
  //       ElMessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
  //         confirmButtonText: '重新登录',
  //         cancelButtonText: '取消',
  //         type: 'warning'
  //       }).then(() => {
  //         store.dispatch('FedLogOut').then(() => {
  //           location.reload() // 为了重新实例化vue-router对象 避免bug
  //         })
  //       })
  //     }
  //     return Promise.reject('error')
  //   } else {
  //     return response.data
  //   }
  // },
  error => {
    console.log('err', error) // for debug
    console.log('err.response', error.response)
    console.log('err.config', error.config)
    
    // 构造更友好的错误信息
    let message = error.message
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status
      if (status === 404) {
        message = '请求接口不存在(404)，请联系管理员'
      } else if (status === 500) {
        message = '服务器内部错误(500)，请联系管理员'
      } else if (status === 403) {
        message = '没有权限访问该接口(403)'
        // 跳转到403页面
        router.push('/403')
      } else if (status === 401) {
        message = '未授权，请重新登录(401)'
      } else {
        message = `服务器错误(${status}): ${error.response.statusText}`
      }
    } else if (error.message && error.message.includes('Network')) {
      message = '网络异常，请检查网络连接或后端服务是否启动'
    } else if (error.message && error.message.includes('timeout')) {
      message = '请求超时，请稍后重试'
    }
    
    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
