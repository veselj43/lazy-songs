import { PATH_TEST_SONGS } from '~/service/dev.constant'

export const useConfigStore = defineStore('config', () => {
  const pathSongs = ref(PATH_TEST_SONGS)

  return {
    pathSongs,
  }
})
