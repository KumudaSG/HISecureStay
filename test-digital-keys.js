const axios = require('axios');

// Test the digital keys API
async function testDigitalKeys() {
  try {
    console.log('Testing Digital Keys API...');
    
    // Test GET /api/properties/digital-keys/:walletAddress
    const response = await axios.get('http://localhost:3003/api/properties/digital-keys/demo-wallet-address');
    console.log('Digital Keys API Response:', JSON.stringify(response.data, null, 2));
    
    // Check if the response contains keys
    if (response.data.success && response.data.data.keys && response.data.data.keys.length > 0) {
      console.log(`Found ${response.data.data.keys.length} digital keys`);
      
      // Test the first key
      const firstKey = response.data.data.keys[0];
      console.log('First key details:', JSON.stringify(firstKey, null, 2));
      
      // Test access endpoint if there's a lockId
      if (firstKey.lockId) {
        console.log(`Testing access for lock ID: ${firstKey.lockId}`);
        try {
          const accessResponse = await axios.post(`http://localhost:3003/api/properties/access/${firstKey.lockId}`, {
            accessToken: firstKey.accessToken || firstKey.accessCode,
            walletAddress: 'demo-wallet-address'
          });
          console.log('Access API Response:', JSON.stringify(accessResponse.data, null, 2));
        } catch (accessError) {
          console.error('Error testing access API:', accessError.message);
        }
      }
    } else {
      console.log('No digital keys found in the response');
    }
  } catch (error) {
    console.error('Error testing Digital Keys API:', error.message);
  }
}

// Run the test
testDigitalKeys();
