import { useRef, type RefObject } from 'react'
import { FileUp } from 'lucide-react'

interface ImportDropZoneProps {
  inputRef: RefObject<HTMLInputElement | null>
  onFile: (file: File) => void
}

export function ImportDropZone({ inputRef, onFile }: ImportDropZoneProps) {
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) onFile(file)
  }

  return (
    <div
      className="border-2 border-dashed border-border-strong rounded-2xl p-10 text-center cursor-pointer hover:border-accent transition-colors animate-fade-up"
      style={{ animationDelay: '50ms' }}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      <FileUp size={36} className="mx-auto text-text-subtle mb-3" />
      <p className="text-text font-semibold text-sm">Solte o arquivo aqui</p>
      <p className="text-text-muted text-xs mt-1">ou clique para selecionar</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
    </div>
  )
}
