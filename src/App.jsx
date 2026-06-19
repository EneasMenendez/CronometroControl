import { useState, useRef, useEffect, useCallback } from 'react'
import EmployeeSelector from './components/EmployeeSelector'
import Chronometer from './components/Chronometer'
import Controls from './components/Controls'
import CategoryModal from './components/CategoryModal'
import PartialsList from './components/PartialsList'
import TotalSummary from './components/TotalSummary'
import DataActions from './components/DataActions'
import {
  supabase,
  dbGetPartials, dbInsertPartial, dbDeletePartial, dbDeleteAllPartials, dbInsertPartials, dbRenameEmployeeInPartials,
  dbGetEmployeeNames, dbUpdateEmployeeName,
} from './lib/supabase'
import { formatDateTime } from './utils/timeUtils'

export default function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [partials, setPartials] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [pendingDuration, setPendingDuration] = useState(0)
  const [employeeNames, setEmployeeNames] = useState(['Empleado A', 'Empleado B'])
  const [activeEmployee, setActiveEmployee] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const elapsedBaseRef = useRef(0)
  const refetchTimeoutRef = useRef(null)

  // Carga inicial y suscripción realtime
  useEffect(() => {
    const load = async () => {
      try {
        const [fetchedPartials, fetchedNames] = await Promise.all([
          dbGetPartials(),
          dbGetEmployeeNames(),
        ])
        setPartials(fetchedPartials)
        setEmployeeNames(fetchedNames)
      } catch (err) {
        setError('No se pudo conectar con la base de datos.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()

    // Refetch debounced — agrupa múltiples eventos en una sola consulta
    const refetch = () => {
      clearTimeout(refetchTimeoutRef.current)
      refetchTimeoutRef.current = setTimeout(async () => {
        try {
          const [freshPartials, freshNames] = await Promise.all([
            dbGetPartials(),
            dbGetEmployeeNames(),
          ])
          setPartials(freshPartials)
          setEmployeeNames(freshNames)
        } catch (err) {
          console.error('Error en refetch realtime:', err)
        }
      }, 200)
    }

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partials' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employee_names' }, refetch)
      .subscribe()

    return () => {
      clearTimeout(refetchTimeoutRef.current)
      supabase.removeChannel(channel)
      clearInterval(intervalRef.current)
    }
  }, [])

  // ── Timer ─────────────────────────────────────────────────

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

  // ── Operaciones de datos ──────────────────────────────────

  const handleSavePartial = useCallback(async (category) => {
    const partial = {
      id: Date.now(),
      employee: employeeNames[activeEmployee],
      category,
      duration: pendingDuration,
      savedAt: formatDateTime(new Date()),
    }
    setPartials((prev) => [...prev, partial])
    setElapsed(0)
    setShowModal(false)
    setPendingDuration(0)
    try {
      await dbInsertPartial(partial)
    } catch (err) {
      console.error('Error al guardar parcial:', err)
    }
  }, [pendingDuration, employeeNames, activeEmployee])

  const handleCancelModal = useCallback(() => {
    setElapsed(0)
    setShowModal(false)
    setPendingDuration(0)
  }, [])

  const handleDeletePartial = useCallback(async (id) => {
    setPartials((prev) => prev.filter((p) => p.id !== id))
    try {
      await dbDeletePartial(id)
    } catch (err) {
      console.error('Error al eliminar parcial:', err)
    }
  }, [])

  const handleClearAll = useCallback(async () => {
    setPartials([])
    try {
      await dbDeleteAllPartials()
    } catch (err) {
      console.error('Error al borrar registros:', err)
    }
  }, [])

  const handleImport = useCallback(async (imported) => {
    const merge = window.confirm(
      `Se encontraron ${imported.length} registro(s).\n\nAceptar → Añadir a los existentes\nCancelar → Reemplazar todo`
    )

    let updated
    if (merge) {
      const existingIds = new Set(partials.map((p) => p.id))
      const newOnes = imported.filter((p) => !existingIds.has(p.id))
      updated = [...partials, ...newOnes].sort((a, b) => a.id - b.id)
      setPartials(updated)
      try {
        await dbInsertPartials(newOnes)
      } catch (err) {
        console.error('Error al importar parciales:', err)
      }
    } else {
      updated = [...imported].sort((a, b) => a.id - b.id)
      setPartials(updated)
      try {
        await dbDeleteAllPartials()
        await dbInsertPartials(updated)
      } catch (err) {
        console.error('Error al reemplazar parciales:', err)
      }
    }
  }, [partials])

  const handleSelectEmployee = useCallback((index) => {
    if (elapsed > 0) return
    setActiveEmployee(index)
  }, [elapsed])

  const handleRenameEmployee = useCallback(async (index, name) => {
    const oldName = employeeNames[index]
    const updated = [...employeeNames]
    updated[index] = name
    setEmployeeNames(updated)
    setPartials((prev) => prev.map((p) => p.employee === oldName ? { ...p, employee: name } : p))
    try {
      await Promise.all([
        dbUpdateEmployeeName(index, name),
        dbRenameEmployeeInPartials(oldName, name),
      ])
    } catch (err) {
      console.error('Error al renombrar empleado:', err)
    }
  }, [employeeNames])

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <header className="mb-8 border-b border-black pb-4">
          <h1 className="text-sm font-medium uppercase tracking-widest text-black">
            Cronometro de Becarios
          </h1>
        </header>
        <p className="text-xs uppercase tracking-widest text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <header className="mb-8 border-b border-black pb-4">
          <h1 className="text-sm font-medium uppercase tracking-widest text-black">
            Cronometro de Becarios
          </h1>
        </header>
        <p className="text-xs uppercase tracking-widest text-red-600">{error}</p>
      </div>
    )
  }

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
