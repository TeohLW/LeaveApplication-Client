<template>
  <div aria-label="A complete example of page header">
    <el-page-header @back="onBack">
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
          <div class="action"></div>
          <el-table :data="applyList">
            <el-table-column label="#" type="index" width="50" />
            <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
              :width="item.width" :formatter="item.formatter">
            </el-table-column>
            <el-table-column label="Action" width="150">
              <template #default="scope">
                <el-button size="mini" @click="handleDetail(scope.row)" v-if="scope.row.curAuditUserName == userInfo.userName &&
                  [1, 2].includes(scope.row.applyState)
                  ">Review</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
            :page-size="pager.pageSize" @current-change="handleCurrentChange" />
        </div>
        <el-dialog title="Review" width="50%" v-model="showDetailModal" destroy-on-close>
          <el-form ref="dialogForm" :model="auditForm" label-width="120px" label-suffix=":" :rules="rules">
            <el-form-item label="Reviewer">
              <div>{{ detail.applyUser.userName }}</div>
            </el-form-item>
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
            <el-form-item label="Remark" prop="remark">
              <el-input type="textarea" :rows="3" placeholder="Remark" v-model="auditForm.remark" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="handleApprove('pass')">Approve</el-button>
              <el-button @click="handleApprove('refuse')" type="primary">Reject</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </el-page-header>
  </div>
</template>
<script>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
import utils from "../utils/utils";
export default {
  name: "approve",
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
        label: "User",
        prop: "",
        width:100,
        formatter(row) {
          return row.applyUser.userName;
        },
      },
      {
        label: "Leave Date",
        prop: "",
        width: "180px",
        style:{
          "word-break": "nowrap"
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
        label: "Duration",
        prop: "leaveTime",
      },
      {
        label: "Type",
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
        style: {
          "text-overflow": "ellipsis"
        }
      },
      // {
      //   label: "Application Time",
      //   prop: "createTime",
      //   width: 180,
      //   formatter: (row, column, value) => {
      //     return utils.formateDate(new Date(value));
      //   },
      // },
      // {
      //   label: "Reviewer",
      //   prop: "auditUsers",
      // },
      {
        label: "Current Approval",
        prop: "curAuditUserName",
        width: 140
      },
      {
        label: "Approval Status",
        prop: "applyState",
        width:" 150px",
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
    
    const onBack = () => {
      this.$router.push('/welcome')
    }

    const applyList = ref([]);

    const leaveForm = reactive({
      applyType: 1,
      startTime: "",
      endTime: "",
      leaveTime: "0 Day",
      reasons: "",
    });

    const showDetailModal = ref(false);

    let detail = ref({});
    const userInfo = proxy.$store.state.userInfo;

    const rules = {
      remark: [
        {
          required: true,
          message: "Remark",
          trigger: "change",
        },
      ],
    };
    const auditForm = reactive({
      remark: "",
    });

    const getApplyList = async () => {
      try {
        let params = { ...queryForm, ...pager, type: "approve" };
        let { list, page } = await proxy.$api.getApplyList(params);
        applyList.value = list;
        pager.total = page.total;
      } catch (error) {
        console.log(error)
      }
    };

    onMounted(() => {
      getApplyList();
    });

    const handleReset = (form) => {
      proxy.$refs[form].resetFields();
    };


    const handleCurrentChange = (current) => {
      pager.pageNum = current;
      getUserList();
    };
    
    const handleClose = () => {
      showDetailModal.value = false;
      handleReset("dialogForm");
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

    const handleApprove = (action) => {
      proxy.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = {
            action,
            remark: auditForm.remark,
            _id: detail.value._id,
          };
          try {
            await proxy.$api.leaveApprove(params);
            handleClose();
            proxy.$message.success("Completed!");
            getApplyList();
            proxy.$store.commit(
              "saveNoticeCount",
              proxy.$store.state.noticeCount - 1
            );
          } catch (error) { }
        }
      });
    };

    return {
      queryForm,
      pager,
      columns,
      handleCurrentChange,
      handleReset,
      getApplyList,
      applyList,
      auditForm,
      showDetailModal,
      handleClose,
      rules,
      detail,
      userInfo,
      handleDetail,
      handleApprove,
    };
  },
};
</script>