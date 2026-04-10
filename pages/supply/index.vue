<template>
  <view class="page-body">
    <view class="header-section">
      <view class="top-row">
        <view class="industry-picker" @click="toggleDropdown">
          <text>{{ currentIndustryName }}</text>
          <image src="https://louyu.zdocd.com/wxapp/static/image/right.png" mode="widthFix" class="down-icon"
            :class="{ 'is-open': showDropdown }"></image>
        </view>
        <view class="my-supply" @click="toMySupply" v-if="userInfo.type === 3">
          <text>我的供需</text>
          <view class="badge" v-if="myCount > 0">{{ myCount > 99 ? '99+' : myCount }}</view>
        </view>
      </view>

      <!-- 自定义下拉菜单 -->
      <view class="dropdown-mask" v-if="showDropdown" @click="toggleDropdown"></view>
      <view class="dropdown-menu" v-if="showDropdown">
        <scroll-view scroll-y class="dropdown-scroll">
          <view class="dropdown-item" v-for="(item, index) in industries" :key="index"
            :class="{ active: industryIndex === index }" @click="selectIndustry(index)">
            {{ item.company_name }}
          </view>
        </scroll-view>
      </view>

      <view class="search-box">
        <uni-icons type="search" size="18" color="#A1A7B2"></uni-icons>
        <input type="text" v-model="keyword" placeholder="输入供需关键词搜索" placeholder-class="placeholder-style"
          @confirm="onSearch" />
      </view>

      <view class="tabs">
        <view class="tab-item" :class="{ active: currentTab === '' }" @click="changeTab('')">全部</view>
        <view class="tab-item" :class="{ active: currentTab === 1 }" @click="changeTab(1)">供应</view>
        <view class="tab-item" :class="{ active: currentTab === 2 }" @click="changeTab(2)">求购</view>
      </view>
    </view>

    <scroll-view scroll-y class="list-section" @scrolltolower="loadMore">
      <view class="items">
        <view class="item" v-for="(item, index) in list" :key="index" @click="toDetail(item.id)">
          <view class="item-title">{{ item.title }}</view>

          <view class="item-footer">
            <view class="tag-row">
              <view class="type-tag" :class="item.type == 1 ? 'supply' : 'demand'">{{ item.type == 1 ? '供应' : '求购' }}
              </view>
              <view class="date">{{ item.created_at }}</view>
              <view class="company">{{ item.company_name }}</view>
            </view>
          </view>

          <!-- 占位印章 -->
          <view class="stamp" v-if="item.tags">
            <image v-for="tag in item.tags" :key="tag.id" :src="tag.icon" mode="widthFix" class="stamp-image"></image>
          </view>
        </view>
      </view>

      <view class="loading-status" v-if="loading">加载中...</view>
      <view class="empty-state" v-if="!loading && list.length === 0">暂无数据</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import CustomNavbar from "../../components/customNavbar.vue";
import { supply, user } from "../../utlis/https";

const industries = ref([{ id: '', company_name: '全部行业' }]);
const industryIndex = ref(0);
const showDropdown = ref(false);
const keyword = ref('');
const currentTab = ref(''); // '' = 全部, 1 = 供应, 2 = 求购
const list = ref([]);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const noMore = ref(false);
const myCount = ref(0);
const userInfo = ref({}); // 保存用户信息
const isLogin = ref(false);

const currentIndustryName = computed(() => {
  console.log(industryIndex.value);
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

const getMyCount = () => {
  supply.receivedCount().then(res => {
    if (res.code == 200) {
      myCount.value = typeof res.data === 'number' ? res.data : (res.data?.count || res.data?.total || res.data || 0);
    }
  }).catch(err => {
    console.log("获取未读消息数失败", err);
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
    keyword: keyword.value,
  };

  if (currentTab.value !== '') {
    params.type = currentTab.value;
  }

  const selectedIndustry = industries.value[industryIndex.value];
  if (selectedIndustry && selectedIndustry.company_name !== '') {
    params.industry = selectedIndustry.company_name
  }
  if (currentIndustryName.value === '全部行业') {
    delete params.industry;
  }

  supply.list(params).then(res => {
    if (res.code == 200 && res.data) {
      let newData = res.data.list || [];
      if (newData.length < pageSize.value) {
        noMore.value = true;
      }
      list.value = [...list.value, ...newData];
      page.value++;
    }
  }).catch(err => {
    console.log("获取供需列表失败", err);
  }).finally(() => {
    loading.value = false;
  });
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectIndustry = (index) => {
  industryIndex.value = index;
  showDropdown.value = false;
  getList(true);
};

const onSearch = () => {
  getList(true);
};

const changeTab = (tab) => {
  if (currentTab.value === tab) return;
  currentTab.value = tab;
  getList(true);
};

const loadMore = () => {
  getList();
};

const toDetail = (id) => {
  if (!id) return;
  uni.navigateTo({
    url: `/pages/supply/detail?id=${id}`
  });
};

const toMySupply = () => {
  uni.navigateTo({
    url: '/pages/supply/my'
  });
};

const getUserData = () => {
  if (isLogin.value) {
    user.getInfo().then(res => {
      if (res.code === 200 && res.data) {
        userInfo.value = res.data;
      }
    }).catch(err => {
      console.log("获取用户信息失败", err);
    });
  }
};

onLoad(() => {
  getIndustries();
});

onShow(() => {
  isLogin.value = uni.getStorageSync("isLogin") || false;
  getUserData();
  getMyCount();
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
}

.header-section {
  background: #ffffff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  position: relative;
  z-index: 100;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    height: 48px;
    padding-right: 30px;

    .industry-picker {
      display: flex;
      align-items: center;
      font-size: 15px;
      color: #17181a;
      font-weight: 500;

      .down-icon {
        width: 14px;
        margin-left: 6px;
        opacity: 0.6;
        transform: rotate(90deg);
        transition: transform 0.3s;

        &.is-open {
          transform: rotate(-90deg);
        }
      }
    }

    .my-supply {
      font-size: 14px;
      color: #3071f2;
      display: flex;
      align-items: center;
      position: relative;
      width: 100px;
      justify-content: flex-end;

      .badge {
        position: absolute;
        top: -8px;
        right: -11px;
        background: #FF6B3A;
        color: #fff;
        font-size: 12px;
        padding: 1px 4px;
        border-radius: 10px;
        height: 14px;
        line-height: 14px;
        min-width: 16px;
        text-align: center;
        width: auto;
      }
    }
  }

  /* 自定义下拉菜单 */
  .dropdown-mask {
    position: absolute;
    top: 48px;
    /* header-section 中 top-row 的高度 */
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }

  .dropdown-menu {
    position: absolute;
    top: 48px;
    left: 0;
    width: 100%;
    background: #ffffff;
    z-index: 100;
    max-height: 400px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

    .dropdown-scroll {
      max-height: 400px;
    }

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
      }
    }
  }

  .search-box {
    background: #f5f7fa;
    border-radius: 8px;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    width: calc(100% - 24px);
    margin: auto;
    margin-bottom: 16px;

    input {
      flex: 1;
      margin-left: 8px;
      font-size: 14px;
      color: #17181a;
    }

    .placeholder-style {
      color: #a1a7b2;
      font-size: 14px;
    }
  }

  .tabs {
    display: flex;
    justify-content: space-around;

    .tab-item {
      font-size: 15px;
      color: #5c5f66;
      padding-bottom: 10px;
      position: relative;
      font-weight: 400;
      text-align: center;

      &.active {
        color: #3071f2;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          background: #3071f2;
          border-radius: 3px;
        }
      }
    }
  }
}

.list-section {
  flex: 1;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;

  .items {
    .item {
      background: #ffffff;
      border-radius: 10px;
      padding: 19px 12px;
      margin-bottom: 10px;
      position: relative;
      overflow: hidden;

      .item-title {
        font-size: 15px;
        font-weight: 600;
        color: #17181a;
        line-height: 24px;
        margin-bottom: 10px;
        width: 80%;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .item-footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;

        .tag-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-family: PingFang SC, PingFang SC;
          font-weight: 400;
          font-size: 13px;

          .date {
            padding: 0 8px;
            color: #8A8F99;
            border-left: 1px solid #CFD4E6;
            border-right: 1px solid #CFD4E6;
            width: auto;
          }
        }

        .type-tag {
          font-size: 12px;
          width: 40px;


          &.supply {
            color: #3071f2;
          }

          &.demand {
            color: #ff8a00;
          }
        }

        .date {
          font-size: 12px;
          color: #a1a7b2;
          margin-right: 12px;
        }

        .company {
          font-size: 12px;
          color: #8a8f99;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
      }

      .stamp {
        position: absolute;
        right: 10px;
        top: 10px;
        align-items: center;
        justify-content: center;
        width: auto;

        .stamp-image {
          width: 38px;
          height: 38px;
        }

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
</style>
