import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
//导入auth.js脚本
import { getToken, setToken, clearStorage, setTokenTime, getTokenTime, removeTokenTime } from '@/utils/auth'
//导入qs依赖
import qs from 'qs'
// create an axios instance 创建axios异步请求实列
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 15000 // request timeout 请求超时时间
})
//导入刷新token的API脚本
import {refreshTokenApi} from "@/api/user";
import {error} from "autoprefixer/lib/utils";

/*
* 刷新Token
* */
function refreshTokenInfo(){
  //设置请求参数
  let params = {
    token:getToken()
  }
  return refreshTokenApi(params).then(res=>res);
}
//定义变量是否刷新Token
let isRefresh = false;

// request interceptor 请求前拦截
service.interceptors.request.use(
  config => {
    //获取当前系统时间
    let currentTime = new Date().getTime();
    //获取Token的过期时间按
    let expireTime = getTokenTime();
    //判断token是否过期
    if (expireTime>0){
      //计算过期时间
      let min = (expireTime - currentTime) /1000 /60;
      //如果TOken里过期时间相差十分，自动刷新token
      if (min < 10){
        //判断是否刷新
        if (!isRefresh){
          //修改刷新状态
          isRefresh = true;
          //刷新token的方法调用
          return refreshTokenInfo().then(res => {
            //判断是否成功
            if (res.success){
              //设置新的token和新的过期时间
              setToken(res.data.token);
              setTokenTime(res.data.expireTime);
              //将刷新的token添加到headers中
              config.headers.token = getToken();
            }
            //返回配置
            return config;
          }).catch(error =>{

          }).finally(()=>{
            //修改token的状态
            isRefresh = false;
          })
        }
      }
    }
    console.log(config)
    // do something before request is sent 判断store中实现存在token
    if (store.getters.token) {
      //读取token信息，并将token添加到headers头部信息中
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    //清空sessionStorage
    clearStorage();
    //清空Token的过期时间按
    removeTokenTime();
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
// response interceptor 响应式拦截
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return response => response
   */
  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    //获取后端返回的数据
    const res = response.data
    // if the custom code is not 20000, it is judged as an error. 如果后端返回的状态码不是200，则提示错误信息
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login 重新登录
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again:用户信息登录过期，请重新登录', 'Confirm logout:系统提示', {
          confirmButtonText: '登录',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          //清空sessionStorage
          clearStorage();
          //清空Token的过期时间按
          removeTokenTime();
          location.reload()
        })
      })
    }
    return Promise.reject(new Error(res.message || 'Error'))
  } else {
      return res
  }
},
error => {
  console.log('err' + error) // for debug
  //清空sessionStorage
  clearStorage();
  //清空Token的过期时间按
  removeTokenTime();
  Message({
    message: error.message,
    type: 'error',
    duration: 5 * 1000
  })
  return Promise.reject(error)
}
)
//请求方法
const http = {
  //psot请求提交
  post(url, params) {
    return service.post(url, params, {
      transformRequest: [(params) => {
        return JSON.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  //put请求
  put(url, params) {
    return service.put(url, params, {
      transformRequest: [(params) => {
        return JSON.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  //get请求
  get(url, params) {
    return service.get(url, {
      params: params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      }
    })
  },
  //rest风格的请求
  getRestApi(url, params) {
    let _params
    if (Object.is(params, undefined || null)) {
      _params = ''
    } else {
      _params = '/'
      for (const key in params) {
        console.log(key)
        console.log(params[key])
        if (params.hasOwnProperty(key) && params[key] !== null && params[key]
          !== '') {
          _params += `${params[key]}/`
        }
      }
      _params = _params.substr(0, _params.length - 1)
    }
    console.log(_params)
    if (_params) {
      return service.get(`${url}${_params}`)
    } else {
      return service.get(url)
    }
  },
  //删除请求
  delete(url, params) {
    let _params
    if (Object.is(params, undefined || null)) {
      _params = ''
    } else {
      _params = '/'
      for (const key in params) {
        // eslint-disable-next-line no-prototype-builtins
        if (params.hasOwnProperty(key) && params[key] !== null && params[key]
          !== '') {
          _params += `${params[key]}/`
        }
      }
      _params = _params.substr(0, _params.length - 1)
    }
    if (_params) {
      return service.delete(`${url}${_params}`).catch(err => {
        message.error(err.msg)
        return Promise.reject(err)
      })
    } else {
      return service.delete(url).catch(err => {
        message.error(err.msg)
        return Promise.reject(err)
      })
    }
  },
  //文件上传
  upload(url, params) {
    return service.post(url, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
  })
  },
  //登录请求
  login(url, params) {
    return service.post(url, params, {
      transformRequest: [(params) => {
        return qs.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}
export default http
