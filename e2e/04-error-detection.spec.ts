import { test, expect } from '@playwright/test';
import { TestUtils } from './helpers/test-utils';

test.describe('Error Detection and Monitoring', () => {
  let testUtils: TestUtils;
  let globalErrors: string[] = [];
  let networkFailures: any[] = [];
  let consoleMessages: any[] = [];

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
    globalErrors = [];
    networkFailures = [];
    consoleMessages = [];

    // Set up comprehensive error monitoring
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
      
      if (msg.type() === 'error') {
        globalErrors.push(`Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      globalErrors.push(`Page Error: ${error.message}\nStack: ${error.stack}`);
    });

    page.on('requestfailed', (request) => {
      const failure = {
        url: request.url(),
        method: request.method(),
        error: request.failure()?.errorText || 'Unknown error',
        timestamp: new Date().toISOString()
      };
      networkFailures.push(failure);
      globalErrors.push(`Network Error: ${failure.url} - ${failure.error}`);
    });
  });

  test('should detect JavaScript errors across all pages', async ({ page }) => {
    console.log('\n🔍 Scanning for JavaScript errors across all pages');
    
    const pagesToScan = [
      '/',
      '/login',
      '/signup', 
      '/templates',
      '/dashboard',
      '/profile',
      '/settings',
      '/privacy',
      '/terms',
      '/support'
    ];

    const errorSummary: any[] = [];

    for (const pagePath of pagesToScan) {
      console.log(`\nScanning ${pagePath}...`);
      
      const pageErrors: string[] = [];
      const pageStartTime = Date.now();

      try {
        await page.goto(pagePath);
        await testUtils.waitForPageReady();

        // Wait a bit more to catch any delayed errors
        await page.waitForTimeout(2000);

        // Check for any new errors that occurred during page load
        const newErrors = globalErrors.filter(error => 
          !errorSummary.some(summary => 
            summary.errors.includes(error)
          )
        );

        pageErrors.push(...newErrors);

        // Check for broken images
        const brokenImages = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.filter(img => !img.complete || img.naturalHeight === 0).length;
        });

        // Check for missing stylesheets
        const brokenStyles = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
          return links.filter(link => 
            (link as HTMLLinkElement).sheet === null
          ).length;
        });

        const pageResult = {
          path: pagePath,
          loadTime: Date.now() - pageStartTime,
          errors: pageErrors,
          errorCount: pageErrors.length,
          brokenImages,
          brokenStyles,
          hasContent: await page.locator('body').innerHTML() !== '',
          title: await page.title()
        };

        errorSummary.push(pageResult);

        if (pageErrors.length > 0) {
          console.log(`  ❌ ${pageErrors.length} errors detected`);
          pageErrors.forEach(error => console.log(`    • ${error}`));
        } else {
          console.log(`  ✅ No errors detected`);
        }

        if (brokenImages > 0) {
          console.log(`  🖼️ ${brokenImages} broken images`);
        }

        if (brokenStyles > 0) {
          console.log(`  🎨 ${brokenStyles} broken stylesheets`);
        }

      } catch (error) {
        console.log(`  💥 Failed to scan ${pagePath}: ${error}`);
        errorSummary.push({
          path: pagePath,
          errors: [`Page scan failed: ${error}`],
          errorCount: 1,
          scanFailed: true
        });
      }
    }

    // Generate error report
    console.log('\n=== JAVASCRIPT ERROR SUMMARY ===');
    const totalErrors = errorSummary.reduce((sum, page) => sum + page.errorCount, 0);
    const pagesWithErrors = errorSummary.filter(page => page.errorCount > 0);
    
    console.log(`Total errors detected: ${totalErrors}`);
    console.log(`Pages with errors: ${pagesWithErrors.length}/${errorSummary.length}`);

    if (pagesWithErrors.length > 0) {
      console.log('\nPages with errors:');
      pagesWithErrors.forEach(page => {
        console.log(`  ${page.path}: ${page.errorCount} errors`);
      });
    }

    await testUtils.takeScreenshot('error-detection-complete');
  });

  test('should monitor network request failures', async ({ page }) => {
    console.log('\n🌐 Monitoring network request failures');

    const pagesToTest = ['/', '/login', '/templates', '/dashboard'];
    const networkSummary: any[] = [];

    for (const pagePath of pagesToTest) {
      console.log(`\nTesting network requests for ${pagePath}`);
      
      const pageNetworkFailures: any[] = [];
      const networkMonitoring = await testUtils.startNetworkMonitoring();

      try {
        await page.goto(pagePath);
        await testUtils.waitForPageReady();

        // Wait for any additional requests
        await page.waitForTimeout(3000);

        const summary = {
          path: pagePath,
          totalRequests: networkMonitoring.requests.length,
          totalResponses: networkMonitoring.responses.length,
          failures: networkMonitoring.failures.length,
          failedRequests: networkMonitoring.failures,
          slowRequests: networkMonitoring.responses.filter((resp: any) => 
            resp.timestamp && new Date(resp.timestamp).getTime() > Date.now() - 5000
          ),
          errorResponses: networkMonitoring.responses.filter((resp: any) => 
            resp.status >= 400
          )
        };

        networkSummary.push(summary);

        console.log(`  Total requests: ${summary.totalRequests}`);
        console.log(`  Failed requests: ${summary.failures}`);
        console.log(`  Error responses (4xx/5xx): ${summary.errorResponses.length}`);

        if (summary.failures > 0) {
          console.log(`  Failed request details:`);
          summary.failedRequests.forEach((req: any) => {
            console.log(`    • ${req.method} ${req.url} - ${req.failure}`);
          });
        }

        if (summary.errorResponses.length > 0) {
          console.log(`  Error response details:`);
          summary.errorResponses.forEach((resp: any) => {
            console.log(`    • ${resp.status} ${resp.url}`);
          });
        }

      } catch (error) {
        console.log(`  ❌ Network monitoring failed for ${pagePath}: ${error}`);
      }
    }

    // Network summary
    console.log('\n=== NETWORK MONITORING SUMMARY ===');
    const totalRequests = networkSummary.reduce((sum, page) => sum + page.totalRequests, 0);
    const totalFailures = networkSummary.reduce((sum, page) => sum + page.failures, 0);
    const totalErrors = networkSummary.reduce((sum, page) => sum + page.errorResponses.length, 0);

    console.log(`Total requests across all pages: ${totalRequests}`);
    console.log(`Total network failures: ${totalFailures}`);
    console.log(`Total error responses: ${totalErrors}`);

    if (totalFailures > 0 || totalErrors > 0) {
      console.log('\n⚠️ Network issues detected - check individual page reports above');
    } else {
      console.log('\n✅ No network issues detected');
    }
  });

  test('should check for performance issues', async ({ page }) => {
    console.log('\n⚡ Checking for performance issues');

    const performanceThresholds = {
      pageLoadTime: 5000, // 5 seconds
      firstContentfulPaint: 2000, // 2 seconds
      largestContentfulPaint: 3000, // 3 seconds
      cumulativeLayoutShift: 0.1
    };

    const pagesToTest = ['/', '/login', '/templates'];
    const performanceIssues: any[] = [];

    for (const pagePath of pagesToTest) {
      console.log(`\nAnalyzing performance for ${pagePath}`);

      try {
        const startTime = Date.now();
        
        await page.goto(pagePath);
        await testUtils.waitForPageReady();
        
        const loadTime = Date.now() - startTime;

        // Get Web Vitals and performance metrics
        const metrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = performance.getEntriesByType('paint');
          
          return {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
            resourceCount: performance.getEntriesByType('resource').length,
            transferSize: performance.getEntriesByType('navigation')[0] ? 
              (performance.getEntriesByType('navigation')[0] as any).transferSize : 0
          };
        });

        const issues: string[] = [];

        if (loadTime > performanceThresholds.pageLoadTime) {
          issues.push(`Slow page load: ${loadTime}ms (threshold: ${performanceThresholds.pageLoadTime}ms)`);
        }

        if (metrics.firstContentfulPaint > performanceThresholds.firstContentfulPaint) {
          issues.push(`Slow FCP: ${metrics.firstContentfulPaint}ms (threshold: ${performanceThresholds.firstContentfulPaint}ms)`);
        }

        if (metrics.resourceCount > 100) {
          issues.push(`Too many resources: ${metrics.resourceCount} (consider bundling)`);
        }

        if (metrics.transferSize > 2000000) { // 2MB
          issues.push(`Large transfer size: ${(metrics.transferSize / 1024 / 1024).toFixed(2)}MB`);
        }

        const pagePerformance = {
          path: pagePath,
          loadTime,
          metrics,
          issues,
          hasIssues: issues.length > 0
        };

        performanceIssues.push(pagePerformance);

        console.log(`  Load time: ${loadTime}ms`);
        console.log(`  FCP: ${metrics.firstContentfulPaint}ms`);
        console.log(`  Resources: ${metrics.resourceCount}`);
        console.log(`  Transfer size: ${(metrics.transferSize / 1024 / 1024).toFixed(2)}MB`);

        if (issues.length > 0) {
          console.log(`  ⚠️ Issues found:`);
          issues.forEach(issue => console.log(`    • ${issue}`));
        } else {
          console.log(`  ✅ No performance issues`);
        }

      } catch (error) {
        console.log(`  ❌ Performance analysis failed for ${pagePath}: ${error}`);
      }
    }

    // Performance summary
    console.log('\n=== PERFORMANCE SUMMARY ===');
    const pagesWithIssues = performanceIssues.filter(page => page.hasIssues);
    
    if (pagesWithIssues.length > 0) {
      console.log(`⚠️ ${pagesWithIssues.length}/${performanceIssues.length} pages have performance issues`);
      
      pagesWithIssues.forEach(page => {
        console.log(`\n${page.path}:`);
        page.issues.forEach((issue: string) => console.log(`  • ${issue}`));
      });
    } else {
      console.log('✅ No performance issues detected across all tested pages');
    }
  });

  test('should validate HTML structure and accessibility', async ({ page }) => {
    console.log('\n♿ Validating HTML structure and accessibility');

    const pagesToValidate = ['/', '/login', '/signup', '/templates'];
    const validationResults: any[] = [];

    for (const pagePath of pagesToValidate) {
      console.log(`\nValidating ${pagePath}`);

      try {
        await page.goto(pagePath);
        await testUtils.waitForPageReady();

        // HTML structure validation
        const htmlValidation = await page.evaluate(() => {
          const issues: string[] = [];
          
          // Check for missing lang attribute
          if (!document.documentElement.lang) {
            issues.push('Missing lang attribute on <html>');
          }
          
          // Check for missing title
          if (!document.title || document.title.trim() === '') {
            issues.push('Missing or empty <title>');
          }
          
          // Check for missing meta description
          const metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription || !metaDescription.getAttribute('content')) {
            issues.push('Missing meta description');
          }
          
          // Check for duplicate IDs
          const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
          const uniqueIds = new Set(allIds);
          if (allIds.length !== uniqueIds.size) {
            issues.push('Duplicate IDs found');
          }
          
          // Check for images without alt text
          const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
          if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
          }
          
          // Check for form inputs without labels
          const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
          const associatedLabels = Array.from(inputsWithoutLabels).filter(input => {
            const id = input.id;
            return id && document.querySelector(`label[for="${id}"]`);
          });
          const unassociatedInputs = inputsWithoutLabels.length - associatedLabels.length;
          
          if (unassociatedInputs > 0) {
            issues.push(`${unassociatedInputs} form inputs without proper labels`);
          }
          
          // Check for missing heading hierarchy
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));
          
          if (headingLevels.length > 0) {
            if (headingLevels[0] !== 1) {
              issues.push('First heading is not h1');
            }
            
            // Check for skipped heading levels
            for (let i = 1; i < headingLevels.length; i++) {
              if (headingLevels[i] - headingLevels[i-1] > 1) {
                issues.push('Heading levels skipped (accessibility issue)');
                break;
              }
            }
          }
          
          return {
            issues,
            title: document.title,
            headingCount: headings.length,
            imageCount: document.querySelectorAll('img').length,
            formCount: document.querySelectorAll('form').length
          };
        });

        const pageValidation = {
          path: pagePath,
          validation: htmlValidation,
          hasIssues: htmlValidation.issues.length > 0
        };

        validationResults.push(pageValidation);

        console.log(`  Title: "${htmlValidation.title}"`);
        console.log(`  Headings: ${htmlValidation.headingCount}`);
        console.log(`  Images: ${htmlValidation.imageCount}`);
        console.log(`  Forms: ${htmlValidation.formCount}`);

        if (htmlValidation.issues.length > 0) {
          console.log(`  ⚠️ Validation issues:`);
          htmlValidation.issues.forEach(issue => console.log(`    • ${issue}`));
        } else {
          console.log(`  ✅ No validation issues found`);
        }

      } catch (error) {
        console.log(`  ❌ Validation failed for ${pagePath}: ${error}`);
      }
    }

    // Validation summary
    console.log('\n=== HTML VALIDATION SUMMARY ===');
    const pagesWithIssues = validationResults.filter(page => page.hasIssues);
    
    if (pagesWithIssues.length > 0) {
      console.log(`⚠️ ${pagesWithIssues.length}/${validationResults.length} pages have validation issues`);
      
      const allIssues = pagesWithIssues.flatMap(page => page.validation.issues);
      const uniqueIssues = [...new Set(allIssues)];
      
      console.log('\nMost common issues:');
      uniqueIssues.forEach(issue => {
        const count = allIssues.filter(i => i === issue).length;
        console.log(`  • ${issue} (${count} pages)`);
      });
    } else {
      console.log('✅ No validation issues found across all tested pages');
    }
  });

  test.afterEach(async ({ page }) => {
    // Final error summary for this test
    console.log('\n=== TEST ERROR SUMMARY ===');
    console.log(`Console messages: ${consoleMessages.length}`);
    console.log(`Errors detected: ${globalErrors.length}`);
    console.log(`Network failures: ${networkFailures.length}`);

    if (globalErrors.length > 0) {
      console.log('\nErrors in this test:');
      globalErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Clear arrays for next test
    globalErrors = [];
    networkFailures = [];
    consoleMessages = [];
  });
});