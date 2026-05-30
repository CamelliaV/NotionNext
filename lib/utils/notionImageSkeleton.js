const IMAGE_SELECTOR = '.notion-asset-wrapper-image img'

const getImageHost = image => image.closest('.notion-asset-wrapper-image')

const setLoaded = image => {
  const host = getImageHost(image)
  if (!host) return

  host.classList.add('notion-image-skeleton-host', 'notion-image-loaded')
  host.classList.remove('notion-image-loading')
}

const setLoading = image => {
  const host = getImageHost(image)
  if (!host) return

  host.classList.add('notion-image-skeleton-host', 'notion-image-loading')
  host.classList.remove('notion-image-loaded')
}

const bindImage = (image, cleanupCallbacks) => {
  if (image.complete) {
    setLoaded(image)
    return
  }

  setLoading(image)

  const handleLoad = () => setLoaded(image)
  const handleError = () => setLoaded(image)

  image.addEventListener('load', handleLoad, { once: true })
  image.addEventListener('error', handleError, { once: true })

  cleanupCallbacks.push(() => {
    image.removeEventListener('load', handleLoad)
    image.removeEventListener('error', handleError)
  })
}

export const bindNotionImageSkeletons = root => {
  if (!root) return () => {}

  const cleanupCallbacks = []

  root
    .querySelectorAll(IMAGE_SELECTOR)
    .forEach(image => bindImage(image, cleanupCallbacks))

  return () => {
    cleanupCallbacks.forEach(cleanup => cleanup())
  }
}
