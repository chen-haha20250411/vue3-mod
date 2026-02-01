import request from '@/utils/request'

export function loginByUsername(userName, password, verifyCode, uucode, oldyzmuuid, yzm) {
  const data = {
    userName,
    password,
    verifyCode,
    uucode,
    oldyzmuuid,
    yzm
  }
  console.log('loginByUsername data:', data)
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

export function getUserInfo(login_name, roleinfoId) {
  return request({
    url: '/admin/getUserInfo',
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
    url: '/admin/captcha',
    method: 'post'
  })
}
export function sendmms(params) {
  return request({
    url: '/admin/sendmms',
    method: 'post',
    params
  })
}
