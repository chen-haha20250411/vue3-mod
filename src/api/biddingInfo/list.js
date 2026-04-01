import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/biddingInfo/toList',
    method: 'get',
    params: query
  })
}

export function fetchdelete(id) {
  return request({
    url: '/api/biddingInfo/deletevalue',
    method: 'post',
    params: { id: id }
  })
}

export function getInfo(id) {
  return request({
    url: '/api/biddingInfo/queryById',
    method: 'get',
    params: { id: id }
  })
}

export function saveOrupdate(data) {
  return request({
    url: '/api/biddingInfo/insertOupdate',
    method: 'post',
    params: data
  })
}
