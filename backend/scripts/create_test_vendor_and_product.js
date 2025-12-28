(async ()=>{
  try{
    const base = 'http://localhost:5000/api';
    const email = 'vendor_test@example.com';
    const password = 'TestPass123!';
    const name = 'Test Vendor';
    // send email otp
    let res = await fetch(`${base}/auth/send-email-otp`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const sendJson = await res.json();
    console.log('send-email-otp response:', sendJson);
    const otp = sendJson.developmentOTP || sendJson.otp || null;
    if(!otp){
      console.error('No development OTP returned. Aborting.');
      process.exit(1);
    }
    console.log('Using OTP:', otp);
    // verify and register
    res = await fetch(`${base}/auth/verify-email-otp-register`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name, password, phone: '+911234567890', role: 'vendor' })
    });
    const verifyJson = await res.json();
    console.log('verify response:', verifyJson);
    if(!verifyJson.success){
      console.error('Verify failed', verifyJson);
      process.exit(1);
    }
    // login
    res = await fetch(`${base}/auth/login`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginJson = await res.json();+
    console.log('login response:', loginJson);
    const token = loginJson.token;
    if(!token){
      console.error('Login failed, no token');
      process.exit(1);
    }
    // create product
    const product = { title: 'Test Product from script', description: 'Script created product', price: 199, stock: 10, category: 'testing' };
    res = await fetch(`${base}/products`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(product)
    });
    const productJson = await res.json();
    console.log('create product response:', productJson);
    process.exit(0);
  }catch(e){
    console.error('Script error', e);
    process.exit(1);
  }
})();
