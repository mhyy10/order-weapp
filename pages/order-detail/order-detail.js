const { API, get, post } = require('../../utils/api')
const { getStatusText, getStatusColor, formatDate } = require('../../utils/util')

Page({
  data: { order: null, loading: true },

  onLoad(e) {
    this.loadOrder(e.id)
  },

  loadOrder(id) {
    this.setData({ loading: true })
    get(API.ORDER.DETAIL, { id }).then(order => {
      order.statusText = getStatusText(order.status)
      order.statusColor = getStatusColor(order.status)
      order.timeStr = formatDate(order.createdAt, 'YYYY-MM-DD HH:mm')
      order.itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
      // 用餐方式文案
      const dineTypeMap = { dine_in: '堂食', takeaway: '自提', delivery: '配送' }
      order.dineTypeText = dineTypeMap[order.dineType] || order.dineType
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

  // 配送订单确认收货
  onConfirmDelivered() {
    wx.showModal({
      title: '确认收货',
      content: '确认已收到餐品吗？',
      success: (res) => {
        if (res.confirm) {
          post(API.ORDER.DELIVERED, { id: this.data.order.id }).then(o => {
            wx.showToast({ title: '已确认收货', icon: 'success' })
            this.loadOrder(this.data.order.id)
          })
        }
      }
    })
  },

  // 查看配送追踪
  onViewTrack() {
    wx.navigateTo({ url: `/pages/delivery-track/delivery-track?orderId=${this.data.order.id}` })
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
  },

  onPullDownRefresh() {
    if (this.data.order) {
      this.loadOrder(this.data.order.id)
    }
    wx.stopPullDownRefresh()
  }
})
