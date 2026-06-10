# 小灶点餐 — 前端

微信小程序点餐系统前端，基于原生框架开发。

## 功能

- 🍽️ 左右分栏点餐，分类浏览
- 🛒 购物车管理（规格/加料/备注）
- 📋 订单创建、查询、取消
- ❤️ 菜品收藏
- 📣 排队叫号
- 📷 扫码点餐
- 🔍 菜品搜索

## 目录结构

```
├── app.js/json/wxss      # 全局配置和样式
├── utils/
│   ├── api.js            # 请求封装
│   ├── cart.js           # 购物车工具
│   ├── constants.js      # 业务常量
│   ├── filters.wxs       # WXS 过滤器
│   └── util.js           # 通用工具
├── pages/
│   ├── index/            # 首页（点餐）
│   ├── cart/             # 购物车
│   ├── order-confirm/    # 确认下单
│   ├── order-list/       # 订单列表
│   ├── order-detail/     # 订单详情
│   ├── dish-detail/      # 菜品详情
│   ├── favorites/        # 收藏
│   ├── search/           # 搜索
│   ├── queue/            # 排队
│   ├── profile/          # 个人中心
│   ├── settings/         # 设置
│   └── table-scan/       # 扫码
└── assets/               # 静态资源
```

## 使用

1. 用微信开发者工具打开本目录
2. 配置后端 API 地址（`utils/api.js` 中的 `API_BASE`）
3. 编译预览
