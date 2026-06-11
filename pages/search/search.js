const { API, get } = require('../../utils/api')
const { quickAddToCart, hasSpecs } = require('../../utils/cart')
const { debounce } = require('../../utils/util')
const app = getApp()

Page({
  data: { keyword: '', results: [], searched: false, loading: false },

  onLoad() {
    this._debouncedSearch = debounce((kw) => this.doSearch(kw), 300)
  },

  onInput(e) {
    const kw = e.detail.value
    this.setData({ keyword: kw })
    if (kw.length > 0) {
      this.setData({ loading: true })
      this._debouncedSearch(kw)
    } else {
      this.setData({ results: [], searched: false, loading: false })
    }
  },

  doSearch(kw) {
    get(API.DISH.SEARCH, { keyword: kw }).then(results => {
      this.setData({ results, searched: true, loading: false })
    }).catch(() => {
      this.setData({ results: [], searched: true, loading: false })
    })
  },

  onClear() {
    this.setData({ keyword: '', results: [], searched: false, loading: false })
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
  },

  onPullDownRefresh() {
    if (this.data.keyword) {
      this.setData({ loading: true })
      this.doSearch(this.data.keyword)
    }
    wx.stopPullDownRefresh()
  }
})
