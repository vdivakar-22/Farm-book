"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function useTable<T>(
  table: string,
  opts?: { orderBy?: string; ascending?: boolean },
) {
  const orderBy = opts?.orderBy ?? "created_at"
  const ascending = opts?.ascending ?? false

  const { data, error, isLoading, mutate } = useSWR<T[]>(
    [table, orderBy, ascending],
    async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending })
      if (error) throw error
      return (data ?? []) as T[]
    },
  )

  return { rows: data ?? [], error, isLoading, mutate }
}

export { supabase }
