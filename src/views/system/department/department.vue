<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form ref="searchForm" label-width="80px" :inline="true" size="small">
      <el-form-item>
        <el-input v-model="searchModel.departmentName" placeholder="请输入部门名称"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
        <el-button icon="el-icon-refresh-right">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAddWindow()">新增</el-button>
      </el-form-item>
    </el-form>
  <!--数据表格--><!--
    data属性：表格数据
    border属性：表格边框
    stripe属性：表格斑马线
    row-key属性：行数据key，用来优化Table的渲染
    default-expand-all属性：默认展开树形表格数
    tree-props属性：树形表格配置属性选型
  -->
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
      <el-table-column prop="departmentName" label="部门名称"/>
      <el-table-column prop="parentName" label="所属部门"/>
      <el-table-column prop="phone" label="部门电话"/>
      <el-table-column prop="address" label="部门地址"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            icon="el-icon-edit-outline"
            type="primary"
            @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete-solid"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加和修改窗口-->
    <system-dialog
      :title="deptDialog.title"
      :visible="deptDialog.visible"
      :width="deptDialog.width"
      :height="deptDialog.height"
      @onClose="onClose()"
      @onConfirm="onConfirm()">
      <div slot="content">
        <el-form
          :model="dept"
          ref="deptForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small">
          <el-form-item label="所属部门" prop="parentName">
            <el-input v-model="dept.parentName" :readonly="true" @click.native="openSelectDeptWindow()"></el-input>
          </el-form-item>
          <el-form-item label="部门名称" prop="departmentName">
            <el-input v-model="dept.departmentName"></el-input>
          </el-form-item>
          <el-form-item label="部门电话">
            <el-input v-model="dept.phone"></el-input>
          </el-form-item>
          <el-form-item label="部门地址">
            <el-input v-model="dept.address"></el-input>
          </el-form-item>
          <el-form-item label="序号">
            <el-input v-model="dept.orderNum"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
    <!--选择所属部门的窗口-->
    <system-dialog
      :title="parentDialog.title"
      :visible="parentDialog.visible"
      :width="parentDialog.width"
      :height="parentDialog.height"
      @onClose="onParentClose()"
      @onConfirm="onParentConfirm()">
      <div slot="content">
        <el-tree ref="parentTree"
                 :data="treeList"
                 node-key="id"
                 :props="defaultProps"
                 empty-text="暂无数据"
                 :highlight-current="true"
                 :default-expand-all="true"
                 :expand-on-click-node="false"
                 @node-click="handleNodeClick">
          <div class="customer-tree-node" slot-scope="{node,data}">
<!--判断当前节点的子节点是否为0-->
            <span v-if="data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
            <span v-else @click="changeIcon(data)">
              <svg-icon v-if="data.open" icon-class="add"></svg-icon>
              <svg-icon v-else icon-class="del"></svg-icon>
            </span>
            <span style="margin-left:3px">
              {{node.label}}
            </span>
          </div>
        </el-tree>
      </div>
    </system-dialog>
  </el-main>
</template>
<script>
//导入department脚本文件
import departmentApi from '@/api/department';
//导入对话框组件
import SystemDialog from '@/components/system/SystemDialog.vue';

 export default {
  name: 'department',
   //注册组件
   components:{
    SystemDialog
   },
  data() {
    return {
      searchModel: {
        departmentName:"", //部门名称
      },
      tableData:[], //表格数据
      deptDialog:{
        title:"",//窗口标题
        visible:false, //是否显示窗口
        width:560, //窗口的宽度
        height:170 //窗口的高度

      },
      dept:{
        id: "", //部门编号
        departmentName: "",//部门名称
        pid: "",//所属部门ID
        parentName: "",//所属部门名称
        phone: "",//电话
        address: "",//地址
        orderNum: "",// 序号
      },
      //表单验证的规则
      rules:{
        parentName: [{required: true, message: "请选择所属部门", trigger: "change"}],
        departmentName: [{required: true, message: "请输入部门名称", trigger: "blur"}],
      },
      //选择所属部门的属性
      parentDialog: {
        title:"选择所属部门窗口",//选择所属部门标题
        visible:false, //是否显示窗口
        width:300, //窗口的宽度
        height:400 //窗口的高度
      },
      treeList: [], //树形数据
      //树形组件默认属性值
      defaultProps: {
        children: 'children',
        label: 'departmentName'
      },
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
      let res = await departmentApi.getDepartmentList(this.searchModel);
      if (res.success){
        //获取数据
        this.tableData = res.data;
      }
    },
   openAddWindow(){
      //清空表单数据
     this.$resetForm("deptForm", this.dept);
      //设置窗口的属性
     this.deptDialog.title="新增窗口";
     this.deptDialog.visible=true;
   },
    /*
      * 窗口的关闭事件
      * */
    onClose(){
      this.deptDialog.visible=false;
    },
    /*
      * 窗口确认事件
      * */
    onConfirm(){

    },
    /*
    * 打开选择所属部门的窗口
    * */
    async openSelectDeptWindow(){
      //显示属性
      this.parentDialog.visible=true;
      //查询所属部门列表
      let res = await departmentApi.getParentTreeList();
      //判断是否成功
      if (res.success){
        this.treeList = res.data;
      }
    },
    /*
    * 点击树节点的加减号时触发
    * */
    changeIcon(data){
      //修改折叠状态
      data.open = !data.open;
      this.$refs.parentTree.store.nodesMap[data.id].expanded = !data.open;
    },
    /*
    * 树节点点击事件
    * */
    handleNodeClick(data){
      //将选中的部门复制给dept对象
      this.dept.id = data.id;
      this.dept.parentName = data.departmentName;
    },
    /*
    * 选择所属部门的关闭事件
    * */
    onParentClose(){
      this.parentDialog.visible = false;
    },
    /*
   * 选择所属部门的确认事件
   * */
    onParentConfirm(){
      this.parentDialog.visible = false;
    }
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
