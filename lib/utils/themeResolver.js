export const normalizeThemeValue = theme => {
  const value = Array.isArray(theme) ? theme[0] : theme

  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export const resolveSiteThemeWithSource = ({
  queryTheme,
  envTheme = process.env.NEXT_PUBLIC_THEME,
  notionTheme,
  configTheme,
  fallbackTheme
} = {}) => {
  const candidates = [
    { source: 'url:theme', theme: queryTheme },
    { source: 'env:theme', theme: envTheme },
    { source: 'notion:config', theme: notionTheme },
    { source: 'blog:config', theme: configTheme },
    { source: 'fallback', theme: fallbackTheme }
  ]

  for (const candidate of candidates) {
    const theme = normalizeThemeValue(candidate.theme)
    if (theme) {
      return {
        source: candidate.source,
        theme
      }
    }
  }

  return {
    source: 'none',
    theme: ''
  }
}

export const resolveSiteTheme = options => {
  return resolveSiteThemeWithSource(options).theme
}
