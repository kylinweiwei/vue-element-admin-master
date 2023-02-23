<template>
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
        <el-input v-model="searchModel.roleName" placeholder="请输入角色名称"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search(pageNo,pageSize)">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="resetValue()">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAddWindow()">新增</el-button>
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      :data="roleList"
      :height="tableHeight"
      border
      stripe
      style="width: 100%; margin-bottom: 10px"
    >
      <el-table-column
        prop="id"
        label="角色编号"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column prop="roleCode" label="角色编码"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="remark" label="角色备注"></el-table-column>
      <el-table-column label="操作" align="center" width="290">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-edit"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
          >编辑
          </el-button
          >
          <el-button
            icon="el-icon-delete"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >删除
          </el-button
          >
          <el-button
            icon="el-icon-setting"
            type="primary"
            size="small"
            @click="assignRole(scope.row)"
          >分配权限
          </el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页工具栏 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNo"
      :page-sizes="[2, 4, 6, 8, 10]"
      :page-size="2"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 添加和修改角色窗口 -->
    <system-dialog
      :title="roleDialog.title"
      :visible="roleDialog.visible"
      :width="roleDialog.width"
      :height="roleDialog.height"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form
          :model="role"
          ref="roleForm"
          :rules="rules"
          label-width="80px"
          :inline="false"
          size="small"
        >
          <el-form-item label="角色编码" prop="roleCode">
            <el-input v-model="role.roleCode"></el-input>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="role.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input type="textarea" v-model="role.remark" :rows="5"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
    <!-- 分配权限树窗口 -->
    <system-dialog
      :title="assignDialog.title"
      :visible="assignDialog.visible"
      :width="assignDialog.width"
      :height="assignDialog.height"
      @onClose="onAssignClose"
      @onConfirm="onAssignConfirm"
    >
      <div slot="content">
        <el-tree
          ref="assignTree"
          :data="assignTreeData"
          node-key="id"
          :props="defaultProps"
          empty-text="暂无数据"
          :show-checkbox="true"
          :highlight-current="true"
          default-expand-all
        ></el-tree>
      </div>
    </system-dialog>
  </el-main>
</template>

<script>
//导入role.js中的方法
import {getRoles, addRole, updateRole, checkRole, deleteRole} from '@/api/role'
import SystemDialog from "@/components/system/SystemDialog";

export default {
  name: "roleList",
  //注册组件
  components: {
    SystemDialog
  },
  data() {
    return {
      //查询条件
      searchModel: {
        roleName: "",//角色名称
        pageNo: 1,//当前页码
        pageSize: 2,//每页显示的数量
        userId: this.$store.getters.userId//当前登录用户ID
      },
      roleList: [],//角色列表
      tableHeight: 0,//表格高度
      pageNo: 1,//当前页码
      total: 0,//数据总数量
      pageSize: 2, //当前每页数据量
      //表单验证规则
      rules: {
        roleCode: [{required: true, trigger: 'blur', message: '请输入角色编码'}],
        roleName: [{required: true, trigger: 'blur', message: '请输入角色名称'}]
      },
      //添加和修改角色窗口属性
      roleDialog: {
        title: '',
        visible: false,
        height: 230,
        width: 500
      },
      //角色对象
      role: {
        id: "",
        roleCode: "",
        roleName: "",
        remark: "",
        createUser: this.$store.getters.userId
      },
      //分配权限窗口属性
      assignDialog: {
        title: '',
        visible: false,
        height: 450,
        width: 300
      },
      roleId: '', //角色ID
      assignTreeData: [], //树节点数据
      //树节点属性
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    };
  },
  created() {
    //调用查询角色列表的方法
    this.search();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220;
    });
  },
  methods: {
    async search(pageNo = 1, pageSize = 2) {
      //修改每页显示的页码和数量
      this.searchModel.pageNo = pageNo;
      this.searchModel.pageSize = pageSize;
      //发生查询请求
      let res = await getRoles(this.searchModel);
      //判断是否成功
      if (res.success) {
        //赋值
        this.roleList = res.data.records;
        this.total = res.data.total;
      }
    },
    /*
    *当每页显示数量发生变化时触发
    * */
    handleSizeChange(size) {
      //修改每页显示的数量
      this.pageSize = size;
      //调用查询方法
      this.search(this.pageNo, size);
    },
    /*
    *当页码发生变化时触发
    * */
    handleCurrentChange(page) {
      //修改当前页码
      this.pageNo = page;
      //调用查询方法
      this.search(page, this.pageSize);
    },
    /*
    * 重置查询条件
    * */
    resetValue() {
      //清空数据
      this.searchModel.roleName = "";
      //重新查询
      this.search();
    },
    /*
    * 打开窗口
    * */
    openAddWindow() {
      //清空表单数据
      this.$resetForm("roleForm", this.role);
      //设置窗口属性
      this.roleDialog.title = "新增窗口";
      //显示窗口
      this.roleDialog.visible = true;
    },
    /**
     * 窗口取消事件
     */
    onClose() {
      this.roleDialog.visible = false
    },
    /**
     * 窗口确认事件
     */
    onConfirm() {
      //表单验证
      this.$refs.roleForm.validate(async (valid) => {
        //如果验证通过
        if (valid) {
          let res = null;
          //判断当前数据是新增还是修改，根据当前role的id树形是否为空
          //如果为空发送新增请求否则发送修改请求
          if (this.role.id === "") {
            //发送添加请求
            res = await addRole(this.role);
          } else {
            //发送修改请求
            res = await updateRole(this.role);
          }
          //判断是否成功
          if (res.success) {
            //提示成功
            this.$message.success(res.message);
            //刷新数据
            this.search(this.pageNo, this.pageSize);
            //关闭窗口
            this.roleDialog.visible = false;
          } else {
            //提示失败
            this.$message.error(res.message);
          }
        }
      });
    },
    /*
    * 编辑角色
    * */
    handleEdit(row) {
      //数据回显
      this.$objCopy(row, this.role); //将当前编辑的数据复制到role对象中
      //设置窗口标题
      this.roleDialog.title = "编辑角色";
      //显示编辑角色窗口
      this.roleDialog.visible = true;
    },
    /*
    * 删除角色
    * */
    async handleDelete(row) {
      //查询角色下是否被使用
      let result = await checkRole({id: row.id});
      //判断是否可以删除
      if (!result.success) {
        //提示不能删除
        this.$message.warning(result.message);
      } else {
        //确认是否删除
        let confirm = await this.$myconfirm("确认要删除该数据吗？");
        if (confirm) {
          alert(row.id);
          //发送请求删除
          let res = await deleteRole({id: row.id});
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message);
            //刷新
            this.search(this.pageNo, this.pageSize);
          } else {
            this.$message.error(res.message);
          }
        }
      }
    },
    /*
    * 分配权限
    * */
    assignRole(row) {
      alert(row.roleName);
      //设置窗口标题``反写符号
      this.assignDialog.title = `给【${row.roleName}】分配权限`;
      //显示窗口
      this.assignDialog.visible = true;
    },
    /**
     * 分配权限窗口取消事件
     */
    onAssignClose() {
      this.assignDialog.visible = false
    },
    /**
     * 分配权限窗口确认事件
     */
    async onAssignConfirm() {

    }
  }
}
</script>

<style scoped>

</style>
