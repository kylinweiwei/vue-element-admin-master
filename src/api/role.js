// import request from '@/utils/request'
//
// export function getRoutes() {
//   return request({
//     url: '/vue-element-admin/routes',
//     method: 'get'
//   })
// }
//
// export function getRoles() {
//   return request({
//     url: '/vue-element-admin/roles',
//     method: 'get'
//   })
// }
//
// export function addRole(data) {
//   return request({
//     url: '/vue-element-admin/role',
//     method: 'post',
//     data
//   })
// }
//
// export function updateRole(id, data) {
//   return request({
//     url: `/vue-element-admin/role/${id}`,
//     method: 'put',
//     data
//   })
// }
//
// export function deleteRole(id) {
//   return request({
//     url: `/vue-element-admin/role/${id}`,
//     method: 'delete'
//   })
// }
import http from '@/utils/request'

export function getRoutes() {

}
/*
* 查询角色列表
* */
export async function getRoles(param) {
  return await http.get('/api/role/list', param);
}
/*
* 新增角色
* */
export async function addRole(data) {
  return await http.post('/api/role/add', data);
}
/*
* 修改角色
* */
export async function updateRole(data) {
  return await http.put('/api/role/update', data);
}
/*
* 检查角色是否被使用
* */
export async function checkRole(param) {
  return await http.getRestApi('/api/role/check', param);
}
/*
* 删除角色
* */
export async function deleteRole(params) {
  return await http.delete('/api/role/delete', params);
}
/**
 * 查询分配权限树列表
 * @returns
 */
export async function getAssignTree(params){
  return await http.get("/api/role/getAssignPermissionTree",params);
}
