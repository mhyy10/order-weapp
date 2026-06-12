const { API, get, post } = require('../../utils/api')
const { getStatusText, getStatusColor, formatDate } = require('../../utils/util')
const { DEFAULT_PAGE_SIZE, ORDER_TABS, DINE_TYPE_MAP } = require('../../utils/constants')
const app = getApp()

Page({
  data: {
    tabs: ORDER_TABS,
    activeTab: '',
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

  onTabTap(e) {
    const key = e.currentTarget.dataset.key
    if (key === this.data.activeTab) return
    this.setData({ activeTab: key, page: 1, hasMore: true, orders: [] })
    this.loadOrders()
  },

  refreshOrders() {
    this.setData({ page: 1, hasMore: true })
    this.loadOrders()
  },

  loadOrders() {
    const userId = app.getUserId()
    if (!userId) return this.setData({ loading: false })
    const { page, activeTab } = this.data
    const isLoadingMore = page > 1

    if (isLoadingMore) {
      this.setData({ loadingMore: true })
    } else {
      this.setData({ loading: true })
    }

    const params = { userId, page, pageSize: DEFAULT_PAGE_SIZE }
    if (activeTab) params.status = activeTab

    get(API.ORDER.LIST, params).then(result => {
      const orders = result.list || result.orders || []
      const formatted = orders.map(o => {
        return {
          ...o,
          statusText: getStatusText(o.status),
          statusColor: getStatusColor(o.status),
          dineTypeText: DINE_TYPE_MAP[o.dineType] || o.dineType,
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

  onCancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？优惠券和积分将退还。',
      success: (res) => {
        if (res.confirm) {
          post(API.ORDER.CANCEL, { id }).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' })
            this.refreshOrders()
          })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.refreshOrders()
    wx.stopPullDownRefresh()
  }
})
