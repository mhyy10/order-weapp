const { API, get, post } = require('../../utils/api')
const { DISCOUNT_THRESHOLD, DISCOUNT_AMOUNT, SERVICE_FEE_PER_PERSON, MIN_PEOPLE_COUNT, DINE_TYPE } = require('../../utils/constants')
const app = getApp()

Page({
  data: {
    cartItems: [],
    dineType: DINE_TYPE.DINE_IN,
    tableNo: '',
    peopleCount: 2,
    subtotal: 0,
    discount: 0,
    couponDiscount: 0,
    selectedCoupon: null,
    availableCoupons: [],
    total: 0,
    note: '',
    submitting: false,
    loading: true
  },

  onLoad() {
    const cart = app.globalData.cartItems || []
    const subtotal = app.getCartTotal()
    const discount = subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0
    const serviceFee = this.data.dineType === DINE_TYPE.DINE_IN ? this.data.peopleCount * SERVICE_FEE_PER_PERSON : 0
    this.setData({
      cartItems: cart,
      subtotal,
      discount,
      total: subtotal - discount + serviceFee,
      tableNo: app.globalData.tableNo || '',
      loading: false
    })
    this.loadCoupons()
  },

  loadCoupons() {
    const userId = app.getUserId()
    if (!userId) return
    post(API.COUPON.APPLY, { userId, subtotal: this.data.subtotal }).then(coupons => {
      const available = coupons.filter(c => c.canUse)
      this.setData({ availableCoupons: available })
    }).catch(() => {})
  },

  recalcTotal() {
    const { subtotal, discount, couponDiscount, dineType, peopleCount } = this.data
    const serviceFee = dineType === DINE_TYPE.DINE_IN ? peopleCount * SERVICE_FEE_PER_PERSON : 0
    this.setData({ total: subtotal - discount - couponDiscount + serviceFee })
  },

  onSelectCoupon(e) {
    const idx = e.currentTarget.dataset.idx
    const coupon = this.data.availableCoupons[idx]
    if (!coupon || !coupon.canUse) return

    const selectedCoupon = this.data.selectedCoupon
    // 再次点击取消选择
    if (selectedCoupon && selectedCoupon.userCouponId === coupon.userCouponId) {
      this.setData({ selectedCoupon: null, couponDiscount: 0 })
    } else {
      this.setData({ selectedCoupon: coupon, couponDiscount: coupon.discount })
    }
    this.recalcTotal()
  },

  onDineTypeChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ dineType: type })
    this.recalcTotal()
  },

  onPeopleChange(e) {
    const op = e.currentTarget.dataset.op
    let count = this.data.peopleCount
    if (op === 'add') count++
    else if (op === 'minus' && count > MIN_PEOPLE_COUNT) count--
    this.setData({ peopleCount: count })
    this.recalcTotal()
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  onSubmit() {
    if (this.data.submitting) return
    if (this.data.cartItems.length === 0) return wx.showToast({ title: '购物车为空', icon: 'none' })
    this.setData({ submitting: true })

    const userId = app.getUserId()
    const params = {
      userId,
      tableNo: this.data.tableNo,
      dineType: this.data.dineType,
      peopleCount: this.data.peopleCount,
      items: this.data.cartItems,
      note: this.data.note
    }
    // 附加优惠券
    if (this.data.selectedCoupon) {
      params.userCouponId = this.data.selectedCoupon.userCouponId
    }

    post(API.ORDER.CREATE, params).then(order => {
      app.clearCart()
      wx.showToast({ title: '下单成功', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${order.id}` })
      }, 1000)
    }).catch(() => {
      this.setData({ submitting: false })
    })
  },

  onPullDownRefresh() {
    this.loadCoupons()
    wx.stopPullDownRefresh()
  }
})
