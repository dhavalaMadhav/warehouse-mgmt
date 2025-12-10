import api from './api';
import { useStore } from '../store/useStore';

export const logAudit = async (action, details) => {
  const { user } = useStore.getState();
  
  try {
    await api.post('/audit-logs', {
      userId: user?.id,
      userName: user?.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: await getClientIP(),
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};

async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Usage examples:
// await logAudit('INVENTORY_ADJUSTMENT', { itemId: 123, oldQty: 50, newQty: 45 });
// await logAudit('BIN_TRANSFER', { itemCode: 'LAP-001', fromBin: 'A1', toBin: 'B3' });
// await logAudit('USER_LOGIN', { method: 'PASSWORD' });
