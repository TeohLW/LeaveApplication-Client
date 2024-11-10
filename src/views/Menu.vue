<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="Menu Name" prop="menuName">
          <el-input v-model="queryForm.menuName" placeholder="Please enter menu name" />
        </el-form-item>
        <el-form-item label="Menu State" prop="menuState">
          <el-select v-model="queryForm.menuState">
            <el-option :value="1" label="Normal"></el-option>
            <el-option :value="2" label="Suspended"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMenuList">Filter</el-button>
          <el-button @click="handleReset('form')">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd(1)">Create</el-button>
      </div>
      <el-table :data="menuList" row-key="_id" :tree-props="{ children: 'children' }">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="Action" width="250">
          <template #default="scope">
            <el-button @click="handleAdd(2, scope.row)">Create</el-button>
            <el-button @click="handleEdit(scope.row)" type="primary">Edit</el-button>
            <el-button type="danger" @click="handleDel(scope.row._id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- new popup -->
    <el-dialog width="35%" title="Add New Menu" v-model="showModal">
      <el-form ref="dialogForm" :model="menuForm" label-width="100px" :rules="rules">
        <el-form-item label="Superrior Menu" prop="parentId">
          <el-cascader v-model="menuForm.parentId" :options="menuList"
            :props="{ checkStrictly: true, value: '_id', label: 'menuName' }" clearable />
          <span>&nbsp; If not selected, it will directly create a top-level menu.</span>
        </el-form-item>
        <el-form-item label="Menu Type" prop="menuType">
          <el-radio-group v-model="menuForm.menuType">
            <el-radio :label="1">Menu</el-radio>
            <el-radio :label="2">Button</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Menu Name" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="Please enter menu name" />
        </el-form-item>
        <el-form-item label="Menu Icon" prop="icon" v-show="menuForm.menuType == 1">
          <el-input v-model="menuForm.icon" placeholder="Please enter the menu icon" />
        </el-form-item>
        <el-form-item label="Route Address" prop="path" v-show="menuForm.menuType == 1">
          <el-input v-model="menuForm.path" placeholder="Please enter the route address" />
        </el-form-item>
        <el-form-item label="Permission" prop="menuCode" v-show="menuForm.menuType == 2">
          <el-input v-model="menuForm.menuCode" placeholder="Please enter the permission" />
        </el-form-item>
        <el-form-item label="Component Path" prop="component" v-show="menuForm.menuType == 1">
          <el-input v-model="menuForm.component" placeholder="Please enter the component path" />
        </el-form-item>
        <el-form-item label="Menu State" prop="menuState" v-show="menuForm.menuType == 1">
          <el-radio-group v-model="menuForm.menuState">
            <el-radio :label="1">Normal</el-radio>
            <el-radio :label="2">Suspend</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">Close</el-button>
          <el-button type="primary" @click="handleSubmit">Submit</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import utils from "./../utils/utils";

export default {
  name: "menus",
  data() {
    return {
      queryForm: {
        menuState: 1,
      },
      menuList: [],
      columns: [
        {
          label: 'Menu Name',
          prop: 'menuName',
          width: 180
        },
        {
          label: 'Icon',
          prop: 'icon'
        },
        {
          label: 'Menu Type',
          prop: 'menuType',
          formatter(row, column, value) {
            return {
              '1': 'Menu',
              '2': 'Button',
            }[value]
          }
        },
        {
          label: 'Permission',
          prop: 'menuCode'
        },
        {
          label: 'Route Address',
          prop: 'path'
        },
        {
          label: 'Component Path',
          prop: ''
        },
        {
          label: 'Menu State',
          prop: 'menuState',
          formatter(row, column, value) {
            return {
              '1': 'Normal',
              '2': 'Suspended',
            }[value]
          }
        },
        {
          label: 'Create Time',
          prop: 'createTime',
          width: '170',
          formatter(row, column, value) {
            return utils.formateDate(new Date(value))
          }
        }
      ],
      showModal: false,
      menuForm: {
        parentId: [null],
        menuType: 1,
        menuState: 1
      },
      action: '',
      rules: {
        menuName: [
          {
            required: true,
            message: 'Please enter menu name',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: 'Length should be between 2 and 8 characters',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted() {
    this.getMenuList()
  },
  methods: {
    async getMenuList() {
      try {
        let list = await this.$api.getMenuList(this.queryForm)
        this.menuList = list

      } catch (error) {
        throw new Error('Error', error)
      }
    },
    handleReset(form) {
      this.$refs[form].resetFields()
    },

    handleAdd(type, row) {
      this.showModal = true
      this.action = 'add'
      if (type == 2) {
        this.menuForm.parentId = [...row.parentId, row._id].filter(
          (item) => item
        )
      }
    },

    handleEdit(row) {
      this.showModal = true
      this.action = 'edit'
      this.$nextTick(() => {
        Object.assign(this.menuForm, row)
      })
    },

    async handleDel(_id) {
      await this.$api.menuSubmit({ _id, action: 'delete' })
      this.$message.success('Delete Successful')
      this.getMenuList()
    },

    handleSubmit() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let { action, menuForm } = this
          let params = { ...menuForm, action }
          let res = await this.$api.menuSubmit(params)
          this.showModal = false
          this.$message.success('Create Successful')
          this.handleReset('dialogForm')
          this.getMenuList()
        }
      })
    },
    
    handleClose() {
      this.showModal = false
      this.handleReset('dialogForm')
    }
  },
};
</script>