import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AddTodoForm from './AddTodoForm'
import { TodoProvider } from '../../context/TodoContext'

function renderWithProvider(){
  return render(
    <TodoProvider>
      <AddTodoForm />
    </TodoProvider>
  )
}

describe('AddTodoForm', ()=>{
  beforeEach(()=> localStorage.clear())

  test('renders form', ()=>{
    renderWithProvider()
    expect(screen.getByLabelText(/Title\*/i)).toBeInTheDocument()
  })

  test('shows validation error for empty title', ()=>{
    renderWithProvider()
  fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i)
  })

  test('adds todo on submit', ()=>{
    renderWithProvider()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Buy' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'milk' } })
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2025-12-31' } })
  fireEvent.click(screen.getByRole('button', { name: /add/i }))
    // ensure localStorage wrote todos
    const raw = localStorage.getItem('todos')
    expect(raw).toBeTruthy()
    const items = JSON.parse(raw!)
    expect(items.find((t: any)=> t.title === 'Buy')).toBeTruthy()
  })
})
