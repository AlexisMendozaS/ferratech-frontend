import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ExitIntentPopup } from '@/components/leads/ExitIntentPopup'
import { WhatsAppButton } from '@/components/leads/WhatsAppButton'
import { LeadWidget } from '@/components/leads/LeadWidget'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="bottom-right" richColors />
      {/* Captura de leads — globales en todas las páginas públicas */}
      <ExitIntentPopup />
      <WhatsAppButton />
      <LeadWidget />
    </div>
  )
}
