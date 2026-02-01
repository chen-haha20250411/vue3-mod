import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/zhongbiao/toList',
    method: 'post',
    params: query
  })
}

export function fetchdelete(id) {
  return request({
    url: '/admin/zhongbiao/deletevalue',
    method: 'post',
    params: { id: id }
  })
}

export function getInfo(id) {
  return request({
    url: '/admin/zhongbiao/queryById',
    method: 'get',
    params: { id: id }
  })
}

export { getInfo as getDetail }

export function saveOrupdate(data) {
  return request({
    url: '/admin/zhongbiao/insertOupdate',
    method: 'post',
    params: data
  })
}
