const { API, get, post } = require('../../utils/api')
const { specAddToCart, hasSpecs, getDefaultSpec } = require('../../utils/cart')
const app = getApp()

Page({
  data: {
    dish: null,
    loading: true,
    isFavorited: false,
    showSpec: false,
    selectedSpec: '',
    selectedAddons: [],
    dishNote: ''
  },

  onLoad(e) {
    const id = e.id
    if (!id) {
      wx.showToast({ title: '菜品不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    get(API.DISH.DETAIL, { id }).then(dish => {
      this.setData({
        dish,
        loading: false,
        selectedSpec: getDefaultSpec(dish)
      })
      this.checkFavorite(id)
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  checkFavorite(dishId) {
    const userId = app.getUserId()
    if (!userId) return
    get(API.USER.FAVORITES, { userId }).then(favs => {
      this.setData({ isFavorited: favs.some(f => f.id == dishId) })
    }).catch(() => {})
  },

  onFavoriteTap() {
    const userId = app.getUserId()
    if (!userId) return wx.showToast({ title: '请先登录', icon: 'none' })
    post(API.USER.FAVORITE_TOGGLE, { userId, dishId: this.data.dish.id }).then(res => {
      this.setData({ isFavorited: res.favorited })
      wx.showToast({ title: res.favorited ? '已收藏' : '已取消', icon: 'none' })
    })
  },

  onAddToCart() {
    if (hasSpecs(this.data.dish)) {
      this.setData({ showSpec: true })
      return
    }
    specAddToCart(app, this.data.dish, '', [], '')
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  onSpecClose() { this.setData({ showSpec: false }) },
  onSpecSelect(e) { this.setData({ selectedSpec: e.currentTarget.dataset.value }) },
  onAddonToggle(e) {
    const val = e.currentTarget.dataset.value
    let addons = [...this.data.selectedAddons]
    const idx = addons.indexOf(val)
    if (idx > -1) addons.splice(idx, 1)
    else addons.push(val)
    this.setData({ selectedAddons: addons })
  },

  onSpecAdd() {
    specAddToCart(app, this.data.dish, this.data.selectedSpec, this.data.selectedAddons, this.data.dishNote)
    this.setData({ showSpec: false })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  onGoCart() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onPullDownRefresh() {
    this.setData({ loading: true })
    const id = this.data.dish ? this.data.dish.id : ''
    if (id) {
      get(API.DISH.DETAIL, { id }).then(dish => {
        this.setData({ dish, loading: false, selectedSpec: getDefaultSpec(dish) })
        this.checkFavorite(id)
      }).catch(() => {
        this.setData({ loading: false })
      })
    }
    wx.stopPullDownRefresh()
  }
})
