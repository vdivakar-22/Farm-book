"use client"

import Link from "next/link"
import { Beef, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { CattleTypeForm } from "@/components/cattle/cattle-type-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import { useTable, supabase } from "@/lib/use-table"
import { formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import type { CattleType, Cattle } from "@/lib/types"

export function CattleTypesList() {
  const { rows: types, isLoading, mutate } = useTable<CattleType>("cattle_types")
  const { rows: animals } = useTable<Cattle>("cattle")

  const countFor = (typeId: string) => animals.filter((a) => a.type_id === typeId).length
  const valueFor = (typeId: string) =>
    animals.filter((a) => a.type_id === typeId).reduce((s, a) => s + Number(a.cost ?? 0), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("cattle_types").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Type deleted")
    mutate()
  }

  return (
    <div>
      <PageHeader
        title="Cattle"
        description="Group animals by type, then manage each animal individually."
        action={<CattleTypeForm onSaved={mutate} />}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading cattle…</p>
      ) : types.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Beef className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No cattle types yet</p>
            <p className="text-sm text-muted-foreground">Add a type like Cow or Goat to begin.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 py-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                      <Beef className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold leading-tight">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{countFor(t.id)} animals</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CattleTypeForm cattleType={t} onSaved={mutate} />
                    <ConfirmDelete label={t.type} onConfirm={() => remove(t.id)} />
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <Badge variant="secondary">{formatCurrency(valueFor(t.id))} invested</Badge>
                  <Link
                    href={`/cattle/${t.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View animals
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
