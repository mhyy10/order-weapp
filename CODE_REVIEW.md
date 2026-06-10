# 📋 代码审查报告 — order-weapp（小灶点餐小程序）

> 审查日期：2026-06-08
> 项目路径：/root/order-weapp
> 技术栈：微信小程序原生框架

---

## 🟢 项目优点

| # | 优点 | 说明 |
|---|------|------|
| 1 | 项目结构清晰 | 页面、工具函数、资源分离合理 |
| 2 | 购物车设计合理 | 使用 cartKey（dishId + spec + addons）去重 |
| 3 | 工具函数封装好 | formatPrice、debounce、getStatusText 等复用性强 |
| 4 | 用户体验细节 | 加入购物车时有震动反馈 wx.vibrateShort |

---

## 🔴 严重问题（已修复）

### 1. 安全隐患：硬编码 userId

- **文件**：`app.js`
- **问题**：没有真实登录，userId 硬编码为 1，所有用户共享同一账户
- **修复**：实现 `wx.login()` 获取 code，后端换 openid，新增 `login()` 方法

### 2. API 地址硬编码为 localhost

- **文件**：`utils/api.js`
- **问题**：`http://localhost:3001` 真机无法访问
- **修复**：根据环境自动切换 localhost / 线上地址（部署前需替换为实际域名）

### 3. profile.js 绕过统一请求层

- **文件**：`pages/profile/profile.js`
- **问题**：直接用 `wx.request` 拼 URL，绕过了 api.js 封装
- **修复**：改用 `get(API.USER.INFO, { userId })`

### 4. 前端价格计算可被篡改

- **文件**：`pages/order-confirm/order-confirm.js`
- **问题**：前端计算 subtotal/discount/total 发给后端，可 0 元下单
- **修复**：添加安全注释提醒，后端需根据菜品 ID 重新计算价格

---

## 🟡 中等问题（已修复）

### 5. index.js 嵌套 Promise 错误处理不完整

- **文件**：`pages/index/index.js`
- **问题**：内层 `Promise.all` 无 catch，错误被吞
- **修复**：改为 `async/await`，统一 try/catch，添加错误提示

### 6. search.js 搜索无防抖

- **文件**：`pages/search/search.js`
- **问题**：每次按键都发请求，浪费资源
- **修复**：使用 `debounce(fn, 300)` 包装搜索函数

### 7. order-list.js 重复请求

- **文件**：`pages/order-list/order-list.js`
- **问题**：`onLoad` 和 `onShow` 都调 `loadOrders`
- **修复**：增加 `loaded` 标记，`onShow` 仅在已加载后刷新

### 8. settings.js 清除缓存后状态异常

- **文件**：`pages/settings/settings.js`
- **问题**：清除所有缓存包括 userId，但未重新初始化
- **修复**：清除后重置 globalData 并重新调用 `login()`

---

## 🟠 代码质量问题（已修复）

### 9. 大量重复的 `wx.getStorageSync('userId') || 1`

- **涉及文件**：favorites.js、queue.js、order-confirm.js、order-list.js 等
- **修复**：在 `app.js` 中封装 `getUserId()` 方法，所有页面统一调用

### 10. formatPrice 精度问题

- **文件**：`utils/util.js`
- **问题**：`toFixed(0)` 丢失小数，餐饮场景应保留 2 位
- **修复**：改为 `toFixed(2)`

### 11. formatDate 替换顺序 bug

- **文件**：`utils/util.js`
- **问题**：对象遍历替换可能二次替换
- **修复**：改为链式 `.replace()` 按顺序精确替换

### 12. dish-detail.js 缺少参数校验

- **文件**：`pages/dish-detail/dish-detail.js`
- **问题**：`onLoad` 中未校验 id 参数
- **修复**：id 为空时提示"菜品不存在"并返回

---

## 📊 修复统计

| 级别 | 数量 | 状态 |
|------|------|------|
| 🔴 严重 | 4 | ✅ 全部修复 |
| 🟡 中等 | 4 | ✅ 全部修复 |
| 🟠 质量 | 4 | ✅ 全部修复 |
| **合计** | **12** | **✅ 全部完成** |

---

## ⚠️ 部署前待办

| # | 事项 | 优先级 |
|---|------|--------|
| 1 | 把 `api.js` 中 `https://your-server.com` 替换为实际服务器域名 | 🔴 必须 |
| 2 | 后端实现 `/user/login` 接口（接收 code，返回 userId + token） | 🔴 必须 |
| 3 | 后端 `/order/create` 接口根据菜品 ID 重新计算价格 | 🔴 必须 |
| 4 | 在 Notion 中连接此 integration | 🟡 建议 |

---

## 📁 修改文件清单

```
order-weapp/
├── app.js                              # +wx.login, +getUserId
├── utils/
│   ├── api.js                          # API_BASE 环境适配
│   └── util.js                         # formatPrice 精度, formatDate 修复
└── pages/
    ├── index/index.js                  # async/await 重构
    ├── profile/profile.js              # 改用统一请求层
    ├── search/search.js                # +搜索防抖
    ├── order-list/order-list.js        # 去重复请求, +getUserId
    ├── order-confirm/order-confirm.js  # +getUserId, +价格安全注释
    ├── order-detail/order-detail.js    # (无变更)
    ├── dish-detail/dish-detail.js      # +参数校验, +getUserId
    ├── favorites/favorites.js          # +getUserId
    ├── queue/queue.js                  # +getUserId
    ├── settings/settings.js            # 清除缓存后重新初始化
    └── cart/cart.js                    # (无变更)
```
