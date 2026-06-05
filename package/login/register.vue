<template>
  <view class="register-main">
    <CustomNavbar :onBack="goToOut" title="企业注册" />
    <view class="register-content">
      <view class="form-group">
        <view class="form-label">手机号/登录账号</view>
        <view class="form-input">
          <uni-easyinput v-model="formState.mobile" placeholder="请输入手机号/登录账号"
            placeholderStyle="font-size:15px; color:#A1A7B2;" :clearable="false" />
        </view>
      </view>

      <view class="form-group">
        <view class="form-label">验证码</view>
        <view class="form-input code-input">
          <uni-easyinput v-model="formState.sms_code" placeholder="请输入验证码"
            placeholderStyle="font-size:15px; color:#A1A7B2;" :clearable="false" />
          <view class="send-code-btn" :class="{ disabled: countdown > 0 }" @click="sendCode">
            {{ countdown > 0 ? countdown + 's' : '发送验证码' }}
          </view>
        </view>
      </view>

      <view class="form-group">
        <view class="form-label">企业名称</view>
        <view class="form-input">
          <uni-easyinput v-model="formState.company_name" placeholder="请输入企业名称"
            placeholderStyle="font-size:15px; color:#A1A7B2;" :clearable="false" />
        </view>
      </view>

      <view class="form-group">
        <view class="form-label">联系人姓名</view>
        <view class="form-input">
          <uni-easyinput v-model="formState.contact_name" placeholder="请输入联系人姓名"
            placeholderStyle="font-size:15px; color:#A1A7B2;" :clearable="false" />
        </view>
      </view>

      <view class="submit-btn-wrap">
        <button class="submit-btn" type="primary" @click="onSubmit">提交</button>
      </view>

      <!-- Success Modal -->
      <view class="success-modal" v-if="showSuccessModal">
        <view class="modal-content">
          <view class="icon-wrap">
            <image src="/static/sub_suncess.png" mode="widthFix" />
          </view>
          <view class="text-wrap">您的申请已提交，请等待后台审核</view>
          <button class="confirm-btn" type="primary" @click="closeModal">知道了</button>
        </view>
      </view>

      <!-- 阿里云图形验证码组件 -->
      <captcha4 id="captcha" captchaId="80f23e6ac6bc401f4c0b45bdbc33ffca" :useNativeButton="false"
        @success="captchaSuccess" @ready="captchaReady" @error="captchaError" @close="captchaClose"
        @fail="captchaFail" />
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { onReady } from "@dcloudio/uni-app";
import { companyApply } from "/utlis/https";
import CustomNavbar from "@/components/customNavbar.vue";

const formState = ref({
  mobile: "",
  sms_code: "",
  company_name: "",
  contact_name: "",
});

const countdown = ref(0);
let timer = null;
const showSuccessModal = ref(false);
const instance = getCurrentInstance();

// 核心修复：uni-app Vue3 <script setup> 编译后函数不在 methods 中，
// 小程序原生事件绑定 bindsuccess 找不到回调。
// 通过 uni.$on 监听 wrapper 组件拦截后发出的全局事件
onReady(() => {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  if (page) {
    page.captchaSuccess = captchaSuccess;
    page.captchaReady = captchaReady;
    page.captchaError = captchaError;
    page.captchaClose = captchaClose;
    page.captchaFail = captchaFail;
  }

  uni.$on("captcha4:success", captchaSuccess);
  uni.$on("captcha4:ready", captchaReady);
  uni.$on("captcha4:error", captchaError);
  uni.$on("captcha4:close", captchaClose);
  uni.$on("captcha4:fail", captchaFail);
});

const goToOut = () => {
  uni.navigateBack();
};

const sendCode = () => {
  if (countdown.value > 0) return;
  if (!formState.value.mobile) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(formState.value.mobile)) {
    uni.showToast({ title: "请输入正确的手机号", icon: "none" });
    return;
  }

  // 唤起无按钮模式的图形验证码
  const captcha = instance.proxy.selectComponent('#captcha');
  if (captcha && typeof captcha.showCaptcha === 'function') {
    captcha.showCaptcha();
  } else {
    uni.showToast({ title: "图形验证组件未就绪，请稍后再试", icon: "none" });
  }
};

// 图形验证成功回调
const captchaSuccess = (e) => {
  // 兼容两种来源：原生组件事件对象(e.detail) 或 uni.$emit 直接传来的 detail
  const captchaResult = e && e.detail ? e.detail : e;
  console.log(captchaResult);
  uni.showLoading({ title: "发送中..." });
  // 将图形验证结果（包含 lot_number, pass_token, gen_time, captcha_output 等）传给后端
  companyApply
    .sendCode({
      mobile: formState.value.mobile,
      ...captchaResult
    })
    .then((res) => {
      uni.hideLoading();
      if (res.code == 200 || res.code == 0) {
        uni.showToast({ title: "验证码已发送", icon: "none" });
        countdown.value = 60;

        if (timer) clearInterval(timer);

        timer = setInterval(() => {
          countdown.value--;
          if (countdown.value <= 0) {
            clearInterval(timer);
            timer = null;
          }
        }, 1000);
      } else {
        uni.showToast({ title: res.message || "发送失败", icon: "none", duration: 2000 });
      }
    })
    .catch((err) => {
      uni.hideLoading();
      uni.showToast({ title: "发送失败", icon: "none", duration: 2000 });
    });
};

const captchaReady = () => { };

const captchaError = (e) => {
  uni.showToast({ title: "验证出错，请重试", icon: "none", duration: 2000 });
};

const captchaClose = () => { };

const captchaFail = (e) => {
  uni.showToast({ title: "验证失败，请重试", icon: "none", duration: 2000 });
};

const onSubmit = () => {
  if (!formState.value.mobile) {
    uni.showToast({ title: "请输入手机号", icon: "none", duration: 2000 });
    return;
  }
  if (!formState.value.sms_code) {
    uni.showToast({ title: "请输入验证码", icon: "none", duration: 2000 });
    return;
  }
  if (!formState.value.company_name) {
    uni.showToast({ title: "请输入企业名称", icon: "none", duration: 2000 });
    return;
  }
  if (!formState.value.contact_name) {
    uni.showToast({ title: "请输入联系人姓名", icon: "none", duration: 2000 });
    return;
  }

  uni.showLoading({ title: "提交中..." });
  companyApply
    .submit(formState.value)
    .then((res) => {
      uni.hideLoading();
      if (res.code == 200) {
        showSuccessModal.value = true;
      } else {
        uni.showToast({ title: res.message || "提交失败", icon: "none", duration: 2000 });
      }
    })
    .catch((err) => {
      uni.hideLoading();
      uni.showToast({ title: "提交失败", icon: "none", duration: 2000 });
    });
};

const closeModal = () => {
  showSuccessModal.value = false;
  uni.navigateBack();
};
</script>

<style lang="less" scoped>
.register-main {
  min-height: 100vh;
  background: #ffffff;
}

.register-content {
  background: #ffffff;
  padding: 16px;
  margin-top: 90px;
}

.form-group {
  margin-bottom: 24px;

  .form-label {
    font-size: 15px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    color: #17181a;
    margin-bottom: 12px;
  }

  .form-input {
    :deep(.uni-easyinput) {
      .is-input-border {
        border: none !important;
        background-color: #f2f5fa !important;
        border-radius: 8px !important;
        height: 44px;
      }

      .uni-easyinput__content-input {
        padding-left: 15px !important;
      }

      input {
        font-size: 15px;
        color: #17181a;
        font-family: PingFang SC, PingFang SC;
      }
    }
  }

  .code-input {
    display: flex;
    align-items: center;
    justify-content: space-between;

    :deep(.uni-easyinput) {
      flex: 1;
      margin-right: 15px;
    }

    .send-code-btn {
      width: 106px;
      height: 44px;
      line-height: 44px;
      text-align: center;
      background: #f2f5fa;
      border-radius: 8px;
      font-size: 14px;
      color: #3071f2;
      font-weight: 500;

      &.disabled {
        color: #a1a7b2;
      }
    }
  }
}

.submit-btn-wrap {
  margin-top: 50px;

  .submit-btn {
    background: #3071f2;
    border-radius: 8px;
    color: #ffffff;
    font-size: 16px;
    height: 44px;
    line-height: 44px;

    &:after {
      border: none;
    }
  }
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-content {
    width: 300px;
    background: #ffffff;
    border-radius: 12px;
    padding: 30px 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .icon-wrap {
      width: 38px;
      height: 38px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      image {
        width: 38px;
        height: 38px;
      }
    }

    .text-wrap {
      font-family: PingFang SC, PingFang SC;
      font-weight: 500;
      font-size: 16px;
      color: #17181A;
      line-height: 24px;
      margin-bottom: 34px;
      text-align: center;
    }

    .confirm-btn {
      width: 200px;
      height: 40px;
      line-height: 40px;
      background: #3071f2;
      border-radius: 8px;
      color: #ffffff;
      font-size: 15px;

      &:after {
        border: none;
      }
    }
  }
}
</style>
