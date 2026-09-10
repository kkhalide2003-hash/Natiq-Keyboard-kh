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
    text: '#10203A',
    tint: '#1D5CFF',
    background: '#F4F7FB',
    foreground: '#10203A',
    card: '#FFFFFF',
    cardForeground: '#10203A',
    primary: '#1D5CFF',
    primaryForeground: '#FFFFFF',
    secondary: '#E8EEFA',
    secondaryForeground: '#19325A',
    muted: '#EDF2F8',
    mutedForeground: '#6E7D93',
    accent: '#E5EDFF',
    accentForeground: '#1D5CFF',
    destructive: '#D94456',
    destructiveForeground: '#FFFFFF',
    border: '#DCE5F0',
    input: '#DCE5F0',
    success: '#238A68',
    gold: '#E0A63A',
  },
  dark: {
    text: '#F6F8FC',
    tint: '#86A7FF',
    background: '#0C1424',
    foreground: '#F6F8FC',
    card: '#152238',
    cardForeground: '#F6F8FC',
    primary: '#86A7FF',
    primaryForeground: '#0C1424',
    secondary: '#1C2D49',
    secondaryForeground: '#DDE7FF',
    muted: '#1A2940',
    mutedForeground: '#9CAEC8',
    accent: '#1C315F',
    accentForeground: '#9DB7FF',
    destructive: '#F47D8A',
    destructiveForeground: '#240A0E',
    border: '#2B3D59',
    input: '#2B3D59',
    success: '#64C9A4',
    gold: '#F0BD56',
  },
  radius: 18,
};

export default colors;
