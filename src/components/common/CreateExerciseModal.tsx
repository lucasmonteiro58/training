import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Search, X, RefreshCw } from 'lucide-react'
import type { Exercise } from '../../types'
import { MUSCLE_GROUPS } from '../../types'
import { savePersonalizedExercise } from '../../lib/db/dexie'
import { syncExerciseToFirestore } from '../../lib/firestore/sync'
import { useAuthStore } from '../../stores'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '../ui/select'

interface CreateExerciseModalProps {
  onClose: () => void
  onSuccess: (ex: Exercise) => void
  existingGroups?: string[]
}

export function CreateExerciseModal({ onClose, onSuccess, existingGroups = MUSCLE_GROUPS }: CreateExerciseModalProps) {
  const user = useAuthStore((s) => s.user)
  const [name, setName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>(MUSCLE_GROUPS[0])
  const [isNewGroup, setIsNewGroup] = useState(false)
  const [newGroupText, setNewGroupText] = useState('')
  const [equipment, setEquipment] = useState('')
  const [gifUrl, setGifUrl] = useState('')

  const [instructionsText, setInstructionsText] = useState('')
  const [searchingImage, setSearchingImage] = useState(false)
  const [webImages, setWebImages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermModified, setSearchTermModified] = useState(false)

  useEffect(() => {
    if (!searchTermModified && name.trim()) {
      setSearchTerm(name)
    }
  }, [name, searchTermModified])

  const handleSearchImage = async () => {
    if (!searchTerm) return
    setSearchingImage(true)
    setWebImages([])
    try {
      const key = import.meta.env.VITE_GIPHY_API_KEY
      if (!key) {
        toast.error('Chave da API Giphy não configurada. Adicione VITE_GIPHY_API_KEY no .env')
        return
      }
      const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(searchTerm)}&limit=12&rating=g`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const urls: string[] = (data.data ?? []).map((gif: any) => gif?.images?.original?.url ?? gif?.images?.downsized?.url).filter(Boolean)
      setWebImages(urls)
      if (urls.length === 0) {
        toast.info('Nenhuma imagem encontrada. Tente outro termo.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erro ao buscar imagens. Verifique sua conexão.')
    } finally {
      setSearchingImage(false)
    }
  }

  const handleSave = async () => {
    const finalGroup = isNewGroup ? newGroupText.trim() : selectedGroup
    if (!name.trim() || !finalGroup || !user) return

    const instructionsArray = instructionsText.split('\n').map(l => l.trim()).filter(Boolean)

    const newExercise: Exercise = {
      id: `custom-${uuidv4()}`,
      name: name.trim(),
      muscleGroup: finalGroup,
      equipment: equipment.trim() || undefined,
      gifUrl: gifUrl || undefined,
      instructions: instructionsArray.length > 0 ? instructionsArray : undefined,
      custom: true,
      userId: user.uid,
    }

    await savePersonalizedExercise(newExercise)
    syncExerciseToFirestore(newExercise)

    onSuccess(newExercise)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[90dvh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Criar Exercício</h2>
          <button onClick={onClose} className="btn-ghost p-2 text-text-subtle">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-4 pb-4">
          <div>
            <label className="text-xs font-semibold text-text-muted mb-1.5 block">NOME *</label>
            <input
              className="input w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Supino Inclinado com Halteres"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted block">GRUPO MUSCULAR *</label>
              {isNewGroup && (
                <button type="button" onClick={() => setIsNewGroup(false)} className="text-accent text-xs font-medium">
                  Voltar para lista
                </button>
              )}
            </div>

            {isNewGroup ? (
              <input
                className="input w-full"
                value={newGroupText}
                onChange={e => setNewGroupText(e.target.value)}
                placeholder="Ex: Lombar, Antebraço..."
                autoFocus
              />
            ) : (
              <Select
                value={selectedGroup}
                onValueChange={(value) => {
                  if (value === '___NOVO___') {
                    setIsNewGroup(true)
                  } else {
                    setSelectedGroup(value)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {existingGroups.map(g => (
                      <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="___NOVO___" className="text-accent font-medium">
                      + Adicionar nova categoria...
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted mb-1.5 block">EQUIPAMENTO</label>
            <input
              className="input w-full"
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
              placeholder="Ex: Halteres (Opcional)"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted mb-1.5 block">INSTRUÇÕES (UMA POR LINHA)</label>
            <textarea
              className="input w-full h-24 py-2 resize-none"
              value={instructionsText}
              onChange={e => setInstructionsText(e.target.value)}
              placeholder="Ex: Mantenha as costas retas&#10;Desça a barra devagar"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted mb-1.5 block">BUSCAR IMAGEM (WEB)</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setSearchTermModified(true)
                }}
                onKeyDown={e => e.key === 'Enter' && handleSearchImage()}
                placeholder="Ex: bench press"
              />
              <button onClick={handleSearchImage} disabled={searchingImage} className="btn-secondary px-4 shrink-0">
                {searchingImage
                  ? <RefreshCw size={16} className="animate-spin" />
                  : <Search size={16} />}
              </button>
            </div>

            {webImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-surface-2 rounded-xl max-h-48 overflow-y-auto">
                {webImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setGifUrl(url)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      gifUrl === url ? 'border-accent  opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3">
               <label className="text-xs font-semibold text-text-muted mb-1.5 block">URL DA IMAGEM/GIF</label>
               <input
                 className="input w-full"
                 value={gifUrl}
                 onChange={e => setGifUrl(e.target.value)}
                 placeholder="https://..."
               />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border mt-auto">
          <button
            onClick={handleSave}
            disabled={!name.trim() || (isNewGroup && !newGroupText.trim())}
            className="btn-primary w-full disabled:opacity-40"
          >
            Salvar Exercício
          </button>
        </div>
      </div>
    </div>
  )
}
