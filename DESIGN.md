# 点餐小程序 - 产品设计文档

## 一、市场调研分析

### 1.1 优秀方案对标

| 产品 | 核心亮点 | 值得借鉴 |
|------|---------|---------|
| 美团点餐 | 左侧分类+右侧商品列表联动、购物车底部浮层 | 经典双栏布局、加减按钮动画 |
| 瑞幸咖啡 | 极简商品卡片、规格弹窗、优惠标签 | 商品卡片设计、规格选择交互 |
| 喜茶GO | 品牌感强、排队进度、自定义配方 | 品牌视觉、排队叫号系统 |
| 麦当劳/肯德基 | 套餐组合、加购推荐、会员积分 | 套餐构建器、智能推荐 |
| 海底捞 | 桌号扫码、多人点餐、实时同步 | 桌号绑定、多人协作 |
| 外婆家 | 精美菜品图片、推荐菜标签 | 视觉设计、招牌推荐 |

### 1.2 共性设计模式

**布局模式：** 左侧分类导航 + 右侧商品列表（经典双栏）
**购物车：** 底部悬浮栏，点击展开详情
**商品卡片：** 图片+名称+描述+价格+加减按钮
**规格选择：** 底部弹出半屏弹窗
**下单流程：** 选菜 → 选规格 → 购物车 → 确认订单 → 支付

---

## 二、产品定位

**名称：** 小灶（点餐小程序）
**定位：** 轻量级餐厅点餐小程序，堂食扫码 + 外带下单
**风格：** 清新暖色调，橙色系主色，食欲感设计

---

## 三、核心功能设计

### 3.1 页面结构 (共12页)

```
pages/
├── index/           # 首页 - 点餐主页面（双栏布局）
├── menu/            # 菜单 - 分类浏览（备用全屏菜单）
├── cart/            # 购物车 - 已选菜品、数量调整
├── order-confirm/   # 确认订单 - 备注、桌号/地址、支付
├── order-list/      # 订单列表 - 历史订单
├── order-detail/    # 订单详情 - 状态跟踪
├── dish-detail/     # 菜品详情 - 大图、规格、评价
├── profile/         # 我的 - 个人信息、收藏、历史
├── favorites/       # 收藏 - 常点菜品
├── table-scan/      # 扫码点餐 - 扫桌号二维码
├── queue/           # 排队叫号 - 等位进度
└── settings/        # 设置
```

### 3.2 TabBar (4个)

| Tab | 图标 | 页面 | 说明 |
|-----|------|------|------|
| 点餐 | 🍜 | index | 首页，双栏点餐 |
| 订单 | 📋 | order-list | 历史订单 |
| 我的 | 👤 | profile | 个人中心 |

### 3.3 核心交互设计

#### A. 点餐页（index）- 核心页面

```
┌─────────────────────────────────┐
│  🔍 搜索菜品              📍桌号3 │  ← 顶部栏
├────────┬────────────────────────┤
│ 推荐    │  ┌─招牌推荐──────────┐ │
│ 热菜    │  │ 🍖 红烧肉 ¥38    │ │
│ 凉菜    │  │ 月销326 好评98%   │ │
│ 主食    │  │         [- 1 +]   │ │
│ 汤羹    │  └──────────────────┘ │
│ 小食    │  ┌─宫保鸡丁─────────┐ │
│ 饮品    │  │ 🍗 宫保鸡丁 ¥32  │ │
│ 甜品    │  │ 微辣 经典川菜     │ │
│        │  │         [+]       │ │
│        │  └──────────────────┘ │
│        │  ...更多菜品...        │
├────────┴────────────────────────┤
│  🛒 已选3件 ¥108    [去结算]    │  ← 购物车栏
└─────────────────────────────────┘
```

**交互要点：**
- 左侧分类点击 → 右侧自动滚动到对应分类
- 右侧滚动 → 左侧分类自动高亮联动
- 点击 [+] → 商品飞入购物车动画
- 点击商品图片/名称 → 进入详情页
- 购物车栏点击 → 展开已选菜品列表
- 分类旁显示已选数量角标

#### B. 规格选择弹窗

```
┌─────────────────────────────────┐
│          × 关闭                  │
│  ┌─────────────────────────┐    │
│  │    🍖 红烧肉             │    │
│  │    ¥38                  │    │
│  └─────────────────────────┘    │
│                                  │
│  份量                            │
│  [小份¥28] [中份¥38✓] [大份¥58] │
│                                  │
│  口味                            │
│  [正常✓] [少盐] [少油]           │
│                                  │
│  加料 (+¥3/份)                   │
│  [加蛋] [加辣] [+芝士]           │
│                                  │
│  备注: [请输入特殊要求...]        │
│                                  │
│  [- 1 +]        [加入购物车 ¥38] │
└─────────────────────────────────┘
```

#### C. 购物车展开

```
┌─────────────────────────────────┐
│  已选菜品          [清空]        │
├─────────────────────────────────┤
│  🍖 红烧肉(中份)      [- 2 +] ¥76│
│  🍗 宫保鸡丁          [- 1 +] ¥32│
│  🍚 米饭              [- 3 +] ¥9 │
├─────────────────────────────────┤
│  餐位费              ¥3/位 × 2   │
│  共6件  合计: ¥120               │
│          [去结算]                │
└─────────────────────────────────┘
```

#### D. 订单确认页

```
┌─────────────────────────────────┐
│  就餐方式                        │
│  [堂食✓] [外带]                  │
│                                  │
│  📍 桌号: A3                     │
│  就餐人数: [- 2 +] 位            │
│                                  │
│  ──── 已选菜品 ────              │
│  红烧肉(中份) ×2      ¥76       │
│  宫保鸡丁 ×1           ¥32       │
│  米饭 ×3              ¥9        │
│  餐位费 ×2            ¥6        │
│  ─────────────────────          │
│  小计: ¥123                      │
│  优惠: -¥5 (新客立减)            │
│  ─────────────────────          │
│  合计: ¥118                      │
│                                  │
│  备注: [少放辣，不要香菜...]      │
│                                  │
│  支付方式: 微信支付               │
│                                  │
│       [提交订单 ¥118]            │
└─────────────────────────────────┘
```

---

## 四、数据模型设计

### 4.1 菜品分类 (categories)
```json
{
  "id": 1,
  "name": "推荐",
  "icon": "🔥",
  "sort": 0,
  "isActive": true
}
```

### 4.2 菜品 (dishes)
```json
{
  "id": 1,
  "categoryId": 1,
  "name": "红烧肉",
  "description": "精选五花肉，慢炖2小时，入口即化",
  "image": "/assets/dishes/hongshaorou.jpg",
  "price": 38,
  "originalPrice": 48,
  "sales": 326,
  "rating": 4.8,
  "tags": ["招牌", "热销"],
  "spicy": 0,
  "specs": [
    {
      "name": "份量",
      "options": [
        { "name": "小份", "price": 28 },
        { "name": "中份", "price": 38 },
        { "name": "大份", "price": 58 }
      ]
    },
    {
      "name": "口味",
      "options": [
        { "name": "正常", "price": 0 },
        { "name": "少盐", "price": 0 },
        { "name": "少油", "price": 0 }
      ]
    }
  ],
  "addons": [
    { "name": "加蛋", "price": 3 },
    { "name": "加辣", "price": 0 }
  ],
  "isRecommended": true,
  "isAvailable": true
}
```

### 4.3 购物车项 (cartItem)
```json
{
  "dishId": 1,
  "name": "红烧肉",
  "image": "/assets/dishes/hongshaorou.jpg",
  "spec": "中份",
  "addons": ["加蛋"],
  "note": "少放盐",
  "price": 41,
  "quantity": 2
}
```

### 4.4 订单 (order)
```json
{
  "id": "ORD20260528001",
  "userId": 1,
  "tableNo": "A3",
  "dineType": "dine_in",
  "peopleCount": 2,
  "items": [/* cartItem数组 */],
  "subtotal": 123,
  "discount": 5,
  "total": 118,
  "note": "少放辣",
  "status": "pending",
  "statusText": "待接单",
  "createdAt": "2026-05-28T12:30:00Z"
}
```

### 4.5 订单状态流
```
pending (待接单)
  → confirmed (已接单/制作中)
  → ready (已完成/可取餐)
  → completed (已取餐/已评价)
  → cancelled (已取消)
```

---

## 五、视觉设计规范

### 5.1 色彩方案（暖橙食欲系）
```css
--primary: #FF6B35;        /* 主色 - 暖橙色 */
--primary-light: #FF8F5E;  /* 浅橙 */
--primary-dark: #E55A2B;   /* 深橙 */
--secondary: #FFC947;      /* 辅助色 - 暖黄 */
--bg: #FFF8F0;             /* 背景 - 暖白 */
--bg-gray: #F5F5F5;        /* 灰色背景 */
--text: #2D2D2D;           /* 主文字 */
--text-secondary: #999;    /* 次要文字 */
--text-light: #CCC;        /* 浅色文字 */
--price: #FF4D4F;          /* 价格红 */
--success: #52C41A;        /* 成功绿 */
--card-bg: #FFFFFF;        /* 卡片白 */
--divider: #F0F0F0;        /* 分割线 */
```

### 5.2 字体规范
- 标题: 32rpx bold
- 菜品名: 30rpx medium
- 描述: 24rpx regular, #999
- 价格: 32rpx bold, #FF4D4F
- 标签: 20rpx

### 5.3 间距规范
- 页面边距: 24rpx
- 卡片间距: 16rpx
- 卡片圆角: 16rpx
- 按钮圆角: 40rpx（胶囊型）

---

## 六、TabBar 配置

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#FF6B35",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "点餐",
        "iconPath": "assets/icons/menu.png",
        "selectedIconPath": "assets/icons/menu_active.png"
      },
      {
        "pagePath": "pages/order-list/order-list",
        "text": "订单",
        "iconPath": "assets/icons/order.png",
        "selectedIconPath": "assets/icons/order_active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "assets/icons/profile.png",
        "selectedIconPath": "assets/icons/profile_active.png"
      }
    ]
  }
}
```

---

## 七、API 接口设计

### 7.1 菜品相关
```
GET  /category/list         # 获取分类列表
GET  /dish/list?categoryId= # 获取分类下菜品
GET  /dish/detail?id=       # 菜品详情
GET  /dish/search?keyword=  # 搜索菜品
GET  /dish/recommended      # 推荐菜品
```

### 7.2 购物车相关
```
POST /cart/add              # 加入购物车
POST /cart/update           # 更新数量
POST /cart/clear            # 清空购物车
GET  /cart/list?userId=     # 获取购物车
```

### 7.3 订单相关
```
POST /order/create          # 创建订单
GET  /order/list?userId=    # 订单列表
GET  /order/detail?id=      # 订单详情
POST /order/cancel          # 取消订单
POST /order/confirm         # 确认取餐
```

### 7.4 用户相关
```
POST /user/login            # 登录
GET  /user/info?userId=     # 用户信息
GET  /user/favorites?userId=# 收藏列表
POST /user/favorite/toggle  # 收藏/取消
```

### 7.5 排队相关
```
POST /queue/join            # 加入排队
GET  /queue/status?userId=  # 排队状态
POST /queue/cancel          # 取消排队
```

---

## 八、项目结构

```
order-weapp/                  # 前端小程序
├── app.js
├── app.json
├── app.wxss
├── sitemap.json
├── DESIGN.md                 # 本文档
├── SPEC.md                   # 项目规范
├── assets/
│   └── icons/                # TabBar图标 (81x81 PNG)
├── components/               # 公共组件
│   ├── cart-bar/             # 购物车底部栏
│   ├── dish-card/            # 菜品卡片
│   ├── spec-modal/           # 规格选择弹窗
│   └── category-sidebar/     # 分类侧边栏
├── pages/                    # 页面 (12个)
│   ├── index/                # 点餐主页
│   ├── menu/                 # 全屏菜单
│   ├── cart/                 # 购物车
│   ├── order-confirm/        # 确认订单
│   ├── order-list/           # 订单列表
│   ├── order-detail/         # 订单详情
│   ├── dish-detail/          # 菜品详情
│   ├── profile/              # 我的
│   ├── favorites/            # 收藏
│   ├── table-scan/           # 扫码点餐
│   ├── queue/                # 排队叫号
│   └── settings/             # 设置
└── utils/
    ├── api.js                # API封装
    └── util.js               # 工具函数

order-weapp-server/           # 后端服务
├── server.js                 # 入口
├── db.js                     # 数据库层
├── routes/
│   ├── category.js           # 分类路由
│   ├── dish.js               # 菜品路由
│   ├── cart.js               # 购物车路由
│   ├── order.js              # 订单路由
│   ├── user.js               # 用户路由
│   └── queue.js              # 排队路由
└── db.json                   # 数据持久化
```

---

## 九、开发优先级

### Phase 1 - MVP核心 (本次)
1. ✅ 项目结构 + 设计文档
2. 菜品数据 + 分类 (后端)
3. 点餐主页（双栏布局 + 联动滚动）
4. 购物车功能（底部栏 + 展开 + 加减）
5. 规格选择弹窗
6. 订单确认 + 下单
7. 订单列表 + 详情

### Phase 2 - 体验优化
8. 搜索功能
9. 菜品详情页
10. 用户收藏
11. 桌号扫码绑定

### Phase 3 - 增值功能
12. 排队叫号
13. 优惠券系统
14. 会员积分
15. 多人点餐同步
