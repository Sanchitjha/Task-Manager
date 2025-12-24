const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login API...');
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'Jha1947.sj@gmail.com',
            password: 'Sm@522002'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ Login failed!');
        console.log('Status:', error.response?.status || 'Unknown');
        console.log('Error:', error.response?.data || error.message);
    }
}

testLogin();