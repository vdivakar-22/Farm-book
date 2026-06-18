import { createBrowserClient } from "@supabase/ssr"

const SEED_DATA: Record<string, any[]> = {
  crops: [
    {
      id: "crop-1",
      name: "Paddy",
      image_url: null,
      revenue: 25000,
      cultivated_date: "2026-05-01",
      harvesting_date: "2026-09-15",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "crop-2",
      name: "Wheat",
      image_url: null,
      revenue: 30000,
      cultivated_date: "2025-11-10",
      harvesting_date: "2026-04-05",
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "crop-3",
      name: "Tomato",
      image_url: null,
      revenue: 15000,
      cultivated_date: "2026-04-12",
      harvesting_date: "2026-07-20",
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  crop_expenses: [
    {
      id: "exp-1",
      crop_id: "crop-1",
      category: "Ploughing",
      amount: 8000,
      note: "2 acres, tractor rent",
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "exp-2",
      crop_id: "crop-1",
      category: "Seeds",
      amount: 2500,
      note: "Paddy nursery seeds",
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "exp-3",
      crop_id: "crop-1",
      category: "Sowing",
      amount: 3000,
      note: "Manual labor",
      created_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "exp-4",
      crop_id: "crop-2",
      category: "Fertilizers",
      amount: 5000,
      note: "Urea and NPK",
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "exp-5",
      crop_id: "crop-2",
      category: "Harvesting",
      amount: 7500,
      note: "Combine harvester rent",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "exp-6",
      crop_id: "crop-3",
      category: "Irrigation",
      amount: 1500,
      note: "Diesel for water pump",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "exp-7",
      crop_id: "crop-3",
      category: "Pesticides",
      amount: 2000,
      note: "Organic sprays",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  cattle_types: [
    {
      id: "type-1",
      type: "Cow",
      image_url: null,
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "type-2",
      type: "Goat",
      image_url: null,
      created_at: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  cattle: [
    {
      id: "cat-1",
      type_id: "type-1",
      name: "Lakshmi",
      cost: 45000,
      purpose: "Milk",
      gender: "Female",
      lactation: "Lactating",
      lactation_date: "2026-04-10",
      created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "cat-2",
      type_id: "type-1",
      name: "Ganga",
      cost: 42000,
      purpose: "Milk",
      gender: "Female",
      lactation: "Pregnant",
      lactation_date: "2026-05-15",
      created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "cat-3",
      type_id: "type-2",
      name: "Blackie",
      cost: 8500,
      purpose: "Meat",
      gender: "Male",
      lactation: null,
      lactation_date: null,
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  workers: [
    {
      id: "work-1",
      name: "Ramesh Kumar",
      work_date: "2026-06-15",
      shift: "full",
      field_name: "North Field",
      crop: "Paddy",
      salary: 500,
      advance: 0,
      created_at: new Date().toISOString()
    },
    {
      id: "work-2",
      name: "Suresh Singh",
      work_date: "2026-06-15",
      shift: "full",
      field_name: "South Field",
      crop: "Tomato",
      salary: 500,
      advance: 0,
      created_at: new Date().toISOString()
    },
    {
      id: "work-3",
      name: "Sunita Devi",
      work_date: "2026-06-14",
      shift: "half",
      field_name: "Greenhouse",
      crop: "Tomato",
      salary: 300,
      advance: 0,
      created_at: new Date().toISOString()
    }
  ],
  machinery: [
    {
      id: "mac-1",
      name: "John Deere Tractor",
      work_date: "2026-06-12",
      field_name: "North Field",
      purpose: "Ploughing",
      cost: 3500,
      created_at: new Date().toISOString()
    },
    {
      id: "mac-2",
      name: "Water Pump",
      work_date: "2026-06-14",
      field_name: "South Field",
      purpose: "Irrigation",
      cost: 1200,
      created_at: new Date().toISOString()
    }
  ],
  cattle_expenses: [
    {
      id: "e0a890b2-29ac-40d9-81a1-5527f3299ad1",
      cattle_id: "c0a890b2-29ac-40d9-81a1-5527f3299ac1",
      food_type: "Cotton Seed",
      milk_liters: 10,
      amount: 1500,
      start_date: "2026-06-01",
      end_date: "2026-06-07",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "e0a890b2-29ac-40d9-81a1-5527f3299ad2",
      cattle_id: "c0a890b2-29ac-40d9-81a1-5527f3299ac1",
      food_type: "Rice Husk",
      milk_liters: 12,
      amount: 1200,
      start_date: "2026-06-08",
      end_date: "2026-06-14",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

class MockQueryBuilder {
  tableName: string
  action: "select" | "insert" | "update" | "delete" = "select"
  payload: any = null
  filters: Array<{ field: string; value: any }> = []
  orderByColumn: string | null = null
  orderByAscending: boolean = true

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(fields?: string) {
    this.action = "select"
    return this
  }

  order(column: string, { ascending = true } = {}) {
    this.orderByColumn = column
    this.orderByAscending = ascending
    return this
  }

  insert(payload: any) {
    this.action = "insert"
    this.payload = payload
    return this
  }

  update(payload: any) {
    this.action = "update"
    this.payload = payload
    return this
  }

  delete() {
    this.action = "delete"
    return this
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value })
    return this
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const data = await this.execute()
      const result = { data, error: null }
      if (onfulfilled) {
        return onfulfilled(result)
      }
      return result
    } catch (error: any) {
      const result = { data: null, error }
      if (onrejected) {
        return onrejected(result)
      }
      return result
    }
  }

  async execute() {
    if (typeof window === "undefined") {
      return []
    }

    const key = `mock_db_${this.tableName}`
    let items: any[] = []

    try {
      const existing = localStorage.getItem(key)
      if (existing) {
        items = JSON.parse(existing)
      } else {
        items = SEED_DATA[this.tableName] || []
        localStorage.setItem(key, JSON.stringify(items))
      }
    } catch (e) {
      items = SEED_DATA[this.tableName] || []
    }

    if (this.action === "select") {
      let result = [...items]
      for (const filter of this.filters) {
        result = result.filter((item) => item[filter.field] === filter.value)
      }

      if (this.orderByColumn) {
        const col = this.orderByColumn
        const asc = this.orderByAscending
        result.sort((a, b) => {
          const valA = a[col]
          const valB = b[col]
          if (valA === valB) return 0
          if (valA == null) return 1
          if (valB == null) return -1
          const compare = valA < valB ? -1 : 1
          return asc ? compare : -compare
        })
      }
      return result
    }

    if (this.action === "insert") {
      const newItems = Array.isArray(this.payload) ? this.payload : [this.payload]
      const inserted = newItems.map((item) => {
        const newItem = {
          id: Math.random().toString(36).substring(2, 11),
          created_at: new Date().toISOString(),
          ...item,
        }
        items.push(newItem)
        return newItem
      })
      localStorage.setItem(key, JSON.stringify(items))
      return Array.isArray(this.payload) ? inserted : inserted[0]
    }

    if (this.action === "update") {
      let updatedCount = 0
      items = items.map((item) => {
        const matches = this.filters.every((f) => item[f.field] === f.value)
        if (matches) {
          updatedCount++
          return { ...item, ...this.payload }
        }
        return item
      })
      localStorage.setItem(key, JSON.stringify(items))
      return { count: updatedCount }
    }

    if (this.action === "delete") {
      let deletedCount = 0
      items = items.filter((item) => {
        const matches = this.filters.every((f) => item[f.field] === f.value)
        if (matches) {
          deletedCount++
          return false
        }
        return true
      })
      localStorage.setItem(key, JSON.stringify(items))
      return { count: deletedCount }
    }

    return []
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && key) {
    return createBrowserClient(url, key)
  }

  // Fallback mock client
  return {
    from(tableName: string) {
      return new MockQueryBuilder(tableName)
    }
  } as any
}
