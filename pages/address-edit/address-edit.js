const { API, get, post } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    isEdit: false,
    addressId: '',
    form: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    submitting: false
  },

  onLoad(options) {
    if (options && options.id) {
      this.setData({ isEdit: true, addressId: options.id })
      wx.setNavigationBarTitle({ title: '编辑地址' })
      this.loadAddress(options.id)
    }
  },

  loadAddress(id) {
    const userId = app.getUserId()
    if (!userId) return
    get(API.ADDRESS.LIST, { userId }).then(data => {
      const address = (data || []).find(a => a.id === id)
      if (address) {
        this.setData({
          form: {
            name: address.name || '',
            phone: address.phone || '',
            province: address.province || '',
            city: address.city || '',
            district: address.district || '',
            detail: address.detail || '',
            isDefault: !!address.isDefault
          }
        })
      }
    }).catch(() => {})
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        // 从地址字符串解析省市区
        const addr = res.name + res.address
        // 尝试使用微信返回的信息
        this.setData({
          'form.province': res.name || '',
          'form.city': res.name || '',
          'form.district': '',
          'form.detail': (res.address || '') + (res.name || '')
        })
      },
      fail: () => {
        // 如果用户拒绝授权或取消，使用 picker 作为备选
        this.onRegionPick()
      }
    })
  },

  onRegionPick() {
    wx.chooseRegion({
      success: (res) => {
        this.setData({
          'form.province': res.province || '',
          'form.city': res.city || '',
          'form.district': res.district || ''
        })
      }
    })
  },

  onDefaultChange(e) {
    this.setData({ 'form.isDefault': e.detail.value })
  },

  validate() {
    const { name, phone } = this.data.form
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入收件人姓名', icon: 'none' })
      return false
    }
    if (!phone || !phone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return false
    }
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return false
    }
    return true
  },

  onSave() {
    if (this.data.submitting) return
    if (!this.validate()) return

    this.setData({ submitting: true })
    const userId = app.getUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      this.setData({ submitting: false })
      return
    }

    const params = {
      userId,
      ...this.data.form
    }

    const request = this.data.isEdit
      ? post(API.ADDRESS.UPDATE, { ...params, addressId: this.data.addressId })
      : post(API.ADDRESS.ADD, params)

    request.then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    }).catch(() => {
      this.setData({ submitting: false })
    })
  }
})
