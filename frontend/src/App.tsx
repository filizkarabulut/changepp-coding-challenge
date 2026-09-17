import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/context/AppContext'
import { NavBar } from '@/components/NavBar'
import { HomePage } from '@/pages/HomePage'
import { CollectionsPage } from '@/pages/CollectionsPage'
import { SharedCollectionPage } from '@/pages/SharedCollectionPage'

/**
 * Root component: wires up global state (AppProvider), routing, the persistent
 * nav bar, and toast notifications.
 */
function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-background">
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/share/:code" element={<SharedCollectionPage />} />
              {/* Unknown routes fall back to Discover. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toaster richColors position="bottom-right" />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
