import api from './api';

/**
 * Predict when item will run out of stock
 * Uses simple linear regression on historical consumption
 */
export const predictStockout = async (itemId) => {
  try {
    const { data: movements } = await api.get(`/rfid-movements?itemId=${itemId}`);
    
    if (movements.length < 7) {
      return { daysUntilStockout: null, confidence: 'low' };
    }

    // Get daily consumption for last 30 days
    const dailyConsumption = calculateDailyConsumption(movements);
    const avgDaily = dailyConsumption.reduce((a, b) => a + b, 0) / dailyConsumption.length;

    // Get current stock
    const { data: inventory } = await api.get(`/inventory?itemId=${itemId}`);
    const currentStock = inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);

    if (avgDaily === 0) {
      return { daysUntilStockout: null, confidence: 'low' };
    }

    const daysUntilStockout = Math.floor(currentStock / avgDaily);

    return {
      daysUntilStockout,
      currentStock,
      avgDailyConsumption: avgDaily.toFixed(2),
      confidence: dailyConsumption.length >= 30 ? 'high' : 'medium',
      recommendedReorderQty: Math.ceil(avgDaily * 30), // 30-day supply
    };
  } catch (err) {
    console.error('Stock prediction failed:', err);
    return null;
  }
};

function calculateDailyConsumption(movements) {
  const last30Days = movements.filter(m => {
    const date = new Date(m.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo && m.movementType === 'OUT';
  });

  const dailyMap = {};
  last30Days.forEach(m => {
    const day = new Date(m.createdAt).toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + (m.quantity || 0);
  });

  return Object.values(dailyMap);
}

/**
 * Auto-create Purchase Order for low-stock items
 */
export const autoCreatePO = async (itemId, quantity) => {
  try {
    const { data } = await api.post('/purchase-orders/auto-create', {
      itemId,
      quantity,
      reason: 'AI_LOW_STOCK_PREDICTION',
      requestedBy: 'SYSTEM',
    });

    return data;
  } catch (err) {
    console.error('Auto PO creation failed:', err);
    return null;
  }
};
