import request from '@/utils/request'

export function getDataPermissions(params) {
  return request({
    url: '/api/dataPermission/list',
    method: 'get',
    params
  })
}

export function getDataPermission(id) {
  return request({
    url: `/api/dataPermission/${id}`,
    method: 'get'
  })
}

export function createDataPermission(data) {
  return request({
    url: '/api/dataPermission/create',
    method: 'post',
    data
  })
}

export function updateDataPermission(id, data) {
  return request({
    url: `/api/dataPermission/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteDataPermission(id) {
  return request({
    url: `/api/dataPermission/delete/${id}`,
    method: 'delete'
  })
}
