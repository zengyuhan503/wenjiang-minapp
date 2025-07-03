// utils/request.js
const baseURL = 'https://louyutest.cdyunbu.com/prod/api/wxapp'; // 替换为你的 API 基础地址
let isRefreshing = false;
let refreshPromise = null;
const refreshAndRetry = async (originalRequestFn) => {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken().finally(() => {
            isRefreshing = false;
        });
    }

    try {
        await refreshPromise;
        return originalRequestFn(); // 刷新成功后重试原请求
    } catch (e) {
        // 刷新失败，跳转登录
        uni.removeStorageSync("token");
        uni.removeStorageSync("isLogin");
        uni.showToast({ title: '登录过期', icon: 'none' });
        setTimeout(() => {
            uni.navigateTo({ url: '/package/login/login' });
        }, 1500);
        return Promise.reject('登录已过期');
    }
};

const shouldRefreshToken = () => {
    const expireAt = uni.getStorageSync('expire_at');
    const now = Date.now();
    return expireAt && now >= expireAt - 60 * 1000; // 提前1分钟刷新
};

const request = (url, method = 'GET', data = {}, header = {}) => {
    const doRequest = () => {
        return new Promise((resolve, reject) => {
            uni.request({
                url: baseURL + url,
                method,
                data,
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`,
                    ...header
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        if (res.data.code === 401) {
                            // token 失效，尝试刷新
                            refreshAndRetry(doRequest).then(resolve).catch(reject);
                        } else {
                            resolve(res.data);
                        }
                    } else if (res.statusCode === 401) {
                        refreshAndRetry(doRequest).then(resolve).catch(reject);
                    } else {
                        uni.showToast({ title: res.data.message || '请求错误', icon: 'none' });
                        reject(res);
                    }
                },
                fail: (err) => {
                    uni.showToast({ title: '网络错误', icon: 'none' });
                    reject(err);
                }
            });
        });
    };
    // 关键加这句 👇
    if (shouldRefreshToken()) {
        return refreshAndRetry(doRequest);
    }


    return doRequest();
};
 const apiUploadImage = (url, filePath) => {
    const doUpload = () => {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: baseURL + url,
                filePath: filePath,
                name: 'file',
                header: {
                    'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`,
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        const data = JSON.parse(res.data);
                        if (data.code === 401) {
                            refreshAndRetry(doUpload).then(resolve).catch(reject);
                        } else {
                            resolve(data);
                        }
                    } else if (res.statusCode === 401) {
                        refreshAndRetry(doUpload).then(resolve).catch(reject);
                    } else {
                        reject(JSON.parse(res.data));
                    }
                },
                fail: (err) => {
                    console.log(err);
                    reject(err);
                }
            });
        });
    };
    if (shouldRefreshToken()) {
        return refreshAndRetry(doUpload);
    }
    return doUpload();
};

export const refreshToken = () => {
    return new Promise((resolve, reject) => {
        let refresh_token = uni.getStorageSync('refresh_token');
        if (!refresh_token) {
            reject('refresh_token is not found');
            return
        }
        uni.request({
            url: baseURL + '/user/refresh',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refresh_token}`,
            },
            success: (res) => {
                if (res.statusCode == 200) {
                    if (res.data.code == 200) {
                        let data =res.data.data;
                        uni.setStorageSync("login_data", data);
                        uni.setStorageSync("token", data.access_token);
                        let expire_at = new Date().getTime() + data.expire_at * 1000;
                        uni.setStorageSync("expire_at", expire_at);
                        uni.setStorageSync("refresh_token", data.refresh_token);
                        resolve();
                    } else {
                        uni.removeStorageSync("token");
                        uni.removeStorageSync("expire_at");
                        uni.removeStorageSync("refresh_token");
                        uni.removeStorageSync("isLogin");
                        reject(res.data);
                    }
                } else {
                    uni.removeStorageSync("token");
                    uni.removeStorageSync("expire_at");
                    uni.removeStorageSync("refresh_token");
                    uni.removeStorageSync("isLogin");
                    reject(res.data);
                }
            },
            fail: (err) => {
                reject(err);
            }
        })
    })
}
// 封装常用方法
export const get = (url, data = {}, header = {}) => request(url, 'GET', data, header);
export const post = (url, data = {}, header = {}) => request(url, 'POST', data, header);
export const put = (url, data = {}, header = {}) => request(url, 'PUT', data, header);
export const del = (url, data = {}, header = {}) => request(url, 'DELETE', data, header);

export default {
    request,
    get,
    post,
    put,
    del,
    apiUploadImage,
    refreshToken
};
