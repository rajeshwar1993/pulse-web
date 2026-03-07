import "@testing-library/jest-dom";
import { afterEach, beforeAll, vi } from "vitest";

// Mock next/image to render a plain <img> tag in tests
vi.mock("next/image", () => {
  const { createElement } = require("react");
  return {
    default: (props: Record<string, unknown>) => {
      const {
        fill: _fill,
        priority: _priority,
        quality: _quality,
        loader: _loader,
        placeholder: _placeholder,
        blurDataURL: _blurDataURL,
        ...rest
      } = props;
      return createElement("img", rest);
    },
  };
});

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

// Mock localStorage for tests
const localStorageMock = (() => {
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
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
});

afterEach(() => {
  sessionStorageMock.clear();
  localStorageMock.clear();
});
