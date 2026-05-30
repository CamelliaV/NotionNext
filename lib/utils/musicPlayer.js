export const getPrimaryThemeName = theme => {
  const themeValue = Array.isArray(theme) ? theme[0] : theme

  if (typeof themeValue !== 'string') {
    return ''
  }

  return themeValue.split(',')[0].trim()
}

export const getThemeFromRouter = router => {
  if (router?.query?.theme) {
    return router.query.theme
  }

  if (typeof router?.asPath !== 'string') {
    return null
  }

  const queryString = router.asPath.split('?')[1]?.split('#')[0]
  if (!queryString) {
    return null
  }

  return new URLSearchParams(queryString).get('theme')
}

export const resolveMusicPlayerTheme = ({
  resolvedTheme,
  router,
  fallbackTheme
}) => {
  return resolvedTheme || getThemeFromRouter(router) || fallbackTheme
}

const isEnabled = value => {
  if (typeof value === 'string') {
    return value !== 'false' && value !== ''
  }

  return Boolean(value)
}

export const shouldRenderGlobalMusicPlayer = ({ enabled, theme }) => {
  return isEnabled(enabled) && getPrimaryThemeName(theme) !== 'endspace'
}
