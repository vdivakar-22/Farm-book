"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTable, supabase } from "@/lib/use-table"
import { toast } from "sonner"
import type { Cattle } from "@/lib/types"

const foodTypes = [
  "Milk",
  "Cotton Seed",
  "Rice Flour",
  "Rice Husk",
  "Other",
]

export function OverallFeedLogForm({ typeId, onSaved }: { typeId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ animal_id: "", food_type: "Cotton Seed", milk_liters: "", amount: "", start_date: "", end_date: "" })

  const { rows: cattle } = useTable<Cattle>("cattle")
  const animals = cattle.filter((c) => c.type_id === typeId)

  async function save() {
    const amount = Number(form.amount)
    const milk = form.food_type === "Milk" ? Number(form.milk_liters) : 0
    
    if (!form.animal_id) {
      toast.error("Please select an animal or 'All Animals'")
      return
    }

    if (!form.food_type || isNaN(amount) || amount < 0 || (form.food_type === "Milk" && (isNaN(milk) || milk < 0))) {
      toast.error(form.food_type === "Milk" ? "Enter a valid food type, amount and milk yield" : "Enter a valid cost amount")
      return
    }

    setLoading(true)

    try {
      if (form.animal_id === "all") {
        if (animals.length === 0) {
          toast.error("No animals found")
          setLoading(false)
          return
        }
        
        // Divide amount equally among all animals
        const dividedAmount = amount / animals.length
        const dividedMilk = milk / animals.length
        
        const inserts = animals.map(animal => ({
          cattle_id: animal.id,
          food_type: form.food_type,
          milk_liters: dividedMilk,
          amount: dividedAmount,
          start_date: form.food_type === "Milk" ? (form.start_date || null) : null,
          end_date: form.food_type === "Milk" ? (form.end_date || null) : null,
        }))
        
        const { error } = await supabase.from("cattle_expenses").insert(inserts)
        if (error) throw error
      } else {
        const { error } = await supabase.from("cattle_expenses").insert({
          cattle_id: form.animal_id,
          food_type: form.food_type,
          milk_liters: milk,
          amount,
          start_date: form.food_type === "Milk" ? (form.start_date || null) : null,
          end_date: form.food_type === "Milk" ? (form.end_date || null) : null,
        })
        if (error) throw error
      }
      
      toast.success("Food log added")
      setForm({ animal_id: "", food_type: "Cotton Seed", milk_liters: "", amount: "", start_date: "", end_date: "" })
      setOpen(false)
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus className="mr-2 h-4 w-4" />
        Add food log
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add overall food log</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="animal_id">Animal</Label>
            <select
              id="animal_id"
              value={form.animal_id}
              onChange={(e) => setForm((f) => ({ ...f, animal_id: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>Select an animal</option>
              <option value="all">All Animals (Divide Cost)</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="food_type">Food Type</Label>
            <select
              id="food_type"
              value={form.food_type}
              onChange={(e) => setForm((f) => ({ ...f, food_type: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {foodTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {form.food_type === "Milk" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="milk_liters">Milk Yield (Liters)</Label>
                  <Input
                    id="milk_liters"
                    type="number"
                    min="0"
                    step="any"
                    value={form.milk_liters}
                    onChange={(e) => setForm((f) => ({ ...f, milk_liters: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Cost Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="amount">Cost of Food</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0"
              />
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
