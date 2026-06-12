// API 基础地址：开发环境用 localhost，生产环境替换为线上地址
const API_BASE = __wxConfig ? 'https://your-server.com' : 'http://localhost:3001'
const MOCK_MODE = false

const API = {
  CATEGORY: { LIST: `${API_BASE}/category/list` },
  DISH: {
    LIST: `${API_BASE}/dish/list`,
    DETAIL: `${API_BASE}/dish/detail`,
    SEARCH: `${API_BASE}/dish/search`,
    RECOMMENDED: `${API_BASE}/dish/recommended`
  },
  CART: {
    LIST: `${API_BASE}/cart/list`,
    ADD: `${API_BASE}/cart/add`,
    UPDATE: `${API_BASE}/cart/update`,
    CLEAR: `${API_BASE}/cart/clear`
  },
  ORDER: {
    CREATE: `${API_BASE}/order/create`,
    LIST: `${API_BASE}/order/list`,
    DETAIL: `${API_BASE}/order/detail`,
    CANCEL: `${API_BASE}/order/cancel`,
    CONFIRM: `${API_BASE}/order/confirm`,
    ACCEPT: `${API_BASE}/order/accept`,
    READY: `${API_BASE}/order/ready`,
    COMPLETE: `${API_BASE}/order/complete`,
    DELIVERING: `${API_BASE}/order/delivering`,
    DELIVERED: `${API_BASE}/order/delivered`
  },
  USER: {
    LOGIN: `${API_BASE}/user/login`,
    INFO: `${API_BASE}/user/info`,
    FAVORITES: `${API_BASE}/user/favorites`,
    FAVORITE_TOGGLE: `${API_BASE}/user/favorite/toggle`
  },
  QUEUE: {
    JOIN: `${API_BASE}/queue/join`,
    STATUS: `${API_BASE}/queue/status`,
    CANCEL: `${API_BASE}/queue/cancel`
  },
  COUPON: {
    LIST: `${API_BASE}/coupon/list`,
    MY: `${API_BASE}/coupon/my`,
    CLAIM: `${API_BASE}/coupon/claim`,
    APPLY: `${API_BASE}/coupon/apply`
  },
  REVIEW: {
    CREATE: `${API_BASE}/review/create`,
    LIST: `${API_BASE}/review/list`,
    BY_ORDER: `${API_BASE}/review/by-order`
  },
  ADDRESS: {
    LIST: `${API_BASE}/address/list`,
    ADD: `${API_BASE}/address/add`,
    UPDATE: `${API_BASE}/address/update`,
    DELETE: `${API_BASE}/address/delete`,
    SET_DEFAULT: `${API_BASE}/address/setDefault`
  },
  POINTS: {
    BALANCE: `${API_BASE}/points/balance`,
    RECORDS: `${API_BASE}/points/records`
  },
  DELIVERY: {
    FEE: `${API_BASE}/delivery/fee`,
    TRACK: `${API_BASE}/delivery/track`
  }
}

// 请求中的 Promise 缓存，防止重复请求
const pendingRequests = {}

function request(url, method = 'GET', data = {}) {
  const key = `${method}:${url}:${JSON.stringify(data)}`

  // GET 请求去重：相同请求直接返回同一个 Promise
  if (method === 'GET' && pendingRequests[key]) {
    return pendingRequests[key]
  }

  const promise = new Promise((resolve, reject) => {
    wx.request({
      url, method, data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 401) {
          // Token 过期，清除登录状态并重新登录
          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')
          const app = getApp()
          if (app) app.login()
          wx.showToast({ title: '登录已过期，请重试', icon: 'none' })
          reject({ code: 401, msg: '未授权' })
          return
        }
        if (res.data.code === 0) {
          resolve(res.data.data)
        } else {
          wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      },
      complete: () => {
        // 请求完成，清除缓存
        delete pendingRequests[key]
      }
    })
  })

  if (method === 'GET') {
    pendingRequests[key] = promise
  }

  return promise
}

const get = (url, data) => request(url, 'GET', data)
const post = (url, data) => request(url, 'POST', data)

module.exports = { API, API_BASE, MOCK_MODE, request, get, post }
