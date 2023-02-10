import http from '@/utils/request';

export default {
  /**
    查询部门列表
    @param params
   @returns
   */
  async getDepartmentList(param) {
    return await http.get("/api/department/list", param);
  },
  /**
   * 获取所属部门列表
   */
  async getParentTreeList() {
    return await http.get("/api/department/parent/list");
  },
  /*
  * 新增部门
  * @return
  * */
  async addDept(params) {
    return await http.post("/api/department/add", params);
  },
  /*
 * 修改部门
 * @return
 * */
  async updateDept(params) {
    return await http.put("/api/department/update", params);
  },
  /**
   * 检查部门下是否存在子菜单
   */
  async checkDepartment(params) {
    return await http.getRestApi("/api/department/check", params);
  },
  /**
   * 删除部门
   * @returns
   */
  async deleteById(params) {
    return await http.delete("/api/department/delete", params);
  }
}
