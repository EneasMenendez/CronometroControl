import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Parciales ─────────────────────────────────────────────

export async function dbGetPartials() {
  const { data, error } = await supabase
    .from('partials')
    .select('id, employee, category, duration, saved_at')
    .order('id', { ascending: true })
  if (error) throw error
  return data.map((r) => ({ ...r, savedAt: r.saved_at }))
}

export async function dbInsertPartial(partial) {
  const { error } = await supabase.from('partials').insert({
    id: partial.id,
    employee: partial.employee,
    category: partial.category,
    duration: partial.duration,
    saved_at: partial.savedAt,
  })
  if (error) throw error
}

export async function dbDeletePartial(id) {
  const { error } = await supabase.from('partials').delete().eq('id', id)
  if (error) throw error
}

export async function dbDeleteAllPartials() {
  const { error } = await supabase.from('partials').delete().gte('id', 0)
  if (error) throw error
}

export async function dbInsertPartials(partials) {
  const rows = partials.map((p) => ({
    id: p.id,
    employee: p.employee,
    category: p.category,
    duration: p.duration,
    saved_at: p.savedAt || '',
  }))
  const { error } = await supabase.from('partials').insert(rows)
  if (error) throw error
}

export async function dbRenameEmployeeInPartials(oldName, newName) {
  const { error } = await supabase
    .from('partials')
    .update({ employee: newName })
    .eq('employee', oldName)
  if (error) throw error
}

// ── Nombres de empleados ──────────────────────────────────

export async function dbGetEmployeeNames() {
  const { data, error } = await supabase
    .from('employee_names')
    .select('position, name')
    .order('position', { ascending: true })
  if (error) throw error
  return data.map((r) => r.name)
}

export async function dbUpdateEmployeeName(position, name) {
  const { error } = await supabase
    .from('employee_names')
    .update({ name })
    .eq('position', position)
  if (error) throw error
}
