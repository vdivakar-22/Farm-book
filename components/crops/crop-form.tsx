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
import type { Crop } from "@/lib/types"

// Month dropdown removed

export function CropForm({
  crop,
  onSaved,
}: {
  crop?: Crop
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const editing = Boolean(crop)

  const [form, setForm] = useState({
    name: crop?.name ?? "",
    revenue: crop?.revenue ? String(crop.revenue) : "",
    cultivated_date: crop?.cultivated_date ?? "",
    harvesting_date: crop?.harvesting_date ?? "",
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Crop name is required")
      return
    }
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      revenue: Number(form.revenue) || 0,
      cultivated_date: form.cultivated_date || null,
      harvesting_date: form.harvesting_date || null,
    }
    const { error } = editing
      ? await supabase.from("crops").update(payload).eq("id", crop!.id)
      : await supabase.from("crops").insert(payload)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(editing ? "Crop updated" : "Crop added")
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
            <span className="sr-only">Edit crop</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add crop
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit crop" : "Add crop"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Crop name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Paddy, Wheat, Tomato"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="revenue">Crop revenue (Earnings)</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              value={form.revenue}
              onChange={(e) => update("revenue", e.target.value)}
              placeholder="e.g. 25000"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cultivated_date">Cultivated date</Label>
              <Input
                id="cultivated_date"
                type="date"
                value={form.cultivated_date}
                onChange={(e) => update("cultivated_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvesting_date">Harvesting date</Label>
              <Input
                id="harvesting_date"
                type="date"
                value={form.harvesting_date}
                onChange={(e) => update("harvesting_date", e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
