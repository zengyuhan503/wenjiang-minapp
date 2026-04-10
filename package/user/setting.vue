<template>
  <view class="page-container">
    <view class="list-group">
      <view class="list-item">
        <text class="label">账号</text>
        <text class="value">{{ maskedPhone }}</text>
      </view>
      <view class="list-item" @click="toPassword">
        <text class="label">登录密码</text>
        <view class="right-content">
          <text class="action-text">去修改</text>
          <image src="https://louyu.zdocd.com/wxapp/static/image/right.png" mode="widthFix" class="arrow-icon"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { user } from "../../utlis/https.js";

const phone = ref("");

const maskedPhone = computed(() => {
  if (!phone.value) return "";
  return phone.value.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
});

const getUserInfo = () => {
  user.getInfo().then(res => {
    if (res.code === 200 && res.data) {
      phone.value = res.data.phone || "";
    }
  }).catch(err => {
    console.log("获取用户信息失败", err);
  });
};

const toPassword = () => {
  uni.navigateTo({
    url: "/package/user/password"
  });
};

onShow(() => {
  getUserInfo();
});
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  background-color: #ffffff;
}

.list-group {
  background-color: #ffffff;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  border-bottom: 1px solid #E1E5EA;


  .label {
    font-size: 15px;
    font-weight: 500;
    color: #2E2F33;
  }

  .value {
    font-size: 15px;
    color: #B8BECC;
  }

  .right-content {
    display: flex;
    align-items: center;
    width: auto;

    .action-text {
      font-size: 14px;
      color: #a1a7b2;
      margin-right: 6px;
    }

    .arrow-icon {
      width: 12px;
      opacity: 0.6;
    }
  }
}
</style>
