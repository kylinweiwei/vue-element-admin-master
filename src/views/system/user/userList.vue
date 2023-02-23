<template>
  <el-container :style="{ height: containerHeight + 'px' }">
    <!-- 左侧部门树形菜单列表 -->
    <el-aside
      style="
      padding: 10px 0 0 0;
      background: #fff;
      border-right: 1px solid #dfe6ec;
      "
      width="220px"
    >
      <el-tree
        style="font-size: 14px"
        ref="leftTree"
        :data="deptList"
        node-key="id"
        :props="defaultProps"
        default-expand-all
        empty-text="暂无数据"
        :show-checkbox="false"
        :highlight-current="true"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <div class="custom-tree-node" slot-scope="{ node, data }">
          <div>
            <span v-if="data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
            <span v-else @click.stop="changeIcon(data)">
              <svg-icon v-if="data.open" icon-class="add"/>
              <svg-icon v-else icon-class="del"/>
            </span>
            <!-- 名称 -->
            <span style="margin-left: 3px">{{ node.label }}</span>
          </div>
        </div>
      </el-tree>
    </el-aside>
    <!-- 右侧用户数据 -->
    <!-- 表格数据 -->
    <el-main>
      <!-- 查询条件 -->
      <el-form
        :model="searchModel"
        ref="searchForm"
        label-width="80px"
        :inline="true"
        size="small"
      >
        <el-form-item>
          <el-input v-model="searchModel.username" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.realName" placeholder="请输入真实姓名"/>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.phone" placeholder="请输入电话"/>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" type="primary" @click="search(departmentId, pageNo, pageSize)">查询
          </el-button>
          <el-button icon="el-icon-delete" @click="resetValue()">重置</el-button>
          <el-button icon="el-icon-plus" size="small" type="success" @click="openAddWindow()">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- 用户表格数据 -->
      <el-table
        :height="tableHeight"
        :data="userList"
        border
        stripe
        style="width: 100%; margin-bottom: 10px"
      >
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="realName" label="姓名"></el-table-column>
        <el-table-column prop="departmentName" label="所属部门"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column align="center" width="290" label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button icon="el-icon-delete" type="danger"
                       size="mini" @click="handleDelete(scope.row)">删除
            </el-button>
            <el-button icon="el-icon-setting" type="primary"
                       size="mini" @click="assignRole(scope.row)">分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页工具栏 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNo"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加和编辑用户窗口 -->
      <system-dialog
        :title="userDialog.title"
        :height="userDialog.height"
        :width="userDialog.width"
        :visible="userDialog.visible"
        @onClose="onClose"
        @onConfirm="onConfirm"
      >
        <div slot="content">
          <el-form
            :model="user"
            ref="userForm"
            :rules="rules"
            label-width="80px"
            :inline="true"
            size="small"
          >
            <el-form-item prop="username" label="用户名">
              <el-input v-model="user.username"></el-input>
            </el-form-item>
            <el-form-item prop="password" v-if="user.id === ''" label="密码">
              <el-input type="password" v-model="user.password"></el-input>
            </el-form-item>
            <el-form-item prop="departmentName" label="所属部门">
              <el-input
                v-model="user.departmentName"
                :readonly="true"
                @click.native="selectDepartment()"
              ></el-input>
            </el-form-item>
            <el-form-item prop="realName" label="姓名">
              <el-input v-model="user.realName"></el-input>
            </el-form-item>
            <el-form-item prop="phone" label="电话">
              <el-input v-model="user.phone"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="user.nickName"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="user.email"></el-input>
            </el-form-item>
            <el-form-item prop="gender" label="性别">
              <el-radio-group v-model="user.gender">
                <el-radio :label="0">男</el-radio>
                <el-radio :label="1">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <br>
            <!-- 用户头像：待补充 -->
          </el-form>
        </div>
      </system-dialog>
      <!-- 所属部门弹框 -->
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
            ref="parentTree"
            :data="parentList"
            default-expand-all
            node-key="id"
            :props="parentProps"
            :show-checkbox="false"
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="parentClick"
          >
            <div class="customer-tree-node" slot-scope="{ node, data }">
              <span v-if="data.children.length == 0">
                <i class="el-icon-document"/>
              </span>
              <span v-else @click.stop="openParentBtn(data)">
              <svg-icon v-if="data.open" icon-class="add"/>
              <svg-icon v-else icon-class="del"/>
              </span>
              <span style="margin-left: 3px">{{ node.label }}</span>
            </div>
          </el-tree>
        </div>
      </system-dialog>
    </el-main>
  </el-container>
</template>
<script>
//导入部门api脚本
import departmentApi from '@/api/department';
import userApi from '@/api/user';
import SystemDialog from "@/components/system/SystemDialog";

export default {
  name: 'userList',
  components: {
    SystemDialog,
  },
  data() {
    //自定义验证规则
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入手机号码"));
        //使用正则表达式进行验证手机号码
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error("手机号格式不正确"));
      } else {
        callback();
      }
    };
    return {
      containerHeight: 0, //容器高度
      deptList: [], //左侧部门树形菜单列表
      //树节点属性
      defaultProps: {
        children: 'children',
        label: 'departmentName'
      },
      //查询对象
      searchModel: {
        username: "",
        realName: "",
        departmentId: "",
        phone: "",
        pageNo: 1,
        pageSize: 10,
      },
      tableHeight: 0, //表格的高度
      userList: [], //用户列表
      pageNo: 1,//当前页码
      pageSize: 10,//每页显示的数量
      total: 0,//总数
      departmentId: "",//部门编号
      //添加和修改用户窗口属性
      userDialog: {
        title: '',
        height: 410,
        width: 610,
        visible: false
      },
      //用户对象
      user: {
        id: '',
        departmentId: '',
        departmentName: '',
        email: '',
        realName: '',
        phone: '',
        nickName: '',
        password: '',
        username: '',
        gender: '',
        avatar: ''
      },
      rules: {
        departmentName: [{
          required: true, trigger: 'change', message: '请选择所属部门'
        }],
        realName: [{required: true, trigger: 'blur', message: '请填写姓名'}],
        phone: [{trigger: 'blur', validator: validatePhone}],
        username: [{required: true, trigger: 'blur', message: '请填写登录名'}],
        password: [{required: true, trigger: 'blur', message: '请填写登录密码'}],
        gender: [{required: true, trigger: 'change', message: '请选择性别'}]
      },
      //选择所属部门窗口属性
      parentDialog: {
        title: '选择所属部门',
        width: 300,
        height: 450,
        visible: false
      },
      //树节点属性
      parentProps: {
        children: 'children',
        label: 'departmentName'
      },
      parentList: [], //所属部门节点数据
    }
  },
  methods: {
    /**
     * 新增或编辑取消事件
     */
    onClose() {
      this.userDialog.visible = false //关闭窗口
    },
    /**
     * 新增或编辑确认事件
     */
    onConfirm() {
      //表单验证
      this.$refs.userForm.validate( async (valid) => {
        //如果验证通过
        if (valid) {
          let res = null;
          //判断当前是新增还是修改
          if (this.user.id === ""){
            //发送添加请求
            res = await userApi.addUser(this.user);
          }else {
            //发送修改请求
            res = await userApi.updateUser(this.user);
          }
          //判断是否成功
          if(res.success){
            //提示
            this.$message.success(res.message);
            //刷新
            this.search(this.departmentId);
            //关闭窗口
            this.userDialog.visible = false;
          }else {
            //提示
            this.$message.error(res.message);
          }
        }
      })
    },
    /**
     * 打开选择所属部门窗口
     */
    async selectDepartment() {
      //发送查询请求
      let res = await departmentApi.getParentTreeList();
      //判断是否成功
      if (res.success){
        this.parentList = res.data;
      }
      //显示窗口
      this.parentDialog.visible = true;
    },
    /**
     * 选择上级部门取消事件
     */
    onParentClose() {
      this.parentDialog.visible = false //关闭窗口
    },
    /**
     * 选择上级部门确认事件
     */
    onParentConfirm() {
      this.parentDialog.visible = false
    },
    //上级部门树节点点击事件
    parentClick(data) {
      this.user.departmentId = data.id
      this.user.departmentName = data.departmentName
    },
    //上级部门树加号 减号 图标点击事件
    openParentBtn(data) {
      data.open = !data.open
      this.$refs.parentTree.store.nodesMap[data.id].expanded = !data.open
    },
    /**
     * 查询部门列表
     */
    async getDeptList() {
      //发送查询请求
      let res = await departmentApi.getDepartmentList();
      //判断是否成功
      if (res.success) {
        this.deptList = res.data;
        //懒加载默认第一条数据的节点
        this.$nextTick(() => {
          const firstNode = document.querySelector(".el-tree-node");
          firstNode.click();
        })
      }
    },
    /**
     * 左侧树节点点击事件
     */
    handleNodeClick(data) {
      //将当前选择的节点Id赋值给department
      this.departmentId = data.id;
      //查询用户信息
      this.search(this.departmentId);
    },
    //加减号图标点击事件
    changeIcon(data) {
      //修改折叠展开状态
      data.open = !data.open
      this.$refs.leftTree.store.nodesMap[data.id].expanded = !data.open;
    },
    /*
    *当当前页发生变化时候触发
    * */
    handleCurrentChange(page) {
      this.pageNo = page;
      //查询
      this.search(this.departmentId, page, this.pageSize);
    },
    handleSizeChange(size) {
      //当每页数量发生变化时候触发
      this.pageSize = size;
      //查询
      this.search(this.departmentId, this.pageNo, size);
    },
    /*
    * 修改窗口
    * */
    handleEdit(row){
      //数据回显
      this.$objCopy(row, this.user);
      //设置弹窗属性
      this.userDialog.title = "编辑用户";
      this.userDialog.visible = true;
    },
    /*
    * 重置
    * */
    resetValue() {
      this.searchModel.username = "";
      this.searchModel.realName = "";
      this.searchModel.departmentId = "";
      this.searchModel.pageNo = 1;
      this.searchModel.pageSize = 10;
      //调用方法
      this.search(this.departmentId);
    },
    /*
    * 新增
    * */
    openAddWindow() {
      //清空表单数据
      this.$resetForm('userForm', this.user);
      //设置窗口标题
      this.userDialog.title = "新增窗口";
      //设置显示窗口
      this.userDialog.visible = true;
    },
    /*
    * 查询用户列表
    * */
    async search(departmentId, pageNo = 1, pageSize = 10) {
      //将查询条件交给search Model对象
      this.searchModel.departmentId = departmentId;
      this.searchModel.pageNo = pageNo;
      this.searchModel.pageSize = pageSize;
      //发生查询请求
      let res = await userApi.getUserList(this.searchModel);
      //判断是否成功
      if (res.success) {
        //赋值
        this.userList = res.data.records;
        this.total = res.data.total;
      }
    },
  },
  created() {
    //查询部门列表
    this.getDeptList();
    //调用查询用户信息的方法
    this.search(this.departmentId);
  },
  mounted() {
    this.$nextTick(() => {
      //内容高度
      this.containerHeight = window.innerHeight - 85;
      //表格高度
      this.tableHeight = window.innerHeight - 220;
    })
  },
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
