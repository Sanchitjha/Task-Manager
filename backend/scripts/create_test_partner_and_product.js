(async ()=>{
  try{
    const base = 'http://localhost:5000/api';
    const email = 'vendor_test@example.com';
    const password = 'TestPass123!';
    const name = 'Test Vendor';
    
    // Register partner directly
    let res = await fetch(`${base}/auth/register`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: 'partner' })
    });
    const registerJson = await res.json();
    console.log('register response:', registerJson);
    if(!registerJson.id){
      console.error('Registration failed', registerJson);
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
