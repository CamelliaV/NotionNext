const DEFAULT_METING_API = 'https://api.injahow.cn/meting/'

export const buildMetingPlaylistUrl = ({ server, id, api = DEFAULT_METING_API }) => {
  const url = new URL(api)
  if (!url.searchParams.has('server')) {
    url.searchParams.set('server', server || 'netease')
  }
  if (!url.searchParams.has('type')) {
    url.searchParams.set('type', 'playlist')
  }
  if (!url.searchParams.has('id')) {
    url.searchParams.set('id', id || '')
  }

  return url.toString()
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
