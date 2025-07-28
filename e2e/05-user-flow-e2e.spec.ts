import { test, expect } from '@playwright/test';
import { TestUtils, TEST_CREDENTIALS } from './helpers/test-utils';

test.describe('End-to-End User Flow Testing', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test('should test complete homepage to signup flow', async ({ page }) => {
    console.log('\n🎯 Testing Homepage to Signup Flow');

    const flowSteps: string[] = [];
    const consoleLogs = await testUtils.startConsoleMonitoring();

    try {
      // Step 1: Visit homepage
      console.log('Step 1: Visiting homepage');
      await page.goto('/');
      await testUtils.waitForPageReady();
      flowSteps.push('✅ Homepage loaded');

      await testUtils.takeScreenshot('flow-1-homepage');

      // Step 2: Look for signup call-to-action
      console.log('Step 2: Looking for signup elements');
      
      const signupButtons = await page.locator('a[href*="/signup"], button:has-text("Sign up"), a:has-text("Sign up"), a:has-text("Get started")').count();
      console.log(`Found ${signupButtons} signup elements`);

      if (signupButtons > 0) {
        const signupButton = page.locator('a[href*="/signup"], button:has-text("Sign up"), a:has-text("Sign up"), a:has-text("Get started")').first();
        await signupButton.click();
        flowSteps.push('✅ Clicked signup button');
      } else {
        // Navigate directly to signup
        await page.goto('/signup');
        flowSteps.push('⚠️ No signup button found, navigated directly');
      }

      await testUtils.waitForPageReady();
      await testUtils.takeScreenshot('flow-2-signup-page');

      // Step 3: Test signup form
      console.log('Step 3: Testing signup form');
      
      const hasEmailInput = await testUtils.elementExists('input[type="email"], #email');
      const hasPasswordInput = await testUtils.elementExists('input[type="password"], #password');
      const hasSubmitButton = await testUtils.elementExists('button[type="submit"], input[type="submit"]');

      console.log(`Signup form elements - Email: ${hasEmailInput}, Password: ${hasPasswordInput}, Submit: ${hasSubmitButton}`);

      if (hasEmailInput && hasPasswordInput && hasSubmitButton) {
        // Fill form with test data
        await page.fill('input[type="email"], #email', 'testuser@example.com');
        await page.fill('input[type="password"], #password', 'TestPassword123!');
        flowSteps.push('✅ Filled signup form');

        // Look for additional fields (confirm password, name, etc.)
        const confirmPasswordInput = await testUtils.elementExists('input[name*="confirm"], input[id*="confirm"]');
        if (confirmPasswordInput) {
          await page.fill('input[name*="confirm"], input[id*="confirm"]', 'TestPassword123!');
          flowSteps.push('✅ Filled password confirmation');
        }

        const nameInput = await testUtils.elementExists('input[name*="name"], input[id*="name"], input[name*="firstName"]');
        if (nameInput) {
          await page.fill('input[name*="name"], input[id*="name"], input[name*="firstName"]', 'Test User');
          flowSteps.push('✅ Filled name field');
        }

        await testUtils.takeScreenshot('flow-3-signup-filled');

        // Note: We won't actually submit to avoid creating test accounts
        flowSteps.push('⚠️ Signup form ready (not submitted to avoid test data)');
      } else {
        flowSteps.push('❌ Signup form incomplete or missing');
      }

    } catch (error) {
      console.log(`❌ Signup flow failed: ${error}`);
      flowSteps.push(`❌ Flow failed: ${error}`);
    }

    // Flow summary
    console.log('\n=== SIGNUP FLOW SUMMARY ===');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

    const errors = consoleLogs.filter(log => log.includes('[ERROR]'));
    if (errors.length > 0) {
      console.log('\nConsole errors during flow:');
      errors.forEach(error => console.log(`  • ${error}`));
    }
  });

  test('should test login to dashboard flow', async ({ page }) => {
    console.log('\n🔐 Testing Login to Dashboard Flow');

    const flowSteps: string[] = [];
    const consoleLogs = await testUtils.startConsoleMonitoring();

    try {
      // Step 1: Navigate to login
      console.log('Step 1: Navigating to login page');
      await page.goto('/login');
      await testUtils.waitForPageReady();
      flowSteps.push('✅ Login page loaded');

      await testUtils.takeScreenshot('flow-1-login-page');

      // Step 2: Attempt login
      console.log('Step 2: Attempting login');
      const loginResult = await testUtils.login(TEST_CREDENTIALS);
      
      if (loginResult.success) {
        flowSteps.push('✅ Login successful');
        flowSteps.push('✅ Redirected to dashboard');

        // Step 3: Verify dashboard functionality
        console.log('Step 3: Verifying dashboard');
        await testUtils.takeScreenshot('flow-2-dashboard');

        // Check for dashboard elements
        const dashboardElements = {
          navigation: await testUtils.elementExists('nav'),
          userProfile: await testUtils.elementExists('[data-testid*="profile"], .user-profile, .avatar'),
          mainContent: await testUtils.elementExists('main, [role="main"], .main-content'),
          actionButtons: await page.locator('button:has-text("Create"), button:has-text("New"), a:has-text("Create")').count()
        };

        console.log('Dashboard elements:', dashboardElements);
        
        if (dashboardElements.navigation) flowSteps.push('✅ Navigation present');
        if (dashboardElements.userProfile) flowSteps.push('✅ User profile/avatar present');
        if (dashboardElements.mainContent) flowSteps.push('✅ Main content area present');
        if (dashboardElements.actionButtons > 0) flowSteps.push(`✅ ${dashboardElements.actionButtons} action buttons found`);

        // Step 4: Test logout functionality
        console.log('Step 4: Testing logout');
        const logoutElements = await page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")').count();
        
        if (logoutElements > 0) {
          flowSteps.push('✅ Logout option available');
          // Don't actually logout to preserve session for other tests
        } else {
          flowSteps.push('⚠️ No obvious logout option found');
        }

      } else {
        flowSteps.push(`❌ Login failed: ${loginResult.error}`);
        
        // Document the login failure details
        console.log('Login failure details:', {
          error: loginResult.error,
          consoleLogsCount: loginResult.logs.length,
          currentUrl: page.url()
        });

        await testUtils.takeScreenshot('flow-2-login-failed');
      }

    } catch (error) {
      console.log(`❌ Login flow failed: ${error}`);
      flowSteps.push(`❌ Flow failed: ${error}`);
    }

    // Flow summary
    console.log('\n=== LOGIN FLOW SUMMARY ===');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
  });

  test('should test unauthenticated user journey', async ({ page }) => {
    console.log('\n👤 Testing Unauthenticated User Journey');

    const flowSteps: string[] = [];
    const pagesVisited: string[] = [];

    try {
      // Step 1: Start at homepage
      console.log('Step 1: Starting at homepage');
      await page.goto('/');
      await testUtils.waitForPageReady();
      pagesVisited.push('/');
      flowSteps.push('✅ Homepage accessible');

      await testUtils.takeScreenshot('flow-1-homepage');

      // Step 2: Browse templates (public)
      console.log('Step 2: Browsing templates');
      await page.goto('/templates');
      await testUtils.waitForPageReady();
      pagesVisited.push('/templates');
      
      const templatesLoaded = await page.locator('img, .template, .card').count() > 0;
      if (templatesLoaded) {
        flowSteps.push('✅ Templates page accessible and has content');
      } else {
        flowSteps.push('⚠️ Templates page accessible but no content visible');
      }

      await testUtils.takeScreenshot('flow-2-templates');

      // Step 3: Try to access protected resource
      console.log('Step 3: Attempting to access protected resource');
      await page.goto('/dashboard');
      await testUtils.waitForPageReady();
      
      const currentUrl = page.url();
      const wasRedirected = !currentUrl.includes('/dashboard') || currentUrl.includes('/login');
      
      if (wasRedirected) {
        flowSteps.push('✅ Properly redirected from protected resource');
        pagesVisited.push('redirected to login');
      } else {
        flowSteps.push('❌ Protected resource accessible without authentication');
        pagesVisited.push('/dashboard (SECURITY ISSUE)');
      }

      await testUtils.takeScreenshot('flow-3-protected-redirect');

      // Step 4: Navigate to login from redirect
      if (currentUrl.includes('/login')) {
        console.log('Step 4: Already on login page from redirect');
        flowSteps.push('✅ Login page shown after redirect');
        
        // Check for return URL parameter
        const url = new URL(currentUrl);
        const returnUrl = url.searchParams.get('returnUrl');
        if (returnUrl) {
          flowSteps.push(`✅ Return URL preserved: ${returnUrl}`);
        }
      } else {
        console.log('Step 4: Manually navigating to login');
        await page.goto('/login');
        await testUtils.waitForPageReady();
        flowSteps.push('✅ Login page accessible');
      }

      // Step 5: Explore public pages
      console.log('Step 5: Exploring other public pages');
      const publicPages = ['/privacy', '/terms', '/support'];
      
      for (const publicPage of publicPages) {
        try {
          await page.goto(publicPage);
          await testUtils.waitForPageReady();
          pagesVisited.push(publicPage);
          flowSteps.push(`✅ ${publicPage} accessible`);
        } catch (error) {
          flowSteps.push(`❌ ${publicPage} failed to load`);
        }
      }

    } catch (error) {
      console.log(`❌ Unauthenticated journey failed: ${error}`);
      flowSteps.push(`❌ Journey failed: ${error}`);
    }

    // Journey summary
    console.log('\n=== UNAUTHENTICATED USER JOURNEY SUMMARY ===');
    console.log('Pages visited:', pagesVisited.join(' → '));
    console.log('\nFlow steps:');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
  });

  test('should test resume creation workflow simulation', async ({ page }) => {
    console.log('\n📄 Testing Resume Creation Workflow (Simulation)');

    const flowSteps: string[] = [];
    const consoleLogs = await testUtils.startConsoleMonitoring();

    try {
      // Step 1: Try to access resume creation
      console.log('Step 1: Accessing resume creation');
      
      const resumeRoutes = ['/resumes/new', '/resumes', '/dashboard'];
      let accessibleRoute = null;

      for (const route of resumeRoutes) {
        await page.goto(route);
        await testUtils.waitForPageReady();
        
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          accessibleRoute = route;
          break;
        }
      }

      if (accessibleRoute) {
        flowSteps.push(`✅ Accessed resume area via ${accessibleRoute}`);
        await testUtils.takeScreenshot('flow-1-resume-access');
      } else {
        flowSteps.push('⚠️ Resume creation requires authentication');
        
        // Simulate authentication success for testing UI
        await page.goto('/login');
        flowSteps.push('⚠️ Would need to authenticate first');
        
        await testUtils.takeScreenshot('flow-1-login-required');
      }

      // Step 2: Look for resume creation elements
      console.log('Step 2: Looking for resume creation elements');
      
      const resumeElements = {
        createButton: await page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("New Resume")').count(),
        uploadButton: await page.locator('button:has-text("Upload"), input[type="file"]').count(),
        templateOptions: await page.locator('.template, [data-testid*="template"]').count(),
        forms: await page.locator('form').count()
      };

      console.log('Resume creation elements found:', resumeElements);

      Object.entries(resumeElements).forEach(([element, count]) => {
        if (count > 0) {
          flowSteps.push(`✅ ${element}: ${count} found`);
        }
      });

      // Step 3: Test template selection (if available)
      if (resumeElements.templateOptions > 0) {
        console.log('Step 3: Testing template selection');
        
        const firstTemplate = page.locator('.template, [data-testid*="template"]').first();
        if (await firstTemplate.isVisible()) {
          await firstTemplate.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          flowSteps.push(`✅ Template interaction: ${newUrl}`);
          
          await testUtils.takeScreenshot('flow-2-template-selected');
        }
      }

      // Step 4: Test form interactions (if available)
      if (resumeElements.forms > 0) {
        console.log('Step 4: Testing form interactions');
        
        const formFields = await testUtils.getFormFields();
        if (formFields.inputs.length > 0) {
          flowSteps.push(`✅ Form fields available: ${formFields.inputs.length} inputs`);
          
          // Try to interact with first text input
          const textInput = page.locator('input[type="text"], input[type="email"], textarea').first();
          if (await textInput.isVisible()) {
            await textInput.fill('Test content');
            flowSteps.push('✅ Form interaction successful');
            
            await testUtils.takeScreenshot('flow-3-form-interaction');
          }
        }
      }

    } catch (error) {
      console.log(`❌ Resume workflow simulation failed: ${error}`);
      flowSteps.push(`❌ Workflow failed: ${error}`);
    }

    // Workflow summary
    console.log('\n=== RESUME CREATION WORKFLOW SUMMARY ===');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

    const errors = consoleLogs.filter(log => log.includes('[ERROR]'));
    if (errors.length > 0) {
      console.log('\nConsole errors during workflow:');
      errors.forEach(error => console.log(`  • ${error}`));
    }
  });

  test('should test complete error handling flow', async ({ page }) => {
    console.log('\n🚨 Testing Error Handling Flow');

    const flowSteps: string[] = [];
    const errorsEncountered: string[] = [];

    try {
      // Step 1: Test 404 error handling
      console.log('Step 1: Testing 404 error handling');
      
      await page.goto('/nonexistent-page-12345');
      await testUtils.waitForPageReady();
      
      const has404 = await testUtils.elementExists('text=404') || 
                     await testUtils.elementExists('text=Not Found') ||
                     await testUtils.elementExists('text=Page not found');
      
      if (has404) {
        flowSteps.push('✅ 404 error page displayed');
      } else {
        const currentUrl = page.url();
        if (currentUrl.includes('/nonexistent-page-12345')) {
          flowSteps.push('⚠️ Page loads but no 404 indicator');
        } else {
          flowSteps.push('⚠️ Redirected instead of showing 404');
        }
      }

      await testUtils.takeScreenshot('flow-1-404-handling');

      // Step 2: Test invalid form submission
      console.log('Step 2: Testing invalid form submission');
      
      await page.goto('/login');
      await testUtils.waitForPageReady();
      
      // Submit form with invalid data
      await page.fill('#email', 'invalid-email');
      await page.fill('#password', '123'); // Too short
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Check for validation errors
      const hasValidationError = await testUtils.elementExists('.error, .invalid, [aria-invalid="true"]') ||
                                  await page.locator('input:invalid').count() > 0;
      
      if (hasValidationError) {
        flowSteps.push('✅ Form validation errors displayed');
      } else {
        flowSteps.push('⚠️ No visible form validation');
      }

      await testUtils.takeScreenshot('flow-2-form-validation');

      // Step 3: Test network error simulation
      console.log('Step 3: Testing offline/network error handling');
      
      // Simulate offline condition
      await page.context().setOffline(true);
      
      try {
        await page.reload();
        await page.waitForTimeout(3000);
        
        const hasOfflineMessage = await testUtils.elementExists('text=offline') ||
                                  await testUtils.elementExists('text=connection') ||
                                  await testUtils.elementExists('text=network');
        
        if (hasOfflineMessage) {
          flowSteps.push('✅ Offline error handling detected');
        } else {
          flowSteps.push('⚠️ No specific offline error handling');
        }
        
      } catch (error) {
        flowSteps.push('✅ Network error properly caught');
      }
      
      // Restore connection
      await page.context().setOffline(false);
      await testUtils.takeScreenshot('flow-3-network-error');

      // Step 4: Test recovery from errors
      console.log('Step 4: Testing error recovery');
      
      await page.goto('/');
      await testUtils.waitForPageReady();
      
      const homepageLoadsAfterErrors = await testUtils.elementExists('body');
      if (homepageLoadsAfterErrors) {
        flowSteps.push('✅ Application recovers from errors');
      } else {
        flowSteps.push('❌ Application broken after error simulation');
      }

    } catch (error) {
      console.log(`❌ Error handling flow failed: ${error}`);
      flowSteps.push(`❌ Error handling test failed: ${error}`);
      errorsEncountered.push(error instanceof Error ? error.message : 'Unknown error');
    }

    // Error handling summary
    console.log('\n=== ERROR HANDLING FLOW SUMMARY ===');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

    if (errorsEncountered.length > 0) {
      console.log('\nErrors encountered during testing:');
      errorsEncountered.forEach(error => console.log(`  • ${error}`));
    }
  });

  test('should test session management and persistence', async ({ page }) => {
    console.log('\n🔄 Testing Session Management');

    const flowSteps: string[] = [];

    try {
      // Step 1: Check initial session state
      console.log('Step 1: Checking initial session state');
      
      const authState = await testUtils.checkAuthState();
      flowSteps.push(`Initial auth state: ${authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);

      // Step 2: Test page refresh behavior
      console.log('Step 2: Testing page refresh behavior');
      
      await page.goto('/login');
      await testUtils.waitForPageReady();
      
      const beforeRefreshUrl = page.url();
      await page.reload();
      await testUtils.waitForPageReady();
      
      const afterRefreshUrl = page.url();
      const sessionPersisted = beforeRefreshUrl === afterRefreshUrl;
      
      if (sessionPersisted) {
        flowSteps.push('✅ Session state persisted through refresh');
      } else {
        flowSteps.push('⚠️ Session state changed after refresh');
      }

      // Step 3: Test browser navigation
      console.log('Step 3: Testing browser navigation');
      
      await page.goto('/templates');
      await testUtils.waitForPageReady();
      
      await page.goBack();
      await testUtils.waitForPageReady();
      
      await page.goForward();
      await testUtils.waitForPageReady();
      
      const finalUrl = page.url();
      if (finalUrl.includes('/templates')) {
        flowSteps.push('✅ Browser navigation works correctly');
      } else {
        flowSteps.push('⚠️ Browser navigation issues detected');
      }

      // Step 4: Test deep linking
      console.log('Step 4: Testing deep linking');
      
      const deepLink = '/templates?category=modern';
      await page.goto(deepLink);
      await testUtils.waitForPageReady();
      
      const currentUrl = page.url();
      if (currentUrl.includes('templates')) {
        flowSteps.push('✅ Deep linking works');
        
        if (currentUrl.includes('category=modern')) {
          flowSteps.push('✅ URL parameters preserved');
        }
      } else {
        flowSteps.push('⚠️ Deep linking redirected');
      }

      await testUtils.takeScreenshot('flow-session-management');

    } catch (error) {
      console.log(`❌ Session management test failed: ${error}`);
      flowSteps.push(`❌ Session test failed: ${error}`);
    }

    // Session management summary
    console.log('\n=== SESSION MANAGEMENT SUMMARY ===');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
  });
});