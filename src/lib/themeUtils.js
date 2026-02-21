import { presetThemes } from '../data/presetThemes'

export function getActiveTheme(currentTheme, customThemes) {
  if (presetThemes[currentTheme]) {
    return presetThemes[currentTheme]
  }
  const customTheme = customThemes.find((t) => t.id === currentTheme)
  return customTheme || presetThemes['routine-ready']
}

export function getThemeName(currentTheme, customThemes) {
  const theme = getActiveTheme(currentTheme, customThemes)
  return theme.name
}

export function getThemeEmoji(currentTheme, customThemes) {
  const theme = getActiveTheme(currentTheme, customThemes)
  return theme.emoji || '🎨'
}

export function getFontFamily(family) {
  switch (family) {
    case 'twinkl':
    case 'twinkl-looped':
      return "'Twinkl Cursive Looped', 'Comic Sans MS', cursive"
    case 'twinkl-unlooped':
      return "'Twinkl Cursive Unlooped', 'Comic Sans MS', cursive"
    case 'twinkl-precursive':
      return "'Twinkl Precursive', 'Comic Sans MS', cursive"
    case 'cursive':
      return 'cursive'
    default:
      return 'sans-serif'
  }
}

export function isTwinklFont(fontFamily) {
  return ['twinkl', 'twinkl-looped', 'twinkl-unlooped', 'twinkl-precursive'].includes(fontFamily)
}

export function getFontStyle(theme, baseFontSize) {
  const isTwinkl = isTwinklFont(theme.fontFamily)
  return {
    fontWeight: theme.fontWeight,
    textTransform: theme.fontTransform,
    fontFamily: getFontFamily(theme.fontFamily || 'sans-serif'),
    fontSize: isTwinkl ? `${baseFontSize * 1.1}px` : `${baseFontSize}px`,
    letterSpacing: isTwinkl ? '0.5px' : 'normal',
    lineHeight: isTwinkl ? '1.4' : 'normal',
  }
}

export function getBackgroundStyle(theme) {
  return theme.bgGradientVia
    ? `linear-gradient(to bottom, ${theme.bgGradientFrom}, ${theme.bgGradientVia}, ${theme.bgGradientTo})`
    : `linear-gradient(to bottom, ${theme.bgGradientFrom}, ${theme.bgGradientTo})`
}
