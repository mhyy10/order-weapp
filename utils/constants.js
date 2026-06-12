/**
 * 业务常量配置
 */

module.exports = {
  // 折扣规则
  DISCOUNT_THRESHOLD: 100,
  DISCOUNT_AMOUNT: 5,

  // 服务费
  SERVICE_FEE_PER_PERSON: 3,

  // 人数限制
  MIN_PEOPLE_COUNT: 1,
  MAX_PEOPLE_COUNT: 50,

  // 订单状态
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // 订单列表筛选 Tab
  ORDER_TABS: [
    { key: '', label: '全部' },
    { key: 'pending', label: '待接单' },
    { key: 'confirmed', label: '制作中' },
    { key: 'ready', label: '待取餐' },
    { key: 'delivering', label: '配送中' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ],

  // 用餐方式映射
  DINE_TYPE_MAP: { dine_in: '堂食', takeaway: '自提', delivery: '配送' },

  // 用餐方式
  DINE_TYPE: {
    DINE_IN: 'dine_in',
    TAKEAWAY: 'takeaway',
    DELIVERY: 'delivery'
  },

  // 优惠券类型
  COUPON_TYPE: {
    REDUCTION: 'reduction',  // 满减
    DISCOUNT: 'discount'     // 折扣
  },

  // 搜索
  SEARCH_DEBOUNCE_MS: 300,
  SCROLL_THROTTLE_MS: 100,

  // 分页
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50
}
