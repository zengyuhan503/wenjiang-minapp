<template>
  <view class="page-container">
    <scroll-view scroll-y class="content-scroll">
      
      <!-- 模块1：标题、简介、图片 -->
      <view class="block-section header-section">
        <!-- 标题 -->
        <view class="title-text">{{ detail.title || '供需标题供需标题供需标题' }}</view>

        <!-- 简介文案 -->
        <view class="desc-content">
          <text>{{ detail.desc || '当前市场供需关系呈现结构性分化特征，整体供需格局趋于动态调整。部分领域供给相对充足，竞争较为充分，但有效供给与高品质需求仍存在一定差距。随着消费需求持续升级，市场对产品质量、服务体验和个性化供给提出更高要求。' }}</text>
        </view>

        <!-- 图片列表 (横向并排) -->
        <view class="image-list">
          <image src="https://louyu.zdocd.com/wxapp/static/image/case1.png" mode="aspectFill" class="detail-image" @click="previewImage('https://louyu.zdocd.com/wxapp/static/image/case1.png')"></image>
          <image src="https://louyu.zdocd.com/wxapp/static/image/case1.png" mode="aspectFill" class="detail-image" @click="previewImage('https://louyu.zdocd.com/wxapp/static/image/case1.png')"></image>
        </view>
      </view>

      <!-- 模块2：企业留言 -->
      <view class="block-section messages-section">
        <view class="section-title">企业留言</view>

        <view class="message-list">
          <view class="message-item" v-for="(msg, index) in messages" :key="index">
            
            <view class="msg-header">
              <text class="company-name">{{ msg.company }}</text>
              <text class="msg-date">{{ msg.date }}</text>
            </view>
            
            <view class="msg-contact">
              <text class="contact-text">联系人：{{ msg.contact }}（{{ msg.phone }}）</text>
              <!-- 电话icon占位，您可以后续替换该图片 -->
              <image class="phone-icon" src="../../static/image/callphone-icon.png" mode="aspectFit" @click="makePhoneCall(msg.phone)"></image>
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

const detail = ref({});

const messages = ref([
  {
    company: '成都科大讯飞教育科技股份有限公司',
    date: '2024.10.30',
    contact: '余飞',
    phone: '15708474184',
    content: '供需两端仍需进一步优化匹配，着力提升供给体系对需求变化的适应性，缓解供需错配问题。',
    images: [
      'https://louyu.zdocd.com/wxapp/static/image/case1.png',
      'https://louyu.zdocd.com/wxapp/static/image/case1.png'
    ]
  },
  {
    company: '成都科大讯飞教育科技股份有限公司',
    date: '2024.10.30',
    contact: '余飞',
    phone: '15708474184',
    content: '',
    images: []
  },
  {
    company: '成都科大讯飞教育科技股份有限公司',
    date: '2024.10.30',
    contact: '余飞',
    phone: '15708474184',
    content: '',
    images: []
  }
]);

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
    // 后续可以接入真实API
    console.log("加载详情 ID:", options.id);
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
