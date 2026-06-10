/**
 * WebSocket 连接管理
 * 使用 wx.connectSocket 连接后端原生 WebSocket (/ws)
 * 与后端 Socket.IO 独立，小程序直接使用原生协议
 */

const API_BASE = require('./api').API_BASE
const WS_URL = API_BASE.replace('http', 'ws').replace('https', 'wss') + '/ws'

let socketTask = null
let listeners = {}
let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT = 10
const RECONNECT_DELAY = 5000
let currentUserId = null

function connect(userId) {
  if (socketTask) return
  currentUserId = userId

  socketTask = wx.connectSocket({
    url: WS_URL,
    header: { 'Authorization': wx.getStorageSync('token') || '' },
    success: () => { console.log('[WS] 连接中...') },
    fail: (err) => {
      console.warn('[WS] 连接失败:', err)
      socketTask = null
      scheduleReconnect()
    }
  })

  wx.onSocketOpen(() => {
    console.log('[WS] 已连接')
    reconnectAttempts = 0
    // 发送 join 消息
    if (userId) {
      wx.sendSocketMessage({
        data: JSON.stringify({ event: 'join', data: String(userId) })
      })
    }
  })

  wx.onSocketMessage((res) => {
    try {
      const msg = JSON.parse(res.data)
      const event = msg.event || msg.type
      if (event && listeners[event]) {
        listeners[event].forEach(fn => fn(msg.data || msg))
      }
      // 通配符监听
      if (listeners['*']) {
        listeners['*'].forEach(fn => fn(msg))
      }
    } catch (e) { /* 非 JSON 消息忽略 */ }
  })

  wx.onSocketClose(() => {
    console.log('[WS] 连接关闭')
    socketTask = null
    scheduleReconnect()
  })

  wx.onSocketError((err) => {
    console.warn('[WS] 错误:', err)
    socketTask = null
    scheduleReconnect()
  })
}

function scheduleReconnect() {
  if (reconnectTimer) return
  if (reconnectAttempts >= MAX_RECONNECT) {
    console.warn('[WS] 达到最大重连次数，停止重连')
    return
  }
  reconnectAttempts++
  console.log(`[WS] ${RECONNECT_DELAY/1000}s 后重连 (${reconnectAttempts}/${MAX_RECONNECT})`)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (currentUserId) connect(currentUserId)
  }, RECONNECT_DELAY)
}

function disconnect() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  currentUserId = null
  reconnectAttempts = 0
  if (socketTask) {
    wx.closeSocket()
    socketTask = null
  }
}

function on(event, callback) {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(callback)
}

function off(event, callback) {
  if (!listeners[event]) return
  if (callback) {
    listeners[event] = listeners[event].filter(fn => fn !== callback)
  } else {
    delete listeners[event]
  }
}

function isConnected() {
  return socketTask !== null
}

module.exports = { connect, disconnect, on, off, isConnected }
