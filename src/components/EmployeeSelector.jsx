import { useState, useRef } from 'react'
import { formatTime } from '../utils/timeUtils'

function EmployeeCard({ name, total, isActive, locked, onSelect, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef(null)

  const startEdit = (e) => {
    e.stopPropagation()
    setDraft(name)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(trimmed)
    else setDraft(name)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setEditing(false); setDraft(name) }
  }

  return (
    <div
      onClick={!isActive && !locked ? onSelect : undefined}
      className={[
        'flex-1 border p-4 transition-colors',
        isActive
          ? 'bg-black text-white border-black'
          : locked
          ? 'bg-white text-gray-300 border-gray-200 cursor-not-allowed'
          : 'bg-white text-black border-gray-300 cursor-pointer hover:border-black',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between mb-3">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            onClick={(e) => e.stopPropagation()}
            maxLength={20}
            className={[
              'text-sm font-medium w-full border-b pb-px bg-transparent',
              isActive
                ? 'border-white text-white placeholder-gray-400'
                : 'border-black text-black',
            ].join(' ')}
          />
        ) : (
          <span className="text-sm font-medium truncate pr-2">{name}</span>
        )}
        {!editing && (
          <button
            onClick={startEdit}
            className={[
              'text-xs shrink-0 underline-offset-2 hover:underline',
              isActive ? 'text-gray-300' : 'text-gray-400',
            ].join(' ')}
          >
            renombrar
          </button>
        )}
      </div>

      <div className="font-mono text-2xl font-light tracking-tight">
        {formatTime(total)}
      </div>

      <div className={['text-xs mt-1 uppercase tracking-widest', isActive ? 'text-gray-300' : 'text-gray-400'].join(' ')}>
        {isActive ? 'activo' : 'seleccionar'}
      </div>
    </div>
  )
}

export default function EmployeeSelector({ names, active, partials, locked, onSelect, onRename }) {
  const totals = names.map((name) =>
    partials.filter((p) => p.employee === name).reduce((acc, p) => acc + p.duration, 0)
  )

  return (
    <div className="flex gap-3">
      {names.map((name, i) => (
        <EmployeeCard
          key={i}
          name={name}
          total={totals[i]}
          isActive={active === i}
          locked={locked}
          onSelect={() => onSelect(i)}
          onRename={(newName) => onRename(i, newName)}
        />
      ))}
    </div>
  )
}
