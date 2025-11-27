<template>
  <view class="louyu-formstate">
    <div class="page-title">
      <div class="title">
        <text>入驻企业</text>
        <div
          class="btn1"
          v-if="isStatus === 0"
          :class="{ active: isStatus === 1 }"
          @click="changeStatus(1)"
        >
          只看空置
        </div>
        <div
          class="btn1"
          v-if="isStatus === 1"
          :class="{ active: isStatus === 0 }"
          @click="changeStatus(0)"
        >
          看所有
        </div>
      </div>

      <div class="action" v-if="isLogin" @click="addCompany">
        <img
          src="https://louyu.zdocd.com/wxapp/static/image/add.png"
          mode="widthFix"
          alt=""
        />
        <text>新增企业</text>
      </div>
    </div>
    <div class="collapse">
      <div class="collaps" v-for="(item, index) in collaps" :key="index">
        <div class="collapse-head" @click="onShowCollaps(index)">
          <div class="collapse-title">
            {{
              (item.build_name ? item.build_name + "-" : "") +
              (item.unit_name ? item.unit_name + "-" : "") +
              (item.name || "")
            }}
          </div>
          <div class="icon">
            <uni-icons
              type="down"
              v-if="!item.show"
              size="15"
              color="#a1a7b2"
            ></uni-icons>
            <uni-icons type="up" v-else size="15" color="#a1a7b2"></uni-icons>
          </div>
        </div>
        <div class="collapse-main" :class="{ isActive: item.show }">
          <div class="collap" v-for="company in item.companyList" :key="company.id">
            <div class="use" v-if="company.status == 1">
              <div class="items">
                <div class="item">
                  <div class="title">
                    <div class="text">
                      {{
                        [item.build_name, item.unit_name, item.name, company.name]
                          .filter(Boolean)
                          .join("-")
                      }}
                      <text>已租</text>
                    </div>
                    <div class="action">
                      <div
                        class="btn1"
                        v-if="isLoginReady && ShowPhotos(company)"
                        @click="toPhotos(company.id)"
                      >
                        相册
                      </div>
                      <div
                        class="btn2"
                        v-if="isLogin"
                        @click="toEdit(company.id, company)"
                      >
                        编辑
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="list">
                <div
                  class="item"
                  v-for="company_1 in company.company_list"
                  :key="company_1.id"
                >
                  <div class="title">{{ company_1.name }}</div>
                  <div class="count">
                    {{ getAreaValue(company.id, company_1.area_list) }}m²
                  </div>
                </div>
              </div>
            </div>
            <div class="vacancy" v-else>
              <div class="items">
                <div class="item">
                  <div class="title">
                    <div class="text">
                      {{
                        (item.build_name ? item.build_name + "-" : "") +
                        (item.unit_name ? item.unit_name + "-" : "") +
                        (item.name ? item.name + "-" : "") +
                        (company.name || "")
                      }}

                      <text v-if="company.status == 1">已租</text>
                      <text v-else style="background: #f9ad43">空置</text>
                    </div>

                    <div class="action">
                      <div
                        class="btn1"
                        v-if="isLoginReady && ShowPhotos(company)"
                        @click="toPhotos(company.id)"
                      >
                        相册
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="info">
                <text>面积{{ company.area }}m²</text>
                <text>租金{{ company.rent }}元/m²</text>
                <text>物业费{{ company.rmf }}元/m²</text>
              </div>
              <div class="pictures">
                <div class="item" v-for="(item, index) in company.photo2" :key="index">
                  <image :src="item.image" mode="aspectFill"></image>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { house } from "/utlis/https";
import { onShow } from "@dcloudio/uni-app";
const porps = defineProps({
  houseId: {
    type: Number,
    required: true,
  },
});
const isStatus = ref(0);
const collaps = ref([]);
const isLogin = ref(false);
const isLoginReady = ref(false);
const showCompanys = [];
const ShowPhotos = (company) => {
  if (isLogin.value) {
    return true;
  } else {
    return company.is_show_photo == 1 ? true : false;
  }
};
const changeStatus = (status) => {
  isStatus.value = status;
  getFloorList();
};
const addCompany = () => {
  wx.navigateTo({
    url: `/package/louyu/edit?house_id=${porps.houseId}&type=add`,
  });
};
const toPhotos = (id) => {
  wx.navigateTo({
    url: `/package/picture/index?room_id=${id}&id=${porps.houseId}`,
  });
};
const toEdit = (id, item) => {
  uni.setStorageSync("edit_company", item);
  wx.navigateTo({
    url: `/package/louyu/edit?room_id=${id}&house_id=${porps.houseId}&type=edit`,
  });
};
const getFloorList = () => {
  house.floor({ house_id: porps.houseId, status: isStatus.value }).then(async (res) => {
    let list = res.data;
    collaps.value = await Promise.all(
      list.map(async (item, index) => {
        let params = {
          house_id: porps.houseId,
          floor_id: item.id,
          status: isStatus.value,
        };
        let companyList = await house.company(params);
        let show = showCompanys.includes(item.id) || false;
        if (companyList.data.length == 0) {
          show = false;
        }
        return {
          show: show,
          ...item,
          companyList: companyList.data,
        };
      })
    );
  });
};
const getAreaValue = (company_id, area_list) => {
  let area = area_list.find((item) => {
    return item.id == company_id;
  });
  return area ? area.area : 0;
};

const onShowCollaps = (index) => {
  let id = collaps.value[index].id;
  const isShow = (collaps.value[index].show = !collaps.value[index].show);
  let has = showCompanys.includes(id);
  if (isShow) {
    if (!has) {
      showCompanys.push(id);
    }
  } else {
    if (has) {
      showCompanys.splice(showCompanys.indexOf(id), 1);
    }
  }
  uni.setStorageSync("showCompanys", JSON.stringify(showCompanys));
};

watch(
  porps.houseId,
  () => {
    if (porps.houseId !== null) {
      getFloorList();
    }
  },
  { immediate: true, deep: true }
);
onShow(() => {
  if (porps.houseId !== null) {
    getFloorList();
  }
});
onMounted(() => {
  isLogin.value = uni.getStorageSync("isLogin") || false;
  isLoginReady.value = true;
  showCompanys.value = JSON.parse(uni.getStorageSync("showCompanys")) || [];
});
</script>

<style scoped lang="less">
.louyu-formstate {
  padding: 9px;
  position: relative;
  top: -70px;
  padding-top: 0;
}
.page-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  box-sizing: border-box;

  .title {
    display: flex;
    justify-self: start;
    align-items: center;
    text {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 16px;
      color: #17181a;
      text-align: left;
    }
    .btn1 {
      width: auto;
      background: #ffffff;
      border-radius: 6px 6px 6px 6px;
      border: 1px solid #c3ccd9;
      padding: 4px 8px;
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #45474d;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 14px;
    }
  }
  .action {
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100px;
    image {
      width: 16px;
    }
    text {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #3071f2;
      line-height: 20px;
      margin-left: 6px;
    }
  }
}
.collapse {
  .collaps {
    background: #f8faff;
    border-radius: 6px 6px 6px 6px;
    padding: 0 11px;
    margin-bottom: 8px;
  }
  .collapse-head {
    height: 44px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;

    .collapse-title {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 15px;
      color: #17181a;
      line-height: 44px;
      text-align: left;
    }
    .icon {
      text-align: right;
      font-size: 13px;
      color: #a1a7b2;
    }
  }

  .collapse-main {
    transition: max-height 0.5s ease;
    max-height: 0;
    overflow: hidden;

    &.isActive {
      max-height: 500px; /* 设置一个足够大的值 */
    }
    .collap {
      padding: 12px 0;
      border-top: 1px solid #e1e5ea;
      &:first-child {
        border-top: none;
      }
    }
    .items {
      .item {
        .title {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .text {
            width: 70%;
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 15px;
            color: #17181a;
            line-height: 26px;
            text-align: left;
            text {
              display: inline-block;
              width: 40px;
              height: 20px;
              background: #00cc88;
              border-radius: 12px 12px 12px 12px;
              font-family: PingFang SC, PingFang SC;
              font-weight: 500;
              font-size: 12px;
              color: #ffffff;
              line-height: 20px;
              text-align: center;
              margin-left: 10px;
            }
          }
          .action {
            width: 30%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            view {
              width: 46px;
              height: 26px;
              background: rgba(48, 113, 242, 0.1);
              border-radius: 6px 6px 6px 6px;
              font-family: PingFang SC, PingFang SC;
              font-weight: 400;
              font-size: 13px;
              color: #3071f2;
              line-height: 26px;
              text-align: center;
              &.btn2 {
                margin-left: 7px;
              }
            }
          }
        }
      }
    }
    .list {
      padding: 8px 0;
      .item {
        padding: 2px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
          font-family: PingFang SC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #5c5f66;
          line-height: 24px;
          text-align: left;
        }
        .count {
          font-family: PingFang SC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #5c5f66;
          line-height: 24px;
          text-align: right;
        }
      }
    }
    .info {
      padding: 8px 0;
      display: flex;
      justify-content: space-between;
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #5c5f66;
      line-height: 24px;
      text-align: center;
    }
    .pictures {
      word-wrap: normal;
      width: 100%;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
      display: flex;
      flex-wrap: nowrap; /* 保持单行 */
      overflow-x: auto; /* 开启横向滚动 */
      overflow-y: hidden;
      &::-webkit-scrollbar {
        display: none;
      }
      .item {
        flex: 0 0 auto; /* 关键：不缩放，宽度固定 */
        width: 154px;
        height: 86px;
        border-radius: 8px;
        overflow: hidden;
        image {
          width: 100%;
          height: 100% !important;
        }
      }
    }
  }
}
</style>
