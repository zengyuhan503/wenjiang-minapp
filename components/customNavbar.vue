<template>
  <view
    class="custom-navbar"
    :style="{ paddingTop: statusBarHeight + 'px', height: navBarHeight + 'px', backgroundColor: bgColor }"
  >
    <view class="nav-content">
      <!-- 返回按钮区域 -->
      <view class="back-btn" @click="handleBack">
        <slot name="back">
          <uni-icons type="left" size="20" :color="titleColor"></uni-icons>
        </slot>
      </view>

      <!-- 标题区域 -->
      <view class="nav-title" :style="{ color: titleColor }">
        <slot name="title">
          {{ title }}
        </slot>
      </view>
    </view>
  </view>
  <view class="out-model" v-if="openOutModel">
    <div class="model-content">
      <image
        src="https://louyu.zdocd.com/wxapp/static/image/waring.webp"
        class="waring"
        mode="widthFix"
      />
      <view class="content">是否确认退出该账号？</view>
      <view class="btns">
        <button type="default" @click="onClean">取消</button>
        <button type="primary" @click="onOut">确定</button>
      </view>
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
  titleColor: { type: String, default: "#000" },
  bgColor: { type: String, default: "transparent" },
  onBack: Function, // 自定义返回行为
});

let emit = defineEmits(["changeOutModel"]);
const statusBarHeight = ref(20);
const navBarHeight = ref(64);
const openOutModel = ref(false);

onMounted(() => {
  const sys = uni.getSystemInfoSync();
  statusBarHeight.value = sys.statusBarHeight;
  navBarHeight.value = sys.statusBarHeight + 44;
});
function showOutModel() {
  openOutModel.value = true;
}
function handleBack() {
  if (typeof props.onBack === "function") {
    props.onBack();
  } else {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
    } else {
      uni.switchTab({ url: "/pages/home/index" });
    }
  }
}

const onOut = () => {
  uni.removeStorageSync("isLogin");
  uni.removeStorageSync("token");
  uni.removeStorageSync("expire_at");
  uni.removeStorageSync("refresh_token");
  openOutModel.value = false;
  wx.redirectTo({ url: "/pages/home/index" });
  emit("changeOutModel", false);
};
const onClean = () => {
  openOutModel.value = false;
  emit("changeOutModel", false);
};
defineExpose({
  showOutModel,
});
</script>
<style scoped lang="less">
.out-model {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  .model-content {
    width: 280px;
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    padding: 24px 16px 18px 16px;
    text-align: center;
  }
  .waring {
    width: 56px;
    height: 56px;
  }
  .content {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: #17181a;
    line-height: 24px;
    letter-spacing: 1px;
    text-align: center;
    margin-top: 16px;
  }
  .btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 34px;
    button {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 16px;
      line-height: 44px;
      width: 100%;
      &:first-child {
        background: #ffffff;
        border-radius: 8px 8px 8px 8px;
        border: 1px solid #ced3d9;
        margin-right: 8px;
        color: #303233;
      }
      &:last-child {
        color: #ffffff;
        background: #3071f2;
        border-radius: 8px 8px 8px 8px;
        border-color: #3071f2;
      }
    }
  }
}
</style>
<style scoped>
.custom-navbar {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}
.nav-content {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  position: relative;
}
.back-btn {
  width: 44px;
  height: 44px;
  position: absolute;
  left: 12px;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon image {
  width: 20px;
}
.back-icon {
  width: 20px;
  height: 20px;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}
.nav-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
