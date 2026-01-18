// test-socket.js
const fetch = require('node-fetch');

async function testSocket() {
  try {
    const response = await fetch('http://localhost:3000/api/socket/io', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        event: 'notification',
        data: { title: 'Test', message: 'Testing socket' }
      }),
    });
    
    const result = await response.json();
    console.log('Socket test result:', result);
  } catch (error) {
    console.error('Socket test error:', error);
  }
}

testSocket();