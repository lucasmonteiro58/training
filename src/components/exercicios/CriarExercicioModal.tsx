import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Search, X } from 'lucide-react'
import type { Exercicio } from '../../types'
import { GRUPOS_MUSCULARES } from '../../types'
import { salvarExercicioPersonalizado } from '../../lib/db/dexie'
import { syncExercicioParaFirestore } from '../../lib/firestore/sync'
import { useAuthStore } from '../../stores'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '../ui/select'

interface CriarExercicioModalProps {
  onClose: () => void
  onSuccess: (ex: Exercicio) => void
  gruposExistentes?: string[]
}

export function CriarExercicioModal({ onClose, onSuccess, gruposExistentes = GRUPOS_MUSCULARES }: CriarExercicioModalProps) {
  const user = useAuthStore((s) => s.user)
  const [nome, setNome] = useState('')
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>(GRUPOS_MUSCULARES[0])
  const [isNovoGrupo, setIsNovoGrupo] = useState(false)
  const [novoGrupoTexto, setNovoGrupoTexto] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [gifUrl, setGifUrl] = useState('')

  const [buscandoImagem, setBuscandoImagem] = useState(false)
  const [imagensWeb, setImagensWeb] = useState<string[]>([])
  const [termoBusca, setTermoBusca] = useState('')
  const [termoBuscaModificado, setTermoBuscaModificado] = useState(false)

  // Auto-preencher busca de imagem se o usuário não tiver alterado manualmente
  useEffect(() => {
    if (!termoBuscaModificado && nome.trim()) {
      setTermoBusca(nome)
    }
  }, [nome, termoBuscaModificado])

  const handleBuscarImagem = async () => {
    if (!termoBusca) return
    setBuscandoImagem(true)
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(termoBusca + ' exercise')}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&format=json&origin=*`
      const res = await fetch(url)
      const data = await res.json()
      const pages = data.query?.pages || {}
      const urls = Object.values(pages)
        .map((p: any) => p.imageinfo?.[0]?.url)
        .filter((u: string) => u && !u.toLowerCase().endsWith('.svg') && !u.toLowerCase().endsWith('.pdf'))

      setImagensWeb(urls as string[])
    } catch (e) {
      console.error(e)
    } finally {
      setBuscandoImagem(false)
    }
  }

  const handleSalvar = async () => {
    const grupoFinal = isNovoGrupo ? novoGrupoTexto.trim() : grupoSelecionado
    if (!nome.trim() || !grupoFinal || !user) return

    const novoExercicio: Exercicio = {
      id: `custom-${uuidv4()}`,
      nome: nome.trim(),
      grupoMuscular: grupoFinal,
      equipamento: equipamento.trim() || undefined,
      gifUrl: gifUrl || undefined,
      personalizado: true,
      userId: user.uid,
    }

    await salvarExercicioPersonalizado(novoExercicio)
    syncExercicioParaFirestore(novoExercicio)

    onSuccess(novoExercicio)
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
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Supino Inclinado com Halteres"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted block">GRUPO MUSCULAR *</label>
              {isNovoGrupo && (
                <button type="button" onClick={() => setIsNovoGrupo(false)} className="text-accent text-xs font-medium">
                  Voltar para lista
                </button>
              )}
            </div>

            {isNovoGrupo ? (
              <input
                className="input w-full"
                value={novoGrupoTexto}
                onChange={e => setNovoGrupoTexto(e.target.value)}
                placeholder="Ex: Lombar, Antebraço..."
                autoFocus
              />
            ) : (
              <Select
                value={grupoSelecionado}
                onValueChange={(value) => {
                  if (value === '___NOVO___') {
                    setIsNovoGrupo(true)
                  } else {
                    setGrupoSelecionado(value)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {gruposExistentes.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
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
              value={equipamento}
              onChange={e => setEquipamento(e.target.value)}
              placeholder="Ex: Halteres (Opcional)"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted mb-1.5 block">BUSCAR IMAGEM (WEB)</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={termoBusca}
                onChange={e => {
                  setTermoBusca(e.target.value)
                  setTermoBuscaModificado(true)
                }}
                onKeyDown={e => e.key === 'Enter' && handleBuscarImagem()}
                placeholder="Ex: bench press"
              />
              <button onClick={handleBuscarImagem} disabled={buscandoImagem} className="btn-secondary px-4">
                <Search size={16} />
              </button>
            </div>

            {imagensWeb.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-surface-2 rounded-xl max-h-48 overflow-y-auto">
                {imagensWeb.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setGifUrl(url)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      gifUrl === url ? 'border-accent opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* URL manual */}
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
            onClick={handleSalvar}
            disabled={!nome.trim() || (isNovoGrupo && !novoGrupoTexto.trim())}
            className="btn-primary w-full disabled:opacity-40"
          >
            Salvar Exercício
          </button>
        </div>
      </div>
    </div>
  )
}
