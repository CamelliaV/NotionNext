import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { siteConfig } from '@/lib/config'
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconMusic,
  IconList,
  IconVolume
} from '@tabler/icons-react'
import { buildMetingPlaylistUrl, normalizeMetingAudioList } from './music'

let sharedAudio = null
let sharedAudioList = []
let sharedPlayOrder = 'list'
let progressTimer = null
let mediaGuardTimer = null
let playRequestId = 0
let hasTriedAutoPlay = false
let sharedState = {
  isPlaying: false,
  currentTrack: 0,
  progress: 0,
  duration: 0,
  currentTime: 0
}
const subscribers = new Set()

const emitSharedState = (patch = {}) => {
  sharedState = {
    ...sharedState,
    ...patch
  }
  subscribers.forEach(listener => listener(sharedState))
}

const parseBoolean = value => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}

const getSharedAudio = () => {
  if (typeof Audio === 'undefined') return null
  if (sharedAudio) return sharedAudio

  sharedAudio = new Audio()
  sharedAudio.volume = 0.7
  sharedAudio.setAttribute('data-endspace-player', 'true')
  sharedAudio.addEventListener('ended', () => {
    playSharedTrack(getNextTrackIndex(), true)
  })
  sharedAudio.addEventListener('loadedmetadata', () => {
    emitSharedState({
      duration: sharedAudio?.duration || 0
    })
  })
  sharedAudio.addEventListener('play', () => {
    emitSharedState({ isPlaying: true })
    startProgressTimer()
    startMediaGuard()
  })
  sharedAudio.addEventListener('pause', () => {
    if (!sharedAudio?.ended) {
      emitSharedState({ isPlaying: false })
      stopProgressTimer()
      stopMediaGuard()
    }
  })
  sharedAudio.addEventListener('error', event => {
    console.error('Audio load error:', event)
  })
  return sharedAudio
}

const subscribeSharedPlayer = listener => {
  subscribers.add(listener)
  listener(sharedState)
  return () => {
    subscribers.delete(listener)
    if (subscribers.size === 0) {
      pauseSharedPlayer()
    }
  }
}

const configureSharedPlayer = (audioList, playOrder) => {
  sharedAudioList = Array.isArray(audioList) ? audioList : []
  sharedPlayOrder = playOrder || 'list'
  if (sharedState.currentTrack >= sharedAudioList.length) {
    emitSharedState({ currentTrack: 0, progress: 0, currentTime: 0 })
  }
  getSharedAudio()
}

const getNextTrackIndex = () => {
  if (sharedAudioList.length === 0) return 0
  if (sharedPlayOrder === 'random') {
    return Math.floor(Math.random() * sharedAudioList.length)
  }
  return (sharedState.currentTrack + 1) % sharedAudioList.length
}

const getPrevTrackIndex = () => {
  if (sharedAudioList.length === 0) return 0
  return (sharedState.currentTrack - 1 + sharedAudioList.length) % sharedAudioList.length
}

const updateProgressFromAudio = () => {
  if (!sharedAudio) return
  const current = sharedAudio.currentTime || 0
  const total = sharedAudio.duration || 1
  emitSharedState({
    currentTime: current,
    duration: sharedAudio.duration || 0,
    progress: (current / total) * 100
  })
}

const startProgressTimer = () => {
  if (typeof window === 'undefined') return
  stopProgressTimer()
  updateProgressFromAudio()
  progressTimer = window.setInterval(updateProgressFromAudio, 200)
}

const stopProgressTimer = () => {
  if (!progressTimer) return
  if (typeof window !== 'undefined') {
    window.clearInterval(progressTimer)
  }
  progressTimer = null
}

const pauseOtherMedia = () => {
  if (typeof document === 'undefined') return
  document.querySelectorAll('audio, video').forEach(media => {
    if (media !== sharedAudio && !media.paused) {
      media.pause()
    }
  })
}

const startMediaGuard = () => {
  if (typeof window === 'undefined') return
  stopMediaGuard()
  pauseOtherMedia()
  mediaGuardTimer = window.setInterval(pauseOtherMedia, 800)
}

const stopMediaGuard = () => {
  if (!mediaGuardTimer) return
  if (typeof window !== 'undefined') {
    window.clearInterval(mediaGuardTimer)
  }
  mediaGuardTimer = null
}

const playSharedAudio = async () => {
  const audio = getSharedAudio()
  if (!audio) return
  pauseOtherMedia()
  audio.muted = false
  try {
    await audio.play()
  } catch (error) {
    console.log('Play prevented:', error)
    emitSharedState({ isPlaying: false })
    stopProgressTimer()
    stopMediaGuard()
  }
}

const pauseSharedPlayer = () => {
  if (sharedAudio) {
    sharedAudio.pause()
  }
  emitSharedState({ isPlaying: false })
  stopProgressTimer()
  stopMediaGuard()
}

const playSharedTrack = (index, shouldPlay = sharedState.isPlaying) => {
  if (sharedAudioList.length === 0) return
  const safeIndex = (index + sharedAudioList.length) % sharedAudioList.length
  const audioConfig = sharedAudioList[safeIndex]
  const audio = getSharedAudio()
  if (!audioConfig?.url || !audio) return

  const requestId = ++playRequestId
  audio.pause()
  if (audio.src !== audioConfig.url) {
    audio.src = audioConfig.url
  }
  audio.load()
  emitSharedState({
    currentTrack: safeIndex,
    progress: 0,
    currentTime: 0,
    duration: 0,
    isPlaying: shouldPlay
  })

  if (shouldPlay) {
    if (typeof window === 'undefined') return
    window.setTimeout(() => {
      if (requestId === playRequestId) {
        playSharedAudio()
      }
    }, 0)
  }
}

/**
 * EndspacePlayer Component - Compact Sci-Fi Music Player for Endspace Theme
 * Integrates with widget.config.js settings
 * Has two states: expanded (full info) and collapsed (rotating cover when playing)
 * Tabler Icons for Futuristic Feel
 */
export const EndspacePlayer = ({ isExpanded, embedded = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [metingAudioList, setMetingAudioList] = useState([])
  const [metingFailed, setMetingFailed] = useState(false)
  const audioRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const audioListRef = useRef([])
  const currentTrackRef = useRef(0)
  const isPlayingRef = useRef(false)
  const loadedTrackUrlRef = useRef(null)
  const playOrderRef = useRef(null)

  // Get configuration from widget.config.js
  const musicPlayerEnabled = siteConfig('MUSIC_PLAYER')
  const metingEnabled = siteConfig('MUSIC_PLAYER_METING')
  const metingServer = siteConfig('MUSIC_PLAYER_METING_SERVER')
  const metingId = siteConfig('MUSIC_PLAYER_METING_ID')
  const metingApi = siteConfig('MUSIC_PLAYER_METING_API', '/api/meting')
  const playOrder = siteConfig('MUSIC_PLAYER_ORDER')
  const fallbackCover = siteConfig('AVATAR') || '/avatar.svg'
  const configuredAudioList = siteConfig('MUSIC_PLAYER_AUDIO_LIST')
  const fallbackAudioList = useMemo(
    () => configuredAudioList || [],
    [configuredAudioList]
  )
  const shouldUseMeting = Boolean(metingEnabled && metingServer && metingId)
  const audioList = useMemo(() => {
    if (!shouldUseMeting) {
      return fallbackAudioList
    }
    if (metingAudioList.length > 0) {
      return metingAudioList
    }
    if (metingFailed) {
      return fallbackAudioList
    }
    return []
  }, [fallbackAudioList, metingAudioList, metingFailed, shouldUseMeting])

  const currentAudio = audioList[currentTrack] || {}

  useEffect(() => {
    audioListRef.current = audioList
  }, [audioList])

  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    playOrderRef.current = playOrder
  }, [playOrder])

  const syncTrackIndex = useCallback(index => {
    currentTrackRef.current = index
    setCurrentTrack(index)
  }, [])

  const updateProgressFromAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    const current = audio.currentTime || 0
    const total = audio.duration || 1
    setCurrentTime(current)
    setProgress((current / total) * 100)
  }, [])

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'none'
      audioRef.current.volume = 0.7
    }
    return audioRef.current
  }, [])

  const loadTrack = useCallback(
    async (index, { autoplay = false } = {}) => {
      const track = audioListRef.current[index]
      if (!track?.url) {
        return false
      }

      const audio = getAudio()
      if (loadedTrackUrlRef.current !== track.url) {
        loadedTrackUrlRef.current = track.url
        audio.src = track.url
        audio.load()
        setProgress(0)
        setCurrentTime(0)
        setDuration(0)
      }

      if (!autoplay) {
        return true
      }

      try {
        audio.muted = false
        await audio.play()
        isPlayingRef.current = true
        setIsPlaying(true)
        return true
      } catch (error) {
        console.log('Play prevented:', error)
        isPlayingRef.current = false
        setIsPlaying(false)
        return false
      }
    },
    [getAudio]
  )

  const getNextTrackIndex = useCallback(direction => {
    const list = audioListRef.current
    if (list.length === 0) {
      return 0
    }
    if (playOrderRef.current === 'random') {
      return Math.floor(Math.random() * list.length)
    }
    return (currentTrackRef.current + direction + list.length) % list.length
  }, [])

  const handleTrackEnd = useCallback(() => {
    const list = audioListRef.current
    if (list.length === 0) {
      return
    }
    const nextIndex = getNextTrackIndex(1)
    syncTrackIndex(nextIndex)
    loadTrack(nextIndex, { autoplay: true })
  }, [getNextTrackIndex, loadTrack, syncTrackIndex])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!musicPlayerEnabled || !shouldUseMeting) {
      setMetingAudioList([])
      setMetingFailed(false)
      return
    }

    let ignore = false
    const loadMetingPlaylist = async () => {
      setMetingFailed(false)
      try {
        const response = await fetch(
          buildMetingPlaylistUrl({
            api: metingApi,
            server: metingServer,
            id: metingId
          })
        )
        if (!response.ok) {
          throw new Error(`Meting playlist request failed: ${response.status}`)
        }
        const songs = normalizeMetingAudioList(await response.json())
        if (!ignore) {
          setMetingAudioList(songs)
          syncTrackIndex(0)
          setMetingFailed(songs.length === 0)
        }
      } catch (error) {
        if (!ignore) {
          console.error('Meting playlist load error:', error)
          setMetingAudioList([])
          setMetingFailed(true)
        }
      }
    }

    loadMetingPlaylist()

    return () => {
      ignore = true
    }
  }, [
    musicPlayerEnabled,
    shouldUseMeting,
    metingApi,
    metingServer,
    metingId,
    syncTrackIndex
  ])

  // Initialize audio element
  useEffect(() => {
    if (!musicPlayerEnabled || audioList.length === 0) {
      return
    }

    const audio = getAudio()
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }
    const handleAudioError = error => {
      console.error('Audio load error:', error)
    }

    audio.addEventListener('ended', handleTrackEnd)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', updateProgressFromAudio)
    audio.addEventListener('error', handleAudioError)

    return () => {
      audio.removeEventListener('ended', handleTrackEnd)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', updateProgressFromAudio)
      audio.removeEventListener('error', handleAudioError)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [
    musicPlayerEnabled,
    audioList.length,
    getAudio,
    handleTrackEnd,
    updateProgressFromAudio
  ])

  // Progress update
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(updateProgressFromAudio, 200)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying, updateProgressFromAudio])

  // Close playlist when sidebar collapses
  useEffect(() => {
    if (!isExpanded) {
      setShowPlaylist(false)
    }
  }, [isExpanded])

  // Don't render if disabled or no audio
  if (!musicPlayerEnabled || audioList.length === 0) {
    return null
  }

  const togglePlay = e => {
    e.stopPropagation()
    const audio = getAudio()

    if (isPlayingRef.current) {
      audio.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
    } else {
      loadTrack(currentTrackRef.current, { autoplay: true })
    }
  }

  const playNext = e => {
    e?.stopPropagation()
    const nextIndex = getNextTrackIndex(1)
    syncTrackIndex(nextIndex)
    setProgress(0)
    setCurrentTime(0)
    if (isPlayingRef.current) {
      loadTrack(nextIndex, { autoplay: true })
    }
  }

  const playPrev = e => {
    e?.stopPropagation()
    const prevIndex = getNextTrackIndex(-1)
    syncTrackIndex(prevIndex)
    setProgress(0)
    setCurrentTime(0)
    if (isPlayingRef.current) {
      loadTrack(prevIndex, { autoplay: true })
    }
  }

  const selectTrack = index => {
    syncTrackIndex(index)
    setShowPlaylist(false)
    loadTrack(index, { autoplay: true })
  }

  const handleProgressClick = e => {
    if (!audioRef.current || !audioRef.current.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    audioRef.current.currentTime = percentage * audioRef.current.duration
    setProgress(percentage * 100)
  }

  const formatTime = seconds => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Collapsed State: Rotating cover when playing, music icon when not
  if (!isExpanded) {
    return (
      <div className={`endspace-player-mini flex justify-center ${embedded ? 'py-0' : 'py-2'}`}>
        <button
          type='button'
          aria-label={isPlaying ? 'Pause current track' : 'Play current track'}
          className='relative w-10 h-10 cursor-pointer group flex items-center justify-center border-0 bg-transparent p-0'
          onClick={togglePlay}
        >
          {isPlaying ? (
            // Playing: Show rotating album cover
            <>
              <div className='w-full h-full rounded-full overflow-hidden endspace-player-glow endspace-player-rotating'>
                <img
                  src={currentAudio.cover || fallbackCover}
                  alt='Cover'
                  className='w-full h-full object-cover'
                />
              </div>
              {/* Pause overlay on hover */}
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
                <IconPlayerPause size={14} stroke={2} className='text-white' />
              </div>
            </>
          ) : (
            // Not playing: Show music icon
            <div className={`w-full h-full flex items-center justify-center text-[var(--endspace-text-muted)] hover:text-gray-600 hover:bg-gray-200 transition-all ${embedded ? 'rounded-full bg-transparent' : 'rounded-lg bg-[var(--endspace-bg-secondary)]'}`}>
              <IconMusic size={18} stroke={1.5} />
            </div>
          )}
        </button>
      </div>
    )
  }

  // Expanded State: Compact player with album cover as play button
  if (embedded) {
    return (
      <div className="endspace-player-full relative flex h-full w-full items-center px-0.5">
        {showPlaylist && (
          <div className="absolute bottom-full left-0 right-0 mb-2 max-h-32 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100/95 p-1 shadow-lg">
            {audioList.map((audio, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectTrack(index)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  index === currentTrack
                    ? 'bg-black text-white'
                    : 'text-[var(--endspace-text-secondary)] hover:bg-gray-200 hover:text-black'
                }`}
              >
                <span className="w-3 flex-shrink-0 text-center font-mono text-[9px] leading-none">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold leading-tight">
                    {audio.name}
                  </span>
                  <span className={`block truncate text-[9px] leading-tight ${
                    index === currentTrack ? 'text-white/70' : 'text-[var(--endspace-text-muted)]'
                  }`}>
                    {audio.artist || 'Unknown Artist'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowPlaylist(!showPlaylist) }}
            className="group/cover relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/70 text-[var(--endspace-text-muted)] transition-colors hover:text-black"
            title="Playlist"
          >
            <img
              src={currentAudio.cover || '/default-cover.jpg'}
              alt="Cover"
              className={`h-full w-full rounded-full object-cover transition-opacity ${showPlaylist ? 'opacity-20' : 'opacity-100 group-hover/cover:opacity-20'}`}
            />
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${showPlaylist ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'}`}>
              <IconList size={14} stroke={1.5} />
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold leading-tight text-[var(--endspace-text-primary)]">
              {currentAudio.name || 'Unknown Track'}
            </div>
            <div className="mt-0.5 truncate text-[10px] leading-tight text-[var(--endspace-text-muted)]">
              {currentAudio.artist || formatTime(currentTime)}
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-200" onClick={handleProgressClick}>
              <div
                className="h-full bg-[var(--endspace-accent-yellow)] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex h-10 w-5 flex-shrink-0 flex-col items-center justify-between rounded-lg bg-gray-200/70 p-0.5 text-[var(--endspace-text-muted)]">
            <button
              onClick={playPrev}
              className="flex h-3 w-4 items-center justify-center rounded transition-colors hover:bg-[var(--endspace-accent-yellow)] hover:text-black"
              title="Previous"
            >
              <IconPlayerTrackPrev size={10} stroke={2} className="rotate-90" />
            </button>
            <button
              type="button"
              className={`flex h-3.5 w-4 items-center justify-center rounded transition-colors hover:bg-[var(--endspace-accent-yellow)] hover:text-black ${
                isPlaying ? 'bg-[var(--endspace-accent-yellow)] text-black' : ''
              }`}
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <IconPlayerPause size={14} stroke={2.5} />
              ) : (
                <IconPlayerPlay size={12} stroke={2.5} className="ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="flex h-3 w-4 items-center justify-center rounded transition-colors hover:bg-[var(--endspace-accent-yellow)] hover:text-black"
              title="Next"
            >
              <IconPlayerTrackNext size={10} stroke={2} className="rotate-90" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='endspace-player-full px-3 py-3 relative'>
      {/* Main Content Row */}
      <div className='flex gap-3 items-start'>
        {/* Album Cover with integrated play button */}
        <button
          type='button'
          aria-label={isPlaying ? 'Pause current track' : 'Play current track'}
          className={`relative flex-shrink-0 w-12 h-12 rounded cursor-pointer overflow-hidden group border-0 bg-transparent p-0 ${isPlaying ? 'endspace-player-glow' : ''}`}
          onClick={togglePlay}
        >
          <img
            src={currentAudio.cover || fallbackCover}
            alt='Album Cover'
            className={`w-full h-full object-cover transition-transform duration-300 ${isPlaying ? 'scale-105' : ''}`}
          />
          {/* Play/Pause Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
          >
            {isPlaying ? (
              <IconPlayerPause size={16} stroke={2} className='text-white' />
            ) : (
              <IconPlayerPlay
                size={16}
                stroke={2}
                className='text-white ml-0.5'
              />
            )}
          </div>
        </button>

        {/* Track Info */}
        <div className='flex-1 min-w-0 flex flex-col justify-center'>
          <div className='text-sm font-bold text-[var(--endspace-text-primary)] truncate leading-tight'>
            {currentAudio.name || 'Unknown Track'}
          </div>
          <div className='text-xs text-[var(--endspace-text-muted)] truncate mt-0.5'>
            {currentAudio.artist || 'Unknown Artist'}
          </div>
          {/* Progress Bar */}
          <div className='mt-1.5 flex items-center gap-2'>
            <div
              className='flex-1 h-1 bg-[var(--endspace-bg-tertiary)] rounded-full cursor-pointer overflow-hidden'
              onClick={handleProgressClick}
            >
              <div
                className='h-full bg-[var(--endspace-accent-yellow)] transition-all duration-200'
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className='text-[9px] font-mono text-[var(--endspace-text-muted)] w-8 text-right'>
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Right side: Playlist button + Prev/Next buttons */}
        <div className='flex flex-col items-center gap-1'>
          {/* Playlist Toggle Button */}
          <button
            type='button'
            aria-label='Toggle playlist'
            onClick={e => {
              e.stopPropagation()
              setShowPlaylist(!showPlaylist)
            }}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${showPlaylist ? 'bg-black text-white' : 'text-[var(--endspace-text-muted)] hover:text-black'}`}
            title='Playlist'
          >
            <IconList size={12} stroke={1.5} />
          </button>

          {/* Prev/Next Buttons (horizontal) */}
          <div className='flex items-center gap-0.5'>
            <button
              type='button'
              aria-label='Previous track'
              onClick={playPrev}
              className='w-5 h-5 flex items-center justify-center text-[var(--endspace-text-muted)] hover:text-black transition-colors'
              title='Previous'
            >
              <IconPlayerTrackPrev size={11} stroke={1.5} />
            </button>
            <button
              type='button'
              aria-label='Next track'
              onClick={playNext}
              className='w-5 h-5 flex items-center justify-center text-[var(--endspace-text-muted)] hover:text-black transition-colors'
              title='Next'
            >
              <IconPlayerTrackNext size={11} stroke={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Dropdown */}
      {showPlaylist && (
        <div className='mt-2 max-h-36 overflow-y-auto bg-[var(--endspace-bg-secondary)] rounded'>
          {audioList.map((audio, index) => (
            <div
              key={index}
              onClick={() => selectTrack(index)}
              className={`px-3 py-1.5 cursor-pointer transition-colors ${
                index === currentTrack
                  ? 'bg-black text-white'
                  : 'hover:bg-[var(--endspace-bg-tertiary)]'
              }`}
            >
              {/* Song name line */}
              <div
                className={`text-xs truncate flex items-center gap-1.5 ${
                  index === currentTrack
                    ? 'text-white font-medium'
                    : 'text-[var(--endspace-text-secondary)]'
                }`}
              >
                {index === currentTrack && isPlaying && (
                  <IconVolume
                    size={11}
                    stroke={1.5}
                    className='flex-shrink-0'
                  />
                )}
                {index === currentTrack && !isPlaying && (
                  <IconPlayerPause
                    size={11}
                    stroke={1.5}
                    className='flex-shrink-0'
                  />
                )}
                {index !== currentTrack && (
                  <span className='w-3 text-center font-mono text-[9px] text-[var(--endspace-text-muted)] flex-shrink-0'>
                    {index + 1}
                  </span>
                )}
                <span className='truncate'>{audio.name}</span>
              </div>
              {/* Artist name line (smaller) */}
              <div className='text-[10px] text-[var(--endspace-text-muted)] truncate pl-4 mt-0.5'>
                {audio.artist}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EndspacePlayer
