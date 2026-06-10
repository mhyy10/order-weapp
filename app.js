const { API, post } = require('./utils/api')
const socket = require('./utils/socket')

App({
  globalData: {
    userInfo: null,
    userId: null,
    tableNo: '',
    cartItems: [],
    dineType: 'dine_in',
    unreadNotify: 0
  },

  onLaunch() {
    // 微信登录获取用户身份
    this.login()
    // 恢复购物车
    const cart = wx.getStorageSync('cartItems')
    if (cart) this.globalData.cartItems = cart
    // 初始化 WebSocket
    this.initSocket()
  },

  initSocket() {
    const userId = this.getUserId()
    if (userId) {
      socket.connect(userId)
      socket.on('order:status', (data) => {
        this.globalData.unreadNotify++
        wx.showToast({ title: `订单${data.status === 'completed' ? '已完成' : '已取消'}`, icon: 'none' })
      })
      socket.on('queue:call', (data) => {
        wx.showToast({ title: `叫号: ${data.queueNo}`, icon: 'none' })
      })
    }
  },

  login() {
    const userId = wx.getStorageSync('userId')
    if (userId) {
      this.globalData.userId = userId
      return
    }
    // 调用微信登录接口获取 code，发送到后端换取 userId
    wx.login({
      success: (res) => {
        if (res.code) {
          post(API.USER.LOGIN, { code: res.code }).then(data => {
            this.globalData.userId = data.userId
            wx.setStorageSync('userId', data.userId)
            wx.setStorageSync('token', data.token || '')
          }).catch(() => {
            // 登录失败时使用临时 ID，避免功能完全不可用
            console.warn('登录失败，使用临时用户ID')
            this.globalData.userId = 'temp_' + Date.now()
            wx.setStorageSync('userId', this.globalData.userId)
          })
        }
      }
    })
  },

  getUserId() {
    return this.globalData.userId || wx.getStorageSync('userId') || ''
  },

  saveCart() {
    wx.setStorageSync('cartItems', this.globalData.cartItems)
  },

  addToCart(item) {
    const cart = this.globalData.cartItems
    // 查找相同菜品+相同规格+相同加料
    const key = item.dishId + '_' + (item.spec || '') + '_' + (item.addons || []).sort().join(',')
    const existing = cart.find(c => {
      const cKey = c.dishId + '_' + (c.spec || '') + '_' + (c.addons || []).sort().join(',')
      return cKey === key
    })
    if (existing) {
      existing.quantity += item.quantity || 1
    } else {
      cart.push({ ...item, quantity: item.quantity || 1, cartKey: key })
    }
    this.globalData.cartItems = cart
    this.saveCart()
    return cart
  },

  updateCartItem(cartKey, quantity) {
    const cart = this.globalData.cartItems
    const idx = cart.findIndex(c => c.cartKey === cartKey)
    if (idx > -1) {
      if (quantity <= 0) {
        cart.splice(idx, 1)
      } else {
        cart[idx].quantity = quantity
      }
    }
    this.globalData.cartItems = cart
    this.saveCart()
    return cart
  },

  clearCart() {
    this.globalData.cartItems = []
    this.saveCart()
    return []
  },

  getCartCount() {
    return this.globalData.cartItems.reduce((sum, c) => sum + c.quantity, 0)
  },

  getCartTotal() {
    return this.globalData.cartItems.reduce((sum, c) => sum + c.price * c.quantity, 0)
  }
})
