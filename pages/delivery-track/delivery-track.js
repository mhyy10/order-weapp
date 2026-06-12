const { API, get } = require('../../utils/api')
const { formatDate } = require('../../utils/util')

Page({
  data: {
    order: null,
    delivery: null,
    loading: true
  },

  onLoad(e) {
    this.orderId = e.orderId
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true })
    // 加载订单详情
    get(API.ORDER.DETAIL, { id: this.orderId }).then(order => {
      this.setData({ order })
    }).catch(() => {})

    // 加载配送追踪
    get(API.DELIVERY.TRACK, { orderId: this.orderId }).then(data => {
      // 格式化时间轴
      if (data.timeline) {
        data.timeline = data.timeline.map(t => ({
          ...t,
          timeStr: t.time ? formatDate(t.time, 'HH:mm') : ''
        }))
      }
      this.setData({ delivery: data, loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  // 拨打骑手电话
  onCallRider() {
    const phone = this.data.delivery && this.data.delivery.rider && this.data.delivery.rider.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})
