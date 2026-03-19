import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { featureFlags } from "../flags";

describe("featureFlags", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.FEATURE_SIGNUP_ENABLED;
    delete process.env.FEATURE_PREMIUM_ENABLED;
    delete process.env.FEATURE_MAINTENANCE_MODE;
    delete process.env.FEATURE_LLM_ENABLED;
    delete process.env.FEATURE_EMAIL_INGESTION_ENABLED;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("default values (no env vars set)", () => {
    it("should enable signup by default", () => {
      expect(featureFlags.signupEnabled).toBe(true);
    });

    it("should enable premium by default", () => {
      expect(featureFlags.premiumEnabled).toBe(true);
    });

    it("should disable maintenance mode by default", () => {
      expect(featureFlags.maintenanceMode).toBe(false);
    });

    it("should enable LLM by default", () => {
      expect(featureFlags.llmEnabled).toBe(true);
    });

    it("should enable email ingestion by default", () => {
      expect(featureFlags.emailIngestionEnabled).toBe(true);
    });
  });

  describe("opt-out flags (disabled when set to 'false')", () => {
    it("should disable signup when FEATURE_SIGNUP_ENABLED=false", () => {
      process.env.FEATURE_SIGNUP_ENABLED = "false";
      expect(featureFlags.signupEnabled).toBe(false);
    });

    it("should disable premium when FEATURE_PREMIUM_ENABLED=false", () => {
      process.env.FEATURE_PREMIUM_ENABLED = "false";
      expect(featureFlags.premiumEnabled).toBe(false);
    });

    it("should disable LLM when FEATURE_LLM_ENABLED=false", () => {
      process.env.FEATURE_LLM_ENABLED = "false";
      expect(featureFlags.llmEnabled).toBe(false);
    });

    it("should disable email ingestion when FEATURE_EMAIL_INGESTION_ENABLED=false", () => {
      process.env.FEATURE_EMAIL_INGESTION_ENABLED = "false";
      expect(featureFlags.emailIngestionEnabled).toBe(false);
    });
  });

  describe("opt-in flags (enabled only when explicitly set to 'true')", () => {
    it("should enable maintenance mode when FEATURE_MAINTENANCE_MODE=true", () => {
      process.env.FEATURE_MAINTENANCE_MODE = "true";
      expect(featureFlags.maintenanceMode).toBe(true);
    });

    it("should not enable maintenance mode for arbitrary values", () => {
      process.env.FEATURE_MAINTENANCE_MODE = "yes";
      expect(featureFlags.maintenanceMode).toBe(false);
    });
  });

  describe("case-insensitive comparison", () => {
    it("should disable signup for FEATURE_SIGNUP_ENABLED=FALSE", () => {
      process.env.FEATURE_SIGNUP_ENABLED = "FALSE";
      expect(featureFlags.signupEnabled).toBe(false);
    });

    it("should disable signup for FEATURE_SIGNUP_ENABLED=False", () => {
      process.env.FEATURE_SIGNUP_ENABLED = "False";
      expect(featureFlags.signupEnabled).toBe(false);
    });

    it("should enable maintenance for FEATURE_MAINTENANCE_MODE=TRUE", () => {
      process.env.FEATURE_MAINTENANCE_MODE = "TRUE";
      expect(featureFlags.maintenanceMode).toBe(true);
    });

    it("should enable maintenance for FEATURE_MAINTENANCE_MODE=True", () => {
      process.env.FEATURE_MAINTENANCE_MODE = "True";
      expect(featureFlags.maintenanceMode).toBe(true);
    });
  });

  describe("dynamic evaluation (getters read env on every access)", () => {
    it("should reflect env changes without module reload", () => {
      expect(featureFlags.maintenanceMode).toBe(false);
      process.env.FEATURE_MAINTENANCE_MODE = "true";
      expect(featureFlags.maintenanceMode).toBe(true);
      delete process.env.FEATURE_MAINTENANCE_MODE;
      expect(featureFlags.maintenanceMode).toBe(false);
    });
  });

  describe("opt-out flags remain enabled for arbitrary values", () => {
    it("should keep signup enabled for FEATURE_SIGNUP_ENABLED=true", () => {
      process.env.FEATURE_SIGNUP_ENABLED = "true";
      expect(featureFlags.signupEnabled).toBe(true);
    });

    it("should keep signup enabled for arbitrary value", () => {
      process.env.FEATURE_SIGNUP_ENABLED = "whatever";
      expect(featureFlags.signupEnabled).toBe(true);
    });
  });
});
