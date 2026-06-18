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
import type { Machinery } from "@/lib/types"

const today = () => new Date().toISOString().slice(0, 10)

export function MachineryForm({
  machinery,
  onSaved,
}: {
  machinery?: Machinery
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const editing = Boolean(machinery)

  const [form, setForm] = useState({
    name: machinery?.name ?? "",
    work_date: machinery?.work_date ?? today(),
    field_name: machinery?.field_name ?? "",
    purpose: machinery?.purpose ?? "",
    cost: machinery?.cost != null ? String(machinery.cost) : "",
  })
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    if (!form.name.trim()) {
      toast.error("Machine name is required")
      return
    }
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      work_date: form.work_date || today(),
      field_name: form.field_name || null,
      purpose: form.purpose || null,
      cost: form.cost ? Number(form.cost) : 0,
    }
    const { error } = editing
      ? await supabase.from("machinery").update(payload).eq("id", machinery!.id)
      : await supabase.from("machinery").insert(payload)
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success(editing ? "Entry updated" : "Machinery logged")
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
            <span className="sr-only">Edit entry</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Log machinery
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit machinery entry" : "Log machinery"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Machine</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Tractor, Harvester" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_date">Date</Label>
              <Input id="work_date" type="date" value={form.work_date} onChange={(e) => update("work_date", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" value={form.purpose} onChange={(e) => update("purpose", e.target.value)} placeholder="e.g. Ploughing, Harvesting" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="field_name">Field</Label>
              <Input id="field_name" value={form.field_name} onChange={(e) => update("field_name", e.target.value)} placeholder="e.g. South field" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" type="number" min="0" value={form.cost} onChange={(e) => update("cost", e.target.value)} placeholder="0" />
            </div>
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
