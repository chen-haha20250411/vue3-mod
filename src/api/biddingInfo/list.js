import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/biddingInfo/toList',
    method: 'post',
    params: query
  })
}

export function fetchdelete(id) {
  return request({
    url: '/admin/biddingInfo/deletevalue',
    method: 'post',
    params: { id: id }
  })
}

export function getInfo(id) {
  return request({
    url: '/admin/biddingInfo/queryById',
    method: 'get',
    params: { id: id }
  })
}

export function saveOrupdate(data) {
  return request({
    url: '/admin/biddingInfo/insertOupdate',
    method: 'post',
    params: data
  })
}
