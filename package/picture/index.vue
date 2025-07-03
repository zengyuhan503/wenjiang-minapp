<template>
  <view class="page-body">
    <div class="items">
      <div class="item" v-for="(item, index) in pictures" :key="index">
        <image :src="item.image" @click="onShowPopuref(index)" alt="" mode="aspectFill" />
        <div class="close" @click="onDelete(item.id)" v-if="isLogin">
          <uni-icons type="closeempty" color="#fff" size="14"></uni-icons>
        </div>
      </div>
      <uni-file-picker
        v-if="isLogin"
        :value="pictureFiles"
        fileMediatype="image"
        mode="grid"
        @select="select"
        :auto-upload="false"
        @progress="progress"
        :disable-preview="true"
        @success="success"
        :del-icon="false"
        :imageStyles="imageStyles"
        @fail="fail"
      >
        <div class="item add">
          <image
            src="https://louyutest.cdyunbu.com/wxapp/static/image/addpicture.webp"
            alt=""
          />
        </div>
      </uni-file-picker>
    </div>
  </view>
  <uni-popup ref="popupref" type="center" mask-background-color="rgba(0,0,0,0.8)">
    <div class="images">
      <swiper
        class="swiper"
        circular
        :current="current"
        :indicator-dots="indicatorDots"
        :autoplay="autoplay"
        :interval="interval"
      >
        <swiper-item v-for="(item, index) in pictures" :key="index">
          <div class="item">
            <image :src="item.image" alt="" mode="heightFix" />
          </div>
        </swiper-item>
      </swiper>
      <div class="swiper-action">
        <div class="leftOutlined">
          <image src="./leftOutlined.png" @click="onLeft" alt="" mode="widthFix" />
        </div>
        <div class="rightOutlined">
          <image src="./rightOutlined.png" @click="onRight" alt="" mode="widthFix" />
        </div>
      </div>
    </div>
  </uni-popup>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { house, upload } from "/utlis/https";
import { onLoad } from "@dcloudio/uni-app";
const isLogin = ref(false);
const houseId = ref(null);
const roomId = ref(null);
const pictures = ref([]);
const current = ref(0);
const getPictures = () => {
  house.pictures(houseId.value, roomId.value).then((res) => {
    pictures.value = res.data;
  });
};
const isroot = ref(false);

const indicatorDots = ref(true),
  autoplay = ref(false),
  interval = ref(2000),
  duration = ref(500);
const imageStyles = ref({
  width: "100%",
  height: "100%",
});
const popupref = ref(null);
const onLeft = () => {
  current.value--;
  if (current.value < 0) {
    current.value = pictures.value.length - 1;
  }
};
const onRight = () => {
  current.value++;
  if (current.value > pictures.value.length - 1) {
    current.value = 0;
  }
};
const onShowPopuref = (index) => {
  current.value = index;
  popupref.value.open();
};
const pictureFiles = ref([]);
const select = async (e) => {
  try {
    const tempFiles = e.tempFiles;
    console.log("tempFiles", tempFiles);

    // 创建所有上传任务
    const uploadTasks = tempFiles.map((file) => upload.image(file.path));

    // 并发执行所有上传任务
    const results = await Promise.all(uploadTasks);

    // 过滤成功上传的图片 URL
    const images = results.filter((res) => res.code === 200).map((res) => res.data.url);

    if (images.length > 0) {
      const params = {
        house_id: houseId.value,
        room_id: roomId.value,
        images: images,
      };
      await house.pictures_add(params);
      getPictures();
    } else {
      console.warn("没有成功上传的图片");
    }
  } catch (error) {
    console.error("上传出错", error);
  }
};

const progress = (e) => {
  console.log("progress", e);
};
const success = (e) => {
  console.log("success", e);
};
const fail = (e) => {
  console.log("fail", e);
};
const onDelete = (id) => {
  wx.showModal({
    title: "提示",
    content: "你确定要删除这个图片吗？",
    success(res) {
      if (res.confirm) {
        let params = {
          ids: [id],
          house_id: houseId.value,
          room_id: roomId.value,
        };
        house
          .deletePicture(params)
          .then((res) => {
            getPictures();
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};
onLoad((options) => {
  houseId.value = options.id;
  roomId.value = options.room_id;
  getPictures();
  isLogin.value = uni.getStorageSync("isLogin") || false;
});
</script>

<style lang="less" scoped>
.images {
  width: 100%;
  padding: 30px 20px;
  image {
    height: 100%;
  }
  .item {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.page-body {
  padding: 16px 10px;
  .items {
    display: grid;
    gap: 9px;
    grid-template-columns: repeat(2, 1fr);
    .item {
      border-radius: 8px 8px 8px 8px;
      overflow: hidden;
      position: relative;
      aspect-ratio: 1 / 0.75;
      position: relative;
      image {
        height: 100%;
        width: 100%;
        display: block;
      }
      .close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 22px;
        height: 22px;
        z-index: 80;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        uni-icons {
          position: relative;
          font-weight: 600;
        }
      }

      &.add {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #ffffff;
        border-radius: 6px 6px 6px 6px;
        border: 1px solid #c3ccd9;
        aspect-ratio: 1 / 0.75;
        image {
          width: 40px;
          height: 40px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.images swiper {
  height: 300px;
}
.images {
  position: relative;
  .leftOutlined {
    position: absolute;
    left: 10px;
    top: 50%;

    width: 30px;
    transform: translateY(-50%);
    image {
      width: 30px;
      height: 30px;
    }
  }
  .rightOutlined {
    position: absolute;
    right: 10px;
    top: 50%;
    width: 30px;
    transform: translateY(-50%);
    image {
      width: 30px;
      height: 30px;
    }
  }
}
.uni-file-picker {
  margin-top: 0px;
}
.uni-file-picker__container {
  display: block !important;
  margin: 0 !important;
  & > view {
    border-radius: 8px 8px 8px 8px;
    overflow: initial;
    position: relative;
    aspect-ratio: 1 / 0.75;
    position: relative;
    image {
      display: block;
      border-radius: 8px 8px 8px 8px;
    }
  }
  .add {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    border-radius: 6px 6px 6px 6px;
    aspect-ratio: 1 / 0.75;
    border: 1px solid #c3ccd9;

    image {
      width: 40px;
      height: 40px;
    }
  }
}
.file-picker__box-content {
  margin: 0 !important;
  border: none !important;
}
.file-picker__box {
  border-radius: 8px 8px 8px 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 1 / 0.75;
  position: relative;
}
.file-picker__progress {
  display: none;
}
.uni-file-picker__container .file-picker__box {
  display: none !important;
}

.uni-file-picker__container .file-picker__box:not(:empty):last-of-type {
  display: block !important;
}
</style>
