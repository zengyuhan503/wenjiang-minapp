<template>
  <view>
    <Echart width="150px" height="150px" ref="echartRef" @ready="initEchart" />
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import Echart from "/common/e-chart/components/e-chart/e-chart"; // 导入echart组件
let props = defineProps({
  occupancy_rate: {
    type: Number,
    default: 0,
  },
  wj_occupancy_rate: {
    type: Number,
    default: 0,
  },
  company_num: {
    type: Number,
    default: 0,
  },
});

// echart组件的ref
const echartRef = ref(null);

// 支持echarts所有图表,您只需替换此处option即可展示任意图表
// const option = ref({}) // 不必声明为响应式对象,普通对象即可
const option = {
  tooltip: {
    show: false,
  },
  legend: {
    show: false,
  },
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["60%", "75%"], // 外圈
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        {
          value: 100 - props.occupancy_rate,
          name: "Direct",
          itemStyle: {
            color: "rgba(237, 242, 255, 1)",
          },
        },
        {
          value: props.occupancy_rate,
          name: "Search Engine",
          itemStyle: {
            color: "rgba(83, 140, 255, 1)",
          },
        },
      ],
    },
    {
      name: "Access From",
      type: "pie",
      radius: ["38%", "53%"], // 内圈
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        {
          value: 100 - props.wj_occupancy_rate,
          name: "Direct",
          itemStyle: {
            color: "rgba(237, 242, 255, 1)",
          },
        },
        {
          value: props.wj_occupancy_rate,
          name: "Search Engine",
          itemStyle: {
            color: "rgba(40, 216, 195, 1)",
          },
        },
      ],
    },
  ],
};

// 组件挂载后初始化echarts实例 (也可在请求数据后初始化)
function initEchart() {
  echartRef.value.init(option);
}
function setOption() {
  let series1 = option.series[0];
  series1.data[1].value = props.occupancy_rate;
  series1.data[0].value = 100 - props.occupancy_rate;

  let series2 = option.series[1];
  series2.data[1].value = props.wj_occupancy_rate;
  series2.data[0].value = 100 - props.wj_occupancy_rate;

  let new_option = {
    series: [series1, series2],
  };
  console.log("new_option");
  console.log(new_option);
  echartRef.value.setOption(new_option);
}
watch(props, () => {
  setOption();
});
</script>

<style>
canvas {
  width: 150px !important;
  height: 150px !important;
}
</style>
