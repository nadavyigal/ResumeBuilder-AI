// File Upload Security Test Script
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Create test files for security testing
const testFiles = [
  {
    name: 'oversized.pdf',
    content: Buffer.alloc(15 * 1024 * 1024, 'A'), // 15MB - exceeds 10MB limit
    mimeType: 'application/pdf'
  },
  {
    name: 'malicious.exe',
    content: 'MZ\x90\x00\x03\x00\x00\x00', // Executable header
    mimeType: 'application/octet-stream'
  },
  {
    name: 'script.pdf',
    content: '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>\nendobj\n4 0 obj<</Length 44>>\nstream\nBT\n/F1 12 Tf\n100 100 Td\n(<script>alert("XSS")</script>) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000207 00000 n\ntrailer\n<</Size 5/Root 1 0 R>>\nstartxref\n301\n%%EOF',
    mimeType: 'application/pdf'
  },
  {
    name: 'empty.pdf',
    content: '',
    mimeType: 'application/pdf'
  }
];

async function testFileUpload(testFile) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing file upload: ${testFile.name}`);
    
    const form = new FormData();
    form.append('file', testFile.content, {
      filename: testFile.name,
      contentType: testFile.mimeType
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        // Check for proper error handling
        if (res.statusCode >= 400) {
          console.log('✅ File properly rejected');
        } else {
          console.log('❌ File was accepted (potential security issue)');
        }
        
        // Check for sensitive information in response
        const sensitivePatterns = [
          /path/i,
          /directory/i,
          /file.*system/i,
          /temp/i,
          /upload.*folder/i
        ];
        
        const hasSensitiveInfo = sensitivePatterns.some(pattern => 
          pattern.test(data)
        );
        
        if (hasSensitiveInfo) {
          console.log('⚠️  SECURITY ISSUE: Response may contain sensitive file path information');
          console.log('📄 Response:', data.substring(0, 200));
        }
        
        resolve({
          file: testFile.name,
          status: res.statusCode,
          accepted: res.statusCode < 400,
          hasSensitiveInfo
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({
        file: testFile.name,
        status: 'ERROR',
        accepted: false,
        error: err.message
      });
    });

    form.pipe(req);
  });
}

async function runFileUploadTests() {
  console.log('📁 Starting File Upload Security Tests');
  console.log('=' .repeat(40));
  
  const results = [];
  
  for (const testFile of testFiles) {
    const result = await testFileUpload(testFile);
    results.push(result);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('📊 FILE UPLOAD TEST SUMMARY');
  console.log('='.repeat(40));
  
  let properlyRejected = 0;
  let improperlyCepted = 0;
  let sensitiveInfoLeaks = 0;
  
  results.forEach(result => {
    if (result.accepted) {
      console.log(`❌ FAIL ${result.file} - Improperly accepted`);
      improperlyCepted++;
    } else {
      console.log(`✅ PASS ${result.file} - Properly rejected`);
      properlyRejected++;
    }
    
    if (result.hasSensitiveInfo) {
      sensitiveInfoLeaks++;
      console.log('  🚨 Contains sensitive information');
    }
  });
  
  console.log('\n📈 FINAL RESULTS:');
  console.log(`✅ Properly rejected: ${properlyRejected}`);
  console.log(`❌ Improperly accepted: ${improperlyCepted}`);
  console.log(`🚨 Sensitive info leaks: ${sensitiveInfoLeaks}`);
  
  if (improperlyCepted > 0 || sensitiveInfoLeaks > 0) {
    console.log('\n⚠️  SECURITY RECOMMENDATIONS:');
    console.log('1. Review file type validation');
    console.log('2. Check file size enforcement');
    console.log('3. Sanitize error responses');
    console.log('4. Implement file content scanning');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runFileUploadTests().catch(console.error);
}

module.exports = { runFileUploadTests, testFiles };