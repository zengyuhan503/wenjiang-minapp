<template>
  <view class="page-body">
    <div class="tabs">
      <scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120" v-if="isEdit">
        <div
          class="tab-item"
          :class="{ active: edit_id == item.id }"
          v-for="item in company_list"
          @click="checkoutCompany(item.id)"
          :key="item.id"
        >
          {{ item.name }}
        </div>
      </scroll-view>
    </div>
    <div class="item">
      <div class="page-head">
        <div class="title">
          <image
            src="https://louyu.zdocd.com/wxapp/static/image/menu.webp"
            mode="widthFix"
            alt=""
          />
          <text>企业基本信息</text>
        </div>
        <uni-icons v-if="isEdit" type="trash" size="20" @click="onDelete"></uni-icons>
      </div>
      <div class="formState">
        <div class="formItem">
          <div class="label">
            企业名称
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.name"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
            </uni-easyinput>
          </div>
        </div>
        <div class="formItem">
          <div class="label">
            所属行业
            <text> * </text>
          </div>
          <div class="input-box">
            <picker
              @change="bindCinpanyPickerChange"
              :value="cateindex"
              header-text="所属行业"
              :range="industrys"
              :range-key="'company_name'"
            >
              <div class="formValue">
                <template v-if="formState.industry == ''">
                  <text>请选择</text>
                  <image
                    src="https://louyu.zdocd.com/wxapp/static/image/right.png"
                    mode="widthFix"
                    alt=""
                  />
                </template>
                <template v-else>
                  <text style="color: #000">{{ formState.industry }}</text>
                </template>
              </div>
            </picker>
          </div>
        </div>

        <div class="formItem">
          <div class="label">注册资本</div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.register_money"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
              <template #right>
                <view style="font-size: 14px">万元</view>
              </template>
            </uni-easyinput>
          </div>
        </div>

        <div class="formItem">
          <div class="label">法人姓名</div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.fzr_name"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
            </uni-easyinput>
          </div>
        </div>
        <div class="formItem">
          <div class="label">联系电话</div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.fzr_mobile"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
            </uni-easyinput>
          </div>
        </div>
        <div class="formItem">
          <div class="label">社会信用代码</div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.company_no"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
            </uni-easyinput>
          </div>
        </div>

        <div class="formItem">
          <div class="label">成立日期</div>
          <div class="input-box">
            <picker
              mode="date"
              @change="bindDateChange"
              :value="register_date_index"
              header-text="成立日期"
            >
              <div class="formValue">
                <template v-if="formState.register_date == ''">
                  <text>请选择</text>
                  <image
                    src="https://louyu.zdocd.com/wxapp/static/image/right.png"
                    mode="widthFix"
                    alt=""
                  />
                </template>
                <template v-else>
                  <text style="color: #000">{{ formState.register_date }}</text>
                </template>
              </div>
            </picker>
          </div>
        </div>

        <div class="formItem">
          <div class="label">
            注册地址
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.address"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
            </uni-easyinput>
          </div>
        </div>

        <div class="formItem">
          <div class="label">
            办公地址
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-easyinput
              v-model="formState.office_address"
              placeholderStyle="font-size: 14px;"
              placeholder="请填写"
              :inputBorder="false"
              :clearable="false"
            >
            </uni-easyinput>
          </div>
        </div>

        <div class="formItem">
          <div class="label">人员规模</div>
          <div class="input-box">
            <picker
              @change="bindStaffSizePickerChange"
              :value="staff_size_index"
              header-text="人员规模"
              :range="staffArray"
            >
              <div class="formValue">
                <template v-if="formState.staff_size == null">
                  <text>请选择</text>
                  <image
                    src="https://louyu.zdocd.com/wxapp/static/image/right.png"
                    mode="widthFix"
                    alt=""
                  />
                </template>
                <template v-else>
                  <text style="color: #000">{{ formState.staff_size }}</text>
                </template>
              </div>
            </picker>
          </div>
        </div>

        <div class="formItem">
          <div class="label">入驻日期</div>
          <div class="input-box">
            <picker
              mode="date"
              @change="bindJoinDateChange"
              :value="join_date_index"
              header-text="入驻日期"
            >
              <div class="formValue">
                <template v-if="formState.join_date == null">
                  <text>请选择</text>
                  <image
                    src="https://louyu.zdocd.com/wxapp/static/image/right.png"
                    mode="widthFix"
                    alt=""
                  />
                </template>
                <template v-else>
                  <text style="color: #000">{{ formState.join_date }}</text>
                </template>
              </div>
            </picker>
          </div>
        </div>
        <div class="formItem">
          <div class="label">是否显示</div>
          <div class="input-box">
            <switch checked @change="onShowChange" />
          </div>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="page-head">
        <div class="title">
          <image
            src="https://louyu.zdocd.com/wxapp/static/image/louyu-icon.webp"
            mode="widthFix"
            alt=""
          />
          <text>企业楼宇信息</text>
        </div>
      </div>
      <div class="formState">
        <div class="formItem vertical" v-if="buildings.length > 0">
          <div class="label">
            所属楼栋
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-data-checkbox
              @change="onBuildOrUnitChange"
              v-model="formState.build_id"
              :localdata="buildings"
            ></uni-data-checkbox>
          </div>
        </div>
        <div class="formItem vertical" v-if="units.length > 0">
          <div class="label">
            所属单元
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-data-checkbox
              @change="onBuildOrUnitChange"
              v-model="formState.unit_id"
              :localdata="units"
            ></uni-data-checkbox>
          </div>
        </div>

        <div class="formItem vertical">
          <div class="label">
            企业所在楼层
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-data-checkbox
              @change="getRoomList"
              class="checkbox1"
              multiple
              v-model="formState.floor_ids"
              :localdata="floors"
            ></uni-data-checkbox>
          </div>
        </div>

        <div class="formItem vertical">
          <div class="label">
            企业所在房间
            <text> * </text>
          </div>
          <div class="input-box">
            <uni-data-checkbox
              class="checkbox1"
              @change="onRoomChange"
              multiple
              v-model="formState.room_ids"
              :localdata="rooms"
            ></uni-data-checkbox>
          </div>
        </div>
        <div class="formItem vertical">
          <div class="label">
            企业所在房间
            <text> * </text>
          </div>
          <div class="input-box">
            <div class="items">
              <div class="item" v-for="item in area_list" :key="item.value">
                <uni-easyinput
                  :clearable="false"
                  :inputBorder="false"
                  v-model="item.area"
                  placeholderStyle="font-size: 14px;"
                  placeholder="请填写"
                >
                  <template #left>
                    <view class="orther">{{ item.text }}</view>
                  </template>
                  <template #right>
                    <view class="orther"> ㎡</view>
                  </template>
                </uni-easyinput>
                <view class="delete">
                  <image
                    @click="onDeleteArea(item)"
                    src="https://louyu.zdocd.com/wxapp/static/image/delete_icon.webp"
                    mode="widthFix"
                    alt=""
                  ></image>
                </view>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="countus">
      <div class="btn" @click="onSubmit">提交</div>
    </div>
    <SubmitResultDialog ref="submitResultDialogRef" />
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { company } from "/utlis/https";
import SubmitResultDialog from "@/components/SubmitResultDialog.vue";
const submitResultDialogRef = ref(null);
const isEdit = ref(false);
const industrys = ref([]);
const house_id = ref(null);
const staff_size_index = ref(0);
const register_date_index = ref(0);
const join_date_index = ref(0);
const cateindex = ref(0);
const formState = ref({
  name: "",
  industry: "",
  register_money: "",
  fzr_name: "",
  fzr_mobile: "",
  company_no: "",
  register_date: "",
  address: "",
  office_address: "",
  join_date: null,
  build_id: null,
  staff_size: null,
  unit_id: null,
  status: 1,
  floor_ids: [],
  room_ids: [],
});
const buildings = ref([]);
const units = ref([]);
const floors = ref([]);
const rooms = ref([]);
const area_list = ref([]);
const staffArray = ref([
  "小于10人",
  "10-50人",
  "50-100人",
  "100-500人",
  "500-1000人",
  "大于1000人",
]);
const bindCinpanyPickerChange = (e) => {
  formState.value.industry = industrys.value[e.detail.value].company_name;
};
const bindStaffSizePickerChange = (e) => {
  formState.value.staff_size = staffArray.value[e.detail.value];
};
const bindJoinDateChange = (e) => {
  formState.value.join_date = e.detail.value;
};
const bindDateChange = (e) => {
  formState.value.register_date = e.detail.value;
};
const onShowChange = (e) => {
  console.log(e.detail.value);
  formState.value.status = e.detail.value ? 1 : 0;
};
const getIndustrys = () => {
  company.industrys().then((res) => {
    if (res.code == 200) {
      industrys.value = res.data;
    }
  });
};
const onBuildOrUnitChange = (e) => {
  getFloorList();
};
const getRoomList = (type) => {
  let floor_ids = formState.value.floor_ids;
  let room_list = floor_ids.map((item) => {
    let floor = floors.value.filter((foor) => {
      return foor.value == item;
    });
    if (floor.length == 0) {
      return [];
    }
    let list = floor.map((item) => {
      return item.rooms.map((room) => {
        return {
          text: room.text,
          value: room.value,
        };
      });
    });
    return list.flat();
  });
  rooms.value = room_list.flat();
  if (type == "init") {
    let room_ids = formState.value.room_ids;
    console.log("room_ids", room_ids);
    let list = room_ids.map((item) => {
      let room = rooms.value.filter((rom) => {
        return rom.value == item;
      });
      return room;
    });
    console.log("list", list);
    area_list.value = list.flat();
    console.log("area_list", area_list.value);
    area_list.value.forEach((item2) => {
      const match = company_active.area_list.find((item1) => {
        console.log(item1, item2);
        return item1.id == item2.value;
      });
      if (match) {
        item2.area = match.area;
      }
    });
  }
};
const onRoomChange = (e) => {
  let room = e.detail.data;
  area_list.value = room;
};
const getFloorList = (type) => {
  let params = {
    house_id: house_id.value,
    build_id: formState.value.build_id || 0,
    unit_id: formState.value.unit_id || 0,
  };
  floors.value = [];
  rooms.value = [];
  area_list.value = [];
  if (type != "init") {
    formState.value.floor_ids = [];
    formState.value.room_ids = [];
  }
  company.floorList(params).then((res) => {
    if (res.code == 200) {
      floors.value = res.data.map((item) => {
        const prefix = [item.build_name, item.unit_name, item.name]
          .filter(Boolean)
          .join("-");

        return {
          text: prefix,
          value: item.id + "",
          rooms: item.room_list.map((room) => {
            const roomText = [item.build_name, item.unit_name, item.name, room.name]
              .filter(Boolean)
              .join("-");
            return {
              text: roomText,
              value: room.id + "",
            };
          }),
        };
      });
      if (type == "init") {
        getRoomList("init");
      }
    }
  });
};
const getBuildList = () => {
  company.buildList({ house_id: house_id.value }).then((res) => {
    if (res.code == 200) {
      buildings.value = res.data.build_list.map((item) => {
        return {
          text: item.name,
          value: item.id,
        };
      });
      units.value = res.data.unit_list.map((item) => {
        return {
          text: item.name,
          value: item.id,
        };
      });
    }
  });
};
const onSubmit = () => {
  let params = {
    ...formState.value,
    floor_ids: formState.value.floor_ids,
    room_ids: formState.value.room_ids,
    area_list: area_list.value.map((item) => {
      return {
        id: item.value,
        area: item.area,
      };
    }),
    house_id: house_id.value,
  };
  for (const key in params) {
    if (params[key] == null) {
      delete params[key];
    }
  }
  if (
    params.name == "" ||
    params.industry == "" ||
    params.address == "" ||
    params.office_address == "" ||
    params.build_id == null ||
    params.unit_id == null ||
    params.floor_ids.length == 0 ||
    params.room_ids.length == 0 ||
    params.area_list.length == 0
  ) {
    submitResultDialogRef.value.showSubmitFail("请填写完整信息");
    return;
  }

  if (isEdit.value) {
    params.id = formState.value.id;
    company.edit(formState.value.id, params).then((res) => {
      if (res.code == 200) {
        submitResultDialogRef.value.showSubmitSuccess("企业修改成功", 1000, () => {
          uni.navigateBack();
        });
      } else {
        submitResultDialogRef.value.showSubmitFail(res.message);
      }
    });
  } else {
    company.add(params).then((res) => {
      if (res.code == 200) {
        submitResultDialogRef.value.showSubmitSuccess("企业添加成功", 1000, () => {
          uni.navigateBack();
        });
      } else {
        submitResultDialogRef.value.showSubmitFail(res.message);
      }
    });
  }
};
const onDeleteArea = (item) => {
  console.log(area_list.value);
  let text = item.text; // 示例：'2栋-1单元-14楼-102'
  let texts = text.split("-");
  let build_id = texts[0]; // '2栋'
  let unit_id = texts[1]; // '1单元'
  let floor_id = texts.slice(0, 3).join("-"); // '2栋-1单元-14楼'
  let room_id = item.value; // 比如 '2栋-1单元-14楼-102'

  // 删除房间
  area_list.value = area_list.value.filter((item) => {
    return item.value != room_id;
  });
  formState.value.room_ids = formState.value.room_ids.filter((id) => id !== room_id);

  // 剩余房间中，与该楼层相同的有哪些
  const remainingRoomsOnThisFloor = formState.value.room_ids.filter((id) => {
    return id.startsWith(floor_id + "-");
  });

  // 所有剩余房间所在的楼层
  const remainingFloors = formState.value.room_ids.map((id) =>
    id.split("-").slice(0, 3).join("-")
  );
  const uniqueFloors = Array.from(new Set(remainingFloors));

  // 情况一：该楼层还有其他房间，不删楼层
  if (remainingRoomsOnThisFloor.length > 0) {
    return;
  }

  // 情况二和三：楼层没有房间，删掉楼层
  formState.value.floor_ids = formState.value.floor_ids.filter((id) => id !== floor_id);

  // 情况二补充：如果房间都删完了，清空所有内容
  const noRoomsLeft = formState.value.room_ids.length === 0;

  if (noRoomsLeft) {
    formState.value.floor_ids = [];
    formState.value.build_id = null;
    formState.value.unit_id = null;
  }
};

const onDelete = () => {
  uni.showModal({
    title: "提示",
    content: "你确定要删除这个企业吗？",
    success: (res) => {
      if (res.confirm) {
        onDeleteCompany();
      }
    },
  });
};
const onDeleteCompany = () => {
  company.deleted(formState.value.id).then((res) => {
    if (res.code == 200) {
      submitResultDialogRef.value.showSubmitSuccess("删除成功", 1000, () => {
        uni.navigateBack();
      });
    } else {
      submitResultDialogRef.value.showSubmitFail(res.message);
    }
  });
};
const company_list = ref([]);
const edit_id = ref(null);
let company_query = null;
let company_active = null;
const checkoutCompany = (id) => {
  edit_id.value = id;
  let company = company_list.value.find((item) => {
    return item.id == id;
  });
  company_active = company;
  let room_ids = company.room_ids.split(",");
  let floor_ids = company.floor_ids.split(",");
  formState.value = {
    ...formState.value,
    ...company,
  };
  formState.value.room_ids = room_ids;
  formState.value.floor_ids = floor_ids;
  console.log("formState", formState.value);
  getFloorList("init");
};
onLoad((options) => {
  house_id.value = options.house_id;
  isEdit.value = options.type == "edit" ? true : false;
  if (isEdit.value) {
    let query = uni.getStorageSync("edit_company");
    company_query = query;
    company_list.value = query.company_list;
    if (company_list.value.length > 0) {
      edit_id.value = company_list.value[0].id;
      checkoutCompany(edit_id.value);
    }
  }
});
onShow(() => {
  getIndustrys();
  getBuildList();
});
</script>

<style lang="less" scoped>
.page-head {
  height: 44px;
  background: #f2f5fa;
  border-radius: 0px 0px 0px 0px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    image {
      width: 18px;
      height: 18px;
      margin-right: 10px;
    }
    text {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 15px;
      color: #3071f2;
      line-height: 20px;
    }
  }
}
.tabs {
  padding: 0 4px;
  .scroll-view_H {
    height: 48px;
    background: #ffffff;
    border-radius: 0px 0px 0px 0px;
    white-space: nowrap;
  }
  .tab-item {
    padding: 0 12px;
    min-width: 100px;
    height: 48px;
    font-size: 15px;
    text-align: center;
    line-height: 48px;
    display: inline-block;
    box-sizing: border-box;
    width: auto;
    &.active {
      color: rgba(48, 113, 242, 1);
      border-bottom: 2px solid rgba(48, 113, 242, 1);
    }
  }
}
.formState {
  .formItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 55px;
    border-bottom: 1px solid rgba(225, 229, 234, 1);
    padding: 0 16px;

    &.vertical {
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      padding-top: 10px;
      padding-bottom: 10px;
      height: auto;
      .label {
        padding: 8px 0;
      }
      .input-box {
        width: 100% !important;
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .delete {
            margin-left: 10px;
            width: 20px;
            image {
              width: 18px;
            }
          }
        }
      }
    }
  }
  .label {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 15px;
    color: #303233;
    line-height: 20px;
    text-align: left;
    width: 130px;
    text {
      color: rgba(246, 70, 70, 1);
    }
  }
  .formValue {
    height: 55px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    text {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #a1a7b2;
      line-height: 20px;
      margin-right: 5px;
    }
    image {
      width: 14px;
      height: 14px;
    }
  }
}

.countus {
  height: 90px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
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
<style lang="less">
.input-box {
  width: calc(100% - 130px);
  text-align: right;
  input {
    text-align: right;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px !important;
  }
  .items {
    margin-top: 8px;
    .item {
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
      .uni-easyinput {
        .uni-easyinput__content {
          padding: 0 13px;
          height: 44px;
          background-color: rgba(243, 245, 250, 1) !important;
          border-radius: 8px 8px 8px 8px;
        }
      }
      .orther {
        font-weight: 400;
        font-size: 14px;
        color: #17181a;
      }
      input {
        font-weight: 600 !important;
        color: #17181a !important;
      }
    }
  }
}
.uni-easyinput__content {
  view {
    width: auto;
  }
}
.input-box .uni-data-checklist .checklist-group .checklist-box {
  height: 32px;
  .checklist-text {
    font-weight: 400;
    font-size: 14px !important;
    color: #17181a !important;
  }
}
.checkbox1 .uni-data-checklist .checklist-group {
  justify-content: space-between;
}
</style>
