export function isOverdue(dueIso?: string): boolean{
  if(!dueIso) return false
  const now = new Date()
  const due = new Date(dueIso)
  return due.getTime() < now.getTime()
}

export function formatDateIso(iso?: string){
  if(!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString()
}
