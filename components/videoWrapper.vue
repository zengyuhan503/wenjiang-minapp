<template>
  <view class="video-wrapper">
    <video
      :id="'video_' + videoId"
      class="video"
      :poster="poster"
      :controls="true"
      :show-center-play-btn="true"
      :autoplay="false"
      :muted="false"
      :loop="false"
      :enable-progress-gesture="true"
      :src="videoSrc"
      @error="handleError"
      @play="handlePlay"
    ></video>

    <!-- 自定义播放按钮 -->
    <!-- <image
      v-if="showPlayBtn"
      class="play-btn"
      src="https://louyutest.cdyunbu.com/wxapp/static/image/custom-play.webp"
      @click="playVideo"
    /> -->
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 接收父组件传参
const props = defineProps({
  videoSrc: { type: String, required: true },
  poster: { type: String, required: true },
  videoId: { type: String, default: () => `` },
});

const showPlayBtn = ref(true);

function playVideo() {
  console.log(props.videoId);
  showPlayBtn.value = false;
  const videoContext = uni.createVideoContext(`video_${props.videoId}`);
  console.log(videoContext);
  videoContext.play();
}

function handleError(e) {
  console.log("error");
  console.log(e);
}

function handlePlay(e) {
  console.log("play");
  console.log(e);
}
</script>

<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  margin-bottom: 15px;
  border-radius: 8px  8px  8px  8px;
  overflow: hidden;
}

.video {
  width: 100%;
  height: 100%;
}

.play-btn {
  position: absolute;
  width: 60px;
  height: 60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
</style>
