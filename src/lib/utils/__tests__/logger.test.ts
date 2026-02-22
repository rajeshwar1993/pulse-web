import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe("debug", () => {
    it("outputs in development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("../logger");

      logger.debug("test message");

      expect(console.log).toHaveBeenCalledWith("[DEBUG] test message", "");
    });

    it("does not output in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");

      logger.debug("test message");

      expect(console.log).not.toHaveBeenCalled();
    });

    it("passes context when provided", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("../logger");

      logger.debug("test message", { key: "value" });

      expect(console.log).toHaveBeenCalledWith("[DEBUG] test message", {
        key: "value",
      });
    });
  });

  describe("info", () => {
    it("always outputs", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");

      logger.info("info message");

      expect(console.info).toHaveBeenCalledWith("[INFO] info message", "");
    });

    it("passes context when provided", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");

      logger.info("info message", { detail: 123 });

      expect(console.info).toHaveBeenCalledWith("[INFO] info message", {
        detail: 123,
      });
    });
  });

  describe("warn", () => {
    it("always outputs", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");

      logger.warn("warn message");

      expect(console.warn).toHaveBeenCalledWith(
        "[WARN] warn message",
        undefined,
        "",
      );
    });

    it("passes error and context when provided", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");
      const err = new Error("oops");

      logger.warn("warn message", err, { extra: true });

      expect(console.warn).toHaveBeenCalledWith("[WARN] warn message", err, {
        extra: true,
      });
    });
  });

  describe("error", () => {
    it("always outputs", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");

      logger.error("error message");

      expect(console.error).toHaveBeenCalledWith(
        "[ERROR] error message",
        undefined,
        "",
      );
    });

    it("always outputs in development too", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("../logger");

      logger.error("error message");

      expect(console.error).toHaveBeenCalledWith(
        "[ERROR] error message",
        undefined,
        "",
      );
    });

    it("passes error and context when provided", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("../logger");
      const err = new Error("something broke");

      logger.error("error message", err, { userId: "abc" });

      expect(console.error).toHaveBeenCalledWith("[ERROR] error message", err, {
        userId: "abc",
      });
    });
  });
});
