const { API, get, post } = require('../../utils/api')
const { quickAddToCart } = require('../../utils/cart')
const app = getApp()

Page({
  data: { favorites: [], loading: true },

  onLoad() { this.loadFavorites() },

  // 修复：onShow 不重复加载，避免和 onLoad 双重请求
  onShow() {
    if (this.data.loaded) this.loadFavorites()
  },

  loadFavorites() {
    const userId = app.getUserId()
    if (!userId) return this.setData({ loading: false })
    get(API.USER.FAVORITES, { userId }).then(favs => {
      this.setData({ favorites: favs, loading: false, loaded: true })
    }).catch(() => this.setData({ loading: false }))
  },

  onDishTap(e) {
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${e.currentTarget.dataset.id}` })
  },

  onRemove(e) {
    const dishId = e.currentTarget.dataset.id
    const userId = app.getUserId()
    post(API.USER.FAVORITE_TOGGLE, { userId, dishId }).then(() => {
      // 本地移除，避免重新请求
      const favorites = this.data.favorites.filter(f => f.id != dishId)
      this.setData({ favorites })
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    })
  },

  onAddCart(e) {
    const dish = e.currentTarget.dataset.dish
    quickAddToCart(app, dish)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  }
})
