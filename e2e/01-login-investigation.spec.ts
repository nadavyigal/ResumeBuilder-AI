import { test, expect } from '@playwright/test';
import { TestUtils, TEST_CREDENTIALS } from './helpers/test-utils';

test.describe('Login Investigation and Authentication Tests', () => {
  let testUtils: TestUtils;
  let consoleLogs: string[];
  let networkMonitoring: any;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
    consoleLogs = await testUtils.startConsoleMonitoring();
    networkMonitoring = await testUtils.startNetworkMonitoring();
  });

  test('should load login page without errors', async ({ page }) => {
    await page.goto('/login');
    await testUtils.waitForPageReady();

    // Check that login page loads
    await expect(page.locator('h2')).toContainText('Welcome back');
    
    // Check for console errors
    const errorLogs = consoleLogs.filter(log => log.includes('[ERROR]'));
    if (errorLogs.length > 0) {
      console.log('Console errors on login page:', errorLogs);
    }

    // Take screenshot for visual verification
    await testUtils.takeScreenshot('login-page-loaded');

    // Verify form elements exist
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    await testUtils.waitForPageReady();

    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Browser validation should prevent submission
    const emailInput = page.locator('#email');
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBe(true);

    await testUtils.takeScreenshot('login-form-validation');
  });

  test('should attempt login with test credentials', async ({ page }) => {
    const loginResult = await testUtils.login(TEST_CREDENTIALS);
    
    console.log('Login attempt result:', {
      success: loginResult.success,
      error: loginResult.error,
      consoleLogsCount: loginResult.logs.length
    });

    if (!loginResult.success) {
      console.log('Login failed with error:', loginResult.error);
      console.log('Console logs during login:', loginResult.logs);
      
      // Take screenshot of error state
      await testUtils.takeScreenshot('login-failed');
    }

    // Check network requests during login
    const authRequests = networkMonitoring.requests.filter((req: any) => 
      req.url.includes('auth') || req.url.includes('supabase')
    );
    
    console.log('Authentication-related requests:', authRequests);

    // Check for failed requests
    if (networkMonitoring.failures.length > 0) {
      console.log('Network failures during login:', networkMonitoring.failures);
    }

    // Document the current state
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
  });

  test('should test Google OAuth flow initiation', async ({ page }) => {
    await page.goto('/login');
    await testUtils.waitForPageReady();

    // Monitor for popup or redirect
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    
    await page.click('button:has-text("Continue with Google")');
    
    const popup = await popupPromise;
    
    if (popup) {
      console.log('Google OAuth popup opened:', popup.url());
      await testUtils.takeScreenshot('google-oauth-popup');
      await popup.close();
    } else {
      console.log('No popup detected - checking for redirect or inline auth');
      await page.waitForTimeout(3000);
      console.log('URL after Google login click:', page.url());
    }

    // Check for any OAuth-related network requests
    const oauthRequests = networkMonitoring.requests.filter((req: any) => 
      req.url.includes('google') || req.url.includes('oauth')
    );
    
    console.log('OAuth-related requests:', oauthRequests);
  });

  test('should test magic link functionality', async ({ page }) => {
    await page.goto('/login');
    await testUtils.waitForPageReady();

    // Fill email field
    await page.fill('#email', TEST_CREDENTIALS.email);

    // Click magic link button
    await page.click('button:has-text("Send Magic Link")');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for success/error feedback
    const hasAlert = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             document.body.innerHTML.includes('Check your email');
    });

    // Check network requests for magic link
    const magicLinkRequests = networkMonitoring.requests.filter((req: any) => 
      req.url.includes('otp') || req.url.includes('magic')
    );
    
    console.log('Magic link requests:', magicLinkRequests);

    await testUtils.takeScreenshot('magic-link-attempt');
  });

  test('should check authentication state and redirects', async ({ page }) => {
    // Test accessing protected route without authentication
    await page.goto('/dashboard');
    await testUtils.waitForPageReady();

    const currentUrl = page.url();
    console.log('URL when accessing dashboard without auth:', currentUrl);

    // Should redirect to login if not authenticated
    const isRedirectedToLogin = currentUrl.includes('/login');
    console.log('Redirected to login?', isRedirectedToLogin);

    // Check if there's a returnUrl parameter
    const url = new URL(currentUrl);
    const returnUrl = url.searchParams.get('returnUrl');
    console.log('Return URL parameter:', returnUrl);

    await testUtils.takeScreenshot('auth-redirect-check');
  });

  test('should analyze login form structure and functionality', async ({ page }) => {
    await page.goto('/login');
    await testUtils.waitForPageReady();

    // Get all form fields
    const formFields = await testUtils.getFormFields();
    
    console.log('Login form analysis:', {
      inputCount: formFields.inputs.length,
      buttonCount: formFields.buttons.length,
      formCount: formFields.forms.length,
      inputs: formFields.inputs,
      buttons: formFields.buttons,
      forms: formFields.forms
    });

    // Check for accessibility issues
    const accessibilityCheck = await testUtils.checkAccessibility();
    
    if (accessibilityCheck.issues.length > 0) {
      console.log('Accessibility issues found:', accessibilityCheck.issues);
    }

    // Test form interactions
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Check if submit button becomes active
    const submitButton = page.locator('button[type="submit"]');
    const isSubmitEnabled = await submitButton.isEnabled();
    
    console.log('Submit button enabled after filling form:', isSubmitEnabled);

    await testUtils.takeScreenshot('login-form-filled');
  });

  test('should monitor and report all errors during login process', async ({ page }) => {
    const allErrors: string[] = [];
    
    // Set up comprehensive error monitoring
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        allErrors.push(`Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      allErrors.push(`Page Error: ${error.message}`);
    });

    page.on('requestfailed', (request) => {
      allErrors.push(`Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Navigate to login and perform various actions
    await page.goto('/login');
    await testUtils.waitForPageReady();

    // Try different login scenarios
    
    // 1. Invalid credentials
    await page.fill('#email', 'invalid@email.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. Malformed email
    await page.fill('#email', 'notanemail');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 3. Empty password
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Report all errors found
    console.log('\n=== COMPREHENSIVE ERROR REPORT ===');
    console.log('Total errors detected:', allErrors.length);
    
    if (allErrors.length > 0) {
      console.log('\nDetailed errors:');
      allErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors detected during login testing!');
    }

    // Final screenshot
    await testUtils.takeScreenshot('comprehensive-error-test-complete');
  });

  test.afterEach(async ({ page }) => {
    // Log final state
    console.log('\n=== TEST COMPLETION SUMMARY ===');
    console.log('Final URL:', page.url());
    console.log('Total console logs:', consoleLogs.length);
    console.log('Network requests made:', networkMonitoring.requests.length);
    console.log('Network failures:', networkMonitoring.failures.length);
    
    if (consoleLogs.length > 0) {
      console.log('\nConsole logs:');
      consoleLogs.slice(-10).forEach(log => console.log(log)); // Show last 10 logs
    }
  });
});