<template>
  <view class="page-container">
    <scroll-view scroll-y class="list-section" @scrolltolower="loadMore">
      <view class="list-container">
        <view class="item-card" v-for="(item, index) in list" :key="index" @click="goToDetail(item)">
          <!-- 状态角标 -->
          <view class="status-badge" >
              <image v-if="item.audit_status  == 0" src="../../static/image/pending.png" class="status-icon" mode="aspectFit"></image>
              <image v-if="item.audit_status  == 1" src="../../static/image/success.png" class="status-icon" mode="aspectFit"></image>
              <image v-if="item.audit_status  == 2" src="../../static/image/fail.png" class="status-icon" mode="aspectFit"></image>
          </view>
          
          <view class="item-title">{{ item.title }}</view>
          
          <view class="item-middle">
            <view class="info-group">
              <text class="type-tag" :class="item.type == 1 ? 'supply' : 'demand'">
                {{ item.type == 1 ? '供应' : '求购' }}
              </text>
              <text class="date">{{ item.created_at || item.date }}</text>
            </view>
            
          <view class="action-group">
            <image v-if="item.audit_status  == 2" src="../../static/image/edit_icon.png" class="action-icon" mode="aspectFit" @click.stop="onEdit(item)"></image>
            <image src="../../static/image/delete_icon.png" class="action-icon" mode="aspectFit" @click.stop="onDelete(item)"></image>
          </view>
          </view>

          <!-- 留言数量提示 -->
          <view>
            <view class="message-count" v-if="item.message_company_count > 0 && item.audit_status == 1" @click.stop="goToMyDetail(item)">
              已有{{ item.message_company_count }}家企业留言
              <view class="count-badge">{{ item.unread_message_count > 99 ? '99+' : item.unread_message_count }}</view>
            </view>
          </view>

          <!-- 拒绝原因 -->
          <view class="reject-reason" v-if="item.audit_status == 2">
            拒绝原因：{{ item.reject_reason }}
          </view>
        </view>
        
        <view class="loading-status" v-if="loading">加载中...</view>
        <view class="no-more" v-if="!loading && noMore">没有更多了</view>
        <view class="empty-state" v-if="!loading && list.length === 0">暂无数据</view>
      </view>
    </scroll-view>

    <!-- 底部悬浮按钮 -->
    <view class="bottom-bar">
      <view class="publish-btn" @click="onPublish">发布供需</view>
    </view>
    <!-- 删除确认弹窗 -->
    <view class="delete-modal" v-if="showDeleteModal">
      <view class="modal-mask" @click="cancelDelete"></view>
      <view class="modal-content">
        <image class="warning-icon" src="../../static/image/warning-icon.png" mode="aspectFit"></image>
        <view class="modal-title">确认删除此供需消息？</view>
        <view class="modal-actions">
          <view class="btn-cancel" @click="cancelDelete">取消</view>
          <view class="btn-confirm" @click="confirmDelete">确定</view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { supply } from "../../utlis/https.js";
import CustomNavbar from "../../components/customNavbar.vue";

const list = ref([]);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const noMore = ref(false);
const showDeleteModal = ref(false);
const itemToDelete = ref(null);

const getList = (reset = false) => {
  if (reset) {
    page.value = 1;
    list.value = [];
    noMore.value = false;
  }
  if (loading.value || noMore.value) return;

  loading.value = true;
  
  supply.my({ page: page.value, page_size: pageSize.value }).then(res => {
    if (res.code == 200 && res.data) {
      let newData = res.data.list || [];
      
      // 添加模拟测试数据以展示 UI
      if (newData.length === 0 && page.value === 1) {
        newData = []; // 数据已经在 addMockData 中推入，这里清空避免重复逻辑
      } else {
        if (newData.length < pageSize.value) {
          noMore.value = true;
        }
        list.value = [...list.value, ...newData];
      }
      page.value++;
    } 
  }).catch(err => {
    console.log("获取我的供需列表失败", err);
  }).finally(() => {
    loading.value = false;
  });
};


const loadMore = () => {
  getList();
};


const onEdit = (item) => {
  uni.navigateTo({
    url: `/pages/supply/publish?id=${item.id}`
  });
};

const onDelete = (item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const confirmDelete = () => {
  if (itemToDelete.value) {
    // 调用删除接口并刷新列表
    supply.delete(itemToDelete.value.id).then(res => {
      if (res.code == 200 || res.code === 0 || !res.code) {
        uni.showToast({ title: '删除成功', icon: 'none' });
        getList(true); // 成功后重新加载第一页数据
      } else {
        uni.showToast({ title: res.message || res.msg || '删除失败' , icon: 'none' });
      }
    }).catch(err => {
      console.log("删除供需失败", err);
      uni.showToast({ title: err?.message || err?.msg || '删除失败' , icon: 'none' });
    }).finally(() => {
      showDeleteModal.value = false;
      itemToDelete.value = null;
    });
  }
};

const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/supply/detail?id=${item.id}&from=my`
  });
};

const goToMyDetail = (item) => {
  uni.navigateTo({
    url: `/pages/supply/my-detail?id=${item.id}`
  });
};

const onPublish = () => {
  uni.navigateTo({
    url: '/pages/supply/publish'
  });
};
onShow(() => {
  getList(true);
});
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f5fa;
}

.list-section {
  flex: 1;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  /* 预留底部按钮空间 */
  padding-bottom: 90px;

  .list-container {
    .item-card {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 17px 12px;
      margin-bottom: 12px;
      position: relative;

      .status-badge {
        width: 60px;
        position: absolute;
        top: 1px;
        right: 0px;
        border-radius: 4px;
        .status-icon {
          width: 60px;
          height: 24px;
        }
      }

      .item-title {
        font-size: 15px;
        font-weight: 600;
        color: #17181a;
        margin-bottom: 8px;
        padding-right: 60px; /* 避开状态角标 */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .item-middle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .info-group {
          display: flex;
          align-items: center;
          
          .type-tag {
            font-size: 13px;
            font-weight: 500;
            margin-right: 12px;
            
            &.supply {
              color: #4B87FF;
            }
            
            &.demand {
              color: #ff8a00;
            }
          }
          
          .date {
            font-size: 13px;
            color: #a1a7b2;
            position: relative;
            padding-left: 12px;
            
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 1px;
              height: 10px;
              background-color: #e5e6eb;
            }
          }
        }
        
        .action-group {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          width: auto;

          
          .action-icon {
            width: 18px;
            height: 18px;
            opacity: 0.6;
          }
        }
      }

      .message-count {
        margin-top: 8px;
        font-size: 13px;
        color: #5c5f66;
        display: inline-block;
        width: auto;
        position: relative;
        .count-badge {
          display: inline-block;
          background-color: #ff5a5f;
          color: #ffffff;
          font-size: 10px;
          padding: 0 4px;
          border-radius: 10px;
          min-width: 16px;
          height: 16px;
          line-height: 16px;
          text-align: center;
          margin-left: 4px;
          width: auto;
          position: absolute;
          right: -11px;
          top: -4px;
          
        }
      }

      .reject-reason {
        margin-top: 16px;
        font-size: 13px;
        color: #5c5f66;
        line-height: 20px;
        text-align: justify;
      }
    }
  }

  .loading-status, .no-more, .empty-state {
    text-align: center;
    font-size: 13px;
    color: #a1a7b2;
    padding: 16px 0;
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
  padding: 0 28px;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid #f0f2f5;
  z-index: 100;
    padding-top: 16px;
  
  .publish-btn {
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

/* 删除弹窗 */
.delete-modal {
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
        
        &:active {
          opacity: 0.8;
        }
      }
      
      .btn-cancel {
        background-color: #ffffff;
        color: #5c5f66;
        border: 1px solid #e5e6eb;
      }
      
      .btn-confirm {
        background-color: #3071f2;
        color: #ffffff;
        border: 1px solid #3071f2;
      }
    }
  }
}
</style>
