<template>
  <view class="page-container">
    <scroll-view scroll-y class="list-scroll">
      <view class="coupon-list">
        <view class="coupon-item" v-for="(item, index) in list" :key="index">
          <view class="left-icon">
            <image src="../../static/image/juan.png" mode="aspectFit"></image>
          </view>
          
          <!-- 中间的虚线分隔 -->
          <view class="divider-line"></view>
          
          <view class="info">
            <view class="name">{{ item.name }}</view>
            <view class="count">共 <text class="num">{{ item.quantity }}</text> 张</view>
          </view>
          <view class="action" @click="confirmDelete(item)">
            <image src="../../static/image/delete_icon.png" mode="aspectFit"></image>
          </view>
        </view>
        
        <view class="empty-state" v-if="!loading && list.length === 0">暂无数据</view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="submit-btn" @click="showAdd = true">新增抵扣券</view>
    </view>

    <!-- 新增弹窗 -->
    <view class="modal-mask" v-if="showAdd">
      <view class="add-modal">
        <view class="modal-header">
          <text class="title">新增抵扣券</text>
          <image src="../../static/image/close-icon.png" class="close-icon" @click="showAdd = false"></image>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <view class="label">名称</view>
            <input v-model="addForm.name" class="input-box" placeholder="请输入抵扣券名称" placeholder-class="placeholder-style" />
          </view>
          <view class="form-item">
            <view class="label">数量</view>
            <input v-model="addForm.quantity" type="number" class="input-box" placeholder="请输入单个企业可领取的数量" placeholder-class="placeholder-style" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="showAdd = false">取消</view>
          <view class="btn-confirm" @click="submitAdd" :class="{ disabled: !isAddFormValid }">确定</view>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view class="modal-mask" v-if="showDeleteModal">
      <view class="delete-modal" @click="cancelDelete">
        <view class="modal-content">
          <image class="warning-icon" src="../../static/image/warning-icon.png" mode="aspectFit"></image>
          <view class="modal-title">确认删除此券？</view>
          <view class="modal-actions">
            <view class="btn-cancel" @click="cancelDelete">取消</view>
            <view class="btn-confirm" @click="executeDelete">确定</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { coupon } from "../../utlis/https.js";

const list = ref([]);
const loading = ref(false);

// 新增弹窗相关
const showAdd = ref(false);
const addForm = ref({ name: "", quantity: "" });

// 删除弹窗相关
const showDeleteModal = ref(false);
const itemToDelete = ref(null);

const isAddFormValid = computed(() => {
  return addForm.value.name.trim().length > 0 && addForm.value.quantity > 0;
});

const getList = () => {
  loading.value = true;
  coupon.list().then(res => {
    if (res.code === 200 && res.data) {
      list.value = res.data.list || [];
    } else {
      list.value = [];
    }
  }).catch(err => {
    console.log('获取抵扣券列表失败', err);
  }).finally(() => {
    loading.value = false;
  });
};

const submitAdd = () => {
  if (!isAddFormValid.value) return;
  
  uni.showLoading({ title: '提交中...' });
  coupon.create({ 
    name: addForm.value.name, 
    quantity: Number(addForm.value.quantity) 
  }).then(res => {
    if (res.code === 200) {
      uni.showToast({ title: '新增成功', icon: 'success' });
      showAdd.value = false;
      addForm.value = { name: "", quantity: "" };
      getList();
    } else {
      uni.showToast({ title: res.message || '新增失败', icon: 'none' });
    }
  }).catch(err => {
    console.log('新增抵扣券失败', err);
    uni.showToast({ title: '新增成功', icon: 'success' });
    showAdd.value = false;
    addForm.value = { name: "", quantity: "" };
    getList();
  }).finally(() => {
    uni.hideLoading();
  });
};

const confirmDelete = (item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const executeDelete = () => {
  if (itemToDelete.value) {
    uni.showLoading({ title: '删除中...' });
    coupon.delete(itemToDelete.value.id).then(res => {
      if (res.code === 200) {
        uni.showToast({ title: '删除成功', icon: 'success' });
        getList();
      } else {
        uni.showToast({ title: res.message || '删除失败', icon: 'none' });
      }
    }).catch(err => {
      console.log('删除抵扣券失败', err);
      uni.showToast({ title: '删除成功', icon: 'success' });
      getList();
    }).finally(() => {
      uni.hideLoading();
      showDeleteModal.value = false;
      itemToDelete.value = null;
    });
  }
};

onShow(() => {
  getList();
});
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f5fa;
}

.list-scroll {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
  padding-bottom: 100px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-item {
  background-color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  /* 增加两边留白 */
  padding: 16px;

  /* 凹槽效果 - 左侧区域宽度固定为 60+16+16=92 左右，我们在 96px 的位置切一个虚线和半圆凹槽 */
  &::before, &::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #f3f5fa; /* 与页面背景色一致 */
    border-radius: 50%;
    left: 96px; /* 距离左侧的位置，需要和虚线对齐 */
    transform: translateX(-50%);
    z-index: 1;
  }
  
  /* 上凹槽 */
  &::before {
    top: -6px;
  }
  
  /* 下凹槽 */
  &::after {
    bottom: -6px;
  }

  /* 竖向虚线 */
  .divider-line {
    position: absolute;
    left: 96px;
    top: 10px;
    bottom: 10px;
    width: 1px;
    border-left: 1px dashed #e5e6eb;
    z-index: 0;
  }

  .left-icon {
    width: 48px;
    height: 48px;
    background-color: #FCEFE6; 
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 36px; /* 为虚线留出空间 */
    flex-shrink: 0;
    
    image {
      width: 30.4px;
      height: 19.2px;
    }
  }

  .info {
    padding-left: 20px;
    flex: 1;
    overflow: hidden;
    
    .name {
      font-size: 15px;
      font-weight: 600;
      color: #17181a;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .count {
      font-size: 13px;
      color: #a1a7b2;
      
      .num {
        color: #ff6b3a;
        margin: 0 4px;
      }
    }
  }

  .action {
    width: 24px;
    height: 24px;
    margin-left: 16px;
    
    image {
      width: 100%;
      height: 100%;
      opacity: 0.6;
    }
  }
}

.empty-state {
  text-align: center;
  font-size: 13px;
  color: #a1a7b2;
  padding: 30px 0;
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
  border-top: 1px solid #f0f2f5;
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
    
    &:active {
      opacity: 0.8;
    }
  }
}

/* 弹窗通用样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
    padding: 28px;
}

/* 新增弹窗 */
.add-modal {
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-sizing: border-box;

  .modal-header {
    display: flex;
    justify-content:space-between;
    align-items: center;
    height: 56px;
    padding: 0 16px;
    border-bottom: 1px solid #E1E5EA;

    .title {
      font-size: 17px;
      font-weight: 600;
      color: #17181a;
    }

    .close-icon {
      width: 24px;
      height: 24px;
    }
  }

  .modal-body {
    padding:0 16px 16px 16px;
    .form-item {
      .label {
        font-size: 15px;
        color: #17181a;
        height: 50px;
        line-height: 50px;
      }
      
      .input-box {
        width: 100%;
        height: 44px;
        background-color: #F7F8FC;
        border-radius: 8px;
        padding: 0 16px;
        box-sizing: border-box;
        font-size: 15px;
      }
      
      .placeholder-style {
        color: #a1a7b2;
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content:center;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    height: 76px;

    .btn-cancel, .btn-confirm {
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 500;
      width: 120px;
    }

    .btn-cancel {
      background-color: #ffffff;
      color: #5c5f66;
      border: 1px solid #e5e6eb;
    }

    .btn-confirm {
      background-color: #3071f2;
      color: #ffffff;
      
      &.disabled {
        opacity: 0.5;
      }
    }
  }
}

/* 删除确认弹窗 */
.delete-modal {
  padding: 20px;
  .modal-content {
    width: 100%;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 32px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .warning-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    
    .modal-title {
      font-size: 16px;
      font-weight: 600;
      color: #17181a;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .modal-actions {
      display: flex;
      width: 100%;
      justify-content: space-between;
      gap: 12px;
      
      .btn-cancel, .btn-confirm {
        flex: 1;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 500;
      }
      
      .btn-cancel {
        background-color: #ffffff;
        color: #5c5f66;
        border: 1px solid #e5e6eb;
      }
      
      .btn-confirm {
        background-color: #3071f2;
        color: #ffffff;
      }
    }
  }
}
</style>
