import request from '@/utils/request'

export function getUsers(query) {
  return request({
    url: '/admin/oper/listWithDetails',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: '/admin/oper',
    method: 'post',
    data: data
  })
}

export function updateUser(data) {
  return request({
    url: '/admin/oper',
    method: 'put',
    data: data
  })
}

export function deleteUser(operatorId) {
  return request({
    url: `/admin/oper/${operatorId}`,
    method: 'delete'
  })
}

export function getUserDetail(operatorId) {
  return request({
    url: `/admin/oper/${operatorId}/detail`,
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/admin/oper/getroleinfoAll',
    method: 'get'
  })
}

export function grantUserRoles(operatorId, data) {
  return request({
    url: `/admin/oper/${operatorId}/grant`,
    method: 'put',
    data: {
      roleInfoId: data.roleInfoId
    }
  })
}

export function resetPassword(operatorId) {
  return request({
    url: `/admin/oper/${operatorId}/reset-password`,
    method: 'put'
  })
}

export function updatePassword(data) {
  return request({
    url: '/admin/oper/chpwd',
    method: 'post',
    data: data
  })
}

export function unlockUser(operatorId) {
  return request({
    url: `/admin/oper/${operatorId}/unlock`,
    method: 'put'
  })
}
/**/
export function getDataRoles() {
  return request({
    url: '/api/dataPermission/list',
    method: 'get'
  })
}

/**
 * 给用户分配数据角色
 * @param {Object} data - 包含userId和roleIds的对象
 */
export function grantUserDataRoles(data) {
  return request({
    url: '/api/dataRole/grantUserDataRoles',
    method: 'post',
    data: data
  })
}

export function getDeptList() {
  return request({
    url: '/api/departmentInfo/list',
    method: 'get'
  })
}

export function getBranchList() {
  return request({
    url: '/api/branchInfo/list',
    method: 'get'
  })
}

export function getAssessmentTargets() {
  return request({
    url: '/admin/oper/getAssessmentTargets',
    method: 'get'
  })
}
