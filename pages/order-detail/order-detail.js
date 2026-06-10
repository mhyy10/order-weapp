const { API, get, post } = require('../../utils/api')
const { getStatusText, getStatusColor, formatDate } = require('../../utils/util')

Page({
  data: { order: null, loading: true },

  onLoad(e) {
    this.loadOrder(e.id)
  },

  loadOrder(id) {
    get(API.ORDER.DETAIL, { id }).then(order => {
      order.statusText = getStatusText(order.status)
      order.statusColor = getStatusColor(order.status)
      order.timeStr = formatDate(order.createdAt, 'YYYY-MM-DD HH:mm')
      order.itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
      this.setData({ order, loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          post(API.ORDER.CANCEL, { id: this.data.order.id }).then(o => {
            wx.showToast({ title: '已取消', icon: 'success' })
            this.loadOrder(this.data.order.id)
          })
        }
      }
    })
  },

  onConfirmPickup() {
    post(API.ORDER.COMPLETE, { id: this.data.order.id }).then(o => {
      wx.showToast({ title: '已确认取餐', icon: 'success' })
      this.loadOrder(this.data.order.id)
    })
  },

  onReorder() {
    const items = this.data.order.items
    const app = getApp()
    app.clearCart()
    items.forEach(item => app.addToCart(item))
    wx.switchTab({ url: '/pages/index/index' })
  },

  onReview() {
    wx.navigateTo({ url: `/pages/review/review?orderId=${this.data.order.id}` })
  }
})
