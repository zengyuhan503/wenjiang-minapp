<template>
  <view class="page-container">
    <scroll-view scroll-y class="content-scroll">

      <!-- 模块1：标题、简介、图片 -->
      <view class="block-section">
        <!-- 标题 -->
        <view class="title-text">{{ detail.title || '供需标题供需标题供需标题' }}</view>

        <!-- 简介文案 -->
        <view class="desc-content">
          <rich-text v-if="detail.content" :nodes="formatRichText(detail.content)"></rich-text>
          <text v-else>{{ detail.desc ||
            '当前市场供需关系呈现结构性分化特征，整体供需格局趋于动态调整。部分领域供给相对充足，竞争较为充分，但有效供给与高品质需求仍存在一定差距。随着消费需求持续升级，市场对产品质量、服务体验和个性化供给提出更高要求。'
            }}</text>
        </view>

        <!-- 图片列表 (横向并排) -->
        <view class="image-list" v-if="detail.images && detail.images.length > 0">
          <image v-for="(img, index) in detail.images" :key="index" :src="img" mode="aspectFill"
            @click="previewImage(img, detail.images)" class="detail-image"></image>
        </view>
      </view>

      <!-- 模块2：抵扣券和地址 -->
      <view class="block-section ticket-address-section" v-if="detail.tickets && detail.tickets.length > 0">
        <!-- 抵扣券 (横向滚动) -->
        <scroll-view scroll-x class="tickets-scroll" v-if="detail.tickets && detail.tickets.length > 0">
          <view class="ticket-list">
            <view class="ticket-item" v-for="(ticket, index) in detail.tickets" :key="index">
              <view class="ticket-icon">
                <text>券</text>
              </view>
              <text class="ticket-name">{{ ticket.name }}</text>
            </view>
          </view>
        </scroll-view>
        <scroll-view scroll-x class="tickets-scroll" v-else>
          <view class="ticket-list">
            <view class="ticket-item" v-for="(coupon, index) in detail.coupon_list" :key="index">
              <view class="ticket-icon">
                <image src="https://louyu.zdocd.com/wxapp/static/image/juan.png" mode="widthFix"></image>
              </view>
              <text class="ticket-name">{{ coupon.name }}*{{ coupon.quantity }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 抵扣券使用说明 -->
        <view class="ticket-desc">无需领券、验券，直接到场使用哦~</view>

        <!-- 地址 -->
        <view class="address-row">
          <image class="address-icon" src="https://louyu.zdocd.com/wxapp/static/image/address.png" mode="widthFix">
          </image>
          <text class="address-text">{{ detail.house_address || detail.house_name }}</text>
        </view>
      </view>

      <!-- 模块3：底部文案补充 -->
      <view class="block-section bottom-desc-section" v-if="detail.coupon_desc">
        <!-- 抵扣券说明 -->
        <view class="desc-content">
          <rich-text v-if="detail.coupon_desc" :nodes="formatRichText(detail.coupon_desc)"></rich-text>
          <text v-else>{{ detail.coupon_desc }}</text>
        </view>
      </view>

    </scroll-view>

    <!-- 底部悬浮按钮 (从我的供需进入时不显示) -->
    <view class="bottom-bar" v-if="!isFromMy">
      <view class="message-btn" @click="toMessage">留言</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { supply } from "../../utlis/https";
import CustomNavbar from "../../components/customNavbar.vue";

const detail = ref({});
let currentId = null;
const isFromMy = ref(false);

const formatRichText = (html) => {
  if (!html) return "";
  return html.replace(/<img[^>]*>/gi, function (match) {
    if (match.includes("style=")) {
      return match.replace(/style="[^"]*"/gi, 'style="max-width:100%;height:auto;display:block;margin:10px 0;"');
    }
    return match.replace(/<img/gi, '<img style="max-width:100%;height:auto;display:block;margin:10px 0;"');
  });
};

const getDetail = (id) => {
  uni.showLoading({ title: '加载中...' });
  supply.detail(id).then(res => {
    if (res.code == 200 && res.data) {
      detail.value = res.data;
    }
  }).catch(err => {
    console.log("获取详情失败", err);
  }).finally(() => {
    uni.hideLoading();
  });
};

const previewImage = (current, urls) => {
  uni.previewImage({
    current,
    urls
  });
};

const toMessage = () => {
  uni.navigateTo({
    url: `/package/supply/message?id=${currentId}`
  });
};

onLoad((options) => {
  console.log(options);
  if (options.from === 'my') {
    isFromMy.value = true;
  }
  if (options.id) {
    currentId = options.id;
    getDetail(options.id);
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
  /* 如果不显示底部按钮，则不需要那么大的底部内边距 */
  padding-bottom: v-bind("isFromMy ? '20px' : '90px'");
}

.block-section {
  background-color: #ffffff;
  padding: 12px;
  margin-bottom: 10px;
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
  color: #2E2F33;
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

/* 抵扣券模块 */
.ticket-address-section {
  padding-top: 16px;
  padding-bottom: 16px;
}

.tickets-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 16px;

  .ticket-list {
    display: inline-flex;
    gap: 10px;
  }

  .ticket-item {
    display: inline-flex;
    align-items: center;
    height: 48px;
    padding: 0 16px 0 10px;
    background: #FFF2F0;
    border-radius: 6px 6px 6px 6px;
    border: 1px solid #FF9681;
    border-radius: 6px;
    width: 148px;

    .ticket-icon {
      width: 24px;
      height: 18px;
      background: linear-gradient(90deg, #FF8966 0%, #FF5D33 100%);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      position: relative;

      image {
        width: 30px;
        height: 30px;
      }

      text {
        font-size: 10px;
        color: #ffffff;
        font-weight: 500;
      }
    }

    .ticket-name {
      font-size: 15px;
      color: #17181a;
    }
  }
}

.ticket-desc {
  font-size: 13px;
  color: #2E2F33;
  margin-bottom: 16px;
}

/* 地址模块 */
.address-row {
  display: flex;
  align-items: flex-start;

  .address-icon {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    margin-top: 2px;
  }

  .address-text {
    flex: 1;
    font-size: 13px;
    color: #5c5f66;
    line-height: 20px;
  }
}

/* 底部按钮 */
.bottom-bar {
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

  .message-btn {
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
</style>
