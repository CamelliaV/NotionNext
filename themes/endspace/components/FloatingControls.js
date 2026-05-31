import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import {
  IconClock,
  IconListTree,
  IconArrowUp,
  IconX,
  IconMessage,
  IconMoon,
  IconSun
} from '@tabler/icons-react'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { SideBar } from './SideBar'

const getPublishTimestamp = post => {
  const value = post?.publishDate || post?.publishDay
  if (!value) return 0

  const timestamp =
    typeof value === 'number' ? value : new Date(value).getTime()

  return Number.isFinite(timestamp) ? timestamp : 0
}

/**
 * FloatingControls Component
 * Consolidates Recent Logs, TOC, and ScrollToTop into a single capsule widget.
 */
const FloatingControls = ({ toc, ...props }) => {
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const showDarkToggle = siteConfig('ENDSPACE_WIDGET_DARK_MODE', true, CONFIG)
  const floatingRecentPosts = useMemo(
    () =>
      (props.allNavPages || props.allPages || props.latestPosts || [])
        .filter(post => post?.slug)
        .sort((a, b) => getPublishTimestamp(b) - getPublishTimestamp(a))
        .map(post => ({
          ...post,
          publishDay:
            post.publishDay ||
            (post.publishDate
              ? new Date(post.publishDate).toLocaleDateString('zh-CN')
              : '')
        })),
    [props.allNavPages, props.allPages, props.latestPosts]
  )
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(null) // 'logs' | 'toc'
  const [percent, setPercent] = useState(0)
  const [activeSection, setActiveSection] = useState(null)
  const closeTimerRef = useRef(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const p = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
    setPercent(p)
  }, [])

  const actionSectionScrollSpy = useMemo(
    () =>
      throttle(() => {
        const sections = document.getElementsByClassName('notion-h')
        let prevBBox = null
        let nextSectionId = null
        let firstSectionId = null
        for (let i = 0; i < sections.length; ++i) {
          const section = sections[i]
          if (!section || !(section instanceof Element)) continue
          const sectionId = section.getAttribute('data-id')
          if (!firstSectionId) {
            firstSectionId = sectionId
          }
          const bbox = section.getBoundingClientRect()
          const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
          const offset = Math.max(150, prevHeight / 4)
          if (bbox.top - offset < 0) {
            nextSectionId = sectionId
            prevBBox = bbox
            continue
          }
          break
        }
        setActiveSection(
          previous => nextSectionId || previous || firstSectionId
        )
      }, 200),
    []
  )

  // -- TOC Logic --
  useEffect(() => {
    window.addEventListener('scroll', updateProgress)
    window.addEventListener('scroll', actionSectionScrollSpy)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('scroll', actionSectionScrollSpy)
      clearCloseTimer()
    }
  }, [actionSectionScrollSpy, clearCloseTimer, updateProgress])

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeDrawer = () => {
    clearCloseTimer()
    setIsOpen(false)
    closeTimerRef.current = setTimeout(() => {
      setActiveTab(null)
      closeTimerRef.current = null
    }, 300)
  }

  const toggleDrawer = tab => {
    clearCloseTimer()
    if (isOpen && activeTab === tab) {
      closeDrawer()
    } else {
      setIsOpen(true)
      setActiveTab(tab)
    }
  }

  const handleTocItemClick = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(max-width: 1023px)').matches
    ) {
      closeDrawer()
    }
  }

  // Common Button Style (Double Circle)
  const ControlBtn = ({
    icon: Icon,
    onClick,
    active,
    label,
    showPercent,
    iconClassName = 'text-[var(--endspace-text-primary)]',
    iconSize = 20
  }) => (
    <button
      type='button'
      onClick={onClick}
      className='w-10 h-10 rounded-full bg-[var(--endspace-bg-primary)] border border-[var(--endspace-border-base)] flex items-center justify-center p-1 cursor-pointer group shadow-lg transition-transform active:scale-95'
      aria-label={label}
      title={label}
    >
      <div
        className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-200 ${
          active ? 'bg-[#FBFB46]' : 'bg-transparent group-hover:bg-[#FBFB46]'
        }`}
      >
        {showPercent ? (
          <div className='relative w-full h-full flex items-center justify-center'>
            <span
              className={`text-[10px] font-bold font-mono ${active ? 'text-black hidden' : 'text-[var(--endspace-text-secondary)] group-hover:hidden'}`}
            >
              {Math.round(percent)}%
            </span>
            <Icon
              size={iconSize}
              stroke={2}
              className={`${iconClassName} ${active ? 'block' : 'hidden group-hover:block'}`}
            />
          </div>
        ) : (
          <Icon size={iconSize} stroke={2} className={iconClassName} />
        )}
      </div>
    </button>
  )

  return (
    <>
      {/* Container: Fixed Bottom Right */
      /* Note: Parent must allow fixed child to escape if needed, but fixed-in-fixed usually works for viewport. */
      /* We use a fragment or simple div to hold the buttons, and put the drawer as a sibling or just rely on fixed positioning. */
      /* Actually, to ensure proper z-indexing, let's keep them siblings. */}

      {isOpen && (
        <button
          type='button'
          aria-label='Close floating panel'
          data-testid='endspace-floating-controls-backdrop'
          className='fixed inset-0 z-30 cursor-default bg-transparent'
          onClick={closeDrawer}
        />
      )}

      {/* The Drawer (Mobile Sheet / Desktop Popover) */}
      <div
        className={`
            transition-all duration-300 ease-out bg-[var(--endspace-bg-primary)] border-[var(--endspace-border-base)] text-[var(--endspace-text-primary)] shadow-2xl overflow-hidden flex max-h-[70vh] flex-col
            
            /* Mobile Styles: Bottom Sheet */
            fixed bottom-0 left-0 right-0 w-full rounded-t-2xl border-t z-40
            ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-full opacity-0 invisible'}

            /* Desktop Styles: Floating Card (Left of buttons) */
            lg:fixed lg:bottom-8 lg:right-20 lg:left-auto lg:w-80 lg:rounded-xl lg:border
            lg:max-w-[calc(100vw-2rem)]
            ${isOpen ? 'lg:translate-y-0 lg:opacity-100 lg:visible' : 'lg:translate-y-0 lg:translate-x-4 lg:opacity-0 lg:invisible'}
        `}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-[var(--endspace-border-base)] bg-[var(--endspace-bg-base)] shrinking-0'>
          <h3 className='font-bold text-sm uppercase flex items-center gap-2 text-[var(--endspace-text-primary)]'>
            {activeTab === 'toc' ? (
              <>
                <IconListTree size={16} className='text-[var(--endspace-text-primary)]' />
                <span>Table of Contents</span>
              </>
            ) : (
              <>
                <IconClock size={16} className='text-[var(--endspace-text-primary)]' />
                <span>Recent Logs</span>
              </>
            )}
          </h3>
          <button
            type='button'
            aria-label='Close floating panel'
            onClick={closeDrawer}
            className='text-[var(--endspace-text-muted)] hover:text-[var(--endspace-text-primary)]'
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div
          data-testid='endspace-floating-controls-content'
          className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 lg:pb-4'
          style={{ scrollbarWidth: 'thin' }}
        >
          {activeTab === 'toc' && (
            <nav className='space-y-1 pr-1'>
              {toc &&
                toc.map(t => {
                  const id = uuidToId(t.id)
                  const isActive = activeSection === id
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`block rounded px-2 py-1 -mx-2 text-xs leading-snug break-words transition-colors ${isActive ? 'text-[var(--endspace-text-primary)] font-bold bg-[var(--endspace-accent-yellow-dim)]' : 'text-[var(--endspace-text-secondary)] hover:text-[var(--endspace-text-primary)] hover:bg-[var(--endspace-bg-secondary)]'}`}
                      style={{
                        paddingLeft: `${(t.indentLevel || 0) * 12 + 8}px`
                      }}
                      onClick={handleTocItemClick}
                    >
                      {t.text}
                    </a>
                  )
                })}
            </nav>
          )}
          {activeTab === 'logs' && (
            <SideBar
              {...props}
              showTitle={false}
              scrollable={false}
              latestPosts={floatingRecentPosts}
              latestPostLimit={Number.MAX_SAFE_INTEGER}
            />
          )}
        </div>
      </div>

      {/* The Controls (Buttons) */}
      <div className='fixed right-4 bottom-8 z-50 flex flex-col items-end gap-2 pointer-events-none'>
        {/* Capsule */}
        <div className='bg-[var(--endspace-bg-tertiary)]/80 border border-[var(--endspace-border-base)] backdrop-blur-sm p-1.5 rounded-full shadow-lg flex flex-row lg:flex-col gap-3 pointer-events-auto'>
          {showDarkToggle && (
            <ControlBtn
              icon={isDarkMode ? IconSun : IconMoon}
              label={isDarkMode ? 'Light mode' : 'Dark mode'}
              onClick={toggleDarkMode}
              iconClassName='text-[var(--endspace-text-primary)]'
              iconSize={22}
            />
          )}
          {/* LOGS */}
          <ControlBtn
            icon={IconClock}
            label='Recent Logs'
            active={isOpen && activeTab === 'logs'}
            onClick={() => toggleDrawer('logs')}
            iconClassName='text-[var(--endspace-text-primary)]'
            iconSize={24}
          />

          {/* TOC - Only on Article Pages */}
          {toc && toc.length > 0 && (
            <ControlBtn
              icon={IconListTree}
              label='Table of Contents'
              active={isOpen && activeTab === 'toc'}
              onClick={() => toggleDrawer('toc')}
              showPercent={true}
              iconClassName='text-[var(--endspace-text-muted)]'
              iconSize={28}
            />
          )}

          {/* Comments - Only on Article Pages (approximated by TOC presence) */}
          {toc && toc.length > 0 && (
            <ControlBtn
              icon={IconMessage}
              label='Jump to Comments'
              onClick={() => {
                const comments = document.getElementById('comments')
                if (comments) {
                  comments.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            />
          )}

          {/* Scroll To Top */}
          <ControlBtn
            icon={IconArrowUp}
            label='Scroll To Top'
            onClick={handleScrollToTop}
          />
        </div>
      </div>
    </>
  )
}

export default FloatingControls
