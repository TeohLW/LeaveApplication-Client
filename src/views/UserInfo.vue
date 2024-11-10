<template>
  <div class="form-container">
    <div class="modal">
      <div class="logo">
        <el-icon><User /></el-icon>
      </div>
      <el-form ref="UserInfo" style="max-width: 600px" :model="user" status-icon :rules="rules" label-width="auto" class="demo-ruleForm">
        <el-form-item id="label" label="Password" prop="pass">
          <el-input v-model="user.pass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item id="label" label="Confirm" prop="checkPass">
          <el-input
            v-model="user.checkPass"
            type="password"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="Submit(UserInfo)">
            Submit
          </el-button>
          <el-button @click="resetForm(UserInfo)">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { getCurrentInstance, reactive, ref, toRaw } from 'vue';
// import { FormInstance, FormRules } from 'element-plus';

export default {
  data() {
    return {
      user: {
        pass: '',
        checkPass: '',
      },
      rules: {
        pass: [{ validator: this.validatePass, trigger: 'blur' }],
        checkPass: [{ validator: this.validatePass2, trigger: 'blur' }],
      },
    };
  },
  methods: {
    
    validatePass(rule, value, callback) {
      if (value === '') {
        callback(new Error('Please input the password'));
      } else {
        // Optionally validate the second password field if it's already filled
        if (this.user.checkPass !== '') {
          this.$refs.UserInfo.validateField('checkPass');
        }
        callback();
      }
    },
    validatePass2(rule, value, callback) {
      if (value === '') {
        callback(new Error('Please input the password again'));
      } else if (value !== this.user.pass) {
        callback(new Error("Two inputs don't match!"));
      } else {
        callback();
      }
    },
    Submit() {
      this.$refs.UserInfo.validate(async (valid) => {
        if (valid) {
          let params = this.user;
          let res = await this.$api.userPassSubmit(params);
          alert('Form submitted successfully!');
        } else {
          console.log('Error in form validation!');
          return false;
        }
      });
    },
    resetForm(){
      this.$refs.UserInfo.resetFields();
    }
  },
};
    
</script>
<style>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;  /* Full height of the viewport */
  text-align: center;
}
.modal {
    width: 500px;
    padding: 60px;
    border-radius: 7px;

    ::placeholder {
      font-size: 17px;
    }

  background: #343a40;
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  /* background: linear-gradient(to right, rgba(106, 17, 203, 1), rgba(37, 117, 252, 1)) */
  }
  #label {
    font-weight: bold;
    color:rgb(255, 255, 255);
  }
  .logo{
    margin-bottom: 20px;  /* Space between the logo and the form */
    font-size: 100px;
  }

</style>
