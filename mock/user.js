
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

module.exports = [
  // user login
  {
    url: '/vue-element-admin/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/vue-element-admin/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-element-admin/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // admin login (for actual API)
  {
    url: '/admin/login',
    type: 'post',
    response: config => {
      const { userName, password } = config.body
      // Decode base64 username/password
      let username, pass
      try {
        username = atob(userName)
        pass = atob(password)
      } catch (e) {
        username = userName
        pass = password
      }
      
      const token = tokens[username]
      
      // mock error
      if (!token) {
        return {
          success: false,
          errcode: '000001',
          msg: 'Account and password are incorrect.'
        }
      }

      return {
        success: true,
        data: token
      }
    }
  },

  // admin captcha
  {
    url: '/admin/captcha',
    type: 'post',
    response: _ => {
      // 生成4位随机数字验证码
      const chars = '0123456789'
      let captcha = ''
      for (let i = 0; i < 4; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      // 生成简单的SVG验证码图片
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="44" viewBox="0 0 120 44">
        <rect fill="#f5f7fa" width="120" height="44"/>
        <text x="10" y="32" font-family="Arial" font-size="24" font-weight="bold" fill="#667eea">${captcha}</text>
        <line x1="0" y1="10" x2="120" y2="10" stroke="#ddd" stroke-width="1"/>
        <line x1="0" y1="30" x2="120" y2="30" stroke="#ddd" stroke-width="1"/>
      </svg>`
      
      // 使用btoa替代Buffer
      const base64Img = 'data:image/svg+xml;base64,' + btoa(svg)
      
      return {
        success: true,
        data: {
          uucode: 'mock-' + Date.now(),
          img: base64Img
        }
      }
    }
  },

  // admin sendmms
  {
    url: '/admin/sendmms',
    type: 'post',
    response: config => {
      try {
        const userName = config.query && config.query.userName
        return {
          success: true,
          msg: '验证码已发送',
          data: 'mock-oldyzmuuid-' + Date.now()
        }
      } catch (error) {
        return {
          success: false,
          msg: error.message,
          data: null
        }
      }
    }
  },

  // admin getUserInfo
  {
    url: '/admin/getUserInfo',
    type: 'get',
    response: _ => {
      return {
        success: true,
        data: {
          roles: ['admin'],
          name: 'Super Admin',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          permissions: [
            {
              menuId: 1,
              menuName: '投标数据',
              menuURL: '#',
              subMenuList: [
                {
                  menuId: 2,
                  menuName: '招标信息',
                  menuURL: 'biddingInfo/list'
                }
              ]
            }
          ],
          permissionList: ['oper/list', 'zhongbiao/list']
        }
      }
    }
  },

  // admin logout
  {
    url: '/admin/logout',
    type: 'post',
    response: _ => {
      return {
        success: true,
        data: 'success'
      }
    }
  },

  // admin checkPwd
  {
    url: '/admin/checkPwd',
    type: 'get',
    response: _ => {
      return {
        success: true,
        data: true
      }
    }
  }
]
