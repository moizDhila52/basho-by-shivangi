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