<template>
  <view class="login-main">
    <CustomNavbar   :onBack="goToOut" titleColor="#ffffff"/>
    <view style="position: relative">
      <image
        class="login-back"
        src="https://louyu.zdocd.com/wxapp/static/image/login-back.webp"
        mode="widthFix"
      ></image>
      <view class="login-head">
        <image
          src="https://louyu.zdocd.com/wxapp/static/image/login-icon.webp"
          mode="widthFix"
        ></image>
        <view class="login-head-text"> 温小楼 </view>
      </view>
    </view>
    <view class="login-content">
      <view class="login-input">
        <view class="login-input-icon">
          <image
            src="https://louyu.zdocd.com/wxapp/static/image/user-icon.webp"
            mode="widthFix"
          ></image>
        </view>
        <uni-easyinput
          v-model="formState.username"
          placeholderStyle="font-size:15px"
          :clearable="false"
          placeholder="请输入账号"
        >
        </uni-easyinput>
      </view>

      <view class="login-input" style="margin-top: 25px">
        <view class="login-input-icon">
          <image
            src="https://louyu.zdocd.com/wxapp/static/image/pwd-icon.webp"
            mode="widthFix"
          ></image>
        </view>
        <uni-easyinput
          v-model="formState.password"
          type="password"
          placeholderStyle="font-size:15px"
          :clearable="false"
          placeholder="请输入密码"
        >
        </uni-easyinput>
      </view>

      <view class="login-input" style="margin-top: 35px">
        <button type="primary" @click="onSubmit">登录</button>
      </view>
    </view>
    <SubmitResultDialog ref="submitResultDialogRef" />
  </view>
</template>

<script setup>
import { ref, inject } from "vue";
import { user } from "/utlis/https";
import SubmitResultDialog from "@/components/SubmitResultDialog.vue";
import CustomNavbar from "@/components/customNavbar.vue";
let formState = ref({
  username: "",
  password: "",
});
const submitResultDialogRef = ref(null);
const goToOut = () => {
  uni.reLaunch({
    url: "/pages/home/index",
  });
};
const onSubmit = () => {
  let params = {
    ...formState.value,
  };
  console.log(params);
  if (Object.values(params).some((item) => item == "" || item == null)) {
    wx.showToast({
      icon: "none",
      title: "请输入正确的登录信息",
    });
    return;
  }
  user.login(params).then((res) => {
    if (res.code == 200) {
      let data = res.data;
      uni.setStorageSync("token", data.access_token);
      let expire_at = new Date().getTime() + data.expire_at * 1000;
      console.log(expire_at);
      uni.setStorageSync("expire_at", expire_at);
      uni.setStorageSync("refresh_token", data.refresh_token);
      uni.setStorageSync("isLogin", true);
      submitResultDialogRef.value.showSubmitSuccess("登录成功");

      uni.reLaunch({
        url: "/pages/home/index",
      });
    } else {
      submitResultDialogRef.value.showSubmitFail(res.message);
    }
  });
};
</script>

<style lang="less" scoped>
.login-main {
  background: #ffffff;
  height: 100%;
  width: 100%;
}

.login-back {
  width: 100%;
}

.login-head {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  top: 0;
  left: 0;
  padding-top: 31px;

  image {
    width: 60px;
    height: 60px;
  }

  .login-head-text {
    font-family: Douyin Sans, Douyin Sans;
    font-weight: bold;
    font-size: 26px;
    color: #ffffff;
    letter-spacing: 2px;
    text-align: center;
    margin-top: 18px;
  }
}

.login-content {
  padding: 52px 37px 0 37px;
  background: #ffffff;
  border-radius: 16px 16px 0px 0px;
  position: relative;
  top: -30px;
}

.login-input {
  position: relative;
  button {
    background: #3071f2;
    border-radius: 8px 8px 8px 8px;
    border: #3071f2;
    &:focus {
      color: #3071f2;
    }
  }
}

.login-input-icon {
  position: absolute;
  width: 46px;
  height: 44px;
  left: 0;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  image {
    width: 20px;
    height: 20px;
  }
}
</style>
<style lang="less">
.login-content {
  .uni-easyinput {
    & > view {
      background: #f2f5fa !important;
      border-radius: 8px 8px 8px 8px;
      border: none;
      height: 44px;
      padding-left: 46px;

      input {
        font-size: 15px !important;
        font-family: PingFang SC, PingFang SC;
        font-weight: 400 !important;
        padding: 0 !important;

        &::placeholder {
          font-size: 15px !important;
        }
      }
    }
  }
}
</style>
