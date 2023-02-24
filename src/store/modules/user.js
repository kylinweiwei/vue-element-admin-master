import {login, logout, getInfo} from '@/api/user'
import {
  getToken,
  setToken,
  removeToken,
  setTokenTime //设置Token过期时间
} from '@/utils/auth'
import router, {resetRouter} from '@/router'

const state = {
  token: getToken(),//获取token信息
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  //设置token
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  //设置个人介绍
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  //设置用户姓名
  SET_NAME: (state, name) => {
    state.name = name
  },
  //设置用户头像
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  //设置用户角色
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  //将用用户ID保存到store中
  SET_USERUID: (state, userId) => {
    state.userId = userId
  }
}

const actions = {
  // user login 用户登录
  login({commit}, userInfo) {
    //从用户信息中解构出用户名和密码
    const {username, password} = userInfo
    return new Promise((resolve, reject) => {
      //传递用户名和密码参数
      login({username: username.trim(), password: password}).then(response => {
        //解构出后端返回的数据
        const {
          token, //token数据
          expireTime //token过期时间
        } = response
        //将返回的token信息保存到store
        commit('SET_TOKEN', token)
        //设置token
        setToken(token)
        //设置过期时间
        setTokenTime(expireTime);
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({commit, state}) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const {data} = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }
        //从后端返回的data数据中结构出用户相关的信息
        const {roles, name, avatar, introduction, id} = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        //将用户信息保存到Vues中
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_USERUID', id); //用户ID
        //将权限字段保存到sessionStorage中
        sessionStorage.setItem("codeList", JSON.stringify(roles));
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({commit, state, dispatch}) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, {root: true})

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({commit}) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({commit, dispatch}, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const {roles} = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, {root: true})
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, {root: true})
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
