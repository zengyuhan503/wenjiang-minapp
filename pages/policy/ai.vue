<template>
  <view class="page-container">
    <!-- 顶部导航栏，带蓝色渐变背景 -->
    <view class="navbar-wrapper">
      <view class="nav-bg">
        <image src="../../static/tabbar/ai_back.png" mode="widthFix" class="bg-img"></image>
      </view>
    </view>
    <CustomNavbar title="温小楼" titleColor="#17181a" bgColor="transparent" />

    <!-- 聊天记录区域 -->
    <scroll-view  
      scroll-y 
      class="chat-scroll-area" 
      :scroll-into-view="scrollToView"
      scroll-with-animation
    >
      <view class="chat-content">
        
        <!-- 欢迎卡片 (固定显示在最顶部) -->
        <view class="chat-item welcome-item" id="msg-welcome">
          <view class="welcome-card">
            <image class="robot-avatar" src="../../static/image/ai.png" mode="aspectFit"></image>
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
                    <image src="../../static/image/excel_icon (3).png" mode="widthFix" v-if="getFileTypeClass(file.name || file.title) === 'type-excel'"></image>
                    <text v-else>{{ getFileExtension(file.name || file.title) }}</text>
                  </view>
                  <view class="file-name">{{ file.name || file.title }}</view>
                </view>
              </view>
            </view>

            <!-- AI 文本回答卡片 -->
            <view class="ai-card text-card" v-if="msg.content">
              <view class="card-title" v-if="msg.content.length > 50">这是我为您搜索出的答案：</view>
              <view class="answer-text">
                <text>{{ msg.content }}</text>
              </view>
              <!-- 模拟卡片右下角的上箭头小按钮 (设计图最后一条消息有此按钮) -->
              <view class="action-btn" v-if="index === messageList.length - 1 && msg.content.length < 50">
                <image src="https://louyu.zdocd.com/wxapp/static/image/up-arrow.png" mode="widthFix" class="action-icon"></image>
              </view>
            </view>

          </view>

        </block>
        
        <!-- 底部垫高，防止内容被输入框遮挡 -->
        <view class="bottom-padding"></view>
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
        />
        <view class="send-btn" @click="sendMessage">
          <image src="https://louyu.zdocd.com/wxapp/static/image/up-arrow.png" mode="widthFix" class="send-icon"></image>
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
const sessionId = ref(null);
const isLoading = ref(false);

const getHistory = () => {
  uni.showLoading({ title: '加载中' });
  ai.history({ page: 1, page_size: 50 }).then(res => {
    // 成功获取数据，但数据列表为空时，展示静态数据
    if (res.code === 200 && res.data) {
      if (res.data.list && res.data.list.length > 0) {
        const historyList = res.data.list.reverse();
        historyList.forEach(item => {
          if (item.question) {
            messageList.value.push({ type: 'user', content: item.question });
          }
          if (item.answer || (item.policy_file_list && item.policy_file_list.length > 0)) {
            messageList.value.push({
              type: 'ai',
              content: item.answer,
              policy_file_list: item.policy_file_list || []
            });
          }
        });
      } else {
        // list 为空，填充测试数据
        addMockData();
      }
      scrollToBottom();
    } else {
      // 接口返回的不是 200 或没有 data，也填充测试数据
      addMockData();
      scrollToBottom();
    }
  }).catch(err => {
    console.log('获取历史记录失败', err);
    addMockData();
    scrollToBottom();
  }).finally(() => {
    uni.hideLoading();
  });
};

// 增加静态 UI 测试数据
const addMockData = () => {
  // 第一个卡片：只包含相关政策文件
  messageList.value.push({
    type: 'ai',
    content: '',
    policy_file_list: [
      { title: '文件名称展示.pdf' },
      { title: '文件名称展示文件名称展示文件名称展.txt' },
      { title: '文件名称展示文件名称展示文.doc' },
      { title: '文件名称展示文件.ppt' }
    ]
  });

  // 第二个卡片：AI 回答的文本内容
  messageList.value.push({
    type: 'ai',
    content: '当前市场供需关系呈现结构性分化特征，整体供需格局趋于动态调整。部分领域供给相对充足，竞争较为充分，但有效供给与高品质需求仍存在一定差距。随着消费需求持续升级，市场对产品质量、服务体验和个性化供给提出更高要求。',
    policy_file_list: []
  });

  // 第三个气泡：用户的提问
  messageList.value.push({
    type: 'user',
    content: '当前市场供需关系呈现结构性分化特征'
  });

  // 第四个卡片：AI 回答的文本内容，带有点赞/反馈按钮的假象结构
  messageList.value.push({
    type: 'ai',
    content: '当前市场供需关系呈现结构性分化特征，整体供需格局趋于动态调整。',
    policy_file_list: []
  });
};

const sendMessage = () => {
  const content = inputValue.value.trim();
  if (!content || isLoading.value) return;

  // 用户发送消息
  messageList.value.push({ type: 'user', content });
  inputValue.value = '';
  scrollToBottom();

  isLoading.value = true;

  const params = {
    question: content
  };
  if (sessionId.value) {
    params.session_id = sessionId.value;
  }

  ai.ask(params).then(res => {
    if (res.code === 200 && res.data) {
      if (res.data.session_id) {
        sessionId.value = res.data.session_id;
      }
      messageList.value.push({
        type: 'ai',
        content: res.data.answer,
        policy_file_list: res.data.policy_file_list || []
      });
      scrollToBottom();
    } else {
      uni.showToast({ title: res.message || '获取回答失败', icon: 'none' });
    }
  }).catch(err => {
    uni.showToast({ title: '网络请求失败', icon: 'none' });
  }).finally(() => {
    isLoading.value = false;
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      const len = messageList.value.length;
      if (len > 0) {
        scrollToView.value = 'msg-' + (len - 1);
      } else {
        scrollToView.value = 'msg-welcome';
      }
    }, 100);
  });
};

const openFile = (file) => {
  uni.showToast({ title: '打开文件: ' + (file.name || file.title), icon: 'none' });
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
  margin-top: 80px; /* 避开导航栏 */
}

.chat-content {
  padding: 16px 16px 170px; /* 底部给输入框留出充足空间 */
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
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px 12px 12px 12px;
  padding: 16px;
  width: 85%;
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #17181a;
    margin-bottom: 12px;
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

/* 文件列表 */
.file-list {
  display: flex;
  flex-direction: column;
  
  .file-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px dashed #e8eaf0;
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    &:first-child {
      padding-top: 0;
    }
    
    .file-icon {
      width: 28px;
      height: 28px;
      border-radius: 4px;
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
      
      &.type-pdf { background: #ff5a5f; }
      &.type-txt { background: #40c4ff; }
      &.type-doc { background: #3071f2; }
      &.type-ppt { background: #ff9800; }
      &.type-img { background: #4caf50; }
      &.type-video { background: #651fff; }
      &.type-excel { background: #00e676; }
      &.type-unknown { background: #b0bec5; }
    }
    
    .file-name {
      font-size: 13px;
      color: #17181a;
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
  color: #5c5f66;
  line-height: 24px;
  text-align: justify;
}

/* 底部输入区 (大卡片样式) */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background: transparent;
  z-index: 100;
  
  .input-card {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    position: relative;
    min-height: 100px;
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
    }
  }
  
  .safe-area-bottom {
    height: env(safe-area-inset-bottom);
  }
}
</style>
