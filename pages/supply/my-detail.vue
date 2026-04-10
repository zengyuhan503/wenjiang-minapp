<template>
  <view class="page-container">
    <scroll-view scroll-y class="content-scroll" @scrolltolower="loadMoreMessages">
      
      <!-- 模块1：标题、简介、图片 -->
      <view class="block-section header-section">
        <!-- 标题 -->
        <view class="title-text">{{ detail.title }}</view>

        <!-- 简介文案 -->
        <view class="desc-content">
          <text>{{ detail.content }}</text>
        </view>

        <!-- 图片列表 (横向并排) -->
        <view class="image-list">
          <image v-for="(img, imgIndex) in detail.images" :key="imgIndex" :src="img" mode="aspectFill" class="detail-image" @click="previewImage(img)"></image>
        </view>
      </view>

      <!-- 模块2：企业留言 -->
      <view class="block-section messages-section" v-if="messages.length > 0">
        <view class="section-title">企业留言</view>

        <view class="message-list">
          <view class="message-item" v-for="(msg, index) in messages" :key="index">
            
            <view class="msg-header">
              <text class="company-name">{{ msg.company_name }}</text>
              <text class="msg-date">{{ msg.created_at_text }}</text>
            </view>
            
            <view class="msg-contact">
              <text class="contact-text">联系人：{{ msg.contact_name }}（{{ msg.contact_phone }}）</text>
              <!-- 电话icon占位，您可以后续替换该图片 -->
              <image class="phone-icon" src="../../static/image/callphone-icon.png" mode="aspectFit" @click="makePhoneCall(msg.contact_phone)"></image>
            </view>
            
            <view class="msg-content-wrapper" v-if="msg.content || (msg.images && msg.images.length > 0)">
              <view class="msg-text" v-if="msg.content">{{ msg.content }}</view>
              <view class="msg-images" v-if="msg.images && msg.images.length > 0">
                <image 
                  v-for="(img, imgIndex) in msg.images" 
                  :key="imgIndex" 
                  :src="img" 
                  mode="aspectFill" 
                  class="msg-image"
                  @click="previewImage(img, msg.images)"
                ></image>
              </view>
            </view>

          </view>
        </view>
      </view>

    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { supply } from "../../utlis/https.js";

const detail = ref({});
const messages = ref([]);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);
const noMore = ref(false);
let currentId = null;

const getDetail = (reset = false) => {
  if (!currentId) return;
  if (reset) {
    page.value = 1;
    messages.value = [];
    noMore.value = false;
  }
  
  if (loading.value || noMore.value) return;
  loading.value = true;
  
  uni.showLoading({ title: '加载中...' });

  supply.myDetail({ id: currentId, page: page.value, page_size: pageSize.value }).then(res => {
    if (res.code == 200 && res.data) {
      // 详情信息（除留言外的字段）
      detail.value = res.data;
      console.log(detail.value);
      // 留言列表处理
      let newData = res.data.messages?.list || [];
      
      if (newData.length === 0 && page.value === 1) {
      } else {
        if (newData.length < pageSize.value) {
          noMore.value = true;
        }
        messages.value = [...messages.value, ...newData];
      }
      page.value++;
    } 
  }).catch(err => {
    console.log("获取我的供需详情失败", err);
  }).finally(() => {
    uni.hideLoading();
    loading.value = false;
  });
};

const loadMoreMessages = () => {
  getDetail();
};

const previewImage = (current, urls) => {
  uni.previewImage({
    current,
    urls: urls || [current]
  });
};

const makePhoneCall = (phoneNumber) => {
  if (!phoneNumber) return;
  uni.makePhoneCall({
    phoneNumber
  });
};

onLoad((options) => {
  if (options.id) {
    currentId = options.id;
    getDetail(true);
  } 
});
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f5fa;
}

.content-scroll {
  flex: 1;
  overflow: hidden;
}

.block-section {
  background-color: #ffffff;
  padding: 16px;
  margin-bottom: 10px;
}

.header-section {
  padding-bottom: 24px;
}

/* 标题 */
.title-text {
  font-size: 18px;
  font-weight: 600;
  color: #17181a;
  line-height: 26px;
  margin-bottom: 16px;
}

/* 简介内容 */
.desc-content {
  font-size: 14px;
  color: #5c5f66;
  line-height: 24px;
  text-align: justify;
}

/* 图片列表 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  
  .detail-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    background-color: #f0f0f0;
  }
}

/* 企业留言模块 */
.messages-section {
  padding: 10px;
  padding-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #17181a;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;

  &:last-child {
    border-bottom: none;
  }

  .msg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .company-name {
      font-size: 15px;
      font-weight: 500;
      color: #17181a;
    }

    .msg-date {
      font-size: 13px;
      color: #a1a7b2;
    }
  }

  .msg-contact {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .contact-text {
      font-size: 14px;
      color: #5c5f66;
      margin-right: 8px;
    }

    .phone-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #f0f4ff; /* 占位背景色，避免没图时全白 */
      display: inline-block;
    }
  }

  .msg-content-wrapper {
    background-color: #f7f8fa;
    border-radius: 8px;
    padding: 9px;
    margin-top: 8px;
    
    .msg-text {
      font-size: 14px;
      color: #2E2F33;
      line-height: 22px;
      margin-bottom: 8px;
      text-align: justify;
    }

    .msg-images {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .msg-image {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        background-color: #e5e6eb;
      }
    }
  }
  
    view:last-child {
      margin-bottom: 0;
    }
}
</style>
