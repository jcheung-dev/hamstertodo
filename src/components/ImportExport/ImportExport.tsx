import React from 'react'
import { useTodoContext } from '../../context/TodoContext'

function parseCsv(text: string){
  // very small CSV parser: expects header row with title,description,dueDate,completed,createdAt (optional)
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
  if(lines.length === 0) return []
  const headers = lines[0].split(',').map(h=>h.trim())
  return lines.slice(1).map(l=>{
    const values = l.split(',').map(v=>v.trim())
    const obj: any = {}
    for(let i=0;i<headers.length;i++) obj[headers[i]] = values[i]
    // coerce completed
    if(obj.completed !== undefined) obj.completed = ['1','true','yes'].includes(String(obj.completed).toLowerCase())
    return obj
  })
}

export default function ImportExport(){
  const [filename, setFilename] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement | null>(null)
  const { applyImport, exportTodos } = useTodoContext()
  const [pendingItems, setPendingItems] = React.useState<any[] | null>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [confirmReplace, setConfirmReplace] = React.useState(false)

  // close modal on Escape
  React.useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape' && showModal){
        setShowModal(false)
        setPendingItems(null)
        setConfirmReplace(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[showModal])

  function onImport(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files && e.target.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ()=>{
      const text = String(reader.result || '')
      let items: any[] = []
      // try JSON first
      try{
        const parsed = JSON.parse(text)
        if(Array.isArray(parsed)) items = parsed
      }catch(err){
        // not JSON, try CSV
        items = parseCsv(text)
      }
      setPendingItems(items)
      setShowModal(true)
    }
    reader.readAsText(f)
    setFilename(f.name)
  }

  function onExport(){
    const data = exportTodos()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todos.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function triggerPicker(){
    if(fileRef.current) fileRef.current.click()
  }

  function confirmImport(mode: 'replace' | 'attach'){
    if(!pendingItems) return
    applyImport(pendingItems, mode)
    setPendingItems(null)
    setShowModal(false)
  }

  return (
    <div className="card">
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <input ref={el=>fileRef.current = el} aria-label="import-input" className="file-input-hidden" type="file" accept=".json,.csv,text/csv,application/json" onChange={onImport} />
        <button className="control-btn import-btn" onClick={triggerPicker} aria-label="Import todos">
          <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Import
        </button>
        {filename && <span style={{fontSize:13,color:'var(--muted)'}}>{filename}</span>}
        <button className="control-btn" onClick={onExport} aria-label="Export todos">
          <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 17l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 3H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Export
        </button>
      </div>

      {showModal && pendingItems !== null && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Import {pendingItems.length} items?</h3>
            <p style={{color:'var(--muted)'}}>You can fully replace the current todo list (irreversible) or attach the imported items to the end of your existing list.</p>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
              <button className="control-btn" onClick={()=>confirmImport('attach')}>Attach</button>
              {!confirmReplace ? (
                <button className="control-btn" onClick={()=>setConfirmReplace(true)}>Fully replace</button>
              ) : (
                <button className="control-btn" onClick={()=>{ confirmImport('replace') }}>Confirm replace (cannot recover)</button>
              )}
              <button className="control-btn" onClick={()=>{ setShowModal(false); setPendingItems(null); setConfirmReplace(false) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
