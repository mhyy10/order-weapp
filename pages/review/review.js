const { API, get, post } = require('../../utils/api')
const app = getApp()

const QUICK_TAGS = ['口味好', '分量足', '上菜快', '包装好', '性价比高', '环境好']

Page({
  data: {
    orderId: '',
    rating: 5,
    content: '',
    tags: [],
    quickTags: QUICK_TAGS,
    submitting: false,
    loading: true
  },

  onLoad(e) {
    if (!e.orderId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.setData({ orderId: e.orderId, loading: false })
  },

  onStarTap(e) {
    this.setData({ rating: e.currentTarget.dataset.star })
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    let tags = [...this.data.tags]
    const idx = tags.indexOf(tag)
    if (idx > -1) tags.splice(idx, 1)
    else tags.push(tag)
    this.setData({ tags })
  },

  onInput(e) {
    this.setData({ content: e.detail.value })
  },

  onSubmit() {
    if (this.data.submitting) return
    if (!this.data.rating) return wx.showToast({ title: '请选择评分', icon: 'none' })
    this.setData({ submitting: true })

    const userId = app.getUserId()
    post(API.REVIEW.CREATE, {
      orderId: this.data.orderId,
      userId,
      rating: this.data.rating,
      content: this.data.content,
      tags: this.data.tags
    }).then(() => {
      wx.showToast({ title: '评价成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1000)
    }).catch(() => {
      this.setData({ submitting: false })
    })
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  }
})
