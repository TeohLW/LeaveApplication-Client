<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="Position Name" prop="roleName">
          <el-input v-model="queryForm.roleName" placeholder="Please enter the name of position" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">Search</el-button>
          <el-button @click="handleReset('form')">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd">Create</el-button>
      </div>
      <el-table :data="roleList">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="Action" width="280">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)">Edit</el-button>
            <el-button type="primary" @click="handleOpenPermission(scope.row)">Access</el-button>
            <el-button type="danger" @click="handleDel(scope.row._id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="Number(pager.total)"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>

    <!-- new/edit popup-->
    <el-dialog width="35%" title="Create Position" v-model="showModal">
      <el-form ref="dialogForm" :model="roleForm" label-width="100px" :rules="rules">
        <el-form-item label="Position Name" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="Please enter position name" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input type="textarea" v-model="roleForm.remark" :row="2" placeholder="Please enter remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditClose">Close</el-button>
          <el-button type="primary" @click="handleSubmit">Submit</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- restricted -->
    <el-dialog width="35%" title="Permission Menu" v-model="showPermission">
      <el-form label-width="100px">
        <el-form-item label="Position Name" prop="roleName">
          {{ curRoleName }}
        </el-form-item>
        <el-form-item label="Choose Permission" prop="remark">
          <el-tree ref="permissionTree" :data="menuList" show-checkbox node-key="_id" default-expand-all
            :props="{ label: 'menuName' }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handlePermissionClose">Close</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">Submit</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>

import utils from "./../utils/utils";

export default {
  name: "role",
  data() {
    return {
      queryForm: { 
        roleName: '',
      },
      columns: [
        {
          label: 'Position Name',
          prop: 'roleName',
        },
        {
          label: 'Remark',
          prop: 'remark'
        },
        {
          label: 'Permission List',
          prop: 'permissionList',
          formatter: (row, column, value) => {
            let names = []
            let list = value.halfCheckedKeys || []
            list.map(key => {
              let name = this.actionMap[key]
              if (key && name) names.push(name)
            })
            return names.join(',')
          }
        },
        {
          label: 'Create Time',
          prop: 'createTime',
          formatter(row, column, value) {
            return utils.formateDate(new Date(value))
          }
        },
        {
          label: 'Last Update Time',
          prop: 'updateTime',
          formatter(row, column, value) {
            return utils.formateDate(new Date(value))
          }
        }
      ],
      roleList: [],
      pager: {
        pageSize: 10,
        pageNum: 1,
        total: 0
      },
      showModal: false,
      action: 'create',
      roleForm: {},
      rules: {
        roleName: [
          {
            required: true,
            message: 'Please enter position name'
          }
        ]
      },
      showPermission: false,
      curRoleId: '',
      curRoleName: '',
      menuList: [],
      actionMap: {}
    }

  },
  mounted() {
    this.getRoleList()
    this.getMenuList()
  },
  methods: {
    async getRoleList() {
      try {
        let { list, page } = await this.$api.getRoleList({
          ...this.queryForm,
          ...this.pager,
        })
        this.roleList = list
        this.pager.total = page.total
      } catch (error) {
        throw new Error('Role List Initialization Error=>', error)
      }
    },

    async getMenuList() {
      try {
        let list = await this.$api.getMenuList()
        this.menuList = list
        this.getActionMap(list)
      } catch (error) {
        throw new Error('Menu List Initialization Error=>', error)
      }
    },

    handleReset(form) {
      this.$refs[form].resetFields()
    },

    handleEdit(row) {
      this.action = 'edit'
      this.showModal = true
      this.$nextTick(() => {
        this.roleForm = {
          _id: row._id,
          roleName: row.roleName,
          remark: row.remark
        }
      })
    },

    handleAdd() {
      this.action = 'create'
      this.showModal = true
    },

    async handleDel(_id) {
      await this.$api.roleOperate({ _id, action: 'delete' })
      this.$message.success('Delete Successful')
      this.getRoleList()
    },

    handleSubmit() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let { roleForm, action } = this
          let params = { ...roleForm, action }
          let res = await this.$api.roleOperate(params)
          if (res) {
            this.showModal = false
            this.$message.success('Create Successful')
            this.handleReset('dialogForm')
            this.getRoleList()
          }
        }
      })
    },

    handleCurrentChange(current) {
      this.pager.pageNum = current
      this.getRoleList()
    },

    handlePermissionClose() {
      this.showPermission = false
    },

    handleEditClose() {
      this.handleReset("dialogForm");
      this.showModal = false
    },

    handleOpenPermission(row) {
      this.curRoleId = row._id
      this.curRoleName = row.roleName
      this.showPermission = true
      let { checkedKeys } = row.permissionList
      setTimeout(() => {
        this.$refs.permissionTree.setCheckedKeys(checkedKeys)
      })
    },

    async handlePermissionSubmit() {
      let nodes = this.$refs.permissionTree.getCheckedNodes()
      let halfKeys = this.$refs.permissionTree.getHalfCheckedKeys()
      let checkedKeys = []
      let parentKeys = []
      nodes.map(node => {
        if (!node.children) {
          checkedKeys.push(node._id)
        } else {
          parentKeys.push(node._id)
        }
      })
      let params = {
        _id: this.curRoleId,
        permissionList: {
          checkedKeys,
          halfCheckedKeys: parentKeys.concat(halfKeys)
        }
      }
      await this.$api.updatePermission(params)
      this.showPermission = false
      this.$message.success('Update Successful')
      this.getRoleList()
    },
    
    getActionMap(list) {
      let actionMap = {}
      const deep = (arr) => {
        while (arr.length) {
          let item = arr.pop()
          if (item.children && item.action) {
            actionMap[item._id] = item.menuName
          }
          if (item.children && !item.action) {
            deep(item.children)
          }
        }
      }
      deep(JSON.parse(JSON.stringify(list)))
      this.actionMap = actionMap
    }
  },
};
</script>