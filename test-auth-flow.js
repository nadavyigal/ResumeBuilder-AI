const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...');
  
  try {
    // Test login page
    console.log('1. Testing login page...');
    const loginResponse = await fetch('http://localhost:3003/login');
    console.log('Login page status:', loginResponse.status);
    
    if (loginResponse.status === 200) {
      const loginContent = await loginResponse.text();
      console.log('Login page contains email field:', loginContent.includes('email'));
      console.log('Login page contains password field:', loginContent.includes('password'));
    }
    
    // Test signup page
    console.log('\n2. Testing signup page...');
    const signupResponse = await fetch('http://localhost:3003/signup');
    console.log('Signup page status:', signupResponse.status);
    
    if (signupResponse.status === 200) {
      const signupContent = await signupResponse.text();
      console.log('Signup page contains email field:', signupContent.includes('email'));
      console.log('Signup page contains password field:', signupContent.includes('password'));
    }
    
    // Test dashboard (should redirect to login if not authenticated)
    console.log('\n3. Testing dashboard...');
    const dashboardResponse = await fetch('http://localhost:3003/dashboard');
    console.log('Dashboard status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 200) {
      const dashboardContent = await dashboardResponse.text();
      console.log('Dashboard contains login redirect:', dashboardContent.includes('login'));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow(); 