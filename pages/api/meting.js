import {
  chunkArray,
  extractNeteaseTrackIds,
  mapNeteaseSongsToMeting
} from '@/lib/utils/neteaseMusic'

/**
 * Self-hosted Meting replacement.
 *
 * The public Meting gateways (api.injahow.cn et al.) are unreliable and have
 * been returning empty 200 responses, which silently drops the music players
 * back to their bundled fallback playlist. This route proxies NetEase Cloud
 * Music directly from the server so playback no longer depends on a third
 * party staying alive.
 *
 * GET /api/meting?server=netease&type=playlist&id=<playlistId>
 * Returns the Meting audio shape: [{ name, artist, url, pic, lrc }].
 */

const PLAYLIST_DETAIL_API =
  'https://music.163.com/api/v6/playlist/detail'
const SONG_DETAIL_API = 'https://music.163.com/api/v3/song/detail'
const SONG_DETAIL_CHUNK_SIZE = 100
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

// NetEase rejects requests without a browser-like UA and a music.163.com referer.
const NETEASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  Referer: 'https://music.163.com/',
  'Content-Type': 'application/x-www-form-urlencoded'
}

// In-memory cache, keyed by playlist id. Survives within a serverless instance.
const playlistCache = new Map()

async function fetchTrackIds(playlistId) {
  const response = await fetch(PLAYLIST_DETAIL_API, {
    method: 'POST',
    headers: NETEASE_HEADERS,
    body: new URLSearchParams({ id: playlistId }).toString()
  })
  if (!response.ok) {
    throw new Error(`Playlist detail request failed: ${response.status}`)
  }
  return extractNeteaseTrackIds(await response.json())
}

async function fetchSongs(trackIds) {
  const chunks = chunkArray(trackIds, SONG_DETAIL_CHUNK_SIZE)
  const results = await Promise.all(
    chunks.map(async chunk => {
      const c = JSON.stringify(chunk.map(id => ({ id })))
      const response = await fetch(SONG_DETAIL_API, {
        method: 'POST',
        headers: NETEASE_HEADERS,
        body: new URLSearchParams({ c }).toString()
      })
      if (!response.ok) {
        throw new Error(`Song detail request failed: ${response.status}`)
      }
      const data = await response.json()
      return Array.isArray(data?.songs) ? data.songs : []
    })
  )

  // Preserve playlist ordering even though detail requests resolve in parallel.
  const songById = new Map()
  for (const songs of results) {
    for (const song of songs) {
      songById.set(song.id, song)
    }
  }
  return trackIds.map(id => songById.get(id)).filter(Boolean)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const playlistId = req.query.id
  if (!playlistId) {
    return res.status(400).json({ message: 'Missing playlist id' })
  }

  try {
    const cached = playlistCache.get(playlistId)
    if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=1800, stale-while-revalidate=86400'
      )
      return res.status(200).json(cached.audioList)
    }

    const trackIds = await fetchTrackIds(playlistId)
    if (trackIds.length === 0) {
      return res.status(404).json({ message: 'Playlist is empty or not found' })
    }

    const songs = await fetchSongs(trackIds)
    const audioList = mapNeteaseSongsToMeting(songs)

    playlistCache.set(playlistId, { audioList, updatedAt: Date.now() })

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=1800, stale-while-revalidate=86400'
    )
    return res.status(200).json(audioList)
  } catch (error) {
    console.error('[Meting API] Error loading playlist:', error)
    return res.status(502).json({ message: 'Failed to load playlist' })
  }
}
