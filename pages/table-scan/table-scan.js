Page({
  data: { scanning: false, loading: true, scanError: false },

  onLoad() {
    // 页面加载完成
    this.setData({ loading: false })
  },

  startScan() {
    this.setData({ scanning: true })
    wx.scanCode({
      success: (res) => {
        const match = res.result.match(/table=(\w+)/)
        if (match) {
          getApp().globalData.tableNo = match[1]
          wx.showToast({ title: '桌号 ' + match[1], icon: 'success' })
          setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
        } else {
          wx.showToast({ title: '无效的桌码', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '扫码取消', icon: 'none' })
      },
      complete: () => {
        this.setData({ scanning: false })
      }
    })
  },

  onManualInput() {
    wx.showModal({
      title: '手动输入桌号',
      editable: true,
      placeholderText: '请输入桌号',
      success: (res) => {
        if (res.confirm && res.content) {
          getApp().globalData.tableNo = res.content
          wx.switchTab({ url: '/pages/index/index' })
        }
      }
    })
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  }
})
