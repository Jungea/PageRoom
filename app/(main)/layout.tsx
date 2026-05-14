import { Navbar } from '@/components/navbar'
import { LoadingOverlayProvider } from '@/components/loading-overlay'
import { NavigationProgress } from '@/components/navigation-progress'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoadingOverlayProvider>
      <NavigationProgress />
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </LoadingOverlayProvider>
  )
}
