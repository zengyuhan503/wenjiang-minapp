<template>
  <view class="page-body">
    <view class="items">
      <view
        class="item"
        v-for="(item, index) in rentalList"
        :key="index"
        @click="toRentalDetail(item.id)"
      >
        <view class="cover">
          <image :src="item.house.image" mode="widthFix"></image>
        </view>
        <view class="content">
          <view>
            <view class="title"> {{ item.house.name }} </view>
            <view class="desc"> {{ item.desc }} </view>
          </view>
          <view class="time">
            <text> {{ item.created_at_text }} 发布</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow, onLoad } from "@dcloudio/uni-app";
import { rental } from "/utlis/https";
import { ref, onMounted } from "vue";
import moment from "moment";
const rentalList = ref([]);
let home_id = null;

const getRentalList = () => {
  let params = {
    house_id: home_id,
    page: 1,
    page_size: 1000,
    order_by: "sort",
    order_by_direction: "desc",
  };
  rental.list(params).then((res) => {
    rentalList.value = res.data.list.map((item) => {
      item.created_at = moment(item.created_at).format("YYYY-MM-DD");
      return item;
    });
  });
};
const toRentalDetail = (id) => {
  wx.navigateTo({
    url: `/package/lease/detail?id=${id}`,
  });
};
onLoad((options) => {
  home_id = options.id;
});
onShow(() => {
  getRentalList();
});
</script>

<style lang="less" scoped>
.page-body {
  padding: 16px 10px;
}
.items {
  .item {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    &:last-child {
      margin-bottom: 0;
    }
    .cover {
      width: 33%;
      border-radius: 8px 8px 8px 8px;
      overflow: hidden;
      image {
        width: 100%;
        border-radius: 8px 8px 8px 8px;
      }
    }
    .content {
      // width: 70%;
      width: 67%;
      padding-left: 10px;
      display: flex;
      justify-content: space-between;
      flex-direction: column;

      .title {
        font-weight: 600;
        font-size: 15px;
        color: #17181a;
        line-height: 20px;
        text-align: left;
      }
      .desc {
        margin: 5px 0 2px 0;
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 13px;
        color: #5c5f66;
        line-height: 20px;
        text-align: left;
        display: -webkit-box;
        overflow: hidden;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .time {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 13px;
        color: #8a8f99;
        line-height: 20px;
        text-align: left;
      }
    }
  }
}
</style>
