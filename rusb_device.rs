use log::*;
use rusb::{DeviceHandle, GlobalContext, Language};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

// 设备的厂商 ID 和产品 ID
const VENDOR_ID: u16 = 0x4DD7;
const PRODUCT_ID: u16 = 0x42D2;

// USB 端点定义
const WRITE_ENDPOINT: u8 = 0x03;
const EVENT_ENDPOINT: u8 = 0x83; // 事件数据端点
const INTERFACE_SENSOR: u8 = 0; // USB 接口号，需根据实际设备确认
const INTERFACE_DEVICE_INFO: u8 = 2; // USB 接口号，需根据实际设备确认

/// 主设备结构体，包含 USB 句柄与读取控制状态
///
#[derive(Debug, Clone)]
pub struct InspireHmdDevice {
    pub device: Arc<Mutex<DeviceHandle<GlobalContext>>>, // USB 设备句柄，共享线程安全
}

impl InspireHmdDevice {
    /// 初始化设备：查找、打开设备，读取并校验序列号，绑定接口
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        // 获取 USB 设备列表
        let devices = rusb::devices()?;
        let device = devices
            .iter()
            .find(|d| {
                let desc = d.device_descriptor().unwrap();
                desc.vendor_id() == VENDOR_ID && desc.product_id() == PRODUCT_ID
            })
            .ok_or("未找到对应的设备，请检查")?;

        let handle: DeviceHandle<GlobalContext> = device.open()?;
        handle.claim_interface(INTERFACE_SENSOR)?; // 绑定接口
        handle.claim_interface(INTERFACE_DEVICE_INFO)?; // 绑定接口

        // 校验序列号是否匹配
        let device = Arc::new(Mutex::new(handle));
        Ok(Self { device })
    }
    pub fn check_device_sn(&self, sn: String) -> Result<String, String> {
        let sn_code = self.read_device_sn();
        if sn_code.is_err() {
            return Err(sn_code.err().unwrap());
        };
        let serial_number = sn_code.unwrap();
        info!("读取到的sn号为:{},写入的SN号为{}", serial_number, sn);
        if serial_number == sn {
            Ok("Sn号匹配".to_string())
        } else {
            let err_res = format!("读取到的sn号为:{},写入的SN号为{}", serial_number, sn);
            Err(err_res)
        }
    }
    pub fn set_device_sn(&self, new_sn: String) -> Result<(), Box<dyn std::error::Error>> {
        // 分段构建 SN 数据
        let sn_bytes = new_sn.as_bytes();
        println!("SN 长度: {}", sn_bytes.len());
        if sn_bytes.len() > 22 {
            return Err("写入的SN号长度超过 22 字符，请检查SN号是否正确".into());
        }
        let mut seg1 = [0xFFu8; 12];
        let mut seg2 = [0xFFu8; 10];

        for (i, &b) in sn_bytes.iter().take(12).enumerate() {
            seg1[i] = b;
        }
        for (i, &b) in sn_bytes.iter().skip(12).enumerate() {
            seg2[i] = b;
        }

        self.write_sn_segment(0x01, &seg1)?;
        thread::sleep(Duration::from_millis(1000));
        self.write_sn_segment(0x02, &seg2)?;

        Ok(())
    }
    pub fn write_sn_segment(
        &self,
        offset: u8,
        segment: &[u8],
    ) -> Result<(), Box<dyn std::error::Error>> {
        match offset {
            0x01 => assert_eq!(segment.len(), 12),
            0x02 => assert_eq!(segment.len(), 10),
            _ => return Err("非法 SN 偏移".into()),
        }
        let mut packet = [0xFFu8; 32];
        packet[0] = 0xC1;
        packet[1] = offset;

        for (i, &b) in segment.iter().enumerate() {
            packet[2 + i] = b;
        }
        //  写入 SN 数据
        println!("写入 SN 数据: {:02X?}", packet);
        let handle = self.device.lock().unwrap();

        let written =
            handle.write_interrupt(WRITE_ENDPOINT, &packet, Duration::from_millis(1000))?;

        //  读取写入结果
        let mut resp = [0u8; 33];
        let read = handle.read_interrupt(EVENT_ENDPOINT, &mut resp, Duration::from_millis(1000))?;
        if resp[0] != 0xC1 {
            return Err(format!("返回标识错误: 0x{:02X}", resp[0]).into());
        }
        if resp[1] != 0x01 {
            return Err("SN 写入失败".into());
        }
        println!("SN 写入成功，偏移: 0x{:02X}", offset);
        Ok(())
    }

    pub fn read_device_sn(&self) -> Result<String, String> {
        let mut cmd = [0xFFu8; 32];
        cmd[0] = 0xC2;
        let handle = self.device.lock().unwrap();
        let written = handle
            .write_interrupt(WRITE_ENDPOINT, &cmd, Duration::from_millis(1000))
            .unwrap();

        let mut resp = [0u8; 33];
        let read = handle
            .read_interrupt(EVENT_ENDPOINT, &mut resp, Duration::from_millis(1000))
            .unwrap();

        // 校验返回
        if resp[0] != 0xC2 {
            return Err(format!("返回标识错误: 0x{:02X}", resp[0]));
        }
        if resp[1] != 0x01 {
            return Err("执行结果无效（resp[1] != 1）".into());
        }

        // 提取 SN（2~23 字节）
        let sn_raw = &resp[3..24];
        let sn_str = sn_raw
            .iter()
            .take_while(|&&b| b != 0xFF)
            .map(|&b| b as char)
            .collect::<String>();
        Ok(sn_str)
    }
}
