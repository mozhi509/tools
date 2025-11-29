const { testRedisConnection } = require('./dist/redis');

async function testConnection() {
  console.log('Testing Redis connection...');
  
  const isConnected = await testRedisConnection();
  
  if (isConnected) {
    console.log('✅ Redis connection successful!');
    process.exit(0);
  } else {
    console.log('❌ Redis connection failed!');
    console.log('Please check that Redis is running and accessible.');
    process.exit(1);
  }
}

testConnection().catch(console.error);