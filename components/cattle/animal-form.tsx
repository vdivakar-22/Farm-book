"use client"

import { useState } from "react"
import { Plus, Pencil } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/use-table"
import type { Cattle } from "@/lib/types"

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export function AnimalForm({
  typeId,
  animal,
  onSaved,
}: {
  typeId: string
  animal?: Cattle
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const editing = Boolean(animal)

  const [form, setForm] = useState({
    name: animal?.name ?? "",
    cost: animal?.cost != null ? String(animal.cost) : "",
    purpose: animal?.purpose ?? "",
    gender: animal?.gender ?? "",
    lactation: animal?.lactation ?? "",
    lactation_date: animal?.lactation_date ?? "",
    lactation_count: animal?.lactation_count != null ? String(animal.lactation_count) : "",
    calf_gender: animal?.calf_gender ?? "",
  })
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    if (!form.name.trim()) {
      toast.error("Animal name/tag is required")
      return
    }
    setLoading(true)
    const isLactationDateRequired = form.lactation === "Pregnant" || form.lactation === "Lactating"
    const payload = {
      type_id: typeId,
      name: form.name.trim(),
      cost: form.cost ? Number(form.cost) : 0,
      purpose: form.purpose || null,
      gender: form.gender || null,
      lactation: form.lactation || null,
      lactation_date: isLactationDateRequired ? (form.lactation_date || null) : null,
      lactation_count: form.lactation_count ? Number(form.lactation_count) : null,
      calf_gender: form.calf_gender || null,
    }
    const { error } = editing
      ? await supabase.from("cattle").update(payload).eq("id", animal!.id)
      : await supabase.from("cattle").insert(payload)
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success(editing ? "Animal updated" : "Animal added")
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" />
          ) : (
            <Button />
          )
        }
      >
        {editing ? (
          <>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit animal</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add animal
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit animal" : "Add animal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name / Tag</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Lakshmi, #A12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" type="number" min="0" value={form.cost} onChange={(e) => update("cost", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" value={form.gender} onChange={(e) => update("gender", e.target.value)} className={selectClass}>
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <select id="purpose" value={form.purpose} onChange={(e) => update("purpose", e.target.value)} className={selectClass}>
                <option value="">Select</option>
                <option value="Milk">Milk</option>
                <option value="Meat">Meat</option>
                <option value="Breeding">Breeding</option>
                <option value="Draft">Draft / Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lactation">Lactation</Label>
              <select id="lactation" value={form.lactation} onChange={(e) => update("lactation", e.target.value)} className={selectClass}>
                <option value="">N/A</option>
                <option value="Lactating">Lactating</option>
                <option value="Dry">Dry</option>
                <option value="Pregnant">Pregnant</option>
              </select>
            </div>
            {(form.lactation === "Pregnant" || form.lactation === "Lactating") && (
              <div className="space-y-2">
                <Label htmlFor="lactation_date">Lactation Date</Label>
                <Input
                  id="lactation_date"
                  type="date"
                  value={form.lactation_date}
                  onChange={(e) => update("lactation_date", e.target.value)}
                />
              </div>
            )}
          </div>
          {form.gender === "Female" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lactation_count">Lactation Count</Label>
                <Input
                  id="lactation_count"
                  type="number"
                  min="0"
                  value={form.lactation_count}
                  onChange={(e) => update("lactation_count", e.target.value)}
                  placeholder="e.g. 1, 2, 3..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calf_gender">Calf Gender</Label>
                <select id="calf_gender" value={form.calf_gender} onChange={(e) => update("calf_gender", e.target.value)} className={selectClass}>
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
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
