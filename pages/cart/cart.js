const app = getApp()

Page({
  data: { cartItems: [], total: 0, count: 0, loading: true },

  onLoad() {
    this.syncCart()
  },

  onShow() { this.syncCart() },

  syncCart() {
    this.setData({ loading: true })
    const cartItems = app.globalData.cartItems || []
    this.setData({
      cartItems,
      total: app.getCartTotal(),
      count: app.getCartCount(),
      loading: false
    })
  },

  onAdd(e) {
    const key = e.currentTarget.dataset.key
    const item = this.data.cartItems.find(c => c.cartKey === key)
    if (item) { app.updateCartItem(key, item.quantity + 1); this.syncCart() }
  },

  onMinus(e) {
    const key = e.currentTarget.dataset.key
    const item = this.data.cartItems.find(c => c.cartKey === key)
    if (item) { app.updateCartItem(key, item.quantity - 1); this.syncCart() }
  },

  onClear() {
    wx.showModal({
      title: '清空购物车', content: '确定清空吗？',
      success: (res) => { if (res.confirm) { app.clearCart(); this.syncCart() } }
    })
  },

  onCheckout() {
    if (this.data.count === 0) return
    wx.navigateTo({ url: '/pages/order-confirm/order-confirm' })
  },

  onPullDownRefresh() {
    this.syncCart()
    wx.stopPullDownRefresh()
  }
})
