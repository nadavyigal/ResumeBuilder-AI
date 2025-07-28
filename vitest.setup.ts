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



// Mock Mixpanel
vi.mock('mixpanel-browser', () => ({
  init: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  people: {
    set: vi.fn(),
  },
  get_distinct_id: vi.fn(() => 'test-user-id'),
}));

// Setup global fetch mock if needed
global.fetch = vi.fn();

// Mock window.alert
global.alert = vi.fn(); 