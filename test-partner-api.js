// Test script for Partner API endpoints
const API_BASE = 'http://localhost:5000/api';

// Test 1: Send Partner OTP
async function testSendPartnerOTP() {
  console.log('Testing Send Partner OTP...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/send-partner-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.partner@example.com'
      })
    });
    
    const data = await response.json();
    console.log('Send OTP Response:', data);
    
    if (data.developmentOTP) {
      console.log('Development OTP:', data.developmentOTP);
      return data.developmentOTP;
    }
    
    return null;
  } catch (error) {
    console.error('Send OTP Error:', error);
    return null;
  }
}

// Test 2: Verify Partner OTP
async function testVerifyPartnerOTP(otp) {
  console.log('Testing Verify Partner OTP...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/verify-partner-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.partner@example.com',
        otp: otp
      })
    });
    
    const data = await response.json();
    console.log('Verify OTP Response:', data);
    return data.verificationToken;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return null;
  }
}

// Test 3: Register Partner
async function testRegisterPartner() {
  console.log('Testing Partner Registration...');
  
  try {
    const formData = new FormData();
    formData.append('name', 'Test Partner');
    formData.append('email', 'test.partner@example.com');
    formData.append('phone', '9876543210');
    formData.append('password', 'testpassword123');
    formData.append('otp', '123456'); // This would be the actual OTP
    
    // Shop Details
    formData.append('shopName', 'Test Electronics Store');
    formData.append('ownerName', 'Test Owner');
    formData.append('description', 'A test electronics store');
    formData.append('category', 'electronics');
    
    // Address
    formData.append('street', '123 Test Street');
    formData.append('area', 'Test Area');
    formData.append('city', 'Test City');
    formData.append('pincode', '123456');
    formData.append('state', 'Test State');
    formData.append('country', 'India');
    
    // Location
    formData.append('latitude', '28.6139');
    formData.append('longitude', '77.2090');
    
    // Contact
    formData.append('contactNumber', '9876543210');
    formData.append('whatsappNumber', '9876543210');
    
    // Timing
    formData.append('openTime', '09:00');
    formData.append('closeTime', '21:00');
    formData.append('workingDays', JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']));
    formData.append('isOpen24x7', 'false');
    
    const response = await fetch(`${API_BASE}/partners/register`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('Partner Registration Response:', data);
    return data;
  } catch (error) {
    console.error('Partner Registration Error:', error);
    return null;
  }
}

// Test 4: Get Partner Stores (Public)
async function testGetPartnerStores() {
  console.log('Testing Get Partner Stores...');
  
  try {
    const response = await fetch(`${API_BASE}/partners/stores?page=1&limit=5`);
    const data = await response.json();
    console.log('Partner Stores Response:', data);
    return data;
  } catch (error) {
    console.error('Get Partner Stores Error:', error);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('=== Partner API Tests ===\n');
  
  // Test 1: Send OTP
  const otp = await testSendPartnerOTP();
  console.log('\n---\n');
  
  if (otp) {
    // Test 2: Verify OTP
    const verificationToken = await testVerifyPartnerOTP(otp);
    console.log('\n---\n');
  }
  
  // Test 3: Register Partner (will likely fail without valid OTP)
  await testRegisterPartner();
  console.log('\n---\n');
  
  // Test 4: Get Partner Stores
  await testGetPartnerStores();
  console.log('\n---\n');
  
  console.log('=== Tests Complete ===');
}

// Run tests when this script is executed in browser console
if (typeof window !== 'undefined') {
  window.runPartnerTests = runTests;
  console.log('Partner tests loaded. Run window.runPartnerTests() to execute.');
} else {
  // Node.js environment
  runTests();
}