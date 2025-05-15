import fetch from 'node-fetch';

async function testRecaptcha() {
  try {
    const secretKey = '6LfVvTkrAAAAALsfE_Nam_nLoynouTsv3nJ5SUUY'; // Tumhara secret key
    const token = '03AGdBq27xYvZ5z8kLmNpQrStUvWxYz...'; // Yahan naya token paste karo
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('Response:', data); // Output dekhan ke liye
  } catch (error) {
    console.error('Error:', error); // Agar error ho toh dikhega
  }
}

testRecaptcha();