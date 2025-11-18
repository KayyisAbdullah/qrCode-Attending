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

// Initialize with default test data
export const mockStudentsDb: MockStudent[] = [
  {
    id: '1',
    username: 'ahmad123',
    password: '$2b$10$To6gsNtXX0qwKGtT85cIs.J9vSYJgXsjb5Asrbqv8ZSVGf7fUiI1',
    name: 'Ahmad',
    email: 'ahmad@school.com',
    class: 'XI-A',
    qrCode: 'QR-ahmad-001',
    createdAt: new Date()
  },
  {
    id: '2',
    username: 'siti123',
    password: '$2b$10$To6gsNtXX0qwKGtT85cIs.J9vSYJgXsjb5Asrbqv8ZSVGf7fUiI1',
    name: 'Siti',
    email: 'siti@school.com',
    class: 'XI-B',
    qrCode: 'QR-siti-001',
    createdAt: new Date()
  },
  {
    id: '3',
    username: 'budi123',
    password: '$2b$10$To6gsNtXX0qwKGtT85cIs.J9vSYJgXsjb5Asrbqv8ZSVGf7fUiI1',
    name: 'Budi',
    email: 'budi@school.com',
    class: 'XI-C',
    qrCode: 'QR-budi-001',
    createdAt: new Date()
  }
]

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
