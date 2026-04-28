import { loginByUsername, logout, getUserInfo, getUserRoleInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { ElMessage } from 'element-plus'

function convertPermissionsToTree(data) {
  if (!Array.isArray(data) || data.length === 0) return data

  // 检查是否已经是嵌套树形（有 children/subMenuList）
  const hasNesting = data.some(item => {
    const children = item.children || item.subMenuList
    return children && Array.isArray(children) && children.length > 0
  })
  if (hasNesting) return data

  // 扁平数据 → 树形，使用 parent_no/parentNo
  const map = {}
  const tree = []

  data.forEach(item => {
    const id = item.menu_id || item.menuId
    map[id] = { ...item, children: [] }
  })

  data.forEach(item => {
    const id = item.menu_id || item.menuId
    const parentNo = item.parent_no || item.parentNo || item.parentno
    const node = map[id]

    if (!parentNo || parentNo === 'null' || parentNo === 0) {
      tree.push(node)
    } else if (map[parentNo]) {
      map[parentNo].children.push(node)
    } else {
      tree.push(node)
    }
  })

  return tree
}

function extractMenuUrls(menus) {
  const urls = []

  function traverse(menuList) {
    if (!menuList || !Array.isArray(menuList)) return

    menuList.forEach(menu => {
      if (menu.menuURL || menu.menuUrl) {
        const url = menu.menuURL || menu.menuUrl
        if (url && url !== '#') {
          urls.push(url)
        }
      }

      if (menu.subMenuList && menu.subMenuList.length > 0) {
        traverse(menu.subMenuList)
      }
    })
  }

  traverse(menus)
  return urls
}

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  login_name: '',
  roleinfoId: '',
  permissions: [],
  dataPermissions: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_LOGIN_NAME: (state, login_name) => {
    state.login_name = login_name
  },
  SET_ROLEINFO_ID: (state, roleinfoId) => {
    state.roleinfoId = roleinfoId
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_DATA_PERMISSIONS: (state, dataPermissions) => {
    state.dataPermissions = dataPermissions
  }
}

const actions = {
  LoginByUsername({ commit }, userInfo) {
    const { username, password, code, captchaKey } = userInfo
    return new Promise((resolve, reject) => {
      loginByUsername(username, password, code, captchaKey)
        .then(response => {
          const data = response || {}
          const token = (data.data && (data.data.token || data.data.accessToken || data.data.access_token || data.data.Token)) || data.token || data.accessToken || data.access_token || data.Token || ''
          const loginName = (data.data && (data.data.loginName || data.data.login_name || data.data.username)) || data.loginName || data.login_name || data.username || username

          if (!token) {
            ElMessage.error('登录失败：未返回token')
            reject(new Error('未返回token'))
            return
          }

          commit('SET_TOKEN', token)
          commit('SET_LOGIN_NAME', loginName)
          setToken(token)
          commit('SET_ROLEINFO_ID', '')
          resolve()
        }).catch(error => {
          ElMessage.error(error?.message || '登录失败')
          reject(error)
        })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(response => {
        // 处理外层包装的数据结构
        const data = response.data || response

        if (!data) {
          reject('Verification failed, please Login again.')
          return
        }

        const user = data.user || data || {}
        let roles = data.roles || []
        const permissions = data.permissions || []

        if (user.roleName) {
          roles = [user.roleName]
        } else {
          if (roles.length > 0 && typeof roles[0] === 'object' && roles[0].roleName) {
            roles = roles.map(role => role.roleName)
          } else if (roles.length > 0 && typeof roles[0] === 'string') {
            roles = roles
          } else if (typeof roles === 'object' && !Array.isArray(roles) && roles.roleName) {
            roles = [roles.roleName]
          } else if (roles.data && Array.isArray(roles.data)) {
            roles = roles.data.map(role => role.roleName || role.name)
          }
        }

        const name = user.realName || user.username || user.name || ''
        const avatar = user.avatar || ''
        const introduction = user.introduction || ''

        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_PERMISSIONS', permissions)

        let dataPermissions = data.dataPermissions ||
                              user.dataPermissions ||
                              data.data_permissions ||
                              user.data_permissions ||
                              []

        if (!Array.isArray(dataPermissions)) {
          dataPermissions = [dataPermissions]
        }

        commit('SET_DATA_PERMISSIONS', dataPermissions)

        const buildMenuTree = (menuData) => {
          if (!Array.isArray(menuData)) return []
          return menuData.map(menu => {
            const menuItem = {
              menuId: menu.menu_id || menu.menuId,
              menuName: menu.menu_name || menu.menuName,
              menuURL: menu.menu_url || menu.menuURL || menu.menuUrl || '#',
              imageurl: menu.imageurl || menu.icon,
              menu_auth: menu.menu_auth,
              subMenuList: [],
              btnList: menu.btnList || []
            }

            const childMenus = menu.children || menu.subMenuList
            if (childMenus && Array.isArray(childMenus) && childMenus.length > 0) {
              menuItem.subMenuList = buildMenuTree(childMenus)
            }

            return menuItem
          })
        }

        // 直接使用 permissions 构建菜单树
        const menus = Array.isArray(permissions) ? buildMenuTree(permissions) : []

        resolve({ ...data, roles, permissions, menus })
      }).catch(error => {
        reject(error)
      })
    })
  },

  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      removeToken()
      resolve()
    })
  },

  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles, menus } = await dispatch('getInfo')

    resetRouter()

    const accessRoutes = await dispatch('permission/generateRoutes', { roles, menus }, { root: true })
    accessRoutes.forEach(route => router.addRoute(route))

    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

const getters = {
  permissions: state => state.permissions
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
