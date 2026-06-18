"use client"

import { Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { WorkerForm } from "@/components/workers/worker-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import { useTable, supabase } from "@/lib/use-table"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { Worker } from "@/lib/types"

export function WorkersList() {
  const { rows: workers, isLoading, mutate } = useTable<Worker>("workers", {
    orderBy: "work_date",
  })

  const total = workers.reduce((s, w) => s + Number(w.salary || 0), 0)
  const totalAdvance = workers.reduce((s, w) => s + Number(w.advance || 0), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("workers").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Entry deleted")
    mutate()
  }

  return (
    <div>
      <PageHeader
        title="Workers"
        description="Daily labour log with shift, field, crop, and wages."
        action={<WorkerForm onSaved={mutate} />}
      />

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total wages paid</p>
            <p className="font-heading text-2xl font-semibold">{formatCurrency(total)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm font-medium text-muted-foreground">Total advance</p>
            <p className="font-heading text-2xl font-semibold text-amber-600">{formatCurrency(totalAdvance)}</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : workers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No worker entries yet</p>
            <p className="text-sm text-muted-foreground">Log a worker to start tracking labour.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead className="text-right">Wage</TableHead>
                  <TableHead className="text-right">Advance</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(w.work_date)}</TableCell>
                    <TableCell>
                      <Badge variant={w.shift === "full" ? "secondary" : "outline"}>
                        {w.shift === "full" ? "Full day" : "Half day"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{w.field_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{w.crop || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(w.salary || 0)}</TableCell>
                    <TableCell className="text-right font-medium text-amber-600">{formatCurrency(w.advance || 0)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">{formatCurrency(Number(w.salary || 0) - Number(w.advance || 0))}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <WorkerForm worker={w} onSaved={mutate} />
                        <ConfirmDelete label="this entry" onConfirm={() => remove(w.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
