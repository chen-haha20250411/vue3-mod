const TokenKey = 'token'

export function getToken() {
  let token = localStorage.getItem(TokenKey)
  // In development, remove any existing mock tokens to ensure login page shows
  if (process.env.NODE_ENV === 'development' && token && token.startsWith('mock-token-')) {
    localStorage.removeItem(TokenKey)
    token = null
    console.log('Development mode: removed mock token')
  }
  return token
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(TokenKey)
}
