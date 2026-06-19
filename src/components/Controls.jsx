export default function Controls({ isRunning, elapsed, onStart, onPause, onReset }) {
  return (
    <div className="flex gap-3 justify-center mt-2">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="border border-black bg-black text-white px-8 py-2 text-xs uppercase tracking-widest hover:bg-gray-900 transition-colors"
        >
          {elapsed > 0 ? 'Continuar' : 'Iniciar'}
        </button>
      ) : (
        <button
          onClick={onPause}
          className="border border-black bg-white text-black px-8 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          Pausar
        </button>
      )}

      <button
        onClick={onReset}
        disabled={elapsed === 0}
        className="border border-black text-black px-8 py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-300"
      >
        Guardar y resetear
      </button>
    </div>
  )
}
