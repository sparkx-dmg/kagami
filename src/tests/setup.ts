import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia if needed (for components checking media queries)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
// Mock IntersectionObserver for Framer Motion viewport triggers in JSDOM
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
// Mock React 19 custom APIs for JSDOM testing
vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>();
  return {
    ...original,
    use: (promise: any) => {
      if (promise && typeof promise.then === 'function') {
        if (promise._resolved) return promise._resolved;
        return { id: 'mangadex-12345' };
      }
      return promise;
    },
    ViewTransition: ({ children }: any) => children,
  };
});
