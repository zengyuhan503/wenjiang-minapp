<template>
  <view class="container">

    <view class="form-wrapper">
      <!-- 联系人 -->
      <view class="form-item">
        <view class="label">联系人</view>
        <input class="input-field" type="text" v-model="formData.contact_name" placeholder="请填写您的称呼"
          placeholder-class="placeholder-style" />
      </view>

      <!-- 联系电话 -->
      <view class="form-item">
        <view class="label">联系电话</view>
        <input class="input-field" type="number" v-model="formData.contact_phone" placeholder="请填写联系电话"
          placeholder-class="placeholder-style" />
      </view>

      <!-- 留言内容 -->
      <view class="form-item">
        <view class="label">留言内容</view>
        <textarea class="textarea-field" v-model="formData.content" placeholder="请简要阐述您的留言内容"
          placeholder-class="placeholder-style" />
      </view>

      <!-- 图片上传 -->
      <view class="image-upload-section">
        <view class="image-list">
          <view class="image-item" v-for="(img, index) in formData.images" :key="index">
            <image :src="img" mode="aspectFill" @click="previewImage(index)"></image>
            <view class="del-icon" @click="delImage(index)">
              <image src="../../static/image/delete-img.png" mode="widthFix"></image>
            </view>
          </view>
          <!-- 上传按钮 -->
          <view class="upload-btn" @click="chooseImage" v-if="formData.images.length < 9">
            <image src="../../static/image/upload-add.png" mode="widthFix"></image>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="bottom-submit-bar">
      <view class="submit-btn" @click="submit">提交留言</view>
    </view>

    <!-- 弹窗组件 -->
    <SubmitResultDialog ref="submitDialog" />

    <!-- 留言成功弹窗 -->
    <view class="success-modal" v-if="showSuccessDialog">
      <view class="modal-mask"></view>
      <view class="modal-content">
        <image class="success-icon" src="../../static/image/success-green.png" mode="aspectFit"></image>
        <view class="modal-title">发布成功</view>
        <view class="modal-desc">您的留言已通知企业！ <br> 如企业有意向会线下联系您，谢谢。</view>
        <view class="modal-btn" @click="onCloseDialog">知道了</view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { supply, upload } from '../../utlis/https.js';
import SubmitResultDialog from '../../components/SubmitResultDialog.vue';
import CustomNavbar from "../../components/customNavbar.vue";

const submitDialog = ref(null);
const showSuccessDialog = ref(false);

const onCloseDialog = () => {
  showSuccessDialog.value = false;
  uni.navigateBack();
};

const formData = ref({
  supply_demand_id: '',
  contact_name: '',
  contact_phone: '',
  content: '',
  images: []
});

onLoad((options) => {
  if (options.id) {
    formData.value.supply_demand_id = options.id;
  }
});

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - formData.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uni.showLoading({ title: '上传中...' });
      try {
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          const filePath = res.tempFilePaths[i];
          const uploadRes = await upload.image(filePath);
          if (uploadRes && uploadRes.data && uploadRes.data.url) {
            formData.value.images.push(uploadRes.data.url);
          } else if (uploadRes && uploadRes.url) {
            formData.value.images.push(uploadRes.url);
          }
        }
      } catch (error) {
        uni.showToast({ title: '图片上传失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    }
  });
};

const delImage = (index) => {
  formData.value.images.splice(index, 1);
};

const previewImage = (index) => {
  uni.previewImage({
    urls: formData.value.images,
    current: index
  });
};

const submit = () => {
  // 手动表单校验
  if (!formData.value.contact_name.trim()) {
    return uni.showToast({ title: '请填写您的称呼', icon: 'none' });
  }
  if (!formData.value.contact_phone.trim()) {
    return uni.showToast({ title: '请填写联系电话', icon: 'none' });
  }
  if (!/^1[3-9]\d{9}$/.test(formData.value.contact_phone.trim())) {
    return uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
  }
  if (!formData.value.content.trim()) {
    return uni.showToast({ title: '请简要阐述您的留言内容', icon: 'none' });
  }

  uni.showLoading({ title: '提交中...' });

  // 构造提交参数
  const params = {
    ...formData.value,
    images: formData.value.images
  };

  supply.messageCreate(params).then(response => {
    uni.hideLoading();
    if (response.code === 200 || response.code === 0 || !response.code) {
      showSuccessDialog.value = true;
    } else {
      submitDialog.value.showSubmitFail(response.message || '提交失败');
    }
  }).catch(err => {
    uni.hideLoading();
    submitDialog.value.showSubmitFail('提交失败，请重试');
  });
};
</script>

<style lang="less" scoped>
.container {
  background: #FFFFFF;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.form-wrapper {
  padding: 20px 16px;
  flex: 1;
  /* 预留底部按钮空间 */
  padding-bottom: 100px;
}

.form-item {
  margin-bottom: 20px;

  .label {
    font-size: 15px;
    font-weight: 500;
    color: #17181a;
    margin-bottom: 12px;
  }

  .input-field {
    width: 100%;
    height: 48px;
    background: #F5F7FA;
    border-radius: 8px;
    padding: 0 16px;
    box-sizing: border-box;
    font-size: 15px;
    color: #17181a;
  }

  .textarea-field {
    width: 100%;
    height: 240px;
    background: #F5F7FA;
    border-radius: 8px;
    padding: 16px;
    box-sizing: border-box;
    font-size: 15px;
    color: #17181a;
  }

  .placeholder-style {
    color: #a1a7b2;
    font-size: 15px;
  }
}

.image-upload-section {
  margin-top: 10px;

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .image-item {
      position: relative;
      width: 108px;
      height: 108px;
      border-radius: 8px;
      overflow: hidden;

      image {
        width: 100%;
        height: 100%;
      }

      .del-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 16px;
        height: 16px;

        image {
          width: 16px;
          height: 16px;
        }
      }
    }

    .upload-btn {
      width: 108px;
      height: 108px;
      background: #F7F8FC;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      image {
        width: 24px;
        height: 24px;
      }
    }
  }
}

/* 底部提交按钮 */
.bottom-submit-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px 28px;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid #f0f2f5;
  z-index: 100;

  .submit-btn {
    width: 100%;
    height: 44px;
    background: #3071f2;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;

    &:active {
      opacity: 0.8;
    }
  }
}

/* 成功弹窗样式 */
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: relative;
    width: 311px;
    background: #FFFFFF;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px 24px;
    box-sizing: border-box;
    z-index: 1000;

    .success-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .modal-title {
      font-size: 16px;
      font-weight: 500;
      color: #17181A;
      line-height: 25px;
      margin-bottom: 5px;
      text-align: center;
    }

    .modal-desc {
      font-size: 14px;
      color: #5C5F66;
      line-height: 22px;
      text-align: center;
      margin-bottom: 24px;
    }

    .modal-btn {
      width: 200px;
      height: 40px;
      background: #3071f2;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 500;
      color: #FFFFFF;

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
