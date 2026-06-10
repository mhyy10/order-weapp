const { API, get } = require('../../utils/api')
const { quickAddToCart, specAddToCart, hasSpecs, getDefaultSpec, calcDishPrice } = require('../../utils/cart')
const { debounce } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    categories: [],
    dishes: [],
    // 按分类分组的菜品数据，避免 wxml 中 wx:if 遍历
    dishesByCategory: {},
    currentCategoryId: 0,
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    showCart: false,
    showSpec: false,
    currentDish: null,
    selectedSpec: '',
    selectedAddons: [],
    dishNote: '',
    scrollToView: '',
    loading: true
  },

  onLoad() {
    this.loadData()
    // 预创建节流的滚动处理函数
    this._throttledScroll = debounce((e) => this._doDishScroll(e), 100)
  },

  onShow() {
    this.syncCart()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      // 并行请求分类和推荐菜品
      const [categories, recommended] = await Promise.all([
        get(API.CATEGORY.LIST),
        get(API.DISH.RECOMMENDED)
      ])

      // 并行请求所有分类的菜品
      const dishResults = await Promise.all(
        categories.map(c => get(API.DISH.LIST, { categoryId: c.id }))
      )

      const allDishes = dishResults.flat()

      // 构建分组数据，避免 wxml 中重复遍历
      const dishesByCategory = {}
      categories.forEach((cat, i) => {
        dishesByCategory[cat.id] = dishResults[i] || []
      })

      this.setData({
        categories,
        dishes: allDishes,
        dishesByCategory,
        currentCategoryId: categories[0] ? categories[0].id : 0,
        loading: false
      })
    } catch (err) {
      console.error('加载数据失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败，请下拉刷新', icon: 'none' })
    }
  },

  syncCart() {
    const cartItems = app.globalData.cartItems || []
    // 为每个菜品附加购物车数量
    const dishes = this.data.dishes.map(d => ({
      ...d,
      _cartCount: cartItems.filter(c => c.dishId === d.id).reduce((s, c) => s + c.quantity, 0)
    }))
    // 同步分组数据
    const dishesByCategory = {}
    this.data.categories.forEach(cat => {
      dishesByCategory[cat.id] = dishes.filter(d => d.categoryId === cat.id)
    })
    this.setData({
      dishes,
      dishesByCategory,
      cartItems,
      cartCount: app.getCartCount(),
      cartTotal: app.getCartTotal()
    })
  },

  // Category tap
  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      currentCategoryId: id,
      scrollToView: 'cat_' + id
    })
  },

  // Scroll - sync left category（节流处理）
  onDishScroll(e) {
    this._throttledScroll(e)
  },

  _doDishScroll(e) {
    const query = wx.createSelectorQuery()
    query.selectAll('.dish-section').boundingClientRect()
    query.select('.dish-list-wrap').boundingClientRect()
    query.exec((res) => {
      if (!res || !res[0] || !res[1]) return
      const sections = res[0]
      const container = res[1]
      const containerTop = container.top
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].top - containerTop <= 10) {
          const catId = sections[i].dataset.catid
          if (catId !== this.data.currentCategoryId) {
            this.setData({ currentCategoryId: catId })
          }
          break
        }
      }
    })
  },

  // Quick add (no spec)
  onQuickAdd(e) {
    const dish = e.currentTarget.dataset.dish
    if (hasSpecs(dish)) {
      this.openSpecModal(dish)
      return
    }
    quickAddToCart(app, dish)
    this.syncCart()
    wx.vibrateShort({ type: 'light' })
  },

  // Open spec modal
  openSpecModal(dish) {
    this.setData({
      showSpec: true,
      currentDish: dish,
      selectedSpec: getDefaultSpec(dish),
      selectedAddons: [],
      dishNote: ''
    })
  },

  onSpecClose() {
    this.setData({ showSpec: false, currentDish: null })
  },

  onSpecSelect(e) {
    this.setData({ selectedSpec: e.currentTarget.dataset.value })
  },

  onAddonToggle(e) {
    const value = e.currentTarget.dataset.value
    let addons = [...this.data.selectedAddons]
    const idx = addons.indexOf(value)
    if (idx > -1) addons.splice(idx, 1)
    else addons.push(value)
    this.setData({ selectedAddons: addons })
  },

  onDishNoteInput(e) {
    this.setData({ dishNote: e.detail.value })
  },

  // Add from spec modal
  onSpecAdd() {
    const dish = this.data.currentDish
    if (!dish) return
    specAddToCart(app, dish, this.data.selectedSpec, this.data.selectedAddons, this.data.dishNote)
    this.syncCart()
    this.setData({ showSpec: false, currentDish: null })
    wx.vibrateShort({ type: 'light' })
  },

  // Cart operations
  toggleCart() {
    this.setData({ showCart: !this.data.showCart })
  },

  hideCart() {
    this.setData({ showCart: false })
  },

  onCartAdd(e) {
    const key = e.currentTarget.dataset.key
    const item = this.data.cartItems.find(c => c.cartKey === key)
    if (item) {
      app.updateCartItem(key, item.quantity + 1)
      this.syncCart()
    }
  },

  onCartMinus(e) {
    const key = e.currentTarget.dataset.key
    const dishId = e.currentTarget.dataset.id
    // 支持两种来源：购物车面板用 cartKey，菜品列表用 dishId
    const item = key
      ? this.data.cartItems.find(c => c.cartKey === key)
      : this.data.cartItems.find(c => c.dishId === dishId)
    if (item) {
      app.updateCartItem(item.cartKey, item.quantity - 1)
      this.syncCart()
    }
  },

  onClearCart() {
    app.clearCart()
    this.syncCart()
    this.setData({ showCart: false })
  },

  onGoCheckout() {
    if (this.data.cartCount === 0) return
    this.setData({ showCart: false })
    wx.navigateTo({ url: '/pages/order-confirm/order-confirm' })
  },

  // Dish detail
  onDishTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  },

  // Search
  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})
