const { API, get, post } = require('../../utils/api')
const app = getApp()

Page({
  data: { queueInfo: null, showJoin: false, peopleCount: 2, phone: '' },

  onLoad() { this.loadQueue() },

  loadQueue() {
    const userId = app.getUserId()
    if (!userId) return
    get(API.QUEUE.STATUS, { userId }).then(info => {
      this.setData({ queueInfo: info })
    })
  },

  onJoinShow() { this.setData({ showJoin: true }) },
  onJoinClose() { this.setData({ showJoin: false }) },

  onPeopleChange(e) {
    const op = e.currentTarget.dataset.op
    let c = this.data.peopleCount
    if (op === 'add') c++
    else if (op === 'minus' && c > 1) c--
    this.setData({ peopleCount: c })
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }) },

  onJoin() {
    const userId = app.getUserId()
    post(API.QUEUE.JOIN, { userId, peopleCount: this.data.peopleCount, phone: this.data.phone }).then(info => {
      this.setData({ queueInfo: info, showJoin: false })
      wx.showToast({ title: '已取号: ' + info.queueNo, icon: 'success' })
    })
  },

  onCancelQueue() {
    wx.showModal({
      title: '取消排队', content: '确定取消排队吗？',
      success: (res) => {
        if (res.confirm) {
          const userId = app.getUserId()
          post(API.QUEUE.CANCEL, { userId }).then(() => {
            this.setData({ queueInfo: null })
            wx.showToast({ title: '已取消', icon: 'success' })
          })
        }
      }
    })
  }
})
