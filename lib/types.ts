export type Crop = {
  id: string
  name: string
  image_url: string | null
  revenue: number
  cultivated_date: string | null
  harvesting_date: string | null
  created_at: string
}

export type CropExpense = {
  id: string
  crop_id: string
  category: string
  amount: number
  note: string | null
  created_at: string
}

export type CattleType = {
  id: string
  type: string
  image_url: string | null
  created_at: string
}

export type Cattle = {
  id: string
  type_id: string
  name: string
  cost: number | null
  purpose: string | null
  gender: string | null
  lactation: string | null
  lactation_date: string | null
  lactation_count: number | null
  calf_gender: string | null
  image_url: string | null
  created_at: string
}

export type Worker = {
  id: string
  name: string
  work_date: string
  shift: string
  field_name: string | null
  crop: string | null
  salary: number
  advance: number
  created_at: string
}

export type Machinery = {
  id: string
  name: string
  work_date: string
  field_name: string | null
  purpose: string | null
  cost: number
  created_at: string
}

export type CattleExpense = {
  id: string
  cattle_id: string
  food_type: string
  milk_liters: number
  amount: number
  start_date: string | null
  end_date: string | null
  created_at: string
}

