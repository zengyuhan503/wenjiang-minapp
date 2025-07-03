<template>
  <view class="page-body">
    <div class="page-section">
      <videoWrapper
        v-for="(item, index) in detail.videos"
        :key="item.uid"
        :videoSrc="item.url"
        :videoId="item.uid"
      />
    </div>
    <div class="page-content">
      <rich-text :nodes="detail.content" mode="compat"></rich-text>
    </div>
    <div class="resources">
      <template v-for="(item, index) in detail.files" :key="index">
        <div
          class="item"
          @click="openFile(item.file.response.data.url, item.type)"
          v-if="item.type == 'pdf'"
        >
          <div class="title">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/pdf.webp"
              mode="widthFix"
            />
            <text>{{ item.name }}</text>
          </div>
          <div class="link">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/right.png"
              mode="widthFix"
            />
          </div>
        </div>
        <div
          class="item"
          @click="openFile(item.file.response.data.url, item.type)"
          v-if="item.type == 'word'"
        >
          <div class="title">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/word.webp"
              mode="widthFix"
            />
            <text>{{ item.name }}</text>
          </div>
          <div class="link">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/right.png"
              mode="widthFix"
            />
          </div>
        </div>
        <div
          class="item"
          @click="openFile(item.file.response.data.url, item.type)"
          v-if="item.type == 'xls' || item.type == 'xlsx'"
        >
          <div class="title">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/xls.webp"
              mode="widthFix"
            />
            <text>{{ item.name }}</text>
          </div>
          <div class="link">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/right.png"
              mode="widthFix"
            />
          </div>
        </div>

        <div
          class="item"
          @click="openFile(item.file.response.data.url, item.type)"
          v-if="item.type == 'doc' || item.type == 'docx'"
        >
          <div class="title">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/word.webp"
              mode="widthFix"
            />
            <text>{{ item.name }}</text>
          </div>
          <div class="link">
            <image
              src="https://louyutest.cdyunbu.com/wxapp/static/image/right.png"
              mode="widthFix"
            />
          </div>
        </div>
      </template>
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import videoWrapper from "../../components/videoWrapper.vue";
import { article } from "/utlis/https";
import { onLoad } from "@dcloudio/uni-app";
const detail = ref({
  content: null,
  created_at: null,
  created_at_text: null,
  created_by: 0,
  deleted_at: null,
  desc: "",
  files: [],
  id: null,
  tag_image: "",
  title: "",
  updated_at: null,
  updated_by: 0,
  videos: [],
});

const openFile = (file, type) => {
  let fileType = type;
  console.log(type);
  wx.showLoading({
    title: "文档打开中，请稍等..",
  });
  uni.downloadFile({
    url: file, // 远程文件地址
    success: (res) => {
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          fileType: type,
          success: () => {
            wx.hideLoading();
            console.log("文档打开成功");
          },
          fail: (err) => {
            wx.hideLoading();
            console.error("打开失败", err);
          },
        });
      } else {
        console.error("文件下载失败", res);
        uni.showToast({
          title: "文件下载失败",
          icon: "none",
        });
      }
    },
    fail: (err) => {
      wx.hideLoading();
      console.error("下载出错", err);
    },
  });
};
function getFileTypeFromURL(url) {
  console.log(url);
  if (url == undefined || url == null || url == "") {
    return 0;
  }
  const extension = url.split("?")[0].split("#")[0].split(".").pop().toLowerCase();
  console.log(extension);
  // 小程序 openDocument 支持的类型
  const supportedTypes = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  // 如果是支持的格式，直接返回
  if (supportedTypes.includes(extension)) {
    return extension;
  }
  // 如果是常见图片、文本或压缩包等非支持格式，做一些映射或兜底
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)) {
    return "pdf"; // 比如转为 pdf 类型打开
  } else if (["txt"].includes(extension)) {
    return "doc"; // 文本强制按 word 打开
  } else if (["zip", "rar", "7z"].includes(extension)) {
    return "pdf"; // 压缩包无法打开，也可选 pdf 占位
  } else {
    return "pdf"; // 其它未知类型，默认兜底为 pdf
  }
}
function formatRichText(html) {
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

const getArticleDetail = (id) => {
  article.detail(id).then((res) => {
    console.log(res);
    let data = res.data;
    data.content = formatRichText(data.content);
    detail.value = data;
    let files = detail.value.files || [];
    detail.value.files = files
      .filter((item) => item.url !== undefined && item.url !== null && item.url !== "")
      .map((item) => ({
        file: item,
        name: item.name,
        type: getFileTypeFromURL(item.url),
      }));

    uni.setNavigationBarTitle({
      title: detail.value.title,
    });
  });
};
onLoad((options) => {
  console.log(options);
  getArticleDetail(options.id);
});
</script>

<style lang="less" scoped>
.page-body {
  padding: 16px 10px;
  padding-bottom: 50px;
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

    img {
      max-width: 100% !important;
    }
    image {
      max-width: 100% !important;
    }
  }
  .resources {
    margin-top: 16px;
    .item {
      height: 40px;
      background: #f2f5fa;
      border-radius: 4px 4px 4px 4px;
      padding: 9px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      .title {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 80%;
        image {
          width: 22px;
          height: 22px;
        }
        text {
          font-family: PingFang SC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #17181a;
          line-height: 22px;
          text-align: left;
          margin-left: 4px;
        }
      }
      .link {
        text-align: right;
        width: 10%;
        image {
          width: 14px;
          height: 14px;
        }
      }
    }
  }
}
</style>
