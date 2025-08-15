import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../../App'

describe('integration: todo app', ()=>{
  beforeEach(()=> localStorage.clear())

  test('add, toggle, export, import, theme persist', async ()=>{
    render(<App />)
    // add
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Int Todo' } })
  fireEvent.click(screen.getByRole('button', { name: /add/i }))
    await waitFor(()=> expect(localStorage.getItem('todos')).toBeTruthy())
    const items = JSON.parse(localStorage.getItem('todos')!)
    expect(items.length).toBe(1)
    const id = items[0].id
    // toggle
    const toggle = screen.getByLabelText(new RegExp(`toggle-${id}`))
    fireEvent.click(toggle)
    const after = JSON.parse(localStorage.getItem('todos')!)
    expect(after.find((t:any)=> t.id===id).completed).toBe(true)
  // export -> import (controls are in Settings modal)
  const settings = screen.getByRole('button', { name: /settings/i })
  fireEvent.click(settings)
  // simulate export
  const exportBtn = screen.getByText(/export/i)
    const origCreate = URL.createObjectURL
    const origRevoke = (URL as any).revokeObjectURL
    ;(URL as any).createObjectURL = ()=> 'blob:1'
    ;(URL as any).revokeObjectURL = ()=>{}
    fireEvent.click(exportBtn)
    ;(URL as any).createObjectURL = origCreate
    ;(URL as any).revokeObjectURL = origRevoke
    // import via file input
    const input = screen.getByLabelText(/import-input/i) as HTMLInputElement
    const file = new File([localStorage.getItem('todos')!], 't.json', { type: 'application/json' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    await waitFor(()=> expect(JSON.parse(localStorage.getItem('todos')!).length).toBeGreaterThanOrEqual(1))
  // theme toggle (now inside Settings) - settings modal should already be open
  
  const themeBtn = screen.getByRole('button', { name: /system/i })
  fireEvent.click(themeBtn)
  expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()
  })
})
