import { formatTime } from './timeUtils'

const SEP = ';'

export function exportToCSV(partials) {
  const headers = ['id', 'empleado', 'motivo', 'duracion_ms', 'duracion', 'hora']
  const rows = partials.map((p) => [
    p.id,
    p.employee,
    p.category,
    p.duration,
    formatTime(p.duration),
    p.savedAt,
  ])

  const csv = [headers, ...rows].map((row) => row.join(SEP)).join('\r\n')
  // BOM para que Excel en español lo abra correctamente
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cronometro_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { records: [], error: 'Archivo vacío o sin registros.' }

  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^﻿/, '').toLowerCase())

  const required = ['empleado', 'motivo', 'duracion_ms', 'hora']
  const missing = required.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return { records: [], error: `Columnas no encontradas: ${missing.join(', ')}` }
  }

  const records = lines.slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line, i) => {
      const values = line.split(sep)
      const row = {}
      headers.forEach((h, idx) => { row[h] = values[idx]?.trim() ?? '' })

      const duration = Number(row['duracion_ms'])
      if (!row['empleado'] || isNaN(duration) || duration <= 0) return null

      return {
        id: Number(row['id']) || Date.now() + i,
        employee: row['empleado'],
        category: row['motivo'] || 'Otro',
        duration,
        savedAt: row['hora'] || '',
      }
    })
    .filter(Boolean)

  return { records, error: null }
}
