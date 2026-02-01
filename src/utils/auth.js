import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  let token = Cookies.get(TokenKey)
  // In development, remove any existing mock tokens to ensure login page shows
  if (process.env.NODE_ENV === 'development' && token && token.startsWith('mock-token-')) {
    Cookies.remove(TokenKey)
    token = null
    console.log('Development mode: removed mock token')
  }
  return token
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
