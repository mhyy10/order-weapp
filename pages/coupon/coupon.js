const { API, get, post } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    tab: 'available',  // available | expired | all
    userCoupons: [],
    availableCoupons: [],
    filteredCoupons: [],
    loading: true
  },

  onLoad() { this.loadData() },
  onShow() { this.loadData() },

  loadData() {
    const userId = app.getUserId()
    if (!userId) return this.setData({ loading: false })
    Promise.all([
      get(API.COUPON.MY, { userId }),
      get(API.COUPON.LIST)
    ]).then(([userCoupons, availableCoupons]) => {
      this.setData({ userCoupons, availableCoupons, loading: false })
      this.updateFilteredCoupons()
    }).catch(() => this.setData({ loading: false }))
  },

  updateFilteredCoupons() {
    const { tab, userCoupons } = this.data
    let filtered
    if (tab === 'available') {
      filtered = userCoupons.filter(uc => uc.status === 'available')
    } else if (tab === 'expired') {
      filtered = userCoupons.filter(uc => uc.status === 'used' || uc.status === 'expired')
    } else {
      filtered = userCoupons
    }
    this.setData({ filteredCoupons: filtered })
  },

  onTabChange(e) {
    this.setData({ tab: e.currentTarget.dataset.tab })
    this.updateFilteredCoupons()
  },

  onClaim(e) {
    const couponId = e.currentTarget.dataset.id
    const userId = app.getUserId()
    if (!userId) return wx.showToast({ title: '请先登录', icon: 'none' })
    post(API.COUPON.CLAIM, { userId, couponId }).then(() => {
      wx.showToast({ title: '领取成功', icon: 'success' })
      this.loadData()
    })
  }
})
