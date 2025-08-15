import React from 'react'
import { render, screen } from '@testing-library/react'
import TodoList from './TodoList'
import Completed from '../Completed/Completed'
import { TodoProvider, useTodoContext } from '../../context/TodoContext'

const seed = [{ id:'a', title:'A', completed:false, createdAt: new Date().toISOString() }, { id:'b', title:'B', completed:true, createdAt: new Date().toISOString() }]

function renderWithProvider(){
  localStorage.clear()
  localStorage.setItem('todos', JSON.stringify(seed))
  return render(
    <TodoProvider>
      <TodoList />
      <Completed />
    </TodoProvider>
  )
}

describe('TodoList', ()=>{
  test('shows empty state', ()=>{
    localStorage.clear()
    render(
      <TodoProvider>
        <TodoList />
      </TodoProvider>
    )
    expect(screen.getByRole('status')).toHaveTextContent(/no todos yet/i)
  })

  test('renders items and completed at bottom', ()=>{
    renderWithProvider()
  // active A should be in the main list
  expect(screen.getByText('A')).toBeInTheDocument()
  // completed B should be present under Completed
  expect(screen.getByText('B')).toBeInTheDocument()
  })
})
