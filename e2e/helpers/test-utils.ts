import { Page, expect } from '@playwright/test';

export interface TestCredentials {
  email: string;
  password: string;
}

export const TEST_CREDENTIALS: TestCredentials = {
  email: 'test@example.com',
  password: 'testpassword123'
};

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Monitor console errors and warnings
   */
  async startConsoleMonitoring(): Promise<string[]> {
    const logs: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    this.page.on('pageerror', (error) => {
      logs.push(`[PAGE ERROR] ${error.message}`);
    });

    return logs;
  }

  /**
   * Monitor network requests and responses
   */
  async startNetworkMonitoring(): Promise<{
    requests: any[];
    responses: any[];
    failures: any[];
  }> {
    const requests: any[] = [];
    const responses: any[] = [];
    const failures: any[] = [];

    this.page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('requestfailed', (request) => {
      failures.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        timestamp: new Date().toISOString()
      });
    });

    return { requests, responses, failures };
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Wait for page to be ready (no network activity for 500ms)
   */
  async waitForPageReady(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: TestCredentials = TEST_CREDENTIALS): Promise<{
    success: boolean;
    error?: string;
    logs: string[];
  }> {
    const logs = await this.startConsoleMonitoring();
    
    try {
      await this.page.goto('/login');
      await this.waitForPageReady();

      // Fill login form
      await this.page.fill('#email', credentials.email);
      await this.page.fill('#password', credentials.password);

      // Submit form
      await this.page.click('button[type="submit"]');

      // Wait for navigation or error
      try {
        await this.page.waitForURL('**/dashboard', { timeout: 10000 });
        return { success: true, logs };
      } catch {
        // Check for error messages
        const errorElement = await this.page.locator('.bg-red-50').first();
        const errorText = await errorElement.isVisible() 
          ? await errorElement.textContent() 
          : 'Unknown login error';
        
        return { 
          success: false, 
          error: errorText || 'Login failed - no redirect to dashboard',
          logs 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        logs 
      };
    }
  }

  /**
   * Try Google OAuth login
   */
  async tryGoogleLogin(): Promise<{
    success: boolean;
    error?: string;
    logs: string[];
  }> {
    const logs = await this.startConsoleMonitoring();
    
    try {
      await this.page.goto('/login');
      await this.waitForPageReady();

      // Click Google login button
      await this.page.click('button:has-text("Continue with Google")');

      // Wait for popup or redirect
      await this.page.waitForTimeout(3000);

      return { success: true, logs };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google login failed',
        logs 
      };
    }
  }

  /**
   * Check authentication state
   */
  async checkAuthState(): Promise<{
    isAuthenticated: boolean;
    currentUrl: string;
    logs: string[];
  }> {
    const logs = await this.startConsoleMonitoring();
    const currentUrl = this.page.url();
    
    // Try to access a protected route
    await this.page.goto('/dashboard');
    await this.waitForPageReady();
    
    const finalUrl = this.page.url();
    const isAuthenticated = finalUrl.includes('/dashboard') && !finalUrl.includes('/login');
    
    return {
      isAuthenticated,
      currentUrl: finalUrl,
      logs
    };
  }

  /**
   * Test all navigation links
   */
  async testNavigation(): Promise<{
    workingLinks: string[];
    brokenLinks: string[];
    errors: string[];
  }> {
    const workingLinks: string[] = [];
    const brokenLinks: string[] = [];
    const errors: string[] = [];

    // Define all routes to test
    const routes = [
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

    for (const route of routes) {
      try {
        const response = await this.page.goto(route);
        await this.waitForPageReady();
        
        if (response && response.status() < 400) {
          workingLinks.push(route);
        } else {
          brokenLinks.push(`${route} (${response?.status()})`);
        }
      } catch (error) {
        brokenLinks.push(route);
        errors.push(`${route}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { workingLinks, brokenLinks, errors };
  }

  /**
   * Extract all form fields from current page
   */
  async getFormFields(): Promise<{
    inputs: any[];
    buttons: any[];
    forms: any[];
  }> {
    const inputs = await this.page.locator('input').all();
    const buttons = await this.page.locator('button').all();
    const forms = await this.page.locator('form').all();

    return {
      inputs: await Promise.all(inputs.map(async (input) => ({
        type: await input.getAttribute('type'),
        name: await input.getAttribute('name'),
        id: await input.getAttribute('id'),
        required: await input.getAttribute('required'),
        placeholder: await input.getAttribute('placeholder')
      }))),
      buttons: await Promise.all(buttons.map(async (button) => ({
        type: await button.getAttribute('type'),
        text: await button.textContent(),
        disabled: await button.isDisabled()
      }))),
      forms: await Promise.all(forms.map(async (form) => ({
        action: await form.getAttribute('action'),
        method: await form.getAttribute('method')
      })))
    };
  }

  /**
   * Check for accessibility issues
   */
  async checkAccessibility(): Promise<{
    missingAltText: number;
    missingLabels: number;
    lowContrast: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check for images without alt text
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt text`);
    }

    // Check for inputs without labels
    const inputsWithoutLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} inputs missing labels`);
    }

    return {
      missingAltText: imagesWithoutAlt,
      missingLabels: inputsWithoutLabels,
      lowContrast: 0, // Would need additional tools for contrast checking
      issues
    };
  }
}