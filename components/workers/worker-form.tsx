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
import type { Worker } from "@/lib/types"

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

const today = () => new Date().toISOString().slice(0, 10)

export function WorkerForm({
  worker,
  onSaved,
}: {
  worker?: Worker
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const editing = Boolean(worker)

  const [form, setForm] = useState({
    name: worker?.name ?? "",
    work_date: worker?.work_date ?? today(),
    shift: worker?.shift ?? "full",
    field_name: worker?.field_name ?? "",
    crop: worker?.crop ?? "",
    salary: worker?.salary != null ? String(worker.salary) : "",
    advance: worker?.advance != null ? String(worker.advance) : "",
  })
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    if (!form.name.trim()) {
      toast.error("Worker name is required")
      return
    }
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      work_date: form.work_date || today(),
      shift: form.shift,
      field_name: form.field_name || null,
      crop: form.crop || null,
      salary: form.salary ? Number(form.salary) : 0,
      advance: form.advance ? Number(form.advance) : 0,
    }
    const { error } = editing
      ? await supabase.from("workers").update(payload).eq("id", worker!.id)
      : await supabase.from("workers").insert(payload)
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success(editing ? "Entry updated" : "Worker logged")
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
            Log worker
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit worker entry" : "Log worker"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Worker name</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Ramesh" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_date">Date</Label>
              <Input id="work_date" type="date" value={form.work_date} onChange={(e) => update("work_date", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <select id="shift" value={form.shift} onChange={(e) => update("shift", e.target.value)} className={selectClass}>
                <option value="full">Full day</option>
                <option value="half">Half day</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Wage paid</Label>
              <Input id="salary" type="number" min="0" value={form.salary} onChange={(e) => update("salary", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance">Advance</Label>
              <Input id="advance" type="number" min="0" value={form.advance} onChange={(e) => update("advance", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="field_name">Field</Label>
              <Input id="field_name" value={form.field_name} onChange={(e) => update("field_name", e.target.value)} placeholder="e.g. North field" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crop">Crop</Label>
              <Input id="crop" value={form.crop} onChange={(e) => update("crop", e.target.value)} placeholder="e.g. Paddy" />
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
