import React, { useState, useRef, useEffect } from 'react'
import { Trash2 as TrashIcon, Edit3 as EditIcon } from 'lucide-react'
import EditTodoModal from '../EditTodoModal/EditTodoModal'
import { Todo } from '../../types/todo.types'
import { isOverdue, formatDateIso } from '../../utils/dateHelpers'
import { useTodoContext } from '../../context/TodoContext'

export default function TodoItem({ item, index }: { item: Todo, index?: number }){
  const { toggleComplete, updateTodo, removeTodo } = useTodoContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [dueDate, setDueDate] = useState(item.dueDate || '')
  const titleRef = useRef<HTMLInputElement | null>(null)
  const editContainerRef = useRef<HTMLDivElement | null>(null)
  const overdue = !item.completed && isOverdue(item.dueDate)
  const classes = ['todo-row']
  if(overdue) classes.push('overdue')
  if(item.completed) classes.push('completed')
  function onSave(){
    updateTodo(item.id, { title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined })
    setEditing(false)
  }

  function onCancel(){
    setTitle(item.title); setDescription(item.description || ''); setDueDate(item.dueDate || ''); setEditing(false)
  }

  // focus the title input when entering edit mode
  useEffect(()=>{
    if(editing){
      setTimeout(()=>{ titleRef.current?.focus(); titleRef.current?.select() }, 0)
    }
  },[editing])

  // keep local input state in sync with external item updates when not editing
  useEffect(()=>{
    if(!editing){
      setTitle(item.title)
      setDescription(item.description || '')
      setDueDate(item.dueDate || '')
    }
  },[item.title, item.description, item.dueDate, editing])

  // auto-save when focus leaves the edit container
  useEffect(()=>{
    if(!editing) return
    function onDocFocus(){
      // small timeout to allow related focus to settle
      setTimeout(()=>{
        if(editContainerRef.current && !editContainerRef.current.contains(document.activeElement)){
          onSave()
        }
      }, 0)
    }
    document.addEventListener('focusin', onDocFocus)
    return ()=> document.removeEventListener('focusin', onDocFocus)
  },[editing, title, dueDate, description])

  // also save when clicking outside (covers clicking whitespace)
  useEffect(()=>{
    if(!editing) return
    function onDocClick(e: MouseEvent){
      const target = e.target as Node
      if(editContainerRef.current && !editContainerRef.current.contains(target)){
        onSave()
      }
    }
    document.addEventListener('click', onDocClick)
    return ()=> document.removeEventListener('click', onDocClick)
  },[editing, title, dueDate, description])

  return (
    <div className={classes.join(' ')} data-testid={`todo-${item.id}`}>
      <div style={{width:36,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'var(--muted)'}}>{index ? `${index}.` : null}</div>
      <button aria-label={`toggle-${item.id}`} onClick={()=>toggleComplete(item.id)} className={`circle-btn ${item.completed ? 'filled' : ''}`} />
      <div style={{flex:1}}>
        {!editing ? (
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
            <div tabIndex={0} role="button" aria-label={`view-${item.id}`} onMouseDown={(e)=>{ e.preventDefault(); setEditing(true) }} onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); setEditing(true) } }} style={{display:'flex',flexDirection:'column',gap:6}}>
              <div className="title" style={{cursor:'text'}}>{item.title}</div>
            </div>
            <div style={{minWidth:120, textAlign:'right', fontSize:12, color: item.dueDate && isOverdue(item.dueDate) ? '#ef4444' : 'inherit'}}>
              {item.dueDate ? formatDateIso(item.dueDate) : null}
            </div>
          </div>
        ) : (
          <div ref={editContainerRef} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}} onKeyDown={(e)=>{ if(e.key === 'Escape'){ onCancel() } }}>
            <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
              <input ref={titleRef} className="input-modern" value={title} onChange={e=>setTitle(e.target.value)} aria-label={`title-input-${item.id}`} />
            </div>
            <div style={{minWidth:120, textAlign:'right'}}>
              <input className="input-modern" style={{opacity: dueDate ? 1 : 0.45, maxWidth:160}} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} aria-label={`date-input-${item.id}`} />
            </div>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:8,marginLeft:12}}>
        {/* edit button opens advanced edit modal (non-disruptive) */}
        <button className="icon-btn" onClick={()=>setModalOpen(true)} aria-label={`edit-${item.id}`} title="Advanced edit">
          <EditIcon size={14} />
        </button>
        {/* show trash icon as a button; visible both in view and edit modes */}
        <button className="icon-btn" onClick={()=>removeTodo(item.id)} aria-label={`delete-${item.id}`} title="Delete">
          <TrashIcon size={18} />
        </button>
      </div>

      <EditTodoModal item={item} open={modalOpen} onClose={()=>setModalOpen(false)} onSave={(updates)=>{
        updateTodo(item.id, updates)
      }} />
    </div>
  )
}
