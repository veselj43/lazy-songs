export const useConfigStore = defineStore('config', () => {
  const pathSongs = ref('/storage/self/primary/_test/songs')
  const pathPlaylists = ref('/storage/self/primary/_test/playlists')

  return {
    pathSongs,
    pathPlaylists,
  }
})
