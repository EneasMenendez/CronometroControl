import { formatTime } from '../utils/timeUtils'

const CATEGORIES = ['Telefono', 'Bano', 'Otro']

export default function CategoryModal({ duration, employee, employeeTotal, onSave, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-black p-8 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-5">
          Guardar parcial — {employee}
        </p>

        <div className="mb-6 border-t border-b border-gray-100 py-4 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-widest text-gray-400">Parcial</span>
            <span className="font-mono text-2xl font-light">{formatTime(duration)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-widest text-gray-400">Total empleado</span>
            <span className="font-mono text-2xl">{formatTime(employeeTotal)}</span>
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Motivo</p>

        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSave(cat)}
              className="border border-black text-black py-2 px-4 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors text-left"
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-5 text-xs text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
