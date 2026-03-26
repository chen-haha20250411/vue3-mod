import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000,
  withCredentials: true,
  crossDomain: true,
  responseType: 'arraybuffer'
})
// 默认使用json格式
service.defaults.headers.post['Content-Type'] = 'application/json'
service.defaults.withCredentials = true
service.defaults.transformRequest = [function(data, headers) {
  // console.log('transformRequest called, data type:', typeof data, 'headers:', headers)
  if (!data || typeof data !== 'object') {
    // console.log('transformRequest: returning data as-is')
    return data
  }
  if (headers && headers['Content-Type'] === 'application/json') {
    // console.log('transformRequest: converting to JSON string')
    return JSON.stringify(data)
  }
  // console.log('transformRequest: converting to form-urlencoded')
  let ret = ''
  for (const it in data) {
    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
  }
  const result = ret.slice(0, -1)
  // console.log('transformRequest result:', result)
  return result
}]
// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    const token = getToken()
    if (token) {
      // 让每个请求携带token
      config.headers['token'] = token
      // 同时设置Authorization头，兼容不同的后端实现
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 保留baseURL，确保生产环境中正确使用VUE_APP_BASE_API
    // console.log('Request config:', config.method, config.url, config.data)
    // console.log('Request baseURL:', config.baseURL)
    // console.log('Request full URL:', config.baseURL + config.url)
    return config
  },
  error => {
    // Do something with request error
    // console.log('Request error:', error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    // console.log('=== Response interceptor called ===')
    let res = response.data
    // console.log('Response status:', response.status)
    // console.log('Response headers:', response.headers)
    // console.log('Response data type:', typeof res)
    // console.log('Response data:', res)
    
    // arraybuffer 转 string
    if (res instanceof ArrayBuffer) {
      res = new TextDecoder().decode(res)
      // console.log('Converted arraybuffer to string:', res.substring(0, 200))
    }

    if (typeof res === 'string') {
      const trimmedRes = res.trim()
      if (!trimmedRes) {
        // console.error('Empty response from server')
        return Promise.reject('服务器返回空响应')
      }
      if (trimmedRes.startsWith('<') || trimmedRes.startsWith('<!')) {
        // console.error('Server returned HTML instead of JSON:', trimmedRes.substring(0, 200))
        return Promise.reject('服务器返回HTML页面，请检查API地址是否正确')
      }
      try {
        res = JSON.parse(trimmedRes)
      } catch (e) {
        // console.error('Failed to parse response as JSON:', e)
        // console.error('Raw response:', trimmedRes.substring(0, 500))
        if (trimmedRes.includes('=') && !trimmedRes.includes('{')) {
          const params = new URLSearchParams(trimmedRes)
          const obj = {}
          for (const [key, value] of params) {
            obj[key] = value
          }
          // console.log('Parsed as form-urlencoded:', obj)
          res = obj
        } else {
          return Promise.reject('服务器响应格式错误，无法解析JSON')
        }
      }
    }

    // 兼容多种响应格式：
    // 1. { success: true/false, msg: "...", data: {...} }
    // 2. { code: 200, msg: "success", data: {...} }
    // 3. 直接返回数据对象 { data: {...} } 或 { list: [], total: 0 }

    // 如果有success字段，检查是否成功
    if (Object.prototype.hasOwnProperty.call(res, 'success')) {
      if (!res.success) {
        if (res.errcode === '000001' || res.errcode === '000002') {
          store.dispatch('user/logout').then(() => {
            const hrefStr = window.location.href
            if (hrefStr.indexOf('token=') !== -1) {
              window.location.href = hrefStr.split('?')[0]
            }
            location.reload()
          })
        } else if (res.errcode === '000003') {
          // 用户无权限访问
          ElMessage({
            message: res.msg || '用户无权限访问',
            type: 'warning',
            duration: 5 * 1000
          })
        } else {
          ElMessage({
            message: res.msg || '请求失败',
            type: 'error',
            duration: 5 * 1000
          })
        }
        return Promise.reject(res.msg)
      } else {
        // 如果success为true，返回data字段
        return res.data || res
      }
    }
    // 如果有code字段，检查是否成功
    else if (Object.prototype.hasOwnProperty.call(res, 'code')) {
      if (res.code !== 200 && res.code !== 20000) {
        ElMessage({
          message: res.msg || '请求失败',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(res.msg || '请求失败')
      } else {
        // 如果code为200或20000，返回data字段
        return res.data || res
      }
    }
    // 如果没有success或code字段，直接返回数据
    return res
  },
  
  error => {
    // console.log('=== Error interceptor called ===')
    // console.log('err', error)
    // console.log('err.response', error.response)
    // console.log('err.config', error.config)
    // console.log('err.message', error.message)
    
    // 处理 form-urlencoded 格式的错误响应
    if (error.response && error.response.data && error.response.data instanceof ArrayBuffer) {
      const data = new TextDecoder().decode(error.response.data)
      // console.log('Error response arraybuffer converted:', data.substring(0, 200))
      if (data.includes('=') && !data.startsWith('{')) {
        const params = new URLSearchParams(data)
        const obj = {}
        for (const [key, value] of params) {
          obj[key] = value
        }
        // console.log('Parsed error response as form-urlencoded:', obj)
        error.response.data = obj
      } else {
        try {
          error.response.data = JSON.parse(data)
        } catch (e) {
          error.response.data = data
        }
      }
    } else if (error.response && error.response.data && typeof error.response.data === 'string') {
      const data = error.response.data
      if (data.includes('=') && !data.startsWith('{')) {
        const params = new URLSearchParams(data)
        const obj = {}
        for (const [key, value] of params) {
          obj[key] = value
        }
        // console.log('Parsed error response as form-urlencoded:', obj)
        error.response.data = obj
      }
    }
    
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
