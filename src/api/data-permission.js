import request from '@/utils/request'

/**
 * 数据角色管理 API (DataRoleController)
 * 路径：/api/dataRole
 */

// 获取所有数据角色
export function getDataRoleList() {
  return request({
    url: '/api/dataRole/list',
    method: 'get'
  })
}

/**
 * 数据权限 API (DataPermissionController)
 * 路径：/api/dataPermission
 */

// 获取角色的权限列表
export function getDataPermissionList(roleId) {
  return request({
    url: `/api/dataPermission/list/${roleId}`,
    method: 'get'
  })
}

// 保存权限配置
export function saveDataPermission(data) {
  return request({
    url: '/api/dataPermission/save',
    method: 'post',
    data: data
  })
}

// 获取部门列表
export function getDeptList() {
  return request({
    url: '/api/departmentInfo/list',
    method: 'get'
  })
}

// 获取分支机构列表
export function getBranchList() {
  return request({
    url: '/api/branchInfo/list',
    method: 'get'
  })
}

// 获取用户列表
export function getAllUsers() {
  return request({
    url: '/api/dataPermission/allUsers',
    method: 'get'
  })
}

// 给用户分配数据角色
export function assignDataPermission(data) {
  return request({
    url: '/api/dataPermission/assign',
    method: 'post',
    data: data
  })
}
