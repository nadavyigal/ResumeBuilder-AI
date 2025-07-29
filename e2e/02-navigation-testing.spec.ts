import { test, expect } from '@playwright/test';
import { TestUtils } from './helpers/test-utils';

test.describe('Complete Page Navigation and Routing Tests', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test('should test all public pages accessibility', async ({ page }) => {
    const publicPages = [
      { path: '/', name: 'Homepage' },
      { path: '/login', name: 'Login Page' },
      { path: '/signup', name: 'Signup Page' },
      { path: '/templates', name: 'Templates Page' },
      { path: '/privacy', name: 'Privacy Page' },
      { path: '/terms', name: 'Terms Page' },
      { path: '/support', name: 'Support Page' }
    ];

    const results: any[] = [];

    for (const pageInfo of publicPages) {
      console.log(`\n🧪 Testing ${pageInfo.name} (${pageInfo.path})`);
      
      const consoleLogs = await testUtils.startConsoleMonitoring();
      
      try {
        const response = await page.goto(pageInfo.path);
        await testUtils.waitForPageReady();

        const result = {
          path: pageInfo.path,
          name: pageInfo.name,
          status: response?.status() || 'unknown',
          success: response?.ok() || false,
          title: await page.title(),
          url: page.url(),
          errors: consoleLogs.filter(log => log.includes('[ERROR]')),
          warnings: consoleLogs.filter(log => log.includes('[WARNING]')),
          hasNavigation: await testUtils.elementExists('nav'),
          hasFooter: await testUtils.elementExists('footer'),
          accessibilityIssues: await testUtils.checkAccessibility()
        };

        results.push(result);

        // Take screenshot of each page
        await testUtils.takeScreenshot(`page-${pageInfo.path.replace('/', 'home').replace('/', '-')}`);

        console.log(`✅ ${pageInfo.name}: Status ${result.status}, Errors: ${result.errors.length}`);

      } catch (error) {
        console.log(`❌ ${pageInfo.name}: Failed to load - ${error}`);
        results.push({
          path: pageInfo.path,
          name: pageInfo.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Summary report
    console.log('\n=== PUBLIC PAGES SUMMARY ===');
    const successfulPages = results.filter(r => r.success);
    const failedPages = results.filter(r => !r.success);
    
    console.log(`✅ Successful pages: ${successfulPages.length}/${results.length}`);
    console.log(`❌ Failed pages: ${failedPages.length}/${results.length}`);

    if (failedPages.length > 0) {
      console.log('\nFailed pages:');
      failedPages.forEach(page => {
        console.log(`- ${page.name} (${page.path}): ${page.error || 'Unknown error'}`);
      });
    }

    // Check for pages with errors
    const pagesWithErrors = results.filter(r => r.errors && r.errors.length > 0);
    if (pagesWithErrors.length > 0) {
      console.log('\nPages with console errors:');
      pagesWithErrors.forEach(page => {
        console.log(`- ${page.name}: ${page.errors.length} errors`);
        page.errors.forEach((error: string) => console.log(`  * ${error}`));
      });
    }
  });

  test('should test protected pages and authentication redirects', async ({ page }) => {
    const protectedPages = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/profile', name: 'Profile' },
      { path: '/settings', name: 'Settings' },
      { path: '/resumes', name: 'Resumes List' },
      { path: '/resumes/new', name: 'New Resume' },
      { path: '/optimize', name: 'Optimize Page' }
    ];

    const results: any[] = [];

    for (const pageInfo of protectedPages) {
      console.log(`\n🔒 Testing protected page: ${pageInfo.name} (${pageInfo.path})`);
      
      try {
        await page.goto(pageInfo.path);
        await testUtils.waitForPageReady();

        const finalUrl = page.url();
        const isRedirected = !finalUrl.includes(pageInfo.path);
        const redirectedToLogin = finalUrl.includes('/login');

        const result = {
          path: pageInfo.path,
          name: pageInfo.name,
          finalUrl,
          isRedirected,
          redirectedToLogin,
          hasReturnUrl: finalUrl.includes('returnUrl='),
          title: await page.title()
        };

        results.push(result);

        await testUtils.takeScreenshot(`protected-${pageInfo.path.replace('/', '').replace('/', '-')}`);

        console.log(`📍 ${pageInfo.name}: Redirected: ${isRedirected}, To Login: ${redirectedToLogin}`);

      } catch (error) {
        console.log(`❌ ${pageInfo.name}: Error accessing - ${error}`);
        results.push({
          path: pageInfo.path,
          name: pageInfo.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Summary
    console.log('\n=== PROTECTED PAGES SUMMARY ===');
    const properlyProtected = results.filter(r => r.redirectedToLogin);
    console.log(`🔒 Properly protected pages: ${properlyProtected.length}/${results.length}`);

    results.forEach(result => {
      if (result.redirectedToLogin) {
        console.log(`✅ ${result.name}: Properly redirected to login`);
      } else if (!result.error) {
        console.log(`⚠️ ${result.name}: Accessible without authentication!`);
      }
    });
  });

  test('should test navigation menu functionality', async ({ page }) => {
    // Test navigation from different pages
    const pagesWithNav = ['/', '/login', '/signup', '/templates'];

    for (const startPage of pagesWithNav) {
      console.log(`\n🧭 Testing navigation from ${startPage}`);
      
      await page.goto(startPage);
      await testUtils.waitForPageReady();

      // Look for navigation elements
      const navExists = await testUtils.elementExists('nav');
      console.log(`Navigation menu exists: ${navExists}`);

      if (navExists) {
        // Find all navigation links
        const navLinks = await page.locator('nav a').all();
        console.log(`Found ${navLinks.length} navigation links`);

        // Test each navigation link
        for (let i = 0; i < Math.min(navLinks.length, 5); i++) { // Limit to 5 to avoid too many tests
          const link = navLinks[i];
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && href.startsWith('/') && !href.includes('#')) {
            try {
              await link.click();
              await testUtils.waitForPageReady();
              
              const newUrl = page.url();
              console.log(`✅ Navigation link "${text}" -> ${newUrl}`);
              
              // Go back to start page for next test
              await page.goto(startPage);
              await testUtils.waitForPageReady();
            } catch (error) {
              console.log(`❌ Navigation link "${text}" (${href}) failed: ${error}`);
            }
          }
        }
      }
    }
  });

  test('should test dynamic routing and parameters', async ({ page }) => {
    console.log('\n🔀 Testing dynamic routes');

    // Test resume ID routes (these may not work without authentication)
    const dynamicRoutes = [
      '/resumes/test-id',
      '/resumes/test-id/edit',
      '/resumes/test-id/template'
    ];

    for (const route of dynamicRoutes) {
      try {
        await page.goto(route);
        await testUtils.waitForPageReady();

        const finalUrl = page.url();
        const status = await page.evaluate(() => document.readyState);
        
        console.log(`📍 ${route}: Final URL: ${finalUrl}, Ready State: ${status}`);

        // Check if we get a 404 or redirect
        const isNotFound = await testUtils.elementExists('text=404') || 
                          await testUtils.elementExists('text=Not Found');
        const isRedirected = !finalUrl.includes(route);

        console.log(`   Not Found: ${isNotFound}, Redirected: ${isRedirected}`);

      } catch (error) {
        console.log(`❌ ${route}: ${error}`);
      }
    }
  });

  test('should test browser navigation (back/forward)', async ({ page }) => {
    console.log('\n⏮️ Testing browser navigation');

    const navigationSequence = ['/', '/login', '/signup', '/templates'];
    
    // Navigate through sequence
    for (const path of navigationSequence) {
      await page.goto(path);
      await testUtils.waitForPageReady();
      console.log(`Navigated to: ${path}`);
    }

    // Test back button
    console.log('\nTesting back navigation:');
    for (let i = navigationSequence.length - 2; i >= 0; i--) {
      await page.goBack();
      await testUtils.waitForPageReady();
      
      const currentUrl = page.url();
      const expectedPath = navigationSequence[i];
      const isCorrect = currentUrl.includes(expectedPath);
      
      console.log(`Back to: ${currentUrl}, Expected: ${expectedPath}, Correct: ${isCorrect}`);
    }

    // Test forward button
    console.log('\nTesting forward navigation:');
    for (let i = 1; i < navigationSequence.length; i++) {
      await page.goForward();
      await testUtils.waitForPageReady();
      
      const currentUrl = page.url();
      const expectedPath = navigationSequence[i];
      const isCorrect = currentUrl.includes(expectedPath);
      
      console.log(`Forward to: ${currentUrl}, Expected: ${expectedPath}, Correct: ${isCorrect}`);
    }
  });

  test('should test 404 and error page handling', async ({ page }) => {
    console.log('\n🔍 Testing error page handling');

    const invalidRoutes = [
      '/nonexistent-page',
      '/invalid/route/here',
      '/resumes/invalid-id-123456',
      '/admin/secret-page'
    ];

    for (const route of invalidRoutes) {
      try {
        const response = await page.goto(route);
        await testUtils.waitForPageReady();

        const status = response?.status();
        const finalUrl = page.url();
        const title = await page.title();

        // Check for 404 indicators
        const has404Text = await testUtils.elementExists('text=404') ||
                          await testUtils.elementExists('text=Not Found') ||
                          await testUtils.elementExists('text=Page not found');

        const isRedirected = !finalUrl.includes(route);

        console.log(`📍 ${route}:`);
        console.log(`   Status: ${status}`);
        console.log(`   Final URL: ${finalUrl}`);
        console.log(`   Has 404 text: ${has404Text}`);
        console.log(`   Redirected: ${isRedirected}`);
        console.log(`   Title: ${title}`);

        await testUtils.takeScreenshot(`error-page-${route.replace(/\//g, '-')}`);

      } catch (error) {
        console.log(`❌ ${route}: ${error}`);
      }
    }
  });

  test('should analyze page load performance', async ({ page }) => {
    console.log('\n⚡ Testing page load performance');

    const pagesToTest = ['/', '/login', '/signup', '/templates'];
    const performanceResults: any[] = [];

    for (const path of pagesToTest) {
      console.log(`\n📊 Performance testing: ${path}`);
      
      const startTime = Date.now();
      
      try {
        await page.goto(path);
        await testUtils.waitForPageReady();
        
        const loadTime = Date.now() - startTime;
        
        // Get performance metrics
        const metrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
        });

        performanceResults.push({
          path,
          totalLoadTime: loadTime,
          ...metrics
        });

        console.log(`   Total load time: ${loadTime}ms`);
        console.log(`   DOM load time: ${metrics.domContentLoaded}ms`);
        console.log(`   First paint: ${metrics.firstPaint}ms`);

      } catch (error) {
        console.log(`❌ Performance test failed for ${path}: ${error}`);
      }
    }

    // Performance summary
    console.log('\n=== PERFORMANCE SUMMARY ===');
    const avgLoadTime = performanceResults.reduce((sum, result) => sum + result.totalLoadTime, 0) / performanceResults.length;
    console.log(`Average load time: ${avgLoadTime.toFixed(2)}ms`);

    const slowPages = performanceResults.filter(result => result.totalLoadTime > 3000);
    if (slowPages.length > 0) {
      console.log('\nSlow loading pages (>3s):');
      slowPages.forEach(page => {
        console.log(`- ${page.path}: ${page.totalLoadTime}ms`);
      });
    }
  });
});