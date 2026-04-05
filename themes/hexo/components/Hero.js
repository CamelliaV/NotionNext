// import Image from 'next/image'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import NavButtonGroup from './NavButtonGroup'
import PretextHeroText from './PretextHeroText'

let wrapperTop = 0

/**
 * 顶部全屏大图
 * @returns
 */
const Hero = props => {
  const heroRef = useRef(null)
  const pointerFrameRef = useRef(0)
  const scrollFrameRef = useRef(0)
  const measureFrameRef = useRef(0)
  const pointerTargetRef = useRef({
    x: 0.5,
    y: 0.42,
    pixelX: 0,
    pixelY: 0,
    active: false
  })
  const repelTargetsRef = useRef([])
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const { siteInfo } = props
  const { locale, lang } = useGlobal()
  const siteTitle = siteInfo?.title || siteConfig('TITLE')
  const compactTitleLength = siteTitle.replace(/\s+/g, '').length
  const heroIntensity =
    compactTitleLength <= 8
      ? 'ultra'
      : compactTitleLength <= 16
        ? 'compact'
        : 'default'
  const greetings = (siteConfig('GREETING_WORDS') || '')
    .split(',')
    .map(word => word.trim())
    .filter(Boolean)
  const activeGreeting =
    greetings[greetingIndex] || siteConfig('BIO') || locale.COMMON.START_READING
  const categoryCount = props?.categoryOptions?.length || 0

  const scrollToWrapper = () => {
    window.scrollTo({ top: wrapperTop, behavior: 'smooth' })
  }

  useEffect(() => {
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = event => {
      setPrefersReducedMotion(event.matches)
    }

    setPrefersReducedMotion(mediaQuery.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncMotionPreference)
    } else {
      mediaQuery.addListener(syncMotionPreference)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', syncMotionPreference)
      } else {
        mediaQuery.removeListener(syncMotionPreference)
      }
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || greetings.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setGreetingIndex(current => (current + 1) % greetings.length)
    }, 3200)

    return () => {
      window.clearInterval(timer)
    }
  }, [greetings.length, prefersReducedMotion])

  useEffect(() => {
    const heroElement = heroRef.current
    if (!heroElement || typeof window === 'undefined') {
      return
    }

    const applyScrollMotion = () => {
      scrollFrameRef.current = 0
      const maxDistance = Math.max(window.innerHeight * 0.75, 1)
      const scrollRatio = Math.min(window.scrollY / maxDistance, 1)
      heroElement.style.setProperty('--hero-scroll', scrollRatio.toFixed(3))
    }

    const scheduleScrollMotion = () => {
      if (scrollFrameRef.current) {
        return
      }

      scrollFrameRef.current = window.requestAnimationFrame(applyScrollMotion)
    }

    heroElement.style.setProperty('--hero-mx', '0.5')
    heroElement.style.setProperty('--hero-my', '0.42')
    heroElement.style.setProperty('--hero-dx', '0')
    heroElement.style.setProperty('--hero-dy', '0')
    scheduleScrollMotion()

    window.addEventListener('scroll', scheduleScrollMotion, { passive: true })

    return () => {
      window.cancelAnimationFrame(scrollFrameRef.current)
      window.removeEventListener('scroll', scheduleScrollMotion)
    }
  }, [])

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(pointerFrameRef.current)
      window.cancelAnimationFrame(scrollFrameRef.current)
      window.cancelAnimationFrame(measureFrameRef.current)
    }
  }, [])

  useEffect(() => {
    const heroElement = heroRef.current
    if (!heroElement || typeof window === 'undefined') {
      return
    }

    const resetRepelTargets = () => {
      repelTargetsRef.current.forEach(target => {
        target.element.style.setProperty('--repel-x', '0px')
        target.element.style.setProperty('--repel-y', '0px')
        target.element.style.setProperty('--repel-scale', '1')
        target.element.style.setProperty('--button-cut', '0px')
        target.element.style.setProperty('--button-shear', '0px')
        target.element.style.setProperty('--button-ridge', '0')
      })
    }

    const measureRepelTargets = () => {
      measureFrameRef.current = 0
      const nextHeroRect = heroElement.getBoundingClientRect()

      repelTargetsRef.current = Array.from(
        heroElement.querySelectorAll('.hexo-hero-repel')
      )
        .map(element => {
          const rect = element.getBoundingClientRect()
          if (!rect.width || !rect.height) {
            return null
          }

          return {
            element,
            kind: element.dataset.repelKind || 'default',
            left: rect.left - nextHeroRect.left,
            top: rect.top - nextHeroRect.top,
            width: rect.width,
            height: rect.height,
            centerX: rect.left - nextHeroRect.left + rect.width / 2,
            centerY: rect.top - nextHeroRect.top + rect.height / 2,
            radius:
              parseFloat(element.dataset.repelRadius || '') ||
              Math.max(rect.width, rect.height) * 2.2 + 72,
            strength: parseFloat(element.dataset.repelStrength || '') || 1,
            scale: parseFloat(element.dataset.repelScale || '') || 0.02
          }
        })
        .filter(Boolean)

      if (!pointerTargetRef.current.active || prefersReducedMotion) {
        resetRepelTargets()
      }
    }

    const scheduleRepelMeasure = () => {
      if (measureFrameRef.current) {
        return
      }

      measureFrameRef.current =
        window.requestAnimationFrame(measureRepelTargets)
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleRepelMeasure)
        : null
    const mutationObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(scheduleRepelMeasure)
        : null

    scheduleRepelMeasure()
    resizeObserver?.observe(heroElement)
    mutationObserver?.observe(heroElement, {
      childList: true,
      subtree: true,
      characterData: true
    })

    const fontsReady = document?.fonts?.ready
    if (fontsReady?.then) {
      fontsReady.then(scheduleRepelMeasure)
    }

    window.addEventListener('resize', scheduleRepelMeasure)

    return () => {
      window.cancelAnimationFrame(measureFrameRef.current)
      window.removeEventListener('resize', scheduleRepelMeasure)
      mutationObserver?.disconnect()
      resizeObserver?.disconnect()
      resetRepelTargets()
    }
  }, [activeGreeting, categoryCount, lang, prefersReducedMotion, siteTitle])

  const applyPointerState = (x, y) => {
    const heroElement = heroRef.current
    if (!heroElement || prefersReducedMotion) {
      return
    }

    const clampedX = Math.min(Math.max(x, 0), 1)
    const clampedY = Math.min(Math.max(y, 0), 1)

    heroElement.style.setProperty('--hero-mx', clampedX.toFixed(3))
    heroElement.style.setProperty('--hero-my', clampedY.toFixed(3))
    heroElement.style.setProperty('--hero-dx', (clampedX - 0.5).toFixed(4))
    heroElement.style.setProperty('--hero-dy', (clampedY - 0.5).toFixed(4))
  }

  const resetRepelState = () => {
    repelTargetsRef.current.forEach(target => {
      target.element.style.setProperty('--repel-x', '0px')
      target.element.style.setProperty('--repel-y', '0px')
      target.element.style.setProperty('--repel-scale', '1')
    })
  }

  const applyRepelState = (pointerX, pointerY) => {
    repelTargetsRef.current.forEach(target => {
      const deltaX = target.centerX - pointerX
      const deltaY = target.centerY - pointerY
      const distance = Math.hypot(deltaX, deltaY)
      const influence = Math.max(0, 1 - distance / target.radius)
      const eased = influence * influence

      if (eased <= 0.0001) {
        target.element.style.setProperty('--repel-x', '0px')
        target.element.style.setProperty('--repel-y', '0px')
        target.element.style.setProperty('--repel-scale', '1')
        if (target.kind === 'button') {
          target.element.style.setProperty('--button-cut', '0px')
          target.element.style.setProperty('--button-shear', '0px')
          target.element.style.setProperty('--button-ridge', '0')
        }
        return
      }

      const pushDistance =
        Math.min(target.radius * 0.24, target.kind === 'button' ? 46 : 30) *
        eased *
        target.strength
      const unitX = distance > 0.001 ? deltaX / distance : 0
      const unitY = distance > 0.001 ? deltaY / distance : -1

      target.element.style.setProperty(
        '--repel-x',
        `${(unitX * pushDistance).toFixed(2)}px`
      )
      target.element.style.setProperty(
        '--repel-y',
        `${(unitY * pushDistance).toFixed(2)}px`
      )
      target.element.style.setProperty(
        '--repel-scale',
        `${(1 + eased * target.scale).toFixed(3)}`
      )

      if (target.kind === 'button') {
        const localX = pointerX - target.centerX
        const localY = pointerY - target.centerY
        const normalizedX = localX / Math.max(target.width * 0.5, 1)
        const normalizedY = localY / Math.max(target.height * 0.7, 1)
        const sliceInfluence = Math.max(
          0,
          1 - Math.hypot(normalizedX, normalizedY)
        )
        const cut = Math.min(target.width * 0.18, 24) * sliceInfluence
        const shear = Math.max(-1, Math.min(1, normalizedX)) * cut * 0.22

        target.element.style.setProperty('--button-cut', `${cut.toFixed(2)}px`)
        target.element.style.setProperty(
          '--button-shear',
          `${shear.toFixed(2)}px`
        )
        target.element.style.setProperty(
          '--button-ridge',
          `${sliceInfluence.toFixed(3)}`
        )
      }
    })
  }

  const schedulePointerState = (x, y, pixelX, pixelY, active = true) => {
    pointerTargetRef.current = { x, y, pixelX, pixelY, active }

    if (pointerFrameRef.current) {
      return
    }

    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = 0
      applyPointerState(pointerTargetRef.current.x, pointerTargetRef.current.y)
      if (pointerTargetRef.current.active && !prefersReducedMotion) {
        applyRepelState(
          pointerTargetRef.current.pixelX,
          pointerTargetRef.current.pixelY
        )
      } else {
        resetRepelState()
      }
    })
  }

  const handlePointerMove = event => {
    const heroElement = heroRef.current
    if (!heroElement || prefersReducedMotion) {
      return
    }

    const rect = heroElement.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    schedulePointerState(x, y, event.clientX - rect.left, event.clientY - rect.top)
  }

  const handlePointerLeave = () => {
    const heroElement = heroRef.current
    if (!heroElement) {
      return
    }

    schedulePointerState(
      0.5,
      0.42,
      heroElement.clientWidth * 0.5,
      heroElement.clientHeight * 0.42,
      false
    )
  }

  function updateHeaderHeight() {
    requestAnimationFrame(() => {
      const wrapperElement = document.getElementById('wrapper')
      wrapperTop = wrapperElement?.offsetTop
    })
  }

  return (
    <header
      ref={heroRef}
      id='header'
      data-hero-intensity={heroIntensity}
      style={{ zIndex: 1 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className='hexo-hero-shell w-full h-screen relative overflow-hidden bg-black'>
      <div className='absolute inset-0'>
        <LazyImage
          id='header-cover'
          alt={siteTitle}
          src={siteInfo?.pageCover}
          className={`header-cover hexo-hero-cover w-full h-screen object-cover object-center ${siteConfig('HEXO_HOME_NAV_BACKGROUND_IMG_FIXED', null, CONFIG) ? 'fixed' : ''}`}
        />
      </div>
      <div className='hexo-hero-scrim absolute inset-0' />
      <div className='hexo-hero-grid absolute inset-0' />
      <div className='hexo-hero-aurora absolute inset-0' />
      <div className='hexo-hero-vignette absolute inset-0' />

      <div className='hexo-hero-content text-white absolute bottom-0 flex flex-col h-full items-center justify-center w-full'>
        <div className='hexo-hero-copy'>
          <PretextHeroText
            text={siteTitle}
            lang={lang}
            variant='title'
            animationSeed='hero-title'
            className='hexo-hero-title'
          />
          <PretextHeroText
            text={activeGreeting}
            lang={lang}
            variant='greeting'
            animationSeed={`greeting-${greetingIndex}`}
            className='hexo-hero-greeting'
          />
        </div>

        {/* 首页导航大按钮 */}
        {siteConfig('HEXO_HOME_NAV_BUTTONS', null, CONFIG) && (
          <NavButtonGroup {...props} />
        )}

        {/* 滚动按钮 */}
        <div
          onClick={scrollToWrapper}
          className='hexo-hero-scroll z-10 cursor-pointer w-full text-center py-4 text-3xl absolute bottom-10 text-white'>
          <div className='opacity-70 animate-bounce text-xs tracking-[0.4em] uppercase'>
            {siteConfig('HEXO_SHOW_START_READING', null, CONFIG) &&
              locale.COMMON.START_READING}
          </div>
          <i className='opacity-70 animate-bounce fas fa-angle-down' />
        </div>
      </div>
    </header>
  )
}

export default Hero
