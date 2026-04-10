<template>
	<view class="page-body">
		<CustomNavbar ref="customNavBarRef"  @changeOutModel="changeOutModel">
			<template #back>
				<template v-if="isLogin">
					<view class="back-icons">
						<view class="back-icon-boxs" @click="goToOut">
							<image src="https://louyu.zdocd.com/wxapp/static/image/out.webp" mode="widthFix"  />
						</view>
						<view class="back-icon-boxs" @click="toSetting">
							<image  src="/static/image/setting.png"  mode="widthFix"  />
						</view>
						<view class="back-icon-boxs" v-if="userInfo.type === 3" @click="toCompany">
							<image  src="/static/image/brand.png"  mode="widthFix"  />
						</view>
					</view>
				</template>
				<template v-else>
					<view class="back-icons">
						<image style="width: 32px; height: 32px" src="https://louyu.zdocd.com/wxapp/static/image/user.png"
							mode="widthFix" class="back-icon" />
					</view>
				</template>
			</template>
		</CustomNavbar>
		<view class="page-head">
			<image src="https://louyu.zdocd.com/wxapp/static/image/home-back.webp" mode="widthFix"></image>
			<view class="page-head-text" :style="{ paddingTop: statusBarHeight + 'px' }">
				<view class="" style="margin-bottom: 10px;font-size: 24px;font-weight: bold;">
					温小楼
				</view>
				<view class="" style="font-size: 17px;font-weight: 600;">
					温江区商务楼宇服务平台
				</view>
			</view>
		</view>
		<view class="page-main">
			<view class="page-content">
				<view class="page-item">
					<view class="data-items">
						<view class="data-item">
							<view class="number">
								<text class="count">{{ homeStatistic.total_area }}</text>
								<text class="unit">㎡</text>
							</view>
							<view class="title">
								<image src="https://louyu.zdocd.com/wxapp/static/image/data-icon.webp" mode="widthFix">
								</image>
								<text>总面积</text>
							</view>
						</view>
						<view class="data-item">
							<view class="number">
								<text class="count">{{ homeStatistic.occupancy_rate }}</text>
								<text class="point">%</text>
							</view>
							<view class="title">
								<image src="https://louyu.zdocd.com/wxapp/static/image/data-icon2.webp" mode="widthFix">
								</image>
								<text>入驻率</text>
							</view>
						</view>

						<view class="data-item">
							<view class="number">
								<text class="count">{{ homeStatistic.occupancy_area }}</text>
								<text class="unit">㎡</text>
							</view>
							<view class="title">
								<image src="https://louyu.zdocd.com/wxapp/static/image/data-icon3.webp" mode="widthFix">
								</image>
								<text>已入驻面积</text>
							</view>
						</view>

						<view class="data-item" @click="toLouyuList">
							<view class="number">
								<text class="count">{{ homeStatistic.total_house }}</text>
								<text class="point">栋</text>
							</view>
							<view class="title hasLink">
								<view>
									<image src="https://louyu.zdocd.com/wxapp/static/image/data-icon4.webp"
										mode="widthFix">
									</image>
									<text>楼宇总数</text>
								</view>
								<view class="link">
									详情
									<image src="https://louyu.zdocd.com/wxapp/static/image/right.png" mode="widthFix">
									</image>
								</view>
							</view>
						</view>
					</view>
				</view>
				<div class="page-item page-item1">
					<div class="charts-box">
						<RingCharts :wj_occupancy_rate="homeStatistic.wj_occupancy_rate"
							:occupancy_rate="homeStatistic.occupancy_rate" :company_num="homeStatistic.company_num"
							v-show="showCanvas" />
					</div>
					<div class="charts-data">
						<div class="items">
							<div class="item">
								<div class="title">入驻企业</div>
								<view class="number">
									<text class="count">{{ homeStatistic.company_num }}</text>
									<text class="unit">家</text>
								</view>
							</div>

							<div class="item" style="margin: 8px 0">
								<div class="title title1">入驻率</div>
								<view class="number">
									<text class="count">{{ homeStatistic.occupancy_rate }}</text>
									<text class="unit">%</text>
								</view>
							</div>
							<div class="item">
								<div class="title title2">在温注册率</div>
								<view class="number">
									<text class="count">{{ homeStatistic.wj_occupancy_rate }}</text>
									<text class="unit">%</text>
								</view>
							</div>
						</div>
					</div>
				</div>
				<view class="page-item page-item2">
					<view class="page-title">
						<text>招租信息</text>
					</view>
					<view class="items">
						<view class="item" @click="toLouyuInfo(item.id)" v-for="(item, index) in rentalList"
							:key="index">
							<view class="cover">
								<image :src="item.house.image" mode="aspectFill"></image>
							</view>
							<view class="content">
								<div>
									<view class="title"> {{ item.house.name }} </view>
									<view class="desc"> {{ item.desc }} </view>
								</div>
								<view class="time">
									<text> {{ item.created_at_text }} 发布</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="page-item page-item3">
					<view class="page-title">
						<view>最新资讯</view>
						<view @click="toNewsList">更多
							<image src="https://louyu.zdocd.com/wxapp/static/image/right.png" mode="widthFix"></image>
						</view>
					</view>
					<view class="items">
						<view class="item" v-for="(item, index) in articleList" :key="index"
							@click="toNewDetail(item.id)">
							<view class="title">
								<image width="38px" :src="item.tag_image" mode="widthFix" v-if="item.tag_image"></image>
								<text>{{ item.title }}</text>
							</view>
							<view class="desc">
								{{ item.desc }}
							</view>
							<view class="time">
								<text>{{ item.created_at_text }} 发布</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	onMounted
} from "vue";
import CustomNavbar from "@/components/customNavbar.vue";
import RingCharts from "@/components/ringCharts.vue";
import {
	onShow
} from "@dcloudio/uni-app";
import {
	statistic,
	article,
	rental,
	user,
	global
} from "/utlis/https";
import moment from "moment";
const isLogin = ref(false);
const customNavBarRef = ref(null);
const isToLogin = ref(false);
const showCanvas = ref(true);
const statusBarHeight = ref(20);
const userInfo = ref({}); // 保存用户信息
const goToOut = () => {
	showCanvas.value = false;
	if (isLogin.value) {
		customNavBarRef.value.showOutModel();
	} else {
		uni.reLaunch({
			url: "/package/login/login",
		});
	}
};
const homeStatistic = ref({
	total_area: 0, // 总面积
	occupancy_rate: 0, // 入驻率
	occupancy_area: 0, // 入驻面积
	total_house: 0, // 楼宇总数
	company_num: 0, // 入驻企业数量
	wj_occupancy_rate: 0, // 在温注册率
});
const articleList = ref([]);
const rentalList = ref([]);
const changeOutModel = () => {
	console.log("退出登录");
	showCanvas.value = true;
};
const toLouyuList = () => {
	console.log("跳转");
	uni.setStorageSync("showCompanys", JSON.stringify([]));
	wx.switchTab({
		url: "/pages/louyu/list",
	});
};
const toLouyuInfo = (id) => {
	console.log("跳转");
	wx.navigateTo({
		url: `/package/lease/detail?id=${id}`,
	});
};
const toNewDetail = (id) => {
	wx.navigateTo({
		url: `/package/news/detail?id=${id}`,
	});
};
const toNewsList = () => {
	console.log("跳转");
	wx.navigateTo({
		url: "/package/news/index",
	});
};
const toSetting = () => {
	uni.navigateTo({
		url: "/package/user/setting",
	});
};
const toCompany = () => {
	uni.navigateTo({
		url: "/package/company/index",
	});
};

const getHomeStatistic = () => {
	statistic.home().then((res) => {
		console.log(res);
		let data = res.data;
		homeStatistic.value = {
			...homeStatistic.value,
			...data,
		};
	});
};
const getArticleList = () => {
	article.list().then((res) => {
		articleList.value = res.data.list;
	});
};
const getRentalList = () => {
	let params = {
		page: 1,
		page_size: 3,
		house_id: 0,
	};
	rental.list(params).then((res) => {
		console.log(res.code)
		if (res.code != 200) {
			return;
		}
		rentalList.value = res.data.list.map((item) => {
			let created_time = moment(item.created_at).format("YYYY-MM-DD");
			item.created_time = created_time;
			return item;
		});
	});
};
const refreshToken = () => {
	if (isLogin.value) {
		user
			.refresh()
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				isLogin.value = uni.getStorageSync("isLogin") || false;
			});
	}
};
const getGlobalConfig = () => {
	global.config().then((res) => {
		console.log(res);
		let data = res.data;
		isToLogin.value = data.status == 1 ? true : false;
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

onShow(() => {
	getHomeStatistic();
	getArticleList();
	getRentalList();
	isLogin.value = uni.getStorageSync("isLogin") || false;
	refreshToken();
	getGlobalConfig();
	getUserData(); // 获取用户信息，用于判断显示企业图标
	const sys = uni.getSystemInfoSync()
	statusBarHeight.value = sys.statusBarHeight;
	statusBarHeight.value = sys.statusBarHeight + 44 + 14;

});
</script>

<style lang="less">
.charts-data {
	width: calc(100% - 150px);

	.item {
		width: 190px;
		height: 44px;
		background: #f8faff;
		border-radius: 6px 6px 6px 6px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
		box-sizing: border-box;
		padding-left: 26px;

		.title {
			font-family: PingFang SC, PingFang SC;
			font-weight: 400;
			font-size: 14px;
			color: #17181a;
			position: relative;

			&::before {
				content: "";
				width: 8px;
				height: 8px;
				background: #d1deff;
				border-radius: 50%;
				position: absolute;
				top: 50%;
				left: -13px;
				transform: translateY(-50%);
			}

			&.title1::before {
				background: rgba(83, 140, 255, 1);
			}

			&.title2::before {
				background: rgba(40, 216, 195, 1);
			}
		}

		.number {
			color: #17181a;
			font-size: 16px;
			text-align: right;

			text.point {
				color: #8a8f99;
				font-size: 14px;
			}

			text.unit {
				color: #8a8f99;
				font-size: 14px;
			}
		}
	}
}

.charts-box {
	width: 150px;
	position: relative;
	z-index: 1;
	height: 150px;
}

.page-body {
	width: 100%;
	height: 100%;
	background: #f3f5fa;
}

.back-icons{
	display:flex;
	gap: 8px;
	align-items: center;
	width:200px;
	padding-left: 12px;
}
.back-icon-boxs{
	width: 32px;
	height: 32px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 16px 16px 16px 16px;
	display:flex;
	justify-content: center;
	align-items: center;
}
.back-icon {
	width: 18px;
}
.back-icon-boxs image{
	width: 18px;
}

.page-head {
	width: 100%;
	position: relative;

	image {
		width: 100%;
	}

	.logout {
		width: 18px;
		position: absolute;
		top: 0;
		left: 0;
	}

	.page-head-text {
		position: absolute;
		left: 0;
		top: 0;
		padding-left: 20px;
		width: 100%;
		height: 100%;

		view {
			height: 30px;
			font-family: Douyin Sans, Douyin Sans;
			color: #ffffff;
			line-height: 30px;
			letter-spacing: 1px;
			text-align: left;
		}
	}
}

.page-content {
	position: relative;
	top: -90px;
	padding: 0 9px;

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

	.page-item {
		background: #ffffff;
		border-radius: 10px 10px 10px 10px;
		padding: 10px;

		.data-items {
			display: grid;
			gap: 9px;
			grid-template-columns: repeat(2, 1fr);
		}

		.data-item {
			background: #f8faff;
			border-radius: 8px 8px 8px 8px;
			padding: 20px;
			box-sizing: border-box;

			.number {
				color: #17181a;
				font-size: 21px;
				font-weight: bold;

				text.count {
					font-weight: 600;
				}

				text.point {
					color: #8a8f99;
					margin-left: 2px;
					font-size: 14px;
				}

				text.unit {
					color: #8a8f99;
					font-size: 14px;
				}
			}

			.title {
				margin-top: 10px;
				display: flex;
				justify-content: flex-start;
				align-items: center;

				image {
					width: 14px;
					height: 14px;
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

				&.hasLink {
					display: flex;
					justify-content: space-between;
					align-items: center;

					&>view {
						display: flex;
						justify-content: flex-start;
						align-items: center;
					}

					.link {
						font-family: PingFang SC, PingFang SC;
						font-weight: 400;
						font-size: 12px;
						color: #8a8f99;
						display: flex;
						justify-content: flex-end;
						align-items: center;
						width: 75px;

						image {
							margin-left: 2px;
							width: 12px;
							position: relative;
							top: 1px;
						}
					}
				}
			}
		}
	}

	.page-item1 {
		margin-top: 10px;
		background: #ffffff;
		border-radius: 10px 10px 10px 10px;
		padding: 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.page-item2 {
		margin-top: 10px;
		background: #ffffff;
		padding: 0 11px;
		padding-bottom: 16px;

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
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
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

	.page-item3 {
		margin-top: 10px;
		background: #ffffff;
		padding: 0 11px;
		padding-bottom: 10px;

		.items {
			.item {
				margin-bottom: 10px;
				padding: 10px;
				background: #f8faff;
				border-radius: 8px 8px 8px 8px;

				.title {
					display: flex;
					justify-content: flex-start;
					align-items: center;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;

					image {
						width: 38px;
						height: 38px;
						margin-right: 8px;
					}

					text {
						font-family: PingFang SC, PingFang SC;
						font-weight: 600;
						font-size: 15px;
						color: #17181a;
						line-height: 20px;
						text-align: left;
						width: 100%;
						overflow: hidden;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}

				.desc {
					font-family: PingFang SC, PingFang SC;
					font-weight: 400;
					font-size: 13px;
					color: #5c5f66;
					line-height: 22px;
					text-align: left;
					display: -webkit-box;
					overflow: hidden;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					margin-top: 7px;
					margin-bottom: 5px;
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
</style>
