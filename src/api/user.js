import request from '@/utils/request'

export function getUsers(params) {
  return request({
    url: '/admin/oper/list',
    method: 'post',
    data: params
  })
}

export function getAllRoles() {
  return request({
    url: '/admin/oper/getroleinfoAll',
    method: 'post'
  })
}

export function createUser(data) {
  return request({
    url: '/admin/oper/addOper',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/admin/oper/updateOper',
    method: 'post',
    data
  })
}

// export function deleteUser(operatorId) {
//   return request({
//     url: '/admin/oper/delOper',
//     method: 'post',
//     data: { operatorId }
//   })
// }


export function deleteUser(operatorId) {
  return request({
    url: `/admin/oper/${operatorId}`,
    method: 'delete'
  })
}


export function grantUserRoles(data) {
  return request({
    url: '/admin/oper/Grant',
    method: 'post',
    data
  })
}

export function resetPassword(operatorId) {
  return request({
    url: '/admin/oper/resetPassword',
    method: 'post',
    data: { operatorId }
  })
}
