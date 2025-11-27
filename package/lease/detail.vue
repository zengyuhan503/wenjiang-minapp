<template>
  <view class="page-body">
    <div class="page-content">
      <div class="title">
        {{ detail.title }}
      </div>
      <rich-text :nodes="detail.content"></rich-text>
    </div>
  </view>

  <div class="countus">
    <div class="btn" @click="toConsultation">招租咨询</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import videoWrapper from "../../components/videoWrapper.vue";
import { onLoad } from "@dcloudio/uni-app";
import { rental } from "/utlis/https";
const detail = ref({
  title: "",
  content: "",
});
let rentel_id = null;
let house_id = null;
function formatRichText(html) {
console.log(html)
if (html==null) return "";
  return html.replace(/<img[^>]*>/gi, function (match) {
    if (match.includes("style=")) {
      // 如果已有 style，追加 max-width
      return match.replace(/style="([^"]*)"/, function (_, styleContent) {
        return `style="${styleContent};max-width:100%;height:auto;"`;
      });
    } else {
      // 没有 style，新增
      return match.replace(/<img/, '<img style="max-width:100%;height:auto;"');
    }
  });
}

const getRentalDetail = (id) => {
  rental.detail(id).then((res) => {
    console.log(res);
    let data = res.data;
    data.content = formatRichText(data.content);
    detail.value = data;
  });
};
const toConsultation = () => {
  wx.navigateTo({
    url: `/package/consultation/index?rentel_id=${rentel_id}&title=招租咨询&house_id=${detail.value.house_id}`,
  });
};
onLoad((options) => {
  getRentalDetail(options.id);
  rentel_id = options.id;
});
</script>

<style lang="less" scoped>
.page-body {
  padding: 16px 10px;
  height: 100vh;
  padding-bottom: 100px;
  overflow-y: auto;
  .page-section {
    margin-bottom: 13px;
    width: 100%;
    border-radius: 8px 8px 8px 8px;
    overflow: hidden;
  }
  .page-content {
    .title {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 17px;
      color: #17181a;
      line-height: 26px;
      text-align: left;
      margin: 10px 0;
    }
  }
  img {
    max-width: 100% !important;
  }
  image {
    max-width: 100% !important;
  }
}

.countus {
  height: 90px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  border: 1px solid #e1e5ea;
  padding: 0 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
  .btn {
    height: 40px;
    background: #3071f2;
    border-radius: 8px 8px 8px 8px;
    font-family: Roboto, Roboto;
    font-weight: 500;
    font-size: 16px;
    color: #f7f7f7;
    text-align: center;
    line-height: 40px;
  }
}
</style>
