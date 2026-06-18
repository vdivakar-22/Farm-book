"use client"

import { Tractor } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { MachineryForm } from "@/components/machinery/machinery-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import { useTable, supabase } from "@/lib/use-table"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { Machinery } from "@/lib/types"

export function MachineryList() {
  const { rows: machinery, isLoading, mutate } = useTable<Machinery>("machinery", {
    orderBy: "work_date",
  })

  const total = machinery.reduce((s, m) => s + Number(m.cost), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("machinery").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Entry deleted")
    mutate()
  }

  return (
    <div>
      <PageHeader
        title="Machinery"
        description="Log machinery usage, the field it worked, and the cost incurred."
        action={<MachineryForm onSaved={mutate} />}
      />

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <p className="text-sm font-medium text-muted-foreground">Total machinery cost</p>
          <p className="font-heading text-2xl font-semibold">{formatCurrency(total)}</p>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : machinery.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Tractor className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No machinery entries yet</p>
            <p className="text-sm text-muted-foreground">Log machinery usage to track costs.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {machinery.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(m.work_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{m.purpose || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.field_name || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(m.cost)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <MachineryForm machinery={m} onSaved={mutate} />
                        <ConfirmDelete label="this entry" onConfirm={() => remove(m.id)} />
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
