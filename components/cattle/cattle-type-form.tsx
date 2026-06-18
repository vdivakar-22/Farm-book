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
import type { CattleType } from "@/lib/types"

export function CattleTypeForm({
  cattleType,
  onSaved,
}: {
  cattleType?: CattleType
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const editing = Boolean(cattleType)
  const [type, setType] = useState(cattleType?.type ?? "")

  async function save() {
    if (!type.trim()) {
      toast.error("Type name is required")
      return
    }
    setLoading(true)
    const payload = { type: type.trim() }
    const { error } = editing
      ? await supabase.from("cattle_types").update(payload).eq("id", cattleType!.id)
      : await supabase.from("cattle_types").insert(payload)
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success(editing ? "Type updated" : "Type added")
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
            <span className="sr-only">Edit type</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add type
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit cattle type" : "Add cattle type"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. Cow, Goat, Buffalo, Hen"
          />
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
