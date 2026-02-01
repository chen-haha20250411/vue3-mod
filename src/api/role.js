import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/admin/routes',
    method: 'get'
  })
}

export function getRoles(params) {
  return request({
    url: '/admin/role/list',
    method: 'post',
    params
  })
}

export function createRole(data) {
  return request({
    url: '/admin/role/addRole',
    method: 'post',
    params: data
  })
}

export function updateRole(data) {
  return request({
    url: '/admin/role/updateroleinfo',
    method: 'post',
    params: data
  })
}

export function deleteRole(roleInfoId) {
  return request({
    url: '/admin/role/delRole',
    method: 'post',
    params: { roleInfoId }
  })
}

export function getRoleTreeEdit(roleInfoId) {
  return request({
    url: '/admin/role/getRoleTreeEdit',
    method: 'post',
    params: { roleInfoId }
  })
}
