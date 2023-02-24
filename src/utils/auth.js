import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
//定义token过期时间Key
const timeKey = "expireTime";

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
/*
* 设置token的过期时间
* */
export function setTokenTime(time){
  return sessionStorage.setItem(timeKey, time);
}
/*
* 获取token的过期时间
* */
export function getTokenTime(time){
  return sessionStorage.getItem(timeKey);
}
/*
* 清空token的过期时间
* */
export function removeTokenTime(time){
  return sessionStorage.setItem(timeKey, 0);
}
