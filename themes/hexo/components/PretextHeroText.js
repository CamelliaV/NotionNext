import {
  layoutWithLines,
  prepareWithSegments,
  setLocale
} from '@chenglou/pretext'
import { useEffect, useRef, useState } from 'react'

let graphemeSegmenter = null

function resolveFont(style) {
  if (style.font && style.font.trim()) {
    return style.font
  }

  const fontStyle = style.fontStyle || 'normal'
  const fontWeight = style.fontWeight || '400'
  const fontSize = style.fontSize || '16px'
  const fontFamily = style.fontFamily || 'sans-serif'

  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
}

function resolveLineHeight(style) {
  const lineHeight = parseFloat(style.lineHeight)
  if (!Number.isNaN(lineHeight)) {
    return lineHeight
  }

  const fontSize = parseFloat(style.fontSize)
  return Number.isNaN(fontSize) ? 18 : fontSize * 1.1
}

function getGraphemeSegmenter() {
  if (!graphemeSegmenter && typeof Intl !== 'undefined' && Intl.Segmenter) {
    graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  }

  return graphemeSegmenter
}

function splitTitleTokens(text) {
  const segmenter = getGraphemeSegmenter()
  if (segmenter) {
    const tokens = []
    for (const segment of segmenter.segment(text)) {
      tokens.push({
        text: segment.segment,
        isSpace: /^\s+$/.test(segment.segment)
      })
    }

    return tokens
  }

  return Array.from(text).map(segment => ({
    text: segment,
    isSpace: /^\s+$/.test(segment)
  }))
}

function hashToUnit(seed, salt) {
  const value = `${seed}:${salt}`
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) / 4294967295
}

function createScatterSeed() {
  return Math.random().toString(36).slice(2, 10)
}

function shouldTokenizeVariant(variant, compactTextLength) {
  if (variant === 'title') {
    return true
  }

  return variant === 'greeting' && compactTextLength >= 18
}

function getDisplayTokenStyle({
  variant,
  scatterSeed,
  animationSeed,
  lineIndex,
  tokenIndex,
  visibleTokenIndex,
  visibleTokenCount
}) {
  const isGreeting = variant === 'greeting'
  const centeredIndex = visibleTokenIndex - (visibleTokenCount - 1) / 2
  const tokenDepth = (visibleTokenIndex + 1) / (visibleTokenCount + 1)
  const span = Math.max((visibleTokenCount - 1) / 2, 1)
  const normalizedIndex =
    visibleTokenCount <= 1 ? 0.5 : visibleTokenIndex / (visibleTokenCount - 1)
  const centerWeight =
    (isGreeting ? 0.42 : 0.42) +
    (1 - Math.min(Math.abs(centeredIndex) / span, 1)) *
      (isGreeting ? 0.56 : 0.58)
  const lineScatterKey = `${scatterSeed}:${animationSeed}:${lineIndex}`
  const scatterKey = `${lineScatterKey}:${tokenIndex}:${visibleTokenIndex}`
  const focusPrimary = hashToUnit(lineScatterKey, 'focus-primary')
  const focusSecondary = hashToUnit(lineScatterKey, 'focus-secondary')
  const focusPrimaryWeight = Math.max(
    0,
    1 - Math.abs(normalizedIndex - focusPrimary) / (isGreeting ? 0.2 : 0.26)
  )
  const focusSecondaryWeight = Math.max(
    0,
    1 - Math.abs(normalizedIndex - focusSecondary) / (isGreeting ? 0.16 : 0.22)
  )
  const focusWeight = Math.max(
    focusPrimaryWeight,
    focusSecondaryWeight * 0.72
  )
  const outwardDirection =
    centeredIndex === 0
      ? visibleTokenIndex % 2 === 0
        ? -1
        : 1
      : Math.sign(centeredIndex)
  const staggerDirection = visibleTokenIndex % 2 === 0 ? -1 : 1
  const outwardShift =
    outwardDirection *
    ((isGreeting ? 0.018 : 0.028) +
      hashToUnit(scatterKey, 'outward') * (isGreeting ? 0.032 : 0.05)) *
    centerWeight
  const staggerShift =
    staggerDirection *
    ((isGreeting ? 0.007 : 0.01) +
      hashToUnit(scatterKey, 'stagger') * (isGreeting ? 0.02 : 0.022)) *
    (0.55 + centerWeight * 0.45)
  const focusDirection =
    normalizedIndex <= focusPrimary
      ? -1
      : 1
  const focusShift =
    focusDirection *
    focusWeight *
    (isGreeting ? 0.042 : 0.062)
  const jitterX = (hashToUnit(scatterKey, 'x') - 0.5) * (isGreeting ? 0.026 : 0.028)
  const jitterY = (hashToUnit(scatterKey, 'y') - 0.5) * (isGreeting ? 0.074 : 0.11)
  const laneShift =
    (visibleTokenIndex % 2 === 0 ? -1 : 1) *
    ((isGreeting ? 0.022 : 0.04) + centerWeight * (isGreeting ? 0.04 : 0.06))
  const tilt =
    (hashToUnit(scatterKey, 'tilt') - 0.5) *
    (isGreeting ? 2.2 : 3.8) *
    centerWeight

  return {
    '--token-depth': `${tokenDepth}`,
    '--token-rest-x': `${(
      centeredIndex * (isGreeting ? 0.016 : 0.022) +
      outwardShift +
      staggerShift +
      focusShift +
      jitterX
    ).toFixed(4)}em`,
    '--token-rest-y': `${(laneShift + jitterY).toFixed(4)}em`,
    '--token-tilt': `${tilt.toFixed(3)}deg`
  }
}

function getLineSignature(nextLines) {
  if (!nextLines?.length) {
    return ''
  }

  return nextLines
    .map(line => `${line.start.segmentIndex}:${line.start.graphemeIndex}-${line.end.segmentIndex}:${line.end.graphemeIndex}:${line.text}`)
    .join('\u0001')
}

export default function PretextHeroText({
  text,
  lang,
  className = '',
  lineClassName = '',
  variant = 'title',
  animationSeed = '0'
}) {
  const rootRef = useRef(null)
  const lineSignatureRef = useRef('')
  const preparedRef = useRef(null)
  const preparedKeyRef = useRef('')
  const [lines, setLines] = useState(null)
  const [scatterSeed, setScatterSeed] = useState('seedless')
  const compactTextLength = (text || '').replace(/\s+/g, '').length
  const density =
    variant === 'title'
      ? compactTextLength <= 8
        ? 'ultra'
        : compactTextLength <= 16
          ? 'compact'
          : 'default'
      : 'default'
  const totalLines = lines?.length || 1
  const shouldTokenize = shouldTokenizeVariant(variant, compactTextLength)

  useEffect(() => {
    if (shouldTokenize && typeof window !== 'undefined') {
      setScatterSeed(createScatterSeed())
    }
  }, [animationSeed, shouldTokenize, text])

  useEffect(() => {
    setLocale(lang)
    preparedRef.current = null
    preparedKeyRef.current = ''
    lineSignatureRef.current = ''
  }, [lang])

  useEffect(() => {
    const element = rootRef.current
    if (!element || !text || typeof window === 'undefined') {
      lineSignatureRef.current = ''
      preparedRef.current = null
      preparedKeyRef.current = ''
      setLines(null)
      return
    }

    let active = true
    let frameId = 0
    let resizeObserver = null

    const measureLines = () => {
      cancelAnimationFrame(frameId)

      frameId = requestAnimationFrame(() => {
        if (!active || !element.isConnected) {
          return
        }

        const width = element.clientWidth
        if (!width) {
          return
        }

        try {
          const style = window.getComputedStyle(element)
          const font = resolveFont(style)
          const lineHeight = resolveLineHeight(style)
          const preparedKey = `${text}__${font}`
          if (preparedKeyRef.current !== preparedKey || !preparedRef.current) {
            preparedRef.current = prepareWithSegments(text, font)
            preparedKeyRef.current = preparedKey
          }

          const prepared = preparedRef.current
          const nextLines = layoutWithLines(prepared, width, lineHeight).lines
          const nextSignature = getLineSignature(nextLines)

          if (active && nextSignature !== lineSignatureRef.current) {
            lineSignatureRef.current = nextSignature
            setLines(nextLines)
          }
        } catch {
          if (active && lineSignatureRef.current !== '') {
            lineSignatureRef.current = ''
            setLines(null)
          }
        }
      })
    }

    measureLines()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measureLines)
      resizeObserver.observe(element)
    }

    const fontsReady = document?.fonts?.ready
    if (fontsReady?.then) {
      fontsReady.then(() => {
        if (active) {
          measureLines()
        }
      })
    }

    window.addEventListener('resize', measureLines)

    return () => {
      active = false
      cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measureLines)
    }
  }, [lang, text, animationSeed])

  return (
    <div
      ref={rootRef}
      data-density={density}
      data-lines={totalLines}
      data-text-length={compactTextLength}
      className={`pretext-hero-block pretext-hero-block-${variant} ${className}`}>
      {lines?.length ? (
        lines.map((line, index) => {
          const tokens = shouldTokenize ? splitTitleTokens(line.text) : null
          const visibleTokenCount =
            tokens?.filter(token => !token.isSpace).length || 0
          let visibleTokenIndex = 0
          const lineRepelClass =
            variant !== 'title' && !shouldTokenize ? 'hexo-hero-repel' : ''

          return (
            <span
              key={`${animationSeed}-${variant}-${index}-${line.text}`}
              className={`pretext-hero-line ${lineRepelClass} ${lineClassName}`}
              data-text={line.text}
              data-tokenized={tokens ? 'true' : 'false'}
              data-repel-strength={variant === 'greeting' ? '0.85' : undefined}
              data-repel-radius={variant === 'greeting' ? '190' : undefined}
              data-repel-scale={variant === 'greeting' ? '0.03' : undefined}
              style={{
                '--line-index': `${index + 1}`,
                '--line-depth': `${(index + 1) / (lines.length + 1)}`,
                '--line-span': `${line.text.replace(/\s+/g, '').length}`
              }}>
              {tokens ? (
                <span className='pretext-hero-line-inner'>
                  {tokens.map((token, tokenIndex) => {
                    if (token.isSpace) {
                      return (
                        <span
                          key={`${animationSeed}-${variant}-${index}-space-${tokenIndex}`}
                          className='pretext-hero-space'>
                          {token.text}
                        </span>
                      )
                    }

                    const tokenStyle = getDisplayTokenStyle({
                      variant,
                      scatterSeed,
                      animationSeed,
                      lineIndex: index,
                      tokenIndex,
                      visibleTokenIndex,
                      visibleTokenCount
                    })

                    visibleTokenIndex += 1

                    return (
                      <span
                        key={`${animationSeed}-${variant}-${index}-token-${tokenIndex}-${token.text}`}
                        className={`pretext-hero-token pretext-hero-token-${variant} ${tokens ? 'hexo-hero-repel' : ''}`}
                        data-repel-kind={
                          variant === 'title'
                            ? 'title-token'
                            : variant === 'greeting'
                              ? 'greeting-token'
                              : undefined
                        }
                        data-repel-strength={
                          variant === 'title'
                            ? '1.18'
                            : variant === 'greeting'
                              ? '0.72'
                              : undefined
                        }
                        data-repel-radius={
                          variant === 'title'
                            ? '180'
                            : variant === 'greeting'
                              ? '128'
                              : undefined
                        }
                        data-repel-scale={
                          variant === 'title'
                            ? '0.028'
                            : variant === 'greeting'
                              ? '0.014'
                              : undefined
                        }
                        style={tokenStyle}>
                        {token.text}
                      </span>
                    )
                  })}
                </span>
              ) : (
                line.text
              )}
            </span>
          )
        })
      ) : (
        <span
          className={`pretext-hero-line pretext-hero-line-fallback ${variant !== 'title' ? 'hexo-hero-repel' : ''} ${lineClassName}`}
          data-text={text}
          data-tokenized='false'
          data-repel-strength={variant === 'greeting' ? '0.85' : undefined}
          data-repel-radius={variant === 'greeting' ? '190' : undefined}
          data-repel-scale={variant === 'greeting' ? '0.03' : undefined}
          style={{
            '--line-index': '1',
            '--line-depth': '0.5',
            '--line-span': `${compactTextLength}`
          }}>
          {text}
        </span>
      )}
    </div>
  )
}
