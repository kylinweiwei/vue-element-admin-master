<template>
  <el-main>
    <!-- 新增按钮 -->
    <el-button
      type="success"
      size="small"
      @click="openAddWindow()"
      icon="el-icon-plus"
    >新增</el-button
    >
    <!-- 数据表格 -->
    <el-table
      :data="menuList"
      :height="tableHeight"
      style="width: 100%; margin-top: 20px"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="label" label="菜单名称"></el-table-column>
      <el-table-column prop="type" label="菜单类型" align="center">
        <template slot-scope="scope">
          <el-tag size="normal" v-if="scope.row.type === 0">目录</el-tag>
          <el-tag size="normal" type="success" v-else-if="scope.row.type === 1">菜单</el-tag>
          <el-tag size="normal" type="warning" v-else>按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="菜单图标" align="center">
        <template slot-scope="scope">
          <i :class="scope.row.icon" v-if="scope.row.icon.includes('el-icon')"></i>
          <svg-icon v-else :icon-class="scope.row.icon"></svg-icon>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="路由名称"></el-table-column>
      <el-table-column prop="path" label="理由地址"></el-table-column>
      <el-table-column prop="url" label="组件路径"></el-table-column>
      <el-table-column label="操作" align="center">
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
<!--    新增或修改的窗口-->
    <system-dialog
    :title="menuDialog.title"
    :visible="menuDialog.visible"
    :width="menuDialog.width"
    :height="menuDialog.height"
    @onClose="onClose()"
    @onConfirm="onConfirm()">
      <div slot="content">
        <el-form :model = "menu" ref="menuForm" :rules="rules" label-width="80px" :inline="true" size="small">
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="menu.type">
              <el-radio :label="0">目录</el-radio>
              <el-radio :label="1">菜单</el-radio>
              <el-radio :label="2">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          </el-col>
          <el-form-item label="所属菜单" size="small" prop="parentName">
            <el-input v-model="menu.parentName" :readonly="true" @click.native="selectParentMenu()"></el-input>
          </el-form-item>
          <el-form-item label="菜单名称" size="small" prop="label">
            <el-input v-model="menu.label"></el-input>
          </el-form-item>
          <el-form-item label="路由名称" size="small" prop="name" v-if="menu.type == 1">
            <el-input v-model="menu.name"></el-input>
          </el-form-item>
          <el-form-item label="路由地址" size="small" prop="path" v-if="menu.type != 2 ">
            <el-input v-model="menu.path"></el-input>
          </el-form-item>
          <el-form-item label="组件路径" size="small" prop="url" v-if="menu.type == 1">
            <el-input v-model="menu.url"></el-input>
          </el-form-item>
          <el-form-item label="权限字段" size="small" prop="code">
            <el-input v-model="menu.code"></el-input>
          </el-form-item>
          <el-form-item label="菜单图标" size="small">
            <my-icon @selection="setIcon" ref="child"></my-icon>
          </el-form-item>
          <el-form-item label="菜单序号" size="small">
            <el-input v-model="menu.orderNum"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
    <!-- 选择上级所属菜单弹框 -->
    <system-dialog
      :title="parentDialog.title"
      :width="parentDialog.width"
      :height="parentDialog.height"
      :visible="parentDialog.visible"
      @onClose="onParentClose"
      @onConfirm="onParentConfirm"
    >
      <div slot="content">
      <el-tree
      style="font-size: 14px"
      ref="parentTree"
      :data="parentMenuList"
      node-key="id"
      :props="defaultProps"
      empty-text="暂无数据"
      :show-checkbox="false"
      default-expand-all
      :highlight-current="true"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      >
      <div class="customer-tree-node" slot-scope="{ node, data }">
      <!-- 长度为0说明没有下级 -->
      <span v-if="data.children.length == 0">
<i class="el-icon-document" style="color: #8c8c8c; font-size: 18px"/>
</span>
      <span v-else @click.stop="changeIcon(data)">
<svg-icon v-if="data.open" icon-class="add"/>
<svg-icon v-else icon-class="del"/>
</span>
      <span style="margin-left: 3px">{{ node.label }}</span>
      </div>
      </el-tree>
      </div>
    </system-dialog>
  </el-main>
</template>

<script>
//导入menu.js脚本文件
import menuApi from '@/api/menu';
//导入对话框组件
import SystemDialog from "@/components/system/SystemDialog";
// //导入自定义的icon图标库
// import { elementIcons } from "@/utils/icons";
//导入封装组件库
import MyIcon from "@/components/system/MyIcon";
import departmentApi from "@/api/department";

export default {
  name: "menuList",
  components: {MyIcon, SystemDialog},
  //注册组件
  comments: {
    SystemDialog,
    MyIcon
  },
  data() {
    return {
      menuList: [], //数据列表
      tableHeight: 0, //表格高度
      //窗口属性
      menuDialog: {
        title: "新增菜单",
        visible: false,
        width:630,
        height:270
      },
      //菜单属性
      menu: {
        id: "",
        type: "",
        parentId: "",
        parentName: "",
        label: "",
        icon: "",
        name: "",
        path: "",
        url: "",
        code: "",
        orderNum: "",
      },
    rules: {
      type: [{ required: true, trigger: "change", message: "请选择菜单类型" }],
        parentName: [{ required: true, trigger: "change", message: "请选择所属菜单"
      }],
        label: [{ required: true, trigger: "blur", message: "请输入菜单名称" }],
        name: [{ required: true, trigger: "blur", message: "请输入路由名称" }],
        path: [{ required: true, trigger: "blur", message: "请输入路由路径" }],
        url: [{ required: true, trigger: "blur", message: "请输入组件路径" }],
        code: [{ required: true, trigger: "blur", message: "请输入权限字段" }],
      },
      //上级菜单弹框属性
      parentDialog: {
        title: '选择所属菜单',
        width: 280,
        height: 450,
        visible: false
      },
      //树属性定义
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      parentMenuList: [], //所属菜单列表
      // iconList: [],//图标列表
      // userChooseIcon: "", //用户选中的图标
    };
  },
  //初始化时调用
  created() {
    //查询菜单列表
    this.search();
    // //调用获取图标列表
    // this.getIconList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 180;
    });
  },
  methods: {
    /*
    * 查询菜单列表
    * */
    async search() {
      /*发送查询请求*/
      let res = await menuApi.getMenuList();
      /*判断是否成功*/
      if (res.success){
        this.menuList = res.data;
      }
    },
    /**
     * 打开新增窗口
     */
    openAddWindow() {
      //清空表单数据
      this.$resetForm("menuForm", this.menu);
      // //清空图标选择器
      // this.userChooseIcon = "";
      this.$nextTick(() =>{
        this.$refs.child.userChooseIcon = "";
      });
      //设置窗口的标题
      this.menuDialog.title = "新增菜单";
      //显示窗口
      this.menuDialog.visible = true;
    },
    /*
    * 选择所属菜单
    * */
    async selectParentMenu(){
      //显示窗口
      this.parentDialog.visible = true;
      //发送请求
      let res = await menuApi.getParentMenuList()
      //判断是否成功
      if (res.success){
        this.parentMenuList = res.data;
      }
    },
    /**
     * 选择所属菜单取消事件
     */
    onParentClose() {
      this.parentDialog.visible = false //关闭窗口
    },
    /**
     * 选择所属菜单确认事件
     */
    onParentConfirm() {
      this.parentDialog.visible = false //关闭窗口
    },
    changeIcon(data) {
      //修改折叠状态
      data.open = !data.open;
      this.$refs.parentTree.store.nodesMap[data.id].expanded = !data.open;
    },
    /**
     * 所属菜单节点点击事件
     */
    handleNodeClick(data) {
      //所属父级菜单ID
      this.menu.parentId = data.id;
      //所属父级菜单名称
      this.menu.parentName = data.label;
    },
    // /*
    // * 查询图标的列表
    // * */
    // getIconList(){
    //   this.iconList = elementIcons;
    // },
    /*
    * 设置选中的图标
    * */
    setIcon(icon){
      // this.userChooseIcon = icon; //将I的央视设为选中的央视el-icon-xx
      this.menu.icon = icon;
    },
    /*
    *关闭取消按钮
    * */
    onClose(){
      //关闭创库
      this.menuDialog.visible = false;
    },
    /*
    *确认按钮的点击事件
    * */
    onConfirm(){
      //表单验证
      this.$refs.menuForm.validate( async (valid) => {
        //验证通过
        if (valid) {
          let res = null;
          //判断菜单ID是否为空则是增加否则是修改
          if (this.menu.id === "") {
            //发送添加请求
            res = await menuApi.addMenu(this.menu);
          } else {
            //发送修改请求
            res = await menuApi.updateMenu(this.menu);
          }
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message);
            //刷新
            this.search();
            //关闭窗口
            this.menuDialog.visible = false;
          } else {
            this.$message.error(res.message);
          }
        }
      })
    },
    /*
    * 打开编辑菜单的窗口
    * */
    handleEdit(row){
      //数据回显
      this.$objCopy(row, this.menu);
      //回显图标
      this.$nextTick(() => {
        this.$refs.child.userChooseIcon = row.icon;
      });
      //设置窗口标题
      this.menuDialog.title = "编辑菜单";
      //显示窗口
      this.menuDialog.visible = true;
    },
    /*
    * 删除菜单
    * */
    async handleDelete(row){
      //查询菜单下是否存在子部门或用户
      let result = await menuApi.checkPermission({id: row.id});
      //判断是否可以删除
      if (!result.success) {
        //提示不能删除
        this.$message.warning(result.message);
      } else {
        //确认是否删除
        let confirm = await this.$myconfirm("确认要删除该数据吗？");
        if (confirm) {
          //发送请求删除
          let res = await menuApi.deleteById({id: row.id});
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message);
            //刷新
            this.search();
          } else {
            this.$message.error(res.message);
          }
        }
      }
    }
  }
};

</script>

<style lang="scss" scoped>
.iconList {
  width: 400px;
  height: 300px;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  i {
    display: inline-block;
    width: 60px;
    height: 45px;
    color: #000000;
    font-size: 20px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    line-height: 45px;
    margin: 5px;
    &:hover {
      color: orange;
      border-color:orange;
      }
  }
}
.chooseIcons{
  width: 175px;
  background-color: #FFFFFF;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 33px;
  line-height: 25px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
</style>
