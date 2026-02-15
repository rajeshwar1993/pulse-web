import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock sessionStorage for tests
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeAll(() => {
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });
});

afterEach(() => {
  sessionStorageMock.clear();
});
