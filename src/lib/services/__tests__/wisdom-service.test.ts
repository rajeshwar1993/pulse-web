import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLastWisdom,
  getMultipleWisdomIndices,
  getRandomWisdomIndex,
} from "../wisdom-service";

const PHRASE_COUNT = 60;

describe("wisdom-service", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    clearLastWisdom();
  });

  describe("getRandomWisdomIndex", () => {
    it("should return a number", () => {
      const index = getRandomWisdomIndex(PHRASE_COUNT);
      expect(typeof index).toBe("number");
    });

    it("should return an index within the valid range", () => {
      const index = getRandomWisdomIndex(PHRASE_COUNT);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(PHRASE_COUNT);
    });

    it("should not return the same index twice consecutively", () => {
      const firstIndex = getRandomWisdomIndex(PHRASE_COUNT);
      const secondIndex = getRandomWisdomIndex(PHRASE_COUNT);

      // With 60 phrases, it's extremely unlikely to get the same index twice
      // if the no-repeat logic is working correctly
      expect(secondIndex).not.toBe(firstIndex);
    });

    it("should return different indices on multiple calls", () => {
      const indices = new Set<number>();

      // Call 10 times and collect unique values
      for (let i = 0; i < 10; i++) {
        indices.add(getRandomWisdomIndex(PHRASE_COUNT));
      }

      // Should have gotten at least 5 unique indices (statistically very likely)
      expect(indices.size).toBeGreaterThanOrEqual(5);
    });

    it("should handle consecutive calls without errors", () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          getRandomWisdomIndex(PHRASE_COUNT);
        }
      }).not.toThrow();
    });

    it("should respect a custom count parameter", () => {
      const customCount = 5;
      const indices = new Set<number>();

      for (let i = 0; i < 20; i++) {
        const index = getRandomWisdomIndex(customCount);
        indices.add(index);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(customCount);
      }
    });
  });

  describe("clearLastWisdom", () => {
    it("should clear the last wisdom index from storage", () => {
      // Set a wisdom index
      getRandomWisdomIndex(PHRASE_COUNT);

      // Clear it
      clearLastWisdom();

      // Next call should work without issues
      const index = getRandomWisdomIndex(PHRASE_COUNT);
      expect(typeof index).toBe("number");
    });
  });

  describe("getMultipleWisdomIndices", () => {
    it("should return requested number of wisdom indices", () => {
      const indices = getMultipleWisdomIndices(5, PHRASE_COUNT);
      expect(indices).toHaveLength(5);
    });

    it("should return unique wisdom indices", () => {
      const indices = getMultipleWisdomIndices(10, PHRASE_COUNT);
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(10);
    });

    it("should not exceed total count", () => {
      const indices = getMultipleWisdomIndices(1000, PHRASE_COUNT);
      expect(indices.length).toBeLessThanOrEqual(PHRASE_COUNT);
    });

    it("should return valid indices within range", () => {
      const indices = getMultipleWisdomIndices(10, PHRASE_COUNT);
      for (const index of indices) {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(PHRASE_COUNT);
      }
    });

    it("should respect a custom total count", () => {
      const customTotal = 5;
      const indices = getMultipleWisdomIndices(3, customTotal);
      expect(indices).toHaveLength(3);
      for (const index of indices) {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(customTotal);
      }
    });
  });
});
