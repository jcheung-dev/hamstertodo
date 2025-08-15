import React, { useState } from 'react'
import { useTodoContext } from '../../context/TodoContext'

export default function AddTodoForm(){
  const { addTodo } = useTodoContext()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(true)

  function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError('')
    if(!title.trim()){ setError('Title is required'); return }
    addTodo({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined })
    setTitle(''); setDescription(''); setDueDate('')
  }

  return (
    <div className={`card add-card ${open ? 'open' : 'collapsed'}`}>
      <div
        className="collapsible-header"
        role="button"
        tabIndex={0}
        aria-label="toggle-panel"
        onClick={(e)=>{ if((e.target as HTMLElement).closest('button')) return; setOpen(s=>!s) }}
        onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(s=>!s) } }}
      >
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <strong style={{fontSize:16}}>Add new task</strong>
          <span style={{color:'var(--muted)', fontSize:13}}>Quickly add a todo</span>
        </div>
        <button aria-expanded={open} aria-controls="add-todo-form" className="control-btn" onClick={()=>setOpen(s=>!s)}>
          <svg className={`chev ${open ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {open && (
      <form id="add-todo-form" onSubmit={onSubmit} aria-label="add-todo-form">
        <div className="field-card">
          <div>
            <label htmlFor="title">Title*</label>
            <input className="input-modern" id="title" value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea className="input-modern textarea-modern" id="description" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div>
            <label htmlFor="dueDate">Due date</label>
            <input className="input-modern" id="dueDate" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          </div>
        </div>
        {error && <div role="alert">{error}</div>}
        <div className="controls">
          <button type="submit" className="primary">Add</button>
        </div>
      </form>
      )}
    </div>
  )
}
