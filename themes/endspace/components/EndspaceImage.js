import { useEffect, useRef, useState } from 'react'

export const EndspaceImage = ({
  src,
  alt = '',
  wrapperClassName = '',
  className = '',
  onLoad,
  onError,
  children,
  ...imageProps
}) => {
  const imageRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(false)
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [src])

  if (!src) {
    return null
  }

  const handleLoad = event => {
    setIsLoaded(true)
    onLoad?.(event)
  }

  const handleError = event => {
    setIsLoaded(true)
    onError?.(event)
  }

  return (
    <div
      data-testid='endspace-image-skeleton'
      className={`endspace-image-skeleton ${isLoaded ? 'lazy-image-loaded' : ''} ${wrapperClassName}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imageProps}
        ref={imageRef}
        src={src}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
      {children}
    </div>
  )
}

export default EndspaceImage
