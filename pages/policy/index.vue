<template>
  <view class="page-body">
    <!-- 蓝色渐变背景 -->
    <view class="blue-bg">
      <image src="https://louyu.zdocd.com/wxapp/static/image/policy_back.png" mode="widthFix"></image>
    </view>
    <CustomNavbar title="政策帮" titleColor="#ffffff" bgColor="transparent" />

    <view class="header-section">
      <view class="industry-picker" @click="toggleDropdown">
        <text>{{ currentIndustryName }}</text>
        <image src="https://louyu.zdocd.com/wxapp/static/image/right.png" mode="widthFix" class="down-icon"
          :class="{ 'is-open': showDropdown }"></image>
      </view>
    </view>

    <!-- 下拉菜单区域 -->
    <view class="dropdown-wrapper" v-if="showDropdown">
      <view class="dropdown-mask" @click="closeDropdown"></view>
      <view class="dropdown-content">
        <scroll-view scroll-y class="dropdown-scroll">
          <view class="dropdown-item" v-for="(item, index) in industries" :key="index"
            :class="{ active: industryIndex === index }" @click="selectIndustry(index)">
            {{ item.company_name }}
          </view>
        </scroll-view>
      </view>
    </view>

    <scroll-view scroll-y class="list-section" @scrolltolower="loadMore">
      <view class="list-container">
        <view class="item" v-for="(item, index) in list" :key="index" @click="previewFile(item)">
          <view class="file-icon" :class="getFileTypeClass(item.name || item.title)">
            <image src="https://louyu.zdocd.com/wxapp/static/image/excel_icon4.png" mode="widthFix"></image>
          </view>
          <view class="item-title">{{ item.name || item.title }}</view>
        </view>
      </view>
      <view class="loading-status" v-if="loading">加载中...</view>
      <view class="no-more" v-if="!loading && noMore">没有更多了</view>
      <view class="empty-state" v-if="!loading && list.length === 0">暂无数据</view>
    </scroll-view>

    <!-- 悬浮按钮 -->
    <view class="fab-btn" @click="onFabClick">
      <image src="https://louyu.zdocd.com/wxapp/static/image/ai.png" mode="widthFix"></image>
      <text>温小楼</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import CustomNavbar from "../../components/customNavbar.vue";
import { policy, supply } from "../../utlis/https";

const industries = ref([{ id: '', name: '全部行业' }]);
const industryIndex = ref(0);
const showDropdown = ref(false);
const list = ref([]);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const noMore = ref(false);

const currentIndustryName = computed(() => {
  return industries.value[industryIndex.value]?.company_name || '';
});

const getIndustries = () => {
  supply.industries().then(res => {
    if (res.code == 200 && res.data) {
      industries.value = [{ id: '', company_name: '全部行业' }, ...res.data];
    }
  }).catch(err => {
    console.log("获取行业失败", err);
  });
};

const getList = (reset = false) => {
  if (reset) {
    page.value = 1;
    list.value = [];
    noMore.value = false;
  }
  if (loading.value || noMore.value) return;

  loading.value = true;

  let params = {
    page: page.value,
    page_size: pageSize.value,
  };

  const selectedIndustry = industries.value[industryIndex.value];
  if (selectedIndustry && selectedIndustry.company_name !== '') {
    params.industry = selectedIndustry.company_name || "";
  }
  if (params.industry == '全部行业') delete params.industry;
  console.log(params)
  policy.list(params).then(res => {
    if (res.code == 200 && res.data) {
      let newData = res.data.list || [];


      if (newData.length < pageSize.value) {
        noMore.value = true;
      }
      list.value = [...list.value, ...newData];
      page.value++;
    }
  }).catch(err => {
    console.log("获取政策列表失败", err);
  }).finally(() => {
    loading.value = false;
  });
};

const selectIndustry = (index) => {
  industryIndex.value = index;
  showDropdown.value = false;
  getList(true);
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const loadMore = () => {
  getList();
};

const onFabClick = () => {
  uni.navigateTo({
    url: '/package/policy/ai'
  });
};

// 获取后缀名
const getFileExtension = (filename) => {
  if (!filename) return 'UNK';
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].substring(0, 3).toUpperCase();
  }
  return 'UNK';
};

// 获取文件类型样式类
const getFileTypeClass = (filename) => {
  if (!filename) return 'type-unknown';
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return 'type-pdf';
    case 'txt': return 'type-txt';
    case 'doc':
    case 'docx': return 'type-doc';
    case 'ppt':
    case 'pptx': return 'type-ppt';
    case 'jpg':
    case 'jpeg':
    case 'png': return 'type-img';
    case 'mp4':
    case 'avi': return 'type-video';
    case 'xls':
    case 'xlsx': return 'type-excel';
    default: return 'type-unknown';
  }
};

// 文件预览功能
const previewFile = (item) => {
  const url = item.file_url; // 请根据实际接口返回的URL字段名进行调整
  if (!url) {
    uni.showToast({ title: '文件地址不存在', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '正在打开文件...' });

  uni.downloadFile({
    url: url,
    success: (res) => {
      if (res.statusCode === 200) {
        const filePath = res.tempFilePath;
        uni.openDocument({
          filePath: filePath,
          showMenu: true, // 是否显示右上角菜单，允许用户分享或保存
          success: () => {
            console.log('打开文档成功');
          },
          fail: (err) => {
            console.log('打开文档失败', err);
            uni.showToast({ title: '打开文档失败', icon: 'none' });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      } else {
        uni.hideLoading();
        uni.showToast({ title: '文件下载失败', icon: 'none' });
      }
    },
    fail: (err) => {
      console.log('下载失败', err);
      uni.hideLoading();
      uni.showToast({ title: '文件下载失败', icon: 'none' });
    }
  });
};

onLoad(() => {
  getIndustries();
});

onShow(() => {
  getList(true);
});

</script>

<style lang="less" scoped>
.page-body {
  width: 100%;
  height: 100vh;
  background: #f3f5fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

.blue-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 220px;
  background: url("https://louyu.zdocd.com/wxapp/static/image/policy_back.png");
  z-index: 0;

  image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background: #f3f5fa;
    border-radius: 20px 20px 0 0;
  }
}

.header-section {
  position: relative;
  z-index: 1;
  padding: 10px 0 20px;
  display: flex;
  justify-content: center;
  margin-top: 100px;

  .industry-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #ffffff;
    font-weight: 500;

    .down-icon {
      width: 12px;
      margin-left: 6px;
      transform: rotate(90deg);
      transition: transform 0.3s;
      filter: brightness(0) invert(1);

      &.is-open {
        transform: rotate(-90deg);
      }
    }
  }
}

.dropdown-wrapper {
  position: absolute;
  top: 148px;
  /* 导航栏和筛选栏的高度大致位置，根据实际情况微调 */
  left: 0;
  width: 100%;
  height: calc(100vh - 90px);
  z-index: 99;
  display: flex;
  flex-direction: column;

  .dropdown-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .dropdown-content {
    position: relative;
    background-color: #ffffff;
    width: 100%;
    z-index: 100;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

    .dropdown-scroll {
      max-height: 60vh;

      .dropdown-item {
        padding: 16px 20px;
        font-size: 15px;
        color: #17181a;
        border-bottom: 1px solid #f0f2f5;

        &:last-child {
          border-bottom: none;
        }

        &.active {
          color: #3071f2;
          font-weight: 500;
        }
      }
    }
  }
}

.list-section {
  flex: 1;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  overflow: hidden;

  .list-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 0px 16px;
    min-height: 100%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);

    .item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px dashed #f0f2f5;

      &:last-child {
        border-bottom: none;
      }

      .file-icon {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        image {
          width: 32px;
          height: 32px;
        }

      }

      .item-title {
        font-size: 15px;
        color: #17181a;
        line-height: 22px;
        flex: 1;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        overflow: hidden;
      }
    }
  }

  .loading-status,
  .no-more,
  .empty-state {
    text-align: center;
    font-size: 13px;
    color: #a1a7b2;
    padding: 16px 0;
  }
}

.fab-btn {
  position: absolute;
  right: 8px;
  bottom: 60px;
  /* 预留给 tabBar 的空间 */
  width: 56px;
  height: 66px;
  background: #4B87FF;
  box-shadow: 0px 2px 8px 0px rgba(23, 45, 156, 0.2);
  border-radius: 10px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(48, 113, 242, 0.3);
  z-index: 10;

  image {
    width: 40px;
    height: 40px;
    margin-bottom: 2px;
  }

  text {
    font-size: 10px;
    color: #ffffff;
    font-weight: 500;
  }
}
</style>
