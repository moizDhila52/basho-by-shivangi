export async function triggerNotification(userId, eventName, payload) {
  console.log('🔄 DEBUG - triggerNotification called:', {
    userId,
    eventName,
    payload
  });
  
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/io`;
    console.log('📡 DEBUG - Calling URL:', url);
    
    const response = await fetch(url, {  // ✅ Define response here
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        event: eventName,
        data: payload,
      }),
    });
    
    const result = await response.json();
    console.log('✅ DEBUG - Socket response:', result);
    return result;
  } catch (error) {
    console.error('❌ DEBUG - Socket trigger failed:', error);
    throw error;  // ✅ Throw error instead of using undefined 'response'
  }
}

export async function broadcastStockUpdate(productId, newStock) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/io`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'BROADCAST_ALL',
        event: 'stock-update',
        data: { productId, stock: newStock },
      }),
    });
  } catch (error) {
    console.error('Failed to broadcast stock update:', error);
  }
}

export async function notifyAdminNewOrder(orderData) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/io`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'BROADCAST_ALL',
        event: 'admin:new-order',
        data: orderData,
      }),
    });
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
}