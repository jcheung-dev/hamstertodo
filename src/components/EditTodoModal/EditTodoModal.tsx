import React, { useEffect, useState } from 'react'
import { Todo } from '../../types/todo.types'

export default function EditTodoModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: Todo,
  open: boolean,
  onClose: () => void,
  onSave: (updates: { title?: string; description?: string; dueDate?: string }) => void,
}){
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [dueDate, setDueDate] = useState(item.dueDate || '')

  useEffect(()=>{
    if(open){
      setTitle(item.title)
      setDescription(item.description || '')
      setDueDate(item.dueDate || '')
    }
  },[open, item])

  // toggle a class on body so global styles (like hover/translate) can be disabled while modal is open
  useEffect(()=>{
    if(open){
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return ()=>{ document.body.classList.remove('modal-open') }
  },[open])

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape'){
        handleClose()
      }
    }
    if(open) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[open, title, description, dueDate])

  function isDirty(){
    return title !== item.title || (description || '') !== (item.description || '') || (dueDate || '') !== (item.dueDate || '')
  }

  function handleClose(){
    if(isDirty()){
      // simple confirm: OK => save, Cancel => discard
      const save = window.confirm('You have unsaved changes. Click OK to save changes or Cancel to discard.')
      if(save){
        onSave({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined })
        onClose()
      } else {
        onClose()
      }
    } else {
      onClose()
    }
  }

  function handleSave(){
    onSave({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined })
    onClose()
  }

  if(!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <h3 style={{margin:0}}>Edit task</h3>
          <button className="modal-close" aria-label="close-edit" onClick={handleClose}>✕</button>
        </div>
        <div style={{display:'grid',gap:12}}>
          <label>Title</label>
          <input className="input-modern" value={title} onChange={e=>setTitle(e.target.value)} aria-label={`modal-title-${item.id}`} />

          <label>Description</label>
          <textarea className="textarea-modern" value={description} onChange={e=>setDescription(e.target.value)} aria-label={`modal-desc-${item.id}`}></textarea>

          <label>Due date</label>
          <input className="input-modern" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} aria-label={`modal-date-${item.id}`} />

          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:6}}>
            <button className="control-btn" onClick={handleClose}>Cancel</button>
            <button className="control-btn primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
