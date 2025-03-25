interface DB {
  sqlite: {
    query: (sql: string, params?: Record<string, any>) => any[]
    execute: (sql: string, params?: Record<string, any>) => void
    transaction: (action: () => void) => void
  }
}

export { DB }
