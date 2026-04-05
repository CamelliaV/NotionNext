import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import BlogPostCard from './BlogPostCard'

const STORAGE_PREFIX = 'hexo-sort-order-v2'
const REORDER_START_DISTANCE = 26
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

function sameIds(leftIds, rightIds) {
  if (leftIds.length !== rightIds.length) {
    return false
  }

  return leftIds.every((id, index) => id === rightIds[index])
}

function normalizeOrderedIds(postIds, preferredIds) {
  const validIds = new Set(postIds)
  const nextIds = []

  preferredIds.forEach(id => {
    if (validIds.has(id) && !nextIds.includes(id)) {
      nextIds.push(id)
    }
  })

  postIds.forEach(id => {
    if (!nextIds.includes(id)) {
      nextIds.push(id)
    }
  })

  return nextIds
}

function reorderPosts(posts, orderedIds) {
  const postMap = new Map(posts.map(post => [post.id, post]))
  const normalizedIds = normalizeOrderedIds(
    posts.map(post => post.id),
    orderedIds
  )

  return normalizedIds.map(id => postMap.get(id)).filter(Boolean)
}

function moveIdToIndex(ids, movingId, nextIndex) {
  const currentIndex = ids.indexOf(movingId)
  if (currentIndex === -1) {
    return ids
  }

  const boundedIndex = Math.max(0, Math.min(nextIndex, ids.length - 1))
  if (currentIndex === boundedIndex) {
    return ids
  }

  const nextIds = [...ids]
  const [draggedId] = nextIds.splice(currentIndex, 1)
  nextIds.splice(boundedIndex, 0, draggedId)
  return nextIds
}

function persistOrderedIds(storageKey, postIds, orderedIds) {
  if (typeof window === 'undefined' || !storageKey) {
    return
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(normalizeOrderedIds(postIds, orderedIds))
  )
}

function measureSlotRects(slotRefs, orderedIds) {
  const rects = new Map()

  orderedIds.forEach(id => {
    const slot = slotRefs.current.get(id)
    if (slot) {
      rects.set(id, slot.getBoundingClientRect())
    }
  })

  return rects
}

function normalizeRect(rect) {
  if (!rect) {
    return null
  }

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  }
}

function readStyleOffset(slot, propertyName) {
  if (!slot) {
    return 0
  }

  const rawValue = slot.style.getPropertyValue(propertyName)
  const offset = Number.parseFloat(rawValue || '0')
  return Number.isFinite(offset) ? offset : 0
}

function projectDraggedRect(baseRect, pointer, startPoint) {
  if (!baseRect) {
    return null
  }

  return {
    left: baseRect.left + (pointer.x - startPoint.x),
    top: baseRect.top + (pointer.y - startPoint.y),
    width: baseRect.width,
    height: baseRect.height
  }
}

const SortablePostList = ({
  posts = [],
  showSummary,
  siteInfo,
  storageScope = 'default'
}) => {
  const [orderedIds, setOrderedIds] = useState([])
  const [draggingId, setDraggingId] = useState(null)
  const [isPointerFine, setIsPointerFine] = useState(false)
  const [storageKey, setStorageKey] = useState('')
  const postIds = posts.map(post => post.id)
  const postSignature = postIds.join('|')
  const baseIndexMap = new Map(posts.map((post, index) => [post.id, index]))
  const orderedPosts = reorderPosts(posts, orderedIds)
  const orderedSignature = orderedPosts.map(post => post.id).join('|')

  const draggingIdRef = useRef(null)
  const pointerIdRef = useRef(null)
  const dragOriginIndexRef = useRef(-1)
  const previewIndexRef = useRef(-1)
  const orderedIdsRef = useRef([])
  const postIdsRef = useRef([])
  const dragBaseIdsRef = useRef([])
  const dragCleanupRef = useRef(null)
  const dragFrameRef = useRef(0)
  const dropAnimationTimeoutRef = useRef(0)
  const dropCommitRef = useRef(null)
  const dragPointerRef = useRef({ x: 0, y: 0 })
  const dragStartPointRef = useRef({ x: 0, y: 0 })
  const dragStartScrollRef = useRef({ x: 0, y: 0 })
  const dragShellRectRef = useRef(null)
  const dragOverlayRef = useRef(null)
  const slotRefsRef = useRef(new Map())
  const slotBaseRectsRef = useRef(new Map())
  const shellRefsRef = useRef(new Map())
  const previousSlotRectsRef = useRef(new Map())

  orderedIdsRef.current = orderedIds
  postIdsRef.current = postIds

  function resetDraggedVisual(shell) {
    if (!shell) {
      return
    }

    shell.style.setProperty('--sortable-drag-x', '0px')
    shell.style.setProperty('--sortable-drag-y', '0px')
    shell.style.setProperty('--sortable-tilt', '0deg')
    shell.style.setProperty('--sortable-scale', '1')
    shell.style.setProperty('--sortable-cut', '0px')
    shell.style.setProperty('--sortable-shear', '0px')
    shell.style.setProperty('--sortable-ridge', '0')
  }

  function clearPreviewLayout() {
    dragBaseIdsRef.current.forEach(id => {
      const slot = slotRefsRef.current.get(id)
      if (!slot) {
        return
      }

      slot.style.setProperty('--sortable-preview-y', '0px')
      slot.style.setProperty('--sortable-placeholder-shift-y', '0px')
    })
  }

  function updatePreviewLayout(nextPreviewIndex) {
    const currentDraggingId = draggingIdRef.current
    const sourceIndex = dragOriginIndexRef.current
    const sourceIds = dragBaseIdsRef.current
    const baseRects = slotBaseRectsRef.current

    if (
      !currentDraggingId ||
      sourceIndex < 0 ||
      nextPreviewIndex < 0 ||
      nextPreviewIndex >= sourceIds.length
    ) {
      return
    }

    previewIndexRef.current = nextPreviewIndex

    const draggingRect = baseRects.get(currentDraggingId)
    const gapOwnerId = sourceIds[nextPreviewIndex]
    const gapRect = gapOwnerId ? baseRects.get(gapOwnerId) : draggingRect

    sourceIds.forEach((id, index) => {
      const slot = slotRefsRef.current.get(id)
      if (!slot) {
        return
      }

      let previewShiftY = 0
      let placeholderShiftY = 0

      if (id === currentDraggingId) {
        if (draggingRect && gapRect) {
          placeholderShiftY = gapRect.top - draggingRect.top
        }
      } else if (sourceIndex < nextPreviewIndex) {
        if (index > sourceIndex && index <= nextPreviewIndex) {
          const previousId = sourceIds[index - 1]
          const previousRect = previousId ? baseRects.get(previousId) : null
          const currentRect = baseRects.get(id)
          if (previousRect && currentRect) {
            previewShiftY = previousRect.top - currentRect.top
          }
        }
      } else if (sourceIndex > nextPreviewIndex) {
        if (index >= nextPreviewIndex && index < sourceIndex) {
          const nextId = sourceIds[index + 1]
          const nextRect = nextId ? baseRects.get(nextId) : null
          const currentRect = baseRects.get(id)
          if (nextRect && currentRect) {
            previewShiftY = nextRect.top - currentRect.top
          }
        }
      }

      slot.style.setProperty('--sortable-preview-y', `${previewShiftY.toFixed(1)}px`)
      slot.style.setProperty(
        '--sortable-placeholder-shift-y',
        `${placeholderShiftY.toFixed(1)}px`
      )
    })
  }

  function applyDraggedTransform() {
    dragFrameRef.current = 0

    const currentDraggingId = draggingIdRef.current
    if (!currentDraggingId) {
      return
    }

    const shell =
      dragOverlayRef.current || shellRefsRef.current.get(currentDraggingId)
    const dragShellRect = dragShellRectRef.current
    if (!shell || !dragShellRect) {
      return
    }

    const { x, y } = dragPointerRef.current
    const dragX = x - dragStartPointRef.current.x
    const dragY = y - dragStartPointRef.current.y
    const dragDistance = Math.hypot(dragX, dragY)
    const visualDistance = Math.max(dragDistance - 6, 0)
    const visualProgress = Math.min(1, visualDistance / 32)
    const horizontalRatio = dragShellRect.width
      ? Math.max(
          Math.min(
            (dragX / dragShellRect.width) * Math.max(visualProgress, 0.38),
            0.58
          ),
          -0.58
        )
      : 0
    const scaleAmount = 1 + Math.min(visualDistance / 1800, 0.008)
    const cutAmount =
      visualDistance > 0
        ? Math.min(
            8.5,
            Math.min(visualDistance * 0.09, 2.3) +
              Math.abs(horizontalRatio) * 5.4
          )
        : 0
    const shearAmount = horizontalRatio * 5.2
    const ridgeAmount =
      visualDistance > 0
        ? Math.min(
            0.52,
            Math.min(visualDistance * 0.008, 0.12) +
              Math.abs(horizontalRatio) * 0.48
          )
        : 0

    shell.style.setProperty('--sortable-drag-x', `${dragX.toFixed(1)}px`)
    shell.style.setProperty('--sortable-drag-y', `${dragY.toFixed(1)}px`)
    shell.style.setProperty(
      '--sortable-tilt',
      `${(horizontalRatio * 3.6).toFixed(2)}deg`
    )
    shell.style.setProperty('--sortable-cut', `${cutAmount.toFixed(1)}px`)
    shell.style.setProperty('--sortable-shear', `${shearAmount.toFixed(1)}px`)
    shell.style.setProperty('--sortable-ridge', ridgeAmount.toFixed(3))
    shell.style.setProperty('--sortable-scale', scaleAmount.toFixed(4))
  }

  function scheduleDraggedTransform() {
    if (
      typeof window === 'undefined' ||
      !draggingIdRef.current ||
      dragFrameRef.current
    ) {
      return
    }

    dragFrameRef.current = window.requestAnimationFrame(applyDraggedTransform)
  }

  function clearDraggedTransform(id) {
    const shell = dragOverlayRef.current || shellRefsRef.current.get(id)
    if (!shell) {
      return
    }

    resetDraggedVisual(shell)
    clearPreviewLayout()
  }

  function hasCrossedReorderThreshold() {
    const dragX = dragPointerRef.current.x - dragStartPointRef.current.x
    const dragY = dragPointerRef.current.y - dragStartPointRef.current.y
    return Math.hypot(dragX, dragY) >= REORDER_START_DISTANCE
  }

  function teardownDragSession() {
    if (typeof window !== 'undefined') {
      window.document.body.style.userSelect = ''
      window.document.body.style.cursor = ''
      window.cancelAnimationFrame(dragFrameRef.current)
      window.clearTimeout(dropAnimationTimeoutRef.current)
    }

    dragFrameRef.current = 0
    dropAnimationTimeoutRef.current = 0
    dragCleanupRef.current?.()
    dragCleanupRef.current = null
    pointerIdRef.current = null
  }

  function finishDragState() {
    const movingId = draggingIdRef.current
    if (movingId) {
      if (dropCommitRef.current) {
        clearPreviewLayout()
      } else {
        clearDraggedTransform(movingId)
      }
    }

    dropCommitRef.current = null
    slotBaseRectsRef.current = new Map()
    dragShellRectRef.current = null
    dragOverlayRef.current = null
    dragBaseIdsRef.current = []
    dragOriginIndexRef.current = -1
    draggingIdRef.current = null
    previewIndexRef.current = -1
    setDraggingId(null)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const pathname = window.location.pathname.replace(/\/$/, '') || '/'
    setStorageKey(`${STORAGE_PREFIX}:${storageScope}:${pathname}`)
  }, [storageScope])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(pointer: fine)')
    const syncPointerMode = event => {
      setIsPointerFine(event.matches)
    }

    setIsPointerFine(mediaQuery.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncPointerMode)
    } else {
      mediaQuery.addListener(syncPointerMode)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', syncPointerMode)
      } else {
        mediaQuery.removeListener(syncPointerMode)
      }
    }
  }, [])

  useEffect(() => {
    if (!posts.length) {
      setOrderedIds(currentIds => (currentIds.length ? [] : currentIds))
      return
    }

    let storedIds = []
    if (typeof window !== 'undefined' && storageKey) {
      try {
        storedIds = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
      } catch {
        storedIds = []
      }
    }

    setOrderedIds(currentIds => {
      const preferredIds = storedIds.length ? storedIds : currentIds
      const nextIds = normalizeOrderedIds(postIdsRef.current, preferredIds)
      return sameIds(currentIds, nextIds) ? currentIds : nextIds
    })
  }, [postSignature, posts.length, storageKey])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !storageKey ||
      !orderedIds.length ||
      draggingId
    ) {
      return
    }

    persistOrderedIds(storageKey, postIdsRef.current, orderedIds)
  }, [draggingId, orderedIds, postSignature, storageKey])

  useBrowserLayoutEffect(() => {
    const nextRects = measureSlotRects(
      slotRefsRef,
      orderedPosts.map(post => post.id)
    )
    const previousRects = previousSlotRectsRef.current
    const dropCommit = dropCommitRef.current

    if (dropCommit) {
      nextRects.forEach((_, id) => {
        const slot = slotRefsRef.current.get(id)
        if (!slot) {
          return
        }

        slot.style.transition = 'none'
        slot.style.setProperty('--sortable-flip-x', '0px')
        slot.style.setProperty('--sortable-flip-y', '0px')
        slot.style.setProperty('--sortable-preview-y', '0px')
        slot.style.setProperty('--sortable-placeholder-shift-y', '0px')
        slot.getBoundingClientRect()
        slot.style.removeProperty('transition')
      })

      previousSlotRectsRef.current = nextRects

      const overlay = dragOverlayRef.current
      const dragShellRect = dragShellRectRef.current
      const targetShell = shellRefsRef.current.get(dropCommit.movingId)
      const targetRect = normalizeRect(targetShell?.getBoundingClientRect())

      if (!overlay || !dragShellRect || !targetRect) {
        finishDragState()
        return
      }

      overlay.style.transition =
        'transform 180ms cubic-bezier(0.2, 0.82, 0.24, 1), filter 180ms ease, opacity 180ms ease'
      overlay.style.setProperty(
        '--sortable-drag-x',
        `${(targetRect.left - dragShellRect.left).toFixed(1)}px`
      )
      overlay.style.setProperty(
        '--sortable-drag-y',
        `${(targetRect.top - dragShellRect.top).toFixed(1)}px`
      )
      overlay.style.setProperty('--sortable-tilt', '0deg')
      overlay.style.setProperty('--sortable-scale', '1')
      overlay.style.setProperty('--sortable-cut', '0px')
      overlay.style.setProperty('--sortable-shear', '0px')
      overlay.style.setProperty('--sortable-ridge', '0')

      if (typeof window !== 'undefined') {
        dropAnimationTimeoutRef.current = window.setTimeout(() => {
          finishDragState()
        }, 180)
      } else {
        finishDragState()
      }

      return
    }

    nextRects.forEach((nextRect, id) => {
      const previousRect = previousRects.get(id)
      const slot = slotRefsRef.current.get(id)

      if (!previousRect || !slot) {
        return
      }

      if (id === draggingIdRef.current) {
        slot.style.setProperty('--sortable-flip-x', '0px')
        slot.style.setProperty('--sortable-flip-y', '0px')
        return
      }

      const deltaX = previousRect.left - nextRect.left
      const deltaY = previousRect.top - nextRect.top
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return
      }

      slot.style.transition = 'none'
      slot.style.setProperty('--sortable-flip-x', `${deltaX.toFixed(1)}px`)
      slot.style.setProperty('--sortable-flip-y', `${deltaY.toFixed(1)}px`)
      slot.getBoundingClientRect()
      slot.style.removeProperty('transition')
      slot.style.setProperty('--sortable-flip-x', '0px')
      slot.style.setProperty('--sortable-flip-y', '0px')
    })

    previousSlotRectsRef.current = nextRects
    scheduleDraggedTransform()
  }, [orderedSignature])

  const resetDragState = () => {
    teardownDragSession()

    if (draggingIdRef.current) {
      const movingId = draggingIdRef.current
      const sourceIds = dragBaseIdsRef.current
      const nextIndex = previewIndexRef.current

      if (
        sourceIds.length &&
        nextIndex > -1 &&
        dragOriginIndexRef.current !== nextIndex
      ) {
        const normalizedIds = normalizeOrderedIds(
          postIdsRef.current,
          orderedIdsRef.current
        )
        const normalizedNextIds = moveIdToIndex(
          normalizedIds,
          movingId,
          nextIndex
        )

        if (!sameIds(normalizedIds, normalizedNextIds)) {
          dropCommitRef.current = {
            movingId
          }
          orderedIdsRef.current = normalizedNextIds
          setOrderedIds(currentIds => {
            const currentNormalizedIds = normalizeOrderedIds(
              postIdsRef.current,
              currentIds
            )
            return sameIds(currentNormalizedIds, normalizedNextIds)
              ? currentIds
              : normalizedNextIds
          })
          return
        }
      }
    }

    finishDragState()
  }

  const updatePreviewIndex = nextPreviewIndex => {
    if (
      !draggingIdRef.current ||
      nextPreviewIndex === previewIndexRef.current ||
      nextPreviewIndex < 0 ||
      nextPreviewIndex >= dragBaseIdsRef.current.length
    ) {
      return
    }

    updatePreviewLayout(nextPreviewIndex)
  }

  const syncPreviewIndexToPointer = clientY => {
    const currentDraggingId = draggingIdRef.current
    if (!currentDraggingId) {
      return
    }

    const currentIds = dragBaseIdsRef.current
    if (!currentIds.length) {
      return
    }

    const scrollDeltaY =
      typeof window === 'undefined'
        ? 0
        : window.scrollY - dragStartScrollRef.current.y

    const floatingRect =
      projectDraggedRect(
        dragShellRectRef.current,
        dragPointerRef.current,
        dragStartPointRef.current
      ) || normalizeRect(dragOverlayRef.current?.getBoundingClientRect())
    const dragDeltaY = dragPointerRef.current.y - dragStartPointRef.current.y
    const probeRatio = dragDeltaY >= 0 ? 0.72 : 0.28
    const hitY = floatingRect
      ? floatingRect.top + floatingRect.height * probeRatio
      : clientY

    const visualSlots = currentIds
      .filter(id => id !== currentDraggingId)
      .map(id => {
        const rect = slotBaseRectsRef.current.get(id)
        if (!rect) {
          return null
        }

        const slot = slotRefsRef.current.get(id)
        const visualShiftY = readStyleOffset(slot, '--sortable-preview-y')
        const visualTop = rect.top - scrollDeltaY + visualShiftY

        return {
          id,
          top: visualTop,
          midpoint: visualTop + rect.height * 0.5
        }
      })
      .filter(Boolean)
      .sort((left, right) => left.top - right.top)

    let nextPreviewIndex = visualSlots.length
    for (let index = 0; index < visualSlots.length; index += 1) {
      if (hitY <= visualSlots[index].midpoint) {
        nextPreviewIndex = index
        break
      }
    }

    updatePreviewIndex(nextPreviewIndex)
  }

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.()
      if (typeof window !== 'undefined') {
        window.cancelAnimationFrame(dragFrameRef.current)
        window.clearTimeout(dropAnimationTimeoutRef.current)
      }
    }
  }, [])

  const draggingPost = draggingId
    ? orderedPosts.find(post => post.id === draggingId) || null
    : null
  const draggingVisualIndex = draggingPost
    ? baseIndexMap.get(draggingPost.id) ?? 0
    : 0
  const floatingShellRect = dragShellRectRef.current
  const floatingRingInset = 4
  const floatingRingRadius = 12
  const overlayHost =
    typeof document !== 'undefined'
      ? document.getElementById('theme-hexo') || document.body
      : null

  return (
    <div
      data-dragging={draggingId ? 'true' : 'false'}
      className='hexo-sortable-list space-y-6 px-2'>
      {orderedPosts.map((post, index) => {
        const isDragging = draggingId === post.id
        const visualIndex = baseIndexMap.get(post.id) ?? index

        return (
          <article
            key={post.id}
            ref={node => {
              if (node) {
                slotRefsRef.current.set(post.id, node)
              } else {
                slotRefsRef.current.delete(post.id)
              }
            }}
            data-sortable-post-card={post.id}
            data-drag-state={isDragging ? 'dragging' : 'idle'}
            className='hexo-sortable-slot group relative'>
            <div
              ref={node => {
                if (node) {
                  shellRefsRef.current.set(post.id, node)
                } else {
                  shellRefsRef.current.delete(post.id)
                }
              }}
              style={isDragging ? { visibility: 'hidden' } : undefined}
              className='hexo-sortable-card-shell relative'>
              {orderedPosts.length > 1 && (
                <button
                  type='button'
                  aria-label={`Drag ${post.title || 'post'}`}
                  onPointerDown={event => {
                    if (event.button !== 0) {
                      return
                    }

                    event.preventDefault()
                    event.stopPropagation()

                    const slot = slotRefsRef.current.get(post.id)
                    const shell = shellRefsRef.current.get(post.id)
                    if (!slot || !shell) {
                      return
                    }

                    const sourceIds = normalizeOrderedIds(
                      postIdsRef.current,
                      orderedIdsRef.current
                    )
                    const sourceIndex = sourceIds.indexOf(post.id)
                    if (sourceIndex < 0) {
                      return
                    }

                    const shellRect = normalizeRect(shell.getBoundingClientRect())
                    if (!shellRect) {
                      return
                    }

                    dragPointerRef.current = {
                      x: event.clientX,
                      y: event.clientY
                    }
                    dragStartPointRef.current = {
                      x: event.clientX,
                      y: event.clientY
                    }
                    dragStartScrollRef.current = {
                      x: window.scrollX,
                      y: window.scrollY
                    }
                    dragShellRectRef.current = shellRect
                    draggingIdRef.current = post.id
                    pointerIdRef.current = event.pointerId
                    dragBaseIdsRef.current = sourceIds
                    dragOriginIndexRef.current = sourceIndex
                    previewIndexRef.current = sourceIndex
                    slotBaseRectsRef.current = measureSlotRects(
                      slotRefsRef,
                      sourceIds
                    )
                    setDraggingId(post.id)
                    updatePreviewLayout(sourceIndex)
                    window.document.body.style.userSelect = 'none'
                    window.document.body.style.cursor = 'grabbing'
                    scheduleDraggedTransform()

                    const matchesActivePointer = moveEvent => {
                      if (typeof moveEvent.pointerId !== 'number') {
                        return true
                      }

                      return (
                        pointerIdRef.current === null ||
                        moveEvent.pointerId === pointerIdRef.current
                      )
                    }

                    const handlePointerMove = moveEvent => {
                      if (!matchesActivePointer(moveEvent)) {
                        return
                      }

                      dragPointerRef.current = {
                        x: moveEvent.clientX,
                        y: moveEvent.clientY
                      }
                      scheduleDraggedTransform()
                      const deltaX =
                        moveEvent.clientX - dragStartPointRef.current.x
                      const deltaY =
                        moveEvent.clientY - dragStartPointRef.current.y
                      const dragDistance = Math.hypot(deltaX, deltaY)

                      if (dragDistance >= REORDER_START_DISTANCE) {
                        syncPreviewIndexToPointer(moveEvent.clientY)
                      }
                    }

                    const handlePointerUp = moveEvent => {
                      if (!matchesActivePointer(moveEvent)) {
                        return
                      }

                      resetDragState()
                    }

                    const handleWindowBlur = () => {
                      resetDragState()
                    }

                    const handleWindowScroll = () => {
                      if (!hasCrossedReorderThreshold()) {
                        return
                      }

                      syncPreviewIndexToPointer(dragPointerRef.current.y)
                    }

                    window.addEventListener('pointermove', handlePointerMove)
                    window.addEventListener('pointerup', handlePointerUp)
                    window.addEventListener('pointercancel', handlePointerUp)
                    window.addEventListener('scroll', handleWindowScroll, {
                      passive: true
                    })
                    window.addEventListener('blur', handleWindowBlur)
                    dragCleanupRef.current = () => {
                      window.removeEventListener('pointermove', handlePointerMove)
                      window.removeEventListener('pointerup', handlePointerUp)
                      window.removeEventListener('pointercancel', handlePointerUp)
                      window.removeEventListener('scroll', handleWindowScroll)
                      window.removeEventListener('blur', handleWindowBlur)
                    }
                  }}
                  className={`hexo-sortable-handle absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60 transition-all duration-150 hover:border-white/20 hover:text-white/85 cursor-grab active:cursor-grabbing touch-none ${
                    isPointerFine
                      ? 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                      : 'opacity-100'
                  }`}>
                  <i className='fas fa-grip-lines' />
                  <span className='hexo-sortable-handle-text'>
                    <span
                      aria-hidden='true'
                      className='hexo-sortable-handle-split hexo-sortable-handle-split-left'>
                      Drag
                    </span>
                    <span
                      aria-hidden='true'
                      className='hexo-sortable-handle-split hexo-sortable-handle-split-right'>
                      Drag
                    </span>
                    <span className='hexo-sortable-handle-fallback'>Drag</span>
                  </span>
                </button>
              )}

              <span aria-hidden='true' className='hexo-sortable-seam'>
                <span className='hexo-sortable-seam-half hexo-sortable-seam-half-left' />
                <span className='hexo-sortable-seam-half hexo-sortable-seam-half-right' />
                <span className='hexo-sortable-seam-ridge' />
              </span>

              <BlogPostCard
                disableAnimation
                index={visualIndex}
                post={post}
                showSummary={showSummary}
                siteInfo={siteInfo}
              />
            </div>
          </article>
        )
      })}

      {draggingPost &&
        floatingShellRect &&
        overlayHost &&
        createPortal(
          <div
            ref={node => {
              dragOverlayRef.current = node
              if (node) {
                scheduleDraggedTransform()
              }
            }}
            className='hexo-sortable-card-shell hexo-sortable-floating-shell'
            style={{
              position: 'fixed',
              left: `${floatingShellRect.left}px`,
              top: `${floatingShellRect.top}px`,
              width: `${floatingShellRect.width}px`,
              height: `${floatingShellRect.height}px`,
              zIndex: 34,
              pointerEvents: 'none'
            }}>
            <div className='hexo-sortable-floating-card-base'>
              <svg
                aria-hidden='true'
                className='hexo-sortable-floating-ring'
                width={floatingShellRect.width + floatingRingInset * 2}
                height={floatingShellRect.height + floatingRingInset * 2}
                viewBox={`0 0 ${floatingShellRect.width + floatingRingInset * 2} ${
                  floatingShellRect.height + floatingRingInset * 2
                }`}>
                <rect
                  className='hexo-sortable-floating-ring-rail'
                  x={floatingRingInset}
                  y={floatingRingInset}
                  width={floatingShellRect.width}
                  height={floatingShellRect.height}
                  rx={floatingRingRadius}
                  ry={floatingRingRadius}
                  pathLength='100'
                />
                <rect
                  className='hexo-sortable-floating-ring-glow'
                  x={floatingRingInset}
                  y={floatingRingInset}
                  width={floatingShellRect.width}
                  height={floatingShellRect.height}
                  rx={floatingRingRadius}
                  ry={floatingRingRadius}
                  pathLength='100'
                />
                <rect
                  className='hexo-sortable-floating-ring-trace'
                  x={floatingRingInset}
                  y={floatingRingInset}
                  width={floatingShellRect.width}
                  height={floatingShellRect.height}
                  rx={floatingRingRadius}
                  ry={floatingRingRadius}
                  pathLength='100'
                />
              </svg>
              <div className='hexo-sortable-floating-card-surface'>
                <BlogPostCard
                  disableAnimation
                  index={draggingVisualIndex}
                  post={draggingPost}
                  showSummary={showSummary}
                  siteInfo={siteInfo}
                />
              </div>
            </div>
          </div>,
          overlayHost
        )}
    </div>
  )
}

export default SortablePostList
