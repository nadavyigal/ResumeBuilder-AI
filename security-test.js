// Security Testing Script for ResumeBuilder AI
// Test various security scenarios

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test cases for security validation
const securityTests = [
  {
    name: 'CORS Wildcard Test',
    method: 'OPTIONS',
    path: '/api/generate',
    headers: {
      'Origin': 'https://malicious-site.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type'
    },
    expectPass: false,
    description: 'Should reject malicious origins'
  },
  {
    name: 'SQL Injection Test',
    method: 'POST',
    path: '/api/generate',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume: "'; DROP TABLE users; --",
      jobDescription: "test"
    }),
    expectPass: false,
    description: 'Should sanitize SQL injection attempts'
  },
  {
    name: 'XSS Test',
    method: 'POST',
    path: '/api/generate',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume: "<script>alert('xss')</script>",
      jobDescription: "test"
    }),
    expectPass: false,
    description: 'Should sanitize XSS attempts'
  },
  {
    name: 'Large Payload Test',
    method: 'POST',
    path: '/api/generate',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume: 'A'.repeat(20000), // Exceeds 10k limit
      jobDescription: 'test'
    }),
    expectPass: false,
    description: 'Should reject oversized payloads'
  },
  {
    name: 'Invalid JSON Test',
    method: 'POST',
    path: '/api/generate',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid json}',
    expectPass: false,
    description: 'Should handle malformed JSON gracefully'
  }
];

async function runSecurityTest(test) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    
    const url = new URL(test.path, BASE_URL);
    const options = {
      method: test.method,
      headers: test.headers || {},
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        // Check for sensitive information disclosure
        const sensitivePatterns = [
          /password/i,
          /api.?key/i,
          /secret/i,
          /database/i,
          /connection.?string/i,
          /stack.?trace/i,
          /file.?path/i
        ];
        
        const hasSensitiveInfo = sensitivePatterns.some(pattern => 
          pattern.test(data) || pattern.test(JSON.stringify(res.headers))
        );
        
        if (hasSensitiveInfo) {
          console.log('⚠️  SECURITY ISSUE: Response contains sensitive information');
          console.log('📄 Response preview:', data.substring(0, 200));
        }
        
        // Check CORS headers
        if (test.name.includes('CORS')) {
          const corsOrigin = res.headers['access-control-allow-origin'];
          if (corsOrigin === '*') {
            console.log('🚨 CRITICAL: CORS allows all origins (*)');
          } else {
            console.log('✅ CORS origin restriction:', corsOrigin);
          }
        }
        
        resolve({
          test: test.name,
          status: res.statusCode,
          passed: test.expectPass ? res.statusCode < 400 : res.statusCode >= 400,
          hasSensitiveInfo,
          response: data.substring(0, 500)
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({
        test: test.name,
        status: 'ERROR',
        passed: false,
        error: err.message
      });
    });

    if (test.body) {
      req.write(test.body);
    }
    
    req.end();
  });
}

async function runAllSecurityTests() {
  console.log('🔒 Starting ResumeBuilder AI Security Test Suite');
  console.log('=' .repeat(50));
  
  const results = [];
  
  for (const test of securityTests) {
    const result = await runSecurityTest(test);
    results.push(result);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SECURITY TEST SUMMARY');
  console.log('='.repeat(50));
  
  let passedTests = 0;
  let failedTests = 0;
  let criticalIssues = 0;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.test}`);
    
    if (result.passed) {
      passedTests++;
    } else {
      failedTests++;
    }
    
    if (result.hasSensitiveInfo) {
      criticalIssues++;
      console.log('  🚨 Contains sensitive information');
    }
  });
  
  console.log('\n📈 FINAL RESULTS:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`🚨 Critical Issues: ${criticalIssues}`);
  
  if (criticalIssues > 0) {
    console.log('\n⚠️  SECURITY RECOMMENDATIONS:');
    console.log('1. Fix CORS wildcard configuration');
    console.log('2. Review error response sanitization');
    console.log('3. Implement proper input validation');
    console.log('4. Add security headers validation');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllSecurityTests().catch(console.error);
}

module.exports = { runAllSecurityTests, securityTests };