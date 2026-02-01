import request from '@/utils/request'

export function getDataPermissions(params) {
  return request({
    url: '/vue-element-admin/data-permissions',
    method: 'get',
    params
  })
}

export function getDataPermission(id) {
  return request({
    url: `/vue-element-admin/data-permissions/${id}`,
    method: 'get'
  })
}

export function createDataPermission(data) {
  return request({
    url: '/vue-element-admin/data-permissions',
    method: 'post',
    data
  })
}

export function updateDataPermission(id, data) {
  return request({
    url: `/vue-element-admin/data-permissions/${id}`,
    method: 'put',
    data
  })
}

export function deleteDataPermission(id) {
  return request({
    url: `/vue-element-admin/data-permissions/${id}`,
    method: 'delete'
  })
}
