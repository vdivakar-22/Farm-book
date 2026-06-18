"use client"

import Link from "next/link"
import { Sprout, CalendarDays, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { CropForm } from "@/components/crops/crop-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import { useTable, supabase } from "@/lib/use-table"
import { formatDate, formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import type { Crop, CropExpense } from "@/lib/types"

export function CropsList() {
  const { rows: crops, isLoading, mutate } = useTable<Crop>("crops")
  const { rows: expenses } = useTable<CropExpense>("crop_expenses")

  const spendFor = (cropId: string) =>
    expenses.filter((e) => e.crop_id === cropId).reduce((s, e) => s + Number(e.amount), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("crops").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Crop deleted")
    mutate()
  }

  return (
    <div>
      <PageHeader
        title="Crops"
        description="Track each crop, its growing window, and expense breakdown."
        action={<CropForm onSaved={mutate} />}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading crops…</p>
      ) : crops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Sprout className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No crops yet</p>
            <p className="text-sm text-muted-foreground">Add your first crop to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <Card key={crop.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 py-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold leading-tight">{crop.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CropForm crop={crop} onSaved={mutate} />
                    <ConfirmDelete label={crop.name} onConfirm={() => remove(crop.id)} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(crop.cultivated_date)} → {formatDate(crop.harvesting_date)}
                  </span>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/45 p-2.5 text-center text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Revenue</p>
                    <p className="mt-0.5 font-semibold text-foreground">{formatCurrency(crop.revenue ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Expenses</p>
                    <p className="mt-0.5 font-semibold text-foreground">{formatCurrency(spendFor(crop.id))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Profit</p>
                    <p className={`mt-0.5 font-bold ${(crop.revenue ?? 0) - spendFor(crop.id) >= 0 ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-450"}`}>
                      {((crop.revenue ?? 0) - spendFor(crop.id)) >= 0 ? "+" : ""}{formatCurrency((crop.revenue ?? 0) - spendFor(crop.id))}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  {((crop.revenue ?? 0) - spendFor(crop.id)) > 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30">
                      Profitable
                    </Badge>
                  ) : ((crop.revenue ?? 0) - spendFor(crop.id)) < 0 ? (
                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30">
                      In Loss
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Break Even
                    </Badge>
                  )}
                  <Link
                    href={`/crops/${crop.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Expenses
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
