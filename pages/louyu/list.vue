<template>
  <view class="page-body">
    <div class="items">
      <div class="item" v-for="(item, index) in houseList" :key="index" @click="toHouseDetail(item.id)">
        <image :src="item.image" alt="" mode="widthFix" />
        <div class="title">{{ item.name }}</div>
      </div>
    </div>
    <div class="no-more" v-if="houseList.length > 0">
      没有更多了
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { house } from "/utlis/https";
import { onShow } from "@dcloudio/uni-app";
const houseList = ref([]);
const getHouseList = () => {
  let params = {
    page:1,
    page_size:1000,
    order_by:"sort",
    order_by_direction:"asc",
  }
  house.list(params).then((res) => {
    houseList.value = res.data.list;
  });
};
const toHouseDetail = (id) => {
  wx.navigateTo({
    url: `/package/louyu/index?id=${id}`,
  });
};
onShow(() => {
  getHouseList();
});
</script>

<style lang="less" scoped>
.page-body {
  padding: 16px 10px;
  background: #f3f5fa;
  height: 100vh;
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
