import { useRef } from 'react'
import { exportToCSV, parseCSV } from '../utils/csvUtils'

export default function DataActions({ partials, onImport }) {
  const fileRef = useRef(null)

  const handleExport = () => {
    if (partials.length === 0) return
    exportToCSV(partials)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const { records, error } = parseCSV(text)

      if (error) {
        alert(`Error al leer el archivo:\n${error}`)
        return
      }
      if (records.length === 0) {
        alert('No se encontraron registros válidos en el archivo.')
        return
      }

      onImport(records)
    } catch {
      alert('No se pudo leer el archivo.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-5 mt-8 border-t border-gray-200 pt-6">
      <span className="text-xs uppercase tracking-widest text-gray-400 mr-auto">
        Datos
      </span>

      <button
        onClick={handleExport}
        disabled={partials.length === 0}
        className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors disabled:text-gray-200 disabled:cursor-not-allowed"
      >
        Exportar CSV
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
      >
        Importar CSV
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
