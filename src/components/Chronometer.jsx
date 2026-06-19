import { formatTime } from '../utils/timeUtils'

export default function Chronometer({ elapsed, isRunning }) {
  return (
    <div className="text-center py-6">
      <div className="font-mono text-8xl font-light tracking-tight text-black select-none">
        {formatTime(elapsed)}
      </div>
      <div className="mt-3 text-xs uppercase tracking-widest text-gray-400">
        {isRunning ? 'registrando' : elapsed > 0 ? 'pausado' : 'detenido'}
      </div>
    </div>
  )
}
