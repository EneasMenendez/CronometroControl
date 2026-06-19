const PARTIALS_KEY = 'cronometro_parciales'
const NAMES_KEY = 'cronometro_empleados'

export function getPartials() {
  try {
    const raw = localStorage.getItem(PARTIALS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePartials(partials) {
  localStorage.setItem(PARTIALS_KEY, JSON.stringify(partials))
}

export function clearPartials() {
  localStorage.removeItem(PARTIALS_KEY)
}

export function getEmployeeNames() {
  try {
    const raw = localStorage.getItem(NAMES_KEY)
    return raw ? JSON.parse(raw) : ['Empleado A', 'Empleado B']
  } catch {
    return ['Empleado A', 'Empleado B']
  }
}

export function saveEmployeeNames(names) {
  localStorage.setItem(NAMES_KEY, JSON.stringify(names))
}
