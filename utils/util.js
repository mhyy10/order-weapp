function formatPrice(price) {
  return '¥' + Number(price).toFixed(2)
}

function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''
  const d = new Date(date)
  const map = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0')
  }
  return format
    .replace('YYYY', map.YYYY)
    .replace('MM', map.MM)
    .replace('DD', map.DD)
    .replace('HH', map.HH)
    .replace('mm', map.mm)
    .replace('ss', map.ss)
}

function timeAgo(date) {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return minutes + '分钟前'
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours + '小时前'
  const days = Math.floor(hours / 24)
  return days + '天前'
}

function debounce(func, wait) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => func.apply(this, args), wait)
  }
}

function getStatusText(status) {
  const map = {
    'pending': '待接单',
    'confirmed': '制作中',
    'ready': '可取餐',
    'delivering': '配送中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}

function getStatusColor(status) {
  const map = {
    'pending': '#FF9500',
    'confirmed': '#FF6B35',
    'ready': '#52C41A',
    'delivering': '#1890FF',
    'completed': '#999999',
    'cancelled': '#CCCCCC'
  }
  return map[status] || '#999999'
}

const storage = {
  get(key, defaultValue) { return wx.getStorageSync(key) || defaultValue },
  set(key, value) { wx.setStorageSync(key, value) },
  remove(key) { wx.removeStorageSync(key) }
}

module.exports = { formatPrice, formatDate, timeAgo, debounce, getStatusText, getStatusColor, storage }
