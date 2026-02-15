import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRandomWisdom,
  clearLastWisdom,
  getMultipleWisdom,
} from '../wisdom-service';
import { wisdomPhrases } from '../../data/wisdom-library';

describe('wisdom-service', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    clearLastWisdom();
  });

  describe('getRandomWisdom', () => {
    it('should return a string', () => {
      const wisdom = getRandomWisdom();
      expect(typeof wisdom).toBe('string');
    });

    it('should return a phrase from the wisdom library', () => {
      const wisdom = getRandomWisdom();
      expect(wisdomPhrases).toContain(wisdom);
    });

    it('should not return the same phrase twice consecutively', () => {
      const firstWisdom = getRandomWisdom();
      const secondWisdom = getRandomWisdom();

      // With 60 phrases, it's extremely unlikely to get the same phrase twice
      // if the no-repeat logic is working correctly
      expect(secondWisdom).not.toBe(firstWisdom);
    });

    it('should return different phrases on multiple calls', () => {
      const wisdoms = new Set<string>();

      // Call 10 times and collect unique values
      for (let i = 0; i < 10; i++) {
        wisdoms.add(getRandomWisdom());
      }

      // Should have gotten at least 5 unique phrases (statistically very likely)
      expect(wisdoms.size).toBeGreaterThanOrEqual(5);
    });

    it('should handle consecutive calls without errors', () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          getRandomWisdom();
        }
      }).not.toThrow();
    });
  });

  describe('clearLastWisdom', () => {
    it('should clear the last wisdom from storage', () => {
      // Set a wisdom
      getRandomWisdom();

      // Clear it
      clearLastWisdom();

      // Next call should work without issues
      const wisdom = getRandomWisdom();
      expect(typeof wisdom).toBe('string');
    });
  });

  describe('getMultipleWisdom', () => {
    it('should return requested number of wisdom phrases', () => {
      const wisdoms = getMultipleWisdom(5);
      expect(wisdoms).toHaveLength(5);
    });

    it('should return unique wisdom phrases', () => {
      const wisdoms = getMultipleWisdom(10);
      const uniqueWisdoms = new Set(wisdoms);
      expect(uniqueWisdoms.size).toBe(10);
    });

    it('should not exceed library size', () => {
      const wisdoms = getMultipleWisdom(1000);
      expect(wisdoms.length).toBeLessThanOrEqual(wisdomPhrases.length);
    });

    it('should return all phrases from the library', () => {
      const wisdoms = getMultipleWisdom(10);
      wisdoms.forEach((wisdom) => {
        expect(wisdomPhrases).toContain(wisdom);
      });
    });
  });
});
