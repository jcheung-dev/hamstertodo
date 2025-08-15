import { isOverdue, formatDateIso } from './dateHelpers'

describe('dateHelpers', ()=>{
  test('isOverdue returns false for no date', ()=>{
    expect(isOverdue()).toBe(false)
  })

  test('isOverdue detects past dates', ()=>{
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    expect(isOverdue(past)).toBe(true)
  })

  test('isOverdue detects future dates', ()=>{
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    expect(isOverdue(future)).toBe(false)
  })

  test('formatDateIso returns empty for undefined', ()=>{
    expect(formatDateIso()).toBe('')
  })

  test('formatDateIso returns string for date', ()=>{
    const iso = new Date(2020,0,2).toISOString()
    const s = formatDateIso(iso)
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
  })
})
