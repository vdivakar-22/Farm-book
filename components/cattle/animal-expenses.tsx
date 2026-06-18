"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Milk, IndianRupee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfirmDelete } from "@/components/confirm-delete"
import { PageHeader } from "@/components/page-header"
import { useTable, supabase } from "@/lib/use-table"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { Cattle, CattleExpense } from "@/lib/types"

const foodTypes = [
  "Milk",
  "Cotton Seed",
  "Rice Flour",
  "Rice Husk",
  "Other",
]

function FeedLogForm({ animalId, onSaved }: { animalId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ food_type: "Milk", milk_liters: "", amount: "", start_date: "", end_date: "" })

  async function save() {
    const amount = Number(form.amount)
    const milk = form.food_type === "Milk" ? Number(form.milk_liters) : 0
    if (!form.food_type || isNaN(amount) || amount < 0 || (form.food_type === "Milk" && (isNaN(milk) || milk < 0))) {
      toast.error(form.food_type === "Milk" ? "Enter a valid food type, amount and milk yield" : "Enter a valid cost amount")
      return
    }
    setLoading(true)
    const { error } = await supabase.from("cattle_expenses").insert({
      cattle_id: animalId,
      food_type: form.food_type,
      milk_liters: milk,
      amount,
      start_date: form.food_type === "Milk" ? (form.start_date || null) : null,
      end_date: form.food_type === "Milk" ? (form.end_date || null) : null,
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success("Food log added")
    setForm({ food_type: "Milk", milk_liters: "", amount: "", start_date: "", end_date: "" })
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" />
        Add food log
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add food log / expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="food_type">Food Type</Label>
            <select
              id="food_type"
              value={form.food_type}
              onChange={(e) => setForm((f) => ({ ...f, food_type: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {foodTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {form.food_type === "Milk" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="milk_liters">Milk Yield (Liters)</Label>
                  <Input
                    id="milk_liters"
                    type="number"
                    min="0"
                    step="any"
                    value={form.milk_liters}
                    onChange={(e) => setForm((f) => ({ ...f, milk_liters: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Cost Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="amount">Cost of Food</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AnimalExpenses({ animalId }: { animalId: string }) {
  const { rows: cattle } = useTable<Cattle>("cattle")
  const { rows: allExpenses, mutate } = useTable<CattleExpense>("cattle_expenses")

  const animal = cattle.find((c) => c.id === animalId)
  const expenses = allExpenses.filter((e) => e.cattle_id === animalId)

  const totalExpenses = expenses.filter((e) => e.food_type !== "Milk").reduce((s, e) => s + Number(e.amount), 0)
  const totalRevenue = expenses.filter((e) => e.food_type === "Milk").reduce((s, e) => s + Number(e.amount), 0)
  const netProfit = totalRevenue - totalExpenses
  const totalMilk = expenses.filter((e) => e.food_type === "Milk").reduce((s, e) => s + Number(e.milk_liters), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("cattle_expenses").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Log removed")
    mutate()
  }

  return (
    <div>
      <Link
        href={animal ? `/cattle/${animal.type_id}` : "/cattle"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to animals
      </Link>

      <PageHeader
        title={animal ? `${animal.name} logs` : "Animal"}
        description={
          animal
            ? `${animal.gender || ""} · ${animal.purpose || ""} · Lactation: ${animal.lactation || "N/A"}`
            : "Animal feed and milk logs"
        }
        action={<FeedLogForm animalId={animalId} onSaved={mutate} />}
      />

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Food & Milk logs</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No food or milk logs recorded for this animal yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food Type</TableHead>
                  <TableHead>Milk (Liters)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.food_type}</TableCell>
                    <TableCell>{e.food_type === "Milk" ? `${e.milk_liters} L` : "—"}</TableCell>
                    <TableCell>{formatCurrency(e.amount)}</TableCell>
                    <TableCell>{e.food_type === "Milk" ? formatDate(e.start_date) : "—"}</TableCell>
                    <TableCell>{e.food_type === "Milk" ? formatDate(e.end_date) : "—"}</TableCell>
                    <TableCell>
                      <ConfirmDelete label="this log" onConfirm={() => remove(e.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
