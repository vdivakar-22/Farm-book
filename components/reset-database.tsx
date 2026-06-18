"use client"

import { useState } from "react"
import { Database, RotateCcw, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ResetDatabase() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if connected to live Supabase
  const isLiveSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const mockKeys = [
    "mock_db_crops",
    "mock_db_crop_expenses",
    "mock_db_cattle_types",
    "mock_db_cattle",
    "mock_db_workers",
    "mock_db_machinery",
    "mock_db_cattle_expenses"
  ]

  const handleClearData = (action: "clear" | "reseed") => {
    setLoading(true)
    try {
      if (action === "clear") {
        // To clear completely and avoid automatic re-seeding, we set them to empty arrays
        mockKeys.forEach((key) => {
          localStorage.setItem(key, JSON.stringify([]))
        })
        toast.success("Local database cleared completely")
      } else {
        // To reseed, we remove the keys so client.ts re-initializes them on next fetch
        mockKeys.forEach((key) => {
          localStorage.removeItem(key)
        })
        toast.success("Database reset to initial seed values")
      }
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (error) {
      toast.error("Failed to reset database")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Database className="h-4 w-4 text-muted-foreground" />
        Reset Database
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reset Database
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm">
            {isLiveSupabase ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Warning: You are currently connected to a live Supabase database. These local reset tools only affect local mock data. Live database tables can be reset in your Supabase SQL editor.
              </span>
            ) : (
              "Choose how you want to reset your local database. This will affect your crops, cattle, workers, and machinery data."
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {!isLiveSupabase && (
            <>
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => handleClearData("clear")}
              >
                Clear All Data
              </Button>
              <Button
                variant="destructive"
                disabled={loading}
                onClick={() => handleClearData("reseed")}
              >
                Reset to Seed Data
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
