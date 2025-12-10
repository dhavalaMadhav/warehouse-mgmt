import api from './api';

/**
 * Smart bin suggestion algorithm
 * Considers: FIFO/FEFO, item category, available capacity, zone proximity
 */
export const suggestBin = async (item, quantity, strategy = 'FIFO') => {
  try {
    const { data: locations } = await api.get('/locations?type=BIN&active=true');
    const { data: inventory } = await api.get('/inventory');

    // Filter bins with enough capacity
    const availableBins = locations.filter(bin => {
      const currentQty = inventory
        .filter(inv => inv.locationId === bin.id)
        .reduce((sum, inv) => sum + (inv.quantity || 0), 0);
      return (bin.maxCapacity || 1000) - currentQty >= quantity;
    });

    if (availableBins.length === 0) {
      throw new Error('No bins with sufficient capacity');
    }

    let suggestedBin;

    switch (strategy) {
      case 'FIFO': // First In First Out
        suggestedBin = suggestFIFO(availableBins, item, inventory);
        break;
      
      case 'FEFO': // First Expired First Out
        suggestedBin = suggestFEFO(availableBins, item, inventory);
        break;
      
      case 'CATEGORY': // Group similar items
        suggestedBin = suggestByCategory(availableBins, item, inventory);
        break;
      
      case 'PROXIMITY': // Closest to packing station
        suggestedBin = suggestByProximity(availableBins);
        break;
      
      default:
        suggestedBin = availableBins[0];
    }

    return {
      bin: suggestedBin,
      reason: getReasonText(strategy, suggestedBin),
      alternatives: availableBins.slice(0, 3).filter(b => b.id !== suggestedBin.id),
    };
  } catch (err) {
    console.error('Bin suggestion failed:', err);
    return null;
  }
};

function suggestFIFO(bins, item, inventory) {
  // Find bins with same item, pick oldest stock location
  const binsWithSameItem = bins.filter(bin =>
    inventory.some(inv => inv.locationId === bin.id && inv.itemId === item.id)
  );

  if (binsWithSameItem.length > 0) {
    return binsWithSameItem[0]; // Use existing location
  }

  // Otherwise, pick empty bin or least utilized
  return bins.sort((a, b) => {
    const aUtil = inventory.filter(inv => inv.locationId === a.id).length;
    const bUtil = inventory.filter(inv => inv.locationId === b.id).length;
    return aUtil - bUtil;
  })[0];
}

function suggestFEFO(bins, item, inventory) {
  // Similar to FIFO but considers expiry dates
  const binsWithSameItem = bins.filter(bin =>
    inventory.some(inv => 
      inv.locationId === bin.id && 
      inv.itemId === item.id && 
      inv.expiryDate
    )
  );

  if (binsWithSameItem.length > 0) {
    // Pick bin with earliest expiry
    return binsWithSameItem.sort((a, b) => {
      const aExpiry = inventory.find(inv => inv.locationId === a.id)?.expiryDate;
      const bExpiry = inventory.find(inv => inv.locationId === b.id)?.expiryDate;
      return new Date(aExpiry) - new Date(bExpiry);
    })[0];
  }

  return bins[0];
}

function suggestByCategory(bins, item, inventory) {
  // Find bins with same category items
  const binsWithSameCategory = bins.filter(bin =>
    inventory.some(inv => 
      inv.locationId === bin.id && 
      inv.item?.category === item.category
    )
  );

  return binsWithSameCategory[0] || bins[0];
}

function suggestByProximity(bins) {
  // Assume packing station is at coordinates {x: 0, y: 0, z: 0}
  return bins.sort((a, b) => {
    const aDist = Math.sqrt(
      Math.pow(a.coordinates?.x || 0, 2) +
      Math.pow(a.coordinates?.y || 0, 2) +
      Math.pow(a.coordinates?.z || 0, 2)
    );
    const bDist = Math.sqrt(
      Math.pow(b.coordinates?.x || 0, 2) +
      Math.pow(b.coordinates?.y || 0, 2) +
      Math.pow(b.coordinates?.z || 0, 2)
    );
    return aDist - bDist;
  })[0];
}

function getReasonText(strategy, bin) {
  const reasons = {
    FIFO: `Maintains first-in-first-out order`,
    FEFO: `Earliest expiry items picked first`,
    CATEGORY: `Groups similar items together`,
    PROXIMITY: `Shortest distance to packing station`,
  };
  return reasons[strategy] || 'Best available capacity';
}
