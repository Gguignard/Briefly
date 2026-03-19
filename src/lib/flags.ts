function isEnabled(envVar: string | undefined): boolean {
  return envVar?.toLowerCase() !== "false";
}

function isOptIn(envVar: string | undefined): boolean {
  return envVar?.toLowerCase() === "true";
}

/**
 * Feature flags read from environment variables on every access (getter-based).
 * Opt-out flags (default: enabled) are disabled only when set to "false".
 * Opt-in flags (default: disabled) are enabled only when set to "true".
 * Comparison is case-insensitive.
 */
export const featureFlags = {
  get signupEnabled() {
    return isEnabled(process.env.FEATURE_SIGNUP_ENABLED);
  },
  get premiumEnabled() {
    return isEnabled(process.env.FEATURE_PREMIUM_ENABLED);
  },
  get maintenanceMode() {
    return isOptIn(process.env.FEATURE_MAINTENANCE_MODE);
  },
  get llmEnabled() {
    return isEnabled(process.env.FEATURE_LLM_ENABLED);
  },
  get emailIngestionEnabled() {
    return isEnabled(process.env.FEATURE_EMAIL_INGESTION_ENABLED);
  },
};
