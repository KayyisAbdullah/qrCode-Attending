// Shared mock data storage for serverless environments
// This persists in memory during the function's lifetime

export interface MockStudent {
  id: string
  username: string
  password: string
  name: string
  email: string
  class: string
  qrCode: string
  createdAt: Date
}

export interface MockAdmin {
  id: string
  username: string
  password: string
  name: string
  email: string
}

// Initialize with empty array - let users register their own accounts
export const mockStudentsDb: MockStudent[] = []

export const mockAdminsDb: MockAdmin[] = [
  {
    id: '1',
    username: 'admin',
    password: '$2b$10$yIUqnw6JOTbctCWSwDagxOvIrof8EGACQxb9GO6wMDMQ9tWieCYN',
    name: 'Administrator',
    email: 'admin@school.com'
  }
]

// Helper functions
export function findMockStudent(username: string): MockStudent | undefined {
  return mockStudentsDb.find(s => s.username === username)
}

export function findMockAdmin(username: string): MockAdmin | undefined {
  return mockAdminsDb.find(a => a.username === username)
}

export function addMockStudent(student: MockStudent): void {
  mockStudentsDb.push(student)
  console.log(`[MOCK_DB] Added student: ${student.username}`)
}

export function studentExists(username: string, email: string): boolean {
  return mockStudentsDb.some(s => s.username === username || s.email === email)
}

export function getAllMockStudents(): MockStudent[] {
  return [...mockStudentsDb]
}
