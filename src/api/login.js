import request from '@/utils/request'

export function loginByUsername(username, password, code, captchaKey) {
  const data = {
    username,
    password,
    code,
    captchaKey
  }
  console.log('loginByUsername data:', data)
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/api/user/logout',
    method: 'post'
  })
}

export function getUserInfo(login_name, roleinfoId) {
  return request({
    url: '/api/user/info',
    method: 'get',
    params: {
      loginName: login_name || undefined,
      roleinfoId: roleinfoId || undefined
    }
  })
}

export function getUserRoleInfo(loginName) {
  return request({
    url: '/admin/oper/getroleinfo',
    method: 'post',
    data: { loginName }
  })
}
export function checkPwd() {
  return request({
    url: '/admin/checkPwd',
    method: 'get'
  })
}

export function getCaptcha() {
  return request({
    url: '/api/auth/captcha',
    method: 'get'
  })
}
