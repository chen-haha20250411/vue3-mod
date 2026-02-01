import { loginByUsername, logout, getUserInfo, getUserRoleInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const MOCK_LOGIN = false // process.env.NODE_ENV === 'development'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  login_name: '',
  roleinfoId: ''
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
  }
}

const actions = {
  // user login
  LoginByUsername({ commit }, userInfo) {
    if (MOCK_LOGIN) {
      console.log('Mock login enabled, using mock token')
      const mockToken = 'mock-token-' + Date.now()
      commit('SET_TOKEN', mockToken)
      setToken(mockToken)
      return Promise.resolve()
    }
    const { userName, password, verifyCode, uucode, oldyzmuuid, yzm } = userInfo
    return new Promise((resolve, reject) => {
      loginByUsername(userName, password, verifyCode, uucode, oldyzmuuid, yzm).then(response => {
        const { data } = response
        const loginName = data.loginName || data.login_name || userName
        commit('SET_TOKEN', data.token)
        commit('SET_LOGIN_NAME', loginName)
        setToken(data.token)
        commit('SET_ROLEINFO_ID', '')
        resolve()
        // 临时注释：等待后端实现 /admin/oper/getroleinfo 接口
        // return getUserRoleInfo(loginName).then(roleRes => {
        //   const roleData = roleRes.data
        //   const roleinfoId = Array.isArray(roleData) && roleData.length > 0 ? roleData[0].roleInfoId : ''
        //   commit('SET_ROLEINFO_ID', roleinfoId)
        //   resolve()
        // })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    if (MOCK_LOGIN) {
      console.log('Mock getInfo, returning mock user data')
      const mockData = {
        user: {
          userId: 1,
          username: 'admin',
          realName: 'Mock User',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          introduction: 'Mock user for development'
        },
        roles: ['admin'],
        permissions: [],
        permissionList: []
      }
      commit('SET_ROLES', mockData.roles)
      commit('SET_NAME', mockData.user.realName)
      commit('SET_AVATAR', mockData.user.avatar)
      commit('SET_INTRODUCTION', mockData.user.introduction)
      return Promise.resolve(mockData)
    }
    return new Promise((resolve, reject) => {
      getUserInfo(state.login_name, state.roleinfoId).then(response => {
        let { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        // Backend returns nested structure: {user: {...}, roles: [...], permissions: [...]}
        // Extract fields from the nested structure
        const user = data.user || data || {}
        let roles = data.roles || []

        // Handle different role data formats
        // Format 1: Array of role objects [{roleInfoId: 1, roleName: "超级管理员"}, ...]
        if (roles.length > 0 && typeof roles[0] === 'object' && roles[0].roleName) {
          roles = roles.map(role => role.roleName)
        }
        // Format 2: Array of strings ["admin", "超级管理员"]
        else if (roles.length > 0 && typeof roles[0] === 'string') {
          roles = roles
        }
        // Format 3: Single role object
        else if (typeof roles === 'object' && !Array.isArray(roles) && roles.roleName) {
          roles = [roles.roleName]
        }
        // Format 4: Nested data structure {data: [...]} from some APIs
        else if (roles.data && Array.isArray(roles.data)) {
          roles = roles.data.map(role => role.roleName || role.name)
        }

        const name = user.realName || user.username || user.name || ''
        const avatar = user.avatar || ''
        const introduction = user.introduction || ''

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve({ ...data, roles })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes (Vue Router 4)
    accessRoutes.forEach(route => router.addRoute(route))

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
