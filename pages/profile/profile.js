const { API, get } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    userInfo: null,
    orderCount: 0,
    favCount: 0,
    menuItems: [
      { icon: '📋', title: '我的订单', url: '/pages/order-list/order-list' },
      { icon: '❤️', title: '我的收藏', url: '/pages/favorites/favorites' },
      { icon: '🎫', title: '优惠券', url: '/pages/coupon/coupon' },
      { icon: '📣', title: '排队叫号', url: '/pages/queue/queue' },
      { icon: '⚙️', title: '设置', url: '/pages/settings/settings' }
    ]
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  loadUserInfo() {
    const userId = app.getUserId()
    if (!userId) return
    get(API.USER.INFO, { userId }).then(data => {
      this.setData({ userInfo: data })
    }).catch(() => {})
  },

  loadStats() {
    const userId = app.getUserId()
    if (!userId) return
    // 并行获取订单数和收藏数
    Promise.all([
      get(API.ORDER.LIST, { userId, page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
      get(API.USER.FAVORITES, { userId }).catch(() => [])
    ]).then(([orderRes, favs]) => {
      this.setData({
        orderCount: orderRes.total || orderRes.length || 0,
        favCount: favs.length || 0
      })
    })
  },

  onMenuTap(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  onScanTable() {
    wx.scanCode({
      success: (res) => {
        const match = res.result.match(/table=(\w+)/)
        if (match) {
          app.globalData.tableNo = match[1]
          wx.showToast({ title: '已扫描桌号 ' + match[1], icon: 'success' })
          setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
        } else {
          wx.showToast({ title: '无效的桌码', icon: 'none' })
        }
      }
    })
  }
})
