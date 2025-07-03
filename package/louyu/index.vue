<template>
  <view class="page-body">
    <CustomNavbar ref="customNavBarRef"> </CustomNavbar>
    <view class="page-head">
      <image :src="`${houseDetail.top_image==''?'https://louyutest.cdyunbu.com/wxapp/static/image/case1.png':houseDetail.top_image}`" mode="widthFix"></image>
    </view>
    <view class="page-content">
      <div class="info">
        <div class="title">{{ houseDetail.name }}</div>
        <div class="address">
          <image
            src="https://louyutest.cdyunbu.com/wxapp/static/image/address.png"
            mode="widthFix"
            alt=""
          />
          <text>{{ houseDetail.address }}</text>
        </div>
        <div class="items">
          <div class="item">
            <view class="number">
              <text class="count">{{ houseDetail.area }}</text>
              <text class="unit">㎡</text>
            </view>
            <view class="title"><text>商务总面积</text> </view>
          </div>

          <div class="item">
            <view class="number">
              <text class="count">{{ houseDetail.use_area }}</text>
              <text class="unit">㎡</text>
            </view>
            <view class="title"><text>已用面积</text> </view>
          </div>

          <div class="item">
            <view class="number">
              <text class="count">{{ houseDetail.occupancy_company_num }}</text>
              <text class="point">家</text>
            </view>
            <view class="title"><text>入驻企业数量</text> </view>
          </div>

          <div class="item">
            <view class="number">
              <text class="count">{{ houseDetail.occupancy_rate }}</text>
              <text class="point">%</text>
            </view>
            <view class="title"><text>入驻率</text> </view>
          </div>

          <div class="item">
            <view class="number">
              <text class="count" style="color: #3071f2">{{ houseDetail.avg_rent }}</text>
              <text class="point">元/㎡</text>
            </view>
            <view class="title"><text>平均租金</text> </view>
          </div>

          <div class="item">
            <view class="number">
              <text class="count">{{ houseDetail.avg_rmf }}</text>
              <text class="point">元/㎡</text>
            </view>
            <view class="title"><text>物业费</text> </view>
          </div>
        </div>
      </div>
      <div class="pictures" @click="toPictures">
        <div class="page-title">
          <div>相册</div>
          <div>
            共{{ housePictures.length }}张
            <img
              src="https://louyutest.cdyunbu.com/wxapp/static/image/right.png"
              alt=""
              mode="widthFix"
            />
          </div>
        </div>
        <div class="items">
          <scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120">
            <div class="item" v-for="(item, index) in housePictures" :key="index">
              <image :src="item.image" mode="aspectFill"></image>
            </div>
          </scroll-view>
        </div>
      </div>

      <view class="page-item page-item2">
        <view class="page-title">
          <div>招租信息</div>
          <div @click="toRentalList">
            更多
            <img
              src="https://louyutest.cdyunbu.com/wxapp/static/image/right.png"
              alt=""
              mode="widthFix"
            />
          </div>
        </view>
        <view class="items">
          <view
            class="item"
            v-for="(item, index) in rentalList"
            @click="toRentalDetail(item.id)"
            :key="index"
          >
            <view class="cover">
              <image :src="item.house.image" mode="aspectFill"></image>
            </view>
            <view class="content">
              <view>
                <view class="title"> {{ item.house.name }} </view>
                <view class="desc"> {{ item.desc }} </view>
              </view>
              <view class="time">
                <text>{{ item.created_at_text }} 发布</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <EditLouyu :houseId="houseDetail.id" v-if="houseDetail.id != null" />
    <div class="countus">
      <div class="btn" @click="toConsultation">招租咨询</div>
    </div>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CustomNavbar from "@/components/customNavbar.vue";
import EditLouyu from "/components/editLouyu.vue";
import { house, rental } from "/utlis/https";
import { onLoad, onShow } from "@dcloudio/uni-app";
import moment from "moment";
const isLogin = ref(false);
const housePictures = ref([]);
const houseDetail = ref({
  id: null, // 楼宇id
  sort: null, // 排序
  name: "", // 楼宇名称
  area: null, // 总面积
  register_rate: null, // 注册率
  register_rate_min: null, // 注册率最小值
  register_rate_max: null, // 注册率最大值
  occupancy_rate: null, // 入驻率
  occupancy_rate_min: null, // 入驻率最小值
  occupancy_rate_max: null, // 入驻率最大值
  occupancy_company_num: null, // 入驻企业数量
  occupancy_company_num_min: null, // 入驻企业数量最小值
  occupancy_company_num_max: null, // 入驻企业数量最大值
  up_company_num: null, // 上规上限企业数量
  is_mouse_show: null, // 是否显示鼠标
  map_x: null, // 地图x坐标
  map_y: null, // 地图y坐标
  created_by: null, // 创建者
  updated_by: null, // 更新者
  created_at: null, // 创建时间
  updated_at: null, // 更新时间
  deleted_at: null, // 删除时间
  change_at: null, // 变更时间
  user_id: null, // 用户id
  image: null, // 图片
  top_image: null, // 顶部图片
  address: null, // 地址
  use_area: null, // 使用面积
  avg_rent: null, // 平均租金
  avg_rmf: null, // 平均物业费
  is_build: null, // 是否是建筑
  is_unit: null, // 是否是单元
  user_area: null, // 用户面积
  user_register_rate: null, // 用户注册率
  user_occupancy_rate: null, // 用户入驻率
  user_occupancy_company_num: null, // 用户入驻企业数量
  user_company_num: null, // 用户企业数量
  image: null, // 用户企业数量
});
const getHouseDetail = (id) => {
  house.detail(id).then((res) => {
    houseDetail.value = res.data.info;
    if (houseDetail.value.top_image == null) {
      houseDetail.value.top_image = `https://louyutest.cdyunbu.com/wxapp/static/image/case1.png`;
    }
    housePictures.value = res.data.photos;
  });
};
const query_id = ref(null);
const rentalList = ref([]);
const getRentalList = (id) => {
  rental.list({ house_id: id }).then((res) => {
    rentalList.value = res.data.list.map((item) => {
      item.created_at = moment(item.created_at).format("YYYY-MM-DD");
      return item;
    });
  });
};
const toPictures = () => {
  wx.navigateTo({
    url: `/package/picture/index?id=${houseDetail.value.id}`,
  });
};
const toConsultation = () => {
  wx.navigateTo({
    url: `/package/consultation/index?house_id=${houseDetail.value.id}&title=招租咨询`,
  });
};
const toRentalDetail = (id) => {
  wx.navigateTo({
    url: `/package/lease/detail?id=${id}&house_id=${houseDetail.value.id}`,
  });
};
const toRentalList = () => {
  wx.navigateTo({
    url: `/package/lease/index?id=${houseDetail.value.id}`,
  });
};
onLoad((options) => {
  query_id.value = options.id;
});
onShow(() => {
  getHouseDetail(query_id.value);
  getRentalList(query_id.value);
  isLogin.value = uni.getStorageSync("isLogin") || false;
});
</script>

<style lang="less" scoped>
.page-body {
  width: 100%;
  height: 100%;
  background: #f3f5fa;
}

.page-head {
  width: 100%;
  position: relative;

  image {
    width: 100%;
    display: block;
  }
}
.page-content {
  padding: 0 10px;
  position: relative;
  top: -70px;
  .info {
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    padding: 10px;

    .title {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 18px;
      color: #17181a;
      line-height: 40px;
      text-align: left;
    }
    .address {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 13px;
      color: #7e838c;
      line-height: 24px;
      text-align: left;
      image {
        margin-right: 6px;
        width: 14px;
        height: 14px;
      }
    }

    .items {
      margin-top: 10px;
      display: grid;
      gap: 9px;
      grid-template-columns: repeat(2, 1fr);

      .item {
        background: #f8faff;
        border-radius: 8px 8px 8px 8px;
        padding: 12px 14px;
        box-sizing: border-box;

        .number {
          color: #17181a;
          font-size: 18px;

          text.count {
            font-weight: bold;
            font-weight: 600;
          }

          text.point {
            color: #8a8f99;
            font-size: 13px;
          }

          text.unit {
            color: #8a8f99;
            font-size: 13px;
          }
        }

        .title {
          margin-top: 6px;
          display: flex;
          justify-content: flex-start;
          align-items: center;

          image {
            width: 14px;
          }

          text {
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: #45474d;
            line-height: 20px;
            text-align: left;
            margin-left: 3px;
          }
        }
      }
    }
  }
  .pictures {
    margin-top: 10px;
    padding: 10px;
    background: #ffffff;
    border-radius: 10px 10px 10px 10px;
    overflow: hidden;
    width: 100%;
    .page-title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      view:first-child {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: #17181a;
        line-height: 40px;
        text-align: left;
      }

      view:last-child {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 13px;
        color: #a1a7b2;
        line-height: 20px;
        text-align: right;
        image {
          width: 10px;
          height: 10px;
        }
      }
    }
    .items {
      word-wrap: normal;
      width: 100%;
      overflow: hidden;
      .scroll-view_H {
        width: 100%;
        white-space: nowrap;
      }
      .item {
        width: 100px;
        margin-right: 4px;
        display: inline-block;
        image {
          width: 100px;
          height: 75px;
          border-radius: 6px 6px 6px 6px;
        }
      }
    }
  }

  .page-item2 {
    margin-top: 10px;
    background: #ffffff;
    padding: 0 11px;
    padding-bottom: 16px;
    border-radius: 10px 10px 10px 10px;

    .page-title {
      height: 50px;
      font-family: PingFang SC, PingFang SC;
      font-weight: bold;
      font-size: 16px;
      color: #17181a;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      view:last-child {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #8a8f99;
        line-height: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        image {
          margin-left: 2px;
          width: 12px;
          position: relative;
          top: 1px;
        }
      }
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
          width: 120px;
          height: 88px;
          border-radius: 8px 8px 8px 8px;
          overflow: hidden;
          image {
            width: 100%;
            height: 100% !important;
          }
        }
        .content {
          // width: 70%;
          width: calc(100% - 120px);
          padding-left: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

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
  }
}
.countus {
  height: 90px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  border-top: 1px solid #e1e5ea;
  padding: 0 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 16px;
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
