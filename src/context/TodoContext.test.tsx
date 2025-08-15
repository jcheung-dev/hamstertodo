import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { TodoProvider, useTodoContext } from './TodoContext'
import { Todo } from '../types/todo.types'
import { generateUUID } from '../utils/uuid'

function wrapper({ children }: any){
  return <TodoProvider>{children}</TodoProvider>
}

describe('TodoContext', ()=>{
  beforeEach(()=> localStorage.clear())

  test('adds and toggles and removes todo', ()=>{
    const { result } = renderHook(()=> useTodoContext(), { wrapper })
    act(()=> result.current.addTodo({ title: 'a' }))
    expect(result.current.todos.length).toBe(1)
    const id = result.current.todos[0].id
    act(()=> result.current.toggleComplete(id))
    expect(result.current.todos[0].completed).toBe(true)
    act(()=> result.current.removeTodo(id))
    expect(result.current.todos.length).toBe(0)
  })

  test('import and export', ()=>{
    const { result } = renderHook(()=> useTodoContext(), { wrapper })
    const items: Todo[] = [{ id: generateUUID(), title: 'x', completed:false, createdAt: new Date().toISOString() } as Todo]
    act(()=> result.current.importTodos(items))
    expect(result.current.todos.length).toBe(1)
    const out = result.current.exportTodos()
    expect(typeof out).toBe('string')
    const parsed = JSON.parse(out)
    expect(parsed.length).toBe(1)
  })
})
