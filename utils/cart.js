/**
 * 购物车相关公共工具函数
 * 消除 index.js、dish-detail.js、favorites.js、search.js 中的重复代码
 */

/**
 * 计算含规格和加料的最终价格
 */
function calcDishPrice(dish, selectedSpec, selectedAddons) {
  let price = dish.price
  if (dish.specs) {
    for (const s of dish.specs) {
      const opt = s.options.find(o => o.name === selectedSpec)
      if (opt) { price = opt.price; break }
    }
  }
  if (selectedAddons && dish.addons) {
    for (const a of selectedAddons) {
      const addon = dish.addons.find(ad => ad.name === a)
      if (addon) price += addon.price
    }
  }
  return price
}

/**
 * 构建加入购物车的数据对象
 */
function buildCartItem(dish, spec, addons, note, price) {
  return {
    dishId: dish.id,
    name: dish.name,
    image: dish.image || '',
    spec: spec || '',
    addons: addons || [],
    note: note || '',
    price,
    quantity: 1
  }
}

/**
 * 快速加入购物车（无规格菜品）
 */
function quickAddToCart(app, dish) {
  const item = buildCartItem(dish, '', [], '', dish.price)
  app.addToCart(item)
}

/**
 * 有规格的菜品加入购物车
 */
function specAddToCart(app, dish, selectedSpec, selectedAddons, note) {
  const price = calcDishPrice(dish, selectedSpec, selectedAddons)
  const item = buildCartItem(dish, selectedSpec, selectedAddons, note, price)
  app.addToCart(item)
}

/**
 * 判断菜品是否有规格可选
 */
function hasSpecs(dish) {
  return dish.specs && dish.specs.length > 0
}

/**
 * 获取默认选中的规格名
 */
function getDefaultSpec(dish) {
  return hasSpecs(dish) && dish.specs[0].options[0] ? dish.specs[0].options[0].name : ''
}

module.exports = { calcDishPrice, buildCartItem, quickAddToCart, specAddToCart, hasSpecs, getDefaultSpec }
