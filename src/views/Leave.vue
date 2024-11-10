<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="Approval Status" prop="applyState">
          <el-select v-model="queryForm.applyState">
            <el-option value="" label="All"></el-option>
            <el-option :value="1" label="Pending Approval"></el-option>
            <el-option :value="3" label="Rejected"></el-option>
            <el-option :value="4" label="Approved"></el-option>
            <el-option :value="5" label="Cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getApplyList">Filter</el-button>
          <el-button @click="handleReset('form')">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-form-item label="Remaining Leave" required>
          {{ leaveForm.remainLeave }}
        </el-form-item>
        <el-button type="primary" @click="handleApply">Apply for Leave</el-button>
      </div>
      <el-table :data="applyList">
        <el-table-column label="#" type="index" width="50" />
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="Action" width="150">
          <template #default="scope">
            <div style="display: flex;flex-direction: column;gap:5px">
              <el-button @click="handleDetail(scope.row)">View</el-button>
              <el-button style="margin:0" type="danger" @click="handleDelete(scope.row._id)" v-if="[1, 2].includes(scope.row.applyState)">Cancel</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="Apply For Leave" v-model="showModal" width="70%">
      <el-form ref="dialogForm" :model="leaveForm" label-width="120px" :rules="rules">
        <el-form-item label="Leave Type" prop="applyType" required>
          <el-select v-model="leaveForm.applyType">
            <el-option label="Annual Leave" :value="1"></el-option>
            <el-option label="Unpaid Leave" :value="2"></el-option>
            <el-option label="MC" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Leave Type" required>
          <el-row>
            <el-col :span="8">
              <el-form-item prop="startTime" required>
                <el-date-picker v-model="leaveForm.startTime" type="date" placeholder="Start Date"
                  @change="(val) => handleDateChange('startTime', val)" />
              </el-form-item>
            </el-col>
            <el-col :span="1">-</el-col>
            <el-col :span="8">
              <el-form-item prop="endTime" required>
                <el-date-picker v-model="leaveForm.endTime" type="date" placeholder="End Date"
                  @change="(val) => handleDateChange('endTime', val)" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="Leave Duration" required>
          {{ leaveForm.leaveTime }}
        </el-form-item>
        <el-form-item label="Reason" prop="reasons" required>
          <el-input type="textarea" :row="3" placeholder="Please Enter the Reason for Leave" v-model="leaveForm.reasons" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="Leave Application Details" width="50%" v-model="showDetailModal" destroy-on-close>
      <el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center>
        <el-step title="Pending Approval"></el-step>
        <el-step title="Approved/Rejected"></el-step>
      </el-steps>
      <el-form label-width="120px" label-suffix=":">
        <el-form-item label="Leave Type">
          <div>{{ detail.applyTypeName }}</div>
        </el-form-item>
        <el-form-item label="Leave Date">
          <div>{{ detail.time }}</div>
        </el-form-item>
        <el-form-item label="Leave Duration">
          <div>{{ detail.leaveTime }}</div>
        </el-form-item>
        <el-form-item label="Reason">
          <div>{{ detail.reasons }}</div>
        </el-form-item>
        <el-form-item label="Approval Status">
          <div>{{ detail.applyStateName }}</div>
        </el-form-item>
        <el-form-item label="Reviewer">
          <div>{{ detail.curAuditUserName }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
import utils from "../utils/utils";
export default {
  name: "user",
  setup() {
    const { proxy } = getCurrentInstance();
    const queryForm = reactive({
      applyState: 1,
    });
    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
      total: 0,
    });
    const columns = reactive([
      // {
      //   label: "ID",
      //   prop: "orderNo",
      // },
      {
        label: "Leave Date",
        prop: "",
        width: "180px",
        style: {
          "word-break": "nowrap",
        },
        formatter(row) {
          return (
            utils.formateDate(new Date(row.startTime), "yyyy-MM-dd") +
            " to " +
            utils.formateDate(new Date(row.endTime), "yyyy-MM-dd")
          );
        },
      },
      {
        label: "Leave Duration",
        prop: "leaveTime",
      },
      {
        label: "Leave Type",
        prop: "applyType",
        formatter(row, column, value) {
          return {
            1: "Annual Leave",
            2: "Unpaid Leave",
            3: "MC",
          }[value];
        },
      },
      {
        label: "Reason",
        prop: "reasons",
      },
      {
        label: "Application Time",
        prop: "createTime",
        width: 180,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
      // {
      //   label: "Reviewer",
      //   prop: "auditUsers",
      // },
      {
        label: "Current Reviewer",
        prop: "curAuditUserName",
      },
      {
        label: "Approval Status",
        prop: "applyState",
        formatter: (row, column, value) => {
          return {
            1: "Pending Approval",
            3: "Rejected",
            4: "Approved",
            5: "Cancelled",
          }[value];
        },
      },
    ]);
    const applyList = ref([]);
    const leaveForm = reactive({
      applyType: 1,
      startTime: "",
      endTime: "",
      leaveTime: "0 days",
      reasons: "",
    });
    const action = ref("create");
    const showModal = ref(false);
    const showDetailModal = ref(false);
    let detail = ref({});
    const rules = {
      startTime: [
        {
          type: "date",
          required: true,
          message: "Start Date",
          trigger: "change",
        },
      ],
      endTime: [
        {
          type: "date",
          required: true,
          message: "End Date",
          trigger: "change",
        },
      ],
      reasons: [
        {
          required: true,
          message: "Reasons",
          trigger: ["change", "blur"],
        },
      ],
    };
    onMounted(() => {
      getApplyList();
      getBalanceDays();
    });

    const getApplyList = async () => {
      let params = { ...queryForm, ...pager };
      let { list, page } = await proxy.$api.getApplyList(params);
      applyList.value = list;
      pager.total = page.total;
    };

    const getBalanceDays = async () => {
      const data = await proxy.$api.getBalanceDays();
      leaveForm.remainLeave = data.leave_balance+" days";
    };

    const handleReset = (form) => {
      proxy.$refs[form].resetFields();
    };

    const handleCurrentChange = (current) => {
      pager.pageNum = current;
      getUserList();
    };

    const handleApply = () => {
      showModal.value = true;
      action.value = "create";
    };

    const handleClose = () => {
      showModal.value = false;
      handleReset("dialogForm");
    };

    const handleDateChange = (key, val) => {
      let { startTime, endTime } = leaveForm;
      if (!startTime || !endTime) return;
      if (startTime > endTime) {
        proxy.$message.error("The start date cannot be later than the end date");
        leaveForm.leaveTime = "0 days";
        setTimeout(() => {
          leaveForm[key] = "";
        }, 0);
      } else {
        leaveForm.leaveTime =
          (endTime - startTime) / (24 * 60 * 60 * 1000) + 1 + " Days";
      }
    };

    const handleSubmit = () => {
      proxy.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          try {
            let params = { ...leaveForm, action: action.value };
            let res = await proxy.$api.leaveOperate(params);
            proxy.$message.success("Creation Successful");
            handleClose();
            getApplyList();
            getBalanceDays();
          } catch (error) { }
        }
      });
    };

    const handleDetail = (row) => {
      let data = { ...row };
      data.applyTypeName = {
        1: "Annual Leave",
        2: "Unpaid Leave",
        3: "MC",
      }[data.applyType];
      data.time =
        utils.formateDate(new Date(data.startTime), "yyyy-MM-dd") +
        " to " +
        utils.formateDate(new Date(data.endTime), "yyyy-MM-dd");
      data.applyStateName = {
        1: "Pending Approval",
        3: "Rejected",
        4: "Approved",
        5: "Cancelled",
      }[data.applyState];
      detail.value = data;
      showDetailModal.value = true;
    };

    const handleDelete = async (_id) => {
      try {
        let params = { _id, action: "delete" };
        let res = await proxy.$api.leaveOperate(params);
        proxy.$message.success("Deleted");
        getApplyList();
      } catch (error) { }
    };

    return {
      queryForm,
      pager,
      columns,
      handleCurrentChange,
      handleReset,
      getApplyList,
      applyList,
      leaveForm,
      showModal,
      showDetailModal,
      handleApply,
      handleClose,
      handleSubmit,
      rules,
      handleDateChange,
      detail,
      handleDetail,
      handleDelete,
    };
  },
};
</script>