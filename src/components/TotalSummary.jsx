import { formatTime } from '../utils/timeUtils'

export default function TotalSummary({ partials, names }) {
  const total = partials.reduce((acc, p) => acc + p.duration, 0)
  if (total === 0) return null

  const totals = names.map((name) => ({
    name,
    duration: partials.filter((p) => p.employee === name).reduce((acc, p) => acc + p.duration, 0),
    count: partials.filter((p) => p.employee === name).length,
  }))

  return (
    <div className="mt-8 border-t border-black pt-6">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-gray-400">Total acumulado</span>
        <span className="font-mono text-2xl font-light">{formatTime(total)}</span>
      </div>

      <div className="flex gap-6">
        {totals.map(({ name, duration, count }) => (
          <div key={name}>
            <div className="text-xs text-gray-400 mb-1">{name} ({count})</div>
            <div className="font-mono text-base">{formatTime(duration)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
