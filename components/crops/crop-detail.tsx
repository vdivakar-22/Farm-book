"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, IndianRupee } from "lucide-react"
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
import type { Crop, CropExpense } from "@/lib/types"

const categories = [
  "Ploughing",
  "Seeds",
  "Sowing",
  "Workers",
  "Fertilizers",
  "Pesticides",
  "Irrigation",
  "Harvesting",
  "Transport",
  "Other",
]

function ExpenseForm({ cropId, onSaved }: { cropId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ category: "Ploughing", amount: "", note: "" })

  async function save() {
    const amount = Number(form.amount)
    if (!form.category || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid category and amount")
      return
    }
    setLoading(true)
    const { error } = await supabase.from("crop_expenses").insert({
      crop_id: cropId,
      category: form.category,
      amount,
      note: form.note || null,
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success("Expense added")
    setForm({ category: "Ploughing", amount: "", note: "" })
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" />
        Add expense
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category">Work category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="e.g. 2 acres, tractor rent"
            />
          </div>
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

export function CropDetail({ cropId }: { cropId: string }) {
  const { rows: crops } = useTable<Crop>("crops")
  const { rows: allExpenses, mutate } = useTable<CropExpense>("crop_expenses")

  const crop = crops.find((c) => c.id === cropId)
  const expenses = allExpenses.filter((e) => e.crop_id === cropId)
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])

  async function remove(id: string) {
    const { error } = await supabase.from("crop_expenses").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Expense removed")
    mutate()
  }

  return (
    <div>
      <Link
        href="/crops"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to crops
      </Link>

      <PageHeader
        title={crop ? crop.name : "Crop"}
        description={
          crop
            ? `${formatDate(crop.cultivated_date)} → ${formatDate(crop.harvesting_date)}`
            : "Crop expenses"
        }
        action={<ExpenseForm cropId={cropId} onSaved={mutate} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Revenue */}
        <Card className="border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardContent className="py-5">
            <p className="text-sm font-medium text-muted-foreground">Total revenue</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(crop ? crop.revenue : 0)}
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10">
          <CardContent className="py-5">
            <p className="text-sm font-medium text-muted-foreground">Total expenses</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-rose-600 dark:text-rose-450">
              {formatCurrency(total)}
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        {(() => {
          const profit = (crop ? crop.revenue : 0) - total
          return (
            <Card className={profit >= 0 ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"}>
              <CardContent className="py-5">
                <p className="text-sm font-medium text-muted-foreground">Net profit</p>
                <p className={`mt-1 font-heading text-3xl font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                  {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                </p>
              </CardContent>
            </Card>
          )
        })()}
      </div>

      {byCategory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Breakdown by work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byCategory.map(([cat, val]) => {
              const pct = total > 0 ? Math.round((val / total) * 100) : 0
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground">{formatCurrency(val)} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No expenses recorded for this crop yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.category}</TableCell>
                    <TableCell className="text-muted-foreground">{e.note || "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                    <TableCell>
                      <ConfirmDelete label="this expense" onConfirm={() => remove(e.id)} />
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
