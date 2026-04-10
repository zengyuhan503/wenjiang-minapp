import https from "./request"

export const global = {
    config: () => {
        return https.get('/config')
    }
}
export const article = {
    // 文章列表
    list: () => https.get("/article"),
    detail: (id) => https.get(`/article/detail?id=${id}`)
}
export const user = {
    // 登录
    login: (params) => {
        return https.post('/user/login', params)
    },
    // 刷新token
    refresh: (params) => {
        let expire_at = uni.getStorageSync('expire_at');
        let now = Date.now();
        if (now > expire_at) {
            return https.refreshToken()
        } else {
            return Promise.resolve()
        }
    },
    // 退出登录
    logout: () => {

        return https.post('/user/logout', {}, header)
    },
    // 获取用户信息
    info: () => {

        return https.get('/user/info', {}, header)
    },
    // 获取个人信息
    getInfo: () => {
        return https.get('/user/getInfo')
    },
    // 修改密码
    password: (params) => {
        return https.put('/user/password', params)
    }
}
export const statistic = {
    // 首页统计
    home: () => {
        return https.get('/index')
    }
}
export const rental = {
    // 列表
    list: (params) => {
        let param = {
            page: params?.page || 1,
            page_size: params?.page_size || 10,
            house_id: params?.house_id || 0,
        }
        return https.get('/rental', param)
    },
    // 租赁详情
    detail: (id) => {
        return https.get(`/rental/detail?id=${id}`)
    }
}

export const house = {
    // 楼宇列表
    list: (params) => {
        return https.get('/house', params)
    },
    // 楼宇详情
    detail: (id) => {
        return https.get(`/house/detail?id=${id}`)
    },
    // 楼宇图片
    pictures: (id, room_id = 0) => {
        let param = {}
        param.house_id = id;
        room_id && (param.room_id = room_id);
        return https.get(`/house/photos`, param)
    },
    // 楼宇图片添加
    pictures_add: (params) => {
        return https.post(`/house/photos`, params)
    },
    // 楼宇图片删除
    deletePicture: (param) => {
        return https.del(`/house/photos`, param)
    },
    // 楼层列表
    floor: (params) => {

        let param = {
            house_id: params.house_id,
            status: params.status || 0,
        }
        return https.get(`/house/floor`, param)
    },
    // 公司列表
    company: (params) => {
        let param = {
            house_id: params.house_id,
            floor_id: params.floor_id,
            status: params.status,

        }
        return https.get(`/house/company`, param)
    }
}
export const coupon = {
    // 抵扣券列表
    list: () => {
        return https.get('/coupon/list')
    },
    // 新增抵扣券
    create: (params) => {
        return https.post('/coupon/create', params)
    },
    // 删除抵扣券
    delete: (id) => {
        return https.del(`/coupon/delete?id=${id}`)
    },
    // 获取券说明
    desc: () => {
        return https.get('/coupon/desc')
    },
    // 保存券说明
    descSave: (params) => {
        return https.post('/coupon/desc/save', params)
    }
}
export const company = {
    // 删除企业
    deleted: (id) => {
        return https.del(`/company?id=${id}`)
    },
    // 编辑企业
    edit: (id, params) => {
        return https.put(`/company/${id}`, params)
    },
    // 添加企业
    add: (params) => {
        return https.post('/company', params)
    },
    // 企业详情
    info: (id) => {
        return https.get(`/company/info?id=${id}`)
    },
    // 行业列表
    industrys: (params) => {
        return https.get('/company/industry')
    },
    // 楼栋列表
    buildList: (params) => {
        return https.get('/company/build', params)
    },
    // 楼层列表
    floorList: (params) => {
        return https.get('/company/floor', params)
    }
}

export const leaveWord = {
    // 留言
    message: (params) => {
        return https.post('/message', params)
    }
}
export const supply = {
    // 供需列表
    list: (params) => {
        return https.get('/supply-demand/list', params)
    },
    // 行业列表
    industries: () => {
        return https.get('/supply-demand/industries')
    },
    // 我的供需列表
    my: (params) => {
        return https.get('/supply-demand/my', params)
    },
    // 我的供需详情
    myDetail: (params) => {
        return https.get('/supply-demand/my/detail', params)
    },
    // 删除供需
    delete: (id) => {
        return https.del(`/supply-demand/delete?id=${id}`)
    },
    // 供需详情
    detail: (id) => {
        return https.get(`/supply-demand/detail?id=${id}`)
    },
    // 更新供需
    update: (id, params) => {
        return https.post(`/supply-demand/update/${id}`, params)
    },
    // 创建供需
    create: (params) => {
        return https.post(`/supply-demand/create`, params)
    },
    // 收到的留言数
    receivedCount: () => {
        return https.get('/supply-demand/message/received-count')
    },
    // 创建留言
    messageCreate: (params) => {
        return https.post('/supply-demand/message/create', params)
    }
}

export const policy = {
    // 政策文件列表
    list: (params) => {
        return https.get('/policy-file/list', params)
    }
}

export const ai = {
    // AI提问
    ask: (params) => {
        return https.post('/ai/ask', params)
    },
    // AI历史
    history: (params) => {
        return https.get('/ai/history', params)
    }
}

export const upload = {
    // 上传图片
    image: (file) => {
        return https.apiUploadImage('/attachment/upload', file)
    }
}