import http from '@/utils/request'

/*
* 用户登录方式
* @param data
* @return
* */
export async function login(data) {
  return await http.login("/api/user/login", data);
}
/*
* 获取登陆用户信息
* @param data
* @return
* */
export async function getInfo() {
  return await http.get("/api/sysUser/getInfo");
}

/*
* 退出登录
* @return
* */
export async function logout(params) {
  return await http.post("/api/sysUser/logout", params)
}
/**
 * 获取用户菜单数据
 */
export async function getMenuList(){
  return await http.get("/api/sysUser/getMenuList");
}
export default {
  /**
   * 查询用户列表
   * @param params
   * @returns
   */
  async getUserList(params){
    return await http.get("/api/user/list",params);
  },
  /**
   * 添加用户
   * @param params
   * @returns
   */
  async addUser(params){
    return await http.post("/api/user/add",params);
  },
  /*
  * 修改用户
  * @param params
  *@returns
  * */
  async updateUser(params){
    return await http.put("/api/user/update", params);
  }
}
