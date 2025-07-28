import { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

async function globalSetup(config: FullConfig) {
  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  
  console.log('🔧 Global setup complete');
  console.log('📍 Base URL:', config.projects[0].use.baseURL);
  console.log('🌍 Environment variables loaded');
  
  // Wait for development server to be ready
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseURL}/api/health/overall`);
    if (response.ok) {
      console.log('✅ Health check passed - server is ready');
    } else {
      console.log('⚠️ Health check failed, but continuing with tests');
    }
  } catch (error) {
    console.log('⚠️ Could not reach health endpoint, but continuing with tests');
  }
}

export default globalSetup;