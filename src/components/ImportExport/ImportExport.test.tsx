import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ImportExport from './ImportExport'
import { TodoProvider } from '../../context/TodoContext'
import { generateUUID } from '../../utils/uuid'

function renderWithProvider(){
  localStorage.clear()
  return render(
    <TodoProvider>
      <ImportExport />
    </TodoProvider>
  )
}

describe('ImportExport', ()=>{
  test('export produces downloadable data', ()=>{
    localStorage.setItem('todos', JSON.stringify([{ id: generateUUID(), title:'x', completed:false, createdAt:new Date().toISOString() }]))
    renderWithProvider()
    const btn = screen.getByText(/export/i)
    // mock click by spying on createElement and click
    const clickSpy = vi.fn()
    const orig = document.createElement.bind(document)
    const createSpy = vi.fn((tag: string)=>{
      const el = orig(tag) as any
      if(tag === 'a') el.click = clickSpy
      return el
    })
    // stub URL.createObjectURL to avoid real blob handling
    const origUrl = (URL as any).createObjectURL
    let origRevoke: any = undefined
    if((URL as any).createObjectURL){
      vi.spyOn(URL as any, 'createObjectURL').mockImplementation(()=> 'blob:test')
      origRevoke = (URL as any).revokeObjectURL
      if(!(URL as any).revokeObjectURL) (URL as any).revokeObjectURL = ()=>{}
    }else{
      ;(global as any).URL = { ...(global as any).URL, createObjectURL: ()=> 'blob:test', revokeObjectURL: ()=>{} }
    }
    // replace createElement
    // @ts-ignore
    document.createElement = createSpy as any
    try{
      fireEvent.click(btn)
      expect(clickSpy).toHaveBeenCalled()
    }finally{
      // restore
  // @ts-ignore
  document.createElement = orig
  if(origUrl) URL.createObjectURL = origUrl
  if(origRevoke) URL.revokeObjectURL = origRevoke
  createSpy.mockRestore && createSpy.mockRestore()
    }
  })

  test('import reads file and populates todos', async ()=>{
    renderWithProvider()
    const input = screen.getByLabelText(/import-input/i) as HTMLInputElement
    const file = new File([JSON.stringify([{ id: generateUUID(), title:'imp', completed:false, createdAt:new Date().toISOString() }])], 'f.json', { type: 'application/json' })
    Object.defineProperty(input, 'files', { value: [file] })
  fireEvent.change(input)
  // modal should appear; confirm Attach
  await waitFor(()=> expect(screen.getByText(/import 1 items?/i)).toBeInTheDocument())
  const attach = screen.getByRole('button', { name: /attach/i })
  fireEvent.click(attach)
    await waitFor(()=>{
      const raw = localStorage.getItem('todos')
      if(!raw) throw new Error('not yet')
      const items = JSON.parse(raw)
      if(!items.find((t:any)=> t.title === 'imp')) throw new Error('not yet')
    })
    const raw = localStorage.getItem('todos')
    const items = JSON.parse(raw!)
    expect(items.find((t:any)=> t.title === 'imp')).toBeTruthy()
  })
})
