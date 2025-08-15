import React from 'react'
import { useTodoContext } from '../../context/TodoContext'
import TodoItem from '../TodoItem/TodoItem'

export default function TodoList(){
  const { todos } = useTodoContext()

  // separate active and completed
  const active = todos.filter(t => !t.completed).sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const completed = todos.filter(t => t.completed)

  return (
    <section>
      {active.length === 0 ? <div role="status">No todos yet</div> : (
        <div>
          <h3>Open Items</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {active.map((t,idx)=> <TodoItem key={t.id} item={t} index={idx+1} />)}
          </div>
        </div>
      )}
    </section>
  )
}
