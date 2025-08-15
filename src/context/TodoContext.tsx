import React, { createContext, useContext, ReactNode } from 'react'
import { Todo } from '../types/todo.types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateUUID } from '../utils/uuid'

type TodoContextType = {
  todos: Todo[]
  addTodo: (t: Omit<Todo, 'id'|'createdAt'|'completed'>) => void
  updateTodo: (id: string, patch: Partial<Todo>) => void
  removeTodo: (id: string) => void
  toggleComplete: (id: string) => void
  resetAll: () => void
  importTodos: (items: Todo[]) => void
  applyImport: (items: Partial<Todo>[], mode: 'replace' | 'attach') => void
  exportTodos: () => string
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export function useTodoContext(){
  const ctx = useContext(TodoContext)
  if(!ctx) throw new Error('useTodoContext must be used within TodoProvider')
  return ctx
}

export function TodoProvider({ children }: { children: ReactNode }){
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])

  function addTodo(t: Omit<Todo, 'id'|'createdAt'|'completed'>){
    const item: Todo = {
      id: generateUUID(),
      title: t.title,
      description: t.description,
      dueDate: t.dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    }
    setTodos(prev => [...prev, item])
  }

  function updateTodo(id: string, patch: Partial<Todo>){
    setTodos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  function removeTodo(id: string){
    setTodos(prev => prev.filter(p => p.id !== id))
  }

  function toggleComplete(id: string){
    setTodos(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p))
  }

  function importTodos(items: Todo[]){
    setTodos(items)
  }

  function applyImport(items: Partial<Todo>[], mode: 'replace' | 'attach'){
    // normalize imported items and assign fresh UUIDs
    const normalized: Todo[] = items.map(it => {
      return {
        id: generateUUID(),
        title: (it as any).title || 'Untitled',
        description: (it as any).description,
        dueDate: (it as any).dueDate,
        completed: !!(it as any).completed,
        createdAt: (it as any).createdAt || new Date().toISOString()
      }
    })
    if(mode === 'replace'){
      setTodos(normalized)
    }else{
      setTodos(prev => [...prev, ...normalized])
    }
  }

  function resetAll(){
    // clear todos; also clear theme preference
    setTodos([])
    try{ localStorage.removeItem('theme') }catch(e){}
  }

  function exportTodos(){
    try{ return JSON.stringify(todos) }catch(e){ return '[]' }
  }

  const value: TodoContextType = { todos, addTodo, updateTodo, removeTodo, toggleComplete, resetAll, importTodos, applyImport, exportTodos }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}
