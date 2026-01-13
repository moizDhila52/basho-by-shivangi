// lib/socketTrigger.js

export async function triggerNotification(userId, eventName, payload) {
  try {
    // Call the internal bridge we made in server.js
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        event: eventName,
        data: payload,
      }),
    });
  } catch (error) {
    console.error("Failed to trigger socket notification:", error);
  }
}


export async function broadcastStockUpdate(productId, newStock) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "BROADCAST_ALL", // Special flag for the backend
        event: "stock-update",
        data: { productId, stock: newStock },
      }),
    });
  } catch (error) {
    console.error("Failed to broadcast stock update:", error);
  }
}

export async function notifyAdminNewOrder(orderData) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "BROADCAST_ALL", // Or use "ADMIN_ROOM" if you implement rooms
        event: "admin:new-order",
        data: orderData,
      }),
    });
  } catch (error) {
    console.error("Failed to notify admin:", error);
  }
}