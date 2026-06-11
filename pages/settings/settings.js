const app = getApp()

Page({
  data: {
    settings: [
      { title: '清除缓存', action: 'clearCache' },
      { title: '关于我们', action: 'about' },
      { title: '版本', value: 'v1.0.0' }
    ],
    loading: true
  },

  onLoad() {
    // 模拟短暂加载，确保骨架屏可见
    this.setData({ loading: false })
  },

  onTap(e) {
    const action = e.currentTarget.dataset.action
    if (action === 'clearCache') {
      wx.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            wx.clearStorageSync()
            // 清除后重新初始化关键状态
            app.globalData.cartItems = []
            app.globalData.userId = null
            app.globalData.tableNo = ''
            // 重新登录
            app.login()
            wx.showToast({ title: '已清除', icon: 'success' })
          }
        }
      })
    } else if (action === 'about') {
      wx.showModal({ title: '关于小灶', content: '小灶点餐 v1.0.0\n让点餐更简单', showCancel: false })
    }
  },

  onPullDownRefresh() {
    this.setData({ loading: true })
    setTimeout(() => {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }, 300)
  }
})
