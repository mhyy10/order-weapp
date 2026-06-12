const { API, get } = require('../../utils/api')
const { getStatusText, getStatusColor, formatDate } = require('../../utils/util')
const { DEFAULT_PAGE_SIZE } = require('../../utils/constants')
const app = getApp()

Page({
  data: {
    orders: [],
    loading: true,
    loaded: false,
    page: 1,
    hasMore: true,
    loadingMore: false
  },

  onLoad() { this.loadOrders() },

  onShow() {
    if (this.data.loaded) this.refreshOrders()
  },

  refreshOrders() {
    this.setData({ page: 1, hasMore: true })
    this.loadOrders()
  },

  loadOrders() {
    const userId = app.getUserId()
    if (!userId) return this.setData({ loading: false })
    const { page } = this.data
    const isLoadingMore = page > 1

    if (isLoadingMore) {
      this.setData({ loadingMore: true })
    } else {
      this.setData({ loading: true })
    }

    get(API.ORDER.LIST, { userId, page, pageSize: DEFAULT_PAGE_SIZE }).then(result => {
      const orders = result.list || result.orders || []
      const formatted = orders.map(o => {
        const dineTypeMap = { dine_in: '堂食', takeaway: '自提', delivery: '配送' }
        return {
          ...o,
          statusText: getStatusText(o.status),
          statusColor: getStatusColor(o.status),
          dineTypeText: dineTypeMap[o.dineType] || o.dineType,
          timeStr: formatDate(o.createdAt, 'MM-DD HH:mm'),
          itemCount: o._itemCount || o.items.reduce((s, i) => s + i.quantity, 0),
          hasMore: o._hasMore || false,
          reviewed: false
        }
      })

      this.setData({
        orders: isLoadingMore ? [...this.data.orders, ...formatted] : formatted,
        loading: false,
        loaded: true,
        loadingMore: false,
        hasMore: formatted.length >= DEFAULT_PAGE_SIZE
      })

      // 批量查询已完成订单的评价状态
      this.checkReviewedOrders(formatted)
    }).catch(() => this.setData({ loading: false, loadingMore: false }))
  },

  checkReviewedOrders(orders) {
    const completedOrders = orders.filter(o => o.status === 'completed')
    if (completedOrders.length === 0) return

    // 逐个查询评价状态（可优化为批量接口）
    completedOrders.forEach(o => {
      get(API.REVIEW.BY_ORDER, { orderId: o.id }).then(review => {
        if (review) {
          const idx = this.data.orders.findIndex(item => item.id === o.id)
          if (idx > -1) {
            this.setData({ [`orders[${idx}].reviewed`]: true })
          }
        }
      }).catch(() => {})
    })
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return
    this.setData({ page: this.data.page + 1 })
    this.loadOrders()
  },

  onOrderTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` })
  },

  onReview(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/review/review?orderId=${id}` })
  },

  onPullDownRefresh() {
    this.refreshOrders()
    wx.stopPullDownRefresh()
  }
})
