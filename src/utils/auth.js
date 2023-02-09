import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

/**
 * 清空sessionStorage
 */
export function clearStorage(){
  return sessionStorage.clear();
}

/*
* 获取token
* @param token
* @return
* */
export function getToken() {
  return Cookies.get(TokenKey)
}

/*
* 设置token
* @param token
* @return
* */
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

/*
* 删除token
* @param token
* @return
* */
export function removeToken() {
  return Cookies.remove(TokenKey)
}
