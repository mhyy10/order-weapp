/**
 * 业务常量配置
 * 集中管理所有魔法数字，便于维护和修改
 */

module.exports = {
  // 折扣规则
  DISCOUNT_THRESHOLD: 100,    // 满减门槛（元）
  DISCOUNT_AMOUNT: 5,         // 满减金额（元）

  // 服务费
  SERVICE_FEE_PER_PERSON: 3,  // 堂食每人服务费（元）

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

  // 用餐方式
  DINE_TYPE: {
    DINE_IN: 'dine_in',
    TAKEAWAY: 'takeaway'
  },

  // 搜索
  SEARCH_DEBOUNCE_MS: 300,
  SCROLL_THROTTLE_MS: 100,

  // 分页
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50
}
