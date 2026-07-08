/**
 * ADMIN-01 — Dashboard KPIs
 * Placeholder: la implementación completa llega en ADMIN-01.
 */
import { LayoutDashboard } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <LayoutDashboard className="size-12 text-muted-foreground/30" />
      <p className="text-lg font-semibold text-foreground">Dashboard</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        El panel con KPIs se implementa en ADMIN-01. Por ahora usa el menú lateral para navegar.
      </p>
    </div>
  )
}
