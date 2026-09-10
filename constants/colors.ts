/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#10212B',
    tint: '#00B8A9',

    // Core surfaces
    background: '#F5F7F4',
    foreground: '#10212B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#10212B',

    // Primary action color (buttons, links, active states)
    primary: '#00A99D',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E6F4F1',
    secondaryForeground: '#14534D',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E7ECEA',
    mutedForeground: '#6C7D7A',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FFF0D9',
    accentForeground: '#7A4C16',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#DCE6E2',
    input: '#DCE6E2',
  },

  dark: {
    text: '#F2FBF8',
    tint: '#58D8C8',
    background: '#0D1B20',
    foreground: '#F2FBF8',
    card: '#15272C',
    cardForeground: '#F2FBF8',
    primary: '#42CDBE',
    primaryForeground: '#08201E',
    secondary: '#19393A',
    secondaryForeground: '#B8F2EA',
    muted: '#1A3034',
    mutedForeground: '#9BB4B0',
    accent: '#4B3620',
    accentForeground: '#FFD08B',
    destructive: '#FF746F',
    destructiveForeground: '#2A0F0E',
    border: '#294247',
    input: '#294247',
  },

  radius: 18,
};

export default colors;
