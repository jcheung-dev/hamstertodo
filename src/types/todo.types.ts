export type Todo = {
  id: string
  title: string
  description?: string
  dueDate?: string // ISO date
  completed: boolean
  createdAt: string
}
