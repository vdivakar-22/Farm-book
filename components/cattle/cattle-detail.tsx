"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Beef, Milk, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { AnimalForm } from "@/components/cattle/animal-form"
import { OverallFeedLogForm } from "@/components/cattle/overall-food-log-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTable, supabase } from "@/lib/use-table"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { CattleType, Cattle, CattleExpense } from "@/lib/types"

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  )
}

export function CattleDetail({ typeId }: { typeId: string }) {
  const [showLogs, setShowLogs] = useState(false)
  const { rows: types } = useTable<CattleType>("cattle_types")
  const { rows: allAnimals, mutate } = useTable<Cattle>("cattle")
  const { rows: allExpenses, mutate: mutateExpenses } = useTable<CattleExpense>("cattle_expenses")

  const type = types.find((t) => t.id === typeId)
  const animals = allAnimals.filter((a) => a.type_id === typeId)
  const animalIds = animals.map((a) => a.id)
  
  const expenses = allExpenses.filter((e) => animalIds.includes(e.cattle_id))

  const totalExpenses = expenses.filter((e) => e.food_type !== "Milk").reduce((s, e) => s + Number(e.amount), 0)
  const totalRevenue = expenses.filter((e) => e.food_type === "Milk").reduce((s, e) => s + Number(e.amount), 0)
  const netProfit = totalRevenue - totalExpenses
  const totalMilk = expenses.filter((e) => e.food_type === "Milk").reduce((s, e) => s + Number(e.milk_liters), 0)
  const total = animals.reduce((s, a) => s + Number(a.cost ?? 0), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("cattle").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Animal removed")
    mutate()
  }

  async function removeExpense(id: string) {
    const { error } = await supabase.from("cattle_expenses").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Log removed")
    mutateExpenses()
  }

  return (
    <div>
      <Link
        href="/cattle"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cattle
      </Link>

      <PageHeader
        title={type ? type.type : "Cattle"}
        description={`${animals.length} animals · ${formatCurrency(total)} total investment`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowLogs(!showLogs)}>
              {showLogs ? "Hide Logs" : "View Logs"}
            </Button>
            <OverallFeedLogForm typeId={typeId} onSaved={() => { mutate(); mutateExpenses(); }} />
            <AnimalForm typeId={typeId} onSaved={mutate} />
          </div>
        }
      />

      {showLogs && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Feed Cost */}
        <Card className="border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Feed Cost</p>
              <p className="mt-1 font-heading text-3xl font-semibold text-rose-600 dark:text-rose-455">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Milk Earnings */}
        <Card className="border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Milk Earnings</p>
              <p className="mt-1 font-heading text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className={netProfit >= 0 ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"}>
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className={`mt-1 font-heading text-3xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${netProfit >= 0 ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Milk Yield */}
        <Card className="border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Milk Yield</p>
              <p className="mt-1 font-heading text-3xl font-semibold text-blue-600 dark:text-blue-400">
                {totalMilk.toLocaleString()} L
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Milk className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Overall Food & Milk logs</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No food or milk logs recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Food Type</TableHead>
                  <TableHead>Milk (Liters)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => {
                  const a = animals.find(an => an.id === e.cattle_id)
                  return (
                    <TableRow key={e.id}>
                      <TableCell>{a ? a.name : "Unknown"}</TableCell>
                      <TableCell className="font-medium">{e.food_type}</TableCell>
                      <TableCell>{e.food_type === "Milk" ? `${e.milk_liters} L` : "—"}</TableCell>
                      <TableCell>{formatCurrency(e.amount)}</TableCell>
                      <TableCell>{e.food_type === "Milk" ? formatDate(e.start_date) : "—"}</TableCell>
                      <TableCell>{e.food_type === "Milk" ? formatDate(e.end_date) : "—"}</TableCell>
                      <TableCell>
                        <ConfirmDelete label="this log" onConfirm={() => removeExpense(e.id)} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {animals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Beef className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No animals yet</p>
            <p className="text-sm text-muted-foreground">Add an animal to this type.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <Card key={a.id}>
              <CardContent className="space-y-3 py-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading font-semibold leading-tight">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(a.cost)}</p>
                  </div>
                  <div className="flex items-center">
                    <AnimalForm typeId={typeId} animal={a} onSaved={mutate} />
                    <ConfirmDelete label={a.name} onConfirm={() => remove(a.id)} />
                  </div>
                </div>
                {a.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
                    <img src={a.image_url} alt={a.name} className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {a.gender && <Badge variant="outline">{a.gender}</Badge>}
                  {a.purpose && <Badge variant="secondary">{a.purpose}</Badge>}
                </div>
                <div className="space-y-1.5 border-t border-border pt-3">
                  <Detail label="Lactation" value={a.lactation} />
                  {a.lactation_date && (
                    <Detail label="Lactation Date" value={formatDate(a.lactation_date)} />
                  )}
                  {a.lactation_count != null && (
                    <Detail label="Lactation Count" value={String(a.lactation_count)} />
                  )}
                  {a.calf_gender && (
                    <Detail label="Calf Gender" value={a.calf_gender} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
