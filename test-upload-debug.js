const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUploadFlow() {
  console.log('🧪 Testing upload flow...');
  
  try {
    // First, let's check if we can access the upload page
    console.log('1. Testing access to upload page...');
    const uploadPageResponse = await fetch('http://localhost:3003/resumes/new');
    console.log('Upload page status:', uploadPageResponse.status);
    console.log('Upload page content type:', uploadPageResponse.headers.get('content-type'));
    
    if (uploadPageResponse.status === 200) {
      const uploadPageContent = await uploadPageResponse.text();
      console.log('Upload page contains upload form:', uploadPageContent.includes('upload'));
      console.log('Upload page contains file input:', uploadPageContent.includes('file'));
      console.log('Upload page contains login redirect:', uploadPageContent.includes('login'));
      console.log('Upload page contains signup redirect:', uploadPageContent.includes('signup'));
    }
    
    // Test the upload API directly with a simple file
    console.log('\n2. Testing upload API...');
    const formData = new FormData();
    
    // Create a simple test file
    const testContent = 'Test resume content\nName: John Doe\nEmail: john@example.com\nExperience: Software Engineer at Tech Corp';
    formData.append('file', Buffer.from(testContent), {
      filename: 'test-resume.txt',
      contentType: 'text/plain'
    });
    
    const uploadResponse = await fetch('http://localhost:3003/api/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log('Upload API status:', uploadResponse.status);
    console.log('Upload API content type:', uploadResponse.headers.get('content-type'));
    
    const uploadContent = await uploadResponse.text();
    console.log('Upload API response length:', uploadContent.length);
    console.log('Upload API response starts with:', uploadContent.substring(0, 200));
    
    if (uploadResponse.status === 200 && uploadContent.includes('<!DOCTYPE html>')) {
      console.log('⚠️ Upload API is returning HTML instead of JSON - likely authentication issue');
    }
    
    // Test authentication endpoint
    console.log('\n3. Testing authentication...');
    const authResponse = await fetch('http://localhost:3003/api/auth/user');
    console.log('Auth API status:', authResponse.status);
    
    // Test the home page to see if it's accessible
    console.log('\n4. Testing home page...');
    const homeResponse = await fetch('http://localhost:3003/');
    console.log('Home page status:', homeResponse.status);
    
    if (homeResponse.status === 200) {
      const homeContent = await homeResponse.text();
      console.log('Home page contains login form:', homeContent.includes('login'));
      console.log('Home page contains signup form:', homeContent.includes('signup'));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUploadFlow(); 