const app = getApp()

Page({
  data: { cartItems: [], total: 0, count: 0 },

  onShow() { this.syncCart() },

  syncCart() {
    const cartItems = app.globalData.cartItems || []
    this.setData({
      cartItems,
      total: app.getCartTotal(),
      count: app.getCartCount()
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
  }
})
