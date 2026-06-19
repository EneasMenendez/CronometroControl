import { useState, useRef, useEffect, useCallback } from 'react'
import EmployeeSelector from './components/EmployeeSelector'
import Chronometer from './components/Chronometer'
import Controls from './components/Controls'
import CategoryModal from './components/CategoryModal'
import PartialsList from './components/PartialsList'
import TotalSummary from './components/TotalSummary'
import DataActions from './components/DataActions'
import {
  getPartials, savePartials, clearPartials,
  getEmployeeNames, saveEmployeeNames,
} from './utils/storage'
import { formatDateTime } from './utils/timeUtils'

export default function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [partials, setPartials] = useState(() => getPartials())
  const [showModal, setShowModal] = useState(false)
  const [pendingDuration, setPendingDuration] = useState(0)
  const [employeeNames, setEmployeeNames] = useState(() => getEmployeeNames())
  const [activeEmployee, setActiveEmployee] = useState(0)

  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const elapsedBaseRef = useRef(0)

  const tick = useCallback(() => {
    setElapsed(elapsedBaseRef.current + (Date.now() - startTimeRef.current))
  }, [])

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(tick, 100)
    setIsRunning(true)
  }, [tick])

  const pause = useCallback(() => {
    clearInterval(intervalRef.current)
    elapsedBaseRef.current += Date.now() - startTimeRef.current
    setIsRunning(false)
  }, [])

  const handleReset = useCallback(() => {
    if (elapsed === 0) return
    clearInterval(intervalRef.current)
    elapsedBaseRef.current = 0
    startTimeRef.current = null
    setIsRunning(false)
    setPendingDuration(elapsed)
    setShowModal(true)
  }, [elapsed])

  const handleSavePartial = useCallback((category) => {
    const partial = {
      id: Date.now(),
      employee: employeeNames[activeEmployee],
      category,
      duration: pendingDuration,
      savedAt: formatDateTime(new Date()),
    }
    const updated = [...partials, partial]
    setPartials(updated)
    savePartials(updated)
    setElapsed(0)
    setShowModal(false)
    setPendingDuration(0)
  }, [partials, pendingDuration, employeeNames, activeEmployee])

  const handleCancelModal = useCallback(() => {
    setElapsed(0)
    setShowModal(false)
    setPendingDuration(0)
  }, [])

  const handleDeletePartial = useCallback((id) => {
    const updated = partials.filter((p) => p.id !== id)
    setPartials(updated)
    savePartials(updated)
  }, [partials])

  const handleClearAll = useCallback(() => {
    if (!window.confirm('¿Borrar todos los registros?')) return
    clearPartials()
    setPartials([])
  }, [])

  const handleImport = useCallback((imported) => {
    const merge = window.confirm(
      `Se encontraron ${imported.length} registro(s).\n\nAceptar → Añadir a los existentes\nCancelar → Reemplazar todo`
    )
    const updated = merge
      ? (() => {
          const existingIds = new Set(partials.map((p) => p.id))
          const newOnes = imported.filter((p) => !existingIds.has(p.id))
          return [...partials, ...newOnes].sort((a, b) => a.id - b.id)
        })()
      : [...imported].sort((a, b) => a.id - b.id)

    setPartials(updated)
    savePartials(updated)
  }, [partials])

  const handleSelectEmployee = useCallback((index) => {
    if (elapsed > 0) return
    setActiveEmployee(index)
  }, [elapsed])

  const handleRenameEmployee = useCallback((index, name) => {
    const updated = [...employeeNames]
    updated[index] = name
    setEmployeeNames(updated)
    saveEmployeeNames(updated)
    setPartials((prev) => {
      const oldName = employeeNames[index]
      const refreshed = prev.map((p) =>
        p.employee === oldName ? { ...p, employee: name } : p
      )
      savePartials(refreshed)
      return refreshed
    })
  }, [employeeNames])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <header className="mb-8 border-b border-black pb-4">
        <h1 className="text-sm font-medium uppercase tracking-widest text-black">
          Cronometro de Becarios
        </h1>
      </header>

      <EmployeeSelector
        names={employeeNames}
        active={activeEmployee}
        partials={partials}
        locked={elapsed > 0}
        onSelect={handleSelectEmployee}
        onRename={handleRenameEmployee}
      />

      <div className="my-8 border-t border-gray-200" />

      <Chronometer elapsed={elapsed} isRunning={isRunning} />

      <Controls
        isRunning={isRunning}
        elapsed={elapsed}
        onStart={start}
        onPause={pause}
        onReset={handleReset}
      />

      <TotalSummary partials={partials} names={employeeNames} />

      <DataActions partials={partials} onImport={handleImport} />

      <PartialsList
        partials={partials}
        onDelete={handleDeletePartial}
        onClearAll={handleClearAll}
      />

      {showModal && (
        <CategoryModal
          duration={pendingDuration}
          employee={employeeNames[activeEmployee]}
          employeeTotal={
            partials
              .filter((p) => p.employee === employeeNames[activeEmployee])
              .reduce((acc, p) => acc + p.duration, 0) + pendingDuration
          }
          onSave={handleSavePartial}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  )
}
