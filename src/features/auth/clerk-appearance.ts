import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#7C3AED",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#1E1040",
    colorTextSecondary: "#7C6FA0",
    colorTextOnPrimaryBackground: "#ffffff",
    colorInputText: "#1E1040",
    colorDanger: "#DC2626",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    card: { boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)", border: "none" },
    formButtonPrimary: { backgroundImage: "none" },
  },
};
