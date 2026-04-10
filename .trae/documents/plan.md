# 项目优化与重构计划 (Project Optimization Plan)

## 摘要 (Summary)
本次计划针对当前 `wenjiang-minapp` 项目进行全面排查与优化，涵盖：清理冗余模拟数据、补充缺失的图片上传接口交互、确认本地图片资源完整性、主包页面瘦身（分包处理）、以及提取重复的弹窗代码为公共组件。

## 1. 删除模拟数据 (Remove Mock Data)
排查发现多处为展示 UI 而遗留的假数据或错误捕获中的模拟成功逻辑，需要将其彻底删除：
*   **`pages/policy/ai.vue`**: 删除 `addMockData` 方法以及在请求失败或列表为空时强行填充测试数据的逻辑，让界面直接展示真实的空状态。
*   **`pages/supply/detail.vue`**: 移除无意义的 `<!-- 模拟抵扣券数据 -->` HTML 注释（确认该部分实际已对接接口数据 `detail.coupon_list`）。
*   **`pages/supply/my.vue`**: 删除 `addMockData` 及其在接口返回空列表时 `// 添加模拟测试数据以展示 UI` 的相关赋值逻辑。
*   **`pages/user/password.vue`** & **`pages/company/coupon-desc.vue`**: 删除在 `catch` 代码块中“模拟成功以便展示UI”的强行成功提示和弹窗展示，接口失败应如实抛出错误。
*   **`pages/user/setting.vue`**: 移除在获取用户信息失败时，强制给 `phone.value` 赋值 `"15000006248"` 的假数据逻辑。

## 2. 补充缺失的接口对接 (Implement Missing APIs)
*   **问题描述**: 在发布供需 (`publish.vue`) 和留言 (`message.vue`) 页面中，用户选择图片 (`uni.chooseImage`) 后，代码直接将本地临时路径 (`res.tempFilePaths`) 存入表单发送给后端，导致后端接收到无效的本地协议路径。
*   **解决细节**:
    *   在 `utlis/https.js` 中已存在 `upload.image` 接口封装。
    *   需要在这些页面的 `chooseImage` 回调中，调用 `upload.image(path)` 将图片上传至服务器，获取真实的远端图片 URL 后，再 push 到表单的 `images` 数组中。

## 3. 检查缺失图片 (Check Missing Images)
*   **检查结果**: 已通过脚本全局深度扫描所有 `.vue` 文件中涉及 `static/` 目录的图片引用路径。
*   **结论**: 经与本地 `static` 目录比对，**所有代码中引用的本地图片均真实存在**，未发现“创建了但未提供实体文件”的遗漏图片。

## 4. 页面分包处理 (Sub-packaging)
当前所有非 TabBar 页面全部堆积在主包的 `pages/` 目录下，为减少主包体积，将多余页面移入 `package/`（子包）。
*   **新建包结构**: 在 `package/` 下新建 `supply`, `policy`, `user`, `company` 文件夹。
*   **移动文件列表**:
    *   `pages/supply/detail.vue` -> `package/supply/detail.vue`
    *   `pages/supply/message.vue` -> `package/supply/message.vue`
    *   `pages/supply/my.vue` -> `package/supply/my.vue`
    *   `pages/supply/my-detail.vue` -> `package/supply/my-detail.vue`
    *   `pages/supply/publish.vue` -> `package/supply/publish.vue`
    *   `pages/policy/ai.vue` -> `package/policy/ai.vue`
    *   `pages/user/setting.vue` -> `package/user/setting.vue`
    *   `pages/user/password.vue` -> `package/user/password.vue`
    *   `pages/company/index.vue` -> `package/company/index.vue`
    *   `pages/company/coupon-desc.vue` -> `package/company/coupon-desc.vue`
    *   `pages/company/coupon-list.vue` -> `package/company/coupon-list.vue`
*   **配置更新**:
    *   修改 `pages.json`，将上述页面从 `pages` 数组中剔除，并按照原有的标题/样式配置添加到 `subPackages` 中。
*   **路由更新**:
    *   全局搜索并替换代码中原有的跳转路径（例如将 `uni.navigateTo({ url: '/pages/supply/detail' })` 修改为 `/package/supply/detail` 等）。

## 5. 公共组件提取优化 (Extract Common Components)
*   **问题描述**: 排查发现 `pages/supply/publish.vue`, `pages/supply/message.vue` 和 `pages/user/password.vue` 均复制粘贴了同一套带遮罩的“成功弹窗” HTML 结构（`<view class="success-modal">...`）以及相关样式。
*   **解决细节**:
    *   在 `components/` 目录下新建 `successModal.vue` 公共组件。
    *   支持接收 `title`（标题）、`desc`（描述文本，支持 HTML 换行）作为 Props，暴露 `@close` 事件。
    *   替换上述三个页面中臃肿的内联弹窗代码，实现统一维护。

## 假设与决策 (Assumptions & Decisions)
1. 默认 `utlis/https.js` 中的 `upload.image` 能够正常返回带有正确 URL 字段的 JSON，并在前端直接使用。
2. 主包中将仅保留 `home/index`, `louyu/list`, `supply/index`, `policy/index` 四个 TabBar 页面，保证主包极致精简。

## 验证步骤 (Verification Steps)
1. 运行项目查看各项业务页面能否正常访问（验证分包路由）。
2. 去除模拟数据后，查看对应页面（如“我的供需”）是否正常展示空状态UI或真实的错误 Toast。
3. 测试选择图片功能，确认网络面板发起了上传图片请求，并获取到了正确网络路径。
4. 测试弹窗触发场景（如提交表单、修改密码），确认公共组件 `successModal` 表现正常且样式无偏差。