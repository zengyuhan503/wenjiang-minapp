<template>
  <view class="success-modal" v-if="visible">
    <view class="modal-mask"></view>
    <view class="modal-content">
      <image class="success-icon" src="../static/image/success-green.png" mode="aspectFit"></image>
      <view class="modal-title">{{ title }}</view>
      <view class="modal-desc">
        <slot>
          <rich-text :nodes="desc"></rich-text>
        </slot>
      </view>
      <view class="modal-btn" @click="onClose">知道了</view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '操作成功'
  },
  desc: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const onClose = () => {
  emit('close');
};
</script>

<style lang="less" scoped>
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
    padding: 24px 20px 16px 20px;
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
      margin-bottom: 20px;
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
