const { API, post } = require('../../utils/api')
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
    total: 0,
    note: '',
    submitting: false
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
      tableNo: app.globalData.tableNo || ''
    })
  },

  onDineTypeChange(e) {
    const type = e.currentTarget.dataset.type
    const serviceFee = type === DINE_TYPE.DINE_IN ? this.data.peopleCount * SERVICE_FEE_PER_PERSON : 0
    this.setData({
      dineType: type,
      total: this.data.subtotal - this.data.discount + serviceFee
    })
  },

  onPeopleChange(e) {
    const op = e.currentTarget.dataset.op
    let count = this.data.peopleCount
    if (op === 'add') count++
    else if (op === 'minus' && count > MIN_PEOPLE_COUNT) count--
    const serviceFee = this.data.dineType === DINE_TYPE.DINE_IN ? count * SERVICE_FEE_PER_PERSON : 0
    this.setData({
      peopleCount: count,
      total: this.data.subtotal - this.data.discount + serviceFee
    })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  onSubmit() {
    if (this.data.submitting) return
    if (this.data.cartItems.length === 0) return wx.showToast({ title: '购物车为空', icon: 'none' })
    this.setData({ submitting: true })

    const userId = app.getUserId()
    // 注意：价格由后端重新计算，前端价格仅用于展示
    post(API.ORDER.CREATE, {
      userId,
      tableNo: this.data.tableNo,
      dineType: this.data.dineType,
      peopleCount: this.data.peopleCount,
      items: this.data.cartItems,
      note: this.data.note
    }).then(order => {
      app.clearCart()
      wx.showToast({ title: '下单成功', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${order.id}` })
      }, 1000)
    }).catch(() => {
      this.setData({ submitting: false })
    })
  }
})
