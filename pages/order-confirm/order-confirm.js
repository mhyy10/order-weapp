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
    loading: true,
    // 地址相关
    selectedAddress: null,
    // 积分相关
    pointsBalance: 0,
    usePoints: false,
    pointsToUse: 0,
    pointsDeduction: 0,
    maxPointsDeduction: 0,
    maxPoints: 0
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
    this.loadPointsBalance()
  },

  onShow() {
    // 检查是否从地址选择页返回
    const selectedAddress = this.data.selectedAddress
    // 如果有 selectedAddress 说明是从地址页选择回来的，已在 onSelectAddress 回调中设置
  },

  loadCoupons() {
    const userId = app.getUserId()
    if (!userId) return
    post(API.COUPON.APPLY, { userId, subtotal: this.data.subtotal }).then(coupons => {
      const available = coupons.filter(c => c.canUse)
      this.setData({ availableCoupons: available })
    }).catch(() => {})
  },

  loadPointsBalance() {
    const userId = app.getUserId()
    if (!userId) return
    get(API.POINTS.BALANCE, { userId }).then(data => {
      this.setData({ pointsBalance: data.balance || 0 })
      this.recalcMaxPoints()
    }).catch(() => {})
  },

  recalcMaxPoints() {
    // 最多可抵扣订单金额的30%，100积分=1元
    const { total, pointsBalance, couponDiscount, discount, subtotal, dineType, peopleCount } = this.data
    const serviceFee = dineType === DINE_TYPE.DINE_IN ? peopleCount * SERVICE_FEE_PER_PERSON : 0
    const orderAmount = subtotal - discount - couponDiscount + serviceFee
    const maxDeductionAmount = Math.floor(orderAmount * 0.3 * 100) / 100 // 订单金额30%
    const maxPoints = Math.min(pointsBalance, Math.floor(maxDeductionAmount * 100)) // 100积分=1元
    this.setData({
      maxPointsDeduction: maxDeductionAmount,
      maxPoints: maxPoints
    })
    // 如果当前使用的积分超过了最大值，自动调整
    if (this.data.pointsToUse > maxPoints) {
      this.setData({ pointsToUse: maxPoints })
      this.recalcPointsDeduction()
    }
  },

  recalcPointsDeduction() {
    const pointsToUse = this.data.pointsToUse || 0
    const pointsDeduction = Math.floor(pointsToUse / 100 * 100) / 100 // 100积分=1元，保留两位小数
    this.setData({ pointsDeduction })
  },

  recalcTotal() {
    const { subtotal, discount, couponDiscount, dineType, peopleCount, pointsDeduction } = this.data
    const serviceFee = dineType === DINE_TYPE.DINE_IN ? peopleCount * SERVICE_FEE_PER_PERSON : 0
    this.setData({ total: subtotal - discount - couponDiscount - pointsDeduction + serviceFee })
    this.recalcMaxPoints()
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

  // 地址选择
  onChooseAddress() {
    wx.navigateTo({ url: '/pages/address/address?selectMode=true' })
  },

  // 积分相关
  onUsePointsChange(e) {
    const usePoints = e.detail.value
    if (usePoints && this.data.pointsBalance === 0) {
      wx.showToast({ title: '暂无可用积分', icon: 'none' })
      return
    }
    this.setData({ usePoints })
    if (!usePoints) {
      this.setData({ pointsToUse: 0, pointsDeduction: 0 })
      this.recalcTotal()
    } else {
      // 默认使用最大可用积分
      const pointsToUse = this.data.maxPoints
      this.setData({ pointsToUse })
      this.recalcPointsDeduction()
      this.recalcTotal()
    }
  },

  onPointsInput(e) {
    let val = parseInt(e.detail.value) || 0
    if (val < 0) val = 0
    if (val > this.data.maxPoints) val = this.data.maxPoints
    if (val > this.data.pointsBalance) val = this.data.pointsBalance
    // 积分必须是100的整数倍
    val = Math.floor(val / 100) * 100
    this.setData({ pointsToUse: val })
    this.recalcPointsDeduction()
    this.recalcTotal()
  },

  onSubmit() {
    if (this.data.submitting) return
    if (this.data.cartItems.length === 0) return wx.showToast({ title: '购物车为空', icon: 'none' })

    // 外带时校验地址
    if (this.data.dineType === 'takeaway' && !this.data.selectedAddress) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

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
    // 附加地址
    if (this.data.selectedAddress) {
      params.addressId = this.data.selectedAddress.id
    }
    // 附加积分
    if (this.data.usePoints && this.data.pointsToUse > 0) {
      params.usePoints = this.data.pointsToUse
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
    this.loadPointsBalance()
    wx.stopPullDownRefresh()
  }
})
