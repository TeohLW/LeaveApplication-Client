<template>
  <div class="welcome">
     <div class="content">
      <div class="title">Leave Application System</div>
    </div>
    <!-- <div class="img"></div>  -->
  </div>
</template>

<script >
import { Edit, Delete, Check } from '@element-plus/icons-vue';
import { ref } from "vue";
export default {
  name: 'welcome',
  components: {

  },
  data() { },
	
}

</script>

<style lang="scss" scoped>
.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #fff;
}

.content {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}
</style>
