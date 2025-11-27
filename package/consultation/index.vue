<template>
  <CustomNavbar>
    <template #title>
      <div style="color: #fff">{{title}}</div>
    </template>
  </CustomNavbar>
  <view class="page-body">
    <image
      class="img_back"
      src="https://louyu.zdocd.com/wxapp/static/image/consultation-back.webp"
      mode="widthFix"
    />
    <div class="page-content">
      <div class="title">欢迎来到咨询中心</div>
      <div class="waring">请留下您的信息，我们将尽快联系您！</div>
      <div class="formState">
        <div class="item">
          <div class="label">联系人姓名 <text> *</text></div>
          <uni-easyinput
            v-model="baseFormData.name"
            @change="onFormStateChange"
            :inputBorder="false"
          />
        </div>

        <div class="item">
          <div class="label">联系电话 <text> *</text></div>
          <uni-easyinput
            v-model="baseFormData.mobile"
            :inputBorder="false"
            @change="onFormStateChange"
          />
        </div>

        <div class="item">
          <div class="label">咨询内容 <text> *</text></div>
          <uni-easyinput
            type="textarea"
            v-model="baseFormData.content"
            :inputBorder="false"
            @change="onFormStateChange"
            placeholder="请简单描述企业信息、租用需求等信息。"
          />
        </div>

        <div class="item">
          <div class="btns" :class="{ disabled: isSubmit }" @click="onSubmit">提交</div>
        </div>
      </div>
      <div class="back"></div>
      <div class="dialog" v-if="isSubmitSuccess">
        <div class="content">
          <image
            src="https://louyu.zdocd.com/wxapp/static/image/success.webp"
            mode="widthFix"
          />
          <div>提交成功</div>
        </div>
      </div>

      <div class="dialog" v-if="isSubmitFail">
        <div class="content">
          <image src="https://louyu.zdocd.com/wxapp/static/image/error.webp" mode="widthFix" />
          <div>{{ failMsg }}</div>
        </div>
      </div>
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CustomNavbar from "@/components/customNavbar.vue";
import { leaveWord } from "/utlis/https";
import { onLoad } from "@dcloudio/uni-app";
const baseFormData = ref({
  name: "",
  mobile: "",
  content: "",
});
let house_id = null,
  rentel_id = null;
const isSubmit = ref(true);
const isSubmitSuccess = ref(false);
const isSubmitFail = ref(false);
const failMsg = ref("");
const title = ref("");
const onFormStateChange = () => {
  isSubmit.value = Object.values(baseFormData.value).some((item) => item == "");
  console.log(isSubmit.value);
};
const onSubmit = () => {
  if (isSubmit.value) {
    return;
  } else {
    let params = {
      ...baseFormData.value,
      house_id: house_id || 0,
      rentel_id: rentel_id || 0,
    };
    leaveWord.message(params).then((res) => { 
      console.log(res);
      if (res.code != 200) {
        isSubmitFail.value = true;
        failMsg.value = res.message;
        setTimeout(() => {
          isSubmitFail.value = false;
        }, 2000);
      } else {
        isSubmitSuccess.value = true;
        baseFormData.value = {
          name: "",
          mobile: "",
          content: "",
        };
        setTimeout(() => {
          isSubmitSuccess.value = false;
        }, 2000);
      }
    });
  }
};
  onLoad((options) => {
  house_id = options.house_id || 0;
  rentel_id = options.rentel_id || 0;
  title.value = options.title || "留言咨询";
});
</script>

<style lang="less" scoped>
.page-body {
  padding: 16px 10px;
  position: relative;
  width: 100%;
  height: 100vh;
  padding-top: 110px;
  image.img_back {
    position: absolute;
    width: 100%;
    height: 100%;
    display: block;
    left: 0;
    top: 0;
    z-index: -1;
  }
  .page-content {
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    padding: 16px;
    position: relative;
    z-index: 1;
    .title {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 22px;
      color: #3071f2;
      line-height: 44px;
      text-align: center;
    }
    .waring {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 13px;
      color: #8a8f99;
      line-height: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
  }
  .formState {
    .item {
      .label {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 14px;
        color: #17181a;
        line-height: 44px;
        text-align: left;

        text {
          color: rgba(250, 75, 75, 1);
        }
      }
      .btns {
        height: 40px;
        background: rgba(48, 113, 242, 1);
        border-radius: 8px 8px 8px 8px;
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 16px;
        color: #f7f7f7;
        line-height: 40px;
        text-align: center;
        margin-top: 20px;
        &.disabled {
          background: rgba(48, 113, 242, 0.2);
        }
      }
    }
  }
  .back {
    height: 213px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px 10px 10px 10px;
    position: absolute;
    bottom: -16px;
    width: calc(100% - 20px);
    left: 10px;
    z-index: -1;
  }
}
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
<style lang="less">
.formState {
  .uni-easyinput > view {
    height: 44px;
    background: #f2f5fa !important;
    border-radius: 8px 8px 8px 8px;
    border: none;
    &.is-textarea {
      height: auto !important;
      min-height: 240px;
      padding: 11px 16px;
    }
  }
}
</style>
