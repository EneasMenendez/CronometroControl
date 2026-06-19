import { useState } from 'react'
import { formatTime } from '../utils/timeUtils'

export default function PartialsList({ partials, onDelete, onClearAll }) {
  const [confirming, setConfirming] = useState(false)

  const handleClearClick = () => setConfirming(true)
  const handleConfirm = () => { setConfirming(false); onClearAll() }
  const handleCancel = () => setConfirming(false)

  if (partials.length === 0) {
    return (
      <div className="mt-8 border-t border-gray-200 pt-6">
        <p className="text-xs uppercase tracking-widest text-gray-300">Sin registros</p>
      </div>
    )
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-gray-400">
          Registros ({partials.length})
        </span>

        {confirming ? (
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-gray-500">¿Borrar todo?</span>
            <button
              onClick={handleConfirm}
              className="text-xs uppercase tracking-widest text-black border-b border-black leading-none hover:text-gray-500 hover:border-gray-500 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={handleCancel}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={handleClearClick}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Borrar todo
          </button>
        )}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-normal pb-2 pr-4 w-6">#</th>
            <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-normal pb-2 pr-4">Empleado</th>
            <th className="text-left text-xs uppercase tracking-widest text-gray-400 font-normal pb-2 pr-4">Motivo</th>
            <th className="text-right text-xs uppercase tracking-widest text-gray-400 font-normal pb-2 pr-4">Tiempo</th>
            <th className="text-right text-xs uppercase tracking-widest text-gray-400 font-normal pb-2 w-8">Hora</th>
            <th className="w-4" />
          </tr>
        </thead>
        <tbody>
          {[...partials].reverse().map((partial, index) => (
            <tr
              key={partial.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-2 pr-4 text-gray-300 text-xs">{partials.length - index}</td>
              <td className="py-2 pr-4 text-black">{partial.employee}</td>
              <td className="py-2 pr-4 text-gray-500">{partial.category}</td>
              <td className="py-2 pr-4 text-right font-mono">{formatTime(partial.duration)}</td>
              <td className="py-2 text-right text-gray-400 text-xs">{partial.savedAt}</td>
              <td className="py-2 pl-3">
                <button
                  onClick={() => onDelete(partial.id)}
                  aria-label="Eliminar"
                  className="text-gray-300 hover:text-black transition-colors leading-none"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
