import React, { useEffect, useState, useRef } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { useTodoContext } from '../../context/TodoContext'

export default function Header(){
  // theme preference: allow 'system'|'light'|'dark' selection. Persist applied theme for compatibility.
  const [themePref, setThemePref] = useState<'system'|'light'|'dark'>(() => {
    try{
      const saved = localStorage.getItem('theme')
      if(saved === 'dark' || saved === 'light') return saved
    }catch(e){}
    return 'system'
  })

  useEffect(()=>{
    const applied = themePref === 'system'
      ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themePref
    try{ localStorage.setItem('theme', applied) }catch(e){}
    try{ document.documentElement.setAttribute('data-theme', applied) }catch(e){}
    document.body.classList.remove('light','dark')
    document.body.classList.add(applied)
  },[themePref])

  const { applyImport, exportTodos, resetAll } = useTodoContext()
  const [showSettings, setShowSettings] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetCountdown, setResetCountdown] = useState<number | null>(null)
  const resetTimerRef = useRef<number | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [pendingItems, setPendingItems] = useState<any[] | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  function triggerPicker(){ if(fileRef.current) fileRef.current.click() }

  function parseCsv(text: string){
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    if(lines.length === 0) return []
    const headers = lines[0].split(',').map(h=>h.trim())
    return lines.slice(1).map(l=>{
      const values = l.split(',').map(v=>v.trim())
      const obj: any = {}
      for(let i=0;i<headers.length;i++) obj[headers[i]] = values[i]
      if(obj.completed !== undefined) obj.completed = ['1','true','yes'].includes(String(obj.completed).toLowerCase())
      return obj
    })
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files && e.target.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ()=>{
      const text = String(reader.result || '')
      let items: any[] = []
      try{
        const parsed = JSON.parse(text)
        if(Array.isArray(parsed)) items = parsed
      }catch(err){
        items = parseCsv(text)
      }
      // don't apply immediately; show confirmation modal
      setPendingItems(items)
      setFilename(f.name)
    }
    reader.readAsText(f)
  }

  function onExportJson(){
    const data = exportTodos()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todos.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function onExportCsv(){
    try{
      const raw = exportTodos()
      const arr = JSON.parse(raw)
      if(!Array.isArray(arr)) return
      const header = ['id','title','completed','createdAt']
      const rows = arr.map((r:any)=> header.map(h=> {
        const v = r[h]
        if(typeof v === 'string') return '"'+String(v).replace(/"/g,'""')+'"'
        return String(v)
      }).join(','))
      const csv = [header.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'todos.csv'
      a.click()
      URL.revokeObjectURL(url)
    }catch(e){}
  }

  // cleanup countdown timer when modal closes or component unmounts
  React.useEffect(()=>{
    if(!showSettings){
      if(resetTimerRef.current) { window.clearInterval(resetTimerRef.current); resetTimerRef.current = null }
      setResetCountdown(null)
      setConfirmReset(false)
    }
    return ()=>{ if(resetTimerRef.current) { window.clearInterval(resetTimerRef.current); resetTimerRef.current = null } }
  },[showSettings])

  // close modals on Escape
  React.useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape'){
        if(pendingItems){ setPendingItems(null); setFilename(null); setConfirmReplace(false); }
        else if(showSettings){ setShowSettings(false); setConfirmReplace(false) }
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[showSettings, pendingItems])

  return (
    <header className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <h1>Todos</h1>
      <div className="controls header-controls">
        <button className="control-btn icon-only" aria-label="Settings" onClick={()=>setShowSettings(true)}>
          <SettingsIcon className="icon" aria-hidden="true" size={24} strokeWidth={2.2} />
        </button>
      </div>

      {showSettings && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card settings-modal">
            <button aria-label="close" className="modal-close" onClick={()=>setShowSettings(false)}>×</button>
            <h3 className="settings-title">Settings</h3>

            {/* Theme selection row */}
            <div className="settings-row" style={{marginTop:8}}>
              <div className="row-desc">
                <div className="settings-label">Theme</div>
                <div className="settings-note">Choose system, light, or dark</div>
              </div>
              <div className="row-actions">
                <button className={`control-btn ${themePref==='system' ? 'primary' : ''}`} onClick={()=>setThemePref('system')} aria-pressed={themePref==='system'}>System</button>
                <button className={`control-btn ${themePref==='light' ? 'primary' : ''}`} onClick={()=>setThemePref('light')} aria-pressed={themePref==='light'}>Light</button>
                <button className={`control-btn ${themePref==='dark' ? 'primary' : ''}`} onClick={()=>setThemePref('dark')} aria-pressed={themePref==='dark'}>Dark</button>
              </div>
            </div>

            {/* Import row */}
            <div className="settings-row" style={{marginTop:12}}>
              <div className="row-desc">
                <div className="settings-label">Import</div>
                <div className="settings-note">Select a JSON file to import todos</div>
              </div>
                <div className="row-actions">
                <input ref={el=>fileRef.current = el} aria-label="import-input" className="file-input-hidden" type="file" accept=".json,.csv,text/csv,application/json" onChange={onImport} />
                <button className="control-btn" onClick={triggerPicker}>Select file</button>
              </div>
            </div>

            {/* Export row */}
            <div className="settings-row" style={{marginTop:12}}>
              <div className="row-desc">
                <div className="settings-label">Export</div>
                <div className="settings-note">Download todos as JSON or CSV</div>
              </div>
              <div className="row-actions">
                <button className="control-btn" onClick={onExportJson}>Download JSON</button>
                <button className="control-btn" onClick={onExportCsv}>Download CSV</button>
              </div>
            </div>

            {/* Reset row */}
            <div className="settings-row" style={{marginTop:12}}>
              <div className="row-desc">
                <div className="settings-label">Clear all data</div>
                <div className="settings-note">This will remove all todos and settings</div>
              </div>
              <div className="row-actions">
                  {!confirmReset ? (
                    <button className="control-btn danger" onClick={()=>{
                      setConfirmReset(true)
                      setResetCountdown(5)
                      resetTimerRef.current = window.setInterval(()=>{
                        setResetCountdown(s=>{
                          if(s === null) return null
                          if(s <= 1){
                            if(resetTimerRef.current) { window.clearInterval(resetTimerRef.current); resetTimerRef.current = null }
                            return 0
                          }
                          return s - 1
                        })
                      },1000)
                    }}>Reset</button>
                  ) : (
                    // during countdown the button is disabled and shows time remaining; after 0 it becomes enabled
                    <button className={`control-btn danger ${resetCountdown && resetCountdown > 0 ? 'disabled' : ''}`} disabled={!!(resetCountdown && resetCountdown > 0)} onClick={()=>{ if(!(resetCountdown && resetCountdown > 0)){ resetAll(); setShowSettings(false); setConfirmReset(false) } }}>
                      {resetCountdown && resetCountdown > 0 ? `Confirm (${resetCountdown})` : 'Confirm Reset'}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingItems && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Import {pendingItems.length} items?</h3>
            <p style={{color:'var(--muted)'}}>You can fully replace the current todo list (irreversible) or attach the imported items to the end of your existing list.</p>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
              <button className="control-btn" onClick={()=>{ applyImport(pendingItems, 'attach'); setPendingItems(null); setFilename(null); setShowSettings(false) }}>Attach</button>
              {!confirmReplace ? (
                <button className="control-btn" onClick={()=>setConfirmReplace(true)}>Fully replace</button>
              ) : (
                <button className="control-btn" onClick={()=>{ applyImport(pendingItems, 'replace'); setPendingItems(null); setFilename(null); setShowSettings(false) }}>Confirm replace (cannot recover)</button>
              )}
              <button className="control-btn" onClick={()=>{ setPendingItems(null); setFilename(null); setConfirmReplace(false) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// cleanup timers on unmount
// (no exports needed)
