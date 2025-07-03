<template>
  <div class="dialog" v-if="isSubmitSuccess">
    <div class="content">
      <image
        src="https://louyutest.cdyunbu.com/wxapp/static/image/success.webp"
        mode="widthFix"
      />
      <div>{{ successMsg }}</div>
    </div>
  </div>

  <div class="dialog" v-if="isSubmitFail">
    <div class="content">
      <image src="https://louyutest.cdyunbu.com/wxapp/static/image/error.webp" mode="widthFix" />
      <div>{{ failMsg }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref, provide } from "vue";
const isSubmitSuccess = ref(false);
const isSubmitFail = ref(false);
const successMsg = ref("");
const failMsg = ref("");
const showSubmitSuccess = (msg,time,callback) => {
  isSubmitSuccess.value = true;
  successMsg.value = msg || "提交成功";
  setTimeout(() => {
    isSubmitSuccess.value = false;
    callback && callback();
  }, time || 2000); 
};
const showSubmitFail = (msg,time,callback) => {
  console.log(msg);
  isSubmitFail.value = true;
  failMsg.value = msg || "提交失败";
  setTimeout(() => {
    isSubmitFail.value = false;
    callback && callback();
  }, time || 2000);
};
defineExpose({
  showSubmitSuccess,
  showSubmitFail,
});
</script>

<style lang="less">
.dialog {
  position: fixed;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  .content {
    width: 128px;
    height: 100px;
    background: #ffffff;
    box-shadow: 0px 6px 20px 0px rgba(0, 22, 65, 0.1);
    border-radius: 8px 8px 8px 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    image {
      width: 32px;
      height: 32px;
    }
    view {
      width: 128px;
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 15px;
      color: #17181a;
      line-height: 20px;
      margin-top: 10px;
      text-align: center;
    }
  }
}
</style>
