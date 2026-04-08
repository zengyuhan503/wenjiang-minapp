<template>
  <view class="page-body">
    <view class="header-section">
      <view class="top-row">
        <picker @change="onIndustryChange" :value="industryIndex" :range="industries" range-key="company_name">
          <view class="industry-picker">
            <text>{{ currentIndustryName }}</text>
            <image src="https://louyu.zdocd.com/wxapp/static/image/right.png" mode="widthFix" class="down-icon" style="transform: rotate(90deg);"></image>
          </view>
        </picker>
        <view class="my-supply" @click="toMySupply">
          <text>我的供需</text>
          <view class="badge" v-if="myCount > 0">{{ myCount > 99 ? '99+' : myCount }}</view>
        </view>
      </view>

      <view class="search-box">
        <uni-icons type="search" size="18" color="#A1A7B2"></uni-icons>
        <input type="text" v-model="keyword" placeholder="输入供需关键词搜索" placeholder-class="placeholder-style" @confirm="onSearch" />
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
              <view class="type-tag" :class="item.type == 1 ? 'supply' : 'demand'">{{ item.type == 1 ? '供应' : '求购' }}</view>
              <view class="date">{{ item.created_at}}</view>
              <view class="company">{{ item.company_name }}</view>
            </view>
          </view>

          <!-- 占位印章 -->
          <view class="stamp" v-if="item.status_text">
            <view class="stamp-border"></view>
            <text>{{ item.status_text }}</text>
          </view>
        </view>
      </view>
      
      <view class="loading-status" v-if="loading">加载中...</view>
      <view class="no-more" v-if="!loading && noMore">没有更多了</view>
      <view class="empty-state" v-if="!loading && list.length === 0">暂无数据</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import CustomNavbar from "../../components/customNavbar.vue";
import { supply } from "../../utlis/https";

const industries = ref([{ id: '', company_name: '全部行业' }]);
const industryIndex = ref(0);
const keyword = ref('');
const currentTab = ref(''); // '' = 全部, 1 = 供应, 2 = 求购
const list = ref([]);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const noMore = ref(false);
const myCount = ref(0);

const currentIndustryName = computed(() => {
  console.log(industryIndex.value);
  return industries.value[industryIndex.value]?.company_name || '全部行业';
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
  console.log(selectedIndustry);
  if (selectedIndustry && selectedIndustry.company_name !== '') {
    params.industry = selectedIndustry.company_name
  }

  supply.list(params).then(res => {
    if (res.code == 200 && res.data) {
      let newData = res.data.list || [];
      // 如果后端没返回，临时造点假数据用于展示界面效果
      if (newData.length === 0 && page.value === 1 && !keyword.value) {
         newData = [
           { id: 1, title: '供需标题供需标题供需标题', type: 1, created_at_text: '2024.10.30', company_name: '成都科大讯飞教育科技股份有限公司', status_text: '已对接' },
           { id: 2, title: '供需标题供需标题供需标题供需标题供需标题供需标题供需标题供需', type: 1, created_at_text: '2024.10.30', company_name: '成都科大讯飞教育科技股份有限公司', status_text: '已对接' },
           { id: 3, title: '供需标题供需标题供需标题', type: 2, created_at_text: '2024.10.30', company_name: '成都科大讯飞科技股份有限公司', status_text: '已对接' },
           { id: 4, title: '供需标题供需标题供需标题', type: 2, created_at_text: '2024.10.30', company_name: '成都科大讯飞科技股份有限公司', status_text: '已对接' },
           { id: 5, title: '供需标题供需标题供需标题', type: 2, created_at_text: '2024.10.30', company_name: '成都科大讯飞科技股份有限公司', status_text: '已对接' }
         ];
      }

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

const onIndustryChange = (e) => {
  industryIndex.value = e.detail.value;
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

onLoad(() => {
  getIndustries();
});

onShow(() => {
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
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    height: 48px;

    .industry-picker {
      display: flex;
      align-items: center;
      font-size: 15px;
      color: #17181a;
      font-weight: 500;
      
      .down-icon {
        width: 10px;
        margin-left: 6px;
        opacity: 0.6;
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
        right: -20px;
        background: #ff5252;
        color: #fff;
        font-size: 10px;
        padding: 0 4px;
        border-radius: 10px;
        height: 16px;
        line-height: 16px;
        min-width: 16px;
        text-align: center;
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
           .date{
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
        top: 20px;
        width: 60px;
        height: 60px;
        border: 2px dashed #42b983;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-15deg);
        opacity: 0.5;
        
        text {
          color: #42b983;
          font-size: 14px;
          font-weight: bold;
        }
        
        .stamp-border {
           position: absolute;
           width: 50px;
           height: 50px;
           border: 1px solid #42b983;
           border-radius: 50%;
        }
      }
    }
  }

  .loading-status, .no-more, .empty-state {
    text-align: center;
    font-size: 13px;
    color: #a1a7b2;
    padding: 16px 0;
  }
}
</style>
