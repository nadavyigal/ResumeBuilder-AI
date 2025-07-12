import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
  useParams() {
    return { id: 'test-id' };
  },
}));

// Mock PostHog
vi.mock('posthog-js', () => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
}));

// Setup global fetch mock if needed
global.fetch = vi.fn();

// Mock window.alert
global.alert = vi.fn(); 