const { API, get } = require('../../utils/api')
const { quickAddToCart, hasSpecs } = require('../../utils/cart')
const { debounce } = require('../../utils/util')
const app = getApp()

Page({
  data: { keyword: '', results: [], searched: false },

  onLoad() {
    this._debouncedSearch = debounce((kw) => this.doSearch(kw), 300)
  },

  onInput(e) {
    const kw = e.detail.value
    this.setData({ keyword: kw })
    if (kw.length > 0) {
      this._debouncedSearch(kw)
    } else {
      this.setData({ results: [], searched: false })
    }
  },

  doSearch(kw) {
    get(API.DISH.SEARCH, { keyword: kw }).then(results => {
      this.setData({ results, searched: true })
    }).catch(() => {
      this.setData({ results: [], searched: true })
    })
  },

  onClear() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  onDishTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  },

  onQuickAdd(e) {
    const dish = e.currentTarget.dataset.dish
    if (hasSpecs(dish)) {
      wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${dish.id}` })
      return
    }
    quickAddToCart(app, dish)
    wx.showToast({ title: '已加入', icon: 'success' })
  }
})
