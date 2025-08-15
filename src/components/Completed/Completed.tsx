import React from 'react'
import TodoItem from '../TodoItem/TodoItem'
import { useTodoContext } from '../../context/TodoContext'

export default function Completed(){
  const { todos } = useTodoContext()
  const items = todos.filter(t => t.completed)
  if(items.length === 0) return null
  const sorted = [...items].sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return (
    <section style={{marginTop:18}}>
      <h3>Completed</h3>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {sorted.map((t,idx)=> <TodoItem key={t.id} item={t} index={idx+1} />)}
      </div>
    </section>
  )
}
