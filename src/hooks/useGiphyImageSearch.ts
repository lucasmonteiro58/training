import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useGiphyImageSearch(initialTerm: string) {
  const [searchTerm, setSearchTerm] = useState(initialTerm)
  const [webImages, setWebImages] = useState<string[]>([])
  const [searchingImage, setSearchingImage] = useState(false)

  const searchImage = useCallback(async () => {
    if (!searchTerm.trim()) return
    setSearchingImage(true)
    setWebImages([])
    try {
      const key = import.meta.env.VITE_GIPHY_API_KEY
      if (!key) {
        toast.error('Chave da API Giphy não configurada.')
        return
      }
      const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(searchTerm + ' exercise')}&limit=12&rating=g`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const urls: string[] = (data.data ?? [])
        .map(
          (gif: any) =>
            gif?.images?.original?.url ?? gif?.images?.downsized?.url
        )
        .filter(Boolean)
      setWebImages(urls)
      if (urls.length === 0)
        toast.info('Nenhuma imagem encontrada. Tente outro termo.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao buscar imagens.')
    } finally {
      setSearchingImage(false)
    }
  }, [searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    webImages,
    searchingImage,
    searchImage,
  }
}
