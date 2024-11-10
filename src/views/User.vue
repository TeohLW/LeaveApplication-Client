<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="user">
        <el-form-item label="User ID" prop="userId">
          <el-input v-model="user.userId" placeholder="Please enter User ID" />
        </el-form-item>
        <el-form-item label="Username" prop="userName">
          <el-input v-model="user.userName" placeholder="Please enter username" />
        </el-form-item>
        <el-form-item label="State" prop="state">
          <el-select v-model="user.state">
            <el-option :value="0" label="All"></el-option>
            <el-option :value="1" label="Employed"></el-option>
            <el-option :value="2" label="Resigned"></el-option>
            <el-option :value="3" label="Probation Period"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">Search</el-button>
          <el-button @click="handleReset('form')">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" >Create</el-button>
        <el-button type="danger" @click="handlePatchDel" >Bulk Resign User</el-button>
      </div>
      <el-table :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="Action" width="180">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)" >Edit</el-button>
            <el-button type="danger" @click="handleDel(scope.row)" >Resign</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="Number(pager.total)"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>

    <el-dialog width="35%" title="Create User" v-model="showModal">
      <el-form ref="dialogForm" :model="userForm" label-width="100px" :rules="rules">
        <el-form-item label="Username" prop="userName">
          <el-input v-model="userForm.userName" :disabled="action == 'edit'" placeholder="Please enter username" />
        </el-form-item>
        <el-form-item label="Email Address" prop="userEmail">
          <el-input v-model="userForm.userEmail" :disabled="action == 'edit'" placeholder="Please enter email address">
            <template #append>@gma.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Phone Number" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="Please enter phone number" />
        </el-form-item>
        <el-form-item label="Job Title" prop="job">
          <el-input v-model="userForm.job" placeholder="Please enter the job title" />
        </el-form-item>
        <el-form-item label="State" prop="state">
          <el-select v-model="userForm.state">
            <el-option :value="1" label="Employed"></el-option>
            <el-option :value="2" label="Resigned"></el-option>
            <el-option :value="3" label="Probation Period"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Position" prop="position">
          <el-select v-model="userForm.position" placeholder="Please select the position" style="width: 100%">
            <el-option v-for="role in roleList" :key="role._id" :label="role.roleName" :value="role._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Department" prop="deptId">
          <el-cascader v-model="userForm.deptId" placeholder="Please select the department" :options="deptList" :props="prop" clearable
            style="width: 100%"></el-cascader>
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
import { getCurrentInstance, onMounted, reactive, ref, Teleport, toRaw } from "vue";
import utils from "./../utils/utils";

export default {
  name: "user",
  setup() {
    const { proxy } = getCurrentInstance();

    const user = reactive({
      state: 0,
    });

    const userList = ref([]);

    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
    });

    const checkedUserIds = ref([]);

    const showModal = ref(false);

    const userForm = reactive({
      state: 3,
      position: 0
    });

    const roleList = ref([]);

    const deptList = ref([]);

    const action = ref("add");

    const prop = reactive({
      checkStrictly: true,
      value: '_id',
      label: 'deptName'
    })

    const rules = reactive({
      userName: [
        {
          required: true,
          message: "Please enter username",
          trigger: "blur",
        },
      ],
      userEmail: [
        { required: true, message: "Please enter email address", trigger: "blur" },
      ],
      mobile: [
        {
          type: "tel",
          pattern: /(\d{9})/g,
          message: "Please enter phone number",
          trigger: "blur",
        },
      ],
      deptId: [
        {
          required: true,
          message: "Please select the department",
          trigger: "blur",
        },
      ],
    });

    const columns = reactive([
      {
        label: "User ID",
        prop: "userId",
        width: '150'
      },
      {
        label: "Username",
        prop: "userName",
        width: '150'
      },
      {
        label: "Email Address",
        prop: "userEmail",
      },
      {
        label: "Position",
        prop: "role",
        formatter(row, column, value) {
          return {
            0: "Administrator",
            1: "Standard User",
          }[value];
        },
      },
      {
        label: "State",
        prop: "state",
        formatter(row, column, value) {
          return {
            1: "Employed",
            2: "Resigned",
            3: "Probation Period",
          }[value];
        },
      },
      {
        label: "Registered Time",
        prop: "createTime",
        width: 180,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
      {
        label: "Last Login Time",
        prop: "lastLoginTime",
        width: 180,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
    ]);

    onMounted(() => {
      getUserList();
      getRoleAllList();
      getDeptList();
    });

    const getUserList = async () => {
      let params = { ...user, ...pager };
      try {
        const { list, page } = await proxy.$api.getUserList(params);
        userList.value = list;
        pager.total = page.total;
      } catch (error) {
        console.log(error);
      }
    };

    const handleQuery = () => {
      getUserList();
    };

    const handleReset = (form) => {
      proxy.$refs[form].resetFields();
    };

    const handleCurrentChange = (current) => {
      pager.pageNum = current;
      getUserList();
    };

    const handleDel = async (row) => {
      try {
        await proxy.$api.userDel({
          userIds: [row.userId],
        })
        proxy.$message.success("Updated Successful");
        getUserList();
      } catch (error) {
        console.log(error);
      }
    };

    const handlePatchDel = async () => {
      if (checkedUserIds.value.length == 0) {
        proxy.$message.error("Please select the user to update resign status");
        return;
      }
      const res = await proxy.$api.userDel({
        userIds: checkedUserIds.value,
      });
      if (res.modifiedCount > 0) {
        proxy.$message.success("Updated Successful");
        getUserList();
      } else {
        proxy.$message.success("Failed to update");
      }
    };

    const handleSelectionChange = (list) => {
      let arr = [];
      list.map((item) => {
        arr.push(item.userId);
      });
      checkedUserIds.value = list;
    };

    const handleCreate = () => {
      action.value = "add";
      showModal.value = true;
    };

    const getDeptList = async () => {
      try {
        let res = await proxy.$api.getDeptList();
        deptList.value = res;
      } catch (error) {
        console.log(error);
      }
    };

    const getRoleAllList = async () => {
      let list = await proxy.$api.getRoleAllList()
      roleList.value = list;
      userForm.position = ""
    };

    const handleClose = () => {
      try {
        showModal.value = false;
        handleReset("dialogForm");
      } catch (error) {
        console.log(error);
      }
    };

    const handleSubmit = () => {
      proxy.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = toRaw(userForm);
          params.userEmail += "@abc.com";
          params.action = action.value;
          params.roleList = userForm.position;
          console.log(params)
          let res = await proxy.$api.userSubmit(params);
          showModal.value = false;
          proxy.$message.success("User Creation Succesful");
          handleReset("dialogForm");
          getUserList(); 
        }
      });
    };

    const handleEdit = (row) => {
      action.value = "edit";
      showModal.value = true;
      proxy.$nextTick(() => {
        userForm.position = row.roleList[0]
        Object.assign(userForm, row);
      });
    };

    return {
      user,
      userList,
      columns,
      pager,
      checkedUserIds,
      showModal,
      userForm,
      prop,
      rules,
      roleList,
      deptList,
      action,
      getUserList,
      handleQuery,
      handleReset,
      handleCurrentChange,
      handleDel,
      handlePatchDel,
      handleSelectionChange,
      handleCreate,
      getRoleAllList,
      getDeptList,
      getRoleAllList,
      handleClose,
      handleSubmit,
      handleEdit,
    };
  },
};
</script>