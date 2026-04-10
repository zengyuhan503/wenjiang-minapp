<template>
  <view class="page-container">
    <CustomNavbar />
    <view class="header-bg">
      <view class="company-info">
        <image class="back" src="../../static/image/company-back.png" mode="widthFix"></image>
        <image src="../../static/image/company-house.png" class="house-icon" mode="aspectFit"></image>
        <view class="company-name">{{ companyName }}</view>
      </view>
    </view>
    
    <view class="menu-list">
      <view class="menu-item" @click="navTo('/package/company/coupon-desc')">
        <text class="label">券说明</text>
        <view class="right">
          <text class="hint">去修改</text>
          <image src="https://louyu.zdocd.com/wxapp/static/image/right.png" class="arrow" mode="widthFix"></image>
        </view>
      </view>
      <view class="menu-item" @click="navTo('/package/company/coupon-list')">
        <text class="label">抵扣券设置</text>
        <view class="right">
          <text class="hint">去设置</text>
          <image src="https://louyu.zdocd.com/wxapp/static/image/right.png" class="arrow" mode="widthFix"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { user } from "../../utlis/https.js";
import CustomNavbar from "@/components/customNavbar.vue";

const companyName = ref("");

const navTo = (url) => {
  uni.navigateTo({ url });
};

onShow(() => {
  // 获取企业信息，以防万一接口中有对应的公司名称字段
  user.getInfo().then(res => {
    if (res.code === 200 && res.data && res.data.company && res.data.company.name) {
      // 假设 property1 是公司名称
      companyName.value = res.data.company.name;
    }
  });
});
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  background-color: #ffffff;
}

.header-bg {
  width: 100%;
  height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 假设有背景图叠加，可在此添加 */
  /* background-image: url('...'); background-size: cover; */
 
}

.company-info {
text-align: center;
  margin-top: 20px;
  text-align: center;
  padding-top: 58px;
   .back{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
    z-index: 1;
  }
  .house-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    position: relative;
    z-index: 2;
  }
  
  .company-name {
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
    text-align: center;
    position: relative;
    z-index: 2;
  }
}

.menu-list {
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  border-bottom: 1px solid #f0f2f5;
  height: 56px;


  .label {
    font-size: 15px;
    font-weight: 500;
    color: #2E2F33;
    font-family: PingFang SC, PingFang SC;
  }

  .right {
    display: flex;
    align-items: center;
    width: auto;

    .hint {
      font-size: 14px;
      color: #a1a7b2;
      margin-right: 6px;
    }

    .arrow {
      width: 14px;
      opacity: 0.6;
    }
  }
}
</style>
