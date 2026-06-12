/**
 * Pure helpers for turning NetEase Cloud Music playlist responses into the
 * Meting-compatible audio shape consumed by the music players.
 *
 * Network orchestration lives in the API route (pages/api/meting.js); the
 * functions here stay side-effect free so they can be unit tested.
 */

/**
 * Direct, playable audio endpoint for a NetEase track id.
 */
export const buildNeteaseSongUrl = id =>
  `https://music.163.com/song/media/outer/url?id=${id}.mp3`

/**
 * Pull the ordered list of track ids from a v6 playlist/detail response.
 * `trackIds` carries the full playlist while `tracks` only inlines the first
 * page of songs, so we rely on `trackIds` for completeness.
 */
export const extractNeteaseTrackIds = playlistDetail => {
  const trackIds = playlistDetail?.playlist?.trackIds
  if (!Array.isArray(trackIds)) {
    return []
  }

  return trackIds.map(track => track?.id).filter(id => id != null)
}

/**
 * Map v3 song/detail entries into the Meting audio shape
 * ({ name, artist, url, pic, lrc }). Songs without an id are dropped because
 * they cannot resolve a playable url.
 */
export const mapNeteaseSongsToMeting = songs => {
  if (!Array.isArray(songs)) {
    return []
  }

  return songs
    .filter(song => song?.id != null)
    .map(song => {
      const artists = Array.isArray(song.ar)
        ? song.ar.map(artist => artist?.name).filter(Boolean)
        : []

      return {
        name: song.name || 'Unknown Track',
        artist: artists.join(' / ') || 'Unknown Artist',
        url: buildNeteaseSongUrl(song.id),
        pic: song.al?.picUrl || '',
        lrc: ''
      }
    })
}

/**
 * Split an array into fixed-size chunks. Used to keep song/detail request URLs
 * below practical length limits for large playlists.
 */
export const chunkArray = (items, size) => {
  if (!Array.isArray(items) || size <= 0) {
    return []
  }

  const chunks = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}
