const { API, get } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    loading: true,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    records: [],
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadBalance()
    this.loadRecords()
  },

  onShow() {
    if (!this.data.loading && this.data.records.length === 0) {
      this.loadBalance()
      this.loadRecords()
    }
  },

  loadBalance() {
    const userId = app.getUserId()
    if (!userId) return
    get(API.POINTS.BALANCE, { userId }).then(data => {
      this.setData({
        balance: data.balance || 0,
        totalEarned: data.totalEarned || 0,
        totalSpent: data.totalSpent || 0
      })
    }).catch(() => {})
  },

  loadRecords() {
    const userId = app.getUserId()
    if (!userId) {
      this.setData({ loading: false })
      return
    }
    const { page } = this.data
    get(API.POINTS.RECORDS, { userId, page, pageSize: 20 }).then(data => {
      const newRecords = data.records || data.list || []
      const records = page === 1 ? newRecords : this.data.records.concat(newRecords)
      this.setData({
        records,
        hasMore: newRecords.length >= 20,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onLoadMore() {
    if (!this.data.hasMore) return
    this.setData({ page: this.data.page + 1 })
    this.loadRecords()
  },

  onReachBottom() {
    this.onLoadMore()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadBalance()
    this.loadRecords()
    wx.stopPullDownRefresh()
  }
})
