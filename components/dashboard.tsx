"use client"

import Link from "next/link"
import { Sprout, Beef, Users, Tractor, IndianRupee, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { useTable } from "@/lib/use-table"
import { formatCurrency } from "@/lib/format"
import type { Crop, CropExpense, Cattle, Worker, Machinery } from "@/lib/types"

import { ResetDatabase } from "@/components/reset-database"

export function Dashboard() {
  const { rows: crops } = useTable<Crop>("crops")
  const { rows: expenses } = useTable<CropExpense>("crop_expenses")
  const { rows: cattle } = useTable<Cattle>("cattle")
  const { rows: workers } = useTable<Worker>("workers")
  const { rows: machinery } = useTable<Machinery>("machinery")

  const cropSpend = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const workerSpend = workers.reduce((s, w) => s + Number(w.salary), 0)
  const machinerySpend = machinery.reduce((s, m) => s + Number(m.cost), 0)
  const cattleSpend = cattle.reduce((s, c) => s + Number(c.cost ?? 0), 0)
  const totalSpend = cropSpend + workerSpend + machinerySpend + cattleSpend

  const stats = [
    { label: "Crops", value: crops.length, href: "/crops", icon: Sprout, hint: formatCurrency(cropSpend) + " spent" },
    { label: "Cattle", value: cattle.length, href: "/cattle", icon: Beef, hint: formatCurrency(cattleSpend) + " invested" },
    { label: "Workers logged", value: workers.length, href: "/workers", icon: Users, hint: formatCurrency(workerSpend) + " in wages" },
    { label: "Machinery logs", value: machinery.length, href: "/machinery", icon: Tractor, hint: formatCurrency(machinerySpend) + " in costs" },
  ]

  const breakdown = [
    { label: "Crop expenses", value: cropSpend },
    { label: "Worker wages", value: workerSpend },
    { label: "Machinery", value: machinerySpend },
    { label: "Cattle", value: cattleSpend },
  ]

  return (
    <div>
      <PageHeader
        title="Farm Dashboard"
        description="A quick overview of everything happening across your farm."
        action={<ResetDatabase />}
      />

      {/* Total spend */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between gap-4 py-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total farm spend</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IndianRupee className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon, hint }) => (
          <Link key={label} href={href}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Spend breakdown */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Spend breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakdown.map(({ label, value }) => {
            const pct = totalSpend > 0 ? Math.round((value / totalSpend) * 100) : 0
            return (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(value)} · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {totalSpend === 0 && (
            <p className="text-sm text-muted-foreground">
              No expenses recorded yet. Start by adding crops, workers, or machinery.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
