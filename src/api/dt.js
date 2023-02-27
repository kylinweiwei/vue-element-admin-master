import http from '@/utils/request';
/*
* 查询列表
* */
export default {
    async getDtsApi(params){
        return await http.get("/api/wlw/listAll", params);
    }
}