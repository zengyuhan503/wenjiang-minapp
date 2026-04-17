<template>
  <view class="page-container">
    <!-- 顶部导航栏，带蓝色渐变背景 -->
    <view class="navbar-wrapper">
      <view class="nav-bg">
        <image src="https://louyu.zdocd.com/wxapp/static/tabbar/ai_back.png" mode="widthFix" class="bg-img"></image>
      </view>
    </view>
    <CustomNavbar title="温小楼" titleColor="#17181a" bgColor="transparent" />

    <!-- 聊天记录区域 -->
    <scroll-view  
      scroll-y 
      class="chat-scroll-area" 
      :scroll-into-view="scrollToView"
      scroll-with-animation
      :show-scrollbar="false"
    >
      <view class="chat-content">
        
        <!-- 欢迎卡片 (固定显示在最顶部) -->
        <view class="chat-item welcome-item" id="msg-welcome">
          <view class="welcome-card">
            <image class="robot-avatar" src="https://louyu.zdocd.com/wxapp/static/image/aix2.png" mode="aspectFit"></image>
            <view class="welcome-title">Hi~</view>
            <view class="welcome-subtitle">我是温小楼Ai政策小助理~</view>
            <view class="welcome-desc">您可以输入对政策的疑问，我可以快速回答你或者给你推送相关政策文件哦~</view>
          </view>
        </view>

        <!-- 历史记录和当前对话列表 -->
        <block v-for="(msg, index) in messageList" :key="index">
          
          <!-- 用户消息 (右侧蓝色气泡) -->
          <view class="chat-item user-item" v-if="msg.type === 'user'" :id="'msg-' + index">
            <view class="bubble user-bubble">
              <text>{{ msg.content }}</text>
            </view>
          </view>

          <!-- AI 回复 (左侧) -->
          <view class="chat-item ai-item" v-if="msg.type === 'ai'" :id="'msg-' + index">
            
            <!-- 相关政策文件卡片 -->
            <view class="ai-card files-card" v-if="msg.policy_file_list && msg.policy_file_list.length > 0">
              <view class="card-title">相关政策文件</view>
              <view class="file-list">
                <view class="file-item" v-for="(file, fIndex) in msg.policy_file_list" :key="fIndex" @click="openFile(file)">
                  <view class="file-icon" :class="getFileTypeClass(file.name || file.title)">
                    <image src="https://louyu.zdocd.com/wxapp/static/image/excel_icon4.png" mode="widthFix"></image>
                  </view>
                  <view class="file-name">{{ file.name || file.title }}</view>
                </view>
              </view>
            </view>

            <!-- AI 文本回答卡片 -->
            <view class="ai-card text-card" v-if="msg.content || msg.isTyping || msg.isLoading">
              <view class="card-title" v-if="!msg.isLoading && msg.content !== '已停止生成' && msg.content !== '获取回答失败' && msg.content !== '网络请求失败'">这是我为您搜索出的答案：</view>
              <view class="answer-text">
                <text v-if="!msg.isLoading">{{ msg.isTyping ? msg.displayedContent : msg.content }}</text>
                <text v-if="msg.isTyping" class="cursor">|</text>
                
                <!-- 加载中动画 -->
                <view v-if="msg.isLoading" class="loading-dots">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
            </view>

          </view>

        </block>
        
        <!-- 底部垫高，防止内容被输入框遮挡 -->
        <view class="bottom-padding" id="msg-bottom-1"></view>
        <view class="bottom-padding" id="msg-bottom-2"></view>
      </view>
    </scroll-view>

        <!-- 底部输入区（卡片式） -->
    <view class="input-area">
      <view class="input-card">
        <textarea 
          class="chat-input" 
          v-model="inputValue" 
          placeholder="请输入对政策的问题" 
          placeholder-class="placeholder-style"
          :auto-height="false"
          :maxlength="200"
          :show-confirm-bar="false"
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view class="send-btn" @click="sendMessage" v-if="!isGenerating">
          <image src="https://louyu.zdocd.com/wxapp/static/image/up-arrow.png" mode="widthFix" class="send-icon"></image>
        </view>
        <view class="send-btn stop-btn" @click="stopGenerating" v-else>
          <view class="stop-icon"></view>
        </view>
      </view>
      <!-- 安全区适配 -->
      <view class="safe-area-bottom"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { ai } from '../../utlis/https.js';
import CustomNavbar from "../../components/customNavbar.vue";

const inputValue = ref('');
const messageList = ref([]);
const scrollToView = ref('');
const bottomId = ref('msg-bottom-1');
const sessionId = ref(null);
const isLoading = ref(false);
const isGenerating = ref(false);
let currentTypingTimer = null;
let scrollThrottleTimer = null;

// 节流版滚动到底部，避免打字机期间频繁触发重排
const throttledScrollToBottom = () => {
  if (scrollThrottleTimer) return;
  scrollThrottleTimer = setTimeout(() => {
    scrollToBottom();
    scrollThrottleTimer = null;
  }, 300); // 限制 300ms 触发一次
};

const stopGenerating = () => {
  isGenerating.value = false;
  isLoading.value = false;
  
  if (currentTypingTimer) {
    clearInterval(currentTypingTimer);
    currentTypingTimer = null;
  }
  
  if (messageList.value.length > 0) {
    const lastMsg = messageList.value[messageList.value.length - 1];
    if (lastMsg.type === 'ai') {
      if (lastMsg.isLoading) {
        lastMsg.isLoading = false;
        lastMsg.content = '已停止生成';
      } else if (lastMsg.isTyping) {
        lastMsg.isTyping = false;
        lastMsg.content = lastMsg.displayedContent || '已停止生成';
      }
    }
  }
};

const getHistory = () => {
  const isLogin = uni.getStorageSync("isLogin");
  if (!isLogin) {
    return; // 未登录时不请求历史记录
  }
  uni.showLoading({ title: '加载中' });
  ai.history({ page: 1, page_size: 50 }).then(res => {
    if (res.code === 200 && res.data) {
      if (res.data.list && res.data.list.length > 0) {
        const historyList = res.data.list.reverse();
        historyList.forEach(item => {
          if (item.question) {
            messageList.value.push({ type: 'user', content: item.question });
          }
          const files = item.policy_file_list && item.policy_file_list.length > 0 
            ? item.policy_file_list 
            : (item.related_files || []);
            
          if (item.answer || files.length > 0) {
            messageList.value.push({
              type: 'ai',
              content: item.answer,
              policy_file_list: files
            });
          }
        });
      }
      scrollToBottom();
    } else {
      scrollToBottom();
    }
  }).catch(err => {
    console.log('获取历史记录失败', err);
    scrollToBottom();
  }).finally(() => {
    uni.hideLoading();
  });
};

// 模拟打字机效果
const typeMessage = (fullText, msgObj) => {
  if (!fullText) {
    msgObj.isTyping = false;
    msgObj.content = '未获取到有效回答';
    isGenerating.value = false;
    return;
  }
  let i = 0;
  msgObj.isTyping = true;
  msgObj.displayedContent = '';
  
  currentTypingTimer = setInterval(() => {
    if (!isGenerating.value) {
      clearInterval(currentTypingTimer);
      currentTypingTimer = null;
      msgObj.isTyping = false;
      msgObj.content = msgObj.displayedContent || '已停止生成';
      return;
    }

    if (i < fullText.length) {
      msgObj.displayedContent += fullText.charAt(i);
      i++;
      // 使用节流版本稍微滚动到底部，极大降低渲染开销
      throttledScrollToBottom();
    } else {
      clearInterval(currentTypingTimer);
      currentTypingTimer = null;
      msgObj.isTyping = false;
      msgObj.content = fullText;
      isGenerating.value = false;
      scrollToBottom();
    }
  }, 30); // 30ms/字，打字速度
};

const sendMessage = () => {
  const content = inputValue.value.trim();
  if (!content || isGenerating.value) return;

  // 用户发送消息
  messageList.value.push({ type: 'user', content });
  
  // 必须在清空前隐藏键盘，或使用 nextTick 清空，避免回车换行符被保留
  setTimeout(() => {
    inputValue.value = '';
  }, 10);
  
  // 立即插入一个正在加载的 AI 消息占位
  const placeholderAiMsg = {
    type: 'ai',
    content: '',
    displayedContent: '',
    isTyping: false,
    isLoading: true,
    policy_file_list: []
  };
  messageList.value.push(placeholderAiMsg);
  const activeMsgIndex = messageList.value.length - 1;

  scrollToBottom();

  isLoading.value = true;
  isGenerating.value = true;

  const params = {
    question: content
  };
  if (sessionId.value) {
    params.session_id = sessionId.value;
  }

  ai.ask(params).then(res => {
    if (!isGenerating.value) return; // 用户已停止生成
    
    const activeMsg = messageList.value[activeMsgIndex];
    activeMsg.isLoading = false;
    
    if (res.code === 200 && res.data) {
      if (res.data.session_id) {
        sessionId.value = res.data.session_id;
      }
      
      activeMsg.policy_file_list = res.data.policy_file_list && res.data.policy_file_list.length > 0 
          ? res.data.policy_file_list 
          : (res.data.related_files || []);
      
      // 开始打字机动画
      typeMessage(res.data.answer || '', activeMsg);
      
    } else {
      uni.showToast({ title: res.message || '获取回答失败', icon: 'none' ,duration: 3500});
      activeMsg.content = '获取回答失败';
      isGenerating.value = false;
    }
  }).catch(err => {
    if (isGenerating.value) {
      uni.showToast({ title: '网络请求失败', icon: 'none' ,duration: 3500});
      const activeMsg = messageList.value[activeMsgIndex];
      activeMsg.isLoading = false;
      activeMsg.content = '网络请求失败';
      isGenerating.value = false;
    }
  }).finally(() => {
    isLoading.value = false;
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    // scroll-into-view 需要重置为空值后再赋值新的 id 才能触发组件的更新侦听
    // 并且 setTimeout 给小程序一点点渲染时间差，不然容易被 Vue 批处理优化掉
    scrollToView.value = '';
    
    setTimeout(() => {
      bottomId.value = bottomId.value === 'msg-bottom-1' ? 'msg-bottom-2' : 'msg-bottom-1';
      scrollToView.value = bottomId.value;
    }, 50);
  });
};

const openFile = (file) => {
  const url = file.file_url;
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
          showMenu: true,
          success: () => {
            uni.hideLoading();
            console.log('打开文档成功');
          },
          fail: (err) => {
            uni.hideLoading();
            console.log('打开文档失败', err);
            uni.showToast({ title: '打开文档失败', icon: 'none' ,duration: 3500});
          }
        });
      } else {
        uni.hideLoading();
        uni.showToast({ title: '文件下载失败', icon: 'none' ,duration: 3500});
      }
    },
    fail: (err) => {
      console.log('下载失败', err);
      uni.hideLoading();
      uni.showToast({ title: '文件下载失败', icon: 'none' ,duration: 3500});
    }
  });
};

const getFileExtension = (filename) => {
  if (!filename) return 'UNK';
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].substring(0, 3).toUpperCase();
  }
  return 'UNK';
};

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

onLoad(() => {
  getHistory();
});
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #EBF1FC;
  position: relative;
}

.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 240px;
  z-index: 0;
  
  .nav-bg {
    width: 100%;
    height: 100%;
    overflow: hidden;
    
    .bg-img {
      width: 100%;
      height: 100vh;
      position: fixed;
      bottom: 0;
    }
  }
}

.chat-scroll-area {
  flex: 1;
  position: relative;
  z-index: 10;
  padding-top: 20px;
  margin-top: 80px; /* 避开导航栏 */
  height: calc(100vh - 80px - 140px - 20px); /* 导航栏高度 - 底部输入框预估高度 - 底部安全区 */
  box-sizing: border-box;

}

/* 隐藏 scroll-view 滚动条 (针对各种平台) */
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

.chat-content {
  padding: 16px 16px 20px; /* 底部不再需要留超大空白，给个基础 padding 即可 */
  padding-top: 0;
}

/* 欢迎卡片 */
.welcome-item {
  margin-bottom: 24px;
}

.welcome-card {
  position: relative;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px 20px 20px;
  border: 1px solid rgba(255,255,255,0.8);
  margin-top: 30px; 
  
  .robot-avatar {
    position: absolute;
    top: -40px;
    right: -10px;
    width: 110px;
    height: 110px;
  }
  
  .welcome-title {
    font-size: 18px;
    font-weight: 600;
    color: #17181a;
    margin-bottom: 8px;
  }
  
  .welcome-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: #17181a;
    margin-bottom: 12px;
  }
  
  .welcome-desc {
    font-size: 13px;
    color: #5c5f66;
    line-height: 22px;
  }
}

/* 聊天项通用 */
.chat-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

/* 用户气泡 */
.user-item {
  align-items: flex-end;
  
  .user-bubble {
    background-color: #4B87FF;
    color: #ffffff;
    padding: 12px 16px;
    border-radius: 12px 0 12px 12px;
    max-width: 80%;
    font-size: 14px;
    line-height: 22px;
    word-break: break-all;
  }
}

/* AI 回复卡片 */
.ai-item {
  align-items: flex-start;
  gap: 12px;
}

.ai-card {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 12px 12px 12px 12px;
  padding: 12px;
  width: 100%;
  position: relative;
  
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #17181a;
    height: 38px;
    line-height: 28px;
  }

  .action-btn {
    position: absolute;
    right: 12px;
    bottom: 12px;
    width: 24px;
    height: 24px;
    background-color: #7B85FF;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .action-icon {
      width: 12px;
      height: 12px;
      filter: brightness(0) invert(1);
    }
  }
}
.text-card{
  border-radius: 12px 12px 12px 12px;
}

/* 文件列表 */
.file-list {
  display: flex;
  flex-direction: column;
  
  .file-item {
    height: 56px;
    line-height: 56px;
    display: flex;
    align-items: center;
    border-top: 1px dashed #CFD4E6;
    
    .file-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      flex-shrink: 0;
      
      text {
        color: #fff;
        font-size: 10px;
        font-weight: bold;
      }
      
      image {
        width: 100%;
        height: 100%;
      }
    }
    
    .file-name {
      font-size: 15px;
      color: #17171A;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* 文本回答 */
.answer-text {
  font-size: 14px;
  color: #2E2F33;
  line-height: 24px;
  text-align: justify;
  
  .cursor {
    display: inline-block;
    width: 2px;
    height: 14px;
    background-color: #2E2F33;
    margin-left: 2px;
    animation: blink 1s step-end infinite;
    vertical-align: middle;
  }
}

/* 加载中动画 */
.loading-dots {
  display: flex;
  align-items: center;
  height: 24px;
  
  .dot {
    width: 6px;
    height: 6px;
    background-color: #7B85FF;
    border-radius: 50%;
    margin-right: 4px;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  .dot:nth-child(3) { animation-delay: 0s; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 底部垫高 */
.bottom-padding {
  height: 2px;
}

/* 底部输入区 (大卡片样式) */
.input-area {
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background: transparent;
  z-index: 100;
  height: 140px;
  
  .input-card {
    background-color: #ffffff;
    border-radius: 12px 12px 12px 12px;
    padding: 10px ;
    box-shadow: 0px 0px 16px 0px rgba(31,91,211,0.05);
    position: relative;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    
    .chat-input {
      width: 100%;
      height: 60px;
      font-size: 15px;
      color: #17181a;
      line-height: 22px;
    }
    
    .placeholder-style {
      color: #a1a7b2;
    }
    
    .send-btn {
      position: absolute;
      right: 12px;
      bottom: 12px;
      width: 28px;
      height: 28px;
      background-color: #7B85FF;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      
      .send-icon {
        width: 14px;
        height: 14px;
        filter: brightness(0) invert(1);
      }
      
      &:active {
        opacity: 0.8;
      }
      
      &.stop-btn {
        background-color: #7B85FF;
        
        .stop-icon {
          width: 10px;
          height: 10px;
          background-color: #ffffff;
          border-radius: 2px;
        }
      }
    }
  }
  
  .safe-area-bottom {
    height: env(safe-area-inset-bottom);
  }
}
</style>
