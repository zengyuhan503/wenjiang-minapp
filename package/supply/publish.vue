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
              src="https://louyu.zdocd.com/wxapp/static/image/radio-checked.png" 
              mode="aspectFit"
            ></image>
            <image 
              v-else 
              class="radio-icon" 
              src="https://louyu.zdocd.com/wxapp/static/image/radio-unchecked.png" 
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
              src="https://louyu.zdocd.com/wxapp/static/image/radio-checked.png" 
              mode="aspectFit"
            ></image>
            <image 
              v-else 
              class="radio-icon" 
              src="https://louyu.zdocd.com/wxapp/static/image/radio-unchecked.png" 
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
            <image src="https://louyu.zdocd.com/wxapp/static/image/delete-img.png" class="delete-icon" mode="aspectFit" @click.stop="removeImage(index)"></image>
          </view>
          
          <view class="upload-btn" @click="chooseImage" v-if="formData.images.length < 9">
            <image src="https://louyu.zdocd.com/wxapp/static/image/upload-add.png" class="upload-icon" mode="aspectFit"></image>
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
    <SuccessModal 
      :visible="showSuccessDialog" 
      title="发布成功" 
      desc="请等待平台审核！ <br> 可在“我的供需”中查看审核状态 <br> 以及企业向你提交的意向联系方式"
      @close="onCloseDialog" 
    />

  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import CustomNavbar from "@/components/customNavbar.vue";
import SuccessModal from "@/components/successModal.vue";
import { supply, upload } from "@/utlis/https.js";

const formData = ref({
  type: 1, // 1 供应，2 求购
  title: "",
  content: "",
  images: []
});

let currentId = null;
const showSuccessDialog = ref(false);

onLoad((options) => {
  if (options.id) {
    currentId = options.id;
    getDetail(options.id);
  }
});

const getDetail = (id) => {
  uni.showLoading({ title: '加载中...' });
  supply.detail(id).then(res => {
    if (res.code == 200 && res.data) {
      const data = res.data;
      formData.value = {
        type: data.type || 1,
        title: data.title || "",
        content: data.content || "",
        images: data.images || []
      };
    }
  }).catch(err => {
    console.log("获取供需详情失败", err);
  }).finally(() => {
    uni.hideLoading();
  });
};

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
    success: async (res) => {
      uni.showLoading({ title: '上传中...' });
      try {
        const uploadPromises = res.tempFilePaths.map(path => {
          return upload.image(path).then(uploadRes => {
            // 根据实际接口返回结构调整，假设为 uploadRes.data.url
            let url = uploadRes;
            if (uploadRes && uploadRes.data && uploadRes.data.url) {
              url = uploadRes.data.url;
            } else if (uploadRes && uploadRes.url) {
              url = uploadRes.url;
            }
            return url;
          });
        });
        
        const urls = await Promise.all(uploadPromises);
        formData.value.images.push(...urls.filter(url => url));
      } catch (err) {
        console.log("图片上传失败", err);
        uni.showToast({ title: '图片上传失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
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
  
  uni.showLoading({ title: '提交中...' });
  
  if (currentId) {
    // 更新
    supply.update(currentId, formData.value).then(res => {
      uni.hideLoading();
      if (res.code == 200 || res.code === 0 || !res.code) {
        showSuccessDialog.value = true;
      } else {
        uni.showToast({ title: res.message || '更新失败', icon: 'none' });
      }
    }).catch(err => {
      uni.hideLoading();
      console.log("更新供需失败", err);
      uni.showToast({ title: '更新失败', icon: 'none' });
    });
  } else {
    // 新增
    supply.create(formData.value).then(res => {
      uni.hideLoading();
      if (res.code == 200 || res.code === 0 || !res.code) {
        showSuccessDialog.value = true;
      } else {
        uni.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    }).catch(err => {
      uni.hideLoading();
      console.log("发布供需失败", err);
      uni.showToast({ title: '发布失败', icon: 'none' });
    });
  }
};

const onCloseDialog = () => {
  showSuccessDialog.value = false;
  
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 弹窗关闭后返回上一页，如果当前是第一页，则跳转回供需列表
    uni.switchTab({ url: '/pages/supply/index' });
  }
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
  font-weight: 500;
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
  padding: 16px 28px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  border-top: 1px solid #E1E5EA;
  
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

</style>
