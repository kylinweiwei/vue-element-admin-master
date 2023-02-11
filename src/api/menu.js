import http from '@/utils/request';
export default {
  /**
   * 查询权限菜单列表
   * @param params
   */
  async getMenuList(params){
    return await http.get("/api/permission/list",params);
  },
  /**
   * 获取上级菜单
   * @returns
   */
  async getParentMenuList(params) {
    return await http.get("/api/permission/parent/list", params)
  }
}
