const bcrypt = require('bcryptjs');

async function testUser() {
    const hashedPassword = await bcrypt.hash('test123', 10);
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('Hashed Password:', hashedPassword);
}

testUser();