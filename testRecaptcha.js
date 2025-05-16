import fetch from 'node-fetch';

async function testRecaptcha() {
  try {
    const secretKey = '6LcUJD0rAAAAAGeGDJ6q7hmDyYW0-d8rsX8Ax6nx6LcUJD0rAAAAAGk3dx5UDJebABXvc-1YNjUA9Nwm'; // Tumhara secret key
    const token = ''; // Yahan naya token paste karo
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