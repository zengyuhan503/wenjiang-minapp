<template>
  <view class="page-body">
    <div class="items">
      <div class="item" v-for="(item, index) in houseList" :key="index" @click="toHouseDetail(item.id)">
        <image :src="item.image" alt="" mode="widthFix" />
        <div class="title">{{ item.name }}</div>
      </div>
    </div>

    <view class="other-title" v-if="otherHouseList.length > 0">
      <image src="/static/orther_louyu.png" mode="widthFix" class="icon" />
      <text>其他楼宇</text>
    </view>

    <div class="items" v-if="otherHouseList.length > 0">
      <div class="item" v-for="(item, index) in otherHouseList" :key="index" @click="toHouseDetail(item.id)">
        <image :src="item.image" alt="" mode="widthFix" />
        <div class="title">{{ item.name }}</div>
      </div>
    </div>

    <div class="no-more" v-if="houseList.length > 0 || otherHouseList.length > 0">
      没有更多了
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { house } from "/utlis/https";
import { onShow } from "@dcloudio/uni-app";

const houseList = ref([]);
const otherHouseList = ref([]);

const getHouseList = () => {
  let params = {
    page: 1,
    page_size: 1000,
    order_by: "sort",
    order_by_direction: "asc",
    is_other: 0
  };
  house.list(params).then((res) => {
    houseList.value = res.data.list || [];
  });
};

const getOtherHouseList = () => {
  let params = {
    page: 1,
    page_size: 1000,
    order_by: "sort",
    order_by_direction: "asc",
    is_other: 1
  };
  house.list(params).then((res) => {
    otherHouseList.value = res.data.list || [];
  });
};

const toHouseDetail = (id) => {
  wx.navigateTo({
    url: `/package/louyu/index?id=${id}`,
  });
};

onShow(() => {
  getHouseList();
  getOtherHouseList();
});
</script>

<style lang="less" scoped>
.page-body {
  padding: 16px 10px;
  background: #f3f5fa;
  min-height: 100vh;
  box-sizing: border-box;

  .items {
    display: grid;
    gap: 9px;
    grid-template-columns: repeat(2, 1fr);
    .item {
      border-radius: 10px 10px 10px 10px;
      overflow: hidden;
      background: #ffffff;
      image {
        width: 100%;
        display: block;
      }
      .title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 15px;
        color: #17181a;
        line-height: 44px;
        text-align: center;
      }
    }
  }

  .other-title {
    display: flex;
    align-items: center;
    height: 50px;
    justify-self: flex-start;
    .icon {
      width: 16px;
      margin-right: 6px;
    }
    text {
      font-size: 15px;
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      color: #3071f2;
    }
  }

  .no-more {
    text-align: center;
    color: #999;
    font-size: 12px;
    padding: 10px 0;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
