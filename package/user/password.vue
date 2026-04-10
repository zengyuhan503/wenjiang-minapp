<template>
  <view class="page-container">
    <view class="form-container">
      <view class="form-item">
        <view class="label">原密码</view>
        <input 
          class="input-box" 
          type="password" 
          v-model="formData.old_password" 
          placeholder="请输入原密码" 
          placeholder-class="placeholder-style"
          :maxlength="32"
        />
      </view>
      
      <view class="form-item">
        <view class="label">新密码</view>
        <input 
          class="input-box" 
          type="password" 
          v-model="formData.password" 
          placeholder="请输入新密码" 
          placeholder-class="placeholder-style"
          :maxlength="32"
        />
      </view>
      
      <view class="form-item">
        <view class="label">确认新密码</view>
        <input 
          class="input-box" 
          type="password" 
          v-model="formData.password_confirmation" 
          placeholder="请再次输入新密码" 
          placeholder-class="placeholder-style"
          :maxlength="32"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: !isFormValid }" @click="onSubmit">
        确认修改
      </view>
    </view>

    <!-- 成功弹窗 -->
    <SuccessModal 
      :visible="showSuccessDialog" 
      title="修改成功" 
      desc="您的登录密码已修改成功，请使用新密码重新登录。"
      @close="onCloseDialog" 
    />

  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { user } from "@/utlis/https.js";
import SuccessModal from "@/components/successModal.vue";

const formData = ref({
  old_password: "",
  password: "",
  password_confirmation: ""
});

const showSuccessDialog = ref(false);

const isFormValid = computed(() => {
  const { old_password, password, password_confirmation } = formData.value;
  return old_password.length > 0 && 
         password.length >= 6 && 
         password.length <= 32 && 
         password_confirmation === password;
});

const onSubmit = () => {
  if (!isFormValid.value) {
    if (formData.value.password.length > 0 && formData.value.password.length < 6) {
      uni.showToast({ title: '新密码不能少于6位', icon: 'none' });
      return;
    }
    if (formData.value.password !== formData.value.password_confirmation) {
      uni.showToast({ title: '两次输入的新密码不一致', icon: 'none' });
      return;
    }
    return;
  }
  
  uni.showLoading({ title: '提交中...' });
  
  user.password(formData.value).then(res => {
    uni.hideLoading();
    if (res.code === 200) {
      showSuccessDialog.value = true;
    } else {
      uni.showToast({ title: res.message || '修改失败', icon: 'none' });
    }
  }).catch(err => {
    uni.hideLoading();
    console.log("修改密码失败", err);
    uni.showToast({ title: err?.message || '修改密码失败', icon: 'none' });
  });
};

const onCloseDialog = () => {
  showSuccessDialog.value = false;
  // 避免在第一页时调用 navigateBack 报错
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 如果已经是第一页，则跳转回首页或其他默认页面
    uni.switchTab({ url: '/pages/home/index' });
  }
};
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.form-container {
  padding:0 12px;
  flex: 1;
}

.form-item {
  
  .label {
    font-size: 15px;
    font-weight: 500;
    color: #17181a;
    height: 50px;
    line-height: 50px;
  }
  
  .input-box {
    width: 100%;
    height: 48px;background: #F5F7FA;
    border-radius: 8px;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 15px;
    color: #17181a;
  }
  
  .placeholder-style {
    color: #8A8C99;
    font-size: 15px;
  }
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 90px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px 28px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  border-top: 1px solid #E1E5EA;

  
  .submit-btn {
    width: 320px;
    height: 40px;
    background: #3071f2;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    transition: all 0.3s;
    
    &.disabled {
      background: #c2d6ff;
      opacity: 0.8;
    }
    
    &:not(.disabled):active {
      opacity: 0.8;
    }
  }
}

</style>
