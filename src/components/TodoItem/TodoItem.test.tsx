import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TodoItem from './TodoItem'
import { TodoProvider } from '../../context/TodoContext'
import { generateUUID } from '../../utils/uuid'

const testId = generateUUID()
const sample = { id: testId, title:'Test', completed:false, createdAt: new Date().toISOString(), dueDate: new Date(Date.now()-1000*60*60*24).toISOString() }

function renderWithProvider(item = sample){
  return render(
    <TodoProvider>
      <TodoItem item={item as any} />
    </TodoProvider>
  )
}

describe('TodoItem', ()=>{
  beforeEach(()=>{
    localStorage.clear()
    localStorage.setItem('todos', JSON.stringify([sample]))
  })

  test('renders title and due date and shows overdue color', ()=>{
    renderWithProvider()
    expect(screen.getByText(/Test/)).toBeInTheDocument()
    expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument()
  })

  test('toggle via button', ()=>{
    renderWithProvider()
    const btn = screen.getByLabelText(new RegExp(`toggle-${testId}`))
    fireEvent.click(btn)
    // after toggle the stored todo should be marked completed
    const raw = localStorage.getItem('todos')
    expect(raw).toBeTruthy()
    const items = JSON.parse(raw!)
    const found = items.find((t: any)=> t && t.id === testId)
    expect(found).toBeTruthy()
    expect(found.completed).toBe(true)
  })
})
