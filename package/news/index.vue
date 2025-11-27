<template>
  <view class="page-body">
    <CustomNavbar title="最新资讯" />
    <view class="items">
      <view
        class="item"
        v-for="(item, index) in articleList"
        :key="index"
        @click="toNewDetail(item.id)"
      >
        <view class="title">
          <image
            width="38px"
            :src="item.tag_image"
            mode="widthFix"
            v-if="item.tag_image"
          ></image>
          <text>{{ item.title }}</text>
        </view>
        <view class="desc">
          {{ item.desc }}
        </view>
        <view class="time">
          <text>{{ item.created_at_text }} 发布</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { article } from "/utlis/https";
import CustomNavbar from "@/components/customNavbar.vue";
const articleList = ref([]);
const getArticleList = () => {
  article.list().then((res) => {
    articleList.value = res.data.list;
    console.log(articleList.value);
  });
};

const toNewDetail = (id) => {
  wx.navigateTo({
    url: `/package/news/detail?id=${id}`,
  });
};
onMounted(() => {
  getArticleList();
});
</script>

<style lang="less" scoped>
.page-body {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #b2c8ff 0%, #f3f5fa 20%);
  border-radius: 0px 0px 0px 0px;
  padding: 100px 10px 10px 20px;
}
.items {
  margin-top: 10px;
  height: calc(100vh - 150px);
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  .item {
    margin-bottom: 10px;
    padding: 10px;
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;

    .title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      image {
        width: 38px;
        height: 38px;
        margin-right: 8px;
      }

      text {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 15px;
        color: #17181a;
        line-height: 20px;
        text-align: left;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
      }
    }
    .desc {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 13px;
      color: #5c5f66;
      line-height: 22px;
      text-align: left;
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-top: 7px;
      margin-bottom: 5px;
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
</style>
