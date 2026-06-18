"use client"

import Link from "next/link"
import { ArrowLeft, Beef, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { AnimalForm } from "@/components/cattle/animal-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import { useTable, supabase } from "@/lib/use-table"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { CattleType, Cattle } from "@/lib/types"

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  )
}

export function CattleDetail({ typeId }: { typeId: string }) {
  const { rows: types } = useTable<CattleType>("cattle_types")
  const { rows: allAnimals, mutate } = useTable<Cattle>("cattle")

  const type = types.find((t) => t.id === typeId)
  const animals = allAnimals.filter((a) => a.type_id === typeId)
  const total = animals.reduce((s, a) => s + Number(a.cost ?? 0), 0)

  async function remove(id: string) {
    const { error } = await supabase.from("cattle").delete().eq("id", id)
    if (error) return toast.error(error.message)
    toast.success("Animal removed")
    mutate()
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
        action={<AnimalForm typeId={typeId} onSaved={mutate} />}
      />

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
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <span />
                  <Link
                    href={`/cattle/animal/${a.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Expenses & Milk
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
