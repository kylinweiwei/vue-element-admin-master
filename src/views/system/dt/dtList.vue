<template>
    <el-main>
      <el-table
        :data="tableData"
        style="width: 100%;margin-bottom: 20px;"
        row-key="id"
        border
        stripe
        default-expand-all
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <!-- prop属性：填写数据的属性名称 -->
        <!-- label属性：表格表头标题 -->
        <el-table-column prop="tem" label="温度"/>
        <el-table-column prop="hum" label="湿度"/>
      </el-table>
    </el-main>
  </template>
  <script>
  //导入department脚本文件
  import dtApi from '@/api/dt';

  export default {
    name: 'dtList',
    data() {
      return {
        tableData:[], //表格数据
      };
    },
    //初始化时执行
    created() {
      //调用查询部门列表方法
      this.search();
    },
    methods: {
      async search(){
        //发送查询请求
        let res = await dtApi.getDtsApi();
        if (res.success){
          //获取数据
          this.tableData = res.data;
        }
      },
    }
  }
  </script>
  <style lang="scss" scoped>
    ::v-deep .el-tree {
    .el-tree-node {
      position: relative;
      padding-left: 10px;
    }
    .el-tree-node__children {
    padding-left: 20px;
  }
    .el-tree-node :last-child:before {
      height: 40px;
    }
    .el-tree > .el-tree-node:before {
      border-left: none;
    }
    .el-tree > .el-tree-node:after {
      border-top: none;
    }
    .el-tree-node:before,
    .el-tree-node:after {
      content: "";
      left: -4px;
      position: absolute;
      right: auto;
      border-width: 1px;
    }
    .tree :first-child .el-tree-node:before {
      border-left: none;
    }
    .el-tree-node:before {
      border-left: 1px dotted #d9d9d9;
      bottom: 0px;
      height: 100%;
      top: -25px;
      width: 1px;
    }
    .el-tree-node:after {
      border-top: 1px dotted #d9d9d9;
      height: 20px;
      top: 14px;
      width: 24px;
    }
    .el-tree-node__expand-icon.is-leaf {
      width: 8px;
    }
    .el-tree-node__content > .el-tree-node__expand-icon {
      display: none;
    }
    .el-tree-node__content {
      line-height: 30px;
      height: 30px;
      padding-left: 10px !important;
    }
  }
  ::v-deep .el-tree > div {
    &::before {
      display: none;
    }
    &::after {
      display: none;
    }
  }
  </style>
  