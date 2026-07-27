export const THEME_STORAGE_KEY = "rapid-theme";
export const DEFAULT_THEME = "dark";

export const siteThemes = ["dark", "light"] as const;

export type SiteTheme = (typeof siteThemes)[number];

export function normalizeTheme(value: unknown): SiteTheme {
  return value === "light" ? "light" : DEFAULT_THEME;
}

export function getThemeInitScript() {
  return `
    (function() {
      var root = document.documentElement;
      var theme = "${DEFAULT_THEME}";
      try {
        var storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
        theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "${DEFAULT_THEME}";
      } catch {
        theme = "${DEFAULT_THEME}";
      }

      root.dataset.theme = theme;
      root.dataset.themeReady = "true";
      root.style.colorScheme = theme;
    })();
  `;
}

export function applyTheme(theme: SiteTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themeReady = "true";
  root.style.colorScheme = theme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures and still apply the theme for the active session.
  }
}

export function readTheme(): SiteTheme {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  return normalizeTheme(document.documentElement.dataset.theme);
}
