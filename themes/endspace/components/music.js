// Same-origin route that proxies the music platform server-side. Public Meting
// gateways (api.injahow.cn et al.) have been returning empty responses, so we
// host the playlist lookup ourselves. See pages/api/meting.js.
const DEFAULT_METING_API = '/api/meting'

export const buildMetingPlaylistUrl = ({ server, id, api = DEFAULT_METING_API }) => {
  const params = new URLSearchParams()
  params.set('server', server || 'netease')
  params.set('type', 'playlist')
  params.set('id', id || '')

  return `${api}?${params.toString()}`
}

export const normalizeMetingAudioList = songs => {
  if (!Array.isArray(songs)) {
    return []
  }

  return songs
    .map(song => ({
      name: song?.name || 'Unknown Track',
      artist: song?.artist || 'Unknown Artist',
      url: song?.url,
      cover: song?.pic || song?.cover,
      lrc: song?.lrc
    }))
    .filter(song => song.url)
}
