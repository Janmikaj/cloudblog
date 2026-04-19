async function testRegister() {
  try {
    const response = await fetch('http://localhost:5001/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser' + Math.floor(Math.random()*1000),
        email: 'test' + Math.floor(Math.random()*1000) + '@example.com',
        password: 'Password123',
        role: 'user'
      })
    });
    const data = await response.json();
    console.log(response.status, data);
  } catch (err) {
    console.error(err);
  }
}
testRegister();
