const { API, get, post } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    loading: true,
    addresses: [],
    selectMode: false
  },

  onLoad(options) {
    if (options && options.selectMode === 'true') {
      this.setData({ selectMode: true })
    }
  },

  onShow() {
    this.loadAddresses()
  },

  loadAddresses() {
    this.setData({ loading: true })
    const userId = app.getUserId()
    if (!userId) {
      this.setData({ loading: false })
      return
    }
    get(API.ADDRESS.LIST, { userId }).then(data => {
      // 默认地址排在前面
      const addresses = (data || []).sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return 0
      })
      this.setData({ addresses, loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onSelect(e) {
    if (!this.data.selectMode) return
    const id = e.currentTarget.dataset.id
    const address = this.data.addresses.find(a => a.id === id)
    if (!address) return
    // 将选中的地址存入全局并返回上一页
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.setData) {
      prevPage.setData({ selectedAddress: address })
    }
    wx.navigateBack()
  },

  onLongPress(e) {
    const id = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除该地址'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deleteAddress(id)
        }
      }
    })
  },

  onSetDefault(e) {
    const id = e.currentTarget.dataset.id
    const userId = app.getUserId()
    if (!userId) return
    post(API.ADDRESS.SET_DEFAULT, { userId, addressId: id }).then(() => {
      wx.showToast({ title: '已设为默认', icon: 'success' })
      this.loadAddresses()
    })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/address-edit/address-edit?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该地址吗？',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          this.deleteAddress(id)
        }
      }
    })
  },

  deleteAddress(id) {
    const userId = app.getUserId()
    if (!userId) return
    post(API.ADDRESS.DELETE, { userId, addressId: id }).then(() => {
      wx.showToast({ title: '已删除', icon: 'success' })
      this.loadAddresses()
    })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' })
  },

  onPullDownRefresh() {
    this.loadAddresses()
    wx.stopPullDownRefresh()
  }
})
