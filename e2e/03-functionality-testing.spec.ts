import { test, expect } from '@playwright/test';
import { TestUtils } from './helpers/test-utils';

test.describe('Application Functionality Testing', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test('should test template gallery functionality', async ({ page }) => {
    console.log('\n🎨 Testing Template Gallery');
    
    const consoleLogs = await testUtils.startConsoleMonitoring();
    const networkMonitoring = await testUtils.startNetworkMonitoring();

    try {
      await page.goto('/templates');
      await testUtils.waitForPageReady();

      // Check if templates page loads
      const title = await page.title();
      console.log(`Templates page title: ${title}`);

      // Look for template cards or similar elements
      const templateElements = await page.locator('[data-testid*="template"], .template-card, .template-item').count();
      console.log(`Template elements found: ${templateElements}`);

      if (templateElements === 0) {
        // Try alternative selectors
        const alternativeTemplates = await page.locator('img, .card, .grid > div').count();
        console.log(`Alternative template elements: ${alternativeTemplates}`);
      }

      // Check for loading states or error messages
      const hasLoadingState = await testUtils.elementExists('text=Loading') || 
                              await testUtils.elementExists('[data-testid="loading"]');
      console.log(`Has loading state: ${hasLoadingState}`);

      // Check for error messages
      const hasErrorMessage = await testUtils.elementExists('text=Error') ||
                              await testUtils.elementExists('text=Failed to load');
      console.log(`Has error message: ${hasErrorMessage}`);

      // Test template interaction if any templates exist
      if (templateElements > 0) {
        const firstTemplate = page.locator('[data-testid*="template"], .template-card, .template-item').first();
        
        if (await firstTemplate.isVisible()) {
          await firstTemplate.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          console.log(`After template click: ${newUrl}`);
          
          // Check if modal opened or navigation occurred
          const hasModal = await testUtils.elementExists('[role="dialog"], .modal, .popup');
          console.log(`Modal opened: ${hasModal}`);
        }
      }

      await testUtils.takeScreenshot('templates-page');

      // Check for console errors
      const errors = consoleLogs.filter(log => log.includes('[ERROR]'));
      if (errors.length > 0) {
        console.log('Template page errors:', errors);
      }

    } catch (error) {
      console.log(`❌ Template gallery test failed: ${error}`);
    }
  });

  test('should test signup form functionality', async ({ page }) => {
    console.log('\n📝 Testing Signup Form');
    
    await page.goto('/signup');
    await testUtils.waitForPageReady();

    // Get form structure
    const formFields = await testUtils.getFormFields();
    console.log('Signup form structure:', {
      inputCount: formFields.inputs.length,
      buttonCount: formFields.buttons.length,
      inputs: formFields.inputs.map(input => ({
        type: input.type,
        name: input.name,
        required: input.required
      }))
    });

    // Test form validation
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      // Try submitting empty form
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      console.log('Empty form submission attempted');
    }

    // Fill form with test data
    const emailInput = page.locator('input[type="email"], #email');
    const passwordInput = page.locator('input[type="password"], #password');
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('testuser@example.com');
      await passwordInput.fill('testpassword123');
      
      console.log('Form filled with test data');
      
      // Check if submit button becomes enabled
      const isEnabled = await submitButton.isEnabled();
      console.log(`Submit button enabled: ${isEnabled}`);
    }

    await testUtils.takeScreenshot('signup-form');
  });

  test('should test file upload functionality (if accessible)', async ({ page }) => {
    console.log('\n📄 Testing File Upload');
    
    // Try to access upload functionality
    const uploadRoutes = ['/resumes/new', '/upload', '/dashboard'];
    
    for (const route of uploadRoutes) {
      try {
        await page.goto(route);
        await testUtils.waitForPageReady();
        
        // Look for file input elements
        const fileInputs = await page.locator('input[type="file"]').count();
        console.log(`${route}: File inputs found: ${fileInputs}`);
        
        if (fileInputs > 0) {
          const fileInput = page.locator('input[type="file"]').first();
          
          // Check if file input is functional
          const isVisible = await fileInput.isVisible();
          const isEnabled = await fileInput.isEnabled();
          
          console.log(`File input - Visible: ${isVisible}, Enabled: ${isEnabled}`);
          
          // Check for drag & drop areas
          const dropZones = await page.locator('[data-testid*="drop"], .drop-zone, .upload-area').count();
          console.log(`Drop zones found: ${dropZones}`);
          
          await testUtils.takeScreenshot(`upload-${route.replace('/', '')}`);
          break; // Found upload functionality
        }
      } catch (error) {
        console.log(`Could not access ${route}: ${error}`);
      }
    }
  });

  test('should test dashboard functionality (if accessible)', async ({ page }) => {
    console.log('\n📊 Testing Dashboard');
    
    try {
      await page.goto('/dashboard');
      await testUtils.waitForPageReady();
      
      const currentUrl = page.url();
      console.log(`Dashboard URL: ${currentUrl}`);
      
      if (currentUrl.includes('/login')) {
        console.log('Redirected to login - dashboard requires authentication');
        return;
      }
      
      // Check for dashboard elements
      const dashboardElements = {
        cards: await page.locator('.card, [data-testid*="card"]').count(),
        buttons: await page.locator('button').count(),
        links: await page.locator('a').count(),
        forms: await page.locator('form').count()
      };
      
      console.log('Dashboard elements:', dashboardElements);
      
      // Look for resume-related functionality
      const resumeElements = await page.locator('text=resume, text=Resume, [data-testid*="resume"]').count();
      console.log(`Resume-related elements: ${resumeElements}`);
      
      // Check for navigation or action buttons
      const actionButtons = await page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Upload")').count();
      console.log(`Action buttons: ${actionButtons}`);
      
      await testUtils.takeScreenshot('dashboard');
      
    } catch (error) {
      console.log(`❌ Dashboard test failed: ${error}`);
    }
  });

  test('should test API endpoints accessibility', async ({ page }) => {
    console.log('\n🔌 Testing API Endpoints');
    
    const apiEndpoints = [
      '/api/health/overall',
      '/api/health/database',
      '/api/health/services',
      '/api/generate',
      '/api/upload',
      '/api/export-pdf'
    ];
    
    const apiResults: any[] = [];
    
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Testing ${endpoint}`);
        
        const response = await page.request.get(endpoint);
        const status = response.status();
        
        let responseBody = '';
        try {
          responseBody = await response.text();
        } catch {
          responseBody = 'Could not read response body';
        }
        
        const result = {
          endpoint,
          status,
          success: status < 400,
          responseLength: responseBody.length,
          hasJson: responseBody.startsWith('{') || responseBody.startsWith('[')
        };
        
        apiResults.push(result);
        
        console.log(`  ${endpoint}: ${status} (${result.success ? 'SUCCESS' : 'FAILED'})`);
        
      } catch (error) {
        console.log(`  ${endpoint}: ERROR - ${error}`);
        apiResults.push({
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // API Summary
    console.log('\n=== API ENDPOINTS SUMMARY ===');
    const workingEndpoints = apiResults.filter(r => r.success);
    const failedEndpoints = apiResults.filter(r => !r.success);
    
    console.log(`✅ Working endpoints: ${workingEndpoints.length}/${apiResults.length}`);
    console.log(`❌ Failed endpoints: ${failedEndpoints.length}/${apiResults.length}`);
    
    if (workingEndpoints.length > 0) {
      console.log('\nWorking endpoints:');
      workingEndpoints.forEach(ep => {
        console.log(`  ✅ ${ep.endpoint} (${ep.status})`);
      });
    }
    
    if (failedEndpoints.length > 0) {
      console.log('\nFailed endpoints:');
      failedEndpoints.forEach(ep => {
        console.log(`  ❌ ${ep.endpoint} (${ep.error || ep.status})`);
      });
    }
  });

  test('should test form submissions and interactions', async ({ page }) => {
    console.log('\n📋 Testing Form Interactions');
    
    const pagesWithForms = ['/login', '/signup', '/support'];
    
    for (const pagePath of pagesWithForms) {
      console.log(`\nTesting forms on ${pagePath}`);
      
      try {
        await page.goto(pagePath);
        await testUtils.waitForPageReady();
        
        const forms = await page.locator('form').count();
        console.log(`Forms found: ${forms}`);
        
        if (forms > 0) {
          const formFields = await testUtils.getFormFields();
          
          // Test each form
          for (let i = 0; i < forms; i++) {
            const form = page.locator('form').nth(i);
            
            console.log(`Testing form ${i + 1}:`);
            
            // Get all inputs in this form
            const inputs = await form.locator('input').count();
            const buttons = await form.locator('button').count();
            
            console.log(`  Inputs: ${inputs}, Buttons: ${buttons}`);
            
            // Try to interact with inputs
            const textInputs = await form.locator('input[type="text"], input[type="email"], input[type="password"]').all();
            
            for (const input of textInputs) {
              const inputType = await input.getAttribute('type');
              const inputName = await input.getAttribute('name');
              
              try {
                await input.fill('test-value');
                await input.clear();
                console.log(`    ✅ Input interaction successful: ${inputType}/${inputName}`);
              } catch (error) {
                console.log(`    ❌ Input interaction failed: ${inputType}/${inputName}`);
              }
            }
          }
        }
        
        await testUtils.takeScreenshot(`forms-${pagePath.replace('/', '')}`);
        
      } catch (error) {
        console.log(`❌ Form testing failed for ${pagePath}: ${error}`);
      }
    }
  });

  test('should test interactive elements and UI components', async ({ page }) => {
    console.log('\n🖱️ Testing Interactive Elements');
    
    const interactivePages = ['/', '/templates', '/login'];
    
    for (const pagePath of interactivePages) {
      console.log(`\nTesting interactive elements on ${pagePath}`);
      
      try {
        await page.goto(pagePath);
        await testUtils.waitForPageReady();
        
        // Count different types of interactive elements
        const elements = {
          buttons: await page.locator('button').count(),
          links: await page.locator('a').count(),
          inputs: await page.locator('input').count(),
          selects: await page.locator('select').count(),
          textareas: await page.locator('textarea').count()
        };
        
        console.log(`Interactive elements:`, elements);
        
        // Test button interactions
        const buttons = await page.locator('button').all();
        let workingButtons = 0;
        
        for (let i = 0; i < Math.min(buttons.length, 5); i++) { // Test max 5 buttons
          const button = buttons[i];
          const buttonText = await button.textContent();
          const isEnabled = await button.isEnabled();
          
          if (isEnabled && buttonText && !buttonText.includes('Submit')) {
            try {
              // Save current URL to detect navigation
              const currentUrl = page.url();
              
              await button.click();
              await page.waitForTimeout(1000);
              
              const newUrl = page.url();
              const navigationOccurred = currentUrl !== newUrl;
              
              console.log(`  Button "${buttonText}": Navigation: ${navigationOccurred}`);
              workingButtons++;
              
              // Go back if navigation occurred
              if (navigationOccurred) {
                await page.goto(pagePath);
                await testUtils.waitForPageReady();
              }
              
            } catch (error) {
              console.log(`  Button "${buttonText}": Failed to interact`);
            }
          }
        }
        
        console.log(`  Working buttons: ${workingButtons}/${Math.min(buttons.length, 5)}`);
        
        await testUtils.takeScreenshot(`interactive-${pagePath.replace('/', 'home').replace('/', '-')}`);
        
      } catch (error) {
        console.log(`❌ Interactive elements test failed for ${pagePath}: ${error}`);
      }
    }
  });

  test('should test responsive design and mobile functionality', async ({ page }) => {
    console.log('\n📱 Testing Responsive Design');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    const testPages = ['/', '/login', '/templates'];
    
    for (const viewport of viewports) {
      console.log(`\nTesting ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const pagePath of testPages) {
        try {
          await page.goto(pagePath);
          await testUtils.waitForPageReady();
          
          // Check if content is visible and properly formatted
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = viewport.width;
          const hasHorizontalScroll = bodyWidth > viewportWidth;
          
          console.log(`  ${pagePath}: Body width: ${bodyWidth}px, Horizontal scroll: ${hasHorizontalScroll}`);
          
          // Check for mobile menu elements
          const hasMobileMenu = await testUtils.elementExists('[data-testid*="mobile"], .mobile-menu, .hamburger');
          console.log(`  ${pagePath}: Mobile menu: ${hasMobileMenu}`);
          
          await testUtils.takeScreenshot(`${viewport.name.toLowerCase()}-${pagePath.replace('/', 'home').replace('/', '-')}`);
          
        } catch (error) {
          console.log(`❌ Responsive test failed for ${pagePath} on ${viewport.name}: ${error}`);
        }
      }
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});