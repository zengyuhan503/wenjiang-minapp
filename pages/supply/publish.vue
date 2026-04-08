<template>
  <view class="page-container">

    <view scroll-y class="form-scroll">
      <!-- 类型选择 -->
      <view class="form-section">
        <view class="section-title">类型</view>
        <view class="type-options">
          <view 
            class="type-item" 
            :class="{ active: formData.type === 1 }" 
            @click="selectType(1)"
          >
            <text>供应</text>
            <image 
              v-if="formData.type === 1" 
              class="radio-icon" 
              src="../../static/image/radio-checked.png" 
              mode="aspectFit"
            ></image>
            <image 
              v-else 
              class="radio-icon" 
              src="../../static/image/radio-unchecked.png" 
              mode="aspectFit"
            ></image>
          </view>
          
          <view 
            class="type-item" 
            :class="{ active: formData.type === 2 }" 
            @click="selectType(2)"
          >
            <text>求购</text>
            <image 
              v-if="formData.type === 2" 
              class="radio-icon" 
              src="../../static/image/radio-checked.png" 
              mode="aspectFit"
            ></image>
            <image 
              v-else 
              class="radio-icon" 
              src="../../static/image/radio-unchecked.png" 
              mode="aspectFit"
            ></image>
          </view>
        </view>
      </view>

      <!-- 标题和内容输入区 -->
      <view class="form-section">
        <view class="section-title">标题</view>
        <view class="input-wrapper">
          <input 
            class="title-input" 
            v-model="formData.title" 
            placeholder="请简要说明您的供需或想推广的产品及服务" 
            placeholder-class="placeholder-style"
          />
          <view class="divider"></view>
          <view 
            class="content-textarea" >
            <textarea 
            v-model="formData.content" 
            placeholder="您可以详细表述您想求购的产品或介绍您的企业，以达成互利；提交后需平台审核后再展示，其他企业可以在您的供需下提交联系方式，建立线下联系，联系方式不对外展示。" 
            placeholder-class="placeholder-style"
            :maxlength="500"
            auto-height
          ></textarea>
          </view>
        </view>
      </view>

      <!-- 图片上传区 -->
      <view class="form-section image-section">
        <view class="image-list">
          <view class="image-item" v-for="(img, index) in formData.images" :key="index">
            <image :src="img" mode="aspectFill" class="uploaded-img" @click="previewImage(img)"></image>
            <image src="../../static/image/delete-img.png" class="delete-icon" mode="aspectFit" @click.stop="removeImage(index)"></image>
          </view>
          
          <view class="upload-btn" @click="chooseImage" v-if="formData.images.length < 9">
            <image src="../../static/image/upload-add.png" class="upload-icon" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: !isFormValid }" @click="onSubmit">
        确认发布
      </view>
    </view>

    <!-- 发布成功弹窗 -->
    <view class="success-modal" v-if="showSuccessDialog">
      <view class="modal-mask"></view>
      <view class="modal-content">
        <image class="success-icon" src="../../static/image/success-green.png" mode="aspectFit"></image>
        <view class="modal-title">发布成功</view>
        <view class="modal-desc">您的留言已通知企业<br>，如企业有意向会线下联系您，谢谢。</view>
        <view class="modal-btn" @click="onCloseDialog">知道了</view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import CustomNavbar from "../../components/customNavbar.vue";

const formData = ref({
  type: 1, // 1 供应，2 求购
  title: "",
  content: "",
  images: []
});

const showSuccessDialog = ref(false);

// 表单验证，根据UI图，输入标题和内容后按钮才高亮
const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0 && formData.value.content.trim().length > 0;
});

const selectType = (type) => {
  formData.value.type = type;
};

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - formData.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 模拟上传成功，直接使用本地临时路径
      formData.value.images.push(...res.tempFilePaths);
    }
  });
};

const removeImage = (index) => {
  formData.value.images.splice(index, 1);
};

const previewImage = (current) => {
  uni.previewImage({
    current,
    urls: formData.value.images
  });
};

const onSubmit = () => {
  if (!isFormValid.value) return;
  
  uni.showLoading({ title: '发布中...' });
  
  // 模拟接口请求
  setTimeout(() => {
    uni.hideLoading();
    showSuccessDialog.value = true;
  }, 1000);
};

const onCloseDialog = () => {
  showSuccessDialog.value = false;
  // 弹窗关闭后返回上一页
  uni.navigateBack();
};
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.form-scroll {
  flex: 1;
  overflow: hidden;
  padding: 0 12px;
  /* 预留底部按钮空间 */
  padding-bottom: 100px;
}

.form-section {
  margin-top: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #17181a;
  margin-bottom: 16px;
}

/* 类型选择 */
.type-options {
  display: flex;
  gap: 15px;
  
  .type-item {
    flex: 1;
    height: 48px;
    background-color: #f7f8fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border: 1px solid transparent;
    transition: all 0.3s;
    
    text {
      font-size: 15px;
      color: #5c5f66;
    }
    
    .radio-icon {
      width: 18px;
      height: 18px;
    }
    
    &.active {
      background-color: rgba(48, 113, 242, 0.05);
      border-color: #3071f2;
      
      text {
        color: #3071f2;
        font-weight: 500;
      }
    }
  }
}

/* 输入区 */
.input-wrapper {
  background-color: #f7f8fa;
  border-radius: 8px;
}

.title-input {
  font-size: 15px;
  font-weight: 600;
  color: #17181a;
  height: 48px;
  line-height: 48px;
  padding: 0 12px;
}

.divider {
  height: 1px;
  background-color: #e5e6eb;
}
 
.content-textarea {
  width: 100%;
  font-size: 15px;
  color: #2E2F33;
  line-height: 24px;
  padding: 10px 12px;
  textarea {
    width: 100%;
    min-height: 240px;
  }
}

.placeholder-style {
  color: #a1a7b2;
  font-weight: normal;
}

/* 图片上传 */
.image-section {
  margin-top: 16px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  .image-item {
    position: relative;
    width: 108px;
    height: 108px;
    border-radius: 8px;
    
    .uploaded-img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    
    .delete-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
      background-color: #ffffff;
      border-radius: 50%;
    }
  }
  
  .upload-btn {
    width: 108px;
    height: 108px;
    background-color: #f7f8fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .upload-icon {
      width: 24px;
      height: 24px;
    }
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
  padding: 0 20px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  
  .submit-btn {
    width: 100%;
    height: 48px;
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

/* 成功弹窗 */
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
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    position: relative;
    width: 280px;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 32px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .success-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    
    .modal-title {
      font-size: 16px;
      font-weight: 500;
      color: #17181a;
      margin-bottom: 12px;
      text-align: center;
    }
    
    .modal-desc {
      font-size: 13px;
      color: #5c5f66;
      line-height: 20px;
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
      font-size: 15px;
      font-weight: 500;
      color: #ffffff;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
