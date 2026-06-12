const { API, get, post } = require('../../utils/api')
const { getStatusText, getStatusColor, formatDate } = require('../../utils/util')
const { DINE_TYPE_MAP } = require('../../utils/constants')

Page({
  data: {
    order: null,
    loading: true,
    timeline: []
  },

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
      order.dineTypeText = DINE_TYPE_MAP[order.dineType] || order.dineType

      // 构建订单时间线
      const timeline = this.buildTimeline(order)
      this.setData({ order, timeline, loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  buildTimeline(order) {
    const steps = []

    // 下单
    steps.push({
      label: '订单提交',
      time: order.createdAt,
      timeStr: formatDate(order.createdAt, 'HH:mm'),
      completed: true,
      current: false
    })

    // 商家接单
    if (order.confirmedAt) {
      steps.push({
        label: '商家已接单',
        time: order.confirmedAt,
        timeStr: formatDate(order.confirmedAt, 'HH:mm'),
        completed: true,
        current: false
      })
    } else if (order.status === 'pending') {
      steps.push({ label: '等待商家接单', time: null, timeStr: '', completed: false, current: true })
    }

    // 制作完成
    if (order.readyAt) {
      steps.push({
        label: '制作完成',
        time: order.readyAt,
        timeStr: formatDate(order.readyAt, 'HH:mm'),
        completed: true,
        current: false
      })
    } else if (['confirmed'].includes(order.status)) {
      steps.push({ label: '制作中', time: null, timeStr: '', completed: false, current: true })
    }

    // 配送中（仅配送订单）
    if (order.dineType === 'delivery') {
      if (order.deliveringAt) {
        steps.push({
          label: '骑手配送中',
          time: order.deliveringAt,
          timeStr: formatDate(order.deliveringAt, 'HH:mm'),
          completed: true,
          current: false
        })
      } else if (order.status === 'ready') {
        steps.push({ label: '等待骑手取餐', time: null, timeStr: '', completed: false, current: true })
      }
    }

    // 已完成
    if (order.completedAt) {
      steps.push({
        label: order.dineType === 'delivery' ? '已送达' : '已取餐',
        time: order.completedAt,
        timeStr: formatDate(order.completedAt, 'HH:mm'),
        completed: true,
        current: false
      })
    } else if (['ready', 'delivering'].includes(order.status)) {
      steps.push({
        label: order.dineType === 'delivery' && order.status === 'delivering' ? '等待确认收货' : '等待取餐',
        time: null, timeStr: '', completed: false, current: true
      })
    }

    // 已取消
    if (order.cancelledAt) {
      steps.push({
        label: '已取消',
        time: order.cancelledAt,
        timeStr: formatDate(order.cancelledAt, 'HH:mm'),
        completed: true,
        current: false,
        cancelled: true
      })
    }

    return steps
  },

  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？优惠券和积分将退还。',
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

  callRider() {
    const phone = this.data.order.delivery && this.data.order.delivery.riderPhone
    if (phone) wx.makePhoneCall({ phoneNumber: phone })
  },

  onPullDownRefresh() {
    if (this.data.order) {
      this.loadOrder(this.data.order.id)
    }
    wx.stopPullDownRefresh()
  }
})
