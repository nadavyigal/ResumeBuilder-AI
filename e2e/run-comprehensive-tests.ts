import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  errors: string[];
  details: any;
}

class ComprehensiveTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive ResumeBuilder AI Testing Suite');
    console.log('=' .repeat(60));
    
    this.startTime = Date.now();

    const testSuites = [
      {
        name: 'Login Investigation',
        file: '01-login-investigation.spec.ts',
        description: 'Comprehensive login testing and authentication analysis'
      },
      {
        name: 'Navigation Testing',
        file: '02-navigation-testing.spec.ts',
        description: 'Complete page navigation and routing verification'
      },
      {
        name: 'Functionality Testing',
        file: '03-functionality-testing.spec.ts',
        description: 'Application features and UI component testing'
      },
      {
        name: 'Error Detection',
        file: '04-error-detection.spec.ts',
        description: 'Error monitoring and issue identification'
      },
      {
        name: 'User Flow E2E',
        file: '05-user-flow-e2e.spec.ts',
        description: 'End-to-end user journey testing'
      }
    ];

    console.log('📋 Test Suites to Execute:');
    testSuites.forEach((suite, index) => {
      console.log(`${index + 1}. ${suite.name}: ${suite.description}`);
    });
    console.log('\\n');

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    await this.generateFinalReport();
  }

  private async runTestSuite(suite: { name: string; file: string; description: string }): Promise<void> {
    console.log(`\\n🧪 Running ${suite.name}...`);
    console.log(`📄 File: ${suite.file}`);
    console.log(`📝 Description: ${suite.description}`);
    console.log('-'.repeat(50));

    const suiteStartTime = Date.now();

    try {
      const result = await this.executePlaywrightTest(suite.file);
      
      const duration = Date.now() - suiteStartTime;
      
      this.results.push({
        name: suite.name,
        status: result.success ? 'passed' : 'failed',
        duration,
        errors: result.errors,
        details: result
      });

      if (result.success) {
        console.log(`✅ ${suite.name} completed successfully (${this.formatDuration(duration)})`);
      } else {
        console.log(`❌ ${suite.name} failed (${this.formatDuration(duration)})`);
        console.log('Errors:', result.errors);
      }

    } catch (error) {
      const duration = Date.now() - suiteStartTime;
      
      this.results.push({
        name: suite.name,
        status: 'error',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { error }
      });

      console.log(`💥 ${suite.name} encountered an error (${this.formatDuration(duration)})`);
      console.log('Error:', error);
    }
  }

  private async executePlaywrightTest(testFile: string): Promise<{ success: boolean; errors: string[]; output: string }> {
    return new Promise((resolve) => {
      const playwright = spawn('npx', ['playwright', 'test', testFile], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errors: string[] = [];

      playwright.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(text);
      });

      playwright.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        errors.push(text);
        console.error(text);
      });

      playwright.on('close', (code) => {
        resolve({
          success: code === 0,
          errors,
          output
        });
      });

      playwright.on('error', (error) => {
        errors.push(error.message);
        resolve({
          success: false,
          errors,
          output
        });
      });
    });
  }

  private async generateFinalReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\\n\\n');
    console.log('=' .repeat(80));
    console.log('📊 COMPREHENSIVE TEST SUITE FINAL REPORT');
    console.log('=' .repeat(80));
    
    console.log(`\\n⏱️ Total Execution Time: ${this.formatDuration(totalDuration)}`);
    console.log(`📅 Completed: ${new Date().toISOString()}`);
    
    const passedTests = this.results.filter(r => r.status === 'passed');
    const failedTests = this.results.filter(r => r.status === 'failed');
    const errorTests = this.results.filter(r => r.status === 'error');
    
    console.log(`\\n📈 Test Results Summary:`);
    console.log(`  ✅ Passed: ${passedTests.length}/${this.results.length}`);
    console.log(`  ❌ Failed: ${failedTests.length}/${this.results.length}`);
    console.log(`  💥 Errors: ${errorTests.length}/${this.results.length}`);
    
    if (passedTests.length === this.results.length) {
      console.log(`\\n🎉 All tests passed! The ResumeBuilder AI application appears to be functioning well.`);
    } else {
      console.log(`\\n⚠️ Some tests failed or encountered errors. Review the details below:`);
    }

    console.log(`\\n📋 Detailed Results:`);
    this.results.forEach((result, index) => {
      const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '💥';
      console.log(`\\n${index + 1}. ${statusIcon} ${result.name}`);
      console.log(`   Duration: ${this.formatDuration(result.duration)}`);
      console.log(`   Status: ${result.status.toUpperCase()}`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.length}`);
        result.errors.slice(0, 3).forEach(error => {
          console.log(`     • ${error.substring(0, 100)}...`);
        });
      }
    });

    // Generate recommendations
    console.log(`\\n💡 Recommendations:`);
    
    if (failedTests.some(t => t.name.includes('Login'))) {
      console.log(`  🔐 Authentication Issues: Check Supabase configuration and user credentials`);
    }
    
    if (failedTests.some(t => t.name.includes('Navigation'))) {
      console.log(`  🧭 Navigation Issues: Verify route configurations and middleware`);
    }
    
    if (failedTests.some(t => t.name.includes('Error'))) {
      console.log(`  🚨 Error Handling: Review error boundaries and user feedback mechanisms`);
    }
    
    if (errorTests.length > 0) {
      console.log(`  🔧 Test Environment: Check if development server is running and accessible`);
    }

    // Save report to file
    await this.saveReportToFile();
    
    console.log(`\\n📄 Detailed report saved to: test-report-${Date.now()}.json`);
    console.log(`📸 Screenshots saved to: ./screenshots/`);
    console.log(`\\n🔗 For HTML report, run: npx playwright show-report`);
    
    console.log('\\n' + '=' .repeat(80));
  }

  private async saveReportToFile(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        errors: this.results.filter(r => r.status === 'error').length
      },
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };

    const filename = `test-report-${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(report, null, 2));
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests().catch(console.error);
}