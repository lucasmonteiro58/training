import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useGiphyImageSearch(initialTermo: string) {
  const [termoBusca, setTermoBusca] = useState(initialTermo)
  const [imagensWeb, setImagensWeb] = useState<string[]>([])
  const [buscandoImagem, setBuscandoImagem] = useState(false)

  const buscarImagem = useCallback(async () => {
    if (!termoBusca.trim()) return
    setBuscandoImagem(true)
    setImagensWeb([])
    try {
      const key = import.meta.env.VITE_GIPHY_API_KEY
      if (!key) {
        toast.error('Chave da API Giphy não configurada.')
        return
      }
      const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(termoBusca + ' exercise')}&limit=12&rating=g`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const urls: string[] = (data.data ?? [])
        .map(
          (gif: any) =>
            gif?.images?.original?.url ?? gif?.images?.downsized?.url
        )
        .filter(Boolean)
      setImagensWeb(urls)
      if (urls.length === 0)
        toast.info('Nenhuma imagem encontrada. Tente outro termo.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao buscar imagens.')
    } finally {
      setBuscandoImagem(false)
    }
  }, [termoBusca])

  return {
    termoBusca,
    setTermoBusca,
    imagensWeb,
    buscandoImagem,
    buscarImagem,
  }
}
