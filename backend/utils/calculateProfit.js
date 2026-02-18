const Order = require('../models/Order');
const Product = require('../models/Product');

const calculateProfit = async (clientId, startDate, endDate) => {
  const query = { clientId, paymentStatus: 'paid' };
  if (startDate && endDate) {
    query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const orders = await Order.find(query);
  let totalRevenue = 0;
  let totalCost = 0;

  for (const order of orders) {
    totalRevenue += order.totalAmount - order.discount;
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        totalCost += product.costPrice * item.quantity;
      }
    }
  }

  return {
    totalRevenue,
    totalCost,
    profit: totalRevenue - totalCost,
    orderCount: orders.length,
  };
};

module.exports = { calculateProfit };
