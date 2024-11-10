<template>
    <div class="dept-manage">
        <div class="query-form">
            <el-form ref="queryForm" :inline="true" :model="queryForm">
                <el-form-item label="Department Name">
                    <el-input placeholder="Please enter the department name" v-model="queryForm.deptName"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="getDeptList" type="primary">Query</el-button>
                    <el-button @click="handleReset('queryForm')">Reset</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleOpen">Create</el-button>
            </div>
            <el-table :data="deptList" row-key="_id" :tree-props="{ children: 'children' }" stripe>
                <el-table-column v-for="item in columns" :key="item.prop" v-bind="item"></el-table-column>
                <el-table-column label="Action">
                    <template #default="scope">
                        <el-button size="default" type="primary" @click="handleEdit(scope.row)">Edit</el-button>
                        <el-button size="default" type="danger" @click="handleDel(scope.row._id)">Delete</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog :title="action == 'create' ? 'Create Department' : 'Edit Deperment'" v-model="showModal">
            <el-form ref="dialogForm" :model="deptForm" :rules="rules" label-width="120px">
                <el-form-item label="Superior Department" prop="parentId">
                    <el-cascader placeholder="Please select the superior deparment" v-model="deptForm.parentId"
                        :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable :options="deptList"
                        :show-all-levels="true">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="Department Name" prop="deptName">
                    <el-input placeholder="Please enter the department name" v-model="deptForm.deptName"></el-input>
                </el-form-item>
                <el-form-item label="Person in Charge" prop="user">
                    <el-select placeholder="Please select the department head" v-model="deptForm.user" @change="handleUser">
                        <el-option v-for="item in userList" :key="item.userId" :label="item.userName"
                            :value="`${item.userId}/${item.userName}/${item.userEmail}`"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Person in Charge's Email" prop="userEmail">
                    <el-input placeholder="Please enter person in charge's email address" v-model="deptForm.userEmail" disabled></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">Close</el-button>
                    <el-button @click="handleSubmit" type="primary">Submit</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: "dept",
    data() {
        return {
            queryForm: {
                deptName: "",
            },
            columns: [
                {
                    label: "Department Name",
                    prop: "deptName",
                },
                {
                    label: "Person in Charge",
                    prop: "userName",
                },
                {
                    label: "Last Updated Time",
                    prop: "updateTime",
                },
                {
                    label: "Created Time",
                    prop: "createTime",
                },
            ],
            deptList: [],
            pager: {
                pageNum: 1,
                pageSize: 10,
            },
            action: "create",
            showModal: false,
            deptForm: {
                parentId: [null],
            },
            userList: [],
            rules: {
                parentId: [
                    {
                        required: true,
                        message: "Please select the superior deparment",
                        trigger: "blur",
                    },
                ],
                deptName: [
                    {
                        required: true,
                        message: "Please enter the department name",
                        trigger: "blur",
                    },
                ],
                user: [
                    {
                        required: true,
                        message: "Please select the department head",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    mounted() {
        this.getDeptList()
        this.getUserAllList()
    },
    methods: {
        async getDeptList() {
            let list = await this.$api.getDeptList(this.queryForm)
            this.deptList = list
        },
        async getUserAllList() {
            this.userList = await this.$api.getUserAllList()
        },
        handleUser(val) {
            const [userId, userName, userEmail] = val.split("/")
            Object.assign(this.deptForm, { userId, userName, userEmail })
        },
        handleReset(form) {
            this.$refs[form].resetFields()
        },
        handleOpen() {
            this.action = "create"
            this.showModal = true
        },
        handleEdit(row) {
            this.action = "edit"
            this.showModal = true
            this.$nextTick(() => {
                Object.assign(this.deptForm, row, {
                    user: `${row.userName}`,
                })
            })
        },
        async handleDel(_id) {
            this.action = "delete"
            await this.$api.deptOperate({ _id, action: this.action })
            this.$message.success("Delete Successful")
            this.getDeptList()
        },
        handleClose() {
            this.showModal = false
            this.handleReset("dialogForm")
        },
        handleSubmit() {
            this.$refs.dialogForm.validate(async (valid) => {
                if (valid) {
                    let params = { ...this.deptForm, action: this.action }
                    delete params.user
                    await this.$api.deptOperate(params)
                    this.$message.success("Submit Completed")
                    this.handleClose()
                    this.getDeptList()
                }
            })
        },
    },
};
</script>